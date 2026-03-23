import type { Metadata } from "next";
import { Noto_Sans_SC, Noto_Serif_SC } from "next/font/google";

import { getSiteUrl } from "@/lib/env";
import { getCurrentLocale } from "@/lib/i18n-server";
import { getMessages } from "@/lib/i18n";

import "./globals.css";

const notoSans = Noto_Sans_SC({
  variable: "--font-noto-sans-sc",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const notoSerif = Noto_Serif_SC({
  variable: "--font-noto-serif-sc",
  subsets: ["latin"],
  weight: ["500", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getCurrentLocale();
  const t = getMessages(locale);

  return {
    title: t.meta.title,
    description: t.meta.description,
    metadataBase: new URL(getSiteUrl()),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getCurrentLocale();

  return (
    <html
      lang={locale === "zh" ? "zh-CN" : "en"}
      className={`${notoSans.variable} ${notoSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
