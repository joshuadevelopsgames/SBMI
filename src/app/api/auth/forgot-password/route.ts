import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashEmail, createPasswordResetToken } from "@/lib/auth";
import { sendPasswordResetLink, buildPasswordResetLink } from "@/lib/email";
import { isRecaptchaConfigured, verifyRecaptchaToken } from "@/lib/recaptcha";

const EMAIL_MAX_LENGTH = 50;

function isValidEmail(value: string): boolean {
  const trimmed = String(value).trim().toLowerCase();
  return trimmed.length <= EMAIL_MAX_LENGTH && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body.email ? String(body.email).trim().toLowerCase() : "";
    const recaptchaToken =
      typeof body.recaptchaToken === "string" ? body.recaptchaToken : undefined;

    const needsCaptcha = isRecaptchaConfigured();
    if (needsCaptcha) {
      const ok = await verifyRecaptchaToken(recaptchaToken);
      if (!ok) {
        return NextResponse.json({ ok: false, error: "Please complete the reCAPTCHA check." }, { status: 400 });
      }
    } else if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { ok: false, error: "Password reset is not fully configured." },
        { status: 503 }
      );
    }

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ ok: true });
    }

    const emailHash = hashEmail(email);
    const user = await prisma.user.findUnique({
      where: { emailHash },
    });
    if (user?.email) {
      const token = await createPasswordResetToken(user.id);
      const link = buildPasswordResetLink(token);
      await sendPasswordResetLink(user.email, link);
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
