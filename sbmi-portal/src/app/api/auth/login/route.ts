import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashEmail, verifyPassword, createSession, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const emailHash = hashEmail(email);
    const user = await prisma.user.findUnique({
      where: { emailHash },
      include: { role: true },
    });
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = await createSession(user.id);
    await setSessionCookie(token);

    return NextResponse.json({
      ok: true,
      role: user.role.name,
      redirect: user.role.name === "ADMIN" ? "/admin" : "/dashboard",
    });
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
