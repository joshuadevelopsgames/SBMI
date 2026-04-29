import { cookies } from 'next/headers'
import { prisma } from './prisma'
import { User } from '@prisma/client'

const SESSION_COOKIE = 'sbmi_session'

export async function getSession(): Promise<User | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!session) return null

  // Check expiry for non-persistent sessions
  if (!session.persistent && session.expiresAt && session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } })
    return null
  }

  return session.user
}

export async function createSession(
  userId: string,
  persistent: boolean
): Promise<string> {
  const expiresAt = persistent
    ? null
    : new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  const session = await prisma.session.create({
    data: {
      userId,
      persistent,
      expiresAt,
    },
  })

  return session.token
}

export async function destroySession(token: string): Promise<void> {
  await prisma.session.deleteMany({ where: { token } })
}

export async function destroyAllUserSessions(userId: string): Promise<void> {
  await prisma.session.deleteMany({ where: { userId } })
}

export function generateCode(length = 6): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export function generateToken(): string {
  const array = new Uint8Array(32)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array)
  } else {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256)
    }
  }
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('')
}
