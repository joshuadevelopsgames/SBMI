"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import ReCAPTCHA from "react-google-recaptcha";
import { Mail, Lock, ArrowRight, Check } from "lucide-react";
import { ShellHead, ShellFoot } from "@/components/portal/Chrome";

const EMAIL_MAX_LENGTH = 50;
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";

function isValidEmail(value: string): boolean {
  if (!value.trim()) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [mounted, setMounted] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEmailError(null);
    setSubmitError("");
    if (email.length > EMAIL_MAX_LENGTH || !isValidEmail(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    const recaptchaToken = RECAPTCHA_SITE_KEY ? recaptchaRef.current?.getValue() ?? undefined : undefined;
    if (RECAPTCHA_SITE_KEY && !recaptchaToken) {
      setSubmitError("Please complete the reCAPTCHA check.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          ...(RECAPTCHA_SITE_KEY ? { recaptchaToken } : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok && typeof data.error === "string") {
        setSubmitError(data.error);
        recaptchaRef.current?.reset();
        return;
      }
      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="shell">
      <ShellHead
        rightSlot={
          <Link href="/login" className="text-link">
            ← Back to sign in
          </Link>
        }
      />

      <div className="center-stage">
        <div className="center-card">
          <div className="cc-icon">
            <Lock size={24} />
          </div>
          <h1 className="cc-h">{sent ? "Check your email" : "Reset your password"}</h1>
          <p className="cc-sub">
            {sent
              ? `If an account exists with ${email}, we've sent a secure reset link. Delivery may take a few minutes — check your spam folder.`
              : "Enter the email on file and we'll send you a secure link to choose a new password."}
          </p>

          {!sent ? (
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label className="label">Email address</label>
                <div className="input-wrap">
                  <Mail size={16} className="input-icon" />
                  <input
                    type="email"
                    autoComplete="email"
                    className="input with-icon"
                    maxLength={EMAIL_MAX_LENGTH}
                    value={email}
                    onChange={(e) => setEmail(e.target.value.slice(0, EMAIL_MAX_LENGTH))}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                {emailError ? (
                  <div className="field-status" role="alert">
                    {emailError}
                  </div>
                ) : null}
              </div>

              {mounted && RECAPTCHA_SITE_KEY ? (
                <div style={{ marginBottom: 18, display: "flex", justifyContent: "center" }}>
                  <ReCAPTCHA ref={recaptchaRef} sitekey={RECAPTCHA_SITE_KEY} />
                </div>
              ) : null}

              {!RECAPTCHA_SITE_KEY ? (
                <p style={{ fontSize: 12, color: "var(--ink-400)", marginBottom: 16, textAlign: "center" }}>
                  Development: add NEXT_PUBLIC_RECAPTCHA_SITE_KEY and RECAPTCHA_SECRET_KEY (production requires them).
                </p>
              ) : null}

              {submitError ? (
                <div className="field-status" role="alert" style={{ marginBottom: 14 }}>
                  {submitError}
                </div>
              ) : null}

              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? "Sending…" : "Send reset link"}
                {!loading && <ArrowRight size={16} />}
              </button>
              <p style={{ fontSize: 12, color: "var(--ink-400)", textAlign: "center", marginTop: 14, lineHeight: 1.5 }}>
                For your security, we send the same confirmation message whether or not the email is registered.
              </p>
            </form>
          ) : (
            <>
              <div className="callout green">
                <Check size={16} />
                <span>Email sent. Don&apos;t see it? Check your spam folder — delivery can take up to 2 minutes.</span>
              </div>
              <button
                type="button"
                className="btn btn-ghost"
                style={{ width: "100%", marginTop: 14 }}
                onClick={() => {
                  setSent(false);
                  setEmail("");
                  recaptchaRef.current?.reset();
                }}
              >
                Send to a different email
              </button>
              <p style={{ textAlign: "center", marginTop: 14 }}>
                <Link href="/login" className="text-link">
                  Back to sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>

      <ShellFoot />
    </div>
  );
}
