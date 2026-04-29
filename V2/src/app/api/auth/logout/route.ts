import { NextRequest, NextResponse } from 'next/server'
import { destroySession } from '@/lib/auth'

const SESSION_COOKIE = 'sbmi_session'

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value
  if (token) {
    await destroySession(token)
  }

  const response = NextResponse.redirect(new URL('/login?message=logged-out', req.url))
  response.cookies.set(SESSION_COOKIE, '', { maxAge: 0, path: '/' })
  return response
}
