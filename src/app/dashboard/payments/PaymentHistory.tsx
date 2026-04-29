import Link from "next/link";
import { Download } from "lucide-react";
import { formatDate } from "@/lib/date";

type Payment = {
  id: string;
  amount: number;
  status: string;
  category: string;
  method: string;
  cardBrand: string | null;
  cardLast4: string | null;
  paidAt: Date | null;
  receiptUrl: string | null;
};

function methodLabel(p: Payment): string {
  if (p.method === "CARD") {
    const brand = p.cardBrand ? p.cardBrand.charAt(0) + p.cardBrand.slice(1).toLowerCase() : "Card";
    return p.cardLast4 ? `${brand} •• ${p.cardLast4}` : brand;
  }
  if (p.method === "BANK") return "Bank debit";
  if (p.method === "CASH") return "Cash";
  if (p.method === "CHEQUE") return "Cheque";
  if (p.method === "ETRANSFER") return "E-transfer";
  return p.method;
}

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
  const startIdx = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIdx = Math.min(page * pageSize, total);

  if (payments.length === 0) {
    return (
      <div style={{ padding: 24, color: "var(--ink-500)", fontSize: 13.5 }}>
        No payments recorded yet.
      </div>
    );
  }

  return (
    <>
      <table className="tbl">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Method</th>
            <th>Status</th>
            <th style={{ textAlign: "right" }}>Amount</th>
            <th>Receipt</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => {
            const ok = p.status === "COMPLETED";
            return (
              <tr key={p.id}>
                <td style={{ fontVariantNumeric: "tabular-nums" }}>
                  {p.paidAt ? formatDate(p.paidAt) : "—"}
                </td>
                <td style={{ textTransform: "capitalize" }}>
                  {p.category.toLowerCase().replace(/_/g, " ")}
                </td>
                <td style={{ color: "var(--ink-500)" }}>{methodLabel(p)}</td>
                <td>
                  <span className={"pill " + (ok ? "pill-ok" : p.status === "FAILED" ? "pill-danger" : "pill-warn")}>
                    <span className="pill-dot"></span>
                    {ok ? "Succeeded" : p.status.charAt(0) + p.status.slice(1).toLowerCase()}
                  </span>
                </td>
                <td style={{ textAlign: "right" }} className="tbl-cell-num">
                  ${p.amount.toFixed(2)}
                </td>
                <td>
                  {p.receiptUrl ? (
                    <a
                      href={p.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-link"
                      style={{ color: "var(--green)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}
                    >
                      <Download size={13} /> PDF
                    </a>
                  ) : (
                    <span style={{ color: "var(--ink-300)" }}>—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="tbl-foot">
        <span>
          Showing {startIdx}–{endIdx} of {total} {total === 1 ? "transaction" : "transactions"}
        </span>
        {totalPages > 1 && (
          <div className="pager">
            {hasPrev ? (
              <Link href={`/dashboard/payments?page=${page - 1}#history`}>‹</Link>
            ) : (
              <button disabled>‹</button>
            )}
            <button className="active">{page}</button>
            {hasNext ? (
              <Link href={`/dashboard/payments?page=${page + 1}#history`}>›</Link>
            ) : (
              <button disabled>›</button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
