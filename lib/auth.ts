import "server-only";

import { cache } from "react";

import { hasSupabaseAuthConfig } from "@/lib/env";
import { createServerAuthClient } from "@/lib/supabase/server";

export type Viewer = {
  id: string;
  email: string | null;
  emailConfirmed: boolean;
};

export const getCurrentViewer = cache(async (): Promise<Viewer | null> => {
  if (!hasSupabaseAuthConfig()) {
    return null;
  }

  const supabase = await createServerAuthClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email ?? null,
    emailConfirmed: Boolean(user.email_confirmed_at),
  };
});
