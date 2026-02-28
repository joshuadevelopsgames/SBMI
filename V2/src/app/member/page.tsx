import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getPaymentSummary, formatCurrency, formatMST, type PaymentSummary } from '@/lib/payments'

// Demo data shown when sbmi_demo cookie is set
const DEMO_SUMMARY: PaymentSummary = {
  state: 'UP_TO_DATE',
  totalPastDueCents: 0,
  nextDueDate: new Date('2026-03-01'),
  nextMinAmountCents: 3000,
  paidThroughDate: new Date('2026-02-28'),
  lastPaymentDate: new Date('2026-02-01'),
  lastPaymentAmount: 3000,
  recurringActive: true,
  dateOverdue: null,
}

export default async function MemberDashboard() {
  const cookieStore = await cookies()
  const isDemo = cookieStore.get('sbmi_demo')?.value === '1'

  if (isDemo) {
    const user = { firstName: 'Demo', membershipStartDate: new Date('2023-01-15') }
    const familyCount = 2
    const summary = DEMO_SUMMARY
    return <DashboardView user={user} summary={summary} familyCount={familyCount} />
  }

  const user = await getSession()
  if (!user) redirect('/login')

  const [summary, familyCount] = await Promise.all([
    getPaymentSummary(user.id),
    prisma.familyMember.count({ where: { userId: user.id } }),
  ])

  return <DashboardView user={user} summary={summary} familyCount={familyCount} />
}

function DashboardView({
  user,
  summary,
  familyCount,
}: {
  user: { firstName: string; membershipStartDate?: Date | null }
  summary: PaymentSummary
  familyCount: number
}) {
  const memberSince = user.membershipStartDate
    ? formatMST(user.membershipStartDate)
    : 'N/A'

  const stateColors = {
    OVERDUE: { bg: 'var(--color-red-light)', border: 'var(--color-red)', text: 'var(--color-red)', badge: 'badge-overdue' },
    UP_TO_DATE: { bg: 'var(--color-green-pale)', border: 'var(--color-green)', text: 'var(--color-green)', badge: 'badge-current' },
    PAID_AHEAD: { bg: 'var(--color-gold-light)', border: 'var(--color-gold)', text: '#7B5800', badge: 'badge-ahead' },
  }

  const colors = stateColors[summary.state]

  return (
    <div>
      {/* Welcome banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1B5E20, #2E7D32)',
        color: 'white',
        padding: '28px 32px',
        marginBottom: 32,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: 0, top: 0, bottom: 0, width: '30%',
          background: 'rgba(255,255,255,0.03)',
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.02) 10px, rgba(255,255,255,0.02) 20px)',
        }} />
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 700, marginBottom: 6 }}>
          Welcome back, {user.firstName}
        </h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', margin: 0 }}>
          Member since {memberSince} &nbsp;·&nbsp; {familyCount} family member{familyCount !== 1 ? 's' : ''} registered
        </p>
      </div>

      {/* Payment Status Card */}
      <div style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        padding: '24px 28px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span className={colors.badge}>
              {summary.state === 'OVERDUE' ? 'Overdue' : summary.state === 'UP_TO_DATE' ? 'Up to Date' : 'Paid Ahead'}
            </span>
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: colors.text, marginBottom: 4 }}>
            {summary.state === 'OVERDUE'
              ? `Payment Overdue — ${formatCurrency(summary.totalPastDueCents)} due`
              : summary.state === 'UP_TO_DATE'
              ? 'Membership is current'
              : `Paid through ${summary.paidThroughDate ? formatMST(summary.paidThroughDate) : 'N/A'}`}
          </h3>
          {summary.state === 'OVERDUE' && summary.dateOverdue && (
            <p style={{ fontSize: 14, color: colors.text, margin: 0 }}>
              Overdue since {formatMST(summary.dateOverdue)}
            </p>
          )}
          {summary.state !== 'OVERDUE' && (
            <p style={{ fontSize: 14, color: colors.text, margin: 0 }}>
              Next payment due: {formatMST(summary.nextDueDate)} &nbsp;·&nbsp; {formatCurrency(summary.nextMinAmountCents)}
            </p>
          )}
          {summary.recurringActive && (
            <p style={{ fontSize: 13, color: colors.text, marginTop: 4, margin: 0 }}>
              ✓ Recurring payment active
            </p>
          )}
        </div>
        <Link href="/member/payments" className="btn-primary btn-sm">
          {summary.state === 'OVERDUE' ? 'Pay Now' : 'View Payments'}
        </Link>
      </div>

      {/* Quick Action Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          {
            href: '/member/payments',
            title: 'Payments',
            description: 'View history, make a payment, or set up recurring contributions.',
            icon: (
              <svg viewBox="0 0 24 24" width="24" height="24" fill="var(--color-green)">
                <path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
              </svg>
            ),
          },
          {
            href: '/member/family',
            title: 'Family Members',
            description: `You have ${familyCount} family member${familyCount !== 1 ? 's' : ''} registered. Add or manage them here.`,
            icon: (
              <svg viewBox="0 0 24 24" width="24" height="24" fill="var(--color-green)">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
              </svg>
            ),
          },
          {
            href: '/member/bylaws',
            title: 'Bylaws',
            description: 'Download the SBMI bylaws document to understand your rights and responsibilities.',
            icon: (
              <svg viewBox="0 0 24 24" width="24" height="24" fill="var(--color-green)">
                <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
              </svg>
            ),
          },
          {
            href: '/member/assistance',
            title: 'Request Assistance',
            description: 'Submit a bereavement assistance request for yourself or a family member.',
            icon: (
              <svg viewBox="0 0 24 24" width="24" height="24" fill="var(--color-green)">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
              </svg>
            ),
          },
        ].map((card) => (
          <Link
            key={card.href}
            href={card.href}
            style={{
              background: 'var(--color-white)',
              border: '1px solid var(--color-gray-200)',
              padding: '24px',
              textDecoration: 'none',
              display: 'block',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
            }}
          >
            <div style={{ marginBottom: 12 }}>{card.icon}</div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 6 }}>
              {card.title}
            </h3>
            <p style={{ fontSize: 13, color: 'var(--color-gray-500)', lineHeight: 1.6, margin: 0 }}>
              {card.description}
            </p>
          </Link>
        ))}
      </div>

      {/* Last payment info */}
      {summary.lastPaymentDate && (
        <div style={{
          background: 'var(--color-white)',
          border: '1px solid var(--color-gray-200)',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}>
          <div style={{
            width: 40, height: 40,
            background: 'var(--color-green-pale)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="var(--color-green)">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-gray-900)' }}>
              Last Payment: {formatCurrency(summary.lastPaymentAmount!)}
            </div>
            <div style={{ fontSize: 13, color: 'var(--color-gray-500)' }}>
              {formatMST(summary.lastPaymentDate)}
            </div>
          </div>
          <Link href="/member/payments" style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--color-green)', fontWeight: 600, textDecoration: 'none' }}>
            View History →
          </Link>
        </div>
      )}
    </div>
  )
}
