import Link from "next/link";

import { BackendSetupNotice } from "@/components/backend-setup-notice";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WishComposer } from "@/components/wish-composer";
import { isEditionClosed } from "@/lib/edition";
import { formatDate, formatNumber } from "@/lib/format";
import { getMessages } from "@/lib/i18n";
import { getCurrentLocale } from "@/lib/i18n-server";
import { isWishWriteConfigured, listWishClusters } from "@/lib/wishes";

export const dynamic = "force-dynamic";

export default async function Home() {
  const locale = await getCurrentLocale();
  const t = getMessages(locale);
  const manifestoCta = locale === "zh" ? "读宣言" : "Read Manifesto";
  const { wishes, usingDemoData } = await listWishClusters();
  const topSignals = [...wishes].sort((a, b) => b.count - a.count).slice(0, 4);
  const initialWish = topSignals[0] ?? wishes[0] ?? null;
  const risingSignals = [...wishes]
    .sort((a, b) => b.weeklyGrowth - a.weeklyGrowth)
    .slice(0, 3);
  const voices = wishes.flatMap((wish, wishIndex) =>
    wish.samplePhrases.map((phrase, phraseIndex) => ({
      id: `${wish.id ?? wish.slug}-${wishIndex}-${phraseIndex}`,
      phrase,
      slug: wish.slug,
      title: wish.title,
      who:
        wish.sampleIdentities[phraseIndex] ??
        wish.sampleIdentities[0] ??
        t.home.unknownVoice,
    }))
  );
  const writeConfigured = isWishWriteConfigured();
  const editionClosed = isEditionClosed();

  return (
    <div className="page-shell min-h-screen">
      <SiteHeader locale={locale} />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-14 px-6 pb-20 pt-10 lg:px-10 lg:pt-14">
        {usingDemoData ? <BackendSetupNotice locale={locale} /> : null}

        <section className="grid items-start gap-8 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-8">
            <div className="space-y-6">
              <p className="eyebrow">{t.home.eyebrow}</p>
              <h1 className="max-w-5xl font-serif-display text-5xl leading-[1.1] text-[var(--text-primary)] sm:text-6xl lg:text-7xl">
                {t.home.titleLead}
                <span className="text-[var(--accent-soft)]">
                  {t.home.titleAccent}
                </span>
                {t.home.titleTail}
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-[var(--text-secondary)] sm:text-xl">
                {t.home.intro}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="metric-card">
                <span className="text-sm text-[var(--text-dim)]">
                  {t.home.metricSignals}
                </span>
                <strong>
                  {formatNumber(
                    wishes.reduce((sum, wish) => sum + wish.count, 0),
                    locale
                  )}
                </strong>
              </div>
              <div className="metric-card">
                <span className="text-sm text-[var(--text-dim)]">
                  {t.home.metricClusters}
                </span>
                <strong>{formatNumber(wishes.length, locale)}</strong>
              </div>
              <div className="metric-card">
                <span className="text-sm text-[var(--text-dim)]">
                  {t.home.metricRising}
                </span>
                <strong>
                  {formatNumber(
                    wishes.filter((wish) => wish.weeklyGrowth > 0).length,
                    locale
                  )}
                </strong>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/wishes" className="action-button inline-flex w-fit">
                {t.home.enterRanking}
              </Link>
              <Link href="/manifesto" className="ghost-link w-fit">
                {manifestoCta}
              </Link>
              <a href="#method" className="ghost-link w-fit">
                {t.home.seeMethod}
              </a>
            </div>

            <div className="panel p-6 sm:p-7">
              <p className="eyebrow">{t.home.whyEyebrow}</p>
              <p className="mt-4 max-w-3xl font-serif-display text-2xl leading-relaxed text-[var(--text-primary)] sm:text-3xl">
                {t.home.whyLead}
                <span className="text-[var(--gold)]">{t.home.whyAccent}</span>
                {t.home.whyTail}
              </p>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--text-secondary)]">
                {t.home.whyBody}
              </p>
            </div>
          </div>

          <WishComposer
            key={locale}
            writeConfigured={writeConfigured}
            editionClosed={editionClosed}
            locale={locale}
            initialWish={initialWish}
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="panel p-6 sm:p-7">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow">{t.home.topEyebrow}</p>
                <h2 className="mt-2 font-serif-display text-3xl text-[var(--text-primary)]">
                  {t.home.topTitle}
                </h2>
              </div>
              <Link href="/wishes" className="ghost-link">
                {t.home.viewAll}
              </Link>
            </div>

            <div className="mt-8 space-y-5">
              {topSignals.map((wish, index) => (
                <Link
                  key={wish.slug}
                  href={`/wishes/${wish.slug}`}
                  className="group block rounded-[24px] border border-white/[0.08] bg-white/[0.04] p-5 transition hover:border-[rgba(255,106,61,0.35)] hover:bg-white/[0.07]"
                >
                  <div className="flex items-start gap-4">
                    <span className="font-serif-display text-4xl text-white/[0.25]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg text-[var(--text-primary)] transition group-hover:text-[var(--accent-soft)]">
                          {wish.title}
                        </h3>
                        <span className="data-chip">{wish.signalScore}</span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                        {wish.summary}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="data-chip">
                          {formatNumber(wish.count, locale)} {t.home.submissionUnit}
                        </span>
                        <span className="data-chip">
                          {formatNumber(wish.votes, locale)} {t.home.voteUnit}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {risingSignals.map((wish) => (
              <article key={wish.slug} className="panel p-6">
                <p className="eyebrow">{t.home.risingEyebrow}</p>
                <h3 className="mt-3 font-serif-display text-2xl leading-tight text-[var(--text-primary)]">
                  {wish.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                  {wish.samplePhrases[0]}
                </p>
                <div className="mt-6 flex items-center justify-between gap-3">
                  <span className="text-sm text-[var(--text-secondary)]">
                    {t.home.thisWeek} +{wish.weeklyGrowth}
                  </span>
                  <Link href={`/wishes/${wish.slug}`} className="ghost-link">
                    {t.home.detail}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel p-6 sm:p-8">
          <div className="max-w-3xl">
            <p className="eyebrow">{t.home.voicesEyebrow}</p>
            <h2 className="mt-2 font-serif-display text-3xl text-[var(--text-primary)] sm:text-4xl">
              {t.home.voicesTitle}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
              {t.home.voicesBody}
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {voices.slice(0, 6).map((voice) => (
              <Link
                key={voice.id}
                href={`/wishes/${voice.slug}`}
                className="quote-card transition hover:-translate-y-1 hover:border-[rgba(255,106,61,0.3)]"
              >
                <p className="text-lg leading-8 text-[var(--text-primary)]">
                  “{voice.phrase}”
                </p>
                <p className="mt-4 text-sm text-[var(--text-secondary)]">
                  {voice.who} · {t.home.groupedInto} {voice.title}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section id="method" className="grid gap-6 lg:grid-cols-4">
          {t.home.methodSteps.map((item) => (
            <article key={item.step} className="panel p-6">
              <p className="font-serif-display text-4xl text-white/[0.22]">
                {item.step}
              </p>
              <h3 className="mt-4 text-lg leading-8 text-[var(--text-primary)]">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                {item.body}
              </p>
            </article>
          ))}
        </section>

        <section className="panel p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr] lg:items-end">
            <div>
              <p className="eyebrow">{t.home.previewEyebrow}</p>
              <h2 className="mt-2 font-serif-display text-3xl text-[var(--text-primary)] sm:text-4xl">
                {t.home.previewTitle}
              </h2>
            </div>
            <div className="text-sm leading-7 text-[var(--text-secondary)]">
              {t.home.previewBody}
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {wishes.slice(0, 3).map((wish) => (
              <div key={wish.slug} className="panel border-white/[0.08] bg-white/[0.04] p-5">
                <p className="eyebrow">
                  {t.home.recentActive} {formatDate(wish.latestAt, locale)}
                </p>
                <h3 className="mt-3 font-serif-display text-2xl text-[var(--text-primary)]">
                  {wish.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                  {wish.content}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter locale={locale} />
    </div>
  );
}
