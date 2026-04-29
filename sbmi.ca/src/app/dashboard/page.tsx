import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/date";
import Link from "next/link";
import { getPaymentSummary, formatCents } from "@/lib/payment-summary";

export const dynamic = "force-dynamic";

function membershipDurationText(joinedAt: Date | null): string {
  if (!joinedAt) return "Member";
  const now = new Date();
  const y = now.getFullYear() - joinedAt.getFullYear();
  const m = now.getMonth() - joinedAt.getMonth();
  const d = now.getDate() - joinedAt.getDate();
  const months = y * 12 + m + (d >= 0 ? 0 : -1);
  if (months < 12) {
    const word = months !== 1 ? "months" : "month";
    return months + " " + word + " as a member";
  }
  const years = Math.floor(months / 12);
  const rem = months % 12;
  const yearWord = years !== 1 ? "years" : "year";
  const monthWord = rem !== 1 ? "months" : "month";
  if (rem === 0) return years + " " + yearWord + " as a member";
  return years + " " + yearWord + ", " + rem + " " + monthWord + " as a member";
}

function formatMemberSince(d: Date | null): string {
  return formatDate(d);
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.memberId) {
    return (
      <div className="sbmi-card p-6">
        <h1 className="text-xl font-display font-semibold text-[#1B5E3B] mb-4">Dashboard</h1>
        <p className="text-[#3D5A4A]">
          Your member profile is not linked. Please contact an administrator.
        </p>
      </div>
    );
  }

  const member = await prisma.member.findUnique({
    where: { id: session.memberId },
    include: { household: true },
  });
  if (!member) {
    return (
      <div className="sbmi-card p-6">
        <h1 className="text-xl font-display font-semibold text-[#1B5E3B] mb-4">Dashboard</h1>
        <p className="text-[#3D5A4A]">Member record not found.</p>
      </div>
    );
  }

  const paymentSummary = await getPaymentSummary(member.id);
  const statusLabel =
    member.status === "ACTIVE"
      ? "All features available"
      : member.status === "SUSPENDED"
        ? "Account suspended"
        : member.status === "TERMINATED"
          ? "Membership ended"
          : "Pending";

  return (
    <div className="space-y-8">
      {/* Welcome block */}
      <section>
        <h1 className="text-3xl md:text-4xl font-display font-semibold text-[#1B5E3B] mb-1">
          Welcome, {member.firstName}!
        </h1>
        <p className="text-lg text-[#3D5A4A]/90 mb-2">
          SBMI Portal member dashboard.
        </p>
        <p className="text-sm text-[#3D5A4A] mb-2">
          Member since {formatMemberSince(member.joinedAt)}
        </p>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            member.status === "ACTIVE"
              ? "bg-green-50 text-green-700 border border-green-200"
              : member.status === "SUSPENDED"
                ? "bg-red-50 text-red-700 border border-red-200"
                : member.status === "TERMINATED"
                  ? "bg-gray-100 text-gray-700 border border-gray-200"
                  : "bg-amber-50 text-amber-700 border border-amber-200"
          }`}>
            {member.status}
          </span>
          <span className="text-sm text-[#3D5A4A]">{statusLabel}</span>
        </div>
      </section>

      {/* Consolidated membership payments card */}
      <section className="sbmi-card overflow-hidden">
        <div className="bg-[#1B5E3B]/5 border-b border-[#E2DCD2] px-5 py-3.5">
          <h2 className="font-display font-semibold text-[#1B5E3B] text-lg">Membership payments</h2>
        </div>
        <div className="p-5">
          {paymentSummary ? (
            <>
              <p className="text-[#3D5A4A] text-sm mb-4">
                {paymentSummary.state === "overdue" && (
                  <span className="font-medium text-[#B84444]">Status: Overdue. </span>
                )}
                {(paymentSummary.state === "up_to_date" || paymentSummary.state === "paid_ahead") && (
                  <span className="font-medium text-[#1B5E3B]">Status: Paid up. </span>
                )}
                Next payment: {formatCents(paymentSummary.nextMinAmountCents)} due {paymentSummary.nextDueDate}.
                {paymentSummary.lastPaidThrough && (
                  <> Last paid through {paymentSummary.lastPaidThrough}.</>
                )}
                {" "}All payment information is consolidated here for your convenience.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/dashboard/payments"
                  className="inline-flex items-center justify-center rounded-lg bg-[#D4A43A] text-[#171717] px-5 py-2.5 font-medium hover:bg-[#C4922E] transition-colors shadow-sm"
                >
                  Pay now
                </Link>
                <Link
                  href="/dashboard/payments#history"
                  className="text-[#1B5E3B] font-medium hover:text-[#17503A] underline underline-offset-2"
                >
                  View payment history
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="text-[#3D5A4A] text-sm mb-4">
                Payment configuration is required. Contact the administrator to set monthly contribution and penalty amounts.
              </p>
              <Link
                href="/dashboard/payments"
                className="text-[#1B5E3B] hover:text-[#17503A] font-medium underline underline-offset-2"
              >
                View payment history →
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Three feature cards: Family, Report, Help */}
      <section className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/dashboard/family"
          className="sbmi-card p-5 block hover:shadow-md hover:border-[#1B5E3B]/30 transition-all group"
        >
          <h3 className="font-display font-semibold text-[#1B5E3B] text-lg mb-1 group-hover:text-[#17503A]">
            Family
          </h3>
          <p className="text-sm text-[#3D5A4A]">
            Manage records for your household. Add or remove members in one place.
          </p>
        </Link>
        <Link
          href="/dashboard/reports"
          className="sbmi-card p-5 block hover:shadow-md hover:border-[#1B5E3B]/30 transition-all group"
        >
          <h3 className="font-display font-semibold text-[#1B5E3B] text-lg mb-1 group-hover:text-[#17503A]">
            Report
          </h3>
          <p className="text-sm text-[#3D5A4A]">
            Check payment history: transaction log and receipts.
          </p>
        </Link>
        <Link
          href="/dashboard/assistance"
          className="sbmi-card p-5 block hover:shadow-md hover:border-[#1B5E3B]/30 transition-all group"
        >
          <h3 className="font-display font-semibold text-[#1B5E3B] text-lg mb-1 group-hover:text-[#17503A]">
            Help
          </h3>
          <p className="text-sm text-[#3D5A4A]">
            Request mutual aid for yourself or a family member.
          </p>
        </Link>
      </section>

      {/* Make payment strip */}
      <section className="sbmi-card p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#FAF7F0]">
        <div>
          <h2 className="font-display font-semibold text-[#1B5E3B] text-lg mb-1">Make payment</h2>
          <p className="text-sm text-[#3D5A4A]">
            Secure your membership in seconds.
          </p>
        </div>
        <Link
          href="/dashboard/payments"
          className="shrink-0 rounded-lg bg-[#D4A43A] text-[#171717] px-5 py-2.5 font-medium hover:bg-[#C4922E] transition-colors text-center shadow-sm"
        >
          Pay now
        </Link>
      </section>
    </div>
  );
}
