const EDITION_WINDOW_DAYS = 7;
const EDITION_WINDOW_MS = EDITION_WINDOW_DAYS * 24 * 60 * 60 * 1000;
const DEFAULT_EDITION_START_AT = "2026-03-23T00:00:00-07:00";

function resolveEditionStartAtValue() {
  return (
    process.env.NEXT_PUBLIC_EDITION_START_AT ??
    process.env.EDITION_START_AT ??
    DEFAULT_EDITION_START_AT
  );
}

function safeDate(value: string) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return new Date(DEFAULT_EDITION_START_AT);
  }

  return parsed;
}

export function getEditionWindowDays() {
  return EDITION_WINDOW_DAYS;
}

export function getEditionStartAt() {
  return safeDate(resolveEditionStartAtValue());
}

export function getEditionEndAt() {
  return new Date(getEditionStartAt().getTime() + EDITION_WINDOW_MS);
}

export function isEditionClosed(now = new Date()) {
  return now.getTime() >= getEditionEndAt().getTime();
}

export function getEditionCountdown(now = new Date()) {
  const startAt = getEditionStartAt();
  const endAt = getEditionEndAt();
  const remainingMs = Math.max(0, endAt.getTime() - now.getTime());
  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    startAt,
    endAt,
    days,
    hours,
    minutes,
    seconds,
    closed: remainingMs === 0,
  };
}
