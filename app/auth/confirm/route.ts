import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

import { hasSupabaseAuthConfig, isAuthUiEnabled } from "@/lib/env";
import { createServerAuthClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  if (!isAuthUiEnabled()) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const redirectTo = request.nextUrl.clone();
  const tokenHash = redirectTo.searchParams.get("token_hash");
  const type = redirectTo.searchParams.get("type") as EmailOtpType | null;
  const nextPath = redirectTo.searchParams.get("next") ?? "/account";

  redirectTo.pathname = nextPath;
  redirectTo.searchParams.delete("token_hash");
  redirectTo.searchParams.delete("type");
  redirectTo.searchParams.delete("next");

  if (!hasSupabaseAuthConfig()) {
    redirectTo.pathname = "/auth";
    redirectTo.searchParams.set("status", "auth-not-configured");
    return NextResponse.redirect(redirectTo);
  }

  if (tokenHash && type) {
    const supabase = await createServerAuthClient();
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });

    if (!error) {
      return NextResponse.redirect(redirectTo);
    }
  }

  redirectTo.pathname = "/auth";
  redirectTo.searchParams.set("status", "confirm-failed");
  return NextResponse.redirect(redirectTo);
}
