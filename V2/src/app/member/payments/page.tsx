import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getPaymentSummary, getAppConfig } from '@/lib/payments'
import PaymentsClient from './PaymentsClient'

export default async function PaymentsPage() {
  const cookieStore = await cookies()
  const isDemo = cookieStore.get('sbmi_demo')?.value === '1'

  if (isDemo) {
    const now = new Date()
    const nextDue = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    const lastPayDate = new Date(now.getFullYear(), now.getMonth() - 1, 28)
    return (
      <PaymentsClient
        summary={{
          state: 'UP_TO_DATE',
          paidThroughDate: now.toISOString(),
          nextDueDate: nextDue.toISOString(),
          nextMinAmountCents: 3000,
          lastPaymentAmount: 3000,
          lastPaymentDate: lastPayDate.toISOString(),
          totalPastDueCents: 0,
          dateOverdue: null,
          recurringActive: true,
        }}
        config={{ monthlyContributionCents: 3000, penaltyAmountCents: 1500 }}
        pendingPenaltyCents={0}
        payments={[
          { id: 'demo-p1', amount: 3000, paymentDate: lastPayDate.toISOString(), status: 'SUCCEEDED', paymentType: 'RECURRING', receiptUrl: null },
          { id: 'demo-p2', amount: 3000, paymentDate: new Date(now.getFullYear(), now.getMonth() - 2, 28).toISOString(), status: 'SUCCEEDED', paymentType: 'RECURRING', receiptUrl: null },
          { id: 'demo-p3', amount: 3000, paymentDate: new Date(now.getFullYear(), now.getMonth() - 3, 28).toISOString(), status: 'SUCCEEDED', paymentType: 'ONE_TIME', receiptUrl: null },
        ]}
      />
    )
  }

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
