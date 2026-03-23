import { NextResponse } from "next/server";

import { getEditionEndAt, getEditionStartAt, isEditionClosed } from "@/lib/edition";
import {
  hasSupabaseReadConfig,
  hasWishWriteConfig,
  isAuthUiEnabled,
} from "@/lib/env";
import { isLocalWishBackendAvailable } from "@/lib/local-wishes";

export const runtime = "nodejs";

export async function GET() {
  const localBackendAvailable = isLocalWishBackendAvailable();
  const supabaseReadConfigured = hasSupabaseReadConfig();
  const cloudWriteConfigured = hasWishWriteConfig();
  const writeAvailable = localBackendAvailable || cloudWriteConfigured;
  const editionClosed = isEditionClosed();
  const backendMode = cloudWriteConfigured
    ? "cloud"
    : localBackendAvailable
      ? "local"
      : "unavailable";
  const healthy = localBackendAvailable || supabaseReadConfigured;

  return NextResponse.json(
    {
      ok: healthy,
      status: healthy ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      backendMode,
      authUiEnabled: isAuthUiEnabled(),
      edition: {
        startAt: getEditionStartAt().toISOString(),
        endAt: getEditionEndAt().toISOString(),
        closed: editionClosed,
      },
      backends: {
        local: localBackendAvailable,
        supabaseRead: supabaseReadConfigured,
        cloudWrite: cloudWriteConfigured,
        writeAvailable: writeAvailable && !editionClosed,
      },
    },
    { status: healthy ? 200 : 503 }
  );
}
