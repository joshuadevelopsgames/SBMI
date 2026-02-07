import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.memberId) {
    return (
      <div className="sbmi-card rounded-none p-6">
        <h1 className="text-xl font-serif text-[#1B4332] mb-4">Dashboard</h1>
        <p className="text-[#3D5A4C]">
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
      <div className="sbmi-card rounded-none p-6">
        <h1 className="text-xl font-serif text-[#1B4332] mb-4">Dashboard</h1>
        <p className="text-[#3D5A4C]">Member record not found.</p>
      </div>
    );
  }

  const [paymentsCount, claimsCount] = await Promise.all([
    prisma.payment.count({ where: { memberId: member.id } }),
    prisma.claim.count({ where: { memberId: member.id } }),
  ]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-px w-8 bg-[#C9A227]" />
        <span className="text-xs tracking-[0.2em] text-[#C9A227] uppercase font-medium">
          Member
        </span>
      </div>
      <h1 className="text-2xl md:text-3xl font-serif font-light text-[#1B4332] mb-1">
        Welcome, {member.firstName}
      </h1>
      <p className="text-[#3D5A4C] text-sm mb-8">
        Member #{member.memberNumber ?? member.id.slice(0, 8)}
      </p>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 mb-8">
        <div className="sbmi-card rounded-none p-5">
          <p className="text-sm text-[#3D5A4C] mb-1">Status</p>
          <p className="font-medium text-[#1B4332] capitalize">
            {member.status.toLowerCase()}
          </p>
        </div>
        <div className="sbmi-card rounded-none p-5">
          <p className="text-sm text-[#3D5A4C] mb-1">Payment schedule</p>
          <p className="font-medium text-[#1B4332]">{member.paymentSchedule}</p>
        </div>
        <div className="sbmi-card rounded-none p-5">
          <p className="text-sm text-[#3D5A4C] mb-1">Household</p>
          <p className="font-medium text-[#1B4332]">
            {member.household?.name ?? "—"}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sbmi-card rounded-none p-6">
          <h2 className="font-serif text-[#1B4332] mb-2">Payments</h2>
          <p className="text-2xl font-serif text-[#C9A227]">{paymentsCount}</p>
          <p className="text-sm text-[#3D5A4C] mb-3">recorded</p>
          <Link
            href="/dashboard/payments"
            className="text-sm text-[#C9A227] hover:text-[#B8922A] hover:underline font-medium"
          >
            View payments →
          </Link>
        </div>
        <div className="sbmi-card rounded-none p-6">
          <h2 className="font-serif text-[#1B4332] mb-2">Claims</h2>
          <p className="text-2xl font-serif text-[#C9A227]">{claimsCount}</p>
          <p className="text-sm text-[#3D5A4C] mb-3">submitted</p>
          <Link
            href="/dashboard/claims"
            className="text-sm text-[#C9A227] hover:text-[#B8922A] hover:underline font-medium"
          >
            View claims →
          </Link>
        </div>
      </div>
    </div>
  );
}
