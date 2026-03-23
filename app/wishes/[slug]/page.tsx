import Link from "next/link";
import { notFound } from "next/navigation";

import { AffirmButton } from "@/components/affirm-button";
import { BackendSetupNotice } from "@/components/backend-setup-notice";
import { MarkButton } from "@/components/mark-button";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { isEditionClosed } from "@/lib/edition";
import { formatDate, formatNumber } from "@/lib/format";
import { getMessages } from "@/lib/i18n";
import { getCurrentLocale } from "@/lib/i18n-server";
import {
  getWishDetailBySlug,
  isWishWriteConfigured,
  listWishClusters,
} from "@/lib/wishes";

type WishDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const { wishes } = await listWishClusters();

  return wishes.map((wish) => ({
    slug: wish.slug,
  }));
}

export default async function WishDetailPage({
  params,
}: WishDetailPageProps) {
  const locale = await getCurrentLocale();
  const t = getMessages(locale);
  const { slug } = await params;
  const detail = await getWishDetailBySlug(slug);

  if (!detail) {
    notFound();
  }

  const { wish, related, submissions, usingDemoData } = detail;
  const writeConfigured = isWishWriteConfigured();
  const editionClosed = isEditionClosed();

  return (
    <div className="page-shell min-h-screen">
      <SiteHeader locale={locale} />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-6 pb-20 pt-10 lg:px-10 lg:pt-14">
        {usingDemoData ? <BackendSetupNotice locale={locale} /> : null}

        <div>
          <Link href="/wishes" className="ghost-link w-fit">
            {t.detail.back}
          </Link>
        </div>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="panel p-6 sm:p-8">
            <p className="eyebrow">{t.detail.eyebrow}</p>
            <h1 className="mt-3 font-serif-display text-4xl leading-tight text-[var(--text-primary)] sm:text-5xl">
              {wish.title}
            </h1>
            <p className="mt-5 max-w-4xl text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              {wish.summary}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="data-chip">
                {formatNumber(wish.count, locale)} {t.detail.submissions}
              </span>
              <span className="data-chip">
                {formatNumber(wish.votes, locale)} {t.detail.votes}
              </span>
              <span className="data-chip">
                {t.detail.thisWeek} +{wish.weeklyGrowth}
              </span>
              <span className="data-chip">
                {t.detail.recent} {formatDate(wish.latestAt, locale)}
              </span>
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <AffirmButton
                initialVotes={wish.votes}
                slug={wish.slug}
                enabled={writeConfigured && !editionClosed}
                editionClosed={editionClosed}
                locale={locale}
              />
              <div className="rounded-full border border-white/[0.12] bg-white/[0.05] px-4 py-3 text-sm text-[var(--text-secondary)]">
                {t.detail.signalScore}{" "}
                <span className="text-[var(--text-primary)]">{wish.signalScore}</span>
              </div>
            </div>

            <div className="mt-8 rounded-[28px] border border-white/[0.1] bg-black/[0.2] p-5 sm:p-6">
              <p className="eyebrow">{t.detail.fullDescription}</p>
              <p className="mt-4 font-serif-display text-2xl leading-relaxed text-[var(--text-primary)]">
                {wish.content}
              </p>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="panel p-6">
              <p className="eyebrow">{t.detail.whyMerged}</p>
              <div className="mt-4 space-y-4">
                {wish.mergeReasons.map((reason) => (
                  <div
                    key={reason}
                    className="rounded-[22px] border border-white/[0.1] bg-white/[0.04] p-4"
                  >
                    <p className="text-sm leading-7 text-[var(--text-secondary)]">
                      {reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel p-6">
              <p className="eyebrow">{t.detail.snapshot}</p>
              <div className="mt-4 grid gap-3">
                <div className="signal-tile">
                  <span>{t.detail.firstSeen}</span>
                  <strong>{formatDate(wish.createdAt, locale)}</strong>
                </div>
                <div className="signal-tile">
                  <span>{t.detail.lastMentioned}</span>
                  <strong>{formatDate(wish.latestAt, locale)}</strong>
                </div>
                <div className="signal-tile">
                  <span>{t.detail.voteRatio}</span>
                  <strong>{Math.round((wish.votes / wish.count) * 10) / 10}:1</strong>
                </div>
              </div>
            </div>
          </aside>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="panel p-6 sm:p-8">
            <p className="eyebrow">{t.detail.originalEyebrow}</p>
            <h2 className="mt-2 font-serif-display text-3xl text-[var(--text-primary)]">
              {t.detail.originalTitle}
            </h2>
            <div className="mt-6 space-y-4">
              {submissions.map((submission) => (
                <div key={submission.id} className="quote-card">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm uppercase tracking-[0.22em] text-white/[0.35]">
                      {submission.who}
                    </p>
                    <MarkButton
                      submissionId={submission.id}
                      wishSlug={wish.slug}
                      enabled={writeConfigured && !editionClosed}
                      editionClosed={editionClosed}
                      locale={locale}
                    />
                  </div>
                  <p className="mt-3 text-lg leading-8 text-[var(--text-primary)]">
                    “{submission.need}”
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="panel p-6">
              <p className="eyebrow">{t.detail.readingEyebrow}</p>
              <h2 className="mt-2 font-serif-display text-3xl text-[var(--text-primary)]">
                {t.detail.readingTitle}
              </h2>
              <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
                {t.detail.readingBody}
              </p>
            </div>

            <div className="panel p-6">
              <p className="eyebrow">{t.detail.relatedEyebrow}</p>
              <div className="mt-4 space-y-4">
                {related.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/wishes/${item.slug}`}
                    className="block rounded-[24px] border border-white/[0.1] bg-white/[0.04] p-4 transition hover:border-[rgba(255,106,61,0.35)] hover:bg-white/[0.08]"
                  >
                    <h3 className="text-lg text-[var(--text-primary)]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                      {item.summary}
                    </p>
                  </Link>
                ))}
                {related.length === 0 ? (
                  <div className="rounded-[24px] border border-white/[0.1] bg-white/[0.04] p-4 text-sm text-[var(--text-secondary)]">
                    {t.detail.relatedEmpty}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter locale={locale} />
    </div>
  );
}
