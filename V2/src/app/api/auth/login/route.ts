import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { generateCode } from '@/lib/auth'
import { send2FACodeEmail } from '@/lib/email'

const PRE_2FA_COOKIE = 'sbmi_pre2fa'

export async function POST(req: NextRequest) {
  console.log('[POST /api/auth/login] Start login request');
  try {
    const body = await req.json()
    const { email, password, stayLoggedIn } = body

    if (!email || !password) {
      console.log('[POST /api/auth/login] Missing email or password');
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
    }

    console.log(`[POST /api/auth/login] Attempting login for: ${email}`);

    // Find user
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })
    
    if (!user) {
      console.log('[POST /api/auth/login] User not found');
      // Still do a dummy compare to prevent timing attacks
      const dummyHash = '$2a$12$dummy.hash.for.timing.attack.prevention.only'
      await bcrypt.compare(password, dummyHash)
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
    }

    console.log('[POST /api/auth/login] User found, comparing password');
    const passwordMatch = await bcrypt.compare(password, user.passwordHash)

    if (!passwordMatch) {
      console.log('[POST /api/auth/login] Password mismatch');
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
    }

    console.log('[POST /api/auth/login] Password match, generating 2FA code');
    const code = generateCode(6)
    
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          twoFactorCode: code,
          twoFactorCodeAt: new Date(),
        },
      })
      console.log('[POST /api/auth/login] 2FA code saved to DB');
    } catch (dbError) {
      console.error('[POST /api/auth/login] DB update error:', dbError);
      throw dbError;
    }

    // Send 2FA email (bypass if admin on dev branch)
    const isDev = process.env.NODE_ENV === 'development' || process.env.VERCEL_GIT_COMMIT_REF === 'dev';
    const isAdmin = user.role === 'ADMIN';

    if (!isAdmin || !isDev) {
      console.log('[POST /api/auth/login] Sending 2FA email');
      try {
        await send2FACodeEmail(user.email, code)
        console.log('[POST /api/auth/login] 2FA email sent');
      } catch (emailError) {
        console.error('[POST /api/auth/login] Email service error:', emailError);
        // If it's a member on dev, don't crash, just log. 
        if (!isDev) throw emailError;
      }
    } else {
      console.log(`[POST /api/auth/login] Bypassing 2FA email for admin ${user.email}. Code: ${code}`)
    }

    console.log('[POST /api/auth/login] Setting pre-2FA cookie');
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

    console.log('[POST /api/auth/login] Login request successful');
    return response
  } catch (error) {
    console.error('[POST /api/auth/login] Fatal error:', error)
    return NextResponse.json({ 
      error: 'An error occurred. Please try again.',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
