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
  // #region agent log
  fetch('http://127.0.0.1:7248/ingest/38fd0722-180d-490a-a45c-46d9597fbe7d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({hypothesisId:'A',location:'demo-login/route.ts:entry',message:'demo login entry',data:{demoAllowed,demoMode:process.env.DEMO_MODE,vercel:process.env.VERCEL},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  if (!demoAllowed) {
    return NextResponse.json({ error: "Demo login not available" }, { status: 403 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const role = (body.role ?? "MEMBER").toUpperCase();
    const email = role === "ADMIN" ? DEMO_ADMIN_EMAIL : DEMO_MEMBER_EMAIL;
    const emailHash = hashEmail(email);

    // Raw queries for Supabase transaction-mode pooler (no prepared statements)
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
    // #region agent log
    fetch('http://127.0.0.1:7248/ingest/38fd0722-180d-490a-a45c-46d9597fbe7d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({hypothesisId:'B',location:'demo-login/route.ts:afterUserLookup',message:'user lookup result',data:{found:!!user,userId:user?.id,roleName:user?.roleName,roleRequested:role},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (!user) {
      return NextResponse.json(
        { error: "Demo user not found. Run db:seed." },
        { status: 404 }
      );
    }

    const token = await createSession(user.id, { longLived: false, isPre2FA: false });
    // #region agent log
    fetch('http://127.0.0.1:7248/ingest/38fd0722-180d-490a-a45c-46d9597fbe7d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({hypothesisId:'C',location:'demo-login/route.ts:afterCreateSession',message:'createSession ok',data:{userId:user.id},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    await prisma.$executeRaw`
      UPDATE "User" SET "lastSuccessfulLoginAt" = NOW() WHERE id = ${user.id}
    `;
    // #region agent log
    fetch('http://127.0.0.1:7248/ingest/38fd0722-180d-490a-a45c-46d9597fbe7d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({hypothesisId:'D',location:'demo-login/route.ts:afterUserUpdate',message:'user update ok',data:{userId:user.id},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    const cookieValue = signToken(token);
    const cookieOpts = getSessionCookieOptions(false);
    const redirectTo = user.roleName === "ADMIN" ? "/admin" : "/dashboard";

    const res = NextResponse.json({ redirect: redirectTo });
    res.cookies.set(SESSION_COOKIE, cookieValue, cookieOpts);
    // #region agent log
    fetch('http://127.0.0.1:7248/ingest/38fd0722-180d-490a-a45c-46d9597fbe7d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({hypothesisId:'E',location:'demo-login/route.ts:success',message:'demo login success',data:{redirectTo},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    return res;
  } catch (e) {
    const err = e as Error;
    // #region agent log
    fetch('http://127.0.0.1:7248/ingest/38fd0722-180d-490a-a45c-46d9597fbe7d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({hypothesisId:'E',location:'demo-login/route.ts:catch',message:'demo login error',data:{errorMessage:err?.message,errorName:err?.name,stack:err?.stack?.slice(0,300)},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    console.error("Demo login error:", e);
    return NextResponse.json({ error: "Demo login failed" }, { status: 500 });
  }
}
