"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const CODE_LENGTH = 6;

function ResendLink() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  async function handleResend() {
    setLoading(true);
    setSent(false);
    try {
      const res = await fetch("/api/auth/2fa/resend", { method: "POST", credentials: "include" });
      if (res.ok) setSent(true);
    } finally {
      setLoading(false);
    }
  }
  return (
    <span className="text-sm">
      <button
        type="button"
        onClick={handleResend}
        disabled={loading}
        className="text-[#D4A43A] hover:text-[#C4922E] hover:underline font-medium disabled:opacity-50"
      >
        {loading ? "Sending…" : "Resend code"}
      </button>
      {sent && <span className="text-[#171717] ml-2">Code sent.</span>}
    </span>
  );
}

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
      router.push(data.redirect ?? "/dashboard");
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
      <div className="w-full max-w-sm rounded-xl bg-white border border-[#E2DCD2] shadow-lg p-8">
        <div className="flex justify-center mb-4">
          <Image src="/sbmi-logo.png" alt="SBMI" width={96} height={96} className="rounded-full object-contain" unoptimized />
        </div>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px flex-1 min-w-0 bg-[#D4A43A]" />
          <span className="text-xs tracking-[0.2em] text-[#D4A43A] uppercase font-medium shrink-0">
            Two-factor authentication
          </span>
        </div>
        <h1 className="text-2xl font-display font-semibold text-[#171717] text-center mb-2">
          Verification code
        </h1>
        <p className="text-[#3D5A4A] text-sm text-center mb-2">
          A verification code has been sent to your email.
        </p>
        <p className="text-[#3D5A4A] text-sm text-center mb-4">
          Email may take up to two minutes to arrive. Before using Resend, check your spam folder.
        </p>
        <p className="text-center mb-4">
          <ResendLink />
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-[#171717] mb-1">
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
              className="w-full rounded-lg border border-[#E2DCD2] px-4 py-4 text-2xl tracking-[0.4em] font-mono text-center text-[#171717] placeholder:text-[#3D5A4A]/60 focus:border-[#D4A43A] focus:outline-none focus:ring-1 focus:ring-[#D4A43A]/30 sbmi-input"
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
            className="w-full rounded-lg bg-[#D4A43A] hover:bg-[#C4922E] py-3 font-medium text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#D4A43A]/40 disabled:opacity-50 transition-colors shadow-sm"
          >
            {loading ? "Verifying…" : "Verify"}
          </button>
        </form>
      </div>
    </div>
  );
}
