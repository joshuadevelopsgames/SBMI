"use client";

import { useEffect, useState } from "react";
import { ChevronRight, Plus, Download, Check, Info } from "lucide-react";
import { Crumbs } from "@/components/portal/Chrome";
import { formatCalendarDate } from "@/lib/date";

type FamilyMemberRow = {
  id: string;
  fullName: string;
  birthDate: string;
  relationship: string | null;
  maritalStatus: "UNMARRIED" | "MARRIED" | string;
  status: "PENDING_APPROVAL" | "APPROVED" | "REJECTED" | string;
  currentAge: number;
  pendingDeletion: boolean;
  pendingEdit: boolean;
  pendingFullName: string | null;
  pendingBirthDate: string | null;
  pendingRelationship: string | null;
  pendingMaritalStatus: string | null;
};

const MAX_AGE = 25;
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const CURRENT_YEAR = new Date().getFullYear();
const BIRTH_YEAR_START = 1920;
const RELATIONSHIPS = ["Spouse", "Child", "Parent", "Sibling", "Other"] as const;

function daysInMonth(year: number, month: number): number {
  if (year <= 0 || month < 1 || month > 12) return 31;
  return new Date(year, month, 0).getDate();
}
function toDateParts(iso: string) {
  if (!iso || iso.length < 10) return { year: "", month: "", day: "" };
  const [y, m, d] = iso.slice(0, 10).split("-");
  return { year: y ?? "", month: m ?? "", day: d ?? "" };
}
function fromDateParts(year: string, month: string, day: string): string {
  if (!year || !month || !day) return "";
  const y = parseInt(year, 10);
  const m = parseInt(month, 10);
  const d = parseInt(day, 10);
  const maxDay = daysInMonth(y, m);
  const dayClamped = Math.min(Math.max(1, d), maxDay);
  return `${y}-${String(m).padStart(2, "0")}-${String(dayClamped).padStart(2, "0")}`;
}
function getAge(b: Date): number {
  const today = new Date();
  let y = today.getFullYear() - b.getFullYear();
  if (today.getMonth() < b.getMonth() || (today.getMonth() === b.getMonth() && today.getDate() < b.getDate())) {
    y -= 1;
  }
  return y;
}
function avatarInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.charAt(0) ?? "";
  const b = parts[parts.length - 1]?.charAt(0) ?? "";
  return ((a + b).toUpperCase() || "—").slice(0, 2);
}

function isOverAge(fm: FamilyMemberRow): boolean {
  return fm.currentAge > MAX_AGE;
}
function isMarried(fm: FamilyMemberRow): boolean {
  return fm.maritalStatus === "MARRIED";
}

function BirthDateSelect({ value, onChange, idBase }: { value: string; onChange: (v: string) => void; idBase: string }) {
  const parts = toDateParts(value);
  const [year, setYear] = useState(parts.year);
  const [month, setMonth] = useState(parts.month);
  const [day, setDay] = useState(parts.day);
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    setYear(parts.year);
    setMonth(parts.month);
    setDay(parts.day);
  }

  function update(y: string, m: string, d: string) {
    const next = fromDateParts(y, m, d);
    if (next) onChange(next);
  }

  const yearOptions = Array.from({ length: CURRENT_YEAR - BIRTH_YEAR_START + 1 }, (_, i) => CURRENT_YEAR - i);
  const numDay = daysInMonth(year ? parseInt(year, 10) : CURRENT_YEAR, month ? parseInt(month, 10) : 1);
  const dayOptions = Array.from({ length: numDay }, (_, i) => i + 1);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
      <select id={`${idBase}-year`} className="input" value={year} onChange={(e) => { setYear(e.target.value); update(e.target.value, month, day); }}>
        <option value="">Year</option>
        {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
      </select>
      <select id={`${idBase}-month`} className="input" value={month} onChange={(e) => { setMonth(e.target.value); update(year, e.target.value, day); }}>
        <option value="">Month</option>
        {MONTH_NAMES.map((n, i) => <option key={i} value={String(i + 1).padStart(2, "0")}>{n}</option>)}
      </select>
      <select id={`${idBase}-day`} className="input" value={day} onChange={(e) => { setDay(e.target.value); update(year, month, e.target.value); }}>
        <option value="">Day</option>
        {dayOptions.map((d) => <option key={d} value={String(d).padStart(2, "0")}>{d}</option>)}
      </select>
    </div>
  );
}

function Modal({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20,20,15,0.45)",
        display: "grid",
        placeItems: "center",
        padding: 16,
        zIndex: 100,
      }}
    >
      <div className="card" style={{ maxWidth: 520, width: "100%", padding: 28 }}>
        {children}
      </div>
    </div>
  );
}

export default function FamilyPage() {
  const [list, setList] = useState<FamilyMemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/dashboard/family-members", { credentials: "include" });
    if (res.ok) {
      const data = await res.json();
      setList(Array.isArray(data) ? data : []);
    }
    setLoading(false);
  }

  // Initial load on mount.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, []);

  const pendingCount = list.filter(
    (f) => f.status === "PENDING_APPROVAL" || f.pendingEdit || f.pendingDeletion
  ).length;
  const eligibleCount = list.filter(
    (f) => f.status === "APPROVED" && !isOverAge(f) && !isMarried(f) && !f.pendingDeletion
  ).length;

  return (
    <>
      <Crumbs items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Family" }]} />
      <div className="page-head">
        <div>
          <h1 className="page-h">Manage household</h1>
          <p className="page-sub">
            Bylaws require Executive Committee approval for adds, edits, and deletions. Eligibility follows current SBMI rules (Article 2.5).
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-ghost" style={{ height: 40, padding: "0 16px", fontSize: 13.5 }}>
            <Download size={15} /> Export
          </button>
          <button
            className="btn btn-accent"
            style={{ height: 40, padding: "0 18px", fontSize: 13.5 }}
            onClick={() => { setAddOpen(true); setEditId(null); setDeleteId(null); }}
          >
            <Plus size={15} /> Add family member
          </button>
        </div>
      </div>

      {flash && (
        <div className="callout green" style={{ marginBottom: 18 }}>
          <Check size={16} /><span>{flash}</span>
        </div>
      )}

      {!loading && (
        <div className="callout green" style={{ marginBottom: 18 }}>
          <Check size={16} />
          <span>
            Your household has {list.length} {list.length === 1 ? "record" : "records"} on file.{" "}
            {eligibleCount} {eligibleCount === 1 ? "is" : "are"} eligible
            {pendingCount > 0
              ? ` and ${pendingCount} ${pendingCount === 1 ? "is" : "are"} pending Executive Committee review.`
              : "."}
          </span>
        </div>
      )}

      <div className="card">
        <div className="card-head">
          <h3 className="card-title">Household members</h3>
          <span style={{ fontSize: 12.5, color: "var(--ink-500)" }}>
            {loading ? "Loading…" : `${list.length} of ${list.length} shown`}
          </span>
        </div>
        {loading ? (
          <div style={{ padding: 24, color: "var(--ink-500)", fontSize: 13.5 }}>Loading…</div>
        ) : list.length === 0 ? (
          <div style={{ padding: 24, color: "var(--ink-500)", fontSize: 13.5 }}>
            No family members on record yet. Use &ldquo;Add family member&rdquo; to submit a request (under {MAX_AGE} at time of request, unmarried).
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Member</th>
                <th>Date of birth</th>
                <th>Age</th>
                <th>Relationship</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map((fm) => {
                const overAge = isOverAge(fm);
                const married = isMarried(fm);
                const ineligible = (overAge || married) && fm.status === "APPROVED";
                const pending = fm.status === "PENDING_APPROVAL";
                const pendingEdit = fm.pendingEdit;
                const pendingDel = fm.pendingDeletion;
                const muted = ineligible || pendingDel;
                const pillKey = pending
                  ? "pending-add"
                  : pendingDel
                    ? "pending-delete"
                    : pendingEdit
                      ? "pending-edit"
                      : ineligible
                        ? "ineligible"
                        : "active";
                const pillCfg: Record<string, { cls: string; label: string }> = {
                  "pending-add": { cls: "pill-warn", label: "Pending review" },
                  "pending-delete": { cls: "pill-warn", label: "Pending deletion" },
                  "pending-edit": { cls: "pill-warn", label: "Pending edit" },
                  "ineligible": { cls: "pill-neutral", label: "Ineligible" },
                  "active": { cls: "pill-ok", label: "Active" },
                };
                const pill = pillCfg[pillKey];
                return (
                  <tr key={fm.id} className={muted ? "muted" : ""}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div className="house-avatar" style={{ width: 32, height: 32, fontSize: 11, opacity: muted ? 0.6 : 1 }}>
                          {avatarInitials(fm.fullName)}
                        </div>
                        <div>
                          <div className="tbl-cell-strong">{fm.fullName}</div>
                          {(overAge || married) && fm.status === "APPROVED" && !pendingDel && (
                            <div style={{ fontSize: 12, color: "var(--ink-400)" }}>
                              {overAge && married ? "Over age and married" : overAge ? "Age limit per bylaws" : "Married per bylaws"}
                            </div>
                          )}
                          {pendingEdit && (
                            <div style={{ fontSize: 12, color: "var(--ink-400)" }}>
                              Edit awaiting EC review
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ fontVariantNumeric: "tabular-nums", color: "var(--ink-700)" }}>
                      {formatCalendarDate(fm.birthDate)}
                    </td>
                    <td style={{ fontVariantNumeric: "tabular-nums" }}>{fm.currentAge}</td>
                    <td>{fm.relationship ?? "—"}</td>
                    <td>
                      <span className={"pill " + pill.cls}><span className="pill-dot"></span>{pill.label}</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", alignItems: "center" }}>
                        {!pendingDel && !pending && (
                          <button
                            type="button"
                            disabled={pendingEdit}
                            onClick={() => { setEditId(fm.id); setAddOpen(false); setDeleteId(null); }}
                            className="text-link"
                            style={{ background: "none", border: 0, cursor: pendingEdit ? "not-allowed" : "pointer", color: pendingEdit ? "var(--ink-400)" : "var(--green)", fontWeight: 600, opacity: pendingEdit ? 0.5 : 1 }}
                          >
                            Edit
                          </button>
                        )}
                        {!pendingDel && (
                          <button
                            type="button"
                            onClick={() => { setDeleteId(fm.id); setAddOpen(false); setEditId(null); }}
                            className="text-link"
                            style={{ background: "none", border: 0, cursor: "pointer", color: "var(--danger)", fontWeight: 600 }}
                          >
                            {pending ? "Cancel request" : "Request removal"}
                          </button>
                        )}
                        <ChevronRight size={16} style={{ color: "var(--ink-400)" }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <div className="tbl-foot">
          <span>Showing 1–{list.length} of {list.length} {list.length === 1 ? "member" : "members"}.</span>
          <span style={{ fontSize: 12, color: "var(--ink-400)" }}>
            Age and marital-status restrictions apply per bylaws (Article 2.5).
          </span>
        </div>
      </div>

      {addOpen && (
        <AddForm
          onClose={() => setAddOpen(false)}
          onSaved={() => {
            setAddOpen(false);
            setFlash("Add request submitted. The Executive Committee will review it.");
            load();
          }}
        />
      )}
      {editId && (() => {
        const target = list.find((f) => f.id === editId);
        if (!target) return null;
        return (
          <EditForm
            id={editId}
            initial={target}
            onClose={() => setEditId(null)}
            onSaved={() => {
              setEditId(null);
              setFlash("Edit request submitted. Existing values stay until the Executive Committee reviews.");
              load();
            }}
          />
        );
      })()}
      {deleteId && (() => {
        const target = list.find((f) => f.id === deleteId);
        if (!target) return null;
        const wasPending = target.status === "PENDING_APPROVAL";
        return (
          <DeleteConfirm
            id={deleteId}
            name={target.fullName}
            wasPending={wasPending}
            onClose={() => setDeleteId(null)}
            onDeleted={(cancelled) => {
              setDeleteId(null);
              setFlash(
                cancelled
                  ? "Pending request cancelled."
                  : "Removal request submitted. The member stays visible until the Executive Committee approves."
              );
              load();
            }}
          />
        );
      })()}
    </>
  );
}

function parseFullName(fullName: string) {
  const t = fullName.trim();
  if (!t) return { firstName: "", lastName: "" };
  const i = t.indexOf(" ");
  if (i <= 0) return { firstName: t, lastName: "" };
  return { firstName: t.slice(0, i).trim(), lastName: t.slice(i).trim() };
}

function AddForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [relationship, setRelationship] = useState("");
  const [maritalStatus, setMaritalStatus] = useState<"UNMARRIED" | "MARRIED">("UNMARRIED");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");
    if (!fullName) { setError("First or last name is required."); return; }
    if (!birthDate) { setError("Birth date is required."); return; }
    const d = new Date(birthDate);
    if (Number.isNaN(d.getTime()) || d > new Date()) { setError("Please enter a valid calendar date."); return; }
    if (getAge(d) > MAX_AGE) { setError(`Family members over ${MAX_AGE} at time of request cannot be added.`); return; }
    if (maritalStatus === "MARRIED") { setError("Married dependents cannot be added (bylaws Article 2.5.3)."); return; }
    setLoading(true);
    const res = await fetch("/api/dashboard/family-members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, birthDate, relationship: relationship || undefined, maritalStatus }),
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Could not submit."); return; }
    onSaved();
  }

  return (
    <Modal>
      <h3 style={{ fontFamily: "var(--font-display-stack)", fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 6px" }}>
        Request to add a family member
      </h3>
      <p style={{ fontSize: 13, color: "var(--ink-500)", margin: "0 0 18px" }}>
        Submissions are reviewed by the Executive Committee before they appear in your active household.
      </p>
      <form onSubmit={submit}>
        <div className="form-grid-2">
          <div className="field">
            <label className="label">First name</label>
            <input className="input" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div className="field">
            <label className="label">Last name</label>
            <input className="input" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <div className="field full">
            <label className="label">Birth date</label>
            <BirthDateSelect value={birthDate} onChange={setBirthDate} idBase="add-birth" />
          </div>
          <div className="field">
            <label className="label">Relationship to primary</label>
            <select className="input" value={relationship} onChange={(e) => setRelationship(e.target.value)}>
              <option value="">Select…</option>
              {RELATIONSHIPS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="label">Marital status</label>
            <select className="input" value={maritalStatus} onChange={(e) => setMaritalStatus(e.target.value as "UNMARRIED" | "MARRIED")}>
              <option value="UNMARRIED">Unmarried</option>
              <option value="MARRIED">Married</option>
            </select>
          </div>
          {error && (
            <div className="full callout red">
              <Info size={16} /><span>{error}</span>
            </div>
          )}
          <div className="full" style={{ display: "flex", gap: 10 }}>
            <button type="submit" disabled={loading} className="btn btn-accent" style={{ flex: 1 }}>
              {loading ? "Submitting…" : "Submit for review"}
            </button>
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

function EditForm({
  id,
  initial,
  onClose,
  onSaved,
}: {
  id: string;
  initial: FamilyMemberRow;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { firstName: ifn, lastName: iln } = parseFullName(initial.fullName);
  const [firstName, setFirstName] = useState(ifn);
  const [lastName, setLastName] = useState(iln);
  const [birthDate, setBirthDate] = useState(() => {
    if (!initial.birthDate) return "";
    const d = new Date(initial.birthDate);
    return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
  });
  const [relationship, setRelationship] = useState(initial.relationship ?? "");
  const [maritalStatus, setMaritalStatus] = useState<"UNMARRIED" | "MARRIED">(
    initial.maritalStatus === "MARRIED" ? "MARRIED" : "UNMARRIED"
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");
    if (!fullName) { setError("First or last name is required."); return; }
    if (!birthDate) { setError("Birth date is required."); return; }
    setLoading(true);
    const res = await fetch(`/api/dashboard/family-members/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, birthDate, relationship: relationship || "", maritalStatus }),
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Could not submit."); return; }
    onSaved();
  }

  return (
    <Modal>
      <h3 style={{ fontFamily: "var(--font-display-stack)", fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 6px" }}>
        Request edit for {initial.fullName}
      </h3>
      <p style={{ fontSize: 13, color: "var(--ink-500)", margin: "0 0 18px" }}>
        Existing values stay in place until the Executive Committee approves the change.
      </p>
      <form onSubmit={submit}>
        <div className="form-grid-2">
          <div className="field">
            <label className="label">First name</label>
            <input className="input" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div className="field">
            <label className="label">Last name</label>
            <input className="input" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <div className="field full">
            <label className="label">Birth date</label>
            <BirthDateSelect value={birthDate} onChange={setBirthDate} idBase="edit-birth" />
          </div>
          <div className="field">
            <label className="label">Relationship to primary</label>
            <select className="input" value={relationship} onChange={(e) => setRelationship(e.target.value)}>
              <option value="">Select…</option>
              {RELATIONSHIPS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="label">Marital status</label>
            <select className="input" value={maritalStatus} onChange={(e) => setMaritalStatus(e.target.value as "UNMARRIED" | "MARRIED")}>
              <option value="UNMARRIED">Unmarried</option>
              <option value="MARRIED">Married</option>
            </select>
            {maritalStatus === "MARRIED" && initial.maritalStatus !== "MARRIED" && (
              <div className="field-status">
                <Info size={12} />
                Marking as Married moves this dependent to Ineligible per bylaws Article 2.5.3 once the Executive Committee approves.
              </div>
            )}
          </div>
          {error && (
            <div className="full callout red">
              <Info size={16} /><span>{error}</span>
            </div>
          )}
          <div className="full" style={{ display: "flex", gap: 10 }}>
            <button type="submit" disabled={loading} className="btn btn-accent" style={{ flex: 1 }}>
              {loading ? "Submitting…" : "Submit for review"}
            </button>
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

function DeleteConfirm({
  id,
  name,
  wasPending,
  onClose,
  onDeleted,
}: {
  id: string;
  name: string;
  wasPending: boolean;
  onClose: () => void;
  onDeleted: (cancelled: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function confirm() {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/dashboard/family-members/${id}`, { method: "DELETE", credentials: "include" });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Could not submit.");
      return;
    }
    onDeleted(Boolean(data.cancelled));
  }
  return (
    <Modal>
      <h3 style={{ fontFamily: "var(--font-display-stack)", fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 12px" }}>
        {wasPending ? `Cancel pending request for ${name}?` : `Request removal of ${name}?`}
      </h3>
      <p style={{ fontSize: 14, color: "var(--ink-500)", lineHeight: 1.5, margin: "0 0 22px" }}>
        {wasPending
          ? "Cancelling discards the pending add request entirely. The member never enters your household."
          : "This submits a deletion request to the Executive Committee. The member stays on your roster until the request is approved."}
      </p>
      {error && <div className="callout red" style={{ marginBottom: 14 }}><Info size={16} /><span>{error}</span></div>}
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={confirm} disabled={loading} className="btn btn-accent" style={{ flex: 1, background: "var(--danger)" }}>
          {loading ? "Submitting…" : wasPending ? "Cancel request" : "Submit removal request"}
        </button>
        <button onClick={onClose} className="btn btn-ghost">Keep</button>
      </div>
    </Modal>
  );
}
