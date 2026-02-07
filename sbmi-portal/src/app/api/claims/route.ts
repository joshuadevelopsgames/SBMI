import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.memberId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { reason, amount, description } = body;

  if (!reason?.trim()) {
    return NextResponse.json(
      { error: "reason is required" },
      { status: 400 }
    );
  }

  const claim = await prisma.claim.create({
    data: {
      memberId: session.memberId,
      reason: String(reason).trim(),
      amount: amount != null ? Number(amount) : null,
      description: description?.trim() || null,
      status: "PENDING",
    },
  });

  return NextResponse.json({ ok: true, claimId: claim.id });
}
