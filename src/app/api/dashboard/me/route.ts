import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

/** Lightweight member context for client pages (e.g. assistance gating). */
export async function GET() {
  const session = await getSession();
  if (!session?.memberId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const m = await prisma.member.findUnique({
    where: { id: session.memberId },
    select: { status: true, firstName: true, lastName: true },
  });
  if (!m) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    status: m.status,
    firstName: m.firstName,
    lastName: m.lastName,
  });
}
