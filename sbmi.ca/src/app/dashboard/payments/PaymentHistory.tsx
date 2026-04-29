import Link from "next/link";
import { formatDate } from "@/lib/date";

type Payment = {
  id: string;
  amount: number;
  status: string;
  paidAt: Date | null;
  receiptUrl: string | null;
};

export function PaymentHistory({
  payments,
  page,
  pageSize,
  total,
}: {
  payments: Payment[];
  page: number;
  pageSize: number;
  total: number;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  if (payments.length === 0) {
    return (
      <div className="p-6 text-[#3D5A4A] text-sm">
        No payments recorded yet.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#FAF7F0] text-left">
              <th className="p-3 text-[#1B5E3B] font-medium">Date</th>
              <th className="p-3 text-[#1B5E3B] font-medium">Amount</th>
              <th className="p-3 text-[#1B5E3B] font-medium">Status</th>
              <th className="p-3 text-[#1B5E3B] font-medium">Receipt</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-t border-[#E2DCD2] hover:bg-[#FAF7F0] transition-colors">
                <td className="p-3 text-[#3D5A4A]">
                  {p.paidAt ? formatDate(p.paidAt) : "—"}
                </td>
                <td className="p-3 text-[#3D5A4A]">${p.amount.toFixed(2)}</td>
                <td className="p-3 text-[#3D5A4A] capitalize">{p.status.toLowerCase()}</td>
                <td className="p-3">
                  {p.receiptUrl ? (
                    <a
                      href={p.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1B5E3B] hover:underline font-medium"
                    >
                      View receipt
                    </a>
                  ) : (
                    <span className="text-[#3D5A4A]/60">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="p-3 border-t border-[#E2DCD2] flex items-center justify-between text-sm text-[#3D5A4A]">
          <span>
            Page {page} of {totalPages}
          </span>
          <span className="flex gap-2">
            {hasPrev && (
              <Link
                href={`/dashboard/payments?page=${page - 1}#history`}
                className="text-[#1B5E3B] hover:underline font-medium"
              >
                Previous
              </Link>
            )}
            {hasNext && (
              <Link
                href={`/dashboard/payments?page=${page + 1}#history`}
                className="text-[#1B5E3B] hover:underline font-medium"
              >
                Next
              </Link>
            )}
          </span>
        </div>
      )}
    </>
  );
}
