import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createEmailChangeToken } from "@/lib/auth";
import { sendEmailChangeConfirmation, buildEmailChangeApprovalLink } from "@/lib/email";

const EMAIL_MAX_LENGTH = 50;

function isValidEmail(value: string): boolean {
  const trimmed = String(value).trim().toLowerCase();
  return trimmed.length <= EMAIL_MAX_LENGTH && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

/** SOW US48: Request email change — confirmation sent to current email with approval link. */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const raw = body.newEmail ? String(body.newEmail).trim() : "";
  const newEmail = raw.toLowerCase();
  if (!newEmail || !isValidEmail(newEmail)) {
    return NextResponse.json({ error: "Valid new email is required." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { email: true },
  });
  if (!user?.email) {
    return NextResponse.json({ error: "No email on file. Contact support." }, { status: 400 });
  }
  if (newEmail === user.email) {
    return NextResponse.json({ error: "New email is the same as current email." }, { status: 400 });
  }

  const token = await createEmailChangeToken(session.userId, newEmail);
  const approvalLink = buildEmailChangeApprovalLink(token);
  await sendEmailChangeConfirmation(user.email, newEmail, approvalLink);

  return NextResponse.json({ ok: true });
}
