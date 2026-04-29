import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

/** POST: approve or reject a pending family change.
 * SOW US87: Executive Committee approves or declines; underlying request records are immutable after submission;
 * upon approval, the requested change is applied; upon decline, the change is not applied.
 */
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

  const fm = await prisma.familyMember.findUnique({ where: { id } });
  if (!fm) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isAdd = fm.status === "PENDING_APPROVAL";
  const isDelete = fm.pendingDeletion;
  const hasEdit =
    fm.pendingFullName !== null ||
    fm.pendingBirthDate !== null ||
    fm.pendingRelationship !== null ||
    fm.pendingMaritalStatus !== null;
  if (!isAdd && !isDelete && !hasEdit) {
    return NextResponse.json({ error: "No pending change on this record." }, { status: 400 });
  }

  const now = new Date();

  if (action === "reject") {
    if (isAdd) {
      // Reject the original add request — mark as REJECTED and stop showing it
      await prisma.familyMember.update({
        where: { id },
        data: {
          status: "REJECTED",
          decidedAt: now,
          decidedById: session.userId,
          rejectionReason: rejectionReason ?? null,
        },
      });
    } else if (isDelete) {
      // Reject deletion: clear the pendingDeletion flag, member stays
      await prisma.familyMember.update({
        where: { id },
        data: {
          pendingDeletion: false,
          decidedAt: now,
          decidedById: session.userId,
          rejectionReason: rejectionReason ?? null,
        },
      });
    } else {
      // Reject edit: clear pending* fields, canonical values stay
      await prisma.familyMember.update({
        where: { id },
        data: {
          pendingFullName: null,
          pendingBirthDate: null,
          pendingRelationship: null,
          pendingMaritalStatus: null,
          decidedAt: now,
          decidedById: session.userId,
          rejectionReason: rejectionReason ?? null,
        },
      });
    }
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "FAMILY_CHANGE_REJECTED",
        entity: "FAMILY_MEMBER",
        entityId: id,
        details: JSON.stringify({
          kind: isDelete ? "DELETE" : isAdd ? "ADD" : "EDIT",
          reason: rejectionReason ?? null,
        }),
      },
    });
    return NextResponse.json({ ok: true });
  }

  // action === "approve"
  if (isAdd) {
    await prisma.familyMember.update({
      where: { id },
      data: {
        status: "APPROVED",
        decidedAt: now,
        decidedById: session.userId,
        rejectionReason: null,
      },
    });
  } else if (isDelete) {
    // SOW US31: upon EC approval, the family member is removed.
    await prisma.familyMember.delete({ where: { id } });
  } else {
    // Apply pending* edits to canonical fields and clear them
    await prisma.familyMember.update({
      where: { id },
      data: {
        fullName: fm.pendingFullName ?? fm.fullName,
        birthDate: fm.pendingBirthDate ?? fm.birthDate,
        relationship: fm.pendingRelationship ?? fm.relationship,
        maritalStatus: fm.pendingMaritalStatus ?? fm.maritalStatus,
        pendingFullName: null,
        pendingBirthDate: null,
        pendingRelationship: null,
        pendingMaritalStatus: null,
        decidedAt: now,
        decidedById: session.userId,
        rejectionReason: null,
      },
    });
  }

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      action: "FAMILY_CHANGE_APPROVED",
      entity: "FAMILY_MEMBER",
      entityId: id,
      details: JSON.stringify({ kind: isDelete ? "DELETE" : isAdd ? "ADD" : "EDIT" }),
    },
  });

  return NextResponse.json({ ok: true });
}
