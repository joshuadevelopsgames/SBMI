import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendAssistanceRequestNotification } from "@/lib/email";

/** SOW US51: POST assistance request; create record and notify all designated administrators. */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.memberId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { requestType?: string; familyMemberId?: string; description?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const requestType = body.requestType === "OTHER" ? "OTHER" : "SELF";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  if (!description) {
    return NextResponse.json({ error: "Description is required." }, { status: 400 });
  }

  const member = await prisma.member.findUnique({
    where: { id: session.memberId },
    select: { firstName: true, lastName: true },
  });
  if (!member) {
    return NextResponse.json({ error: "Member not found." }, { status: 404 });
  }
  const memberName = [member.firstName, member.lastName].filter(Boolean).join(" ").trim() || "Member";

  let familyMemberId: string | null = null;
  let forName: string | undefined;

  if (requestType === "OTHER") {
    const fid = typeof body.familyMemberId === "string" ? body.familyMemberId.trim() : "";
    if (!fid) {
      return NextResponse.json({ error: "Please select a family member." }, { status: 400 });
    }
    const fm = await prisma.familyMember.findFirst({
      where: { id: fid, memberId: session.memberId },
      select: { id: true, fullName: true },
    });
    if (!fm) {
      return NextResponse.json({ error: "Invalid family member." }, { status: 400 });
    }
    familyMemberId = fm.id;
    forName = fm.fullName;
  }

  const record = await prisma.assistanceRequest.create({
    data: {
      memberId: session.memberId,
      requestType,
      familyMemberId,
      otherName: forName ?? null,
      otherPhone: null,
      description,
    },
  });

  const adminUsers = await prisma.user.findMany({
    where: { role: { name: "ADMIN" }, email: { not: null } },
    select: { email: true },
  });
  const payload = {
    requestType: requestType === "SELF" ? "For myself" : "For someone else",
    memberName,
    forName,
    phone: undefined,
    description,
  };
  for (const u of adminUsers) {
    if (u.email) {
      await sendAssistanceRequestNotification(u.email, payload).catch(() => {});
    }
  }

  return NextResponse.json({ id: record.id, ok: true });
}
