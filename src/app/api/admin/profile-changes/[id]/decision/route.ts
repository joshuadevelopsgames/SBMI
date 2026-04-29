import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

/** POST: approve or reject a name-change request. SOW US55: Executive Committee workflow. */
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
  const { action, rejectionReason } = body as {
    action?: "approve" | "reject";
    rejectionReason?: string | null;
  };
  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "action must be 'approve' or 'reject'" }, { status: 400 });
  }

  const request = await prisma.profileChangeRequest.findUnique({
    where: { id },
    include: { user: { select: { id: true, memberId: true } } },
  });
  if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (request.status !== "PENDING") {
    return NextResponse.json({ error: "Already decided." }, { status: 400 });
  }
  const now = new Date();

  if (action === "reject") {
    await prisma.profileChangeRequest.update({
      where: { id },
      data: {
        status: "REJECTED",
        decidedAt: now,
        decidedById: session.userId,
        rejectionReason: rejectionReason ?? null,
      },
    });
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "PROFILE_CHANGE_REJECTED",
        entity: "USER",
        entityId: request.userId,
        details: JSON.stringify({ field: request.fieldName, reason: rejectionReason ?? null }),
      },
    });
    return NextResponse.json({ ok: true });
  }

  // Approve — apply the change to the Member record, then mark approved
  if (!request.user.memberId) {
    return NextResponse.json({ error: "User has no linked member record." }, { status: 400 });
  }
  await prisma.member.update({
    where: { id: request.user.memberId },
    data: request.fieldName === "firstName"
      ? { firstName: request.newValue }
      : { lastName: request.newValue },
  });
  await prisma.profileChangeRequest.update({
    where: { id },
    data: {
      status: "APPROVED",
      decidedAt: now,
      decidedById: session.userId,
    },
  });
  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      action: "PROFILE_CHANGE_APPROVED",
      entity: "USER",
      entityId: request.userId,
      details: JSON.stringify({
        field: request.fieldName,
        oldValue: request.oldValue,
        newValue: request.newValue,
      }),
    },
  });

  return NextResponse.json({ ok: true });
}
