import { prisma } from "@/lib/db";
import Link from "next/link";
import {
  ChevronRight,
  ClipboardCheck,
  Users,
  BarChart3,
  ArrowUpRight,
  Wallet,
  ShieldCheck,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [
    membersCount,
    pendingApplications,
    pendingFamilyChanges,
    pendingNameChanges,
    pendingClaims,
    paymentsCount,
  ] = await Promise.all([
    prisma.member.count(),
    prisma.application.count({ where: { status: "PENDING" } }),
    prisma.familyMember.count({
      where: {
        OR: [
          { status: "PENDING_APPROVAL" },
          { pendingDeletion: true },
          { pendingFullName: { not: null } },
          { pendingBirthDate: { not: null } },
          { pendingRelationship: { not: null } },
          { pendingMaritalStatus: { not: null } },
        ],
      },
    }),
    prisma.profileChangeRequest.count({ where: { status: "PENDING" } }),
    prisma.claim.count({ where: { status: "PENDING" } }),
    prisma.payment.count({ where: { status: "COMPLETED" } }),
  ]);

  const totalPending =
    pendingApplications + pendingFamilyChanges + pendingNameChanges + pendingClaims;

  const statCards = [
    { label: "Total members", value: membersCount, sub: "Across all categories" },
    { label: "Pending approvals", value: totalPending, sub: "Awaiting Executive Committee", emphasis: totalPending > 0 },
    { label: "Pending claims", value: pendingClaims, sub: "Assistance requests" },
    { label: "Payments recorded", value: paymentsCount, sub: "Lifetime · all members" },
  ];

  return (
    <>
      <section className="welcome-row">
        <div>
          <h1 className="welcome-h">
            Executive Committee <em>console</em>
          </h1>
          <p className="welcome-sub">
            Review pending governance items, manage members, and pull standard reports.
          </p>
        </div>
        <div className="welcome-meta">
          <span className="meta-pill">
            <ShieldCheck size={13} style={{ color: "var(--accent)" }} />
            Governance role
          </span>
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 14,
          marginBottom: 24,
        }}
      >
        {statCards.map((card) => (
          <div key={card.label} className="card card-pad" style={{ padding: "18px 20px" }}>
            <div
              style={{
                fontSize: 11.5,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--ink-500)",
                fontWeight: 600,
              }}
            >
              {card.label}
            </div>
            <div
              style={{
                fontFamily: "var(--font-display-stack)",
                fontSize: 28,
                fontWeight: 700,
                letterSpacing: "-0.025em",
                marginTop: 4,
                fontVariantNumeric: "tabular-nums",
                color: card.emphasis ? "var(--red)" : "var(--ink-900)",
              }}
            >
              {card.value}
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-500)" }}>{card.sub}</div>
          </div>
        ))}
      </section>

      <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h3 className="card-title" style={{ color: "var(--ink-700)" }}>Governance areas</h3>
        <span style={{ fontSize: 12.5, color: "var(--ink-500)" }}>Where Executive Committee work happens</span>
      </div>
      <section className="actions-grid">
        <Link href="/admin/approvals" className="action-card">
          <div className="action-icon"><ClipboardCheck size={19} /></div>
          <div>
            <h4 className="action-title">
              Approvals
              {totalPending > 0 && (
                <span
                  className="pill pill-warn"
                  style={{ marginLeft: 8, fontSize: 11, padding: "2px 8px", verticalAlign: "middle" }}
                >
                  <span className="pill-dot"></span>
                  {totalPending}
                </span>
              )}
            </h4>
            <p className="action-desc">
              Applications, family changes, profile name changes, and assistance claims.
            </p>
          </div>
          <ArrowUpRight size={15} className="arrow" />
        </Link>
        <Link href="/admin/members" className="action-card">
          <div className="action-icon"><Users size={19} /></div>
          <div>
            <h4 className="action-title">Members</h4>
            <p className="action-desc">View all members, manage households, add admin-created accounts.</p>
          </div>
          <ArrowUpRight size={15} className="arrow" />
        </Link>
        <Link href="/admin/reports" className="action-card">
          <div className="action-icon"><BarChart3 size={19} /></div>
          <div>
            <h4 className="action-title">Reports</h4>
            <p className="action-desc">Payments, registration status, dues and delinquency rolls.</p>
          </div>
          <ArrowUpRight size={15} className="arrow" />
        </Link>
        <Link href="/dashboard" className="action-card">
          <div className="action-icon"><Wallet size={19} /></div>
          <div>
            <h4 className="action-title">View as member</h4>
            <p className="action-desc">See your own member dashboard exactly as a member sees it.</p>
          </div>
          <ArrowUpRight size={15} className="arrow" />
        </Link>
      </section>

      <section className="card activity" style={{ marginTop: 24 }}>
        <div className="card-head">
          <h3 className="card-title">Pending governance breakdown</h3>
          <Link href="/admin/approvals" className="card-link">
            Open queue <ChevronRight size={14} />
          </Link>
        </div>
        <div className="activity-list">
          {[
            { label: "Membership applications", count: pendingApplications, href: "/admin/approvals" },
            { label: "Family change requests", count: pendingFamilyChanges, href: "/admin/approvals" },
            { label: "Profile name changes", count: pendingNameChanges, href: "/admin/approvals" },
            { label: "Assistance claims", count: pendingClaims, href: "/admin/approvals" },
          ].map((row) => (
            <div key={row.label} className="activity-row">
              <div className="activity-icon"><ClipboardCheck size={15} /></div>
              <div className="activity-text">
                {row.label}
                <small>{row.count === 0 ? "Nothing pending" : "Awaiting Executive Committee"}</small>
              </div>
              <div className="activity-amt" style={{ color: row.count > 0 ? "var(--red)" : "var(--ink-500)" }}>
                {row.count}
              </div>
              <div className="activity-date">
                <Link href={row.href} className="text-link" style={{ color: "var(--green)", fontWeight: 600 }}>
                  Open →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
