import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

const MAX_AGE_AT_ENTRY = 25; // SOW US28: bylaws Article 2.5.3
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

/** GET: list family members for current member.
 * SOW US27: returns approved + pending so the member sees the state of their own requests.
 * Rejected entries are filtered out.
 */
export async function GET() {
  const session = await getSession();
  if (!session?.memberId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const list = await prisma.familyMember.findMany({
    where: { memberId: session.memberId, status: { not: "REJECTED" } },
    orderBy: { birthDate: "desc" },
  });
  const projected = list.map((fm) => ({
    id: fm.id,
    fullName: fm.fullName,
    birthDate: fm.birthDate,
    relationship: fm.relationship,
    maritalStatus: fm.maritalStatus,
    status: fm.status,
    currentAge: ageAt(fm.birthDate),
    pendingDeletion: fm.pendingDeletion,
    pendingEdit:
      fm.pendingFullName !== null ||
      fm.pendingBirthDate !== null ||
      fm.pendingRelationship !== null ||
      fm.pendingMaritalStatus !== null,
    pendingFullName: fm.pendingFullName,
    pendingBirthDate: fm.pendingBirthDate,
    pendingRelationship: fm.pendingRelationship,
    pendingMaritalStatus: fm.pendingMaritalStatus,
  }));
  return NextResponse.json(projected);
}

/** POST: submit Add request. SOW US27, US28 — pending Executive Committee approval. */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.memberId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
  const fullName = String(body.fullName ?? "").trim();
  if (!fullName) {
    return NextResponse.json({ error: "Full name is required." }, { status: 400 });
  }
  const rawDate = body.birthDate;
  if (rawDate == null || rawDate === "") {
    return NextResponse.json({ error: "Birth date is required." }, { status: 400 });
  }
  const birthDate = new Date(rawDate);
  if (!isValidBirthDate(birthDate)) {
    return NextResponse.json({ error: "Please enter a valid calendar date." }, { status: 400 });
  }
  const age = ageAt(birthDate);
  if (age > MAX_AGE_AT_ENTRY) {
    return NextResponse.json(
      { error: `Family members over ${MAX_AGE_AT_ENTRY} at time of request cannot be added (bylaws Article 2.5.3).` },
      { status: 400 }
    );
  }
  const relationship = body.relationship ? String(body.relationship).trim() : null;
  if (relationship && !VALID_RELATIONSHIPS.includes(relationship as typeof VALID_RELATIONSHIPS[number])) {
    return NextResponse.json({ error: "Invalid relationship." }, { status: 400 });
  }
  const maritalStatus = body.maritalStatus
    ? String(body.maritalStatus).trim().toUpperCase()
    : "UNMARRIED";
  if (!VALID_MARITAL.includes(maritalStatus as typeof VALID_MARITAL[number])) {
    return NextResponse.json({ error: "Invalid marital status." }, { status: 400 });
  }
  if (maritalStatus === "MARRIED") {
    return NextResponse.json(
      { error: "Married dependents cannot be added (bylaws Article 2.5.3)." },
      { status: 400 }
    );
  }
  const created = await prisma.familyMember.create({
    data: {
      memberId: session.memberId,
      fullName,
      birthDate,
      relationship,
      maritalStatus,
      status: "PENDING_APPROVAL",
    },
  });
  return NextResponse.json({
    id: created.id,
    fullName: created.fullName,
    birthDate: created.birthDate,
    relationship: created.relationship,
    maritalStatus: created.maritalStatus,
    status: created.status,
    currentAge: ageAt(created.birthDate),
    pendingDeletion: false,
    pendingEdit: false,
  });
}
