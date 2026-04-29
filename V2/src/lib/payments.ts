import { prisma } from './prisma'

// MST = UTC-7 (Mountain Standard Time, fixed offset)
export function toMST(date: Date): Date {
  const mstOffset = -7 * 60 // minutes
  const utc = date.getTime() + date.getTimezoneOffset() * 60000
  return new Date(utc + mstOffset * 60000)
}

export function formatMST(date: Date): string {
  const mst = toMST(date)
  return mst.toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

export async function getAppConfig() {
  let config = await prisma.appConfig.findFirst()
  if (!config) {
    config = await prisma.appConfig.create({
      data: {
        monthlyContributionCents: parseInt(process.env.MONTHLY_CONTRIBUTION_CENTS || '2000'),
        penaltyAmountCents: parseInt(process.env.PENALTY_AMOUNT_CENTS || '500'),
        bylawsPdfUrl: '/sbmi-bylaws.pdf',
        adminEmail: process.env.ADMIN_EMAIL || 'admin@sbmi.ca',
      },
    })
  }
  return config
}

export type PaymentSummaryState = 'OVERDUE' | 'UP_TO_DATE' | 'PAID_AHEAD'

export interface PaymentSummary {
  state: PaymentSummaryState
  paidThroughDate: Date | null
  nextDueDate: Date
  nextMinAmountCents: number
  lastPaymentAmount: number | null
  lastPaymentDate: Date | null
  totalPastDueCents: number
  dateOverdue: Date | null
  recurringActive: boolean
}

export async function getPaymentSummary(userId: string): Promise<PaymentSummary> {
  const config = await getAppConfig()
  const now = toMST(new Date())
  const firstOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const firstOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  const balance = await prisma.memberBalance.findUnique({ where: { userId } })
  const lastPayment = await prisma.payment.findFirst({
    where: { userId, status: 'SUCCEEDED' },
    orderBy: { paymentDate: 'desc' },
  })

  const pendingPenalties = await prisma.penalty.findMany({
    where: { userId, paidAt: null },
  })
  const totalPenaltyCents = pendingPenalties.reduce((sum, p) => sum + p.amount, 0)

  const paidThroughDate = balance?.paidThroughDate || null
  const recurringActive = balance?.recurringActive || false

  let state: PaymentSummaryState
  let nextDueDate: Date
  let nextMinAmountCents: number
  let dateOverdue: Date | null = null
  let totalPastDueCents = 0

  if (!paidThroughDate || paidThroughDate < firstOfCurrentMonth) {
    // Overdue
    state = 'OVERDUE'
    nextDueDate = firstOfCurrentMonth
    dateOverdue = paidThroughDate
      ? new Date(paidThroughDate.getFullYear(), paidThroughDate.getMonth() + 1, 1)
      : firstOfCurrentMonth
    totalPastDueCents = config.monthlyContributionCents + totalPenaltyCents
    nextMinAmountCents = totalPastDueCents
  } else if (paidThroughDate >= firstOfCurrentMonth && paidThroughDate < firstOfNextMonth) {
    // Up to date (current month)
    state = 'UP_TO_DATE'
    nextDueDate = firstOfNextMonth
    nextMinAmountCents = config.monthlyContributionCents + totalPenaltyCents
  } else {
    // Paid ahead
    state = 'PAID_AHEAD'
    nextDueDate = new Date(paidThroughDate.getFullYear(), paidThroughDate.getMonth() + 1, 1)
    nextMinAmountCents = config.monthlyContributionCents + totalPenaltyCents
  }

  return {
    state,
    paidThroughDate,
    nextDueDate,
    nextMinAmountCents,
    lastPaymentAmount: lastPayment?.amount || null,
    lastPaymentDate: lastPayment?.paymentDate || null,
    totalPastDueCents,
    dateOverdue,
    recurringActive,
  }
}

export async function applyPenalty(userId: string): Promise<void> {
  const config = await getAppConfig()
  await prisma.penalty.create({
    data: {
      userId,
      amount: config.penaltyAmountCents,
      reason: 'Non-payment',
    },
  })
}

export async function updateMemberBalance(
  userId: string,
  amountPaidCents: number
): Promise<void> {
  const config = await getAppConfig()
  const now = toMST(new Date())

  let balance = await prisma.memberBalance.findUnique({ where: { userId } })

  // Pay off any pending penalties first
  const pendingPenalties = await prisma.penalty.findMany({
    where: { userId, paidAt: null },
    orderBy: { createdAt: 'asc' },
  })

  let remaining = amountPaidCents
  for (const penalty of pendingPenalties) {
    if (remaining >= penalty.amount) {
      remaining -= penalty.amount
      await prisma.penalty.update({
        where: { id: penalty.id },
        data: { paidAt: new Date() },
      })
    }
  }

  // Calculate how many months the remaining covers
  const monthsCovered = Math.floor(remaining / config.monthlyContributionCents)
  const creditCents = remaining % config.monthlyContributionCents

  const currentPaidThrough = balance?.paidThroughDate
  const startFrom =
    currentPaidThrough && currentPaidThrough >= new Date(now.getFullYear(), now.getMonth(), 1)
      ? currentPaidThrough
      : new Date(now.getFullYear(), now.getMonth() - 1, 31) // end of last month

  const newPaidThrough = new Date(
    startFrom.getFullYear(),
    startFrom.getMonth() + monthsCovered + 1,
    0 // last day of that month
  )

  if (balance) {
    await prisma.memberBalance.update({
      where: { userId },
      data: {
        paidThroughDate: newPaidThrough,
        creditCents: (balance.creditCents || 0) + creditCents,
      },
    })
  } else {
    await prisma.memberBalance.create({
      data: {
        userId,
        paidThroughDate: newPaidThrough,
        creditCents,
        recurringActive: false,
      },
    })
  }
}
