import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest) {
  const user = await getSession()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { monthlyContributionCents, penaltyAmountCents, bylawsPdfUrl, adminEmail, welcomeMessage } = body

    if (!monthlyContributionCents || monthlyContributionCents <= 0) {
      return NextResponse.json({ error: 'Invalid monthly contribution amount.' }, { status: 400 })
    }
    if (!penaltyAmountCents || penaltyAmountCents <= 0) {
      return NextResponse.json({ error: 'Invalid penalty amount.' }, { status: 400 })
    }
    if (!bylawsPdfUrl?.trim()) {
      return NextResponse.json({ error: 'Bylaws PDF URL is required.' }, { status: 400 })
    }
    if (!adminEmail?.trim()) {
      return NextResponse.json({ error: 'Admin email is required.' }, { status: 400 })
    }

    // Upsert config (single row)
    await prisma.appConfig.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        monthlyContributionCents,
        penaltyAmountCents,
        bylawsPdfUrl: bylawsPdfUrl.trim(),
        adminEmail: adminEmail.trim().toLowerCase(),
        welcomeMessage: welcomeMessage?.trim() || null,
      },
      update: {
        monthlyContributionCents,
        penaltyAmountCents,
        bylawsPdfUrl: bylawsPdfUrl.trim(),
        adminEmail: adminEmail.trim().toLowerCase(),
        welcomeMessage: welcomeMessage?.trim() || null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[PATCH /api/admin/config]', error)
    return NextResponse.json({ error: 'An error occurred.' }, { status: 500 })
  }
}
