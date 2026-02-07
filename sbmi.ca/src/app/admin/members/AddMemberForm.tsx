"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddMemberForm({ className }: { className?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    createAccount: true,
    householdName: "",
    householdAddress: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          phone: form.phone.trim() || undefined,
          email: form.createAccount ? form.email.trim() : undefined,
          createAccount: form.createAccount,
          householdName: form.householdName.trim() || undefined,
          householdAddress: form.householdAddress.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data.error ?? "Failed to create member");
        return;
      }
      setMessage(data.message ?? "Member created.");
      setForm({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        createAccount: true,
        householdName: "",
        householdAddress: "",
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <h2 className="font-serif text-[#1B4332] mb-4">Add member (admin-created account)</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-[#1B4332] mb-1">
            First name *
          </label>
          <input
            required
            value={form.firstName}
            onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
            className="w-full rounded-none border border-[#E8E4DE] px-3 py-2 sbmi-input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1B4332] mb-1">
            Last name *
          </label>
          <input
            required
            value={form.lastName}
            onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
            className="w-full rounded-none border border-[#E8E4DE] px-3 py-2 sbmi-input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1B4332] mb-1">Phone</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            className="w-full rounded-none border border-[#E8E4DE] px-3 py-2 sbmi-input"
          />
        </div>
        <div className="sm:col-span-2 flex items-center gap-2">
          <input
            type="checkbox"
            id="createAccount"
            checked={form.createAccount}
            onChange={(e) =>
              setForm((p) => ({ ...p, createAccount: e.target.checked }))
            }
          />
          <label htmlFor="createAccount" className="text-sm text-[#1B4332]">
            Create login (email + temp password)
          </label>
        </div>
        {form.createAccount && (
          <div>
            <label className="block text-sm font-medium text-[#1B4332] mb-1">
              Email *
            </label>
            <input
              type="email"
              required={form.createAccount}
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              className="w-full rounded-none border border-[#E8E4DE] px-3 py-2 sbmi-input"
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-[#1B4332] mb-1">
            Household name
          </label>
          <input
            value={form.householdName}
            onChange={(e) => setForm((p) => ({ ...p, householdName: e.target.value }))}
            className="w-full rounded-none border border-[#E8E4DE] px-3 py-2 sbmi-input"
            placeholder="Optional"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1B4332] mb-1">
            Household address
          </label>
          <input
            value={form.householdAddress}
            onChange={(e) => setForm((p) => ({ ...p, householdAddress: e.target.value }))}
            className="w-full rounded-none border border-[#E8E4DE] px-3 py-2 sbmi-input"
            placeholder="Optional"
          />
        </div>
      </div>
      {message && (
        <p className="mt-3 text-sm text-[#1B4332] bg-[#C9A227]/10 border border-[#C9A227]/30 rounded-none px-3 py-2">
          {message}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="mt-4 rounded-none bg-[#C9A227] hover:bg-[#B8922A] text-[#1B4332] px-4 py-2 font-medium disabled:opacity-50"
      >
        {loading ? "Creating…" : "Add member"}
      </button>
    </form>
  );
}
