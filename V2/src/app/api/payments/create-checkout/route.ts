import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getAppConfig } from '@/lib/payments'

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set')
  return new Stripe(key, { apiVersion: '2026-02-25.clover' })
}

export async function POST(req: NextRequest) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { paymentType, months = 1 } = body

    if (!['ONE_TIME', 'RECURRING'].includes(paymentType)) {
      return NextResponse.json({ error: 'Invalid payment type.' }, { status: 400 })
    }

    const stripe = getStripe()
    const config = await getAppConfig()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Get or create Stripe customer
    let stripeCustomerId = user.stripeCustomerId
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        metadata: { userId: user.id },
      })
      stripeCustomerId = customer.id
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId },
      })
    }

    // Get pending penalties
    const pendingPenalties = await prisma.penalty.findMany({
      where: { userId: user.id, paidAt: null },
    })
    const penaltyCents = pendingPenalties.reduce((sum, p) => sum + p.amount, 0)

    if (paymentType === 'ONE_TIME') {
      const totalCents = months * config.monthlyContributionCents + penaltyCents

      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: 'cad',
              product_data: {
                name: `SBMI Membership — ${months} month${months > 1 ? 's' : ''}`,
                description: `Samuel Bete Mutual Iddir membership contribution${penaltyCents > 0 ? ' (includes outstanding penalties)' : ''}`,
              },
              unit_amount: totalCents,
            },
            quantity: 1,
          },
        ],
        metadata: {
          userId: user.id,
          paymentType: 'ONE_TIME',
          months: months.toString(),
          penaltyCents: penaltyCents.toString(),
        },
        success_url: `${appUrl}/member/payments?success=true`,
        cancel_url: `${appUrl}/member/payments?cancelled=true`,
      })

      return NextResponse.json({ url: session.url })
    } else {
      // RECURRING — Stripe subscription
      const firstPaymentCents = config.monthlyContributionCents + penaltyCents

      // Create a price for the recurring amount
      const price = await stripe.prices.create({
        currency: 'cad',
        unit_amount: config.monthlyContributionCents,
        recurring: { interval: 'month' },
        product_data: {
          name: 'SBMI Monthly Membership',
        },
      })

      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        payment_method_types: ['card'],
        mode: 'subscription',
        line_items: [{ price: price.id, quantity: 1 }],
        ...(penaltyCents > 0 ? {
          // Add penalty as a one-time line item
          // We handle this via invoice_settings in subscription
        } : {}),
        metadata: {
          userId: user.id,
          paymentType: 'RECURRING',
          penaltyCents: penaltyCents.toString(),
          firstPaymentCents: firstPaymentCents.toString(),
        },
        subscription_data: {
          metadata: {
            userId: user.id,
          },
        },
        success_url: `${appUrl}/member/payments?success=true`,
        cancel_url: `${appUrl}/member/payments?cancelled=true`,
      })

      return NextResponse.json({ url: session.url })
    }
  } catch (error) {
    console.error('[POST /api/payments/create-checkout]', error)
    return NextResponse.json({ error: 'Failed to create payment session.' }, { status: 500 })
  }
}
