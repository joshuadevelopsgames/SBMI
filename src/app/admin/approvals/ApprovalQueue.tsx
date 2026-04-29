"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, UserPlus, Wallet, Mail, Users as UsersIcon } from "lucide-react";
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

type FamilyChange = {
  id: string;
  fullName: string;
  birthDate: Date;
  relationship: string | null;
  maritalStatus: string;
  status: string;
  pendingFullName: string | null;
  pendingBirthDate: Date | null;
  pendingRelationship: string | null;
  pendingMaritalStatus: string | null;
  pendingDeletion: boolean;
  requestedAt: Date;
  member: { id: string; firstName: string; lastName: string; memberNumber: string | null };
};

type NameChange = {
  id: string;
  fieldName: string;
  oldValue: string;
  newValue: string;
  requestedAt: Date;
  memberName: string;
  memberNumber: string | null;
};

function familyChangeKind(c: FamilyChange): "ADD" | "EDIT" | "DELETE" {
  if (c.pendingDeletion) return "DELETE";
  if (c.status === "PENDING_APPROVAL") return "ADD";
  return "EDIT";
}

type SectionHeaderProps = {
  title: string;
  count: number;
  icon: React.ComponentType<{ size?: number }>;
  hint?: string;
};
function SectionHeader({ title, count, icon: Icon, hint }: SectionHeaderProps) {
  return (
    <div className="card-head">
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Icon size={16} />
        <h3 className="card-title">{title}</h3>
        <span
          className={"pill " + (count > 0 ? "pill-warn" : "pill-neutral")}
          style={{ fontSize: 11, padding: "2px 8px" }}
        >
          <span className="pill-dot"></span>
          {count}
        </span>
      </div>
      {hint && <span style={{ fontSize: 12, color: "var(--ink-400)" }}>{hint}</span>}
    </div>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: "20px 24px", color: "var(--ink-500)", fontSize: 13.5 }}>
      {children}
    </div>
  );
}

type DecisionRowProps = {
  loading: boolean;
  reason: string;
  setReason: (v: string) => void;
  onApprove: () => void;
  onReject: () => void;
  approveLabel?: string;
};
function DecisionRow({ loading, reason, setReason, onApprove, onReject, approveLabel = "Approve" }: DecisionRowProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 220, flexShrink: 0 }}>
      <input
        type="text"
        className="input"
        style={{ height: 36, fontSize: 13 }}
        placeholder="Rejection reason (if rejecting)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          onClick={onApprove}
          disabled={loading}
          className="btn btn-accent"
          style={{ flex: 1, height: 36, fontSize: 13 }}
        >
          {loading ? "…" : (
            <>
              <Check size={14} /> {approveLabel}
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onReject}
          disabled={loading}
          className="btn btn-ghost"
          style={{ flex: 1, height: 36, fontSize: 13 }}
        >
          <X size={14} /> Reject
        </button>
      </div>
    </div>
  );
}

export default function ApprovalQueue({
  applications,
  claims,
  familyChanges,
  nameChanges,
}: {
  applications: Application[];
  claims: ClaimWithMember[];
  familyChanges: FamilyChange[];
  nameChanges: NameChange[];
}) {
  const router = useRouter();
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<string | null>(null);

  function reasonFor(id: string) {
    return rejectReason[id] ?? "";
  }
  function setReasonFor(id: string, v: string) {
    setRejectReason((prev) => ({ ...prev, [id]: v }));
  }

  async function decide(url: string, id: string, action: "approve" | "reject") {
    setLoading(id);
    try {
      const res = await fetch(url, {
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
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Membership applications */}
      <section className="card">
        <SectionHeader
          title="Membership applications"
          count={applications.length}
          icon={UserPlus}
          hint="Submitted from the public membership form"
        />
        {applications.length === 0 ? (
          <EmptyState>No pending applications.</EmptyState>
        ) : (
          <div style={{ borderTop: "1px solid var(--hairline)" }}>
            {applications.map((app) => (
              <div
                key={app.id}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: 16,
                  padding: "16px 24px",
                  borderTop: "1px solid var(--hairline)",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div className="tbl-cell-strong" style={{ fontSize: 14 }}>{app.fullName}</div>
                  <div style={{ fontSize: 12.5, color: "var(--ink-500)", marginTop: 2 }}>
                    {app.email} · {app.phone}
                  </div>
                  {app.message && (
                    <div style={{ fontSize: 12.5, color: "var(--ink-700)", marginTop: 8, lineHeight: 1.5 }}>
                      {app.message}
                    </div>
                  )}
                  <div style={{ fontSize: 11.5, color: "var(--ink-400)", marginTop: 8 }}>
                    Applied {formatDate(app.createdAt)}
                  </div>
                </div>
                <DecisionRow
                  loading={loading === app.id}
                  reason={reasonFor(app.id)}
                  setReason={(v) => setReasonFor(app.id, v)}
                  onApprove={() => decide(`/api/admin/applications/${app.id}/decision`, app.id, "approve")}
                  onReject={() => decide(`/api/admin/applications/${app.id}/decision`, app.id, "reject")}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Profile name changes */}
      <section className="card">
        <SectionHeader
          title="Profile name changes"
          count={nameChanges.length}
          icon={Mail}
          hint="First or last name updates submitted by members"
        />
        {nameChanges.length === 0 ? (
          <EmptyState>No pending profile changes.</EmptyState>
        ) : (
          <div>
            {nameChanges.map((n) => (
              <div
                key={n.id}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: 16,
                  padding: "16px 24px",
                  borderTop: "1px solid var(--hairline)",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: "var(--ink-500)",
                      fontWeight: 600,
                      marginBottom: 4,
                    }}
                  >
                    {n.fieldName === "firstName" ? "First name" : "Last name"} change
                  </div>
                  <div className="tbl-cell-strong" style={{ fontSize: 14 }}>
                    {n.memberName}
                    {n.memberNumber && (
                      <span style={{ color: "var(--ink-500)", fontWeight: 500 }}> · #{n.memberNumber}</span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--ink-700)", marginTop: 4 }}>
                    <span style={{ color: "var(--ink-500)" }}>{n.oldValue}</span>
                    {" → "}
                    <strong style={{ color: "var(--ink-900)" }}>{n.newValue}</strong>
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-400)", marginTop: 8 }}>
                    Requested {formatDate(n.requestedAt)}
                  </div>
                </div>
                <DecisionRow
                  loading={loading === n.id}
                  reason={reasonFor(n.id)}
                  setReason={(v) => setReasonFor(n.id, v)}
                  onApprove={() => decide(`/api/admin/profile-changes/${n.id}/decision`, n.id, "approve")}
                  onReject={() => decide(`/api/admin/profile-changes/${n.id}/decision`, n.id, "reject")}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Family changes */}
      <section className="card">
        <SectionHeader
          title="Family changes"
          count={familyChanges.length}
          icon={UsersIcon}
          hint="Household add, edit, or remove requests awaiting review"
        />
        {familyChanges.length === 0 ? (
          <EmptyState>No pending family changes.</EmptyState>
        ) : (
          <div>
            {familyChanges.map((c) => {
              const kind = familyChangeKind(c);
              return (
                <div
                  key={c.id}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 16,
                    padding: "16px 24px",
                    borderTop: "1px solid var(--hairline)",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                      <span
                        className={"pill " + (kind === "DELETE" ? "pill-danger" : kind === "ADD" ? "pill-ok" : "pill-warn")}
                        style={{ fontSize: 10.5, padding: "2px 8px" }}
                      >
                        <span className="pill-dot"></span>
                        {kind}
                      </span>
                      <span style={{ fontSize: 11.5, color: "var(--ink-400)" }}>
                        Requested {formatDate(c.requestedAt)}
                      </span>
                    </div>
                    <div className="tbl-cell-strong" style={{ fontSize: 14 }}>
                      {c.fullName}
                      {c.relationship && (
                        <span style={{ color: "var(--ink-500)", fontWeight: 500 }}> · {c.relationship}</span>
                      )}
                    </div>
                    <div style={{ fontSize: 12.5, color: "var(--ink-500)", marginTop: 2 }}>
                      Household of {c.member.firstName} {c.member.lastName}
                      {c.member.memberNumber && ` · #${c.member.memberNumber}`}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 4, fontVariantNumeric: "tabular-nums" }}>
                      DOB {formatDate(c.birthDate)} · {c.maritalStatus.toLowerCase()}
                    </div>
                    {kind === "EDIT" && (
                      <div
                        style={{
                          marginTop: 10,
                          padding: "10px 12px",
                          background: "var(--paper)",
                          border: "1px solid var(--hairline)",
                          borderRadius: "var(--r-md)",
                          fontSize: 12.5,
                          color: "var(--ink-700)",
                          lineHeight: 1.6,
                        }}
                      >
                        {c.pendingFullName && (
                          <div>Name → <strong>{c.pendingFullName}</strong></div>
                        )}
                        {c.pendingBirthDate && (
                          <div>DOB → <strong>{formatDate(c.pendingBirthDate)}</strong></div>
                        )}
                        {c.pendingRelationship && (
                          <div>Relationship → <strong>{c.pendingRelationship}</strong></div>
                        )}
                        {c.pendingMaritalStatus && (
                          <div>Marital status → <strong>{c.pendingMaritalStatus.toLowerCase()}</strong></div>
                        )}
                      </div>
                    )}
                  </div>
                  <DecisionRow
                    loading={loading === c.id}
                    reason={reasonFor(c.id)}
                    setReason={(v) => setReasonFor(c.id, v)}
                    onApprove={() => decide(`/api/admin/family-changes/${c.id}/decision`, c.id, "approve")}
                    onReject={() => decide(`/api/admin/family-changes/${c.id}/decision`, c.id, "reject")}
                  />
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Assistance claims */}
      <section className="card">
        <SectionHeader
          title="Assistance claims"
          count={claims.length}
          icon={Wallet}
          hint="Member-submitted assistance and aid claims"
        />
        {claims.length === 0 ? (
          <EmptyState>No pending claims.</EmptyState>
        ) : (
          <div>
            {claims.map((claim) => (
              <div
                key={claim.id}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: 16,
                  padding: "16px 24px",
                  borderTop: "1px solid var(--hairline)",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div className="tbl-cell-strong" style={{ fontSize: 14 }}>
                    {claim.member.firstName} {claim.member.lastName}
                    {claim.member.memberNumber && (
                      <span style={{ color: "var(--ink-500)", fontWeight: 500 }}> · #{claim.member.memberNumber}</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--ink-700)", marginTop: 4 }}>
                    <span style={{ textTransform: "capitalize" }}>{claim.reason.toLowerCase()}</span>
                    {claim.amount != null && (
                      <span style={{ fontVariantNumeric: "tabular-nums" }}> · ${claim.amount.toFixed(2)}</span>
                    )}
                  </div>
                  {claim.description && (
                    <div style={{ fontSize: 12.5, color: "var(--ink-700)", marginTop: 6, lineHeight: 1.5 }}>
                      {claim.description}
                    </div>
                  )}
                  <div style={{ fontSize: 11.5, color: "var(--ink-400)", marginTop: 8 }}>
                    Submitted {formatDate(claim.createdAt)}
                  </div>
                </div>
                <DecisionRow
                  loading={loading === claim.id}
                  reason={reasonFor(claim.id)}
                  setReason={(v) => setReasonFor(claim.id, v)}
                  onApprove={() => decide(`/api/admin/claims/${claim.id}/decision`, claim.id, "approve")}
                  onReject={() => decide(`/api/admin/claims/${claim.id}/decision`, claim.id, "reject")}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
