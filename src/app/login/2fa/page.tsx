"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, ArrowRight, Info } from "lucide-react";
import { ShellHead, ShellFoot } from "@/components/portal/Chrome";

const CODE_LENGTH = 6;

function stripToSix(value: string): string {
  return value.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, CODE_LENGTH);
}

export default function TwoFactorPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resentMessage, setResentMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleResend() {
    setResending(true);
    setResentMessage(null);
    try {
      const res = await fetch("/api/auth/2fa/resend", { method: "POST", credentials: "include" });
      if (res.ok) setResentMessage("New code sent.");
    } finally {
      setResending(false);
    }
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
        inputRef.current?.focus();
        return;
      }
      router.push(data.redirect ?? "/dashboard");
      router.refresh();
    } catch {
      setError("Invalid code.");
    } finally {
      setLoading(false);
    }
  }

  const cells = Array.from({ length: CODE_LENGTH }, (_, i) => code[i] ?? "");
  const activeIndex = Math.min(code.length, CODE_LENGTH - 1);

  return (
    <div className="shell">
      <ShellHead
        rightSlot={
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="text-link" style={{ background: "none", border: 0, cursor: "pointer" }}>
              Sign out
            </button>
          </form>
        }
      />

      <div className="center-stage">
        <div className="center-card">
          <div className="cc-icon">
            <Shield size={24} />
          </div>
          <h1 className="cc-h">Verify it&apos;s you</h1>
          <p className="cc-sub">
            We sent a 6-digit code to your email. Enter it below to continue.
          </p>

          <form onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              inputMode="text"
              autoComplete="one-time-code"
              maxLength={CODE_LENGTH}
              value={code}
              onChange={(e) => {
                setCode(stripToSix(e.target.value));
                setError("");
              }}
              onPaste={(e) => {
                e.preventDefault();
                setCode(stripToSix(e.clipboardData.getData("text")));
                setError("");
              }}
              style={{ position: "absolute", opacity: 0, pointerEvents: "none", height: 0, width: 0 }}
              aria-label="Verification code"
            />
            <div
              className="otp-row"
              onClick={() => inputRef.current?.focus()}
              style={{ cursor: "text" }}
            >
              {cells.map((c, i) => (
                <div
                  key={i}
                  className={
                    "otp-cell" +
                    (c ? "" : " empty") +
                    (i === activeIndex && code.length < CODE_LENGTH ? " active" : "")
                  }
                >
                  {c || (i === activeIndex && code.length < CODE_LENGTH ? "|" : "·")}
                </div>
              ))}
            </div>

            <div className="callout">
              <Info size={16} />
              <span>Codes can take up to 2 minutes to arrive. Check your spam folder if it doesn&apos;t appear.</span>
            </div>

            {error && (
              <div className="callout red" style={{ marginTop: 12 }} role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || code.length !== CODE_LENGTH}
              className="btn btn-primary"
              style={{ marginTop: 16 }}
            >
              {loading ? "Verifying…" : "Verify and continue"}
              {!loading && <ArrowRight size={16} />}
            </button>

            <div style={{ textAlign: "center", marginTop: 18, fontSize: 13, color: "var(--ink-500)" }}>
              Didn&apos;t receive a code?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                style={{
                  color: "var(--green)",
                  fontWeight: 600,
                  background: "none",
                  border: 0,
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                {resending ? "Sending…" : "Resend"}
              </button>
              {resentMessage && (
                <span style={{ color: "var(--ink-700)", marginLeft: 8 }}>{resentMessage}</span>
              )}
            </div>

            <div style={{ textAlign: "center", marginTop: 14 }}>
              <Link href="/login" className="text-link">
                ← Back to sign in
              </Link>
            </div>
          </form>
        </div>
      </div>

      <ShellFoot />
    </div>
  );
}
