"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Shield, Info, User as UserIcon } from "lucide-react";

type Member = {
  id: string;
  firstName: string;
  lastName: string;
  memberNumber: string | null;
  status: string;
  paymentSchedule: string;
  joinedAt?: Date | null;
  household: { id: string; name: string | null; address: string | null; city: string } | null;
};

type PendingNameRequest = {
  id: string;
  fieldName: string; // firstName | lastName
  newValue: string;
  createdAt: string;
};

function avatarInitials(first: string, last: string) {
  return ((first.charAt(0) || "") + (last.charAt(0) || "")).toUpperCase() || "M";
}

export default function ProfileForm({
  member,
  email,
  pendingNameRequests,
}: {
  member: Member;
  email: string | null;
  pendingNameRequests: PendingNameRequest[];
}) {
  const router = useRouter();
  const [showFirstNameField, setShowFirstNameField] = useState(false);
  const [showLastNameField, setShowLastNameField] = useState(false);
  const [showEmailField, setShowEmailField] = useState(false);
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [pwdLinkSent, setPwdLinkSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [busyField, setBusyField] = useState<string | null>(null);

  const pendingFirst = pendingNameRequests.find((r) => r.fieldName === "firstName");
  const pendingLast = pendingNameRequests.find((r) => r.fieldName === "lastName");

  function clearMessages() {
    setErrorMsg(null);
    setSuccessMsg(null);
  }

  async function submitNameChange(field: "firstName" | "lastName", newValue: string) {
    clearMessages();
    if (!newValue.trim()) return;
    setBusyField(field);
    try {
      const res = await fetch("/api/dashboard/profile/request-name-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fieldName: field, newValue: newValue.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMsg(data.error ?? "Could not submit request.");
        return;
      }
      setSuccessMsg("Request submitted to the Executive Committee. Your current value remains until they review it.");
      if (field === "firstName") {
        setNewFirstName("");
        setShowFirstNameField(false);
      } else {
        setNewLastName("");
        setShowLastNameField(false);
      }
      router.refresh();
    } finally {
      setBusyField(null);
    }
  }

  async function handleSendPasswordLink() {
    clearMessages();
    setPwdLinkSent(false);
    try {
      const res = await fetch("/api/dashboard/profile/send-password-reset", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error ?? "Failed to send link");
        return;
      }
      setPwdLinkSent(true);
    } catch {
      setErrorMsg("Failed to send link.");
    }
  }

  async function handleRequestEmailChange(e: React.FormEvent) {
    e.preventDefault();
    clearMessages();
    if (!newEmail.trim()) return;
    setBusyField("email");
    try {
      const res = await fetch("/api/dashboard/profile/request-email-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail: newEmail.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMsg(data.error ?? "Request failed");
        return;
      }
      setSuccessMsg("Check your current email for an approval link.");
      setNewEmail("");
      setShowEmailField(false);
      router.refresh();
    } finally {
      setBusyField(null);
    }
  }

  const memberCategoryLabel = "Full Member";
  const tenureYears = member.joinedAt
    ? Math.max(0, Math.floor((Date.now() - new Date(member.joinedAt).getTime()) / (365.25 * 86_400_000)))
    : null;

  return (
    <div className="split-2">
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="card card-pad" style={{ padding: 28 }}>
          <h3 className="card-title" style={{ marginBottom: 18 }}>Personal information</h3>

          {(errorMsg || successMsg) && (
            <div className={"callout " + (errorMsg ? "red" : "green")} style={{ marginBottom: 14 }} role={errorMsg ? "alert" : "status"}>
              <Info size={16} /><span>{errorMsg ?? successMsg}</span>
            </div>
          )}

          <div className="form-grid-2">
            {/* First name — locked, requires EC approval (SOW US55) */}
            <div className="field">
              <label className="label">First name</label>
              <div className="locked-input">
                <input className="input" value={member.firstName} readOnly style={{ background: "var(--bone)" }} />
                <button type="button" className="lock-btn" disabled={Boolean(pendingFirst)} onClick={() => { setShowFirstNameField((v) => !v); setNewFirstName(""); }}>
                  <UserIcon size={13} />
                  {pendingFirst ? "Pending" : showFirstNameField ? "Hide" : "Request change"}
                </button>
              </div>
              <div className="field-status"><Info size={12} />First-name changes require Executive Committee approval.</div>
              {pendingFirst && (
                <div className="callout" style={{ marginTop: 10 }}>
                  <Info size={16} /><span>Pending request: <strong>{pendingFirst.newValue}</strong></span>
                </div>
              )}
              {showFirstNameField && !pendingFirst && (
                <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                  <input
                    className="input"
                    style={{ flex: 1 }}
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    placeholder="New first name"
                  />
                  <button
                    type="button"
                    onClick={() => submitNameChange("firstName", newFirstName)}
                    disabled={busyField === "firstName" || !newFirstName.trim()}
                    className="btn btn-ghost"
                  >
                    {busyField === "firstName" ? "Submitting…" : "Submit"}
                  </button>
                </div>
              )}
            </div>

            {/* Last name — locked, requires EC approval (SOW US55) */}
            <div className="field">
              <label className="label">Last name</label>
              <div className="locked-input">
                <input className="input" value={member.lastName} readOnly style={{ background: "var(--bone)" }} />
                <button type="button" className="lock-btn" disabled={Boolean(pendingLast)} onClick={() => { setShowLastNameField((v) => !v); setNewLastName(""); }}>
                  <Shield size={13} />
                  {pendingLast ? "Pending" : showLastNameField ? "Hide" : "Request change"}
                </button>
              </div>
              <div className="field-status"><Info size={12} />Last-name changes require Executive Committee approval.</div>
              {pendingLast && (
                <div className="callout" style={{ marginTop: 10 }}>
                  <Info size={16} /><span>Pending request: <strong>{pendingLast.newValue}</strong></span>
                </div>
              )}
              {showLastNameField && !pendingLast && (
                <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                  <input
                    className="input"
                    style={{ flex: 1 }}
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    placeholder="New last name"
                  />
                  <button
                    type="button"
                    onClick={() => submitNameChange("lastName", newLastName)}
                    disabled={busyField === "lastName" || !newLastName.trim()}
                    className="btn btn-ghost"
                  >
                    {busyField === "lastName" ? "Submitting…" : "Submit"}
                  </button>
                </div>
              )}
            </div>

            {/* Email — locked, requires confirmation from current address (SOW US57, US58) */}
            <div className="field full">
              <label className="label">Email address</label>
              <div className="locked-input">
                <input className="input" value={email ?? ""} readOnly style={{ background: "var(--bone)" }} />
                <button type="button" className="lock-btn" onClick={() => setShowEmailField((v) => !v)}>
                  <Mail size={13} />
                  {showEmailField ? "Hide" : "Request change"}
                </button>
              </div>
              <div className="field-hint">A confirmation link will be sent to your current address before the change takes effect.</div>
              {showEmailField && (
                <form onSubmit={handleRequestEmailChange} style={{ display: "flex", gap: 10, marginTop: 10 }}>
                  <input
                    type="email"
                    className="input"
                    style={{ flex: 1 }}
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="New email address"
                    required
                  />
                  <button type="submit" disabled={busyField === "email"} className="btn btn-ghost">
                    {busyField === "email" ? "Sending…" : "Send"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        <div className="card card-pad" style={{ padding: 28 }}>
          <h3 className="card-title" style={{ marginBottom: 18 }}>Security</h3>
          <div className="form-grid-2">
            <div className="field full">
              <label className="label">Password</label>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <input className="input" value="••••••••••••" readOnly style={{ flex: 1, minWidth: 180, background: "var(--bone)" }} />
                <button type="button" onClick={handleSendPasswordLink} className="btn btn-ghost">
                  Change password
                </button>
              </div>
              <div className="field-hint">We&apos;ll email you a secure link to set a new password.</div>
              {pwdLinkSent && (
                <div className="callout green" style={{ marginTop: 10 }}>
                  <Info size={16} /><span>Password reset link sent. Check your email.</span>
                </div>
              )}
            </div>

            <div
              className="field full"
              style={{
                padding: "14px 16px",
                background: "var(--green-soft)",
                borderRadius: "var(--r-md)",
                border: "1px solid #BFDDC7",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <Shield size={18} style={{ color: "var(--green-deep)" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: "var(--green-deep)", fontSize: 13.5 }}>2-step verification is on</div>
                <div style={{ fontSize: 12, color: "var(--green-deep)", opacity: 0.85 }}>
                  A 6-digit code is emailed each time you sign in from a new device.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="aside-card" style={{ textAlign: "center", paddingTop: 28, paddingBottom: 24 }}>
          <div className="house-avatar primary" style={{ width: 72, height: 72, fontSize: 24, margin: "0 auto 12px" }}>
            {avatarInitials(member.firstName, member.lastName)}
          </div>
          <div style={{ fontFamily: "var(--font-display-stack)", fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" }}>
            {member.firstName} {member.lastName}
          </div>
          <div style={{ fontSize: 12.5, color: "var(--ink-500)", marginTop: 2 }}>
            Member ID · {member.memberNumber ?? "—"}
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 14, flexWrap: "wrap" }}>
            <span className={"pill " + (member.status === "ACTIVE" ? "pill-ok" : "pill-neutral")}>
              <span className="pill-dot"></span>
              {member.status === "ACTIVE" ? "Active" : member.status}
            </span>
            <span className="pill pill-neutral"><span className="pill-dot"></span>{memberCategoryLabel}</span>
          </div>
        </div>
        <div className="aside-card">
          <h5>Membership</h5>
          <div style={{ fontSize: 13, color: "var(--ink-700)", lineHeight: 1.7 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--ink-500)" }}>Category</span>
              <span>{memberCategoryLabel}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--ink-500)" }}>Schedule</span>
              <span style={{ fontVariantNumeric: "tabular-nums" }}>{member.paymentSchedule}</span>
            </div>
            {tenureYears != null && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--ink-500)" }}>Tenure</span>
                <span>{tenureYears} {tenureYears === 1 ? "year" : "years"}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--ink-500)" }}>Standing</span>
              <span style={{ color: "var(--green)" }}>{member.status === "ACTIVE" ? "Good" : "Review"}</span>
            </div>
          </div>
        </div>
        {member.household && (
          <div className="aside-card">
            <h5>Household</h5>
            <p style={{ margin: "0 0 4px", fontWeight: 600, color: "var(--ink-900)" }}>
              {member.household.name ?? "Household"}
            </p>
            <p style={{ margin: 0 }}>
              {[member.household.address, member.household.city].filter(Boolean).join(", ") || "—"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
