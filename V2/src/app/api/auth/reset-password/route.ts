import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { destroyAllUserSessions } from '@/lib/auth'

const TOKEN_EXPIRY_HOURS = 24

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { token, password } = body

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required.' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { passwordResetToken: token },
    })

    if (!user || !user.passwordResetAt) {
      return NextResponse.json({ error: 'Invalid or expired reset link.' }, { status: 400 })
    }

    // Check token expiry
    const expiryTime = new Date(user.passwordResetAt.getTime() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)
    if (new Date() > expiryTime) {
      return NextResponse.json({ error: 'This reset link has expired. Please request a new one.' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetAt: null,
      },
    })

    // Destroy all existing sessions
    await destroyAllUserSessions(user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[POST /api/auth/reset-password]', error)
    return NextResponse.json({ error: 'An error occurred.' }, { status: 500 })
  }
}
