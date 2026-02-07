import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import ApprovalQueue from "./ApprovalQueue";

export const dynamic = "force-dynamic";

export default async function AdminApprovalsPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/api/auth/logout?redirect=/login");

  const [pendingApplications, pendingClaims] = await Promise.all([
    prisma.application.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
    }),
    prisma.claim.findMany({
      where: { status: "PENDING" },
      include: { member: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px w-8 bg-[#C9A227]" />
        <span className="text-xs tracking-[0.2em] text-[#C9A227] uppercase font-medium">
          Queue
        </span>
      </div>
      <h1 className="text-2xl font-serif font-light text-[#1B4332] mb-8">
        Approval Queue
      </h1>

      <ApprovalQueue
        applications={pendingApplications}
        claims={pendingClaims}
      />
    </div>
  );
}
