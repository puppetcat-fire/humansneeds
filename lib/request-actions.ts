export type WishAction = "submit" | "vote" | "mark";

const ACTION_INTERVALS: Record<WishAction, number> = {
  submit: 20_000,
  vote: 6_000,
  mark: 15_000,
};

function readForwardedIp(value: string | null) {
  if (!value) {
    return null;
  }

  const first = value
    .split(",")
    .map((part) => part.trim())
    .find(Boolean);

  return first ?? null;
}

export function getClientIp(request: Request) {
  return (
    readForwardedIp(request.headers.get("x-forwarded-for")) ??
    readForwardedIp(request.headers.get("x-real-ip")) ??
    readForwardedIp(request.headers.get("cf-connecting-ip")) ??
    readForwardedIp(request.headers.get("x-vercel-forwarded-for")) ??
    "local-dev"
  );
}

export function getActionIntervalMs(action: WishAction) {
  return ACTION_INTERVALS[action];
}
