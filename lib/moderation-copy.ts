import type { Locale } from "@/lib/i18n";

type ModerationCopy = {
  markLabel: string;
  markPending: string;
  markRecorded: string;
  markUnavailable: string;
  markFailed: string;
  markCooldown(seconds: number): string;
  submitCooldown(seconds: number): string;
};

const moderationCopy: Record<Locale, ModerationCopy> = {
  zh: {
    markLabel: "<标记>",
    markPending: "<标记中>",
    markRecorded: "已标记",
    markUnavailable: "<标记不可用>",
    markFailed: "标记失败",
    markCooldown: (seconds) => `操作太快，请在 ${seconds} 秒后再试。`,
    submitCooldown: (seconds) =>
      `提交过快，请在 ${seconds} 秒后再继续。`,
  },
  en: {
    markLabel: "<Flag>",
    markPending: "<Flagging>",
    markRecorded: "Flagged",
    markUnavailable: "<Unavailable>",
    markFailed: "Flag failed",
    markCooldown: (seconds) =>
      `Too fast. Try again in ${seconds} seconds.`,
    submitCooldown: (seconds) =>
      `You are submitting too quickly. Try again in ${seconds} seconds.`,
  },
};

export function getModerationCopy(locale: Locale) {
  return moderationCopy[locale];
}
