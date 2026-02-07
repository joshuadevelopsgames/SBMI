import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import {
  getSession,
  validate2FACode,
  verifyAndUnwrapCookieValue,
  updateLastSuccessfulLogin,
} from "@/lib/auth";
import { SESSION_COOKIE } from "@/lib/constants";

function normalizeCode(value: string): string {
  return value.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 6);
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.isPre2FA || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Invalid code." }, { status: 401 });
    }

    const body = await req.json();
    const raw = body.code ?? "";
    const code = normalizeCode(String(raw));
    if (code.length !== 6) {
      return NextResponse.json({ error: "Invalid code." }, { status: 400 });
    }

    const valid = await validate2FACode(session.userId, code);
    if (!valid) {
      return NextResponse.json({ error: "Invalid code." }, { status: 401 });
    }

    const cookieStore = await cookies();
    const rawCookie = cookieStore.get(SESSION_COOKIE)?.value;
    const token = rawCookie ? verifyAndUnwrapCookieValue(rawCookie) : null;
    if (token) {
      await prisma.session.updateMany({
        where: { token },
        data: { isPre2FA: false },
      });
    }
    await updateLastSuccessfulLogin(session.userId);

    return NextResponse.json({ ok: true, redirect: "/admin" });
  } catch {
    return NextResponse.json({ error: "Invalid code." }, { status: 500 });
  }
}
