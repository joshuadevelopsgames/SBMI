"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, FileText, Heart, Info } from "lucide-react";
import { Crumbs } from "@/components/portal/Chrome";
import { ASSISTANCE_DESCRIPTION_MAX_CHARS } from "@/lib/assistance-constants";

type FamilyMember = { id: string; fullName: string };

/** US60: household (self ± approved household member) vs someone outside the household. */
type Scope = "household" | "community";

export default function AssistancePage() {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loadingFamily, setLoadingFamily] = useState(true);
  const [memberStatus, setMemberStatus] = useState<string | null>(null);
  const [scope, setScope] = useState<Scope>("household");
  const [familyMemberId, setFamilyMemberId] = useState("");
  const [otherName, setOtherName] = useState("");
  const [otherPhone, setOtherPhone] = useState("");
  const [supportType, setSupportType] = useState("Medical hardship");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/me", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data?.status) setMemberStatus(data.status);
      })
      .catch(() => setMemberStatus(null));
  }, []);

  useEffect(() => {
    fetch("/api/dashboard/family-members", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        const rows = Array.isArray(data) ? data : [];
        setFamilyMembers(
          rows
            .filter((fm: { status?: string }) => fm.status === "APPROVED")
            .map((fm: { id: string; fullName: string }) => ({ id: fm.id, fullName: fm.fullName }))
        );
      })
      .catch(() => setFamilyMembers([]))
      .finally(() => setLoadingFamily(false));
  }, []);

  const assistanceLocked = memberStatus !== null && memberStatus !== "ACTIVE";
  const descriptionBodyLimit = Math.max(0, ASSISTANCE_DESCRIPTION_MAX_CHARS - `[${supportType}] `.length);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (assistanceLocked) return;
    if (!description.trim()) {
      setMessage({ type: "error", text: "Description is required." });
      return;
    }
    const composed = `[${supportType}] ${description.trim()}`;
    if (composed.length > ASSISTANCE_DESCRIPTION_MAX_CHARS) {
      setMessage({
        type: "error",
        text: `Description is too long (max ${ASSISTANCE_DESCRIPTION_MAX_CHARS} characters including the support type prefix).`,
      });
      return;
    }
    if (scope === "community") {
      if (!otherName.trim() || !otherPhone.trim()) {
        setMessage({ type: "error", text: "Name and phone are required for someone outside your household." });
        return;
      }
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/dashboard/assistance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestType: scope === "community" ? "OTHER" : "SELF",
          familyMemberId: scope === "household" ? familyMemberId.trim() || undefined : undefined,
          otherName: scope === "community" ? otherName.trim() : undefined,
          otherPhone: scope === "community" ? otherPhone.trim() : undefined,
          description: composed,
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
      setOtherName("");
      setOtherPhone("");
    } catch {
      setMessage({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Crumbs items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Assistance" }]} />
      <div className="page-head">
        <div>
          <h1 className="page-h">Request assistance</h1>
          <p className="page-sub">
            Reach out to the community. Requests are confidential and reviewed by the Executive Committee per bylaws.
          </p>
        </div>
      </div>

      <div className="split-2">
        <form className="card card-pad" style={{ padding: 32 }} onSubmit={handleSubmit}>
          <div className="form-grid-2">
            {assistanceLocked && (
              <div className="field full callout" role="status">
                <Info size={16} />
                <span>
                  Request assistance unlocks after you complete registration payment and your account is{" "}
                  <strong>Active</strong>.{" "}
                  <Link href="/registration-payment" style={{ color: "var(--green)", fontWeight: 600 }}>
                    Complete registration
                  </Link>
                  {" · "}
                  <Link href="/dashboard/family" style={{ color: "var(--green)", fontWeight: 600 }}>
                    Manage family
                  </Link>
                </span>
              </div>
            )}

            <div className="field full">
              <label className="label">Who needs assistance?</label>
              <div className="radio-cards">
                <button
                  type="button"
                  className={"radio-card" + (scope === "household" ? " selected" : "")}
                  onClick={() => setScope("household")}
                  disabled={assistanceLocked}
                >
                  <span className="rd" aria-hidden="true">
                    <span className="rd-fill" />
                  </span>
                  <div>
                    <h5>For myself (and/or a household member)</h5>
                    <p>You or someone already on your SBMI household roster.</p>
                  </div>
                </button>
                <button
                  type="button"
                  className={"radio-card" + (scope === "community" ? " selected" : "")}
                  onClick={() => setScope("community")}
                  disabled={assistanceLocked}
                >
                  <span className="rd" aria-hidden="true">
                    <span className="rd-fill" />
                  </span>
                  <div>
                    <h5>For someone else in the community</h5>
                    <p>Not in your registered household — name and phone required.</p>
                  </div>
                </button>
              </div>
            </div>

            {scope === "household" && (
              <div className="field full">
                <label className="label">Beneficiary</label>
                {loadingFamily ? (
                  <div className="select-fake placeholder">Loading…</div>
                ) : familyMembers.length === 0 ? (
                  <>
                    <div className="field-hint" style={{ marginBottom: 8 }}>
                      Primary member (you). Add household members under{" "}
                      <Link href="/dashboard/family" style={{ color: "var(--green)", fontWeight: 600 }}>
                        Manage family
                      </Link>{" "}
                      if the need involves someone else in your home.
                    </div>
                    <input className="input" readOnly value="Primary member (you)" />
                  </>
                ) : (
                  <>
                    <select
                      className="input"
                      value={familyMemberId}
                      onChange={(e) => setFamilyMemberId(e.target.value)}
                      disabled={assistanceLocked}
                    >
                      <option value="">Primary member (me)</option>
                      {familyMembers.map((fm) => (
                        <option key={fm.id} value={fm.id}>
                          {fm.fullName}
                        </option>
                      ))}
                    </select>
                    <div className="field-hint">
                      <Link href="/dashboard/family" style={{ color: "var(--green)", fontWeight: 600 }}>
                        Manage family
                      </Link>{" "}
                      to update your roster before submitting.
                    </div>
                  </>
                )}
              </div>
            )}

            {scope === "community" && (
              <>
                <div className="field">
                  <label className="label">Their name</label>
                  <input
                    className="input"
                    value={otherName}
                    onChange={(e) => setOtherName(e.target.value)}
                    placeholder="Full name"
                    disabled={assistanceLocked}
                  />
                </div>
                <div className="field">
                  <label className="label">Their phone</label>
                  <input
                    className="input"
                    value={otherPhone}
                    onChange={(e) => setOtherPhone(e.target.value)}
                    placeholder="Best daytime number"
                    disabled={assistanceLocked}
                  />
                </div>
              </>
            )}

            <div className="field full">
              <label className="label">Type of support</label>
              <select className="input" value={supportType} onChange={(e) => setSupportType(e.target.value)}>
                <option>Bereavement</option>
                <option>Medical hardship</option>
                <option>Financial hardship</option>
                <option>Other</option>
              </select>
              <div className="field-hint">Bereavement · Medical · Financial hardship · Other</div>
            </div>

            <div className="field full">
              <label className="label">Description of need</label>
              <textarea
                className="textarea"
                rows={6}
                value={description}
                maxLength={descriptionBodyLimit}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please share enough context so reviewers can act with care."
              />
              <div className="field-hint">
                Visible only to authorized EC members. Max {ASSISTANCE_DESCRIPTION_MAX_CHARS} characters total (with
                support type). {description.length}/{descriptionBodyLimit}
              </div>
            </div>

            <div className="field full">
              <label className="label">
                Supporting documents <span style={{ color: "var(--ink-400)", fontWeight: 400 }}>· optional but recommended</span>
              </label>
              <div className="upload-box">
                <FileText size={22} />
                <div>
                  <strong>Add documents</strong> — medical letters, receipts, etc.
                </div>
                <div style={{ fontSize: 11.5, color: "var(--ink-400)" }}>PDF, JPG, PNG · up to 3 files · 5 MB each</div>
              </div>
            </div>

            {message && (
              <div className={"full callout " + (message.type === "ok" ? "green" : "red")} role="alert">
                <Info size={16} />
                <span>{message.text}</span>
              </div>
            )}

            <div className="full" style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button
                type="submit"
                disabled={submitting || assistanceLocked}
                className="btn btn-accent"
                style={{ flex: 1 }}
              >
                {submitting ? "Submitting…" : "Submit request"}
                {!submitting && <ArrowRight size={15} />}
              </button>
              <button type="button" className="btn btn-ghost">Save as draft</button>
            </div>
          </div>
        </form>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="aside-card">
            <h5>How requests are handled</h5>
            <ol style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: "var(--ink-700)", lineHeight: 1.7 }}>
              <li>Routed to the Executive Committee.</li>
              <li>Reviewers may ask follow-up questions privately.</li>
              <li>Decision recorded once quorum is met.</li>
              <li>You&apos;re notified by email at every step.</li>
            </ol>
          </div>
          <div className="callout green">
            <Heart size={16} />
            <span>You are not alone. SBMI has supported over 240 households through medical hardship since 2009.</span>
          </div>
          <div className="aside-card">
            <h5>Need to talk first?</h5>
            <p style={{ margin: "0 0 8px" }}>You can reach an EC volunteer directly before submitting.</p>
            <a className="text-link" style={{ color: "var(--green)" }}>
              Contact Executive Committee →
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
