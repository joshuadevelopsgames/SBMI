import { redirect } from 'next/navigation'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const DEMO_STATS = {
  totalMembers: 47,
  overdueCount: 5,
  pendingApplications: 3,
  pendingAssistance: 2,
  recentPayments: [
    { id: '1', user: { firstName: 'Abebe', lastName: 'Girma', email: 'abebe@example.com' }, amount: 2000, paymentType: 'RECURRING', status: 'SUCCEEDED', paymentDate: new Date('2026-02-28') },
    { id: '2', user: { firstName: 'Tigist', lastName: 'Bekele', email: 'tigist@example.com' }, amount: 2000, paymentType: 'ONE_TIME', status: 'SUCCEEDED', paymentDate: new Date('2026-02-27') },
    { id: '3', user: { firstName: 'Dawit', lastName: 'Haile', email: 'dawit@example.com' }, amount: 2000, paymentType: 'RECURRING', status: 'SUCCEEDED', paymentDate: new Date('2026-02-26') },
    { id: '4', user: { firstName: 'Selamawit', lastName: 'Tesfaye', email: 'selam@example.com' }, amount: 2000, paymentType: 'RECURRING', status: 'FAILED', paymentDate: new Date('2026-02-25') },
    { id: '5', user: { firstName: 'Yonas', lastName: 'Alemu', email: 'yonas@example.com' }, amount: 2000, paymentType: 'ONE_TIME', status: 'SUCCEEDED', paymentDate: new Date('2026-02-24') },
  ],
}

export default async function AdminDashboard() {
  const cookieStore = await cookies()
  const isDemoAdmin = cookieStore.get('sbmi_demo_admin')?.value === '1'

  let stats = DEMO_STATS

  if (!isDemoAdmin) {
    const user = await getSession()
    if (!user || user.role !== 'ADMIN') redirect('/login')

    try {
      const [totalMembers, pendingApplications, pendingAssistance, recentPayments] = await Promise.all([
        prisma.user.count({ where: { role: 'MEMBER', status: 'ACTIVE' } }),
        prisma.application.count({ where: { status: 'PENDING' } }),
        prisma.assistanceRequest.count({ where: { status: 'PENDING' } }),
        prisma.payment.findMany({
          take: 10,
          orderBy: { paymentDate: 'desc' },
          include: { user: { select: { firstName: true, lastName: true, email: true } } },
        }),
      ])

      const balances = await prisma.memberBalance.findMany({
        where: { user: { role: 'MEMBER', status: 'ACTIVE' } },
      })
      const now = new Date()
      const overdueCount = balances.filter((b) => !b.paidThroughDate || b.paidThroughDate < now).length

      stats = { totalMembers, overdueCount, pendingApplications, pendingAssistance, recentPayments }
    } catch {
      // DB unavailable — fall through with demo stats
    }
  }

  const { totalMembers, overdueCount, pendingApplications, pendingAssistance, recentPayments } = stats

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 24 }}>
        Executive Committee Dashboard
      </h1>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Active Members', value: totalMembers, color: 'var(--color-green)', href: '/admin/members' },
          { label: 'Overdue Members', value: overdueCount, color: 'var(--color-red)', href: '/admin/members?filter=overdue' },
          { label: 'Pending Applications', value: pendingApplications, color: '#B45309', href: '/admin/applications' },
          { label: 'Assistance Requests', value: pendingAssistance, color: '#7B5800', href: '/admin/assistance' },
        ].map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            style={{
              background: 'var(--color-white)',
              border: '1px solid var(--color-gray-200)',
              padding: '24px',
              textDecoration: 'none',
              display: 'block',
            }}
          >
            <div style={{ fontSize: 36, fontWeight: 800, color: stat.color, lineHeight: 1 }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 13, color: 'var(--color-gray-500)', marginTop: 6, fontWeight: 500 }}>
              {stat.label}
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-gray-200)', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-gray-900)' }}>Pending Applications</h3>
            <Link href="/admin/applications" style={{ fontSize: 13, color: 'var(--color-green)', fontWeight: 600, textDecoration: 'none' }}>View All →</Link>
          </div>
          {pendingApplications === 0 ? (
            <p style={{ fontSize: 14, color: 'var(--color-gray-400)' }}>No pending applications.</p>
          ) : (
            <div style={{ padding: '12px 16px', background: '#FFF8E1', border: '1px solid #F9A825', display: 'flex', alignItems: 'center', gap: 12 }}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#F9A825"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#7B5800' }}>{pendingApplications} application{pendingApplications > 1 ? 's' : ''} awaiting review</div>
                <Link href="/admin/applications" style={{ fontSize: 13, color: '#7B5800', fontWeight: 500, textDecoration: 'underline' }}>Review now</Link>
              </div>
            </div>
          )}
        </div>

        <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-gray-200)', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-gray-900)' }}>Governance Notifications</h3>
            <Link href="/admin/notifications" style={{ fontSize: 13, color: 'var(--color-green)', fontWeight: 600, textDecoration: 'none' }}>View All →</Link>
          </div>
          <div style={{ padding: '12px 16px', background: '#FFF3E0', border: '1px solid #FF9800', display: 'flex', alignItems: 'center', gap: 12 }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="#FF9800"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#E65100' }}>2 items require your vote</div>
              <Link href="/admin/notifications" style={{ fontSize: 13, color: '#E65100', fontWeight: 500, textDecoration: 'underline' }}>Review now</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Payments */}
      <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-gray-200)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-gray-200)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-gray-900)' }}>Recent Payments</h3>
          <Link href="/admin/reports" style={{ fontSize: 13, color: 'var(--color-green)', fontWeight: 600, textDecoration: 'none' }}>Full Report →</Link>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {recentPayments.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--color-gray-400)', padding: '24px' }}>
                  No payments recorded yet.
                </td>
              </tr>
            ) : recentPayments.map((p) => (
              <tr key={p.id}>
                <td>
                  <div style={{ fontWeight: 500 }}>{p.user.firstName} {p.user.lastName}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-gray-400)' }}>{p.user.email}</div>
                </td>
                <td style={{ fontWeight: 600 }}>${(p.amount / 100).toFixed(2)}</td>
                <td style={{ fontSize: 12, color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {p.paymentType === 'ONE_TIME' ? 'One-Time' : 'Recurring'}
                </td>
                <td>
                  <span className={
                    p.status === 'SUCCEEDED' ? 'badge-current' :
                    p.status === 'FAILED' || p.status === 'DECLINED' ? 'badge-overdue' :
                    'badge-ahead'
                  }>
                    {p.status.charAt(0) + p.status.slice(1).toLowerCase()}
                  </span>
                </td>
                <td style={{ fontSize: 13, color: 'var(--color-gray-500)' }}>
                  {new Date(p.paymentDate).toLocaleDateString('en-CA')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
