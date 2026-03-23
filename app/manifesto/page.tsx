import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCurrentLocale } from "@/lib/i18n-server";
import { getManifestoCopy } from "@/lib/manifesto-copy";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getCurrentLocale();
  const copy = getManifestoCopy(locale);

  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
  };
}

export default async function ManifestoPage() {
  const locale = await getCurrentLocale();
  const copy = getManifestoCopy(locale);

  return (
    <div className="page-shell min-h-screen">
      <SiteHeader locale={locale} />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-6 pb-20 pt-10 lg:px-10 lg:pt-14">
        <section className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
          <div className="panel p-7 sm:p-9">
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1 className="mt-4 max-w-5xl font-serif-display text-5xl leading-[1.06] text-[var(--text-primary)] sm:text-6xl lg:text-7xl">
              {copy.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--text-secondary)] sm:text-xl">
              {copy.intro}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/" className="action-button inline-flex w-fit">
                {copy.primaryAction}
              </Link>
              <Link href="/wishes" className="ghost-link w-fit">
                {copy.secondaryAction}
              </Link>
            </div>
          </div>

          <aside className="panel border-[rgba(255,106,61,0.22)] bg-[linear-gradient(180deg,rgba(255,106,61,0.08),rgba(255,255,255,0.02)),var(--background-elevated)] p-7 sm:p-9">
            <p className="eyebrow">{copy.triggerEyebrow}</p>
            <h2 className="mt-4 font-serif-display text-3xl leading-tight text-[var(--text-primary)] sm:text-4xl">
              {copy.triggerTitle}
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--text-primary)]/92 sm:text-lg">
              {copy.triggerBody}
            </p>
            <div className="mt-7 rounded-[28px] border border-[rgba(255,191,155,0.2)] bg-black/[0.22] p-5">
              <p className="text-sm leading-7 text-[var(--accent-soft)]">
                {copy.triggerNote}
              </p>
            </div>
          </aside>
        </section>

        <section className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
          {copy.cards.map((card) => (
            <article key={card.title} className="panel p-6">
              <p className="eyebrow">{card.eyebrow}</p>
              <h2 className="mt-4 font-serif-display text-2xl leading-tight text-[var(--text-primary)]">
                {card.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
                {card.body}
              </p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <article className="panel p-7 sm:p-8">
            <p className="eyebrow">{copy.noPromiseEyebrow}</p>
            <h2 className="mt-3 font-serif-display text-3xl leading-tight text-[var(--text-primary)] sm:text-4xl">
              {copy.noPromiseTitle}
            </h2>
            <p className="mt-5 text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
              {copy.noPromiseBody}
            </p>
            <div className="mt-6 grid gap-3">
              {copy.noPromiseList.map((item) => (
                <div
                  key={item}
                  className="rounded-[24px] border border-white/[0.1] bg-white/[0.04] px-5 py-4 text-sm leading-7 text-[var(--text-primary)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </article>

          <article className="panel p-7 sm:p-8">
            <p className="eyebrow">{copy.emergenceEyebrow}</p>
            <h2 className="mt-3 font-serif-display text-3xl leading-tight text-[var(--text-primary)] sm:text-4xl">
              {copy.emergenceTitle}
            </h2>
            <p className="mt-5 text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
              {copy.emergenceBody}
            </p>
            <div className="mt-6 grid gap-3">
              {copy.emergenceList.map((item) => (
                <div
                  key={item}
                  className="rounded-[24px] border border-[rgba(255,191,155,0.18)] bg-[rgba(255,106,61,0.06)] px-5 py-4 text-sm leading-7 text-[var(--text-primary)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="panel border-[rgba(255,191,155,0.18)] bg-[linear-gradient(180deg,rgba(255,106,61,0.05),rgba(255,255,255,0.02)),var(--background-elevated)] p-7 sm:p-9">
          <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
            <div>
              <p className="eyebrow">{copy.disclaimerEyebrow}</p>
              <h2 className="mt-4 max-w-3xl font-serif-display text-3xl leading-tight text-[var(--text-primary)] sm:text-4xl">
                {copy.disclaimerTitle}
              </h2>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
                {copy.disclaimerBody}
              </p>
            </div>

            <div className="grid gap-3">
              {copy.disclaimerList.map((item) => (
                <div
                  key={item}
                  className="rounded-[24px] border border-white/[0.1] bg-black/[0.22] px-5 py-4 text-sm leading-7 text-[var(--text-primary)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="panel p-7 sm:p-9">
          <div className="grid gap-6 lg:grid-cols-[1.12fr_0.88fr] lg:items-end">
            <div>
              <p className="eyebrow">{copy.closingEyebrow}</p>
              <h2 className="mt-4 max-w-4xl font-serif-display text-4xl leading-tight text-[var(--text-primary)] sm:text-5xl">
                {copy.closingTitle}
              </h2>
            </div>
            <p className="text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
              {copy.closingBody}
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/" className="action-button inline-flex w-fit">
              {copy.primaryAction}
            </Link>
            <Link href="/wishes" className="ghost-link w-fit">
              {copy.secondaryAction}
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter locale={locale} />
    </div>
  );
}
