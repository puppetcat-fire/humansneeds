import "server-only";

import type { PostgrestError } from "@supabase/supabase-js";

import { hasSupabaseReadConfig, hasWishWriteConfig } from "@/lib/env";
import {
  createLocalWishSubmission,
  getLocalWishDetailBySlug,
  isLocalWishBackendAvailable,
  listLocalWishClusters,
  registerLocalWishVote,
} from "@/lib/local-wishes";
import { createOpenAiClient } from "@/lib/server-openai";
import { createServerSupabaseClient } from "@/lib/server-supabase";
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
import type {
  ViewerWishSignal,
  ViewerWishSignalsPayload,
  WishCluster,
  WishDetailPayload,
  WishListPayload,
  WishSubmissionResult,
  WishSubmissionSample,
} from "@/lib/wish-types";

const EMBEDDING_MODEL = "text-embedding-3-small";
const SIMILARITY_THRESHOLD = 0.85;

type WishClusterRow = {
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

type WishSubmissionRow = {
  id: string;
  cluster_id: string;
  who: string;
  need: string;
  created_at: string;
};

type RelatedWishRow = WishClusterRow & {
  similarity: number;
};

function createDemoViewerSignalsPayload(): ViewerWishSignalsPayload {
  return {
    signals: [],
    totalSubmissions: 0,
    uniqueClusters: 0,
    risingClusters: 0,
    latestSubmissionAt: null,
    backendConfigured: false,
    usingDemoData: true,
  };
}

function asSqlVector(values: number[]) {
  return `[${values.join(",")}]`;
}

function toWishSubmission(row: WishSubmissionRow): WishSubmissionSample {
  return {
    id: row.id,
    who: row.who,
    need: row.need,
    createdAt: row.created_at,
  };
}

function mapClusterRowToWish(
  row: WishClusterRow,
  submissions: WishSubmissionRow[],
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

function groupSubmissionsByCluster(rows: WishSubmissionRow[]) {
  const grouped = new Map<string, WishSubmissionRow[]>();

  for (const row of rows) {
    const current = grouped.get(row.cluster_id) ?? [];
    current.push(row);
    grouped.set(row.cluster_id, current);
  }

  return grouped;
}

function mapViewerSignals(args: {
  submissions: WishSubmissionRow[];
  clusters: WishClusterRow[];
  clusterSubmissions: WishSubmissionRow[];
}): ViewerWishSignal[] {
  const grouped = groupSubmissionsByCluster(args.clusterSubmissions);
  const wishByClusterId = new Map(
    args.clusters.map((cluster) => [
      cluster.id,
      mapClusterRowToWish(cluster, grouped.get(cluster.id) ?? []),
    ])
  );

  return args.submissions
    .map((submission) => {
      const wish = wishByClusterId.get(submission.cluster_id);

      if (!wish) {
        return null;
      }

      return {
        submission: toWishSubmission(submission),
        wish,
      };
    })
    .filter((item): item is ViewerWishSignal => item !== null);
}

function assertNoSupabaseError(error: PostgrestError | null, context: string) {
  if (!error) {
    return;
  }

  throw new Error(`${context}: ${error.message}`);
}

function assertPresent<T>(value: T | null, context: string): T {
  if (value === null) {
    throw new Error(context);
  }

  return value;
}

async function generateEmbedding(need: string) {
  const openai = createOpenAiClient();
  const normalized = normalizeDemandText(need);
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: normalized,
  });

  const vector = response.data[0]?.embedding;

  if (!vector) {
    throw new Error("OpenAI embedding response did not contain a vector.");
  }

  return {
    normalized,
    vector,
  };
}

export function isWishBackendConfigured() {
  return hasSupabaseReadConfig() || isLocalWishBackendAvailable();
}

export function isWishWriteConfigured() {
  return hasWishWriteConfig() || isLocalWishBackendAvailable();
}

export async function listWishClusters(): Promise<WishListPayload> {
  if (!hasSupabaseReadConfig()) {
    return listLocalWishClusters();
  }

  const supabase = createServerSupabaseClient();
  const { data: clusters, error: clusterError } = await supabase
    .from("wish_clusters")
    .select(
      "id, slug, title, summary, normalized, representative_identity, representative_need, count, votes, created_at, updated_at, latest_submission_at"
    )
    .order("count", { ascending: false });

  assertNoSupabaseError(clusterError, "Failed to load wish clusters");

  if (!clusters || clusters.length === 0) {
    return {
      wishes: [],
      backendConfigured: true,
      usingDemoData: false,
    };
  }

  const clusterIds = clusters.map((cluster) => cluster.id);
  const { data: submissions, error: submissionError } = await supabase
    .from("wish_submissions")
    .select("id, cluster_id, who, need, created_at")
    .in("cluster_id", clusterIds)
    .order("created_at", { ascending: false });

  assertNoSupabaseError(submissionError, "Failed to load wish submissions");

  const grouped = groupSubmissionsByCluster(submissions ?? []);

  return {
    wishes: clusters.map((cluster) =>
      mapClusterRowToWish(cluster, grouped.get(cluster.id) ?? [])
    ),
    backendConfigured: true,
    usingDemoData: false,
  };
}

export async function getWishDetailBySlug(
  slug: string
): Promise<WishDetailPayload | null> {
  if (!hasSupabaseReadConfig()) {
    return getLocalWishDetailBySlug(slug);
  }

  const supabase = createServerSupabaseClient();
  const { data: cluster, error: clusterError } = await supabase
    .from("wish_clusters")
    .select(
      "id, slug, title, summary, normalized, representative_identity, representative_need, count, votes, created_at, updated_at, latest_submission_at"
    )
    .eq("slug", slug)
    .maybeSingle<WishClusterRow>();

  assertNoSupabaseError(clusterError, "Failed to load wish cluster detail");

  if (!cluster) {
    return null;
  }

  const { data: submissions, error: submissionError } = await supabase
    .from("wish_submissions")
    .select("id, cluster_id, who, need, created_at")
    .eq("cluster_id", cluster.id)
    .order("created_at", { ascending: false })
    .limit(8);

  assertNoSupabaseError(
    submissionError,
    "Failed to load wish cluster submissions"
  );

  const { data: relatedRows, error: relatedError } = await supabase.rpc(
    "related_wish_clusters",
    {
      source_slug: slug,
      match_count: 3,
    }
  );

  assertNoSupabaseError(relatedError, "Failed to load related wish clusters");

  const relatedClusterRows = (relatedRows ?? []) as RelatedWishRow[];
  const relatedIds = relatedClusterRows.map((item) => item.id);
  const { data: relatedSubmissions, error: relatedSubmissionError } =
    relatedIds.length > 0
      ? await supabase
          .from("wish_submissions")
          .select("id, cluster_id, who, need, created_at")
          .in("cluster_id", relatedIds)
          .order("created_at", { ascending: false })
      : { data: [], error: null };

  assertNoSupabaseError(
    relatedSubmissionError,
    "Failed to load related wish submissions"
  );

  const groupedSubmissions = groupSubmissionsByCluster(submissions ?? []);
  const groupedRelated = groupSubmissionsByCluster(relatedSubmissions ?? []);
  const wish = mapClusterRowToWish(
    cluster,
    groupedSubmissions.get(cluster.id) ?? []
  );
  const related = relatedClusterRows.map((item) =>
    mapClusterRowToWish(item, groupedRelated.get(item.id) ?? [])
  );

  return {
    wish,
    related,
    submissions: (submissions ?? []).map(toWishSubmission),
    backendConfigured: true,
    usingDemoData: false,
  };
}

export async function createWishSubmission(input: {
  who: string;
  need: string;
  userId?: string | null;
  contactEmail?: string | null;
}): Promise<WishSubmissionResult> {
  if (!hasWishWriteConfig()) {
    return createLocalWishSubmission(input);
  }

  const supabase = createServerSupabaseClient();
  const { normalized, vector } = await generateEmbedding(input.need);
  const vectorText = asSqlVector(vector);

  const { data: matches, error: matchError } = await supabase.rpc(
    "match_wish_clusters",
    {
      query_embedding: vectorText,
      match_threshold: SIMILARITY_THRESHOLD,
      match_count: 1,
    }
  );

  assertNoSupabaseError(matchError, "Failed to match existing wish clusters");

  const now = new Date().toISOString();
  const existingMatch =
    (matches?.[0] as (WishClusterRow & { similarity: number }) | undefined) ??
    undefined;

  let clusterRow: WishClusterRow;

  if (existingMatch) {
    const { data: updatedCluster, error: updateError } = await supabase
      .from("wish_clusters")
      .update({
        count: existingMatch.count + 1,
        votes: existingMatch.votes + 1,
        latest_submission_at: now,
        updated_at: now,
      })
      .eq("id", existingMatch.id)
      .select(
        "id, slug, title, summary, normalized, representative_identity, representative_need, count, votes, created_at, updated_at, latest_submission_at"
      )
      .single<WishClusterRow>();

    assertNoSupabaseError(updateError, "Failed to update matched wish cluster");
    clusterRow = assertPresent(
      updatedCluster,
      "Matched wish cluster update returned no row."
    );
  } else {
    const title = clampText(buildWishTitle(input.need), 48);
    const slug = createWishSlug(title);
    const { data: insertedCluster, error: insertError } = await supabase
      .from("wish_clusters")
      .insert({
        slug,
        title,
        summary: clampText(buildWishSummary(input.who, input.need), 180),
        normalized,
        representative_identity: input.who.trim(),
        representative_need: input.need.trim(),
        embedding: vectorText,
        count: 1,
        votes: 1,
        latest_submission_at: now,
        updated_at: now,
      })
      .select(
        "id, slug, title, summary, normalized, representative_identity, representative_need, count, votes, created_at, updated_at, latest_submission_at"
      )
      .single<WishClusterRow>();

    assertNoSupabaseError(insertError, "Failed to create wish cluster");
    clusterRow = assertPresent(
      insertedCluster,
      "Wish cluster insert returned no row."
    );
  }

  const { data: submission, error: submissionError } = await supabase
    .from("wish_submissions")
    .insert({
      cluster_id: clusterRow.id,
      user_id: input.userId ?? null,
      contact_email: input.contactEmail ?? null,
      who: input.who.trim(),
      need: input.need.trim(),
      language: "auto",
    })
    .select("id, cluster_id, who, need, created_at")
    .single<WishSubmissionRow>();

  assertNoSupabaseError(submissionError, "Failed to save wish submission");
  const savedSubmission = assertPresent(
    submission,
    "Wish submission insert returned no row."
  );

  const wish = mapClusterRowToWish(clusterRow, [savedSubmission]);

  return {
    wish,
    createdNewCluster: !existingMatch,
  };
}

export async function listViewerSignals(
  userId: string
): Promise<ViewerWishSignalsPayload> {
  if (!hasSupabaseReadConfig()) {
    return createDemoViewerSignalsPayload();
  }

  const supabase = createServerSupabaseClient();
  const { data: submissions, error: submissionError } = await supabase
    .from("wish_submissions")
    .select("id, cluster_id, who, need, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(24);

  assertNoSupabaseError(
    submissionError,
    "Failed to load viewer wish submissions"
  );

  const submissionRows = submissions ?? [];
  const clusterIds = [
    ...new Set(submissionRows.map((submission) => submission.cluster_id)),
  ];

  if (clusterIds.length === 0) {
    return {
      signals: [],
      totalSubmissions: 0,
      uniqueClusters: 0,
      risingClusters: 0,
      latestSubmissionAt: null,
      backendConfigured: true,
      usingDemoData: false,
    };
  }

  const { data: clusters, error: clusterError } = await supabase
    .from("wish_clusters")
    .select(
      "id, slug, title, summary, normalized, representative_identity, representative_need, count, votes, created_at, updated_at, latest_submission_at"
    )
    .in("id", clusterIds);

  assertNoSupabaseError(clusterError, "Failed to load viewer wish clusters");

  const { data: clusterSubmissions, error: clusterSubmissionError } =
    await supabase
      .from("wish_submissions")
      .select("id, cluster_id, who, need, created_at")
      .in("cluster_id", clusterIds)
      .order("created_at", { ascending: false });

  assertNoSupabaseError(
    clusterSubmissionError,
    "Failed to load clustered submission context"
  );

  const signals = mapViewerSignals({
    submissions: submissionRows,
    clusters: clusters ?? [],
    clusterSubmissions: clusterSubmissions ?? [],
  });

  const uniqueClusters = new Set(signals.map((signal) => signal.wish.slug)).size;
  const risingClusters = new Set(
    signals
      .filter((signal) => signal.wish.weeklyGrowth > 0)
      .map((signal) => signal.wish.slug)
  ).size;

  return {
    signals,
    totalSubmissions: signals.length,
    uniqueClusters,
    risingClusters,
    latestSubmissionAt: signals[0]?.submission.createdAt ?? null,
    backendConfigured: true,
    usingDemoData: false,
  };
}

export async function registerWishVote(input: {
  slug: string;
  fingerprint: string;
}) {
  if (!hasSupabaseReadConfig()) {
    return registerLocalWishVote(input);
  }

  const supabase = createServerSupabaseClient();
  const { data: voteResult, error: voteError } = await supabase.rpc(
    "register_wish_vote",
    {
      cluster_slug: input.slug,
      vote_fingerprint: input.fingerprint,
    }
  );

  assertNoSupabaseError(voteError, "Failed to register wish vote");

  const firstRow = voteResult?.[0] as
    | { votes: number; inserted: boolean }
    | undefined;

  if (!firstRow) {
    throw new Error("Vote registration returned no result.");
  }

  return {
    votes: firstRow.votes,
    alreadyVoted: !firstRow.inserted,
  };
}
