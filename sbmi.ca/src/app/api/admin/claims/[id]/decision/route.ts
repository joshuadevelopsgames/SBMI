import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

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

  const claim = await prisma.claim.findUnique({
    where: { id },
    include: { member: true },
  });
  if (!claim) {
    return NextResponse.json({ error: "Claim not found" }, { status: 404 });
  }
  if (claim.status !== "PENDING") {
    return NextResponse.json(
      { error: "Claim already processed" },
      { status: 400 }
    );
  }

  const newStatus = action === "approve" ? "APPROVED" : "REJECTED";

  await prisma.claim.update({
    where: { id },
    data: {
      status: newStatus,
      approvedById: session.userId,
      approvedAt: new Date(),
      rejectionReason: action === "reject" ? (rejectionReason ?? null) : null,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      action: action === "approve" ? "CLAIM_APPROVED" : "CLAIM_REJECTED",
      entity: "CLAIM",
      entityId: id,
      details: JSON.stringify({
        memberId: claim.memberId,
        reason: claim.reason,
        ...(action === "reject" && { rejectionReason }),
      }),
    },
  });

  return NextResponse.json({ ok: true });
}
