import { cookies } from "next/headers";
import { createHash, createHmac, timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "./db";
import { SESSION_COOKIE } from "./constants";

// SOW US8: without "stay logged in" = expire when browser closes or after 24h, whichever first
const SESSION_HOURS_NON_PERSISTENT = 24;
// SOW US3: with "stay logged in" = non-expiring cookie (use long-lived server session)
const SESSION_DAYS_PERSISTENT = 365 * 10;
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
  const expiresAt = new Date();
  if (options?.longLived) {
    expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS_PERSISTENT);
  } else {
    expiresAt.setHours(expiresAt.getHours() + SESSION_HOURS_NON_PERSISTENT);
  }
  const isPre2FA = options?.isPre2FA ?? false;
  // Raw INSERT for Supabase transaction-mode pooler (no prepared statements)
  await prisma.$executeRaw(
    Prisma.sql`
      INSERT INTO "Session" (id, token, "userId", "expiresAt", "isPre2FA", "createdAt")
      VALUES (gen_random_uuid()::text, ${token}, ${userId}, ${expiresAt.toISOString()}::timestamptz, ${isPre2FA}, NOW())
    `
  );
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
    if (!token || typeof token !== "string" || token.length === 0) return null;

    // Raw query to avoid Turbopack/Prisma client bundling issues with session lookup
    const rows = await prisma.$queryRaw<
      Array<{ userId: string; roleName: string; memberId: string | null; isPre2FA: boolean }>
    >(Prisma.sql`
      SELECT s."userId", s."isPre2FA", r.name AS "roleName", u."memberId"
      FROM "Session" s
      INNER JOIN "User" u ON u.id = s."userId"
      INNER JOIN "Role" r ON r.id = u."roleId"
      WHERE s.token = ${token} AND s."expiresAt" > NOW()
      LIMIT 1
    `);
    const row = rows[0];
    if (!row) return null;
    return {
      userId: row.userId,
      role: row.roleName,
      memberId: row.memberId,
      isPre2FA: row.isPre2FA,
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
    path: "/",
  });
}

export async function destroySession(token?: string): Promise<void> {
  if (token) {
    // Raw query to avoid Turbopack/Prisma client bundling issues
    await prisma.$executeRaw`DELETE FROM "Session" WHERE token = ${token}`.catch(() => {});
  }
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/** SOW US3/US8: session cookie (browser close / 24h) vs non-expiring (stay logged in). */
export function getSessionCookieOptions(longLived: boolean) {
  const maxAge = longLived ? SESSION_DAYS_PERSISTENT * 24 * 60 * 60 : undefined;
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
  // Raw query to avoid Turbopack/Prisma client bundling issues
  await prisma.$executeRaw`UPDATE "User" SET "lastSuccessfulLoginAt" = NOW() WHERE id = ${userId}`;
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

const EMAIL_CHANGE_EXPIRY_MINUTES = 60;

export async function createEmailChangeToken(userId: string, newEmail: string): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + EMAIL_CHANGE_EXPIRY_MINUTES);
  await prisma.emailChangeRequest.create({
    data: { token, userId, newEmail: newEmail.trim().toLowerCase(), expiresAt },
  });
  return token;
}

export async function consumeEmailChangeToken(token: string): Promise<{ userId: string; newEmail: string } | null> {
  const row = await prisma.emailChangeRequest.findUnique({ where: { token } });
  if (!row || row.expiresAt < new Date()) return null;
  await prisma.emailChangeRequest.delete({ where: { id: row.id } });
  return { userId: row.userId, newEmail: row.newEmail };
}
