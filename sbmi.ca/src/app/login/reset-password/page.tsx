"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen sbmi-page-bg flex items-center justify-center">Loading…</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "This link is invalid or has expired.");
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center sbmi-page-bg p-4">
        <div className="w-full max-w-sm rounded-none bg-white border border-[#E8E4DE] shadow-lg p-8">
          <p className="text-[#3D5A4C] text-sm text-center mb-4">
            Invalid or missing reset link.
          </p>
          <Link href="/login" className="block text-center text-sm text-[#C9A227] hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center sbmi-page-bg p-4">
        <div className="w-full max-w-sm rounded-none bg-white border border-[#E8E4DE] shadow-lg p-8">
          <p className="text-[#1B4332] text-center mb-4">
            Your password has been reset. Redirecting to login…
          </p>
          <Link href="/login" className="block text-center text-sm text-[#C9A227] hover:underline">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center sbmi-page-bg p-4">
      <div className="w-full max-w-sm rounded-none bg-white border border-[#E8E4DE] shadow-lg p-8">
        <h1 className="text-xl font-serif font-light text-[#1B4332] text-center mb-6">
          Set new password
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#1B4332] mb-1">
              New password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-none border border-[#E8E4DE] px-3 py-2.5 text-[#1B4332] sbmi-input focus:border-[#C9A227] focus:outline-none focus:ring-1 focus:ring-[#C9A227]/30"
            />
          </div>
          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-[#1B4332] mb-1">
              Confirm password
            </label>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="w-full rounded-none border border-[#E8E4DE] px-3 py-2.5 text-[#1B4332] sbmi-input focus:border-[#C9A227] focus:outline-none focus:ring-1 focus:ring-[#C9A227]/30"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-none bg-[#C9A227] hover:bg-[#B8922A] py-3 font-medium text-[#1B4332] disabled:opacity-50"
          >
            {loading ? "Saving…" : "Reset password"}
          </button>
        </form>
        <p className="mt-4 text-center">
          <Link href="/login" className="text-sm text-[#C9A227] hover:underline">
            ← Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
