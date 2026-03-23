import { getMessages, type Locale } from "@/lib/i18n";

type BackendSetupNoticeProps = {
  locale: Locale;
};

export function BackendSetupNotice({ locale }: BackendSetupNoticeProps) {
  const t = getMessages(locale);
  const anonymousReminder =
    locale === "zh"
      ? "当前版本不开放登录。匿名提交仍然是主路径；这里只是说明站点暂时回退到了示例数据。"
      : "Login is intentionally disabled in this version. Anonymous submission remains the primary path; this notice only means the site has temporarily fallen back to example data.";

  return (
    <div className="panel border-[rgba(255,106,61,0.25)] bg-[rgba(255,106,61,0.06)] p-5">
      <p className="eyebrow">{t.notice.eyebrow}</p>
      <h2 className="mt-2 text-lg text-[var(--text-primary)]">
        {t.notice.title}
      </h2>
      <p className="mt-2 text-sm leading-7 text-[var(--text-primary)]">
        {anonymousReminder}
      </p>
      <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
        {t.notice.body}
      </p>
      <p className="mt-3 text-xs leading-6 text-white/[0.42]">
        {t.notice.detail}
      </p>
    </div>
  );
}
