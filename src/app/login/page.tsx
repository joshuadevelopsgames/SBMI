"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, Check, ArrowRight, Shield } from "lucide-react";
import { LoginNarrative } from "@/components/portal/LoginNarrative";

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
  const [showPwd, setShowPwd] = useState(false);
  const [keepLogged, setKeepLogged] = useState(true);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<"member" | "admin" | null>(null);
  const [demoError, setDemoError] = useState<string | null>(null);

  async function handleDemoLogin(role: "MEMBER" | "ADMIN") {
    setDemoError(null);
    setDemoLoading(role.toLowerCase() as "member" | "admin");
    const demoEmail = role === "ADMIN" ? "admin@sbmi.ca" : "demo@sbmi.ca";
    const demoPassword = role === "ADMIN" ? "admin123" : "demo123";
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: demoEmail, password: demoPassword, stayLoggedIn: false }),
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
          stayLoggedIn: keepLogged,
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
    <div className="login-stage">
      <LoginNarrative variant="login" />

      <div className="login-panel">
        <div className="login-card">
          <div className="login-card-head">
            <div className="login-card-eyebrow">Member Sign-in</div>
            <h2 className="login-card-title">Welcome back</h2>
            <p className="login-card-sub">
              Enter your details to access your household, payments, and assistance requests.
            </p>
          </div>

          {reasonMessage && (
            <div className="callout green" style={{ marginBottom: 14 }} role="status">
              <Check size={16} />
              <span>{reasonMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label className="label" htmlFor="email">Email address</label>
              <div className="input-wrap">
                <Mail size={16} className="input-icon" />
                <input
                  id="email"
                  type="email"
                  className="input with-icon"
                  autoComplete="username"
                  maxLength={EMAIL_MAX_LENGTH}
                  value={email}
                  onChange={(e) => setEmail(e.target.value.slice(0, EMAIL_MAX_LENGTH))}
                  onBlur={() => {
                    if (!email) return setEmailError(null);
                    if (!isValidEmail(email)) setEmailError("Please enter a valid email address.");
                    else setEmailError(null);
                  }}
                  placeholder="you@example.com"
                />
              </div>
              {emailError ? (
                <div className="field-status" role="alert">
                  {emailError}
                </div>
              ) : (
                <div className="field-hint">We&apos;ll never share your email.</div>
              )}
            </div>

            <div className="field">
              <div className="field-row">
                <label className="label" htmlFor="pwd">Password</label>
                <Link href="/login/forgot-password" className="label-link">Forgot password?</Link>
              </div>
              <div className="input-wrap">
                <Lock size={16} className="input-icon" />
                <input
                  id="pwd"
                  type={showPwd ? "text" : "password"}
                  className="input with-icon"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  className="input-trail"
                  onClick={() => setShowPwd((s) => !s)}
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <label className="checkbox-row" onClick={() => setKeepLogged((k) => !k)}>
              <span className={"cbox" + (keepLogged ? " checked" : "")}>
                {keepLogged && <Check size={11} strokeWidth={3} color="white" />}
              </span>
              Keep me signed in on this device
            </label>

            {submitError && (
              <div className="callout red" style={{ marginBottom: 14 }} role="alert">
                {submitError}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? "Signing in…" : "Sign in to portal"}
              {!loading && <ArrowRight size={16} />}
            </button>

            <div className="security-note">
              <Shield size={15} />
              <span>
                Protected by 2-step verification. We&apos;ll email you a 6-digit code after sign-in to confirm
                it&apos;s really you.
              </span>
            </div>

            <div className="signup-line">
              Don&apos;t have an account? <Link href="/#apply">Apply for membership</Link>
            </div>
          </form>

          <div className="divider">Demo mode</div>
          {demoError && (
            <div className="callout red" style={{ marginBottom: 10 }} role="alert">
              {demoError}
            </div>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={() => handleDemoLogin("MEMBER")}
              disabled={!!demoLoading}
              className="btn btn-ghost"
              style={{ flex: 1 }}
            >
              {demoLoading === "member" ? "…" : "Enter as member"}
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin("ADMIN")}
              disabled={!!demoLoading}
              className="btn btn-ghost"
              style={{ flex: 1 }}
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
        <div className="login-stage" style={{ display: "grid", placeItems: "center" }}>
          <div style={{ width: 32, height: 32, border: "2px solid var(--hairline)", borderTopColor: "var(--green)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
