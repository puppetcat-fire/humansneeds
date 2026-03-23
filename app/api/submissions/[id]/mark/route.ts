import { NextResponse } from "next/server";
import { z } from "zod";

import { isEditionClosed } from "@/lib/edition";
import {
  enforceLocalActionCooldown,
  registerLocalSubmissionMark,
} from "@/lib/local-wishes";
import { getActionIntervalMs, getClientIp } from "@/lib/request-actions";

export const runtime = "nodejs";

const markSchema = z.object({
  wishSlug: z.string().trim().min(1).max(160),
});

type MarkRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, context: MarkRouteContext) {
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
      action: "mark",
      ipKey: getClientIp(request),
      intervalMs: getActionIntervalMs("mark"),
    });

    if (!cooldown.allowed) {
      return NextResponse.json(
        {
          error: "Flag cooldown active.",
          code: "action_cooldown",
          action: "mark",
          retryAfterSeconds: cooldown.retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();
    const parsed = markSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid mark payload.",
        },
        { status: 400 }
      );
    }

    const result = await registerLocalSubmissionMark({
      submissionId: id,
      wishSlug: parsed.data.wishSlug,
      ipKey: getClientIp(request),
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Flag failed.",
      },
      { status: 500 }
    );
  }
}
