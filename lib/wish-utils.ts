import type { WishCluster } from "@/lib/wish-types";

const ZH_PREFIXES = [/^我想要[:：]?\s*/u, /^我需要[:：]?\s*/u, /^想要[:：]?\s*/u];
const EN_PREFIXES = [/^i want\s*/iu, /^i need\s*/iu, /^looking for\s*/iu];

export function normalizeDemandText(text: string) {
  let normalized = text.trim();

  for (const pattern of [...ZH_PREFIXES, ...EN_PREFIXES]) {
    normalized = normalized.replace(pattern, "");
  }

  return normalized.replace(/\s+/gu, " ").trim();
}

export function buildWishTitle(need: string) {
  const normalized = normalizeDemandText(need);
  const firstSegment = normalized.split(/[。！？.!?；;，,\n]/u)[0]?.trim() || normalized;

  if (firstSegment.length <= 24) {
    return firstSegment;
  }

  return `${firstSegment.slice(0, 24).trim()}…`;
}

export function buildWishSummary(who: string, need: string) {
  const normalizedNeed = normalizeDemandText(need);
  const normalizedWho = who.trim().replace(/\s+/gu, " ");

  return `来自“${normalizedWho}”等人的重复诉求: ${normalizedNeed}`;
}

export function clampText(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trim()}…`;
}

export function computeWeeklyGrowth(createdAtValues: string[]) {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  return createdAtValues.filter((value) => new Date(value).getTime() >= weekAgo).length;
}

export function computeSignalScore({
  count,
  votes,
  weeklyGrowth,
}: Pick<WishCluster, "count" | "votes" | "weeklyGrowth">) {
  const rawScore = 42 + count * 0.55 + votes * 0.12 + weeklyGrowth * 1.8;
  const bounded = Math.max(1, Math.min(99, Math.round(rawScore)));

  return `${bounded} / 100`;
}

function shortHash(input: string) {
  let hash = 5381;

  for (const character of input) {
    hash = (hash * 33) ^ character.charCodeAt(0);
  }

  return Math.abs(hash >>> 0).toString(36);
}

export function createWishSlug(source: string) {
  const normalized = normalizeDemandText(source)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/gu, "")
    .replace(/[^a-z0-9\s-]/gu, " ")
    .replace(/\s+/gu, "-")
    .replace(/-+/gu, "-")
    .replace(/^-|-$/gu, "")
    .slice(0, 36);

  const base = normalized || "wish";

  return `${base}-${shortHash(source)}`;
}

export function buildMergeReasons(title: string, identities: string[]) {
  const firstLine = `这些提交都在反复指向“${title}”这条共同缺口，系统以语义相似度将它们归入同一需求簇。`;

  if (identities.length === 0) {
    return [
      firstLine,
      "不同说法在底层表达了同一类未被满足的需求，所以会被聚合到一起。",
    ];
  }

  const preview = identities.slice(0, 2).join("、");

  return [
    firstLine,
    `虽然提交者来自 ${preview} 等不同处境，但他们指向的是同一类未被满足的东西。`,
  ];
}

export function dedupeStrings(values: string[], limit: number) {
  return [...new Set(values.filter(Boolean))].slice(0, limit);
}

