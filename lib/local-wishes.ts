import "server-only";

import fs from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";

import { wishClusters } from "@/lib/mock-data";
import type {
  WishCluster,
  WishDetailPayload,
  WishListPayload,
  WishSubmissionResult,
  WishSubmissionSample,
} from "@/lib/wish-types";
import {
  buildMergeReasons,
  buildWishSummary,
  buildWishTitle,
  clampText,
  computeSignalScore,
  computeWeeklyGrowth,
  createWishSlug,
  dedupeStrings,
  normalizeDemandText,
} from "@/lib/wish-utils";

const LOCAL_MATCH_THRESHOLD = 0.48;
const LOCAL_RELATED_THRESHOLD = 0.14;
const LOCAL_DB_DIR = path.join(process.cwd(), "data");
const LOCAL_DB_PATH = path.join(LOCAL_DB_DIR, "ineedthis-local.sqlite");

type LocalWishClusterRow = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  normalized: string;
  representative_identity: string;
  representative_need: string;
  count: number;
  votes: number;
  created_at: string;
  updated_at: string;
  latest_submission_at: string;
};

type LocalWishSubmissionRow = {
  id: string;
  cluster_id: string;
  who: string;
  need: string;
  created_at: string;
};

type LocalActionKind = "submit" | "vote" | "mark";
const GLOBAL_ACTION_INTERVAL_MS = 4_000;

let dbInstance: Database.Database | null = null;

function ensureDataDirectory() {
  if (!fs.existsSync(LOCAL_DB_DIR)) {
    fs.mkdirSync(LOCAL_DB_DIR, { recursive: true });
  }
}

function getLocalDb() {
  if (dbInstance) {
    return dbInstance;
  }

  ensureDataDirectory();

  const db = new Database(LOCAL_DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    create table if not exists wish_clusters (
      id text primary key,
      slug text not null unique,
      title text not null,
      summary text not null,
      normalized text not null,
      representative_identity text not null,
      representative_need text not null,
      count integer not null default 1,
      votes integer not null default 1,
      created_at text not null,
      updated_at text not null,
      latest_submission_at text not null
    );

    create table if not exists wish_submissions (
      id text primary key,
      cluster_id text not null references wish_clusters(id) on delete cascade,
      who text not null,
      need text not null,
      created_at text not null
    );

    create table if not exists wish_votes (
      id text primary key,
      cluster_id text not null references wish_clusters(id) on delete cascade,
      fingerprint text not null,
      created_at text not null,
      unique(cluster_id, fingerprint)
    );

    create table if not exists wish_submission_marks (
      id text primary key,
      submission_id text not null,
      wish_slug text not null,
      ip_key text not null,
      created_at text not null,
      unique(submission_id, ip_key)
    );

    create table if not exists wish_action_events (
      id text primary key,
      action text not null,
      ip_key text not null,
      created_at text not null
    );

    create index if not exists wish_clusters_count_idx
      on wish_clusters (count desc, votes desc, latest_submission_at desc);

    create index if not exists wish_submissions_cluster_created_idx
      on wish_submissions (cluster_id, created_at desc);

    create index if not exists wish_votes_cluster_idx
      on wish_votes (cluster_id, created_at desc);

    create index if not exists wish_marks_submission_idx
      on wish_submission_marks (submission_id, created_at desc);

    create index if not exists wish_action_events_ip_action_idx
      on wish_action_events (ip_key, action, created_at desc);
  `);

  seedLocalDb(db);
  dbInstance = db;

  return db;
}

function toIsoDate(value: string, hour = 12) {
  if (value.includes("T")) {
    return value;
  }

  return `${value}T${String(hour).padStart(2, "0")}:00:00.000Z`;
}

function createSeedTimestamp(args: {
  createdAt: string;
  latestAt: string;
  index: number;
  total: number;
  weeklyGrowth: number;
}) {
  const createdMs = new Date(toIsoDate(args.createdAt, 10)).getTime();
  const latestMs = new Date(toIsoDate(args.latestAt, 18)).getTime();
  const day = 24 * 60 * 60 * 1000;
  const recentCount = Math.max(0, Math.min(args.weeklyGrowth, args.total));

  if (args.index < recentCount) {
    const recentStart = Math.max(createdMs, latestMs - 6 * day);
    const position =
      recentCount <= 1 ? 1 : args.index / Math.max(1, recentCount - 1);

    return new Date(
      Math.round(recentStart + position * (latestMs - recentStart))
    ).toISOString();
  }

  const olderCount = Math.max(1, args.total - recentCount);
  const olderLatest = Math.max(createdMs, latestMs - 8 * day);
  const olderIndex = args.index - recentCount;
  const position =
    olderCount <= 1 ? 0 : olderIndex / Math.max(1, olderCount - 1);

  return new Date(
    Math.round(createdMs + position * (olderLatest - createdMs))
  ).toISOString();
}

function seedLocalDb(db: Database.Database) {
  const existingCount = db
    .prepare("select count(*) as count from wish_clusters")
    .get() as { count: number };

  if (existingCount.count > 0) {
    return;
  }

  const insertCluster = db.prepare(`
    insert into wish_clusters (
      id,
      slug,
      title,
      summary,
      normalized,
      representative_identity,
      representative_need,
      count,
      votes,
      created_at,
      updated_at,
      latest_submission_at
    ) values (
      @id,
      @slug,
      @title,
      @summary,
      @normalized,
      @representative_identity,
      @representative_need,
      @count,
      @votes,
      @created_at,
      @updated_at,
      @latest_submission_at
    )
  `);

  const insertSubmission = db.prepare(`
    insert into wish_submissions (
      id,
      cluster_id,
      who,
      need,
      created_at
    ) values (
      @id,
      @cluster_id,
      @who,
      @need,
      @created_at
    )
  `);

  const transaction = db.transaction(() => {
    for (const wish of wishClusters) {
      const clusterId = wish.id ?? crypto.randomUUID();
      const createdAt = toIsoDate(wish.createdAt, 10);
      const latestAt = toIsoDate(wish.latestAt, 18);

      insertCluster.run({
        id: clusterId,
        slug: wish.slug,
        title: wish.title,
        summary: wish.summary,
        normalized: normalizeDemandText(wish.content),
        representative_identity:
          wish.sampleIdentities[0] ?? "anonymous human signal",
        representative_need: wish.content,
        count: wish.count,
        votes: wish.votes,
        created_at: createdAt,
        updated_at: latestAt,
        latest_submission_at: latestAt,
      });

      for (let index = 0; index < wish.count; index += 1) {
        insertSubmission.run({
          id: crypto.randomUUID(),
          cluster_id: clusterId,
          who:
            wish.sampleIdentities[index % Math.max(1, wish.sampleIdentities.length)] ??
            "anonymous human signal",
          need:
            wish.samplePhrases[index % Math.max(1, wish.samplePhrases.length)] ??
            wish.content,
          created_at: createSeedTimestamp({
            createdAt: wish.createdAt,
            latestAt: wish.latestAt,
            index,
            total: wish.count,
            weeklyGrowth: wish.weeklyGrowth,
          }),
        });
      }
    }
  });

  transaction();
}

function toWishSubmission(row: LocalWishSubmissionRow): WishSubmissionSample {
  return {
    id: row.id,
    who: row.who,
    need: row.need,
    createdAt: row.created_at,
  };
}

function groupSubmissionsByCluster(rows: LocalWishSubmissionRow[]) {
  const grouped = new Map<string, LocalWishSubmissionRow[]>();

  for (const row of rows) {
    const current = grouped.get(row.cluster_id) ?? [];
    current.push(row);
    grouped.set(row.cluster_id, current);
  }

  return grouped;
}

function mapClusterRowToWish(
  row: LocalWishClusterRow,
  submissions: LocalWishSubmissionRow[],
  relatedSlugs: string[] = []
): WishCluster {
  const samplePhrases = dedupeStrings(
    submissions.map((submission) => submission.need),
    3
  );
  const sampleIdentities = dedupeStrings(
    submissions.map((submission) => submission.who),
    3
  );
  const weeklyGrowth = computeWeeklyGrowth(
    submissions.map((submission) => submission.created_at)
  );

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    content: row.representative_need,
    normalized: row.normalized,
    count: row.count,
    votes: row.votes,
    createdAt: row.created_at,
    latestAt: row.latest_submission_at,
    weeklyGrowth,
    signalScore: computeSignalScore({
      count: row.count,
      votes: row.votes,
      weeklyGrowth,
    }),
    samplePhrases:
      samplePhrases.length > 0 ? samplePhrases : [row.representative_need],
    sampleIdentities:
      sampleIdentities.length > 0
        ? sampleIdentities
        : [row.representative_identity],
    mergeReasons: buildMergeReasons(row.title, sampleIdentities),
    relatedSlugs,
  };
}

function toUnits(text: string) {
  const normalized = normalizeDemandText(text).toLowerCase();
  const wordUnits = normalized.split(/[^a-z0-9]+/u).filter(Boolean);
  const compact = normalized.replace(/[^0-9a-z\p{Script=Han}]+/gu, "");
  const charUnits: string[] = [];

  if (compact.length <= 1) {
    if (compact) {
      charUnits.push(compact);
    }
  } else {
    for (let index = 0; index < compact.length - 1; index += 1) {
      charUnits.push(compact.slice(index, index + 2));
    }
  }

  const units = new Set([...wordUnits, ...charUnits]);

  if (units.size === 0 && normalized) {
    units.add(normalized);
  }

  return units;
}

function jaccardSimilarity(left: Set<string>, right: Set<string>) {
  if (left.size === 0 || right.size === 0) {
    return 0;
  }

  let intersection = 0;

  for (const value of left) {
    if (right.has(value)) {
      intersection += 1;
    }
  }

  const union = left.size + right.size - intersection;

  return union === 0 ? 0 : intersection / union;
}

function computeLocalSimilarity(left: string, right: string) {
  const normalizedLeft = normalizeDemandText(left).toLowerCase();
  const normalizedRight = normalizeDemandText(right).toLowerCase();

  if (!normalizedLeft || !normalizedRight) {
    return 0;
  }

  if (normalizedLeft === normalizedRight) {
    return 1;
  }

  const shorter =
    normalizedLeft.length <= normalizedRight.length
      ? normalizedLeft
      : normalizedRight;
  const longer = shorter === normalizedLeft ? normalizedRight : normalizedLeft;
  const containment =
    shorter.length >= 6 && longer.includes(shorter)
      ? 0.64 + 0.36 * (shorter.length / longer.length)
      : 0;

  const unitScore = jaccardSimilarity(
    toUnits(normalizedLeft),
    toUnits(normalizedRight)
  );

  return Math.max(containment, unitScore);
}

function loadAllClusters(db: Database.Database) {
  return db
    .prepare(
      `
        select
          id,
          slug,
          title,
          summary,
          normalized,
          representative_identity,
          representative_need,
          count,
          votes,
          created_at,
          updated_at,
          latest_submission_at
        from wish_clusters
      `
    )
    .all() as LocalWishClusterRow[];
}

function loadSubmissionsForClusterIds(
  db: Database.Database,
  clusterIds: string[]
) {
  if (clusterIds.length === 0) {
    return [] as LocalWishSubmissionRow[];
  }

  const placeholders = clusterIds.map(() => "?").join(", ");

  return db
    .prepare(
      `
        select id, cluster_id, who, need, created_at
        from wish_submissions
        where cluster_id in (${placeholders})
        order by created_at desc
      `
    )
    .all(...clusterIds) as LocalWishSubmissionRow[];
}

function loadClusterBySlug(db: Database.Database, slug: string) {
  return db
    .prepare(
      `
        select
          id,
          slug,
          title,
          summary,
          normalized,
          representative_identity,
          representative_need,
          count,
          votes,
          created_at,
          updated_at,
          latest_submission_at
        from wish_clusters
        where slug = ?
        limit 1
      `
    )
    .get(slug) as LocalWishClusterRow | undefined;
}

function loadSubmissionById(db: Database.Database, submissionId: string) {
  return db
    .prepare(
      `
        select id, cluster_id, who, need, created_at
        from wish_submissions
        where id = ?
        limit 1
      `
    )
    .get(submissionId) as LocalWishSubmissionRow | undefined;
}

function loadLatestActionEvent(
  db: Database.Database,
  action: LocalActionKind,
  ipKey: string
) {
  return db
    .prepare(
      `
        select created_at
        from wish_action_events
        where action = ?
          and ip_key = ?
        order by created_at desc
        limit 1
      `
    )
    .get(action, ipKey) as { created_at: string } | undefined;
}

function loadLatestActionForIp(db: Database.Database, ipKey: string) {
  return db
    .prepare(
      `
        select created_at
        from wish_action_events
        where ip_key = ?
        order by created_at desc
        limit 1
      `
    )
    .get(ipKey) as { created_at: string } | undefined;
}

function recordActionEvent(
  db: Database.Database,
  action: LocalActionKind,
  ipKey: string
) {
  db.prepare(
    `
      insert into wish_action_events (
        id,
        action,
        ip_key,
        created_at
      ) values (?, ?, ?, ?)
    `
  ).run(crypto.randomUUID(), action, ipKey, new Date().toISOString());
}

function sanitizeIpKey(ipKey: string) {
  const normalized = ipKey.trim().slice(0, 120);

  return normalized.length > 0 ? normalized : "anonymous";
}

function ensureUniqueSlug(db: Database.Database, source: string) {
  const baseSlug = createWishSlug(source);
  let candidate = baseSlug;
  let suffix = 2;

  while (
    db
      .prepare("select 1 from wish_clusters where slug = ? limit 1")
      .get(candidate)
  ) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

function loadClusterContext(db: Database.Database, cluster: LocalWishClusterRow) {
  const submissions = db
    .prepare(
      `
        select id, cluster_id, who, need, created_at
        from wish_submissions
        where cluster_id = ?
        order by created_at desc
      `
    )
    .all(cluster.id) as LocalWishSubmissionRow[];

  return submissions;
}

function buildRelatedWishes(
  db: Database.Database,
  source: LocalWishClusterRow
): WishCluster[] {
  const clusters = loadAllClusters(db).filter((item) => item.id !== source.id);

  const scored = clusters
    .map((cluster) => ({
      cluster,
      score: Math.max(
        computeLocalSimilarity(source.normalized, cluster.normalized),
        computeLocalSimilarity(source.title, cluster.title),
        computeLocalSimilarity(
          source.representative_need,
          cluster.representative_need
        )
      ),
    }))
    .filter((item) => item.score >= LOCAL_RELATED_THRESHOLD)
    .sort((left, right) => right.score - left.score)
    .slice(0, 3);

  const clusterIds = scored.map((item) => item.cluster.id);
  const submissions = loadSubmissionsForClusterIds(db, clusterIds);
  const grouped = groupSubmissionsByCluster(submissions);

  return scored.map((item) =>
    mapClusterRowToWish(item.cluster, grouped.get(item.cluster.id) ?? [])
  );
}

export function isLocalWishBackendAvailable() {
  try {
    getLocalDb();
    return true;
  } catch {
    return false;
  }
}

export async function listLocalWishClusters(): Promise<WishListPayload> {
  const db = getLocalDb();
  const clusters = loadAllClusters(db).sort((left, right) => {
    if (right.count !== left.count) {
      return right.count - left.count;
    }

    if (right.votes !== left.votes) {
      return right.votes - left.votes;
    }

    return (
      new Date(right.latest_submission_at).getTime() -
      new Date(left.latest_submission_at).getTime()
    );
  });

  const submissions = loadSubmissionsForClusterIds(
    db,
    clusters.map((cluster) => cluster.id)
  );
  const grouped = groupSubmissionsByCluster(submissions);

  return {
    wishes: clusters.map((cluster) =>
      mapClusterRowToWish(cluster, grouped.get(cluster.id) ?? [])
    ),
    backendConfigured: true,
    usingDemoData: false,
  };
}

export async function enforceLocalActionCooldown(input: {
  action: LocalActionKind;
  ipKey: string;
  intervalMs: number;
}) {
  const db = getLocalDb();
  const sanitizedIp = sanitizeIpKey(input.ipKey);
  const latestAnyAction = loadLatestActionForIp(db, sanitizedIp);

  if (latestAnyAction) {
    const elapsedMs =
      Date.now() - new Date(latestAnyAction.created_at).getTime();

    if (elapsedMs < GLOBAL_ACTION_INTERVAL_MS) {
      return {
        allowed: false,
        retryAfterSeconds: Math.max(
          1,
          Math.ceil((GLOBAL_ACTION_INTERVAL_MS - elapsedMs) / 1000)
        ),
      };
    }
  }

  const latest = loadLatestActionEvent(db, input.action, sanitizedIp);

  if (latest) {
    const elapsedMs =
      Date.now() - new Date(latest.created_at).getTime();

    if (elapsedMs < input.intervalMs) {
      return {
        allowed: false,
        retryAfterSeconds: Math.max(
          1,
          Math.ceil((input.intervalMs - elapsedMs) / 1000)
        ),
      };
    }
  }

  recordActionEvent(db, input.action, sanitizedIp);

  return {
    allowed: true,
    retryAfterSeconds: 0,
  };
}

export async function getLocalWishDetailBySlug(
  slug: string
): Promise<WishDetailPayload | null> {
  const db = getLocalDb();
  const cluster = loadClusterBySlug(db, slug);

  if (!cluster) {
    return null;
  }

  const allSubmissions = loadClusterContext(db, cluster);
  const related = buildRelatedWishes(db, cluster);

  return {
    wish: mapClusterRowToWish(cluster, allSubmissions),
    related,
    submissions: allSubmissions.slice(0, 8).map(toWishSubmission),
    backendConfigured: true,
    usingDemoData: false,
  };
}

export async function createLocalWishSubmission(input: {
  who: string;
  need: string;
}): Promise<WishSubmissionResult> {
  const db = getLocalDb();
  const now = new Date().toISOString();
  const normalizedNeed = normalizeDemandText(input.need);
  const clusters = loadAllClusters(db);
  const bestMatch = clusters
    .map((cluster) => ({
      cluster,
      score: Math.max(
        computeLocalSimilarity(normalizedNeed, cluster.normalized),
        computeLocalSimilarity(normalizedNeed, cluster.title),
        computeLocalSimilarity(buildWishTitle(input.need), cluster.title)
      ),
    }))
    .sort((left, right) => right.score - left.score)[0];

  let cluster = bestMatch?.score >= LOCAL_MATCH_THRESHOLD ? bestMatch.cluster : null;
  let createdNewCluster = !cluster;

  if (!cluster) {
    const slug = ensureUniqueSlug(db, buildWishTitle(input.need));
    const title = clampText(buildWishTitle(input.need), 48);
    const id = crypto.randomUUID();

    try {
      db.prepare(
        `
          insert into wish_clusters (
            id,
            slug,
            title,
            summary,
            normalized,
            representative_identity,
            representative_need,
            count,
            votes,
            created_at,
            updated_at,
            latest_submission_at
          ) values (?, ?, ?, ?, ?, ?, ?, 1, 1, ?, ?, ?)
        `
      ).run(
        id,
        slug,
        title,
        clampText(buildWishSummary(input.who, input.need), 180),
        normalizedNeed,
        input.who.trim(),
        input.need.trim(),
        now,
        now,
        now
      );
    } catch {
      // Another request may have created the same cluster slug first.
      createdNewCluster = false;
      const existingCluster = loadClusterBySlug(db, slug);

      if (existingCluster) {
        db.prepare(
          `
            update wish_clusters
            set count = count + 1,
                votes = votes + 1,
                updated_at = ?,
                latest_submission_at = ?
            where id = ?
          `
        ).run(now, now, existingCluster.id);
      }
    }

    cluster = loadClusterBySlug(db, slug) ?? null;
  } else {
    db.prepare(
      `
        update wish_clusters
        set count = count + 1,
            votes = votes + 1,
            updated_at = ?,
            latest_submission_at = ?
        where id = ?
      `
    ).run(now, now, cluster.id);

    cluster = loadClusterBySlug(db, cluster.slug) ?? null;
  }

  if (!cluster) {
    throw new Error("Failed to load the saved wish cluster.");
  }

  db.prepare(
    `
      insert into wish_submissions (
        id,
        cluster_id,
        who,
        need,
        created_at
      ) values (?, ?, ?, ?, ?)
    `
  ).run(
    crypto.randomUUID(),
    cluster.id,
    input.who.trim(),
    input.need.trim(),
    now
  );

  const submissions = loadClusterContext(db, cluster);

  return {
    wish: mapClusterRowToWish(cluster, submissions),
    createdNewCluster,
  };
}

export async function registerLocalWishVote(input: {
  slug: string;
  fingerprint: string;
}) {
  const db = getLocalDb();
  const cluster = loadClusterBySlug(db, input.slug);

  if (!cluster) {
    throw new Error("Wish cluster not found.");
  }

  const existingVote = db
    .prepare(
      `
        select id
        from wish_votes
        where cluster_id = ?
          and fingerprint = ?
        limit 1
      `
    )
    .get(cluster.id, input.fingerprint) as { id: string } | undefined;

  if (existingVote) {
    return {
      votes: cluster.votes,
      alreadyVoted: true,
    };
  }

  db.prepare(
    `
      insert into wish_votes (
        id,
        cluster_id,
        fingerprint,
        created_at
      ) values (?, ?, ?, ?)
    `
  ).run(crypto.randomUUID(), cluster.id, input.fingerprint, new Date().toISOString());

  db.prepare(
    `
      update wish_clusters
      set votes = votes + 1,
          updated_at = ?
      where id = ?
    `
  ).run(new Date().toISOString(), cluster.id);

  const updatedCluster = loadClusterBySlug(db, input.slug);

  return {
    votes: updatedCluster?.votes ?? cluster.votes + 1,
    alreadyVoted: false,
  };
}

export async function registerLocalSubmissionMark(input: {
  submissionId: string;
  wishSlug: string;
  ipKey: string;
}) {
  const db = getLocalDb();
  const submission = loadSubmissionById(db, input.submissionId);

  if (!submission) {
    throw new Error("Wish submission not found.");
  }

  const sanitizedIp = sanitizeIpKey(input.ipKey);
  const existingMark = db
    .prepare(
      `
        select id
        from wish_submission_marks
        where submission_id = ?
          and ip_key = ?
        limit 1
      `
    )
    .get(input.submissionId, sanitizedIp) as { id: string } | undefined;

  if (existingMark) {
    return {
      marked: true,
      alreadyMarked: true,
    };
  }

  db.prepare(
    `
      insert into wish_submission_marks (
        id,
        submission_id,
        wish_slug,
        ip_key,
        created_at
      ) values (?, ?, ?, ?, ?)
    `
  ).run(
    crypto.randomUUID(),
    input.submissionId,
    input.wishSlug,
    sanitizedIp,
    new Date().toISOString()
  );

  return {
    marked: true,
    alreadyMarked: false,
  };
}
