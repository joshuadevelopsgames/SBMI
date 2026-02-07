import { cookies } from "next/headers";
import { createHash, createHmac, timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "./db";
import { SESSION_COOKIE } from "./constants";

const SESSION_DAYS = 7;
const SESSION_DAYS_LONG = 30; // "Stay logged in" (SOW: fixed, not configurable)
const TWO_FACTOR_EXPIRY_MINUTES = 10;
const PASSWORD_RESET_EXPIRY_MINUTES = 60;

function getSessionSecret(): string | undefined {
  return process.env.SESSION_SECRET;
}

export function signToken(token: string): string {
  const secret = getSessionSecret();
  if (!secret) return token;
  const sig = createHmac("sha256", secret).update(token).digest("hex");
  return `${token}.${sig}`;
}

export function verifyAndUnwrapCookieValue(value: string): string | null {
  const secret = getSessionSecret();
  if (!secret) return value;
  const dot = value.lastIndexOf(".");
  if (dot === -1) return null;
  const token = value.slice(0, dot);
  const sig = value.slice(dot + 1);
  const expected = createHmac("sha256", secret).update(token).digest("hex");
  if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"))) return null;
  return token;
}

/** Normalize and hash email for storage/lookup (never store plain email). */
export function hashEmail(email: string): string {
  const normalized = String(email).trim().toLowerCase();
  return createHash("sha256").update(normalized).digest("hex");
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

function generateToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createSession(
  userId: string,
  options?: { longLived?: boolean; isPre2FA?: boolean }
): Promise<string> {
  const token = generateToken();
  const days = options?.longLived ? SESSION_DAYS_LONG : SESSION_DAYS;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);
  await prisma.session.create({
    data: { token, userId, expiresAt, isPre2FA: options?.isPre2FA ?? false },
  });
  return token;
}

export async function getSession(): Promise<
  { userId: string; role: string; memberId: string | null; isPre2FA: boolean } | null
> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(SESSION_COOKIE)?.value;
    if (!raw) return null;
    const token = verifyAndUnwrapCookieValue(raw);
    if (!token) return null;

    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: { include: { role: true } } },
    });
    if (!session || session.expiresAt < new Date()) {
      if (session) await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
      return null;
    }
    return {
      userId: session.userId,
      role: session.user.role.name,
      memberId: session.user.memberId,
      isPre2FA: session.isPre2FA,
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  const value = signToken(token);
  cookieStore.set(SESSION_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
    path: "/",
  });
}

export async function destroySession(token?: string): Promise<void> {
  if (token) {
    await prisma.session.deleteMany({ where: { token } }).catch(() => {});
  }
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/** Cookie options: session cookie (no maxAge) vs long-lived (stay logged in). */
export function getSessionCookieOptions(longLived: boolean) {
  const maxAge = longLived ? SESSION_DAYS_LONG * 24 * 60 * 60 : undefined; // undefined = session cookie
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    ...(maxAge != null && { maxAge }),
  };
}

// --- 2FA (SOW: admin only, code sent by email) ---
const ALPHANUM = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generate6CharCode(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(6)))
    .map((b) => ALPHANUM[b % ALPHANUM.length])
    .join("");
}

export async function createAndSend2FACode(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.email) throw new Error("User has no email for 2FA");
  const code = generate6CharCode();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + TWO_FACTOR_EXPIRY_MINUTES);
  await prisma.twoFactorCode.upsert({
    where: { userId },
    create: { userId, code, expiresAt },
    update: { code, expiresAt },
  });
  const { send2FACode } = await import("./email");
  await send2FACode(user.email, code);
}

export async function validate2FACode(userId: string, code: string): Promise<boolean> {
  const normalized = code.replace(/\s/g, "").toUpperCase().slice(0, 6);
  if (normalized.length !== 6) return false;
  const row = await prisma.twoFactorCode.findUnique({ where: { userId } });
  if (!row || row.expiresAt < new Date()) return false;
  const ok = row.code === normalized;
  if (ok) await prisma.twoFactorCode.delete({ where: { userId } });
  return ok;
}

export async function updateLastSuccessfulLogin(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { lastSuccessfulLoginAt: new Date() },
  });
}

// --- Password reset (SOW: single-use magic key link) ---
export async function createPasswordResetToken(userId: string): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + PASSWORD_RESET_EXPIRY_MINUTES);
  await prisma.passwordResetToken.create({
    data: { token, userId, expiresAt },
  });
  return token;
}

export async function consumePasswordResetToken(token: string): Promise<string | null> {
  const row = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!row || row.usedAt || row.expiresAt < new Date()) return null;
  await prisma.passwordResetToken.update({
    where: { id: row.id },
    data: { usedAt: new Date() },
  });
  return row.userId;
}
