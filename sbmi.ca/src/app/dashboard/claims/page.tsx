import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/date";
import { redirect } from "next/navigation";
import SubmitClaimForm from "./SubmitClaimForm";

export const dynamic = "force-dynamic";

export default async function ClaimsPage() {
  const session = await getSession();
  if (!session?.memberId) redirect("/api/auth/logout?redirect=/login");

  const claims = await prisma.claim.findMany({
    where: { memberId: session.memberId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px flex-1 min-w-0 bg-[#D4A43A]" />
        <span className="text-xs tracking-[0.2em] text-[#D4A43A] uppercase font-medium shrink-0">
          Benefits
        </span>
      </div>
      <h1 className="text-2xl font-display font-semibold text-[#1B5E3B] mb-8">
        Claims
      </h1>

      <SubmitClaimForm className="sbmi-card p-6 mb-8" />

      <div className="sbmi-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#E2DCD2]">
          <h2 className="font-display font-semibold text-[#1B5E3B]">Claim status</h2>
        </div>
        {claims.length === 0 ? (
          <div className="p-6 text-[#3D5A4A] text-sm">
            No claims submitted yet.
          </div>
        ) : (
          <ul className="divide-y divide-[#E2DCD2]">
            {claims.map((c) => (
              <li key={c.id} className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-[#1B5E3B]">{c.reason}</p>
                    {c.amount != null && (
                      <p className="text-sm text-[#3D5A4A]">${c.amount.toFixed(2)}</p>
                    )}
                    {c.description && (
                      <p className="text-sm text-[#3D5A4A]/80 mt-1">{c.description}</p>
                    )}
                    <p className="text-xs text-[#3D5A4A]/60 mt-1">
                      Submitted {formatDate(c.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      c.status === "APPROVED"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : c.status === "REJECTED"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
                {c.status === "REJECTED" && c.rejectionReason && (
                  <p className="text-sm text-[#3D5A4A] mt-2">
                    Reason: {c.rejectionReason}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
