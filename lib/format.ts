type FormatLocale = "zh" | "en";

function resolveLocale(locale: FormatLocale) {
  return locale === "en" ? "en-US" : "zh-CN";
}

export function formatNumber(value: number, locale: FormatLocale = "zh") {
  return new Intl.NumberFormat(resolveLocale(locale)).format(value);
}

export function formatDate(value: string, locale: FormatLocale = "zh") {
  return new Intl.DateTimeFormat(resolveLocale(locale), {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}
