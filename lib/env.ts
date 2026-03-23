const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";

const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "";

const authUiEnabled = (
  process.env.NEXT_PUBLIC_ENABLE_AUTH_UI ??
  process.env.ENABLE_AUTH_UI ??
  "false"
).toLowerCase() === "true";

const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const openAiApiKey = process.env.OPENAI_API_KEY ?? "";
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.SITE_URL ??
  process.env.VERCEL_PROJECT_PRODUCTION_URL ??
  process.env.VERCEL_URL ??
  "";

function normalizeSiteUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "http://localhost:3000";
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed.replace(/\/+$/, "");
  }

  const protocol =
    trimmed.startsWith("localhost") || trimmed.startsWith("127.0.0.1")
      ? "http"
      : "https";

  return `${protocol}://${trimmed}`.replace(/\/+$/, "");
}

export function getSupabaseUrl() {
  return supabaseUrl;
}

export function getSupabaseServiceRoleKey() {
  return supabaseServiceRoleKey;
}

export function getSupabasePublishableKey() {
  return supabasePublishableKey;
}

export function getOpenAiApiKey() {
  return openAiApiKey;
}

export function getSiteUrl() {
  return normalizeSiteUrl(siteUrl);
}

export function isAuthUiEnabled() {
  return authUiEnabled;
}

export function hasSupabaseAuthConfig() {
  return Boolean(supabaseUrl && supabasePublishableKey);
}

export function hasSupabaseReadConfig() {
  return Boolean(supabaseUrl && supabaseServiceRoleKey);
}

export function hasWishWriteConfig() {
  return Boolean(supabaseUrl && supabaseServiceRoleKey && openAiApiKey);
}
