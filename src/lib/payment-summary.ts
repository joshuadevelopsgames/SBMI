/**
 * SOW Payments US1, US2, US6: Payment Information Summary states (Overdue, Up to date, Paid ahead).
 * All dates in MST. Uses coverage logic: full contribution = 1 month; partial = credit.
 * Requires MONTHLY_CONTRIBUTION_CENTS and PENALTY_AMOUNT_CENTS in env; returns null when unset.
 */
import { prisma } from "./db";
import { getMonthlyContributionCents, getPenaltyAmountCents } from "./payment-config";

const MST_OFFSET_MS = -7 * 60 * 60 * 1000;

function nowMST(): Date {
  const utc = Date.now();
  return new Date(utc + MST_OFFSET_MS);
}

function toMST(d: Date): Date {
  return new Date(d.getTime() + MST_OFFSET_MS);
}

export type PaymentSummaryState = "overdue" | "up_to_date" | "paid_ahead";

export type PaymentSummary = {
  state: PaymentSummaryState;
  lastPaidThrough: string; // YYYY-MM-DD
  totalPastDueCents: number;
  nextDueDate: string;
  nextMinAmountCents: number;
  lastPaymentAmount: number | null;
  lastPaymentDate: string | null;
  overdueDate: string | null; // when state is overdue
};

export async function getPaymentSummary(memberId: string): Promise<PaymentSummary | null> {
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    select: { status: true },
  });
  if (member?.status === "PENDING_REGISTRATION") return null;

  const monthlyCents = getMonthlyContributionCents();
  const penaltyCents = getPenaltyAmountCents();
  if (monthlyCents == null || penaltyCents == null || monthlyCents <= 0) return null;

  const payments = await prisma.payment.findMany({
    where: { memberId, status: "COMPLETED", paidAt: { not: null } },
    orderBy: { paidAt: "asc" },
  });

  let paidThrough = new Date(0); // start of epoch
  let creditCents = 0;

  for (const p of payments) {
    const paidAt = p.paidAt ? toMST(p.paidAt) : null;
    if (!paidAt) continue;
    const amountCents = Math.round(p.amount * 100);
    const totalCents = amountCents + creditCents;
    const fullMonths = Math.floor(totalCents / monthlyCents);
    creditCents = totalCents % monthlyCents;
    if (fullMonths > 0) {
      const base =
        paidThrough.getTime() > 0
          ? new Date(paidThrough.getFullYear(), paidThrough.getMonth(), 1)
          : new Date(paidAt.getFullYear(), paidAt.getMonth(), 1);
      paidThrough = new Date(base.getFullYear(), base.getMonth() + fullMonths, 0); // last day of month
    }
  }

  const today = nowMST();
  const paidThroughEnd = new Date(paidThrough.getFullYear(), paidThrough.getMonth(), paidThrough.getDate(), 23, 59, 59, 999);

  const lastPayment = payments.length > 0 ? payments[payments.length - 1] : null;
  const lastPaymentDate = lastPayment?.paidAt
    ? toMST(lastPayment.paidAt).toISOString().slice(0, 10)
    : null;
  const lastPaymentAmount = lastPayment ? lastPayment.amount : null;

  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  if (today > paidThroughEnd || paidThrough.getTime() === 0) {
    const firstOfOverdue =
      paidThrough.getTime() > 0
        ? new Date(paidThrough.getFullYear(), paidThrough.getMonth() + 1, 1)
        : new Date(today.getFullYear(), today.getMonth(), 1);
    const overdueMonths: Date[] = [];
    const m = new Date(firstOfOverdue.getFullYear(), firstOfOverdue.getMonth(), 1);
    while (m <= today) {
      overdueMonths.push(new Date(m));
      m.setMonth(m.getMonth() + 1);
    }
    const totalPastDueCents =
      Math.max(0, overdueMonths.length * monthlyCents + overdueMonths.length * penaltyCents - creditCents);
    return {
      state: "overdue",
      lastPaidThrough: paidThrough.getTime() > 0 ? fmt(paidThrough) : "",
      totalPastDueCents,
      nextDueDate: fmt(firstOfOverdue),
      nextMinAmountCents: totalPastDueCents,
      lastPaymentAmount,
      lastPaymentDate,
      overdueDate: fmt(firstOfOverdue),
    };
  }

  const nextDue = new Date(paidThrough.getFullYear(), paidThrough.getMonth() + 1, 1);
  const monthsAhead =
    (paidThrough.getFullYear() - today.getFullYear()) * 12 + paidThrough.getMonth() - today.getMonth();
  const state: PaymentSummaryState = monthsAhead > 1 ? "paid_ahead" : "up_to_date";
  const nextMin = creditCents >= monthlyCents ? monthlyCents : monthlyCents - creditCents;

  return {
    state,
    lastPaidThrough: fmt(paidThrough),
    totalPastDueCents: 0,
    nextDueDate: fmt(nextDue),
    nextMinAmountCents: nextMin,
    lastPaymentAmount,
    lastPaymentDate,
    overdueDate: null,
  };
}

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
