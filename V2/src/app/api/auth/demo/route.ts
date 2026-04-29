import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Demo mode: sets a special demo cookie that bypasses real auth.
// The member layout and server components check for this cookie
// and serve a fully mocked member experience without touching the DB.

export async function POST() {
  const cookieStore = await cookies()

  cookieStore.set('sbmi_demo', '1', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 2, // 2 hours
  })

  return NextResponse.json({ ok: true })
}
