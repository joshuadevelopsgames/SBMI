"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

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
        <div className="w-full max-w-sm rounded-xl bg-white border border-[#E2DCD2] shadow-lg p-8">
          <div className="flex justify-center mb-4">
            <Image src="/sbmi-logo.png" alt="SBMI" width={96} height={96} className="rounded-full object-contain" unoptimized />
          </div>
          <h1 className="text-xl font-display font-semibold text-[#171717] text-center mb-4">
            Check your email
          </h1>
          <p className="text-[#3D5A4A] text-sm text-center mb-6">
            {SUCCESS_MESSAGE}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center sbmi-page-bg p-4">
      <div className="w-full max-w-sm rounded-xl bg-white border border-[#E2DCD2] shadow-lg p-8">
        <div className="flex justify-center mb-4">
          <Image src="/sbmi-logo.png" alt="SBMI" width={96} height={96} className="rounded-full object-contain" unoptimized />
        </div>
        <h1 className="text-xl font-display font-semibold text-[#171717] text-center mb-2">
          Forgot password
        </h1>
        <p className="text-[#3D5A4A] text-sm text-center mb-6">
          Enter your email address and we will send you a link to reset your password.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#171717] mb-1">
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
              className="w-full rounded-lg border border-[#E2DCD2] px-3 py-2.5 text-[#171717] placeholder:text-[#3D5A4A]/60 focus:border-[#D4A43A] focus:outline-none focus:ring-1 focus:ring-[#D4A43A]/30 sbmi-input"
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
            className="w-full rounded-lg bg-[#D4A43A] hover:bg-[#C4922E] py-3 font-medium text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#D4A43A]/40 disabled:opacity-50 transition-colors shadow-sm"
          >
            {loading ? "Sending…" : "Send reset link"}
          </button>
        </form>
      </div>
    </div>
  );
}
