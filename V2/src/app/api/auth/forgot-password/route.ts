import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateToken } from '@/lib/auth'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ success: true })
    }

    const token = generateToken()
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: token,
        passwordResetAt: new Date(),
      },
    })

    await sendPasswordResetEmail(user.email, token)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[POST /api/auth/forgot-password]', error)
    return NextResponse.json({ error: 'An error occurred.' }, { status: 500 })
  }
}
