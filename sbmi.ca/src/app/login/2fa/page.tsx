"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CODE_LENGTH = 6;

function stripToSixAlphanumeric(value: string): string {
  const alphanumeric = value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  return alphanumeric.slice(0, CODE_LENGTH);
}

export default function TwoFactorPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = stripToSixAlphanumeric(e.target.value);
    setCode(next);
    setError("");
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = stripToSixAlphanumeric(e.clipboardData.getData("text"));
    setCode(pasted);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (code.length !== CODE_LENGTH) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Invalid code.");
        setCode("");
        if (inputRef.current) inputRef.current.focus();
        window.location.reload();
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Invalid code.");
      window.location.reload();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center sbmi-page-bg p-4">
      <div className="w-full max-w-sm rounded-none bg-white border border-[#E8E4DE] shadow-lg p-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="h-px w-8 bg-[#C9A227]" />
          <span className="text-xs tracking-[0.2em] text-[#C9A227] uppercase font-medium">
            Two-factor authentication
          </span>
          <div className="h-px w-8 bg-[#C9A227]" />
        </div>
        <h1 className="text-2xl font-serif font-light text-[#1B4332] text-center mb-2">
          Verification code
        </h1>
        <p className="text-[#3D5A4C] text-sm text-center mb-6">
          A verification code has been sent to your email.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-[#1B4332] mb-1">
              Code
            </label>
            <input
              ref={inputRef}
              id="code"
              type="text"
              inputMode="text"
              autoComplete="one-time-code"
              maxLength={CODE_LENGTH}
              value={code}
              onChange={handleChange}
              onPaste={handlePaste}
              className="w-full rounded-none border border-[#E8E4DE] px-4 py-4 text-2xl tracking-[0.4em] font-mono text-center text-[#1B4332] placeholder:text-[#3D5A4C]/60 focus:border-[#C9A227] focus:outline-none focus:ring-1 focus:ring-[#C9A227]/30 sbmi-input"
              placeholder="000000"
            />
            {error && (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading || code.length !== CODE_LENGTH}
            className="w-full rounded-none bg-[#C9A227] hover:bg-[#B8922A] py-3 font-medium text-[#1B4332] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/40 disabled:opacity-50 transition-colors"
          >
            {loading ? "Verifying…" : "Verify"}
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
