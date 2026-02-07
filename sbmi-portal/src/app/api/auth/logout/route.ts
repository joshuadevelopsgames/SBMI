import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { verifyAndUnwrapCookieValue } from "@/lib/auth";

const SESSION_COOKIE = "sbmi_session";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  const token = raw ? verifyAndUnwrapCookieValue(raw) : null;
  if (token) {
    await prisma.session.deleteMany({ where: { token } }).catch(() => {});
  }
  const res = NextResponse.redirect(new URL("/", req.url));
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
