import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { isEditionClosed } from "@/lib/edition";
import { enforceLocalActionCooldown } from "@/lib/local-wishes";
import { getActionIntervalMs, getClientIp } from "@/lib/request-actions";
import { registerWishVote } from "@/lib/wishes";

export const runtime = "nodejs";

type VoteRouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function POST(
  request: Request,
  context: VoteRouteContext
) {
  if (isEditionClosed()) {
    return NextResponse.json(
      {
        error: "Edition window closed.",
        code: "edition_closed",
      },
      { status: 423 }
    );
  }

  try {
    const cooldown = await enforceLocalActionCooldown({
      action: "vote",
      ipKey: getClientIp(request),
      intervalMs: getActionIntervalMs("vote"),
    });

    if (!cooldown.allowed) {
      return NextResponse.json(
        {
          error: "Vote cooldown active.",
          code: "action_cooldown",
          action: "vote",
          retryAfterSeconds: cooldown.retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    const { slug } = await context.params;
    const cookieStore = await cookies();
    let fingerprint = cookieStore.get("wish_voter_id")?.value;

    if (!fingerprint) {
      fingerprint = crypto.randomUUID();
      cookieStore.set("wish_voter_id", fingerprint, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
        sameSite: "lax",
      });
    }

    const result = await registerWishVote({
      slug,
      fingerprint,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "投票失败，请稍后再试。",
      },
      { status: 500 }
    );
  }
}
