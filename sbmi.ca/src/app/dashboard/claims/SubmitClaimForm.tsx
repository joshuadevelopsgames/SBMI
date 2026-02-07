"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CLAIM_REASONS = [
  "FUNERAL",
  "ILLNESS",
  "CATASTROPHE",
  "HUMANITARIAN",
  "OTHER",
];

export default function SubmitClaimForm({ className }: { className?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    reason: "FUNERAL",
    amount: "",
    description: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: form.reason,
          amount: form.amount ? parseFloat(form.amount) : undefined,
          description: form.description.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data.error ?? "Failed to submit claim");
        return;
      }
      setMessage("Claim submitted. An admin will review it.");
      setForm({ reason: "FUNERAL", amount: "", description: "" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <h2 className="font-serif text-[#1B4332] mb-4">Submit a claim</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#1B4332] mb-1">
            Reason *
          </label>
          <select
            value={form.reason}
            onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
            className="w-full rounded-none border border-[#E8E4DE] px-3 py-2 sbmi-input"
          >
            {CLAIM_REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1B4332] mb-1">
            Amount (optional)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.amount}
            onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
            className="w-full rounded-none border border-[#E8E4DE] px-3 py-2 sbmi-input"
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1B4332] mb-1">
            Description / supporting details (optional)
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            rows={3}
            className="w-full rounded-none border border-[#E8E4DE] px-3 py-2 sbmi-input resize-none"
            placeholder="Provide any relevant details..."
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
          {loading ? "Submitting…" : "Submit claim"}
        </button>
      </div>
    </form>
  );
}
