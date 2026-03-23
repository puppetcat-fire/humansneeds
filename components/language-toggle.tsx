"use client";

import { useTransition } from "react";

import { useRouter } from "next/navigation";

import { type Locale } from "@/lib/i18n";

type LanguageToggleProps = {
  locale: Locale;
};

const options: Array<{ value: Locale; label: string }> = [
  { value: "zh", label: "CH" },
  { value: "en", label: "EN" },
];

export function LanguageToggle({ locale }: LanguageToggleProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSwitch(nextLocale: Locale) {
    if (nextLocale === locale) {
      return;
    }

    startTransition(() => {
      void fetch("/api/preferences/language", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          locale: nextLocale,
        }),
      }).finally(() => {
        router.refresh();
      });
    });
  }

  return (
    <div className="inline-flex items-center rounded-full border border-white/[0.12] bg-white/[0.05] p-1">
      {options.map((option) => {
        const active = option.value === locale;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => handleSwitch(option.value)}
            disabled={isPending}
            className={`rounded-full px-3 py-2 text-xs tracking-[0.22em] transition ${
              active
                ? "bg-[rgba(255,106,61,1)] text-black"
                : "text-[var(--text-secondary)] hover:bg-white/[0.06] hover:text-[var(--text-primary)]"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
