import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { consumeEmailChangeToken, hashEmail } from "@/lib/auth";

/** SOW US49–US50: Approve email change from link in email; update user, invalidate sessions, redirect to login. */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  if (!token) {
    return NextResponse.redirect(new URL("/login?error=invalid_link", req.url));
  }

  const payload = await consumeEmailChangeToken(token);
  if (!payload) {
    return NextResponse.redirect(new URL("/login?error=email_change_expired", req.url));
  }

  const emailHash = hashEmail(payload.newEmail);
  await prisma.user.update({
    where: { id: payload.userId },
    data: { email: payload.newEmail, emailHash },
  });
  await prisma.session.deleteMany({ where: { userId: payload.userId } });

  return NextResponse.redirect(new URL("/login?reason=email_changed", req.url));
}
