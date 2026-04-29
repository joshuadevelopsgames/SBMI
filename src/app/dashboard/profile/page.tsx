import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm";
import { Crumbs } from "@/components/portal/Chrome";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session?.memberId) redirect("/api/auth/logout?redirect=/login");

  const member = await prisma.member.findUnique({
    where: { id: session.memberId },
    include: { household: true, user: { select: { id: true, email: true } } },
  });
  if (!member) redirect("/dashboard");

  // SOW US55: surface pending name-change requests so the UI shows them as in-flight.
  const pendingNameRequests = member.user
    ? await prisma.profileChangeRequest.findMany({
        where: { userId: member.user.id, status: "PENDING" },
        select: { id: true, fieldName: true, newValue: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <>
      <Crumbs items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Profile" }]} />
      <div className="page-head">
        <div>
          <h1 className="page-h">Profile &amp; settings</h1>
          <p className="page-sub">
            Profile changes are reviewed by the Executive Committee per SBMI bylaws.
          </p>
        </div>
      </div>
      <ProfileForm
        member={member}
        email={member.user?.email ?? null}
        pendingNameRequests={pendingNameRequests.map((r) => ({
          id: r.id,
          fieldName: r.fieldName,
          newValue: r.newValue,
          createdAt: r.createdAt.toISOString(),
        }))}
      />
    </>
  );
}
