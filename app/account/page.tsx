import Link from "next/link";
import { redirect } from "next/navigation";

import { LogoutButton } from "@/components/logout-button";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCurrentViewer } from "@/lib/auth";
import { getAuthCopy } from "@/lib/auth-copy";
import {
  hasSupabaseAuthConfig,
  hasSupabaseReadConfig,
  isAuthUiEnabled,
} from "@/lib/env";
import { formatDate, formatNumber } from "@/lib/format";
import { getCurrentLocale } from "@/lib/i18n-server";
import { listViewerSignals } from "@/lib/wishes";

export default async function AccountPage() {
  if (!isAuthUiEnabled()) {
    redirect("/");
  }

  const locale = await getCurrentLocale();
  const copy = getAuthCopy(locale);
  const authConfigured = hasSupabaseAuthConfig();

  if (!authConfigured) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,106,61,0.2),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(160,223,255,0.14),transparent_34%),linear-gradient(180deg,#050608_0%,#0b1017_52%,#111927_100%)] text-[var(--text-primary)]">
        <SiteHeader locale={locale} />
        <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-16 lg:px-10">
          <p className="eyebrow">{copy.authEyebrow}</p>
          <h1 className="font-serif-display text-4xl leading-tight text-[var(--text-primary)]">
            {copy.authSetupTitle}
          </h1>
          <div className="rounded-[28px] border border-[rgba(255,106,61,0.24)] bg-[rgba(255,106,61,0.08)] p-6">
            <p className="text-base leading-7 text-[var(--text-primary)]">
              {copy.authSetupBody}
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              {copy.authSetupDetail}
            </p>
          </div>
        </section>
        <SiteFooter locale={locale} />
      </main>
    );
  }

  const viewer = await getCurrentViewer();

  if (!viewer) {
    redirect("/auth");
  }

  const historyConfigured = hasSupabaseReadConfig();
  const history = historyConfigured
    ? await listViewerSignals(viewer.id)
    : null;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,106,61,0.2),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(160,223,255,0.14),transparent_34%),linear-gradient(180deg,#050608_0%,#0b1017_52%,#111927_100%)] text-[var(--text-primary)]">
      <SiteHeader locale={locale} />

      <section className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:px-10">
        <div className="space-y-6">
          <p className="eyebrow">{copy.accountEyebrow}</p>
          <h1 className="font-serif-display text-5xl leading-[1.05] text-[var(--text-primary)] sm:text-6xl">
            {copy.accountTitle}
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-[var(--text-secondary)]">
            {copy.accountBody}
          </p>
        </div>

        <div className="panel space-y-5 p-6 sm:p-7">
          <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.04] p-5">
            <p className="text-xs uppercase tracking-[0.28em] text-white/[0.35]">
              {copy.emailLabel}
            </p>
            <p className="mt-3 text-xl text-[var(--text-primary)]">
              {viewer.email ?? "unknown"}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="signal-tile">
              <span>{locale === "zh" ? "状态" : "Status"}</span>
              <strong>
                {viewer.emailConfirmed
                  ? copy.emailStatusVerified
                  : copy.emailStatusPending}
              </strong>
            </div>
            <div className="signal-tile">
              <span>{locale === "zh" ? "连接方式" : "Connection mode"}</span>
              <strong>
                {locale === "zh" ? "私有账户链接" : "Private account link"}
              </strong>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/[0.08] bg-black/[0.18] p-5 text-sm leading-7 text-[var(--text-secondary)]">
            <p>{copy.emailPrivacy}</p>
            <p className="mt-3">{copy.submissionLinking}</p>
          </div>

          <LogoutButton locale={locale} />
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 pb-20 lg:px-10">
        <div className="panel p-6 sm:p-8">
          <div className="max-w-3xl">
            <p className="eyebrow">{copy.mySignalsEyebrow}</p>
            <h2 className="mt-2 font-serif-display text-3xl text-[var(--text-primary)] sm:text-4xl">
              {copy.mySignalsTitle}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
              {copy.mySignalsBody}
            </p>
          </div>

          {!historyConfigured ? (
            <div className="mt-8 rounded-[28px] border border-[rgba(255,106,61,0.24)] bg-[rgba(255,106,61,0.08)] p-6">
              <p className="text-lg text-[var(--text-primary)]">
                {copy.historyOfflineTitle}
              </p>
              <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                {copy.historyOfflineBody}
              </p>
            </div>
          ) : history && history.signals.length > 0 ? (
            <>
              <div className="mt-8 grid gap-4 md:grid-cols-4">
                <div className="metric-card">
                  <span className="text-sm text-[var(--text-dim)]">
                    {copy.totalSignals}
                  </span>
                  <strong>{formatNumber(history.totalSubmissions, locale)}</strong>
                </div>
                <div className="metric-card">
                  <span className="text-sm text-[var(--text-dim)]">
                    {copy.totalClusters}
                  </span>
                  <strong>{formatNumber(history.uniqueClusters, locale)}</strong>
                </div>
                <div className="metric-card">
                  <span className="text-sm text-[var(--text-dim)]">
                    {copy.risingSignals}
                  </span>
                  <strong>{formatNumber(history.risingClusters, locale)}</strong>
                </div>
                <div className="metric-card">
                  <span className="text-sm text-[var(--text-dim)]">
                    {copy.latestLinked}
                  </span>
                  <strong>
                    {history.latestSubmissionAt
                      ? formatDate(history.latestSubmissionAt, locale)
                      : "--"}
                  </strong>
                </div>
              </div>

              <div className="mt-8 grid gap-5 lg:grid-cols-2">
                {history.signals.map((signal) => (
                  <article key={signal.submission.id} className="panel p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="eyebrow">{copy.linkedAt}</p>
                        <p className="mt-2 text-sm text-[var(--text-secondary)]">
                          {formatDate(signal.submission.createdAt, locale)}
                        </p>
                      </div>
                      <div className="flex flex-wrap justify-end gap-2">
                        <span className="data-chip">
                          {formatNumber(signal.wish.count, locale)}
                          {locale === "zh" ? " 次提交" : " submissions"}
                        </span>
                        <span className="data-chip">
                          {formatNumber(signal.wish.votes, locale)}
                          {locale === "zh" ? " 个赞同" : " votes"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 rounded-[24px] border border-white/[0.08] bg-white/[0.04] p-4">
                      <p className="text-xs uppercase tracking-[0.28em] text-white/[0.35]">
                        {locale === "zh" ? "我是谁" : "Who I said I was"}
                      </p>
                      <p className="mt-3 text-base leading-7 text-[var(--text-primary)]">
                        {signal.submission.who}
                      </p>
                    </div>

                    <div className="mt-4 rounded-[24px] border border-white/[0.08] bg-black/[0.2] p-4">
                      <p className="text-xs uppercase tracking-[0.28em] text-white/[0.35]">
                        {locale === "zh" ? "我需要什么" : "What I said I needed"}
                      </p>
                      <p className="mt-3 text-base leading-7 text-[var(--text-primary)]">
                        {signal.submission.need}
                      </p>
                    </div>

                    <div className="mt-5">
                      <p className="text-xs uppercase tracking-[0.28em] text-white/[0.35]">
                        {copy.clusterNow}
                      </p>
                      <h3 className="mt-3 font-serif-display text-2xl text-[var(--text-primary)]">
                        {signal.wish.title}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                        {signal.wish.summary}
                      </p>
                    </div>

                    <div className="mt-6 flex items-center justify-between gap-4">
                      <p className="text-sm text-[var(--text-secondary)]">
                        {locale === "zh" ? "本周升温" : "Weekly rise"}{" "}
                        <span className="text-[var(--accent-soft)]">
                          +{signal.wish.weeklyGrowth}
                        </span>
                      </p>
                      <Link
                        href={`/wishes/${signal.wish.slug}`}
                        className="ghost-link"
                      >
                        {copy.openCluster}
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <div className="mt-8 rounded-[28px] border border-white/[0.08] bg-white/[0.04] p-8">
              <p className="text-lg text-[var(--text-primary)]">
                {copy.noSignalsTitle}
              </p>
              <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                {copy.noSignalsBody}
              </p>
              <Link href="/" className="action-button mt-6 inline-flex w-fit">
                {locale === "zh" ? "返回首页继续提交" : "Return home and submit"}
              </Link>
            </div>
          )}
        </div>
      </section>

      <SiteFooter locale={locale} />
    </main>
  );
}
