import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { updateMemberBalance, applyPenalty, getAppConfig } from '@/lib/payments'
import { sendPaymentDeclinedEmail } from '@/lib/email'

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set')
  return new Stripe(key, { apiVersion: '2026-02-25.clover' })
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret || !sig) {
    return NextResponse.json({ error: 'Webhook secret not configured.' }, { status: 400 })
  }

  const stripe = getStripe()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error('[Webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        if (!userId) break

        const amountCents = session.amount_total || 0
        const paymentType = session.metadata?.paymentType as 'ONE_TIME' | 'RECURRING'

        // Record payment
        await prisma.payment.create({
          data: {
            userId,
            amount: amountCents,
            status: 'SUCCEEDED',
            paymentType: paymentType || 'ONE_TIME',
            stripePaymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : undefined,
            stripeSubscriptionId: typeof session.subscription === 'string' ? session.subscription : undefined,
          },
        })

        // Update balance
        await updateMemberBalance(userId, amountCents)

        // If recurring, update member balance record
        if (paymentType === 'RECURRING' && typeof session.subscription === 'string') {
          await prisma.memberBalance.upsert({
            where: { userId },
            create: {
              userId,
              recurringActive: true,
              stripeSubscriptionId: session.subscription,
            },
            update: {
              recurringActive: true,
              stripeSubscriptionId: session.subscription,
            },
          })
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        // In Stripe API 2026+, subscription is accessed via parent.subscription_details
        const subscriptionId = (invoice as unknown as { subscription?: string | null }).subscription
        if (!subscriptionId) break

        // Find user by subscription ID
        const balance = await prisma.memberBalance.findFirst({
          where: { stripeSubscriptionId: subscriptionId },
        })
        if (!balance) break

        const amountCents = invoice.amount_paid
        await prisma.payment.create({
          data: {
            userId: balance.userId,
            amount: amountCents,
            status: 'SUCCEEDED',
            paymentType: 'RECURRING',
            stripeSubscriptionId: subscriptionId,
            receiptUrl: invoice.hosted_invoice_url || null,
          },
        })

        await updateMemberBalance(balance.userId, amountCents)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = (invoice as unknown as { subscription?: string | null }).subscription
        if (!subscriptionId) break

        const balance = await prisma.memberBalance.findFirst({
          where: { stripeSubscriptionId: subscriptionId },
        })
        if (!balance) break

        const user = await prisma.user.findUnique({ where: { id: balance.userId } })
        if (!user) break

        // Record failed payment
        await prisma.payment.create({
          data: {
            userId: balance.userId,
            amount: invoice.amount_due,
            status: 'DECLINED',
            paymentType: 'RECURRING',
          },
        })

        // Cancel subscription
        await stripe.subscriptions.cancel(subscriptionId)

        // Update balance
        await prisma.memberBalance.update({
          where: { userId: balance.userId },
          data: { recurringActive: false, stripeSubscriptionId: null },
        })

        // Apply penalty
        await applyPenalty(balance.userId)

        // Send notification email
        const config = await getAppConfig()
        await sendPaymentDeclinedEmail(
          user.email,
          `${user.firstName} ${user.lastName}`,
          `$${(config.penaltyAmountCents / 100).toFixed(2)}`
        )
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const balance = await prisma.memberBalance.findFirst({
          where: { stripeSubscriptionId: subscription.id },
        })
        if (balance) {
          await prisma.memberBalance.update({
            where: { userId: balance.userId },
            data: { recurringActive: false, stripeSubscriptionId: null },
          })
        }
        break
      }
    }
  } catch (error) {
    console.error('[Webhook] Error processing event:', event.type, error)
    return NextResponse.json({ error: 'Webhook processing failed.' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
