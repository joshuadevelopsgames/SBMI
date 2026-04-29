"use client";

import { useEffect, useState } from "react";
import { formatCalendarDate, formatDate } from "@/lib/date";

type FamilyMemberRow = {
  id: string;
  fullName: string;
  birthDate: string;
  currentAge: number;
};

type FamilyChangeRequestRow = {
  id: string;
  action: "ADD" | "REMOVE";
  status: string;
  familyMemberId: string | null;
  fullName: string;
  birthDate: string;
  createdAt: string;
};

const MAX_AGE = 25;
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const CURRENT_YEAR = new Date().getFullYear();
const BIRTH_YEAR_START = 1920;

function daysInMonth(year: number, month: number): number {
  if (year <= 0 || month < 1 || month > 12) return 31;
  return new Date(year, month, 0).getDate();
}

function toDateParts(iso: string): { year: string; month: string; day: string } {
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

function BirthDateSelect({
  value,
  onChange,
  id,
}: {
  value: string;
  onChange: (value: string) => void;
  id?: string;
}) {
  const parts = toDateParts(value);
  const [year, setYear] = useState(parts.year);
  const [month, setMonth] = useState(parts.month);
  const [day, setDay] = useState(parts.day);

  const update = (y: string, m: string, d: string) => {
    const next = fromDateParts(y, m, d);
    if (next) onChange(next);
  };

  const yearOptions = Array.from({ length: CURRENT_YEAR - BIRTH_YEAR_START + 1 }, (_, i) => CURRENT_YEAR - i);
  const numDay = daysInMonth(year ? parseInt(year, 10) : CURRENT_YEAR, month ? parseInt(month, 10) : 1);
  const dayOptions = Array.from({ length: numDay }, (_, i) => i + 1);

  return (
    <div className="grid grid-cols-3 gap-2" id={id}>
      <div>
        <label htmlFor={`${id ?? "bd"}-year`} className="sr-only">Year</label>
        <select
          id={`${id ?? "bd"}-year`}
          value={year}
          onChange={(e) => {
            const y = e.target.value;
            setYear(y);
            update(y, month, day);
          }}
          className="w-full rounded-lg border border-[#E2DCD2] px-3 py-2.5 text-[#1B5E3B] sbmi-input text-sm"
        >
          <option value="">Year</option>
          {yearOptions.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor={`${id ?? "bd"}-month`} className="sr-only">Month</label>
        <select
          id={`${id ?? "bd"}-month`}
          value={month}
          onChange={(e) => {
            const m = e.target.value;
            setMonth(m);
            update(year, m, day);
          }}
          className="w-full rounded-lg border border-[#E2DCD2] px-3 py-2.5 text-[#1B5E3B] sbmi-input text-sm"
        >
          <option value="">Month</option>
          {MONTH_NAMES.map((name, i) => (
            <option key={i} value={String(i + 1).padStart(2, "0")}>{name}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor={`${id ?? "bd"}-day`} className="sr-only">Day</label>
        <select
          id={`${id ?? "bd"}-day`}
          value={day}
          onChange={(e) => {
            const d = e.target.value;
            setDay(d);
            update(year, month, d);
          }}
          className="w-full rounded-lg border border-[#E2DCD2] px-3 py-2.5 text-[#1B5E3B] sbmi-input text-sm"
        >
          <option value="">Day</option>
          {dayOptions.map((d) => (
            <option key={d} value={String(d).padStart(2, "0")}>{d}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default function FamilyPage() {
  const [list, setList] = useState<FamilyMemberRow[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FamilyChangeRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  async function load() {
    try {
      const [familyRes, requestRes] = await Promise.all([
        fetch("/api/dashboard/family-members", { credentials: "include" }),
        fetch("/api/dashboard/family-member-change-requests", { credentials: "include" }),
      ]);
      if (familyRes.ok) {
        const data = await familyRes.json();
        setList(Array.isArray(data) ? data : []);
      } else {
        setList([]);
      }
      if (requestRes.ok) {
        const data = await requestRes.json();
        setPendingRequests(Array.isArray(data) ? data : []);
      } else {
        setPendingRequests([]);
      }
    } catch {
      setList([]);
      setPendingRequests([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const pendingRemovalIds = new Set(
    pendingRequests
      .filter((request) => request.action === "REMOVE" && request.familyMemberId)
      .map((request) => request.familyMemberId as string)
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px flex-1 min-w-0 bg-[#D4A43A]" />
        <span className="text-xs tracking-[0.2em] text-[#D4A43A] uppercase font-medium shrink-0">
          Family
        </span>
      </div>
      <h1 className="text-2xl font-display font-semibold text-[#1B5E3B] mb-2">
        Family members
      </h1>
      <p className="text-sm text-[#3D5A4A] mb-6">
        Age and marital status for eligibility are defined in the bylaws (Article 2.5). Add and remove requests require admin approval before changes are applied.
      </p>
      {notice && (
        <p className="mb-6 text-sm rounded-lg px-3 py-2 bg-[#D4A43A]/10 border border-[#D4A43A]/30 text-[#1B5E3B]">
          {notice}
        </p>
      )}

      <div className="sbmi-card overflow-hidden mb-6">
        <div className="px-5 py-3.5 border-b border-[#E2DCD2] flex items-center justify-between">
          <h2 className="font-display font-semibold text-[#1B5E3B]">Household members</h2>
          <button
            type="button"
            onClick={() => { setAddOpen(true); setEditId(null); setDeleteId(null); }}
            className="rounded-lg border border-[#1B5E3B] text-[#1B5E3B] px-3 py-1.5 text-sm font-medium hover:bg-[#1B5E3B] hover:text-white transition-colors"
          >
            Add family member
          </button>
        </div>
        {loading ? (
          <div className="p-6 text-[#3D5A4A] text-sm">Loading…</div>
        ) : list.length === 0 ? (
          <div className="p-6 text-[#3D5A4A] text-sm">
            No family members added yet. Use “Add family member” to add someone (under 25 at time of entry).
          </div>
        ) : (
          <ul className="divide-y divide-[#E2DCD2]">
            {list.map((fm) => {
              const removalPending = pendingRemovalIds.has(fm.id);
              return (
                <li
                  key={fm.id}
                  className={`p-4 flex flex-wrap items-center justify-between gap-2 ${fm.currentAge > MAX_AGE ? "opacity-60 bg-[#FAF7F0]" : ""}`}
                >
                  <div>
                    <p className={`font-medium text-[#1B5E3B] ${fm.currentAge > MAX_AGE ? "text-[#3D5A4A]" : ""}`}>
                      {fm.fullName}
                    </p>
                    <p className="text-sm text-[#3D5A4A]">
                      Birth date: {formatCalendarDate(fm.birthDate)} · Age {fm.currentAge}
                    </p>
                    {fm.currentAge > MAX_AGE && (
                      <p className="text-sm italic text-[#3D5A4A] mt-1">
                        Age now invalidates eligibility for Iddir benefits under the bylaws.
                      </p>
                    )}
                    {removalPending && (
                      <p className="text-xs text-[#3D5A4A]/80 mt-1">
                        Removal request pending admin approval.
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => { setEditId(fm.id); setAddOpen(false); setDeleteId(null); }}
                      className="text-sm text-[#1B5E3B] hover:underline font-medium"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => { setDeleteId(fm.id); setAddOpen(false); setEditId(null); }}
                      disabled={removalPending}
                      className={`text-sm ${removalPending ? "text-[#3D5A4A]/60 cursor-not-allowed" : "text-red-600 hover:underline"}`}
                    >
                      {removalPending ? "Removal pending" : "Delete"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="sbmi-card overflow-hidden mb-6">
        <div className="px-5 py-3.5 border-b border-[#E2DCD2]">
          <h2 className="font-display font-semibold text-[#1B5E3B]">Pending household change requests</h2>
        </div>
        {loading ? (
          <div className="p-6 text-[#3D5A4A] text-sm">Loading…</div>
        ) : pendingRequests.length === 0 ? (
          <div className="p-6 text-[#3D5A4A] text-sm">
            No pending requests.
          </div>
        ) : (
          <ul className="divide-y divide-[#E2DCD2]">
            {pendingRequests.map((request) => (
              <li key={request.id} className="p-4">
                <p className="font-medium text-[#1B5E3B]">
                  {request.action === "ADD" ? "Add request" : "Remove request"}: {request.fullName}
                </p>
                <p className="text-sm text-[#3D5A4A]">
                  Birth date: {formatCalendarDate(request.birthDate)}
                </p>
                <p className="text-xs text-[#3D5A4A]/80 mt-1">
                  Submitted {formatDate(request.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {addOpen && (
        <AddForm
          onClose={() => setAddOpen(false)}
          onSaved={(message) => { setAddOpen(false); setNotice(message); setLoading(true); void load(); }}
        />
      )}
      {editId && (
        <EditForm
          id={editId}
          initialFullName={list.find((f) => f.id === editId)?.fullName ?? ""}
          initialBirthDate={list.find((f) => f.id === editId)?.birthDate ?? ""}
          onClose={() => setEditId(null)}
          onSaved={() => { setEditId(null); setLoading(true); void load(); }}
        />
      )}
      {deleteId && (
        <DeleteConfirm
          id={deleteId}
          name={list.find((f) => f.id === deleteId)?.fullName ?? "this person"}
          onClose={() => setDeleteId(null)}
          onDeleted={(message) => { setDeleteId(null); setNotice(message); setLoading(true); void load(); }}
        />
      )}
    </div>
  );
}

function AddForm({ onClose, onSaved }: { onClose: () => void; onSaved: (message: string) => void }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");
    if (!fullName) {
      setError("First or last name is required.");
      return;
    }
    if (!birthDate) {
      setError("Birth date is required.");
      return;
    }
    const d = new Date(birthDate);
    if (Number.isNaN(d.getTime()) || d > new Date()) {
      setError("Please enter a valid calendar date.");
      return;
    }
    const age = getAge(d);
    if (age > MAX_AGE) {
      setError(`Family members over ${MAX_AGE} years of age at time of entry cannot be added.`);
      return;
    }
    setLoading(true);
    const res = await fetch("/api/dashboard/family-members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, birthDate }),
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Could not add.");
      return;
    }
    onSaved(data.message ?? "Your add request was submitted for admin approval.");
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-10">
      <div className="bg-white rounded-xl border border-[#E2DCD2] shadow-xl max-w-md w-full p-6">
        <h3 className="font-display font-semibold text-[#1B5E3B] mb-4">Add family member</h3>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1B5E3B] mb-1">First name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full rounded-lg border border-[#E2DCD2] px-3 py-2.5 text-[#1B5E3B] sbmi-input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1B5E3B] mb-1">Last name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full rounded-lg border border-[#E2DCD2] px-3 py-2.5 text-[#1B5E3B] sbmi-input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1B5E3B] mb-1">Birth date</label>
            <BirthDateSelect value={birthDate} onChange={setBirthDate} id="add-birthdate" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-[#D4A43A] text-[#171717] px-4 py-2.5 font-medium hover:bg-[#C4922E] disabled:opacity-50 shadow-sm transition-colors"
            >
              {loading ? "Submitting…" : "Submit request"}
            </button>
            <button type="button" onClick={onClose} className="rounded-lg border border-[#E2DCD2] px-4 py-2.5 text-[#1B5E3B] hover:bg-[#FAF7F0] transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function parseFullName(fullName: string): { firstName: string; lastName: string } {
  const t = fullName.trim();
  if (!t) return { firstName: "", lastName: "" };
  const i = t.indexOf(" ");
  if (i <= 0) return { firstName: t, lastName: "" };
  return { firstName: t.slice(0, i).trim(), lastName: t.slice(i).trim() };
}

function EditForm({
  id,
  initialFullName,
  initialBirthDate,
  onClose,
  onSaved,
}: {
  id: string;
  initialFullName: string;
  initialBirthDate: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { firstName: initialFirst, lastName: initialLast } = parseFullName(initialFullName);
  const [firstName, setFirstName] = useState(initialFirst);
  const [lastName, setLastName] = useState(initialLast);
  const [birthDate, setBirthDate] = useState(() => {
    if (!initialBirthDate) return "";
    const d = new Date(initialBirthDate);
    return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");
    if (!fullName) {
      setError("First or last name is required.");
      return;
    }
    const d = new Date(birthDate);
    if (!birthDate || Number.isNaN(d.getTime()) || d > new Date()) {
      setError("Please enter a valid calendar date.");
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/dashboard/family-members/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, birthDate }),
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Could not update.");
      return;
    }
    onSaved();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-10">
      <div className="bg-white rounded-xl border border-[#E2DCD2] shadow-xl max-w-md w-full p-6">
        <h3 className="font-display font-semibold text-[#1B5E3B] mb-4">Edit household member</h3>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1B5E3B] mb-1">First name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full rounded-lg border border-[#E2DCD2] px-3 py-2.5 text-[#1B5E3B] sbmi-input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1B5E3B] mb-1">Last name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full rounded-lg border border-[#E2DCD2] px-3 py-2.5 text-[#1B5E3B] sbmi-input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1B5E3B] mb-1">Birth date</label>
            <BirthDateSelect value={birthDate} onChange={setBirthDate} id="edit-birthdate" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-[#D4A43A] text-[#171717] px-4 py-2.5 font-medium hover:bg-[#C4922E] disabled:opacity-50 shadow-sm transition-colors"
            >
              {loading ? "Saving…" : "Save"}
            </button>
            <button type="button" onClick={onClose} className="rounded-lg border border-[#E2DCD2] px-4 py-2.5 text-[#1B5E3B] hover:bg-[#FAF7F0] transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirm({
  id,
  name,
  onClose,
  onDeleted,
}: {
  id: string;
  name: string;
  onClose: () => void;
  onDeleted: (message: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  async function confirm() {
    setLoading(true);
    const res = await fetch(`/api/dashboard/family-members/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (res.ok) onDeleted(data.message ?? "Your removal request was submitted for admin approval.");
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-10">
      <div className="bg-white rounded-xl border border-[#E2DCD2] shadow-xl max-w-md w-full p-6">
        <h3 className="font-display font-semibold text-[#1B5E3B] mb-2">Request family member removal</h3>
        <p className="text-[#3D5A4A] text-sm mb-4">
          Submit a request to remove {name} from your list. An admin must approve before the member is removed.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={confirm}
            disabled={loading}
            className="rounded-lg bg-red-600 text-white px-4 py-2.5 font-medium hover:bg-red-700 disabled:opacity-50 shadow-sm transition-colors"
          >
            {loading ? "Submitting…" : "Request removal"}
          </button>
          <button type="button" onClick={onClose} className="rounded-lg border border-[#E2DCD2] px-4 py-2.5 text-[#1B5E3B] hover:bg-[#FAF7F0] transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function getAge(birthDate: Date): number {
  const now = new Date();
  let a = now.getFullYear() - birthDate.getFullYear();
  const m = now.getMonth() - birthDate.getMonth();
  const d = now.getDate() - birthDate.getDate();
  if (m < 0 || (m === 0 && d < 0)) a--;
  return a;
}
