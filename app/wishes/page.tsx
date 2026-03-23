import { BackendSetupNotice } from "@/components/backend-setup-notice";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WishesExplorer } from "@/components/wishes-explorer";
import { getMessages } from "@/lib/i18n";
import { getCurrentLocale } from "@/lib/i18n-server";
import { listWishClusters } from "@/lib/wishes";

export const dynamic = "force-dynamic";

export default async function WishesPage() {
  const locale = await getCurrentLocale();
  const t = getMessages(locale);
  const { wishes, usingDemoData } = await listWishClusters();

  return (
    <div className="page-shell min-h-screen">
      <SiteHeader locale={locale} />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-6 pb-20 pt-10 lg:px-10 lg:pt-14">
        {usingDemoData ? <BackendSetupNotice locale={locale} /> : null}

        <section className="max-w-4xl space-y-5">
          <p className="eyebrow">{t.ranking.eyebrow}</p>
          <h1 className="font-serif-display text-5xl leading-tight text-[var(--text-primary)] sm:text-6xl">
            {t.ranking.titleLead}
            <span className="text-[var(--accent-soft)]">
              {t.ranking.titleAccent}
            </span>
          </h1>
          <p className="text-lg leading-8 text-[var(--text-secondary)]">
            {t.ranking.intro}
          </p>
        </section>

        <WishesExplorer key={locale} wishes={wishes} locale={locale} />
      </main>
      <SiteFooter locale={locale} />
    </div>
  );
}
