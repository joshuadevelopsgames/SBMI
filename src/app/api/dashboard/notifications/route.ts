import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getPaymentSummary } from "@/lib/payment-summary";

export type DashboardNotificationItem = {
  id: string;
  title: string;
  description?: string;
  href?: string;
  variant?: "default" | "warn" | "accent";
};

/** Aggregates actionable member-facing reminders from existing records (no separate notifications table). */
export async function GET() {
  const session = await getSession();
  if (!session?.memberId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const memberId = session.memberId;
  const items: DashboardNotificationItem[] = [];

  const member = await prisma.member.findUnique({
    where: { id: memberId },
    select: { status: true },
  });
  if (!member) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (member.status === "PENDING_REGISTRATION") {
    items.push({
      id: "registration",
      title: "Complete your registration",
      description: "Pay the one-time registration fee to activate full membership.",
      href: "/registration-payment",
      variant: "accent",
    });
  }

  const summary = await getPaymentSummary(memberId);
  if (summary?.state === "overdue") {
    items.push({
      id: "payment-overdue",
      title: "Contribution past due",
      description: "Catch up on your monthly contribution or contact the EC if you need support.",
      href: "/dashboard/payments",
      variant: "warn",
    });
  }

  const user = await prisma.user.findFirst({
    where: { memberId },
    select: { id: true },
  });
  if (user) {
    const pendingNames = await prisma.profileChangeRequest.findMany({
      where: { userId: user.id, status: "PENDING" },
      select: { id: true, fieldName: true },
      orderBy: { createdAt: "desc" },
    });
    for (const r of pendingNames) {
      const label = r.fieldName === "firstName" ? "First name" : r.fieldName === "lastName" ? "Last name" : r.fieldName;
      items.push({
        id: `profile-name-${r.id}`,
        title: `${label} change awaiting EC approval`,
        description: "You’ll see the update here once the Executive Committee reviews it.",
        href: "/dashboard/profile",
      });
    }
  }

  const pendingFamily = await prisma.familyMember.count({
    where: {
      memberId,
      OR: [
        { status: "PENDING_APPROVAL" },
        { pendingDeletion: true },
        { pendingFullName: { not: null } },
        { pendingBirthDate: { not: null } },
        { pendingRelationship: { not: null } },
        { pendingMaritalStatus: { not: null } },
      ],
    },
  });
  if (pendingFamily > 0) {
    items.push({
      id: "family-pending",
      title: pendingFamily === 1 ? "Family update awaiting approval" : `${pendingFamily} family updates awaiting approval`,
      description: "The Executive Committee will review add, edit, or remove requests.",
      href: "/dashboard/family",
    });
  }

  const pendingClaims = await prisma.claim.count({
    where: { memberId, status: "PENDING" },
  });
  if (pendingClaims > 0) {
    items.push({
      id: "claims-pending",
      title: pendingClaims === 1 ? "Mutual aid claim pending review" : `${pendingClaims} mutual aid claims pending review`,
      href: "/dashboard/claims",
    });
  }

  return NextResponse.json({
    items,
    count: items.length,
  });
}
