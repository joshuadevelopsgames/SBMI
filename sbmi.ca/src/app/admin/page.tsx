import { prisma } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [membersCount, pendingMembers, pendingClaims, paymentsCount] =
    await Promise.all([
      prisma.member.count(),
      prisma.member.count({ where: { status: "PENDING" } }),
      prisma.claim.count({ where: { status: "PENDING" } }),
      prisma.payment.count({ where: { status: "COMPLETED" } }),
    ]);

  return (
    <div className="space-y-8">
      {/* Welcome / title */}
      <section>
        <h1 className="text-3xl md:text-4xl font-display font-semibold text-[#1B5E3B] mb-1">
          Admin Dashboard
        </h1>
        <p className="text-lg text-[#3D5A4A]/90">
          SBMI Portal administration. Overview and quick access.
        </p>
      </section>

      {/* Summary stats */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sbmi-card p-5">
          <p className="text-sm text-[#3D5A4A] mb-1">Total members</p>
          <p className="text-2xl font-display font-semibold text-[#1B5E3B]">{membersCount}</p>
        </div>
        <div className="sbmi-card p-5">
          <p className="text-sm text-[#3D5A4A] mb-1">Pending approvals (members)</p>
          <p className="text-2xl font-display font-semibold text-[#1B5E3B]">{pendingMembers}</p>
          <Link
            href="/admin/approvals"
            className="text-sm text-[#1B5E3B] hover:text-[#17503A] font-medium mt-2 inline-block"
          >
            View →
          </Link>
        </div>
        <div className="sbmi-card p-5">
          <p className="text-sm text-[#3D5A4A] mb-1">Pending claims</p>
          <p className="text-2xl font-display font-semibold text-[#1B5E3B]">{pendingClaims}</p>
          <Link
            href="/admin/approvals"
            className="text-sm text-[#1B5E3B] hover:text-[#17503A] font-medium mt-2 inline-block"
          >
            View →
          </Link>
        </div>
        <div className="sbmi-card p-5">
          <p className="text-sm text-[#3D5A4A] mb-1">Payments recorded</p>
          <p className="text-2xl font-display font-semibold text-[#1B5E3B]">{paymentsCount}</p>
        </div>
      </section>

      {/* Feature cards: Members, Approvals, Reports */}
      <section className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/admin/members"
          className="sbmi-card p-5 block hover:shadow-md hover:border-[#1B5E3B]/30 transition-all group"
        >
          <h3 className="font-display font-semibold text-[#1B5E3B] text-lg mb-1 group-hover:text-[#17503A]">
            Members
          </h3>
          <p className="text-sm text-[#3D5A4A]">
            View all members, add new members, and manage accounts.
          </p>
        </Link>
        <Link
          href="/admin/approvals"
          className="sbmi-card p-5 block hover:shadow-md hover:border-[#1B5E3B]/30 transition-all group"
        >
          <h3 className="font-display font-semibold text-[#1B5E3B] text-lg mb-1 group-hover:text-[#17503A]">
            Approvals
          </h3>
          <p className="text-sm text-[#3D5A4A]">
            Process pending membership applications and claims.
          </p>
        </Link>
        <Link
          href="/admin/reports"
          className="sbmi-card p-5 block hover:shadow-md hover:border-[#1B5E3B]/30 transition-all group"
        >
          <h3 className="font-display font-semibold text-[#1B5E3B] text-lg mb-1 group-hover:text-[#17503A]">
            Reports
          </h3>
          <p className="text-sm text-[#3D5A4A]">
            Access admin reports and data.
          </p>
        </Link>
      </section>
    </div>
  );
}
