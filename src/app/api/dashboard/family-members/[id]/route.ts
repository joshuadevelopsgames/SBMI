import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

const MAX_AGE_AT_ENTRY = 25; // SOW US30: same bylaw cap applies on edit
const VALID_RELATIONSHIPS = ["Spouse", "Child", "Parent", "Sibling", "Other"] as const;
const VALID_MARITAL = ["UNMARRIED", "MARRIED"] as const;

function ageAt(birthDate: Date, at: Date = new Date()): number {
  const a = at.getFullYear() - birthDate.getFullYear();
  const m = at.getMonth() - birthDate.getMonth();
  const d = at.getDate() - birthDate.getDate();
  return m < 0 || (m === 0 && d < 0) ? a - 1 : a;
}

function isValidBirthDate(d: Date): boolean {
  return !Number.isNaN(d.getTime()) && d <= new Date();
}

/** PATCH: submit edit request. SOW US27, US30 — proposed values held in pending* fields until EC approval. */
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
  if (existing.status === "PENDING_APPROVAL") {
    return NextResponse.json(
      { error: "This member is still pending approval. Edits aren't accepted until the original request is decided." },
      { status: 400 }
    );
  }
  if (existing.pendingDeletion) {
    return NextResponse.json(
      { error: "A deletion request is already pending for this member." },
      { status: 400 }
    );
  }
  let body: {
    fullName?: string;
    birthDate?: string;
    relationship?: string;
    maritalStatus?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const pendingFullName =
    body.fullName !== undefined && String(body.fullName).trim() !== existing.fullName
      ? String(body.fullName).trim()
      : null;

  let pendingBirthDate: Date | null = null;
  if (body.birthDate !== undefined && body.birthDate !== "") {
    const proposed = new Date(body.birthDate);
    if (!isValidBirthDate(proposed)) {
      return NextResponse.json({ error: "Please enter a valid calendar date." }, { status: 400 });
    }
    if (proposed.getTime() !== existing.birthDate.getTime()) {
      pendingBirthDate = proposed;
    }
  }

  let pendingRelationship: string | null = null;
  if (body.relationship !== undefined) {
    const r = String(body.relationship).trim();
    if (r && !VALID_RELATIONSHIPS.includes(r as typeof VALID_RELATIONSHIPS[number])) {
      return NextResponse.json({ error: "Invalid relationship." }, { status: 400 });
    }
    if ((r || null) !== existing.relationship) pendingRelationship = r || null;
  }

  let pendingMaritalStatus: string | null = null;
  if (body.maritalStatus !== undefined) {
    const ms = String(body.maritalStatus).trim().toUpperCase();
    if (!VALID_MARITAL.includes(ms as typeof VALID_MARITAL[number])) {
      return NextResponse.json({ error: "Invalid marital status." }, { status: 400 });
    }
    if (ms !== existing.maritalStatus) pendingMaritalStatus = ms;
  }

  // Bylaw checks on the proposed (or current) values.
  // SOW US30 + US29: editing a birth date that would put the member over 25 is rejected
  // (data-integrity guard), but marking as Married IS allowed — it captures a life event
  // and the entry is then displayed greyed-out / ineligible per US29.
  const effectiveBirthDate = pendingBirthDate ?? existing.birthDate;
  if (ageAt(effectiveBirthDate) > MAX_AGE_AT_ENTRY) {
    return NextResponse.json(
      { error: `Edits that would put the member over age ${MAX_AGE_AT_ENTRY} at the time of request are not allowed (bylaws Article 2.5.3).` },
      { status: 400 }
    );
  }

  const hasAnyChange =
    pendingFullName !== null ||
    pendingBirthDate !== null ||
    pendingRelationship !== null ||
    pendingMaritalStatus !== null;
  if (!hasAnyChange) {
    return NextResponse.json({ error: "No changes to submit." }, { status: 400 });
  }

  const updated = await prisma.familyMember.update({
    where: { id },
    data: {
      pendingFullName,
      pendingBirthDate,
      pendingRelationship,
      pendingMaritalStatus,
    },
  });
  return NextResponse.json({
    id: updated.id,
    fullName: updated.fullName,
    birthDate: updated.birthDate,
    relationship: updated.relationship,
    maritalStatus: updated.maritalStatus,
    status: updated.status,
    currentAge: ageAt(updated.birthDate),
    pendingDeletion: updated.pendingDeletion,
    pendingEdit: true,
    pendingFullName: updated.pendingFullName,
    pendingBirthDate: updated.pendingBirthDate,
    pendingRelationship: updated.pendingRelationship,
    pendingMaritalStatus: updated.pendingMaritalStatus,
  });
}

/** DELETE: submit deletion request. SOW US27, US31 — flagged pendingDeletion until EC approval. */
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
  // A pending-add record can be cancelled by the requester directly (no EC review needed
  // since nothing was ever approved). An approved record requires a deletion request.
  if (existing.status === "PENDING_APPROVAL") {
    await prisma.familyMember.delete({ where: { id } });
    return NextResponse.json({ ok: true, cancelled: true });
  }
  if (existing.pendingDeletion) {
    return NextResponse.json({ error: "Deletion is already pending approval." }, { status: 400 });
  }
  await prisma.familyMember.update({
    where: { id },
    data: { pendingDeletion: true },
  });
  return NextResponse.json({ ok: true, pending: true });
}
