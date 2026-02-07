import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const [membersCount, pendingMembers, pendingClaims, paymentsCount] =
    await Promise.all([
      prisma.member.count(),
      prisma.member.count({ where: { status: "PENDING" } }),
      prisma.claim.count({ where: { status: "PENDING" } }),
      prisma.payment.count({ where: { status: "COMPLETED" } }),
    ]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-px w-8 bg-[#C9A227]" />
        <span className="text-xs tracking-[0.2em] text-[#C9A227] uppercase font-medium">
          Admin
        </span>
      </div>
      <h1 className="text-2xl md:text-3xl font-serif font-light text-[#1B4332] mb-8">
        Admin Dashboard
      </h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="sbmi-card rounded-none p-5">
          <p className="text-sm text-[#3D5A4C] mb-1">Total members</p>
          <p className="text-2xl font-serif text-[#1B4332]">{membersCount}</p>
        </div>
        <div className="sbmi-card rounded-none p-5">
          <p className="text-sm text-[#3D5A4C] mb-1">Pending approvals (members)</p>
          <p className="text-2xl font-serif text-[#1B4332]">{pendingMembers}</p>
          <Link
            href="/admin/approvals"
            className="text-sm text-[#C9A227] hover:text-[#B8922A] hover:underline font-medium mt-2 inline-block"
          >
            View →
          </Link>
        </div>
        <div className="sbmi-card rounded-none p-5">
          <p className="text-sm text-[#3D5A4C] mb-1">Pending claims</p>
          <p className="text-2xl font-serif text-[#1B4332]">{pendingClaims}</p>
          <Link
            href="/admin/approvals"
            className="text-sm text-[#C9A227] hover:text-[#B8922A] hover:underline font-medium mt-2 inline-block"
          >
            View →
          </Link>
        </div>
        <div className="sbmi-card rounded-none p-5">
          <p className="text-sm text-[#3D5A4C] mb-1">Payments recorded</p>
          <p className="text-2xl font-serif text-[#1B4332]">{paymentsCount}</p>
        </div>
      </div>

      <div className="sbmi-card rounded-none p-6">
        <h2 className="font-serif text-[#1B4332] mb-3">Quick links</h2>
        <ul className="space-y-2 text-sm">
          <li>
            <Link
              href="/admin/members"
              className="text-[#C9A227] hover:text-[#B8922A] hover:underline"
            >
              Manage members
            </Link>
          </li>
          <li>
            <Link
              href="/admin/approvals"
              className="text-[#C9A227] hover:text-[#B8922A] hover:underline"
            >
              Approval queue
            </Link>
          </li>
          <li>
            <Link
              href="/admin/reports"
              className="text-[#C9A227] hover:text-[#B8922A] hover:underline"
            >
              Reports
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
