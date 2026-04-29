import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { updateMemberBalance } from '@/lib/payments'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  try {
    const body = await req.json()
    const { amountDollars } = body

    if (!amountDollars || isNaN(Number(amountDollars)) || Number(amountDollars) <= 0) {
      return NextResponse.json({ error: 'Invalid amount.' }, { status: 400 })
    }

    const member = await prisma.user.findUnique({ where: { id } })
    if (!member) return NextResponse.json({ error: 'Member not found.' }, { status: 404 })

    const amountCents = Math.round(Number(amountDollars) * 100)

    await prisma.payment.create({
      data: {
        userId: id,
        amount: amountCents,
        status: 'SUCCEEDED',
        paymentType: 'ONE_TIME',
        notes: `Manual payment recorded by admin ${user.firstName} ${user.lastName}`,
      },
    })

    await updateMemberBalance(id, amountCents)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[POST /api/admin/members/:id/manual-payment]', error)
    return NextResponse.json({ error: 'An error occurred.' }, { status: 500 })
  }
}
