import fs from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";

const baseUrl = process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:3000";
const dbPath = path.join(process.cwd(), "data", "ineedthis-local.sqlite");

class CookieJar {
  constructor() {
    this.cookies = new Map();
  }

  apply(headers) {
    if (this.cookies.size === 0) {
      return headers;
    }

    const nextHeaders = new Headers(headers);
    nextHeaders.set(
      "cookie",
      [...this.cookies.entries()]
        .map(([name, value]) => `${name}=${value}`)
        .join("; ")
    );
    return nextHeaders;
  }

  store(response) {
    const setCookies =
      typeof response.headers.getSetCookie === "function"
        ? response.headers.getSetCookie()
        : [response.headers.get("set-cookie")].filter(Boolean);

    for (const cookie of setCookies) {
      const [pair] = cookie.split(";");
      const separatorIndex = pair.indexOf("=");

      if (separatorIndex <= 0) {
        continue;
      }

      const name = pair.slice(0, separatorIndex).trim();
      const value = pair.slice(separatorIndex + 1).trim();

      if (name) {
        this.cookies.set(name, value);
      }
    }
  }
}

function logStep(message) {
  console.log(`\n[smoke] ${message}`);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function request(pathname, options = {}, jar = null) {
  const inputHeaders = new Headers(options.headers ?? {});
  const headers = jar ? jar.apply(inputHeaders) : inputHeaders;
  const response = await fetch(`${baseUrl}${pathname}`, {
    ...options,
    headers,
  });

  if (jar) {
    jar.store(response);
  }

  return response;
}

async function requestJson(pathname, options = {}, jar = null) {
  const response = await request(pathname, options, jar);
  const text = await response.text();
  let json = null;

  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  return { response, json, text };
}

function randomIp() {
  return `203.0.113.${Math.floor(Math.random() * 200) + 1}`;
}

function uniqueId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function findSubmissionId(slug, who, need) {
  if (!fs.existsSync(dbPath)) {
    return null;
  }

  const db = new Database(dbPath, { readonly: true });

  try {
    const row = db
      .prepare(
        `
          select s.id
          from wish_submissions s
          join wish_clusters c on c.id = s.cluster_id
          where c.slug = ?
            and s.who = ?
            and s.need = ?
          order by s.created_at desc
          limit 1
        `
      )
      .get(slug, who, need);

    return row?.id ?? null;
  } finally {
    db.close();
  }
}

async function main() {
  logStep(`base url = ${baseUrl}`);

  const home = await request("/");
  const homeHtml = await home.text();
  assert(home.status === 200, "Home page did not return 200.");
  assert(homeHtml.includes("INeedThis"), "Home page did not contain app title.");

  const wishes = await request("/wishes");
  assert(wishes.status === 200, "Ranking page did not return 200.");

  const manifesto = await request("/manifesto");
  assert(manifesto.status === 200, "Manifesto page did not return 200.");

  const health = await requestJson("/api/health");
  assert(health.response.status === 200, "Health endpoint did not return 200.");
  assert(health.json?.ok === true, "Health endpoint did not report ok=true.");

  const robots = await request("/robots.txt");
  const robotsText = await robots.text();
  assert(robots.status === 200, "robots.txt did not return 200.");
  assert(robotsText.includes("Sitemap:"), "robots.txt did not include sitemap.");

  const sitemap = await request("/sitemap.xml");
  const sitemapText = await sitemap.text();
  assert(sitemap.status === 200, "sitemap.xml did not return 200.");
  assert(sitemapText.includes("/manifesto"), "sitemap.xml did not include manifesto.");

  const languageJar = new CookieJar();
  const language = await requestJson(
    "/api/preferences/language",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        locale: "en",
      }),
    },
    languageJar
  );
  assert(language.response.status === 200, "Language preference route failed.");
  const englishHome = await request("/", {}, languageJar);
  const englishHtml = await englishHome.text();
  assert(
    englishHtml.includes("What should exist in this world?"),
    "English locale cookie did not affect the home page."
  );

  const who = `smoke test witness ${uniqueId("who")}`;
  const need = `I need a public smoke-test corridor ${uniqueId("need")} so anonymous demand can be seen before it is priced out.`;
  const submitIp = randomIp();

  logStep("testing anonymous submission and submit cooldown");
  const firstSubmit = await requestJson("/api/wishes", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": submitIp,
    },
    body: JSON.stringify({ who, need }),
  });
  assert(firstSubmit.response.status === 200, "First anonymous submission failed.");
  assert(firstSubmit.json?.wish?.slug, "Submission response did not include a slug.");

  const slug = firstSubmit.json.wish.slug;
  const secondSubmit = await requestJson("/api/wishes", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": submitIp,
    },
    body: JSON.stringify({ who, need }),
  });
  assert(secondSubmit.response.status === 429, "Submit cooldown did not trigger.");
  assert(
    secondSubmit.json?.code === "action_cooldown",
    "Submit cooldown did not return action_cooldown."
  );

  const detail = await request(`/wishes/${slug}`);
  const detailHtml = await detail.text();
  assert(detail.status === 200, "Detail page did not return 200 after submission.");
  assert(detailHtml.includes(slug), "Detail page did not render the new cluster.");

  logStep("testing global cooldown across different actions");
  const globalIp = randomIp();
  const globalWho = `global cooldown ${uniqueId("who")}`;
  const globalNeed = `I need a shared interval test ${uniqueId("need")} to validate cross-action throttling.`;
  const globalSubmit = await requestJson("/api/wishes", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": globalIp,
    },
    body: JSON.stringify({ who: globalWho, need: globalNeed }),
  });
  assert(globalSubmit.response.status === 200, "Global cooldown setup submission failed.");
  const globalVote = await requestJson(`/api/wishes/${globalSubmit.json.wish.slug}/vote`, {
    method: "POST",
    headers: {
      "x-forwarded-for": globalIp,
    },
  });
  assert(globalVote.response.status === 429, "Global cooldown did not block immediate follow-up action.");

  logStep("testing vote cooldown and duplicate vote handling");
  const voteIp = randomIp();
  const voteJar = new CookieJar();
  const firstVote = await requestJson(
    `/api/wishes/${slug}/vote`,
    {
      method: "POST",
      headers: {
        "x-forwarded-for": voteIp,
      },
    },
    voteJar
  );
  assert(firstVote.response.status === 200, "First vote failed.");
  assert(firstVote.json?.alreadyVoted === false, "First vote was treated as duplicate.");

  const secondVote = await requestJson(
    `/api/wishes/${slug}/vote`,
    {
      method: "POST",
      headers: {
        "x-forwarded-for": voteIp,
      },
    },
    voteJar
  );
  assert(secondVote.response.status === 429, "Vote cooldown did not trigger.");
  await sleep(6500);

  const thirdVote = await requestJson(
    `/api/wishes/${slug}/vote`,
    {
      method: "POST",
      headers: {
        "x-forwarded-for": voteIp,
      },
    },
    voteJar
  );
  assert(thirdVote.response.status === 200, "Duplicate vote check failed after cooldown.");
  assert(thirdVote.json?.alreadyVoted === true, "Duplicate vote was not detected.");

  logStep("testing mark/report cooldown and duplicate handling");
  const submissionId = findSubmissionId(slug, who, need);
  assert(submissionId, "Could not find the saved submission in local SQLite.");

  const markIp = randomIp();
  const firstMark = await requestJson(`/api/submissions/${submissionId}/mark`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": markIp,
    },
    body: JSON.stringify({ wishSlug: slug }),
  });
  assert(firstMark.response.status === 200, "First mark request failed.");
  assert(firstMark.json?.alreadyMarked === false, "First mark was treated as duplicate.");

  const secondMark = await requestJson(`/api/submissions/${submissionId}/mark`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": markIp,
    },
    body: JSON.stringify({ wishSlug: slug }),
  });
  assert(secondMark.response.status === 429, "Mark cooldown did not trigger.");
  await sleep(15500);

  const thirdMark = await requestJson(`/api/submissions/${submissionId}/mark`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": markIp,
    },
    body: JSON.stringify({ wishSlug: slug }),
  });
  assert(thirdMark.response.status === 200, "Duplicate mark check failed after cooldown.");
  assert(thirdMark.json?.alreadyMarked === true, "Duplicate mark was not detected.");

  console.log("\n[smoke] all checks passed");
}

main().catch((error) => {
  console.error(`\n[smoke] failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
