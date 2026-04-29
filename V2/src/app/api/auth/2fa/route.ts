import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createSession } from '@/lib/auth'

const PRE_2FA_COOKIE = 'sbmi_pre2fa'
const SESSION_COOKIE = 'sbmi_session'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { code } = body

    // Get pre-2FA cookie
    const pre2faCookie = req.cookies.get(PRE_2FA_COOKIE)?.value
    if (!pre2faCookie) {
      return NextResponse.json({ error: 'Session expired. Please sign in again.' }, { status: 401 })
    }

    let userId: string
    let stayLoggedIn: boolean
    try {
      const decoded = JSON.parse(Buffer.from(pre2faCookie, 'base64').toString('utf8'))
      userId = decoded.userId
      stayLoggedIn = decoded.stayLoggedIn
    } catch {
      return NextResponse.json({ error: 'Session expired. Please sign in again.' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || !user.twoFactorCode) {
      return NextResponse.json({ error: 'Invalid verification code.' }, { status: 401 })
    }

    // Validate code (case-insensitive, alphanumeric)
    const submittedCode = code.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6)
    if (submittedCode !== user.twoFactorCode.toUpperCase()) {
      return NextResponse.json({ error: 'Invalid verification code.' }, { status: 401 })
    }

    // Clear 2FA code and update last login
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorCode: null,
        twoFactorCodeAt: null,
        lastLoginAt: new Date(),
      },
    })

    // Create session
    const sessionToken = await createSession(userId, stayLoggedIn)

    const response = NextResponse.json({ success: true, role: user.role })

    // Clear pre-2FA cookie
    response.cookies.set(PRE_2FA_COOKIE, '', { maxAge: 0, path: '/' })

    // Set session cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      ...(stayLoggedIn ? { maxAge: 365 * 24 * 60 * 60 } : {}), // 1 year if persistent
    }
    response.cookies.set(SESSION_COOKIE, sessionToken, cookieOptions)

    return response
  } catch (error) {
    console.error('[POST /api/auth/2fa]', error)
    return NextResponse.json({ error: 'An error occurred. Please try again.' }, { status: 500 })
  }
}
