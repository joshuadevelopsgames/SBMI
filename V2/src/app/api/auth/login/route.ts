import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { generateCode } from '@/lib/auth'
import { send2FACodeEmail } from '@/lib/email'

// Temporary pre-2FA session store (in-memory for simplicity; use DB for production scale)
// We store the userId and stayLoggedIn in a short-lived cookie until 2FA completes
const PRE_2FA_COOKIE = 'sbmi_pre2fa'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, stayLoggedIn } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })

    // Always do bcrypt compare to prevent timing attacks
    const dummyHash = '$2a$12$dummy.hash.for.timing.attack.prevention.only'
    const passwordMatch = user
      ? await bcrypt.compare(password, user.passwordHash)
      : await bcrypt.compare(password, dummyHash).then(() => false)

    if (!user || !passwordMatch) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
    }

    // Generate 2FA code
    const code = generateCode(6)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorCode: code,
        twoFactorCodeAt: new Date(),
      },
    })

    // Send 2FA email (bypass if admin on dev branch)
    if (user.role !== 'ADMIN' || process.env.VERCEL_GIT_COMMIT_REF !== 'dev') {
      try {
        await send2FACodeEmail(user.email, code)
      } catch (emailError) {
        console.error('[POST /api/auth/login] Email error:', emailError)
        // If it's a member on dev, don't crash, just log. 
        // In prod, this might be a 500 but on dev we want to allow access.
      }
    } else {
      console.log(`[POST /api/auth/login] Bypassing 2FA email for admin ${user.email}. Code: ${code}`)
    }

    // Set pre-2FA cookie (short-lived, 10 minutes)
    const pre2faData = JSON.stringify({ userId: user.id, stayLoggedIn: !!stayLoggedIn })
    const pre2faEncoded = Buffer.from(pre2faData).toString('base64')

    const response = NextResponse.json({ success: true })
    response.cookies.set(PRE_2FA_COOKIE, pre2faEncoded, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    })

    return response
  } catch (error) {
    console.error('[POST /api/auth/login]', error)
    return NextResponse.json({ error: 'An error occurred. Please try again.' }, { status: 500 })
  }
}
