import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AdminSideNav, MemberFooter, type MemberInfo } from "@/components/portal/Chrome";

export const dynamic = "force-dynamic";

function initials(first: string, last: string): string {
  const a = first.trim().charAt(0);
  const b = last.trim().charAt(0);
  return (a + b).toUpperCase() || "EC";
}

export default async function AdminLayout({
  children,
}: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/api/auth/logout?redirect=/login");
  if (session.role !== "ADMIN") redirect("/dashboard");
  if (session.isPre2FA) redirect("/login/2fa");

  let memberInfo: MemberInfo = null;
  if (session.memberId) {
    const m = await prisma.member.findUnique({
      where: { id: session.memberId },
      select: { firstName: true, lastName: true },
    });
    if (m) {
      memberInfo = {
        firstName: m.firstName,
        lastName: m.lastName,
        initials: initials(m.firstName, m.lastName),
      };
    }
  }

  return (
    <div className="nav-side">
      <div className="dash-stage">
        <AdminSideNav memberInfo={memberInfo} />
        <main className="dash-main">{children}</main>
        <MemberFooter />
      </div>
    </div>
  );
}
