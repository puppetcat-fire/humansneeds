import Link from "next/link";

import { getCurrentViewer } from "@/lib/auth";
import { getAuthCopy } from "@/lib/auth-copy";
import { EditionCountdown } from "@/components/edition-countdown";
import { LanguageToggle } from "@/components/language-toggle";
import { getEditionEndAt, getEditionStartAt } from "@/lib/edition";
import { isAuthUiEnabled } from "@/lib/env";
import { getMessages, type Locale } from "@/lib/i18n";
import { getManifestoCopy } from "@/lib/manifesto-copy";

type SiteHeaderProps = {
  locale: Locale;
};

function compactEmail(email: string | null) {
  if (!email) {
    return null;
  }

  if (email.length <= 22) {
    return email;
  }

  return `${email.slice(0, 10)}...${email.slice(-9)}`;
}

export async function SiteHeader({ locale }: SiteHeaderProps) {
  const t = getMessages(locale);
  const auth = getAuthCopy(locale);
  const manifesto = getManifestoCopy(locale);
  const authUiEnabled = isAuthUiEnabled();
  const viewer = authUiEnabled ? await getCurrentViewer() : null;
  const editionStartAt = getEditionStartAt().toISOString();
  const editionEndAt = getEditionEndAt().toISOString();
  const navItems = [
    { href: "/", label: t.header.home },
    { href: "/wishes", label: t.header.ranking },
    { href: "/manifesto", label: manifesto.navLabel },
    { href: "/#method", label: t.header.method },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.1] bg-black/[0.25] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-6 py-5 lg:px-10">
        <Link href="/" className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.15] bg-white/[0.06] text-sm tracking-[0.35em] text-[var(--accent-soft)]">
            INT
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.36em] text-white/[0.45]">
              Human Demand Atlas
            </p>
            <p className="font-serif-display text-xl text-[var(--text-primary)]">
              INeedThis
            </p>
          </div>
        </Link>

        <div className="flex items-center justify-end gap-3">
          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm text-[var(--text-secondary)] transition hover:bg-white/[0.06] hover:text-[var(--text-primary)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {authUiEnabled ? (
            <Link
              href={viewer ? "/account" : "/auth"}
              className="rounded-full border border-white/[0.1] bg-white/[0.05] px-4 py-2 text-sm text-[var(--text-primary)] transition hover:bg-white/[0.1]"
            >
              {viewer
                ? compactEmail(viewer.email) ?? auth.headerAccount
                : auth.headerLogin}
            </Link>
          ) : null}

          <LanguageToggle locale={locale} />
        </div>
      </div>

      <EditionCountdown
        locale={locale}
        startAt={editionStartAt}
        endAt={editionEndAt}
      />
    </header>
  );
}
