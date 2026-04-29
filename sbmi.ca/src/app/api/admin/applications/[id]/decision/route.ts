import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hashEmail, hashPassword } from "@/lib/auth";

const DEFAULT_TEMP_PASSWORD = "Welcome1";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { action, rejectionReason } = body;

  if (action !== "approve" && action !== "reject") {
    return NextResponse.json(
      { error: "action must be 'approve' or 'reject'" },
      { status: 400 }
    );
  }

  const application = await prisma.application.findUnique({
    where: { id },
  });
  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }
  if (application.status !== "PENDING") {
    return NextResponse.json(
      { error: "Application already processed" },
      { status: 400 }
    );
  }

  if (action === "reject") {
    await prisma.application.update({
      where: { id },
      data: {
        status: "REJECTED",
        rejectionReason: rejectionReason ?? null,
        processedAt: new Date(),
        processedById: session.userId,
      },
    });
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "APPLICATION_REJECTED",
        entity: "APPLICATION",
        entityId: id,
        details: JSON.stringify({ reason: rejectionReason }),
      },
    });
    return NextResponse.json({ ok: true });
  }

  // Approve: create Household, Member, User (Member Journey: PENDING → Approved → Active)
  const memberRole = await prisma.role.findFirst({
    where: { name: "MEMBER" },
  });
  if (!memberRole) {
    return NextResponse.json(
      { error: "MEMBER role not found" },
      { status: 500 }
    );
  }

  const parts = application.fullName.trim().split(/\s+/);
  const firstName = parts[0] ?? "Member";
  const lastName = parts.slice(1).join(" ") || application.fullName;

  const household = await prisma.household.create({
    data: {
      name: `Household of ${application.fullName}`,
      city: "Calgary",
    },
  });

  const member = await prisma.member.create({
    data: {
      firstName,
      lastName,
      phone: application.phone,
      householdId: household.id,
      status: "ACTIVE",
      paymentSchedule: "MONTHLY",
    },
  });

  const emailHash = hashEmail(application.email);
  const existingUser = await prisma.user.findUnique({
    where: { emailHash },
  });
  if (existingUser) {
    await prisma.member.delete({ where: { id: member.id } });
    await prisma.household.delete({ where: { id: household.id } });
    return NextResponse.json(
      { error: "A user with this email already exists" },
      { status: 400 }
    );
  }

  const passwordHash = await hashPassword(DEFAULT_TEMP_PASSWORD);
  await prisma.user.create({
    data: {
      emailHash,
      passwordHash,
      roleId: memberRole.id,
      memberId: member.id,
    },
  });

  await prisma.application.update({
    where: { id },
    data: {
      status: "APPROVED",
      processedAt: new Date(),
      processedById: session.userId,
      createdMemberId: member.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      action: "APPLICATION_APPROVED",
      entity: "APPLICATION",
      entityId: id,
      details: JSON.stringify({
        memberId: member.id,
        email: application.email,
        tempPasswordNote: "Member should change password on first login",
      }),
    },
  });

  return NextResponse.json({
    ok: true,
    memberId: member.id,
    message: `Member created. Login: ${application.email} / ${DEFAULT_TEMP_PASSWORD}`,
  });
}
