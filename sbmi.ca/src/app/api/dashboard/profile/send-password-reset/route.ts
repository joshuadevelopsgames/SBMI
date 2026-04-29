import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createPasswordResetToken } from "@/lib/auth";
import { sendPasswordResetLink, buildPasswordResetLink } from "@/lib/email";

/** SOW US47: Change password from profile — same flow as password reset; link sent to current email. */
export async function POST() {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { email: true },
  });
  if (!user?.email) {
    return NextResponse.json({ error: "No email on file. Contact support." }, { status: 400 });
  }

  const token = await createPasswordResetToken(session.userId);
  const link = buildPasswordResetLink(token);
  await sendPasswordResetLink(user.email, link);

  return NextResponse.json({ ok: true });
}
