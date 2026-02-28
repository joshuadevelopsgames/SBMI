import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getPaymentSummary, getAppConfig, formatCurrency, formatMST } from '@/lib/payments'
import PaymentsClient from './PaymentsClient'

export default async function PaymentsPage() {
  const user = await getSession()
  if (!user) redirect('/login')

  const [summary, config, payments] = await Promise.all([
    getPaymentSummary(user.id),
    getAppConfig(),
    prisma.payment.findMany({
      where: { userId: user.id },
      orderBy: { paymentDate: 'desc' },
      take: 50,
    }),
  ])

  const pendingPenalties = await prisma.penalty.findMany({
    where: { userId: user.id, paidAt: null },
  })
  const totalPenaltyCents = pendingPenalties.reduce((sum, p) => sum + p.amount, 0)

  return (
    <PaymentsClient
      summary={{
        state: summary.state,
        paidThroughDate: summary.paidThroughDate?.toISOString() || null,
        nextDueDate: summary.nextDueDate.toISOString(),
        nextMinAmountCents: summary.nextMinAmountCents,
        lastPaymentAmount: summary.lastPaymentAmount,
        lastPaymentDate: summary.lastPaymentDate?.toISOString() || null,
        totalPastDueCents: summary.totalPastDueCents,
        dateOverdue: summary.dateOverdue?.toISOString() || null,
        recurringActive: summary.recurringActive,
      }}
      config={{
        monthlyContributionCents: config.monthlyContributionCents,
        penaltyAmountCents: config.penaltyAmountCents,
      }}
      pendingPenaltyCents={totalPenaltyCents}
      payments={payments.map((p) => ({
        id: p.id,
        amount: p.amount,
        paymentDate: p.paymentDate.toISOString(),
        status: p.status,
        paymentType: p.paymentType,
        receiptUrl: p.receiptUrl || null,
      }))}
    />
  )
}
