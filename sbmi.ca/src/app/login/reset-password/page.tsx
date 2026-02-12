"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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
      setTimeout(() => router.push("/login?reason=password_changed"), 2000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center sbmi-page-bg p-4">
        <div className="w-full max-w-sm rounded-xl bg-white border border-[#E2DCD2] shadow-lg p-8">
          <div className="flex justify-center mb-4">
            <Image src="/sbmi-logo.png" alt="SBMI" width={96} height={96} className="rounded-full object-contain" unoptimized />
          </div>
          <p className="text-[#3D5A4A] text-sm text-center mb-4">
            Invalid or missing reset link.
          </p>
          <Link href="/login" className="block text-center text-sm text-[#D4A43A] hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center sbmi-page-bg p-4">
        <div className="w-full max-w-sm rounded-xl bg-white border border-[#E2DCD2] shadow-lg p-8">
          <div className="flex justify-center mb-4">
            <Image src="/sbmi-logo.png" alt="SBMI" width={96} height={96} className="rounded-full object-contain" unoptimized />
          </div>
          <p className="text-[#171717] text-center mb-4">
            Your password has been reset. Redirecting to login…
          </p>
          <Link href="/login" className="block text-center text-sm text-[#D4A43A] hover:underline">
            Go to login
          </Link>
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
        <h1 className="text-xl font-display font-semibold text-[#171717] text-center mb-6">
          Set new password
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#171717] mb-1">
              New password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-[#E2DCD2] px-3 py-2.5 pr-10 text-[#171717] sbmi-input focus:border-[#D4A43A] focus:outline-none focus:ring-1 focus:ring-[#D4A43A]/30"
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
          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-[#171717] mb-1">
              Confirm password
            </label>
            <div className="relative">
              <input
                id="confirm"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className="w-full rounded-lg border border-[#E2DCD2] px-3 py-2.5 pr-10 text-[#171717] sbmi-input focus:border-[#D4A43A] focus:outline-none focus:ring-1 focus:ring-[#D4A43A]/30"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#3D5A4A]/70 hover:text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#D4A43A]/30 rounded"
                aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#D4A43A] hover:bg-[#C4922E] py-3 font-medium text-[#171717] disabled:opacity-50 shadow-sm transition-colors"
          >
            {loading ? "Saving…" : "Reset password"}
          </button>
        </form>
      </div>
    </div>
  );
}
