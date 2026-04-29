import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

const ALLOWED_FIELDS = ["firstName", "lastName"] as const;
type AllowedField = typeof ALLOWED_FIELDS[number];

/** POST: submit a name-change request (first or last). SOW US55: requires Executive Committee approval. */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.userId || !session?.memberId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const fieldName = String(body.fieldName ?? "").trim();
  const newValue = String(body.newValue ?? "").trim();

  if (!ALLOWED_FIELDS.includes(fieldName as AllowedField)) {
    return NextResponse.json({ error: "fieldName must be 'firstName' or 'lastName'." }, { status: 400 });
  }
  if (!newValue) {
    return NextResponse.json({ error: "New value is required." }, { status: 400 });
  }
  if (newValue.length > 50) {
    return NextResponse.json({ error: "Name is too long." }, { status: 400 });
  }

  const member = await prisma.member.findUnique({ where: { id: session.memberId } });
  if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

  const oldValue = fieldName === "firstName" ? member.firstName : member.lastName;
  if (newValue === oldValue) {
    return NextResponse.json({ error: "New value matches the current value." }, { status: 400 });
  }

  // SOW US55: only one outstanding request per field at a time.
  const existing = await prisma.profileChangeRequest.findFirst({
    where: { userId: session.userId, fieldName, status: "PENDING" },
  });
  if (existing) {
    return NextResponse.json(
      { error: "A request for this field is already pending Executive Committee review." },
      { status: 400 }
    );
  }

  await prisma.profileChangeRequest.create({
    data: {
      userId: session.userId,
      fieldName,
      oldValue,
      newValue,
      status: "PENDING",
    },
  });

  return NextResponse.json({ ok: true });
}

/** GET: list this user's pending name-change requests so the UI can show "request pending" states. */
export async function GET() {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await prisma.profileChangeRequest.findMany({
    where: { userId: session.userId, status: "PENDING" },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(
    rows.map((r) => ({
      id: r.id,
      fieldName: r.fieldName,
      oldValue: r.oldValue,
      newValue: r.newValue,
      createdAt: r.createdAt,
    }))
  );
}
