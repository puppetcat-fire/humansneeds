"use client";

import { useState } from "react";

import Link from "next/link";

import { formatDate, formatNumber } from "@/lib/format";
import { getMessages, type Locale } from "@/lib/i18n";
import type { WishCluster } from "@/lib/wish-types";

type SortKey = "hot" | "recent" | "votes";

type WishesExplorerProps = {
  wishes: WishCluster[];
  locale: Locale;
};

export function WishesExplorer({ wishes, locale }: WishesExplorerProps) {
  const t = getMessages(locale);
  const sortLabels: Record<SortKey, string> = {
    hot: t.ranking.sortHot,
    recent: t.ranking.sortRecent,
    votes: t.ranking.sortVotes,
  };

  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("hot");

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = wishes.filter((wish) => {
    if (!normalizedQuery) {
      return true;
    }

    const haystack = [
      wish.title,
      wish.summary,
      wish.content,
      ...wish.samplePhrases,
      ...wish.sampleIdentities,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "recent") {
      return b.weeklyGrowth - a.weeklyGrowth;
    }

    if (sortBy === "votes") {
      return b.votes - a.votes;
    }

    return b.count + b.votes - (a.count + a.votes);
  });

  return (
    <div className="space-y-8">
      <div className="panel p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow">{t.ranking.explorerEyebrow}</p>
            <h2 className="mt-2 font-serif-display text-3xl text-[var(--text-primary)]">
              {t.ranking.explorerTitle}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              {t.ranking.explorerBody}
            </p>
          </div>

          <label className="w-full max-w-xl">
            <span className="sr-only">{t.ranking.explorerTitle}</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full rounded-full border border-white/[0.12] bg-black/[0.25] px-5 py-3 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-white/[0.25] focus:border-[rgba(255,106,61,0.7)]"
              placeholder={t.ranking.searchPlaceholder}
            />
          </label>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {(Object.keys(sortLabels) as SortKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setSortBy(key)}
              className={`rounded-full px-4 py-2 text-sm transition ${
                sortBy === key
                  ? "bg-[rgba(255,106,61,1)] text-black"
                  : "border border-white/[0.12] bg-white/[0.06] text-[var(--text-secondary)] hover:bg-white/[0.1]"
              }`}
            >
              {sortLabels[key]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {sorted.map((wish, index) => (
          <article key={wish.slug} className="panel p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">
                  {t.ranking.rank} #{index + 1}
                </p>
                <h3 className="mt-2 font-serif-display text-2xl leading-tight text-[var(--text-primary)]">
                  {wish.title}
                </h3>
              </div>
              <div className="rounded-full border border-white/[0.1] bg-white/[0.05] px-3 py-2 text-right text-xs text-[var(--text-secondary)]">
                <div>{t.ranking.score}</div>
                <strong className="text-sm text-[var(--text-primary)]">
                  {wish.signalScore}
                </strong>
              </div>
            </div>

            <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
              {wish.summary}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="data-chip">
                {formatNumber(wish.count, locale)} {t.home.submissionUnit}
              </span>
              <span className="data-chip">
                {formatNumber(wish.votes, locale)} {t.home.voteUnit}
              </span>
              <span className="data-chip">
                {t.ranking.recentActive} {formatDate(wish.latestAt, locale)}
              </span>
            </div>

            <div className="mt-6 rounded-[24px] border border-white/[0.1] bg-black/[0.2] p-4">
              <p className="text-xs uppercase tracking-[0.28em] text-white/[0.35]">
                {t.ranking.rawSample}
              </p>
              <p className="mt-3 text-base leading-7 text-[var(--text-primary)]">
                “{wish.samplePhrases[0]}”
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between gap-4">
              <p className="text-sm text-[var(--text-secondary)]">
                {t.ranking.thisWeek}{" "}
                <span className="text-[var(--accent-soft)]">
                  +{wish.weeklyGrowth}
                </span>
              </p>
              <Link href={`/wishes/${wish.slug}`} className="ghost-link">
                {t.ranking.detail}
              </Link>
            </div>
          </article>
        ))}
      </div>

      {sorted.length === 0 ? (
        <div className="panel p-8 text-center text-[var(--text-secondary)]">
          {t.ranking.noResults}
        </div>
      ) : null}
    </div>
  );
}
