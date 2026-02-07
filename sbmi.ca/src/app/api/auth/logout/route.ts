import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { verifyAndUnwrapCookieValue } from "@/lib/auth";
import { SESSION_COOKIE } from "@/lib/constants";

function clearCookieAndRedirect(req: NextRequest, to = "/") {
  const res = NextResponse.redirect(new URL(to, req.url));
  res.cookies.set(SESSION_COOKIE, "", { maxAge: 0, path: "/" });
  return res;
}

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  const token = raw ? verifyAndUnwrapCookieValue(raw) : null;
  if (token) await prisma.session.deleteMany({ where: { token } }).catch(() => {});
  const to = req.nextUrl.searchParams.get("redirect") ?? "/";
  return clearCookieAndRedirect(req, to);
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  const token = raw ? verifyAndUnwrapCookieValue(raw) : null;
  if (token) await prisma.session.deleteMany({ where: { token } }).catch(() => {});
  return clearCookieAndRedirect(req, "/");
}
