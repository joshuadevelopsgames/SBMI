import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export type AdminNotificationItem = {
  id: string;
  title: string;
  description?: string;
  href: string;
  variant?: "default" | "warn" | "accent";
};

/** EC-facing reminders derived from approval-queue counts (same sources as admin dashboard). */
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const [
    pendingApplications,
    pendingFamilyChanges,
    pendingNameChanges,
    pendingClaims,
  ] = await Promise.all([
    prisma.application.count({ where: { status: "PENDING" } }),
    prisma.familyMember.count({
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
    }),
    prisma.profileChangeRequest.count({ where: { status: "PENDING" } }),
    prisma.claim.count({ where: { status: "PENDING" } }),
  ]);

  const items: AdminNotificationItem[] = [];
  if (pendingApplications > 0) {
    items.push({
      id: "applications",
      title:
        pendingApplications === 1 ? "1 membership application awaiting review" : `${pendingApplications} membership applications awaiting review`,
      href: "/admin/approvals",
      variant: "accent",
    });
  }
  if (pendingFamilyChanges > 0) {
    items.push({
      id: "family",
      title:
        pendingFamilyChanges === 1
          ? "1 family composition update awaiting review"
          : `${pendingFamilyChanges} family composition updates awaiting review`,
      href: "/admin/approvals",
    });
  }
  if (pendingNameChanges > 0) {
    items.push({
      id: "names",
      title:
        pendingNameChanges === 1 ? "1 profile name change awaiting review" : `${pendingNameChanges} profile name changes awaiting review`,
      href: "/admin/approvals",
    });
  }
  if (pendingClaims > 0) {
    items.push({
      id: "claims",
      title: pendingClaims === 1 ? "1 assistance claim awaiting decision" : `${pendingClaims} assistance claims awaiting decision`,
      href: "/admin/approvals",
      variant: "warn",
    });
  }

  return NextResponse.json({
    items,
    count: items.length,
  });
}
