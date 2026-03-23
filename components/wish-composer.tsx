"use client";

import { FormEvent, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { getEditionCopy } from "@/lib/edition-copy";
import { formatNumber } from "@/lib/format";
import { getMessages, type Locale } from "@/lib/i18n";
import { getModerationCopy } from "@/lib/moderation-copy";
import type { WishCluster } from "@/lib/wish-types";

type WishComposerProps = {
  writeConfigured: boolean;
  editionClosed: boolean;
  locale: Locale;
  initialWish: WishCluster | null;
};

type CreateWishResponse = {
  wish: WishCluster;
  createdNewCluster: boolean;
};

type ApiErrorPayload = {
  error?: string;
  code?: string;
  retryAfterSeconds?: number;
};

function readCreateErrorMessage(
  payload: CreateWishResponse | ApiErrorPayload,
  locale: Locale,
  fallback: string
) {
  if (
    "code" in payload &&
    payload.code === "action_cooldown" &&
    typeof payload.retryAfterSeconds === "number"
  ) {
    return getModerationCopy(locale).submitCooldown(payload.retryAfterSeconds);
  }

  if ("code" in payload && payload.code === "edition_closed") {
    return getEditionCopy(locale).sealedWriteMessage;
  }

  return "error" in payload ? payload.error ?? fallback : fallback;
}

export function WishComposer({
  writeConfigured,
  editionClosed,
  locale,
  initialWish,
}: WishComposerProps) {
  const t = getMessages(locale);
  const edition = getEditionCopy(locale);
  const router = useRouter();
  const anonymousWriteUnavailable =
    editionClosed
      ? edition.sealedWriteMessage
      : locale === "zh"
        ? "当前匿名写入链路暂时不可用，请稍后再试。"
        : "Anonymous submission is temporarily unavailable. Please try again later.";
  const [identity, setIdentity] = useState(
    locale === "zh"
      ? "一个担心自己只剩可被替代熟练度的人"
      : "someone worried they will be reduced to replaceable competence"
  );
  const [need, setNeed] = useState(
    locale === "zh"
      ? "我想要一个世界，普通人能因为提出真实需求而被需要，而不是只能靠技能出售自己。"
      : "I need a world where ordinary people can be needed because they notice real demand, not only because they can sell a skill."
  );
  const [submitted, setSubmitted] = useState<WishCluster | null>(initialWish);
  const [submittedIdentity, setSubmittedIdentity] = useState(identity);
  const [createdNewCluster, setCreatedNewCluster] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedIdentity = identity.trim();
    const trimmedNeed = need.trim();

    if (!trimmedIdentity || !trimmedNeed) {
      setErrorMessage(t.composer.missingFields);
      return;
    }

    if (editionClosed || !writeConfigured) {
      setErrorMessage(anonymousWriteUnavailable);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/wishes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          who: trimmedIdentity,
          need: trimmedNeed,
        }),
      });

      const payload = (await response.json()) as
        | CreateWishResponse
        | ApiErrorPayload;

      if (!response.ok || !("wish" in payload)) {
        throw new Error(
          readCreateErrorMessage(payload, locale, t.composer.submitFailed)
        );
      }

      setSubmittedIdentity(trimmedIdentity);
      setSubmitted(payload.wish);
      setCreatedNewCluster(payload.createdNewCluster);
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : t.composer.submitFailed
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="panel relative overflow-hidden p-6 sm:p-7">
      <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,106,61,0.8)] to-transparent" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">{t.composer.eyebrow}</p>
          <h2 className="mt-2 font-serif-display text-3xl leading-tight text-[var(--text-primary)]">
            {t.composer.title}
          </h2>
        </div>
        <span className="rounded-full border border-white/[0.12] bg-white/[0.06] px-3 py-1 text-xs text-[var(--text-secondary)]">
          {t.composer.anonymous}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-3 block text-sm text-[var(--text-primary)]">
            {t.composer.whoLabel}
          </span>
          <textarea
            value={identity}
            onChange={(event) => setIdentity(event.target.value)}
            className="min-h-[112px] w-full resize-none rounded-[28px] border border-white/[0.12] bg-black/[0.25] px-5 py-4 text-base leading-7 text-[var(--text-primary)] outline-none transition placeholder:text-white/[0.28] focus:border-[rgba(255,106,61,0.7)]"
            placeholder={t.composer.whoPlaceholder}
          />
        </label>

        <label className="block">
          <span className="mb-3 block text-sm text-[var(--text-primary)]">
            {t.composer.needLabel}
          </span>
          <textarea
            value={need}
            onChange={(event) => setNeed(event.target.value)}
            className="min-h-[176px] w-full resize-none rounded-[28px] border border-white/[0.12] bg-black/[0.25] px-5 py-4 text-base leading-7 text-[var(--text-primary)] outline-none transition placeholder:text-white/[0.28] focus:border-[rgba(255,106,61,0.7)]"
            placeholder={t.composer.needPlaceholder}
          />
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md text-sm leading-6 text-[var(--text-secondary)]">
            {t.composer.helper}
          </p>
          <button
            type="submit"
            className="action-button disabled:cursor-not-allowed disabled:opacity-65"
            disabled={isSubmitting || editionClosed || !writeConfigured}
          >
            {editionClosed
              ? edition.sealedActionLabel
              : isSubmitting
                ? t.composer.submitting
                : t.composer.submit}
          </button>
        </div>

        {editionClosed ? (
          <p className="rounded-[20px] border border-[rgba(255,106,61,0.25)] bg-[rgba(255,106,61,0.08)] px-4 py-3 text-sm leading-6 text-[var(--accent-soft)]">
            {edition.sealedWriteMessage}
          </p>
        ) : null}

        {errorMessage ? (
          <p className="rounded-[20px] border border-[rgba(255,106,61,0.25)] bg-[rgba(255,106,61,0.08)] px-4 py-3 text-sm leading-6 text-[var(--accent-soft)]">
            {errorMessage}
          </p>
        ) : null}
      </form>

      {submitted ? (
        <div className="mt-6 rounded-[28px] border border-white/[0.1] bg-white/[0.05] p-5">
          <div className="rounded-[22px] border border-white/[0.08] bg-black/[0.18] p-4">
            <p className="text-xs uppercase tracking-[0.28em] text-white/[0.35]">
              {t.composer.identitySlice}
            </p>
            <p className="mt-3 text-base leading-7 text-[var(--text-primary)]">
              {submittedIdentity}
            </p>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="data-chip">{t.composer.mergedInto}</span>
            <Link
              href={`/wishes/${submitted.slug}`}
              className="text-lg font-medium text-[var(--text-primary)] transition hover:text-[var(--accent-soft)]"
            >
              {submitted.title}
            </Link>
          </div>

          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
            {createdNewCluster ? t.composer.newCluster : submitted.mergeReasons[0]}
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="signal-tile">
              <span>{t.composer.currentSubmissions}</span>
              <strong>{formatNumber(submitted.count, locale)}</strong>
            </div>
            <div className="signal-tile">
              <span>{t.composer.currentVotes}</span>
              <strong>{formatNumber(submitted.votes, locale)}</strong>
            </div>
            <div className="signal-tile">
              <span>{t.composer.weeklyGrowth}</span>
              <strong>+{submitted.weeklyGrowth}</strong>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
