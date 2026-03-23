import type { Locale } from "@/lib/i18n";

type UnitCopy = {
  short: string;
  long: string;
};

type EditionCopy = {
  liveEyebrow: string;
  liveTitle: string;
  liveCaption: string;
  sealedEyebrow: string;
  sealedTitle: string;
  sealedCaption: string;
  sealedWriteMessage: string;
  sealedActionLabel: string;
  windowLabel: string;
  units: {
    days: UnitCopy;
    hours: UnitCopy;
    minutes: UnitCopy;
    seconds: UnitCopy;
  };
};

const editionCopy: Record<Locale, EditionCopy> = {
  zh: {
    liveEyebrow: "V1 倒计时",
    liveTitle: "第一版只活 7 天，时间到了就封版。",
    liveCaption: "窗口关闭后站点保留阅读，停止新的提交、赞同和标记。",
    sealedEyebrow: "V1 已封版",
    sealedTitle: "第一版窗口已关闭，现在只保留阅读。",
    sealedCaption: "新的提交、赞同和标记都已停止。",
    sealedWriteMessage: "第一版 7 天窗口已结束，现在只保留阅读。",
    sealedActionLabel: "V1 已封版",
    windowLabel: "7 天窗口",
    units: {
      days: { short: "D", long: "天" },
      hours: { short: "H", long: "时" },
      minutes: { short: "M", long: "分" },
      seconds: { short: "S", long: "秒" },
    },
  },
  en: {
    liveEyebrow: "V1 Countdown",
    liveTitle: "Version one lives for 7 days, then it is sealed.",
    liveCaption:
      "Once the window closes, the site stays readable but stops new submissions, votes, and marks.",
    sealedEyebrow: "V1 Sealed",
    sealedTitle: "The first edition window is closed. Read-only remains.",
    sealedCaption: "New submissions, votes, and marks are all locked.",
    sealedWriteMessage:
      "The 7-day window for version one is over. The site is now read-only.",
    sealedActionLabel: "V1 Sealed",
    windowLabel: "7 day window",
    units: {
      days: { short: "D", long: "days" },
      hours: { short: "H", long: "hours" },
      minutes: { short: "M", long: "minutes" },
      seconds: { short: "S", long: "seconds" },
    },
  },
};

export function getEditionCopy(locale: Locale) {
  return editionCopy[locale];
}
