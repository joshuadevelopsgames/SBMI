"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
      <section className="sbmi-card rounded-none p-6">
        <h2 className="font-serif text-[#1B4332] mb-4">
          Pending memberships ({applications.length})
        </h2>
        {applications.length === 0 ? (
          <p className="text-[#3D5A4C] text-sm">No pending applications.</p>
        ) : (
          <ul className="space-y-4">
            {applications.map((app) => (
              <li
                key={app.id}
                className="border border-[#E8E4DE] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div>
                  <p className="font-medium text-[#1B4332]">{app.fullName}</p>
                  <p className="text-sm text-[#3D5A4C]">{app.email} · {app.phone}</p>
                  {app.message && (
                    <p className="text-sm text-[#3D5A4C]/80 mt-1">{app.message}</p>
                  )}
                  <p className="text-xs text-[#3D5A4C]/60 mt-1">
                    Applied {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-w-[200px]">
                  <input
                    type="text"
                    placeholder="Rejection reason (if rejecting)"
                    className="rounded-none border border-[#E8E4DE] px-3 py-2 text-sm sbmi-input"
                    value={rejectReason[app.id] ?? ""}
                    onChange={(e) =>
                      setRejectReason((prev) => ({ ...prev, [app.id]: e.target.value }))
                    }
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApplicationDecision(app.id, "approve")}
                      disabled={loading === app.id}
                      className="flex-1 rounded-none bg-[#C9A227] hover:bg-[#B8922A] text-[#1B4332] py-2 text-sm font-medium disabled:opacity-50"
                    >
                      {loading === app.id ? "…" : "Approve"}
                    </button>
                    <button
                      onClick={() => handleApplicationDecision(app.id, "reject")}
                      disabled={loading === app.id}
                      className="flex-1 rounded-none border border-[#1B4332] text-[#1B4332] py-2 text-sm font-medium hover:bg-[#1B4332] hover:text-white disabled:opacity-50"
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
      <section className="sbmi-card rounded-none p-6">
        <h2 className="font-serif text-[#1B4332] mb-4">
          Pending claims ({claims.length})
        </h2>
        {claims.length === 0 ? (
          <p className="text-[#3D5A4C] text-sm">No pending claims.</p>
        ) : (
          <ul className="space-y-4">
            {claims.map((claim) => (
              <li
                key={claim.id}
                className="border border-[#E8E4DE] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div>
                  <p className="font-medium text-[#1B4332]">
                    {claim.member.firstName} {claim.member.lastName}
                    {claim.member.memberNumber && ` (#${claim.member.memberNumber})`}
                  </p>
                  <p className="text-sm text-[#3D5A4C]">
                    {claim.reason}
                    {claim.amount != null && ` · $${claim.amount}`}
                  </p>
                  {claim.description && (
                    <p className="text-sm text-[#3D5A4C]/80 mt-1">{claim.description}</p>
                  )}
                  <p className="text-xs text-[#3D5A4C]/60 mt-1">
                    Submitted {new Date(claim.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-w-[200px]">
                  <input
                    type="text"
                    placeholder="Rejection reason (if rejecting)"
                    className="rounded-none border border-[#E8E4DE] px-3 py-2 text-sm sbmi-input"
                    value={rejectReason[claim.id] ?? ""}
                    onChange={(e) =>
                      setRejectReason((prev) => ({ ...prev, [claim.id]: e.target.value }))
                    }
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleClaimDecision(claim.id, "approve")}
                      disabled={loading === claim.id}
                      className="flex-1 rounded-none bg-[#C9A227] hover:bg-[#B8922A] text-[#1B4332] py-2 text-sm font-medium disabled:opacity-50"
                    >
                      {loading === claim.id ? "…" : "Approve"}
                    </button>
                    <button
                      onClick={() => handleClaimDecision(claim.id, "reject")}
                      disabled={loading === claim.id}
                      className="flex-1 rounded-none border border-[#1B4332] text-[#1B4332] py-2 text-sm font-medium hover:bg-[#1B4332] hover:text-white disabled:opacity-50"
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
