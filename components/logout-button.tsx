"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { getAuthCopy } from "@/lib/auth-copy";
import type { Locale } from "@/lib/i18n";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type LogoutButtonProps = {
  locale: Locale;
};

export function LogoutButton({ locale }: LogoutButtonProps) {
  const copy = getAuthCopy(locale);
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleLogout() {
    setIsPending(true);

    try {
      const supabase = createBrowserSupabaseClient();
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isPending}
      className="rounded-full border border-white/[0.1] bg-white/[0.04] px-5 py-3 text-sm text-[var(--text-primary)] transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? `${copy.logout}...` : copy.logout}
    </button>
  );
}
