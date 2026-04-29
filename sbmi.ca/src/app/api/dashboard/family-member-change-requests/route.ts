import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

/** GET: list pending family-member add/remove requests for current member. */
export async function GET() {
  const session = await getSession();
  if (!session?.memberId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requests = await prisma.familyMemberChangeRequest.findMany({
    where: { memberId: session.memberId, status: "PENDING" },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(
    requests.map((request) => ({
      id: request.id,
      action: request.action,
      status: request.status,
      familyMemberId: request.familyMemberId,
      fullName: request.fullName,
      birthDate: request.birthDate,
      createdAt: request.createdAt,
    }))
  );
}
