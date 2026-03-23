"use client";

import { useState } from "react";

import { getEditionCopy } from "@/lib/edition-copy";
import { formatNumber } from "@/lib/format";
import { getMessages, type Locale } from "@/lib/i18n";
import { getModerationCopy } from "@/lib/moderation-copy";

type AffirmButtonProps = {
  initialVotes: number;
  slug: string;
  enabled: boolean;
  editionClosed: boolean;
  locale: Locale;
};

type VoteResponse = {
  votes: number;
  alreadyVoted: boolean;
};

type ApiErrorPayload = {
  error?: string;
  code?: string;
  retryAfterSeconds?: number;
};

function readErrorMessage(
  payload: VoteResponse | ApiErrorPayload,
  locale: Locale,
  fallback: string
) {
  if (
    "code" in payload &&
    payload.code === "action_cooldown" &&
    typeof payload.retryAfterSeconds === "number"
  ) {
    return getModerationCopy(locale).markCooldown(payload.retryAfterSeconds);
  }

  if ("code" in payload && payload.code === "edition_closed") {
    return getEditionCopy(locale).sealedWriteMessage;
  }

  return "error" in payload ? payload.error ?? fallback : fallback;
}

export function AffirmButton({
  initialVotes,
  slug,
  enabled,
  editionClosed,
  locale,
}: AffirmButtonProps) {
  const t = getMessages(locale);
  const edition = getEditionCopy(locale);
  const [votes, setVotes] = useState(initialVotes);
  const [active, setActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function handleClick() {
    if (active || submitting || !enabled) {
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch(`/api/wishes/${slug}/vote`, {
        method: "POST",
      });
      const payload = (await response.json()) as
        | VoteResponse
        | ApiErrorPayload;

      if (!response.ok || !("votes" in payload)) {
        throw new Error(readErrorMessage(payload, locale, t.vote.failed));
      }

      setActive(true);
      setVotes(payload.votes);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t.vote.failed);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={!enabled || active || submitting}
        className={`inline-flex items-center gap-3 rounded-full border px-5 py-3 text-sm transition ${
          active
            ? "border-[rgba(255,106,61,1)] bg-[rgba(255,106,61,0.12)] text-[var(--text-primary)]"
            : "border-white/[0.12] bg-white/[0.06] text-[var(--text-primary)] hover:border-[rgba(255,106,61,0.65)] hover:bg-white/[0.1]"
        } ${!enabled ? "cursor-not-allowed opacity-60" : ""}`}
      >
        <span>
          {!enabled
            ? editionClosed
              ? edition.sealedActionLabel
              : t.vote.unavailable
            : active
              ? t.vote.recorded
              : submitting
                ? t.vote.pending
                : t.vote.act}
        </span>
        <span className="rounded-full bg-black/[0.25] px-3 py-1 text-xs text-[var(--text-secondary)]">
          {formatNumber(votes, locale)}
        </span>
      </button>

      {message ? (
        <p className="text-xs leading-5 text-[var(--accent-soft)]">{message}</p>
      ) : null}
    </div>
  );
}
