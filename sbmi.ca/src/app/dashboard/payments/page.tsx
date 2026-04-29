import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { getMonthlyContributionCents } from "@/lib/payment-config";
import { PaymentHistory } from "./PaymentHistory";
import { MakePaymentSection } from "./MakePaymentSection";

export const dynamic = "force-dynamic";

const HISTORY_PAGE_SIZE = 20;

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getSession();
  if (!session?.memberId) redirect("/api/auth/logout?redirect=/login");

  const page = Math.max(1, parseInt((await searchParams).page ?? "1", 10) || 1);
  const skip = (page - 1) * HISTORY_PAGE_SIZE;

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where: { memberId: session.memberId },
      orderBy: [{ paidAt: "desc" }, { createdAt: "desc" }],
      take: HISTORY_PAGE_SIZE,
      skip,
    }),
    prisma.payment.count({
      where: { memberId: session.memberId },
    }),
  ]);

  const monthlyCents = getMonthlyContributionCents();

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px flex-1 min-w-0 bg-[#D4A43A]" />
        <span className="text-xs tracking-[0.2em] text-[#D4A43A] uppercase font-medium shrink-0">
          Finances
        </span>
      </div>
      <h1 className="text-2xl font-display font-semibold text-[#1B5E3B] mb-8">
        Payments
      </h1>

      <MakePaymentSection monthlyCents={monthlyCents} />

      <div id="history" className="sbmi-card overflow-hidden mt-8">
        <div className="px-5 py-3.5 border-b border-[#E2DCD2]">
          <h2 className="font-display font-semibold text-[#1B5E3B]">Payment history</h2>
        </div>
        <PaymentHistory
          payments={payments}
          page={page}
          pageSize={HISTORY_PAGE_SIZE}
          total={total}
        />
      </div>
    </div>
  );
}
