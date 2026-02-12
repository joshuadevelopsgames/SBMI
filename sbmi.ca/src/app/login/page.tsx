"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";

const EMAIL_MAX_LENGTH = 50;
const GENERIC_LOGIN_ERROR = "Invalid email or password";

function isValidEmail(value: string): boolean {
  if (!value.trim()) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(value.trim());
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/dashboard";
  const reason = searchParams.get("reason");
  const reasonMessage =
    reason === "password_changed"
      ? "Your password was changed. Please sign in with your new password."
      : reason === "email_changed"
        ? "Your email was updated. Please sign in with your new email."
        : null;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [stayLoggedIn, setStayLoggedIn] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<"member" | "admin" | null>(null);
  const [demoError, setDemoError] = useState<string | null>(null);

  async function handleDemoLogin(role: "MEMBER" | "ADMIN") {
    setDemoError(null);
    setDemoLoading(role.toLowerCase() as "member" | "admin");
    try {
      const res = await fetch("/api/auth/demo-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setDemoError(data.error ?? "Demo login failed");
        return;
      }
      router.push(data.redirect ?? from);
      router.refresh();
    } catch {
      setDemoError("Demo login failed");
    } finally {
      setDemoLoading(null);
    }
  }

  function handleEmailBlur() {
    if (!email) {
      setEmailError(null);
      return;
    }
    if (email.length > EMAIL_MAX_LENGTH) {
      setEmailError(`Email must be at most ${EMAIL_MAX_LENGTH} characters.`);
      return;
    }
    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setEmailError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");
    setEmailError(null);

    if (email.length > EMAIL_MAX_LENGTH) {
      setEmailError(`Email must be at most ${EMAIL_MAX_LENGTH} characters.`);
      return;
    }
    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          stayLoggedIn,
        }),
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSubmitError(data.error ?? GENERIC_LOGIN_ERROR);
        return;
      }
      router.push(data.redirect ?? from);
      router.refresh();
    } catch {
      setSubmitError(GENERIC_LOGIN_ERROR);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center sbmi-page-bg p-4">
      <Link
        href="/"
        className="absolute left-4 top-4 flex items-center gap-1.5 text-[#3D5A4A] hover:text-[#171717] text-sm font-medium transition-colors"
      >
        <span aria-hidden>←</span> Back to home
      </Link>
      <div className="w-full max-w-sm rounded-xl bg-white border border-[#E2DCD2] shadow-lg p-8">
        <div className="flex justify-center mb-4">
          <Image
            src="/sbmi-logo.png"
            alt="SBMI"
            width={96}
            height={96}
            className="rounded-full object-contain"
            unoptimized
          />
        </div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="h-px w-8 bg-[#D4A43A]" />
          <span className="text-xs tracking-[0.2em] text-[#D4A43A] uppercase font-medium">
            Member Portal
          </span>
          <div className="h-px w-8 bg-[#D4A43A]" />
        </div>
        <h1 className="text-2xl font-display font-semibold text-[#171717] text-center mb-1">
          Samuel Bete Iddir
        </h1>
        <p className="text-[#3D5A4A] text-sm text-center mb-6">
          Sign in to your account
        </p>
        {reasonMessage && (
          <p className="text-sm text-[#171717] bg-[#D4A43A]/10 border border-[#D4A43A]/30 px-3 py-2 mb-4 text-center" role="status">
            {reasonMessage}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[#171717] mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              maxLength={EMAIL_MAX_LENGTH}
              value={email}
              onChange={(e) => setEmail(e.target.value.slice(0, EMAIL_MAX_LENGTH))}
              onBlur={handleEmailBlur}
              className="w-full rounded-lg border border-[#E2DCD2] px-3 py-2.5 text-[#171717] placeholder:text-[#3D5A4A]/60 focus:border-[#D4A43A] focus:outline-none focus:ring-1 focus:ring-[#D4A43A]/30 sbmi-input"
              placeholder="you@example.com"
            />
            {emailError && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {emailError}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[#171717] mb-1"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-[#E2DCD2] px-3 py-2.5 pr-10 text-[#171717] placeholder:text-[#3D5A4A]/60 focus:border-[#D4A43A] focus:outline-none focus:ring-1 focus:ring-[#D4A43A]/30 sbmi-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#3D5A4A]/70 hover:text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#D4A43A]/30 rounded"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="stay-logged-in"
              type="checkbox"
              checked={stayLoggedIn}
              onChange={(e) => setStayLoggedIn(e.target.checked)}
              className="rounded border-[#E2DCD2] text-[#D4A43A] focus:ring-[#D4A43A]/30"
            />
            <label htmlFor="stay-logged-in" className="text-sm text-[#171717]">
              Stay logged in
            </label>
          </div>
          {submitError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2" role="alert">
              {submitError}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#D4A43A] hover:bg-[#C4922E] py-3 font-medium text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#D4A43A]/40 disabled:opacity-50 transition-colors shadow-sm"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-4 text-center">
          <Link
            href="/login/forgot-password"
            className="text-sm text-[#D4A43A] hover:text-[#C4922E] hover:underline"
          >
            Forgot password?
          </Link>
        </p>

        <div className="mt-6 pt-6 border-t border-[#E2DCD2]">
          <p className="text-xs text-[#3D5A4A]/70 uppercase tracking-wider font-medium mb-2">
            Demo mode
          </p>
          {demoError && (
            <p className="text-sm text-red-600 mb-2" role="alert">
              {demoError}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin("MEMBER")}
              disabled={!!demoLoading}
              className="flex-1 rounded-lg border border-[#1B5E3B] text-[#1B5E3B] py-2 text-sm font-medium hover:bg-[#1B5E3B]/10 disabled:opacity-50 transition-colors"
            >
              {demoLoading === "member" ? "…" : "Enter as member"}
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin("ADMIN")}
              disabled={!!demoLoading}
              className="flex-1 rounded-lg border border-[#1B5E3B] text-[#1B5E3B] py-2 text-sm font-medium hover:bg-[#1B5E3B]/10 disabled:opacity-50 transition-colors"
            >
              {demoLoading === "admin" ? "…" : "Enter as admin"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center sbmi-page-bg">
          <div className="w-8 h-8 border-2 border-[#E2DCD2] border-t-[#D4A43A] rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
