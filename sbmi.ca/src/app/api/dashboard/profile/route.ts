import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session?.memberId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { firstName, lastName, phone } = body;

  const data: { firstName?: string; lastName?: string; phone?: string | null } = {};
  if (typeof firstName === "string" && firstName.trim()) data.firstName = firstName.trim();
  if (typeof lastName === "string" && lastName.trim()) data.lastName = lastName.trim();
  if (typeof phone === "string") data.phone = phone.trim() || null;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  await prisma.member.update({
    where: { id: session.memberId },
    data,
  });

  return NextResponse.json({ ok: true });
}
