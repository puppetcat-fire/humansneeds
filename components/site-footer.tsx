import { getMessages, type Locale } from "@/lib/i18n";

type SiteFooterProps = {
  locale: Locale;
};

export function SiteFooter({ locale }: SiteFooterProps) {
  const t = getMessages(locale);

  return (
    <footer className="border-t border-white/[0.1]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-[var(--text-secondary)] lg:flex-row lg:items-center lg:justify-between lg:px-10">
        <p>{t.footer.line1}</p>
        <p className="text-white/[0.45]">{t.footer.line2}</p>
      </div>
    </footer>
  );
}

