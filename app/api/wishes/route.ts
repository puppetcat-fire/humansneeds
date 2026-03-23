import { NextResponse } from "next/server";
import { z } from "zod";

import { isEditionClosed } from "@/lib/edition";
import { enforceLocalActionCooldown } from "@/lib/local-wishes";
import { getActionIntervalMs, getClientIp } from "@/lib/request-actions";
import { hasSupabaseAuthConfig } from "@/lib/env";
import { createServerAuthClient } from "@/lib/supabase/server";
import { createWishSubmission, isWishWriteConfigured } from "@/lib/wishes";

export const runtime = "nodejs";

const createWishSchema = z.object({
  who: z.string().trim().min(2).max(120),
  need: z.string().trim().min(6).max(600),
});

export async function POST(request: Request) {
  if (isEditionClosed()) {
    return NextResponse.json(
      {
        error: "Edition window closed.",
        code: "edition_closed",
      },
      { status: 423 }
    );
  }

  if (!isWishWriteConfigured()) {
    return NextResponse.json(
      {
        error: "匿名写入链路暂时不可用，请稍后再试。",
      },
      { status: 503 }
    );
  }

  try {
    const cooldown = await enforceLocalActionCooldown({
      action: "submit",
      ipKey: getClientIp(request),
      intervalMs: getActionIntervalMs("submit"),
    });

    if (!cooldown.allowed) {
      return NextResponse.json(
        {
          error: "Submission cooldown active.",
          code: "action_cooldown",
          action: "submit",
          retryAfterSeconds: cooldown.retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = createWishSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "提交内容不完整，或者字段长度超出限制。",
        },
        { status: 400 }
      );
    }

    let userId: string | null = null;
    let contactEmail: string | null = null;

    if (hasSupabaseAuthConfig()) {
      const supabase = await createServerAuthClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      userId = user?.id ?? null;
      contactEmail = user?.email ?? null;
    }

    const result = await createWishSubmission({
      ...parsed.data,
      userId,
      contactEmail,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "提交失败，请稍后再试。",
      },
      { status: 500 }
    );
  }
}
