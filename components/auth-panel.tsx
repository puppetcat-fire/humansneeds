"use client";

import { useState, type FormEvent } from "react";

import { useRouter } from "next/navigation";

import { getAuthCopy } from "@/lib/auth-copy";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { Locale } from "@/lib/i18n";

type AuthMode = "login" | "signup";

type AuthPanelProps = {
  locale: Locale;
  authConfigured: boolean;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function AuthPanel({ locale, authConfigured }: AuthPanelProps) {
  const copy = getAuthCopy(locale);
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!authConfigured) {
      setErrorMessage(copy.authSetupBody);
      setStatusMessage("");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      setErrorMessage(copy.invalidEmail);
      setStatusMessage("");
      return;
    }

    if (password.trim().length < 8) {
      setErrorMessage(copy.shortPassword);
      setStatusMessage("");
      return;
    }

    setIsPending(true);
    setErrorMessage("");
    setStatusMessage("");

    try {
      const supabase = createBrowserSupabaseClient();

      if (mode === "signup") {
        const emailRedirectTo =
          typeof window === "undefined"
            ? undefined
            : new URL("/auth/confirm?next=/account", window.location.origin).toString();

        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: emailRedirectTo ? { emailRedirectTo } : undefined,
        });

        if (error) {
          throw new Error(error.message || copy.signupFailed);
        }

        if (data.session) {
          setStatusMessage(copy.signupDirectSuccess);
          router.push("/account");
          router.refresh();
          return;
        }

        setStatusMessage(copy.signupCheckInbox);
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        throw new Error(error.message || copy.loginFailed);
      }

      router.push("/account");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : mode === "signup"
            ? copy.signupFailed
            : copy.loginFailed
      );
    } finally {
      setIsPending(false);
    }
  }

  const primaryAction =
    mode === "signup"
      ? isPending
        ? copy.pendingSignup
        : copy.signupButton
      : isPending
        ? copy.pendingLogin
        : copy.loginButton;

  return (
    <div className="panel relative overflow-hidden p-6 sm:p-7">
      <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,106,61,0.8)] to-transparent" />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`rounded-full px-4 py-2 text-sm transition ${
            mode === "login"
              ? "border border-[rgba(255,106,61,0.35)] bg-[rgba(255,106,61,0.14)] text-[var(--text-primary)]"
              : "border border-white/[0.08] bg-white/[0.04] text-[var(--text-secondary)] hover:bg-white/[0.08]"
          }`}
        >
          {copy.loginTab}
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`rounded-full px-4 py-2 text-sm transition ${
            mode === "signup"
              ? "border border-[rgba(255,106,61,0.35)] bg-[rgba(255,106,61,0.14)] text-[var(--text-primary)]"
              : "border border-white/[0.08] bg-white/[0.04] text-[var(--text-secondary)] hover:bg-white/[0.08]"
          }`}
        >
          {copy.signupTab}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-3 block text-sm text-[var(--text-primary)]">
            {copy.emailLabel}
          </span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={copy.emailPlaceholder}
            disabled={isPending || !authConfigured}
            className="w-full rounded-[24px] border border-white/[0.12] bg-black/[0.25] px-5 py-4 text-base text-[var(--text-primary)] outline-none transition placeholder:text-white/[0.28] focus:border-[rgba(255,106,61,0.7)] disabled:cursor-not-allowed disabled:opacity-60"
          />
        </label>

        <label className="block">
          <span className="mb-3 block text-sm text-[var(--text-primary)]">
            {copy.passwordLabel}
          </span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={copy.passwordPlaceholder}
            disabled={isPending || !authConfigured}
            className="w-full rounded-[24px] border border-white/[0.12] bg-black/[0.25] px-5 py-4 text-base text-[var(--text-primary)] outline-none transition placeholder:text-white/[0.28] focus:border-[rgba(255,106,61,0.7)] disabled:cursor-not-allowed disabled:opacity-60"
          />
        </label>

        <p className="text-sm leading-6 text-[var(--text-secondary)]">
          {copy.helper}
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="submit"
            disabled={isPending || !authConfigured}
            className="action-button disabled:cursor-not-allowed disabled:opacity-60"
          >
            {primaryAction}
          </button>

          <button
            type="button"
            onClick={() =>
              setMode((current) => (current === "login" ? "signup" : "login"))
            }
            className="text-sm text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
          >
            {mode === "login" ? copy.switchToSignup : copy.switchToLogin}
          </button>
        </div>

        {statusMessage ? (
          <p className="rounded-[20px] border border-emerald-400/20 bg-emerald-400/8 px-4 py-3 text-sm leading-6 text-emerald-200">
            {statusMessage}
          </p>
        ) : null}

        {errorMessage ? (
          <p className="rounded-[20px] border border-[rgba(255,106,61,0.25)] bg-[rgba(255,106,61,0.08)] px-4 py-3 text-sm leading-6 text-[var(--accent-soft)]">
            {errorMessage}
          </p>
        ) : null}
      </form>
    </div>
  );
}
