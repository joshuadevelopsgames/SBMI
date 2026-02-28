import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateToken } from '@/lib/auth'
import { sendEmailChangeConfirmation } from '@/lib/email'

export async function PATCH(req: NextRequest) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { email } = body

    if (!email?.trim()) {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
    }

    if (email.toLowerCase() === user.email.toLowerCase()) {
      return NextResponse.json({ error: 'This is already your current email address.' }, { status: 400 })
    }

    // Check if email is already taken
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (existing) {
      return NextResponse.json({ error: 'This email address is already in use.' }, { status: 400 })
    }

    const token = generateToken()
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailChangeToken: token,
        emailChangePending: email.toLowerCase(),
        emailChangeAt: new Date(),
      },
    })

    await sendEmailChangeConfirmation(email, email, token)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[PATCH /api/profile/email]', error)
    return NextResponse.json({ error: 'An error occurred.' }, { status: 500 })
  }
}
