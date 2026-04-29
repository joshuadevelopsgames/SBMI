import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateCode } from '@/lib/auth'
import { send2FACodeEmail } from '@/lib/email'

const PRE_2FA_COOKIE = 'sbmi_pre2fa'

export async function POST(req: NextRequest) {
  try {
    const pre2faCookie = req.cookies.get(PRE_2FA_COOKIE)?.value
    if (!pre2faCookie) {
      return NextResponse.json({ error: 'Session expired.' }, { status: 401 })
    }

    let userId: string
    try {
      const decoded = JSON.parse(Buffer.from(pre2faCookie, 'base64').toString('utf8'))
      userId = decoded.userId
    } catch {
      return NextResponse.json({ error: 'Session expired.' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 })
    }

    const code = generateCode(6)
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorCode: code, twoFactorCodeAt: new Date() },
    })

    await send2FACodeEmail(user.email, code)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[POST /api/auth/2fa/resend]', error)
    return NextResponse.json({ error: 'An error occurred.' }, { status: 500 })
  }
}
