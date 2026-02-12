import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { MemberHeader } from "./MemberHeader";
import { MemberFooter } from "./MemberFooter";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.isPre2FA) redirect("/login/2fa");
  if (session.role === "ADMIN") redirect("/admin");

  let memberInfo: { firstName: string; lastName: string; memberSinceYear: number | null } | null = null;
  if (session.memberId) {
    const m = await prisma.member.findUnique({
      where: { id: session.memberId },
      select: { firstName: true, lastName: true, joinedAt: true },
    });
    if (m)
      memberInfo = {
        firstName: m.firstName,
        lastName: m.lastName,
        memberSinceYear: m.joinedAt ? m.joinedAt.getFullYear() : null,
      };
  }

  return (
    <div className="min-h-screen sbmi-page-bg flex flex-col">
      <MemberHeader memberInfo={memberInfo} />
      <main className="max-w-5xl mx-auto px-4 py-8 w-full flex-1">
        <div className="mb-4">
          <Breadcrumbs
            rootHref="/dashboard"
            rootLabel="Dashboard"
            theme="light"
            labelMap={{
              "/dashboard": "Dashboard",
              "/dashboard/claims": "Claims",
              "/dashboard/family": "Family",
              "/dashboard/payments": "Payments",
              "/dashboard/profile": "Profile",
              "/dashboard/reports": "Reports",
              "/dashboard/assistance": "Assistance",
            }}
          />
        </div>
        {children}
      </main>
      <MemberFooter />
    </div>
  );
}
