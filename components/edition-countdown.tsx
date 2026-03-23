"use client";

import { useEffect, useState } from "react";

import { getEditionCopy } from "@/lib/edition-copy";
import type { Locale } from "@/lib/i18n";

type EditionCountdownProps = {
  locale: Locale;
  startAt: string;
  endAt: string;
};

type CountdownState = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  closed: boolean;
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function readCountdownState(endAtValue: string): CountdownState {
  const endAt = new Date(endAtValue);
  const remainingMs = Math.max(0, endAt.getTime() - Date.now());
  const totalSeconds = Math.floor(remainingMs / 1000);

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    closed: remainingMs === 0,
  };
}

function formatWindowLabel(locale: Locale, startAtValue: string, endAtValue: string) {
  const formatter = new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    month: "short",
    day: "numeric",
  });

  return `${formatter.format(new Date(startAtValue))} - ${formatter.format(new Date(endAtValue))}`;
}

export function EditionCountdown({
  locale,
  startAt,
  endAt,
}: EditionCountdownProps) {
  const copy = getEditionCopy(locale);
  const [countdown, setCountdown] = useState<CountdownState>(() =>
    readCountdownState(endAt)
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCountdown(readCountdownState(endAt));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [endAt]);

  const eyebrow = countdown.closed ? copy.sealedEyebrow : copy.liveEyebrow;
  const title = countdown.closed ? copy.sealedTitle : copy.liveTitle;
  const windowLabel = formatWindowLabel(locale, startAt, endAt);

  return (
    <div className="border-t border-white/[0.06] bg-[linear-gradient(90deg,rgba(255,106,61,0.08),rgba(255,106,61,0.02)_28%,rgba(255,255,255,0.02)_55%,rgba(255,194,102,0.06))]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-6 py-3 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:px-10">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.34em] text-[var(--accent-soft)]">
            {eyebrow}
          </p>
          <p className="mt-1 truncate text-sm text-[var(--text-primary)]">
            {title}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start lg:self-auto">
          {[
            { value: countdown.days, unit: copy.units.days.short },
            { value: countdown.hours, unit: copy.units.hours.short },
            { value: countdown.minutes, unit: copy.units.minutes.short },
            { value: countdown.seconds, unit: copy.units.seconds.short },
          ].map((item) => (
            <div
              key={item.unit}
              className="rounded-full border border-white/[0.08] bg-black/[0.24] px-3 py-1.5"
            >
              <span className="font-serif-display text-lg text-[var(--text-primary)] lg:text-xl">
                {pad(item.value)}
              </span>
              <span className="ml-1 text-[10px] uppercase tracking-[0.22em] text-white/[0.36]">
                {item.unit}
              </span>
            </div>
          ))}
        </div>

        <div className="text-[11px] uppercase tracking-[0.28em] text-white/[0.34]">
          {windowLabel}
        </div>
      </div>
    </div>
  );
}
