import { cookies } from "next/headers";
import { createHash, createHmac, timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

const SESSION_COOKIE = "sbmi_session";
const SESSION_DAYS = 7;

function getSessionSecret(): string | undefined {
  return process.env.SESSION_SECRET;
}

function signToken(token: string): string {
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

export async function createSession(userId: string): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS);
  await prisma.session.create({
    data: { token, userId, expiresAt },
  });
  return token;
}

export async function getSession(): Promise<{ userId: string; role: string; memberId: string | null } | null> {
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
  };
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
