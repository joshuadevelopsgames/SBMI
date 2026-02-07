import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import SubmitClaimForm from "./SubmitClaimForm";

export default async function ClaimsPage() {
  const session = await getSession();
  if (!session?.memberId) redirect("/login");

  const claims = await prisma.claim.findMany({
    where: { memberId: session.memberId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px w-8 bg-[#C9A227]" />
        <span className="text-xs tracking-[0.2em] text-[#C9A227] uppercase font-medium">
          Benefits
        </span>
      </div>
      <h1 className="text-2xl font-serif font-light text-[#1B4332] mb-8">
        Claims
      </h1>

      <SubmitClaimForm className="sbmi-card rounded-none p-6 mb-8" />

      <div className="sbmi-card rounded-none overflow-hidden">
        <div className="p-4 border-b border-[#E8E4DE]">
          <h2 className="font-serif text-[#1B4332]">Claim status</h2>
        </div>
        {claims.length === 0 ? (
          <div className="p-6 text-[#3D5A4C] text-sm">
            No claims submitted yet.
          </div>
        ) : (
          <ul className="divide-y divide-[#E8E4DE]">
            {claims.map((c) => (
              <li key={c.id} className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-[#1B4332]">{c.reason}</p>
                    {c.amount != null && (
                      <p className="text-sm text-[#3D5A4C]">${c.amount.toFixed(2)}</p>
                    )}
                    {c.description && (
                      <p className="text-sm text-[#3D5A4C]/80 mt-1">{c.description}</p>
                    )}
                    <p className="text-xs text-[#3D5A4C]/60 mt-1">
                      Submitted {new Date(c.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={
                      c.status === "APPROVED"
                        ? "text-[#1B4332] font-medium"
                        : c.status === "REJECTED"
                          ? "text-red-600"
                          : "text-[#C9A227]"
                    }
                  >
                    {c.status}
                  </span>
                </div>
                {c.status === "REJECTED" && c.rejectionReason && (
                  <p className="text-sm text-[#3D5A4C] mt-2">
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
