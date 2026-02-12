"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/date";

type Application = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  householdSize: string | null;
  message: string | null;
  status: string;
  createdAt: Date;
};

type ClaimWithMember = {
  id: string;
  reason: string;
  amount: number | null;
  description: string | null;
  createdAt: Date;
  member: { id: string; firstName: string; lastName: string; memberNumber: string | null };
};

export default function ApprovalQueue({
  applications,
  claims,
}: {
  applications: Application[];
  claims: ClaimWithMember[];
}) {
  const router = useRouter();
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<string | null>(null);

  async function handleApplicationDecision(id: string, action: "approve" | "reject") {
    setLoading(id);
    try {
      const res = await fetch(`/api/admin/applications/${id}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          rejectionReason: action === "reject" ? rejectReason[id] : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed");
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  async function handleClaimDecision(id: string, action: "approve" | "reject") {
    setLoading(id);
    try {
      const res = await fetch(`/api/admin/claims/${id}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          rejectionReason: action === "reject" ? rejectReason[id] : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed");
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-10">
      {/* Pending memberships (from self-registration) */}
      <section className="sbmi-card p-6">
        <h2 className="font-display font-semibold text-[#1B5E3B] mb-4">
          Pending memberships ({applications.length})
        </h2>
        {applications.length === 0 ? (
          <p className="text-[#3D5A4A] text-sm">No pending applications.</p>
        ) : (
          <ul className="space-y-4">
            {applications.map((app) => (
              <li
                key={app.id}
                className="rounded-lg border border-[#E2DCD2] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div>
                  <p className="font-medium text-[#1B5E3B]">{app.fullName}</p>
                  <p className="text-sm text-[#3D5A4A]">{app.email} · {app.phone}</p>
                  {app.message && (
                    <p className="text-sm text-[#3D5A4A]/80 mt-1">{app.message}</p>
                  )}
                  <p className="text-xs text-[#3D5A4A]/60 mt-1">
                    Applied {formatDate(app.createdAt)}
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-w-[200px]">
                  <input
                    type="text"
                    placeholder="Rejection reason (if rejecting)"
                    className="rounded-lg border border-[#E2DCD2] px-3 py-2 text-sm sbmi-input"
                    value={rejectReason[app.id] ?? ""}
                    onChange={(e) =>
                      setRejectReason((prev) => ({ ...prev, [app.id]: e.target.value }))
                    }
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApplicationDecision(app.id, "approve")}
                      disabled={loading === app.id}
                      className="flex-1 rounded-lg bg-[#D4A43A] hover:bg-[#C4922E] text-[#171717] py-2 text-sm font-medium disabled:opacity-50 shadow-sm transition-colors"
                    >
                      {loading === app.id ? "…" : "Approve"}
                    </button>
                    <button
                      onClick={() => handleApplicationDecision(app.id, "reject")}
                      disabled={loading === app.id}
                      className="flex-1 rounded-lg border border-[#1B5E3B] text-[#1B5E3B] py-2 text-sm font-medium hover:bg-[#1B5E3B] hover:text-white disabled:opacity-50 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Pending claims */}
      <section className="sbmi-card p-6">
        <h2 className="font-display font-semibold text-[#1B5E3B] mb-4">
          Pending claims ({claims.length})
        </h2>
        {claims.length === 0 ? (
          <p className="text-[#3D5A4A] text-sm">No pending claims.</p>
        ) : (
          <ul className="space-y-4">
            {claims.map((claim) => (
              <li
                key={claim.id}
                className="rounded-lg border border-[#E2DCD2] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div>
                  <p className="font-medium text-[#1B5E3B]">
                    {claim.member.firstName} {claim.member.lastName}
                    {claim.member.memberNumber && ` (#${claim.member.memberNumber})`}
                  </p>
                  <p className="text-sm text-[#3D5A4A]">
                    {claim.reason}
                    {claim.amount != null && ` · $${claim.amount}`}
                  </p>
                  {claim.description && (
                    <p className="text-sm text-[#3D5A4A]/80 mt-1">{claim.description}</p>
                  )}
                  <p className="text-xs text-[#3D5A4A]/60 mt-1">
                    Submitted {formatDate(claim.createdAt)}
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-w-[200px]">
                  <input
                    type="text"
                    placeholder="Rejection reason (if rejecting)"
                    className="rounded-lg border border-[#E2DCD2] px-3 py-2 text-sm sbmi-input"
                    value={rejectReason[claim.id] ?? ""}
                    onChange={(e) =>
                      setRejectReason((prev) => ({ ...prev, [claim.id]: e.target.value }))
                    }
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleClaimDecision(claim.id, "approve")}
                      disabled={loading === claim.id}
                      className="flex-1 rounded-lg bg-[#D4A43A] hover:bg-[#C4922E] text-[#171717] py-2 text-sm font-medium disabled:opacity-50 shadow-sm transition-colors"
                    >
                      {loading === claim.id ? "…" : "Approve"}
                    </button>
                    <button
                      onClick={() => handleClaimDecision(claim.id, "reject")}
                      disabled={loading === claim.id}
                      className="flex-1 rounded-lg border border-[#1B5E3B] text-[#1B5E3B] py-2 text-sm font-medium hover:bg-[#1B5E3B] hover:text-white disabled:opacity-50 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
