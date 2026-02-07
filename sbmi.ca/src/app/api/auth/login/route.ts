import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  hashEmail,
  verifyPassword,
  createSession,
  signToken,
  getSessionCookieOptions,
  createAndSend2FACode,
} from "@/lib/auth";
import { SESSION_COOKIE } from "@/lib/constants";

const EMAIL_MAX_LENGTH = 50;
const GENERIC_ERROR = "Invalid email or password";

function isValidEmail(value: string): boolean {
  const trimmed = String(value).trim().toLowerCase();
  if (!trimmed || trimmed.length > EMAIL_MAX_LENGTH) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, stayLoggedIn } = body;
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const normalized = String(email).trim().toLowerCase();
    if (normalized.length > EMAIL_MAX_LENGTH || !isValidEmail(normalized)) {
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
    }

    const emailHash = hashEmail(normalized);
    const user = await prisma.user.findUnique({
      where: { emailHash },
      include: { role: true },
    });
    if (!user) {
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
    }

    const longLived = Boolean(stayLoggedIn);
    const cookieOpts = getSessionCookieOptions(longLived);

    if (user.role.name === "ADMIN") {
      const token = await createSession(user.id, { longLived, isPre2FA: true });
      await createAndSend2FACode(user.id);
      const cookieValue = signToken(token);
      const res = NextResponse.json({
        ok: true,
        role: "ADMIN",
        redirect: "/login/2fa",
      });
      res.cookies.set(SESSION_COOKIE, cookieValue, cookieOpts);
      return res;
    }

    const token = await createSession(user.id, { longLived });
    const { updateLastSuccessfulLogin } = await import("@/lib/auth");
    await updateLastSuccessfulLogin(user.id);
    const cookieValue = signToken(token);
    const res = NextResponse.json({
      ok: true,
      role: user.role.name,
      redirect: "/dashboard",
    });
    res.cookies.set(SESSION_COOKIE, cookieValue, cookieOpts);
    return res;
  } catch {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 });
  }
}
