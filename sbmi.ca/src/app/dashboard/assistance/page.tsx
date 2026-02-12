"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type FamilyMember = { id: string; fullName: string };

export default function AssistancePage() {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loadingFamily, setLoadingFamily] = useState(true);
  const [requestType, setRequestType] = useState<"SELF" | "OTHER">("SELF");
  const [familyMemberId, setFamilyMemberId] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/family-members", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        setFamilyMembers(Array.isArray(data) ? data.map((fm: { id: string; fullName: string }) => ({ id: fm.id, fullName: fm.fullName })) : []);
      })
      .catch(() => setFamilyMembers([]))
      .finally(() => setLoadingFamily(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (!description.trim()) {
      setMessage({ type: "error", text: "Description is required." });
      return;
    }
    if (requestType === "OTHER" && !familyMemberId.trim()) {
      setMessage({ type: "error", text: "Please select a family member." });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/dashboard/assistance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestType,
          familyMemberId: requestType === "OTHER" ? (familyMemberId.trim() || undefined) : undefined,
          description: description.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? "Submit failed." });
        return;
      }
      setMessage({ type: "ok", text: "Your request has been submitted. SBMI will be in touch as needed." });
      setDescription("");
      setFamilyMemberId("");
    } catch {
      setMessage({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px flex-1 min-w-0 bg-[#D4A43A]" />
        <span className="text-xs tracking-[0.2em] text-[#D4A43A] uppercase font-medium shrink-0">
          Assistance
        </span>
      </div>
      <h1 className="text-2xl font-display font-semibold text-[#1B5E3B] mb-8">
        Request assistance
      </h1>

      <form onSubmit={handleSubmit} className="sbmi-card p-6 space-y-6 max-w-xl">
        <div>
          <span className="block text-sm font-medium text-[#1B5E3B] mb-2">Requesting assistance for</span>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="requestType"
                checked={requestType === "SELF"}
                onChange={() => setRequestType("SELF")}
                className="text-[#D4A43A] focus:ring-[#D4A43A]/30"
              />
              <span className="text-[#1B5E3B]">Myself</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="requestType"
                checked={requestType === "OTHER"}
                onChange={() => setRequestType("OTHER")}
                className="text-[#D4A43A] focus:ring-[#D4A43A]/30"
              />
              <span className="text-[#1B5E3B]">Someone else</span>
            </label>
          </div>
        </div>

        {requestType === "SELF" && (
          <p className="text-sm text-[#3D5A4A]">
            You are requesting assistance for yourself. Describe your situation below.
          </p>
        )}

        {requestType === "OTHER" && (
          <div>
            <label htmlFor="family-member" className="block text-sm font-medium text-[#1B5E3B] mb-1">
              Family member needing assistance
            </label>
            {loadingFamily ? (
              <p className="text-sm text-[#3D5A4A]">Loading…</p>
            ) : (
              <>
                <select
                  id="family-member"
                  value={familyMemberId}
                  onChange={(e) => setFamilyMemberId(e.target.value)}
                  className="w-full rounded-lg border border-[#E2DCD2] px-3 py-2.5 sbmi-input text-[#1B5E3B]"
                  required={requestType === "OTHER"}
                >
                  <option value="">Select a family member</option>
                  {familyMembers.map((fm) => (
                    <option key={fm.id} value={fm.id}>
                      {fm.fullName}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-[#3D5A4A]">
                  <Link href="/dashboard/family" className="text-[#1B5E3B] hover:underline font-medium">
                    Manage family
                  </Link>
                  {" "}to add or edit family members, then return here.
                </p>
              </>
            )}
          </div>
        )}

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-[#1B5E3B] mb-1">
            Description <span className="text-red-600">*</span>
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            className="w-full rounded-lg border border-[#E2DCD2] px-3 py-2.5 sbmi-input resize-y"
            placeholder="Describe what is happening and what type of assistance is required."
          />
        </div>

        {message && (
          <p
            className={`text-sm rounded-lg px-3 py-2 ${
              message.type === "ok"
                ? "bg-[#D4A43A]/10 border border-[#D4A43A]/30 text-[#1B5E3B]"
                : "bg-red-50 border border-red-100 text-red-700"
            }`}
            role="alert"
          >
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-[#D4A43A] hover:bg-[#C4922E] text-[#171717] px-4 py-2.5 font-medium disabled:opacity-50 shadow-sm transition-colors"
        >
          {submitting ? "Submitting…" : "Submit request"}
        </button>
      </form>
    </div>
  );
}
