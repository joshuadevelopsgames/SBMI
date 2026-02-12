import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createAndSend2FACode } from "@/lib/auth";

/** SOW US6: link to resend a new 2FA code */
export async function POST() {
  const session = await getSession();
  if (!session || !session.isPre2FA) {
    return NextResponse.json({ error: "Session required." }, { status: 401 });
  }
  try {
    await createAndSend2FACode(session.userId);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not send code." }, { status: 500 });
  }
}
