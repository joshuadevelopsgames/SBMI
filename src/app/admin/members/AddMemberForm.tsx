"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Info, Plus, Check } from "lucide-react";

export default function AddMemberForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
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
        setMessage({ type: "error", text: data.error ?? "Failed to create member" });
        return;
      }
      setMessage({ type: "ok", text: data.message ?? "Member created." });
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
    <form onSubmit={handleSubmit} className="card card-pad" style={{ padding: 28 }}>
      <div className="form-grid-2">
        <div className="field">
          <label className="label">First name</label>
          <input
            required
            className="input"
            value={form.firstName}
            onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
          />
        </div>
        <div className="field">
          <label className="label">Last name</label>
          <input
            required
            className="input"
            value={form.lastName}
            onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
          />
        </div>
        <div className="field">
          <label className="label">
            Phone <span style={{ color: "var(--ink-400)", fontWeight: 400 }}>· optional</span>
          </label>
          <input
            type="tel"
            className="input"
            value={form.phone}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
          />
        </div>
        <div className="field" style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "11px 14px",
              border: "1px solid var(--hairline-strong)",
              borderRadius: "var(--r-md)",
              background: form.createAccount ? "var(--green-soft)" : "var(--card)",
              color: form.createAccount ? "var(--green-deep)" : "var(--ink-700)",
              fontWeight: 500,
              fontSize: 13.5,
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              id="createAccount"
              checked={form.createAccount}
              onChange={(e) => setForm((p) => ({ ...p, createAccount: e.target.checked }))}
              style={{ accentColor: "var(--green)" }}
            />
            Create login (email + temp password)
          </label>
        </div>
        {form.createAccount && (
          <div className="field full">
            <label className="label">Email</label>
            <input
              type="email"
              required={form.createAccount}
              className="input"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            />
            <div className="field-hint">
              A temporary password is issued; the member rotates it on first sign-in.
            </div>
          </div>
        )}
        <div className="field">
          <label className="label">
            Household name <span style={{ color: "var(--ink-400)", fontWeight: 400 }}>· optional</span>
          </label>
          <input
            className="input"
            value={form.householdName}
            onChange={(e) => setForm((p) => ({ ...p, householdName: e.target.value }))}
            placeholder="e.g. Tessema household"
          />
        </div>
        <div className="field">
          <label className="label">
            Household address <span style={{ color: "var(--ink-400)", fontWeight: 400 }}>· optional</span>
          </label>
          <input
            className="input"
            value={form.householdAddress}
            onChange={(e) => setForm((p) => ({ ...p, householdAddress: e.target.value }))}
            placeholder="Street, City, Postal Code"
          />
        </div>

        {message && (
          <div className={"full callout " + (message.type === "ok" ? "green" : "red")} role={message.type === "ok" ? "status" : "alert"}>
            {message.type === "ok" ? <Check size={16} /> : <Info size={16} />}
            <span>{message.text}</span>
          </div>
        )}

        <div className="full" style={{ display: "flex", gap: 10, marginTop: 4 }}>
          <button type="submit" disabled={loading} className="btn btn-accent">
            {loading ? "Creating…" : (
              <>
                <Plus size={15} /> Add member
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
