import { redirect } from "next/navigation";

import { AuthPanel } from "@/components/auth-panel";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCurrentViewer } from "@/lib/auth";
import { getAuthCopy } from "@/lib/auth-copy";
import { hasSupabaseAuthConfig, isAuthUiEnabled } from "@/lib/env";
import { getCurrentLocale } from "@/lib/i18n-server";

export default async function AuthPage() {
  if (!isAuthUiEnabled()) {
    redirect("/");
  }

  const locale = await getCurrentLocale();
  const copy = getAuthCopy(locale);
  const viewer = await getCurrentViewer();
  const authConfigured = hasSupabaseAuthConfig();

  if (viewer) {
    redirect("/account");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,106,61,0.2),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(160,223,255,0.14),transparent_34%),linear-gradient(180deg,#050608_0%,#0b1017_52%,#111927_100%)] text-[var(--text-primary)]">
      <SiteHeader locale={locale} />

      <section className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-10">
        <div className="flex flex-col justify-between gap-8">
          <div className="space-y-6">
            <p className="eyebrow">{copy.authEyebrow}</p>
            <h1 className="max-w-3xl font-serif-display text-5xl leading-[1.05] text-[var(--text-primary)] sm:text-6xl">
              {copy.authTitle}
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[var(--text-secondary)]">
              {copy.authBody}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="signal-tile">
              <span>{copy.emailStatusVerified}</span>
              <strong>{locale === "zh" ? "邮箱确认" : "Email confirmation"}</strong>
            </div>
            <div className="signal-tile">
              <span>{locale === "zh" ? "隐私边界" : "Privacy boundary"}</span>
              <strong>{locale === "zh" ? "邮箱不公开展示" : "Email stays private"}</strong>
            </div>
          </div>

          {!authConfigured ? (
            <div className="rounded-[28px] border border-[rgba(255,106,61,0.24)] bg-[rgba(255,106,61,0.08)] p-6">
              <p className="eyebrow">{copy.authSetupTitle}</p>
              <p className="mt-3 text-base leading-7 text-[var(--text-primary)]">
                {copy.authSetupBody}
              </p>
              <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                {copy.authSetupDetail}
              </p>
            </div>
          ) : null}
        </div>

        <AuthPanel locale={locale} authConfigured={authConfigured} />
      </section>

      <SiteFooter locale={locale} />
    </main>
  );
}
