import { NextResponse } from "next/server";
import { z } from "zod";

import { localeCookieName, normalizeLocale } from "@/lib/i18n";

export const runtime = "nodejs";

const languageSchema = z.object({
  locale: z.string().min(2).max(5),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = languageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid locale payload." },
        { status: 400 }
      );
    }

    const locale = normalizeLocale(parsed.data.locale);
    const response = NextResponse.json({ ok: true, locale });

    response.cookies.set(localeCookieName, locale, {
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Failed to update language preference." },
      { status: 500 }
    );
  }
}

