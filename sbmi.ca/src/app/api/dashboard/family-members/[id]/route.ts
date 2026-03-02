import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

function ageAt(birthDate: Date, at: Date = new Date()): number {
  const a = at.getFullYear() - birthDate.getFullYear();
  const m = at.getMonth() - birthDate.getMonth();
  const d = at.getDate() - birthDate.getDate();
  return m < 0 || (m === 0 && d < 0) ? a - 1 : a;
}

function isValidBirthDate(d: Date): boolean {
  return !Number.isNaN(d.getTime()) && d <= new Date();
}

/** PATCH: edit family member (e.g. birth date). SOW Family US4 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.memberId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const existing = await prisma.familyMember.findFirst({
    where: { id, memberId: session.memberId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  let body: { fullName?: string; birthDate?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const updates: { fullName?: string; birthDate?: Date } = {};
  if (body.fullName !== undefined) {
    const name = String(body.fullName).trim();
    if (name) updates.fullName = name;
  }
  if (body.birthDate !== undefined) {
    const birthDate = new Date(body.birthDate);
    if (!isValidBirthDate(birthDate)) {
      return NextResponse.json({ error: "Please enter a valid calendar date." }, { status: 400 });
    }
    updates.birthDate = birthDate;
  }
  const updated = await prisma.familyMember.update({
    where: { id },
    data: updates,
  });
  return NextResponse.json({
    id: updated.id,
    fullName: updated.fullName,
    birthDate: updated.birthDate,
    currentAge: ageAt(updated.birthDate),
  });
}

/** DELETE: request remove family member (admin approval required). */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.memberId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const existing = await prisma.familyMember.findFirst({
    where: { id, memberId: session.memberId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const pendingRemoval = await prisma.familyMemberChangeRequest.findFirst({
    where: {
      memberId: session.memberId,
      familyMemberId: id,
      action: "REMOVE",
      status: "PENDING",
    },
  });
  if (pendingRemoval) {
    return NextResponse.json(
      { error: "A removal request is already pending admin approval for this family member." },
      { status: 409 }
    );
  }
  const request = await prisma.familyMemberChangeRequest.create({
    data: {
      memberId: session.memberId,
      familyMemberId: id,
      action: "REMOVE",
      fullName: existing.fullName,
      birthDate: existing.birthDate,
    },
  });
  return NextResponse.json(
    {
      ok: true,
      requestId: request.id,
      status: request.status,
      message: "Your removal request was submitted for admin approval.",
    },
    { status: 202 }
  );
}
