"use client";

import { useState } from "react";

import { getEditionCopy } from "@/lib/edition-copy";
import { getModerationCopy } from "@/lib/moderation-copy";
import type { Locale } from "@/lib/i18n";

type MarkButtonProps = {
  submissionId: string;
  wishSlug: string;
  enabled: boolean;
  editionClosed: boolean;
  locale: Locale;
};

type MarkResponse = {
  marked: boolean;
  alreadyMarked: boolean;
};

type ApiErrorPayload = {
  error?: string;
  code?: string;
  retryAfterSeconds?: number;
};

function readMarkError(
  payload: MarkResponse | ApiErrorPayload,
  locale: Locale,
  fallback: string
) {
  const copy = getModerationCopy(locale);

  if (
    "code" in payload &&
    payload.code === "action_cooldown" &&
    typeof payload.retryAfterSeconds === "number"
  ) {
    return copy.markCooldown(payload.retryAfterSeconds);
  }

  if ("code" in payload && payload.code === "edition_closed") {
    return getEditionCopy(locale).sealedWriteMessage;
  }

  return "error" in payload ? payload.error ?? fallback : fallback;
}

export function MarkButton({
  submissionId,
  wishSlug,
  enabled,
  editionClosed,
  locale,
}: MarkButtonProps) {
  const copy = getModerationCopy(locale);
  const edition = getEditionCopy(locale);
  const [marked, setMarked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function handleClick() {
    if (marked || submitting || !enabled) {
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch(`/api/submissions/${submissionId}/mark`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wishSlug,
        }),
      });
      const payload = (await response.json()) as MarkResponse | ApiErrorPayload;

      if (!response.ok || !("marked" in payload)) {
        throw new Error(readMarkError(payload, locale, copy.markFailed));
      }

      setMarked(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : copy.markFailed);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={!enabled || marked || submitting}
        className={`rounded-full border px-3 py-1.5 text-xs tracking-[0.22em] transition ${
          marked
            ? "border-[rgba(255,106,61,0.55)] bg-[rgba(255,106,61,0.12)] text-[var(--accent-soft)]"
            : "border-white/[0.1] bg-white/[0.04] text-[var(--text-secondary)] hover:border-[rgba(255,106,61,0.45)] hover:text-[var(--text-primary)]"
        } ${!enabled ? "cursor-not-allowed opacity-55" : ""}`}
      >
        {!enabled
          ? editionClosed
            ? edition.sealedActionLabel
            : copy.markUnavailable
          : marked
            ? copy.markRecorded
            : submitting
              ? copy.markPending
              : copy.markLabel}
      </button>

      {message ? (
        <p className="max-w-44 text-right text-xs leading-5 text-[var(--accent-soft)]">
          {message}
        </p>
      ) : null}
    </div>
  );
}
