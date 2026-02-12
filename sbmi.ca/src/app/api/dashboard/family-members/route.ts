import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

const MAX_AGE_AT_ENTRY = 25;

function ageAt(birthDate: Date, at: Date = new Date()): number {
  const a = at.getFullYear() - birthDate.getFullYear();
  const m = at.getMonth() - birthDate.getMonth();
  const d = at.getDate() - birthDate.getDate();
  return m < 0 || (m === 0 && d < 0) ? a - 1 : a;
}

function isValidBirthDate(d: Date): boolean {
  return !Number.isNaN(d.getTime()) && d <= new Date();
}

/** GET: list family members for current member. SOW Family US1 */
export async function GET() {
  const session = await getSession();
  if (!session?.memberId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const list = await prisma.familyMember.findMany({
    where: { memberId: session.memberId },
    orderBy: { birthDate: "desc" },
  });
  const withAge = list.map((fm) => ({
    id: fm.id,
    fullName: fm.fullName,
    birthDate: fm.birthDate,
    currentAge: ageAt(fm.birthDate),
  }));
  return NextResponse.json(withAge);
}

/** POST: add family member. SOW Family US2 — age ≤25 at entry */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.memberId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: { fullName?: string; birthDate?: string };
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
      { error: `Family members over ${MAX_AGE_AT_ENTRY} years of age at time of entry cannot be added.` },
      { status: 400 }
    );
  }
  const created = await prisma.familyMember.create({
    data: { memberId: session.memberId, fullName, birthDate },
  });
  return NextResponse.json({
    id: created.id,
    fullName: created.fullName,
    birthDate: created.birthDate,
    currentAge: ageAt(created.birthDate),
  });
}
