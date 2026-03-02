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

  const request = await prisma.familyMemberChangeRequest.findUnique({
    where: { id },
  });
  if (!request) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }
  if (request.status !== "PENDING") {
    return NextResponse.json(
      { error: "Request already processed" },
      { status: 400 }
    );
  }

  if (action === "reject") {
    await prisma.familyMemberChangeRequest.update({
      where: { id },
      data: {
        status: "REJECTED",
        rejectionReason: rejectionReason ?? null,
        processedById: session.userId,
        processedAt: new Date(),
      },
    });
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "FAMILY_MEMBER_CHANGE_REJECTED",
        entity: "FAMILY_MEMBER_CHANGE_REQUEST",
        entityId: id,
        details: JSON.stringify({
          requestAction: request.action,
          memberId: request.memberId,
          fullName: request.fullName,
          rejectionReason: rejectionReason ?? null,
        }),
      },
    });
    return NextResponse.json({ ok: true });
  }

  const processedAt = new Date();
  if (request.action === "ADD") {
    await prisma.$transaction(async (tx) => {
      await tx.familyMember.create({
        data: {
          memberId: request.memberId,
          fullName: request.fullName,
          birthDate: request.birthDate,
        },
      });
      await tx.familyMemberChangeRequest.update({
        where: { id },
        data: {
          status: "APPROVED",
          rejectionReason: null,
          processedById: session.userId,
          processedAt,
        },
      });
    });
  } else if (request.action === "REMOVE") {
    await prisma.$transaction(async (tx) => {
      if (request.familyMemberId) {
        const existing = await tx.familyMember.findFirst({
          where: { id: request.familyMemberId, memberId: request.memberId },
        });
        if (existing) {
          await tx.familyMember.delete({ where: { id: existing.id } });
        }
      }
      await tx.familyMemberChangeRequest.update({
        where: { id },
        data: {
          status: "APPROVED",
          rejectionReason: null,
          processedById: session.userId,
          processedAt,
        },
      });
    });
  } else {
    return NextResponse.json(
      { error: "Invalid request action" },
      { status: 400 }
    );
  }

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      action: "FAMILY_MEMBER_CHANGE_APPROVED",
      entity: "FAMILY_MEMBER_CHANGE_REQUEST",
      entityId: id,
      details: JSON.stringify({
        requestAction: request.action,
        memberId: request.memberId,
        familyMemberId: request.familyMemberId,
        fullName: request.fullName,
      }),
    },
  });

  return NextResponse.json({ ok: true });
}
