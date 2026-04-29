import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Wallet, Search } from "lucide-react";
import { getMonthlyContributionCents } from "@/lib/payment-config";
import { getPaymentSummary, formatCents } from "@/lib/payment-summary";
import { formatDate } from "@/lib/date";
import { PaymentHistory } from "./PaymentHistory";
import { MakePaymentSection } from "./MakePaymentSection";
import { Crumbs } from "@/components/portal/Chrome";

export const dynamic = "force-dynamic";

const HISTORY_PAGE_SIZE = 20;

function parseFilterDate(v: string | undefined, endOfDay = false): Date | undefined {
  if (!v) return undefined;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return undefined;
  if (endOfDay) d.setHours(23, 59, 59, 999);
  else d.setHours(0, 0, 0, 0);
  return d;
}

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; from?: string; to?: string; type?: string }>;
}) {
  const session = await getSession();
  if (!session?.memberId) redirect("/api/auth/logout?redirect=/login");

  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const skip = (page - 1) * HISTORY_PAGE_SIZE;

  // SOW US81 (Apr 14 add): payment history supports date range + type filter.
  const fromDate = parseFilterDate(sp.from, false);
  const toDate = parseFilterDate(sp.to, true);
  const typeFilter = sp.type && sp.type !== "all" ? sp.type.toUpperCase() : undefined;

  const paidAtRange =
    fromDate || toDate
      ? { ...(fromDate ? { gte: fromDate } : {}), ...(toDate ? { lte: toDate } : {}) }
      : undefined;

  const historyWhere = {
    memberId: session.memberId,
    ...(paidAtRange ? { paidAt: paidAtRange } : {}),
    ...(typeFilter ? { category: typeFilter } : {}),
  };

  const [payments, total, allCompleted, summary] = await Promise.all([
    prisma.payment.findMany({
      where: historyWhere,
      orderBy: [{ paidAt: "desc" }, { createdAt: "desc" }],
      take: HISTORY_PAGE_SIZE,
      skip,
    }),
    prisma.payment.count({ where: historyWhere }),
    // Stats are over ALL completed payments regardless of filters
    prisma.payment.findMany({
      where: { memberId: session.memberId, status: "COMPLETED", paidAt: { not: null } },
      orderBy: { paidAt: "asc" },
    }),
    getPaymentSummary(session.memberId),
  ]);

  const monthlyCents = getMonthlyContributionCents();

  const yearStart = new Date(new Date().getFullYear(), 0, 1);
  const ytd = allCompleted.filter((p) => p.paidAt && p.paidAt >= yearStart);
  const ytdCents = Math.round(ytd.reduce((s, p) => s + p.amount * 100, 0));
  const lifetimeCents = Math.round(allCompleted.reduce((s, p) => s + p.amount * 100, 0));

  const yearAgo = new Date();
  yearAgo.setFullYear(yearAgo.getFullYear() - 1);
  const last12 = allCompleted.filter((p) => p.paidAt && p.paidAt >= yearAgo);
  const avgMonthCents = last12.length > 0 ? Math.round(last12.reduce((s, p) => s + p.amount * 100, 0) / 12) : 0;

  const nextDueLabel = summary?.nextDueDate ? formatDate(new Date(summary.nextDueDate)) : "—";
  const nextChargeCents = summary?.nextMinAmountCents ?? monthlyCents ?? 0;

  return (
    <>
      <Crumbs items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Payments" }]} />
      <div className="page-head">
        <div>
          <h1 className="page-h">Payments</h1>
          <p className="page-sub">Make a payment, set up recurring contributions, and review your full history.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <a href="#make" className="btn btn-accent" style={{ height: 40, padding: "0 18px", fontSize: 13.5 }}>
            <Wallet size={15} /> Make payment
          </a>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 14,
          marginBottom: 20,
        }}
      >
        {[
          { label: "Year to date", value: formatCents(ytdCents), sub: `${ytd.length} payments · ${new Date().getFullYear()}` },
          { label: "Lifetime", value: formatCents(lifetimeCents), sub: `${allCompleted.length} payments` },
          { label: "Avg. monthly", value: formatCents(avgMonthCents), sub: "last 12 months" },
          { label: "Next charge", value: formatCents(nextChargeCents), sub: nextDueLabel },
        ].map((card) => (
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
              }}
            >
              {card.value}
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-500)" }}>{card.sub}</div>
          </div>
        ))}
      </div>

      <div id="make" style={{ marginBottom: 24 }}>
        <h2 className="card-title" style={{ marginBottom: 12, color: "var(--ink-700)" }}>Make a payment</h2>
        <MakePaymentSection monthlyCents={monthlyCents} />
      </div>

      <div id="history">
        <h2 className="card-title" style={{ marginBottom: 12, color: "var(--ink-700)" }}>Payment history</h2>
        <form method="GET" action="/dashboard/payments" className="toolbar">
          <div className="input-wrap" style={{ flex: 1, maxWidth: 240 }}>
            <Search size={15} className="input-icon" />
            <input className="input with-icon" placeholder="Search by amount or type" style={{ height: 38 }} disabled />
          </div>
          <label className="field-hint" style={{ margin: 0, alignSelf: "center" }}>From</label>
          <input
            type="date"
            name="from"
            defaultValue={sp.from ?? ""}
            className="input"
            style={{ height: 38, maxWidth: 160 }}
          />
          <label className="field-hint" style={{ margin: 0, alignSelf: "center" }}>To</label>
          <input
            type="date"
            name="to"
            defaultValue={sp.to ?? ""}
            className="input"
            style={{ height: 38, maxWidth: 160 }}
          />
          <select
            name="type"
            defaultValue={sp.type ?? "all"}
            className="input"
            style={{ height: 38, maxWidth: 150, fontSize: 13 }}
          >
            <option value="all">All types</option>
            <option value="dues">Dues</option>
            <option value="fee">Registration fee</option>
            <option value="penalty">Penalty</option>
            <option value="admission">Admission</option>
          </select>
          <input type="hidden" name="page" value="1" />
          <button type="submit" className="btn btn-ghost" style={{ height: 38, padding: "0 14px", fontSize: 13 }}>
            Apply
          </button>
          {(sp.from || sp.to || (sp.type && sp.type !== "all")) && (
            <a
              href="/dashboard/payments#history"
              className="text-link"
              style={{ alignSelf: "center", fontSize: 13, color: "var(--ink-500)" }}
            >
              Clear
            </a>
          )}
        </form>

        <div className="card">
          <PaymentHistory payments={payments} page={page} pageSize={HISTORY_PAGE_SIZE} total={total} />
        </div>
      </div>
    </>
  );
}
