import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendAssistanceRequestNotification } from "@/lib/email";
import { ASSISTANCE_DESCRIPTION_MAX_CHARS } from "@/lib/assistance-constants";

/** SOW US51: POST assistance request; create record and notify all designated administrators. */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.memberId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const member = await prisma.member.findUnique({
    where: { id: session.memberId },
    select: { firstName: true, lastName: true, status: true },
  });
  if (!member) {
    return NextResponse.json({ error: "Member not found." }, { status: 404 });
  }
  if (member.status !== "ACTIVE") {
    return NextResponse.json(
      { error: "Assistance requests are available after registration is complete." },
      { status: 403 }
    );
  }

  let body: {
    requestType?: string;
    familyMemberId?: string;
    otherName?: string;
    otherPhone?: string;
    description?: string;
  };
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
  if (description.length > ASSISTANCE_DESCRIPTION_MAX_CHARS) {
    return NextResponse.json(
      { error: `Description must be ${ASSISTANCE_DESCRIPTION_MAX_CHARS} characters or fewer.` },
      { status: 400 }
    );
  }

  const memberName = [member.firstName, member.lastName].filter(Boolean).join(" ").trim() || "Member";

  let familyMemberId: string | null = null;
  let otherName: string | null = null;
  let otherPhone: string | null = null;
  let beneficiarySummary: string;

  if (requestType === "OTHER") {
    const name = typeof body.otherName === "string" ? body.otherName.trim() : "";
    const phone = typeof body.otherPhone === "string" ? body.otherPhone.trim() : "";
    if (!name || !phone) {
      return NextResponse.json(
        { error: "Name and phone are required for a community assistance request." },
        { status: 400 }
      );
    }
    otherName = name;
    otherPhone = phone;
    beneficiarySummary = `${name} (${phone})`;
  } else {
    const fid = typeof body.familyMemberId === "string" ? body.familyMemberId.trim() : "";
    if (fid) {
      const fm = await prisma.familyMember.findFirst({
        where: { id: fid, memberId: session.memberId, status: "APPROVED" },
        select: { id: true, fullName: true },
      });
      if (!fm) {
        return NextResponse.json({ error: "Invalid household member." }, { status: 400 });
      }
      familyMemberId = fm.id;
      beneficiarySummary = `Household member: ${fm.fullName}`;
    } else {
      beneficiarySummary = "Primary member (self)";
    }
  }

  const record = await prisma.assistanceRequest.create({
    data: {
      memberId: session.memberId,
      requestType,
      familyMemberId,
      otherName,
      otherPhone,
      description,
    },
  });

  const adminUsers = await prisma.user.findMany({
    where: { role: { name: "ADMIN" }, email: { not: null } },
    select: { email: true },
  });
  const payload = {
    requestType:
      requestType === "SELF"
        ? "For myself or a household member"
        : "For someone else in the community",
    memberName,
    beneficiarySummary,
    phone: requestType === "OTHER" ? otherPhone ?? undefined : undefined,
    description,
  };
  for (const u of adminUsers) {
    if (u.email) {
      await sendAssistanceRequestNotification(u.email, payload).catch(() => {});
    }
  }

  return NextResponse.json({ id: record.id, ok: true });
}
