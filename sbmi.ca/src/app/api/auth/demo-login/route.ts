import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  hashEmail,
  createSession,
  signToken,
  getSessionCookieOptions,
} from "@/lib/auth";
import { SESSION_COOKIE } from "@/lib/constants";

const DEMO_MEMBER_EMAIL = "demo@sbmi.ca";
const DEMO_ADMIN_EMAIL = "admin@sbmi.ca";

export async function POST(req: NextRequest) {
  const demoAllowed =
    process.env.DEMO_MODE === "true" || process.env.VERCEL === "1";
  if (!demoAllowed) {
    return NextResponse.json({ error: "Demo login not available" }, { status: 403 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const role = (body.role ?? "MEMBER").toUpperCase();
    const email = role === "ADMIN" ? DEMO_ADMIN_EMAIL : DEMO_MEMBER_EMAIL;
    const emailHash = hashEmail(email);

    const users = await prisma.$queryRaw<Array<{ id: string; roleName: string }>>(
      Prisma.sql`
        SELECT u.id, r.name AS "roleName"
        FROM "User" u
        INNER JOIN "Role" r ON r.id = u."roleId"
        WHERE u."emailHash" = ${emailHash}
        LIMIT 1
      `
    );
    const user = users[0];
    if (!user) {
      return NextResponse.json(
        { error: "Demo user not found. Run db:seed." },
        { status: 404 }
      );
    }

    const token = await createSession(user.id, { longLived: false, isPre2FA: false });

    await prisma.$executeRaw`
      UPDATE "User" SET "lastSuccessfulLoginAt" = NOW() WHERE id = ${user.id}
    `;

    const cookieValue = signToken(token);
    const cookieOpts = getSessionCookieOptions(false);
    const redirectTo = user.roleName === "ADMIN" ? "/admin" : "/dashboard";

    const res = NextResponse.json({ redirect: redirectTo });
    res.cookies.set(SESSION_COOKIE, cookieValue, cookieOpts);
    return res;
  } catch (e) {
    console.error("Demo login error:", e);
    return NextResponse.json({ error: "Demo login failed" }, { status: 500 });
  }
}
