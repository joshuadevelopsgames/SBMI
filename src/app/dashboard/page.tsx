import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/date";
import { getPaymentSummary, formatCents } from "@/lib/payment-summary";
import { labelForCategoryCode } from "@/lib/membership-categories";
import { REGISTRATION_TOTAL_CAD } from "@/lib/registration-fee";
import {
  Calendar,
  Shield,
  Wallet,
  ChevronRight,
  Plus,
  History,
  User as UserIcon,
  Users,
  LifeBuoy,
  FileText,
  ArrowUpRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

function avatarInitials(first: string, last: string): string {
  const a = first.trim().charAt(0);
  const b = last.trim().charAt(0);
  return (a + b).toUpperCase() || "M";
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.memberId) {
    return (
      <div className="card card-pad" style={{ padding: 28 }}>
        <h1 className="page-h">Dashboard</h1>
        <p style={{ color: "var(--ink-500)" }}>Your member profile is not linked. Please contact an administrator.</p>
      </div>
    );
  }

  const member = await prisma.member.findUnique({
    where: { id: session.memberId },
    include: {
      household: true,
      // SOW US27: pending family changes stay in the list until EC review;
      // we filter to APPROVED only for the dashboard household preview.
      familyMembers: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "asc" },
      },
      user: { select: { lastSuccessfulLoginAt: true } },
    },
  });
  if (!member) {
    return (
      <div className="card card-pad" style={{ padding: 28 }}>
        <h1 className="page-h">Dashboard</h1>
        <p style={{ color: "var(--ink-500)" }}>Member record not found.</p>
      </div>
    );
  }

  const summary = await getPaymentSummary(member.id);
  const pendingRegistration = member.status === "PENDING_REGISTRATION";

  const recentPayments = await prisma.payment.findMany({
    where: { memberId: member.id },
    orderBy: [{ paidAt: "desc" }, { createdAt: "desc" }],
    take: 3,
  });

  const familyMembers = member.familyMembers ?? [];
  const householdCount = 1 + familyMembers.length;
  const today = new Date();
  function age(b: Date): number {
    const y = today.getFullYear() - b.getFullYear();
    const beforeBirthday =
      today.getMonth() < b.getMonth() ||
      (today.getMonth() === b.getMonth() && today.getDate() < b.getDate());
    return beforeBirthday ? y - 1 : y;
  }

  // Status pill
  const pill = pendingRegistration
    ? { cls: "pill-warn", label: "Registration payment due" }
    : summary?.state === "overdue"
      ? { cls: "pill-danger", label: "Overdue" }
      : summary?.state === "paid_ahead"
        ? { cls: "pill-ok", label: "Paid ahead" }
        : summary
          ? { cls: "pill-ok", label: "Up to date" }
          : { cls: "pill-neutral", label: "Not configured" };

  // Year-to-date contribution percentage
  const yearStart = new Date(new Date().getFullYear(), 0, 1);
  const ytdPayments = await prisma.payment.findMany({
    where: {
      memberId: member.id,
      status: "COMPLETED",
      paidAt: { gte: yearStart },
    },
  });
  const ytdCents = Math.round(ytdPayments.reduce((s, p) => s + p.amount * 100, 0));
  const ytdGoalCents = (summary?.nextMinAmountCents ?? 2500) * 12;
  const progress = ytdGoalCents > 0 ? Math.min(100, Math.round((ytdCents / ytdGoalCents) * 100)) : 0;

  const nowMs = today.getTime();
  const nextDue = summary?.nextDueDate ? formatDate(new Date(summary.nextDueDate)) : "—";
  const nextDueDays = summary?.nextDueDate
    ? Math.max(0, Math.ceil((new Date(summary.nextDueDate).getTime() - nowMs) / 86_400_000))
    : null;

  const memberSince = member.joinedAt ? formatDate(member.joinedAt) : "—";
  const memberCategoryLabel =
    labelForCategoryCode(member.membershipCategoryCode) ??
    (member.paymentSchedule === "MONTHLY" ? "Full Member (Individual)" : "Full Member");

  // SOW US16: dashboard surfaces last successful login (after 2FA where applicable)
  const lastLogin = member.user?.lastSuccessfulLoginAt ?? null;
  const lastLoginLabel = lastLogin
    ? new Date(lastLogin).toLocaleString("en-CA", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZone: "America/Edmonton",
      })
    : null;

  const statusLine =
    member.status === "PENDING_REGISTRATION"
      ? "Pending registration payment"
      : member.status === "ACTIVE"
        ? "Active"
        : member.status;

  return (
    <>
      {pendingRegistration && (
        <section
          className="callout"
          style={{
            marginBottom: 20,
            alignItems: "flex-start",
            background: "var(--paper)",
            borderColor: "var(--hairline)",
          }}
        >
          <Wallet size={18} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <strong style={{ display: "block", marginBottom: 6 }}>Complete your registration</strong>
            <p style={{ margin: 0, fontSize: 14, color: "var(--ink-600)", lineHeight: 1.55 }}>
              Your application is approved. Pay the one-time registration fee to activate full membership and unlock
              assistance requests.
            </p>
            <Link href="/registration-payment" className="btn btn-accent" style={{ marginTop: 14, display: "inline-flex" }}>
              Go to registration payment
              <ChevronRight size={14} />
            </Link>
          </div>
        </section>
      )}

      <section className="welcome-row">
        <div>
          <h1 className="welcome-h">
            Welcome back, <em>{member.firstName}</em>
          </h1>
          <p className="welcome-sub">
            Member since {memberSince} · {memberCategoryLabel}
            {member.memberNumber ? ` · ID #${member.memberNumber}` : ""}
          </p>
        </div>
        <div className="welcome-meta">
          <span className="meta-pill">
            <Calendar size={13} style={{ color: "var(--ink-500)" }} />
            {lastLoginLabel ? `Last sign-in · ${lastLoginLabel}` : `Status · ${member.status}`}
          </span>
          <span className="meta-pill">
            <Shield size={13} style={{ color: "var(--accent)" }} />
            2-step verification on
          </span>
        </div>
      </section>

      <section className="dash-grid">
        <div className="pay-card">
          <div className="pay-status-row">
            <div>
              <div className="pay-eyebrow">
                {pendingRegistration
                  ? "Registration fee"
                  : summary?.state === "overdue"
                    ? "Amount past due"
                    : "Monthly contribution"}
              </div>
              <div className="pay-amt">
                <span className="currency">CAD</span>
                {pendingRegistration ? (
                  <>
                    {Math.floor(REGISTRATION_TOTAL_CAD)}
                    <span className="cents">.{String(Math.round((REGISTRATION_TOTAL_CAD % 1) * 100)).padStart(2, "0")}</span>
                  </>
                ) : summary ? (
                  (() => {
                    const cents = summary.state === "overdue" ? summary.totalPastDueCents : summary.nextMinAmountCents;
                    const dollars = Math.floor(cents / 100);
                    const c = String(cents % 100).padStart(2, "0");
                    return (
                      <>
                        {dollars}
                        <span className="cents">.{c}</span>
                      </>
                    );
                  })()
                ) : (
                  "—"
                )}
              </div>
              <div className="pay-due">
                {pendingRegistration ? (
                  <>
                    Due after EC approval — see{" "}
                    <Link href="/registration-payment" style={{ fontWeight: 600, color: "var(--green)" }}>
                      registration payment
                    </Link>
                    . Monthly dues summary appears once you are Active.
                  </>
                ) : summary ? (
                  summary.state === "overdue" ? (
                    <>
                      Overdue since <strong>{nextDue}</strong>
                    </>
                  ) : (
                    <>
                      Next due <strong>{nextDue}</strong>
                      {nextDueDays != null ? ` · ${nextDueDays} days from now` : ""}
                    </>
                  )
                ) : (
                  "Payment configuration is required."
                )}
              </div>
            </div>
            <span className={"pill " + pill.cls}>
              <span className="pill-dot"></span>
              {pill.label}
            </span>
          </div>

          {!pendingRegistration && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--ink-500)", marginBottom: 6, fontWeight: 500 }}>
                <span>{new Date().getFullYear()} contributions</span>
                <span style={{ fontVariantNumeric: "tabular-nums" }}>
                  {formatCents(ytdCents)} of {formatCents(ytdGoalCents)} paid
                </span>
              </div>
              <div className="pay-progress">
                <div className="pay-progress-fill" style={{ width: progress + "%" }} />
              </div>
            </div>
          )}

          <div className="pay-actions">
            <Link href={pendingRegistration ? "/registration-payment" : "/dashboard/payments"} className="btn btn-accent">
              <Wallet size={16} />
              {pendingRegistration ? "Pay registration fee" : "Make a payment"}
            </Link>
            <Link href="/dashboard/payments#history" className="btn btn-ghost">
              <History size={16} />
              View history
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h3 className="card-title">Household · {householdCount} {householdCount === 1 ? "member" : "members"}</h3>
            <Link href="/dashboard/family" className="card-link">
              Manage <ChevronRight size={14} />
            </Link>
          </div>
          <div className="house-rows">
            <div className="house-row">
              <div className="house-avatar primary">{avatarInitials(member.firstName, member.lastName)}</div>
              <div>
                <div className="house-name">
                  {member.firstName} {member.lastName}
                </div>
                <div className="house-meta">Primary member · {memberCategoryLabel}</div>
              </div>
              <span
                className={
                  "pill " +
                  (member.status === "ACTIVE" ? "pill-ok" : member.status === "PENDING_REGISTRATION" ? "pill-warn" : "pill-neutral")
                }
              >
                <span className="pill-dot"></span>
                {statusLine}
              </span>
            </div>
            {familyMembers.slice(0, 3).map((fm) => {
              const [first = "", ...rest] = fm.fullName.split(" ");
              const last = rest.join(" ");
              const a = age(fm.birthDate);
              return (
                <div key={fm.id} className="house-row">
                  <div className="house-avatar">{avatarInitials(first, last)}</div>
                  <div>
                    <div className="house-name">{fm.fullName}</div>
                    <div className="house-meta">Household · age {a}</div>
                  </div>
                  <span className={"pill " + (a >= 25 ? "pill-warn" : "pill-ok")}>
                    <span className="pill-dot"></span>
                    {a >= 25 ? "Review" : "Active"}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="house-foot">
            <span>Bylaws require head-of-household approval for changes.</span>
            <Link href="/dashboard/family">
              <Plus size={12} aria-hidden />
              Add member
            </Link>
          </div>
        </div>
      </section>

      <div style={{ marginBottom: 6, marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h3 className="card-title" style={{ color: "var(--ink-700)" }}>Quick actions</h3>
        <span style={{ fontSize: 12.5, color: "var(--ink-500)" }}>Common things members do here</span>
      </div>
      <section className="actions-grid">
        <Link href="/dashboard/profile" className="action-card">
          <div className="action-icon"><UserIcon size={19} /></div>
          <div>
            <h4 className="action-title">Update profile</h4>
            <p className="action-desc">Edit contact info, password, and email preferences.</p>
          </div>
          <ArrowUpRight size={15} className="arrow" />
        </Link>
        <Link href="/dashboard/family" className="action-card">
          <div className="action-icon"><Users size={19} /></div>
          <div>
            <h4 className="action-title">Manage family</h4>
            <p className="action-desc">Add or update household members per bylaws.</p>
          </div>
          <ArrowUpRight size={15} className="arrow" />
        </Link>
        {pendingRegistration ? (
          <div className="action-card" style={{ opacity: 0.55, pointerEvents: "none" }}>
            <div className="action-icon"><LifeBuoy size={19} /></div>
            <div>
              <h4 className="action-title">Request assistance</h4>
              <p className="action-desc">Available after registration payment (Active status).</p>
            </div>
            <ArrowUpRight size={15} className="arrow" />
          </div>
        ) : (
          <Link href="/dashboard/assistance" className="action-card">
            <div className="action-icon"><LifeBuoy size={19} /></div>
            <div>
              <h4 className="action-title">Request assistance</h4>
              <p className="action-desc">Apply for mutual aid for yourself, your household, or the wider community.</p>
            </div>
            <ArrowUpRight size={15} className="arrow" />
          </Link>
        )}
        <a href="/bylaws.pdf" target="_blank" rel="noopener noreferrer" className="action-card">
          <div className="action-icon"><FileText size={19} /></div>
          <div>
            <h4 className="action-title">Download bylaws</h4>
            <p className="action-desc">Read the current SBMI articles of association (PDF).</p>
          </div>
          <ArrowUpRight size={15} className="arrow" />
        </a>
      </section>

      <section className="card activity">
        <div className="card-head">
          <h3 className="card-title">Recent activity</h3>
          <Link href="/dashboard/payments#history" className="card-link">
            See all <ChevronRight size={14} />
          </Link>
        </div>
        <div className="activity-list">
          {recentPayments.length === 0 ? (
            <div style={{ padding: "20px 24px", color: "var(--ink-500)", fontSize: 13.5 }}>
              No recent activity yet.
            </div>
          ) : (
            recentPayments.map((p) => (
              <div key={p.id} className="activity-row">
                <div className="activity-icon"><Wallet size={15} /></div>
                <div className="activity-text">
                  Monthly contribution
                  <small>{p.status === "COMPLETED" ? "Charged" : p.status}{" "}{p.receiptUrl ? "· receipt available" : ""}</small>
                </div>
                <div className="activity-amt">${p.amount.toFixed(2)}</div>
                <div className="activity-date">{p.paidAt ? formatDate(p.paidAt) : "—"}</div>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );
}
