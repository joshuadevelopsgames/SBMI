import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { destroyAllUserSessions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) {
    return NextResponse.redirect(new URL('/login?message=invalid-token', req.url))
  }

  try {
    const user = await prisma.user.findUnique({ where: { emailChangeToken: token } })

    if (!user || !user.emailChangePending || !user.emailChangeAt) {
      return NextResponse.redirect(new URL('/login?message=invalid-token', req.url))
    }

    // Check expiry (24 hours)
    const expiryTime = new Date(user.emailChangeAt.getTime() + 24 * 60 * 60 * 1000)
    if (new Date() > expiryTime) {
      return NextResponse.redirect(new URL('/login?message=token-expired', req.url))
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        email: user.emailChangePending,
        emailChangeToken: null,
        emailChangePending: null,
        emailChangeAt: null,
      },
    })

    // Force re-login with new email
    await destroyAllUserSessions(user.id)

    return NextResponse.redirect(new URL('/login?message=email-changed', req.url))
  } catch (error) {
    console.error('[GET /api/profile/approve-email-change]', error)
    return NextResponse.redirect(new URL('/login', req.url))
  }
}
