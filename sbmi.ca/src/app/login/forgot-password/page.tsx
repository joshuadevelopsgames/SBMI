"use client";

import { useState } from "react";
import Link from "next/link";

const EMAIL_MAX_LENGTH = 50;
const SUCCESS_MESSAGE =
  "If an account exists with that email address, you will receive password reset instructions shortly. Email delivery may take a few minutes; please check your spam folder if you do not see it.";

function isValidEmail(value: string): boolean {
  if (!value.trim()) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

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
    setEmailError(null);
    if (email.length > EMAIL_MAX_LENGTH || !isValidEmail(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center sbmi-page-bg p-4">
        <div className="w-full max-w-sm rounded-none bg-white border border-[#E8E4DE] shadow-lg p-8">
          <h1 className="text-xl font-serif font-light text-[#1B4332] text-center mb-4">
            Check your email
          </h1>
          <p className="text-[#3D5A4C] text-sm text-center mb-6">
            {SUCCESS_MESSAGE}
          </p>
          <p className="text-center">
            <Link
              href="/login"
              className="text-sm text-[#C9A227] hover:text-[#B8922A] hover:underline"
            >
              ← Back to login
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center sbmi-page-bg p-4">
      <div className="w-full max-w-sm rounded-none bg-white border border-[#E8E4DE] shadow-lg p-8">
        <h1 className="text-xl font-serif font-light text-[#1B4332] text-center mb-2">
          Forgot password
        </h1>
        <p className="text-[#3D5A4C] text-sm text-center mb-6">
          Enter your email address and we will send you a link to reset your password.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#1B4332] mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              maxLength={EMAIL_MAX_LENGTH}
              value={email}
              onChange={(e) => setEmail(e.target.value.slice(0, EMAIL_MAX_LENGTH))}
              onBlur={handleEmailBlur}
              className="w-full rounded-none border border-[#E8E4DE] px-3 py-2.5 text-[#1B4332] placeholder:text-[#3D5A4C]/60 focus:border-[#C9A227] focus:outline-none focus:ring-1 focus:ring-[#C9A227]/30 sbmi-input"
              placeholder="you@example.com"
            />
            {emailError && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {emailError}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-none bg-[#C9A227] hover:bg-[#B8922A] py-3 font-medium text-[#1B4332] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/40 disabled:opacity-50 transition-colors"
          >
            {loading ? "Sending…" : "Send reset link"}
          </button>
        </form>
        <p className="mt-4 text-center">
          <Link
            href="/login"
            className="text-sm text-[#C9A227] hover:text-[#B8922A] hover:underline"
          >
            ← Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
