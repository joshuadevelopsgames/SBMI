"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import {
  MEMBERSHIP_CATEGORY_OPTIONS,
  type MembershipCategoryCode,
} from "@/lib/membership-categories";

export function ApplyMembershipForm() {
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [householdSize, setHouseholdSize] = useState("");
  const [proposedCategory, setProposedCategory] = useState<MembershipCategoryCode>(
    MEMBERSHIP_CATEGORY_OPTIONS[0]?.code ?? "FULL_INDIVIDUAL"
  );
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          address: address.trim(),
          household_size: householdSize.trim(),
          proposed_category: proposedCategory,
          message: message.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Submission failed.");
        return;
      }
      setDone(true);
      setFullName("");
      setAddress("");
      setEmail("");
      setPhone("");
      setHouseholdSize("");
      setProposedCategory(MEMBERSHIP_CATEGORY_OPTIONS[0]?.code ?? "FULL_INDIVIDUAL");
      setMessage("");
    } catch {
      setError("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="callout green" role="status">
        <Check size={16} />
        <span>
          Thank you. The Executive Committee will be in touch shortly.{" "}
          <Link href="/login" className="text-link" style={{ fontWeight: 600 }}>
            Sign in
          </Link>{" "}
          once you have an account.
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label className="label" htmlFor="apply-name">
          Full name
        </label>
        <input
          id="apply-name"
          className="input"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Your full name"
        />
      </div>

      <div className="field">
        <label className="label" htmlFor="apply-address">
          Address
        </label>
        <input
          id="apply-address"
          className="input"
          required
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Street, city, postal code (Calgary area)"
        />
      </div>

      <div className="field">
        <label className="label" htmlFor="apply-email">
          Email
        </label>
        <input
          id="apply-email"
          type="email"
          className="input"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>

      <div className="field">
        <label className="label" htmlFor="apply-phone">
          Phone
        </label>
        <input
          id="apply-phone"
          type="tel"
          className="input"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="(403) 555-0142"
        />
      </div>

      <div className="field">
        <label className="label" htmlFor="apply-household">
          Family composition
        </label>
        <input
          id="apply-household"
          className="input"
          required
          value={householdSize}
          onChange={(e) => setHouseholdSize(e.target.value)}
          placeholder="e.g. 2 adults, 2 children"
        />
      </div>

      <div className="field">
        <label className="label" htmlFor="apply-category">
          Proposed membership category
        </label>
        <select
          id="apply-category"
          className="input"
          required
          value={proposedCategory}
          onChange={(e) => {
            const v = e.target.value;
            setProposedCategory(
              (MEMBERSHIP_CATEGORY_OPTIONS.some((o) => o.code === v) ? v : "FULL_INDIVIDUAL") as MembershipCategoryCode
            );
          }}
        >
          {MEMBERSHIP_CATEGORY_OPTIONS.map((o) => (
            <option key={o.code} value={o.code}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label className="label" htmlFor="apply-message">
          Message <span style={{ color: "var(--ink-400)", fontWeight: 400 }}>(optional)</span>
        </label>
        <textarea
          id="apply-message"
          className="textarea"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Anything else you would like us to know"
        />
      </div>

      {error && (
        <div className="callout red" style={{ marginBottom: 14 }} role="alert">
          {error}
        </div>
      )}

      <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: "100%", marginTop: 4 }}>
        {submitting ? "Submitting…" : "Submit application"}
        {!submitting && <ArrowRight size={16} />}
      </button>

      <div className="signup-line" style={{ marginTop: 18 }}>
        Already a member?{" "}
        <Link href="/login" style={{ fontWeight: 600 }}>
          Sign in to the portal
        </Link>
      </div>
    </form>
  );
}
