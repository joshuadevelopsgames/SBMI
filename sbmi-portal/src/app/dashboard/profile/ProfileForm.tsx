"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Member = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  memberNumber: string | null;
  status: string;
  paymentSchedule: string;
  household: { id: string; name: string | null; address: string | null; city: string } | null;
};

export default function ProfileForm({ member }: { member: Member }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    firstName: member.firstName,
    lastName: member.lastName,
    phone: member.phone ?? "",
  });

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

  return (
    <div className="space-y-6">
      <div className="sbmi-card rounded-none p-6">
        <h2 className="font-serif text-[#1B4332] mb-4">Your details</h2>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-[#1B4332] mb-1">
              First name
            </label>
            <input
              value={form.firstName}
              onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
              className="w-full rounded-none border border-[#E8E4DE] px-3 py-2 sbmi-input"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1B4332] mb-1">
              Last name
            </label>
            <input
              value={form.lastName}
              onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
              className="w-full rounded-none border border-[#E8E4DE] px-3 py-2 sbmi-input"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1B4332] mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              className="w-full rounded-none border border-[#E8E4DE] px-3 py-2 sbmi-input"
            />
          </div>
          {message && (
            <p className="text-sm text-[#1B4332] bg-[#C9A227]/10 border border-[#C9A227]/30 px-3 py-2">
              {message}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="rounded-none bg-[#C9A227] hover:bg-[#B8922A] text-[#1B4332] px-4 py-2 font-medium disabled:opacity-50"
          >
            {loading ? "Saving…" : "Save changes"}
          </button>
        </form>
      </div>

      <div className="sbmi-card rounded-none p-6">
        <h2 className="font-serif text-[#1B4332] mb-4">Household</h2>
        <p className="text-sm text-[#3D5A4C] mb-2">
          Member # {member.memberNumber ?? "—"}
        </p>
        <p className="text-sm text-[#3D5A4C]">
          Status: <span className="capitalize">{member.status.toLowerCase()}</span> · Schedule:{" "}
          {member.paymentSchedule}
        </p>
        {member.household && (
          <div className="mt-4 pt-4 border-t border-[#E8E4DE]">
            <p className="font-medium text-[#1B4332]">
              {member.household.name ?? "Household"}
            </p>
            <p className="text-sm text-[#3D5A4C]">
              {[member.household.address, member.household.city].filter(Boolean).join(", ") || "—"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
