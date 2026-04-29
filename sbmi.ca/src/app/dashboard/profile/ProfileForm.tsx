"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Member = {
  id: string;
  firstName: string;
  lastName: string;
  memberNumber: string | null;
  status: string;
  paymentSchedule: string;
  household: { id: string; name: string | null; address: string | null; city: string } | null;
};

export default function ProfileForm({ member, email }: { member: Member; email: string | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    firstName: member.firstName,
    lastName: member.lastName,
  });
  const [passwordLinkSent, setPasswordLinkSent] = useState(false);
  const [emailChangeLoading, setEmailChangeLoading] = useState(false);
  const [emailChangeMessage, setEmailChangeMessage] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/dashboard/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMessage(data.error ?? "Update failed");
        return;
      }
      setMessage("Profile updated.");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleSendPasswordLink() {
    setPasswordLinkSent(false);
    try {
      const res = await fetch("/api/dashboard/profile/send-password-reset", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMessage(data.error ?? "Failed to send link");
        return;
      }
      setPasswordLinkSent(true);
    } catch {
      setMessage("Failed to send link.");
    }
  }

  async function handleRequestEmailChange(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setEmailChangeLoading(true);
    setEmailChangeMessage(null);
    try {
      const res = await fetch("/api/dashboard/profile/request-email-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail: newEmail.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setEmailChangeMessage(data.error ?? "Request failed");
        return;
      }
      setEmailChangeMessage("Check your current email for an approval link.");
      setNewEmail("");
      router.refresh();
    } finally {
      setEmailChangeLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="sbmi-card p-6">
        <h2 className="font-display font-semibold text-[#1B5E3B] mb-4">Your details</h2>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-[#1B5E3B] mb-1">
              First name
            </label>
            <input
              value={form.firstName}
              onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
              className="w-full rounded-lg border border-[#E2DCD2] px-3 py-2.5 sbmi-input"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1B5E3B] mb-1">
              Last name
            </label>
            <input
              value={form.lastName}
              onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
              className="w-full rounded-lg border border-[#E2DCD2] px-3 py-2.5 sbmi-input"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1B5E3B] mb-1">
              Email
            </label>
            <input
              type="email"
              value={email ?? ""}
              readOnly
              className="w-full rounded-lg border border-[#E2DCD2] px-3 py-2.5 sbmi-input bg-[#FAF7F0] text-[#3D5A4A]"
              aria-readonly
            />
            <p className="text-xs text-[#3D5A4A] mt-1">Email cannot be edited here. Use “Request email change” below.</p>
          </div>
          {message && (
            <p className="text-sm text-[#1B5E3B] bg-[#D4A43A]/10 border border-[#D4A43A]/30 rounded-lg px-3 py-2">
              {message}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
          className="rounded-lg bg-[#D4A43A] hover:bg-[#C4922E] text-[#171717] px-4 py-2.5 font-medium disabled:opacity-50 shadow-sm transition-colors"
          >
            {loading ? "Saving…" : "Save changes"}
          </button>
        </form>
      </div>

      <div className="sbmi-card p-6">
        <h2 className="font-display font-semibold text-[#1B5E3B] mb-4">Change password</h2>
        <p className="text-sm text-[#3D5A4A] mb-3">
          We will send a link to your email. Use it to set a new password; you will be logged out after changing it.
        </p>
        <button
          type="button"
          onClick={handleSendPasswordLink}
          className="rounded-lg bg-[#1B5E3B] hover:bg-[#17503A] text-white px-4 py-2.5 text-sm font-medium shadow-sm transition-colors"
        >
          Send me a link to change my password
        </button>
        {passwordLinkSent && (
          <p className="mt-2 text-sm text-[#1B5E3B] bg-[#D4A43A]/10 border border-[#D4A43A]/30 rounded-lg px-3 py-2">
            Check your email for the link.
          </p>
        )}
      </div>

      <div className="sbmi-card p-6">
        <h2 className="font-display font-semibold text-[#1B5E3B] mb-4">Request email change</h2>
        <p className="text-sm text-[#3D5A4A] mb-3">
          Enter your new email. We will send a confirmation to your current email; you must approve the change there.
        </p>
        <form onSubmit={handleRequestEmailChange} className="flex flex-wrap items-end gap-2 max-w-md">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="new-email" className="sr-only">New email</label>
            <input
              id="new-email"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="New email address"
              className="w-full rounded-lg border border-[#E2DCD2] px-3 py-2.5 sbmi-input"
              required
            />
          </div>
          <button
            type="submit"
            disabled={emailChangeLoading}
            className="rounded-lg bg-[#1B5E3B] hover:bg-[#17503A] text-white px-4 py-2.5 text-sm font-medium shadow-sm transition-colors disabled:opacity-50"
          >
            {emailChangeLoading ? "Sending…" : "Request email change"}
          </button>
        </form>
        {emailChangeMessage && (
          <p className="mt-2 text-sm text-[#1B5E3B] bg-[#D4A43A]/10 border border-[#D4A43A]/30 rounded-lg px-3 py-2">
            {emailChangeMessage}
          </p>
        )}
      </div>

      <div className="sbmi-card p-6">
        <h2 className="font-display font-semibold text-[#1B5E3B] mb-4">Household</h2>
        <p className="text-sm text-[#3D5A4A] mb-2">
          Member # {member.memberNumber ?? "—"}
        </p>
        <p className="text-sm text-[#3D5A4A]">
          Status: <span className="capitalize">{member.status.toLowerCase()}</span> · Schedule:{" "}
          {member.paymentSchedule}
        </p>
        {member.household && (
          <div className="mt-4 pt-4 border-t border-[#E2DCD2]">
            <p className="font-medium text-[#1B5E3B]">
              {member.household.name ?? "Household"}
            </p>
            <p className="text-sm text-[#3D5A4A]">
              {[member.household.address, member.household.city].filter(Boolean).join(", ") || "—"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
