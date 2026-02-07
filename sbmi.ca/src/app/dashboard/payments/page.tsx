import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const session = await getSession();
  if (!session?.memberId) redirect("/api/auth/logout?redirect=/login");

  const payments = await prisma.payment.findMany({
    where: { memberId: session.memberId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px w-8 bg-[#C9A227]" />
        <span className="text-xs tracking-[0.2em] text-[#C9A227] uppercase font-medium">
          Finances
        </span>
      </div>
      <h1 className="text-2xl font-serif font-light text-[#1B4332] mb-8">
        Payments
      </h1>

      <div className="sbmi-card rounded-none overflow-hidden">
        <div className="p-4 border-b border-[#E8E4DE]">
          <h2 className="font-serif text-[#1B4332]">Payment history</h2>
        </div>
        {payments.length === 0 ? (
          <div className="p-6 text-[#3D5A4C] text-sm">
            No payments recorded yet. Dues and payment setup will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#FAF8F5] text-left">
                  <th className="p-3 text-[#1B4332] font-medium">Date</th>
                  <th className="p-3 text-[#1B4332] font-medium">Category</th>
                  <th className="p-3 text-[#1B4332] font-medium">Amount</th>
                  <th className="p-3 text-[#1B4332] font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-t border-[#E8E4DE]">
                    <td className="p-3 text-[#3D5A4C]">
                      {p.paidAt
                        ? new Date(p.paidAt).toLocaleDateString()
                        : new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-[#3D5A4C]">{p.category}</td>
                    <td className="p-3 text-[#3D5A4C]">${p.amount.toFixed(2)}</td>
                    <td className="p-3">
                      <span
                        className={
                          p.status === "COMPLETED"
                            ? "text-[#1B4332]"
                            : p.status === "FAILED"
                              ? "text-red-600"
                              : "text-[#C9A227]"
                        }
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <p className="mt-4 text-sm text-[#3D5A4C]">
        Stripe integration for paying dues and fees will be added here (monthly / weekly / bi-weekly).
      </p>
    </div>
  );
}
