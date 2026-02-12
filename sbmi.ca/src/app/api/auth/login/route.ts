import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  hashEmail,
  verifyPassword,
  createSession,
  signToken,
  getSessionCookieOptions,
  createAndSend2FACode,
  updateLastSuccessfulLogin,
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

    // SOW US6: 2FA when email is configured; skip in dev so demo login works without email
    const longLived = Boolean(stayLoggedIn);
    const cookieOpts = getSessionCookieOptions(longLived);
    const skip2FA = !process.env.RESEND_API_KEY;

    const token = await createSession(user.id, {
      longLived,
      isPre2FA: skip2FA ? false : true,
    });
    if (skip2FA) {
      await updateLastSuccessfulLogin(user.id);
    } else {
      await createAndSend2FACode(user.id);
    }

    const cookieValue = signToken(token);
    const redirectTo =
      skip2FA
        ? user.role.name === "ADMIN"
          ? "/admin"
          : "/dashboard"
        : "/login/2fa";
    const res = NextResponse.json({
      ok: true,
      role: user.role.name,
      redirect: redirectTo,
    });
    res.cookies.set(SESSION_COOKIE, cookieValue, cookieOpts);
    return res;
  } catch {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 });
  }
}
