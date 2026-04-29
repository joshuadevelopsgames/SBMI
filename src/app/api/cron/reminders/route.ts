import { NextRequest, NextResponse } from "next/server";

/**
 * Scheduled entry point for US49 (reminder emails) + US50 (penalty rows).
 * Secure with CRON_SECRET — wire Vercel Cron to GET this path daily (see vercel.json).
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ ok: false, error: "CRON_SECRET is not configured." }, { status: 503 });
  }

  const auth = req.headers.get("authorization");
  const qs = req.nextUrl.searchParams.get("secret");
  if (auth !== `Bearer ${secret}` && qs !== secret) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  // Stub — implement ReminderLog / idempotent sends per reminders-and-penalties.md
  return NextResponse.json({
    ok: true,
    ranAt: new Date().toISOString(),
    message: "Stub: no reminders or penalties processed yet.",
  });
}
