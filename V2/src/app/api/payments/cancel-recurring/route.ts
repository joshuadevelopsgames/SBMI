import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set')
  return new Stripe(key, { apiVersion: '2026-02-25.clover' })
}

export async function POST(req: NextRequest) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const balance = await prisma.memberBalance.findUnique({ where: { userId: user.id } })
    if (!balance?.stripeSubscriptionId) {
      return NextResponse.json({ error: 'No active recurring payment found.' }, { status: 400 })
    }

    const stripe = getStripe()
    await stripe.subscriptions.cancel(balance.stripeSubscriptionId)

    await prisma.memberBalance.update({
      where: { userId: user.id },
      data: { recurringActive: false, stripeSubscriptionId: null },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[POST /api/payments/cancel-recurring]', error)
    return NextResponse.json({ error: 'Failed to cancel recurring payment.' }, { status: 500 })
  }
}
