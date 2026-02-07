"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Login failed");
        return;
      }
      router.push(data.redirect ?? from);
      router.refresh();
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
            Member Portal
          </span>
          <div className="h-px w-8 bg-[#C9A227]" />
        </div>
        <h1 className="text-2xl font-serif font-light text-[#1B4332] text-center mb-1">
          Samuel Bete Iddir
        </h1>
        <p className="text-[#3D5A4C] text-sm text-center mb-6">
          Sign in to your account
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[#1B4332] mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-none border border-[#E8E4DE] px-3 py-2.5 text-[#1B4332] placeholder:text-[#3D5A4C]/60 focus:border-[#C9A227] focus:outline-none focus:ring-1 focus:ring-[#C9A227]/30 sbmi-input"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[#1B4332] mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-none border border-[#E8E4DE] px-3 py-2.5 text-[#1B4332] placeholder:text-[#3D5A4C]/60 focus:border-[#C9A227] focus:outline-none focus:ring-1 focus:ring-[#C9A227]/30 sbmi-input"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-none px-3 py-2">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-none bg-[#C9A227] hover:bg-[#B8922A] py-3 font-medium text-[#1B4332] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/40 disabled:opacity-50 transition-colors"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-4 text-xs text-[#3D5A4C]/70 text-center">
          Demo: admin@sbmi.ca / admin123
        </p>
        <p className="mt-2 text-center">
          <Link
            href="/"
            className="text-sm text-[#C9A227] hover:text-[#B8922A] hover:underline"
          >
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center sbmi-page-bg">
          <div className="w-8 h-8 border-2 border-[#E8E4DE] border-t-[#C9A227] rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
