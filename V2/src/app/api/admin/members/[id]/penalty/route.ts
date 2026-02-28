import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  try {
    const body = await req.json()
    const { amountDollars, reason } = body

    if (!amountDollars || isNaN(Number(amountDollars)) || Number(amountDollars) <= 0) {
      return NextResponse.json({ error: 'Invalid amount.' }, { status: 400 })
    }
    if (!reason?.trim()) {
      return NextResponse.json({ error: 'Reason is required.' }, { status: 400 })
    }

    const member = await prisma.user.findUnique({ where: { id } })
    if (!member) return NextResponse.json({ error: 'Member not found.' }, { status: 404 })

    const amountCents = Math.round(Number(amountDollars) * 100)

    await prisma.penalty.create({
      data: {
        userId: id,
        amount: amountCents,
        reason: reason.trim(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[POST /api/admin/members/:id/penalty]', error)
    return NextResponse.json({ error: 'An error occurred.' }, { status: 500 })
  }
}
