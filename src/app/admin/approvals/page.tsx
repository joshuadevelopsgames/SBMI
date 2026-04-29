import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import ApprovalQueue from "./ApprovalQueue";
import { Crumbs } from "@/components/portal/Chrome";

export const dynamic = "force-dynamic";

export default async function AdminApprovalsPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/api/auth/logout?redirect=/login");

  const [pendingApplications, pendingClaims, pendingFamilyChanges, pendingNameChanges] = await Promise.all([
    prisma.application.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
    }),
    prisma.claim.findMany({
      where: { status: "PENDING" },
      include: { member: true },
      orderBy: { createdAt: "asc" },
    }),
    // SOW US87: Add/Edit/Delete family changes appear as Active workflow items.
    prisma.familyMember.findMany({
      where: {
        OR: [
          { status: "PENDING_APPROVAL" },
          { pendingDeletion: true },
          { pendingFullName: { not: null } },
          { pendingBirthDate: { not: null } },
          { pendingRelationship: { not: null } },
          { pendingMaritalStatus: { not: null } },
        ],
      },
      include: {
        member: { select: { id: true, firstName: true, lastName: true, memberNumber: true } },
      },
      orderBy: { updatedAt: "asc" },
    }),
    // SOW US55: name change requests are reviewed by the Executive Committee.
    prisma.profileChangeRequest.findMany({
      where: { status: "PENDING" },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            member: { select: { firstName: true, lastName: true, memberNumber: true } },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const totalPending =
    pendingApplications.length +
    pendingClaims.length +
    pendingFamilyChanges.length +
    pendingNameChanges.length;

  return (
    <>
      <Crumbs items={[{ label: "Admin", href: "/admin" }, { label: "Approvals" }]} />
      <div className="page-head">
        <div>
          <h1 className="page-h">Approval queue</h1>
          <p className="page-sub">
            Pending governance items awaiting Executive Committee review. Decisions are recorded with your identity.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <span
            className={"pill " + (totalPending > 0 ? "pill-warn" : "pill-ok")}
            style={{ padding: "6px 14px", fontSize: 12.5 }}
          >
            <span className="pill-dot"></span>
            {totalPending} pending
          </span>
        </div>
      </div>

      <ApprovalQueue
        applications={pendingApplications}
        claims={pendingClaims}
        familyChanges={pendingFamilyChanges.map((fm) => ({
          id: fm.id,
          fullName: fm.fullName,
          birthDate: fm.birthDate,
          relationship: fm.relationship,
          maritalStatus: fm.maritalStatus,
          status: fm.status,
          pendingFullName: fm.pendingFullName,
          pendingBirthDate: fm.pendingBirthDate,
          pendingRelationship: fm.pendingRelationship,
          pendingMaritalStatus: fm.pendingMaritalStatus,
          pendingDeletion: fm.pendingDeletion,
          requestedAt: fm.updatedAt,
          member: fm.member,
        }))}
        nameChanges={pendingNameChanges.map((r) => ({
          id: r.id,
          fieldName: r.fieldName,
          oldValue: r.oldValue,
          newValue: r.newValue,
          requestedAt: r.createdAt,
          memberName:
            r.user.member
              ? `${r.user.member.firstName} ${r.user.member.lastName}`
              : (r.user.email ?? "Unknown member"),
          memberNumber: r.user.member?.memberNumber ?? null,
        }))}
      />
    </>
  );
}
