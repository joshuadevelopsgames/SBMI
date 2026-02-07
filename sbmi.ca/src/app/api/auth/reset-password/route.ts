import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { consumePasswordResetToken, hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = body.token ? String(body.token).trim() : "";
    const password = body.password ? String(body.password) : "";
    if (!token || password.length < 8) {
      return NextResponse.json(
        { error: "Invalid or expired link. Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const userId = await consumePasswordResetToken(token);
    if (!userId) {
      return NextResponse.json({ error: "This link is invalid or has expired." }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "This link is invalid or has expired." }, { status: 500 });
  }
}
