import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Demo admin mode: sets a special cookie that bypasses real auth.
// The admin layout checks for this cookie and serves a fully mocked admin experience.

export async function POST() {
  const cookieStore = await cookies()

  cookieStore.set('sbmi_demo_admin', '1', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 2, // 2 hours
  })

  return NextResponse.json({ ok: true })
}
