import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function AdminDashboard() {
  const user = await getSession()
  if (!user || user.role !== 'ADMIN') redirect('/login')

  const [
    totalMembers,
    overdueCount,
    pendingApplications,
    pendingAssistance,
    recentPayments,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'MEMBER', status: 'ACTIVE' } }),
    prisma.memberBalance.count({ where: { user: { role: 'MEMBER', status: 'ACTIVE' } } }).then(async () => {
      // Count members who are overdue
      const balances = await prisma.memberBalance.findMany({
        where: { user: { role: 'MEMBER', status: 'ACTIVE' } },
        include: { user: true },
      })
      const now = new Date()
      return balances.filter((b) => {
        if (!b.paidThroughDate) return true
        return b.paidThroughDate < now
      }).length
    }),
    prisma.application.count({ where: { status: 'PENDING' } }),
    prisma.assistanceRequest.count({ where: { status: 'PENDING' } }),
    prisma.payment.findMany({
      take: 10,
      orderBy: { paymentDate: 'desc' },
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
    }),
  ])

  return (
    <div>
      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Active Members', value: totalMembers, color: 'var(--color-green)', href: '/admin/members' },
          { label: 'Overdue Members', value: overdueCount, color: 'var(--color-red)', href: '/admin/members?filter=overdue' },
          { label: 'Pending Applications', value: pendingApplications, color: 'var(--color-gold)', href: '/admin/applications' },
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
            <div style={{ fontSize: 32, fontWeight: 800, color: stat.color, lineHeight: 1 }}>
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
        {/* Pending Applications */}
        <div style={{
          background: 'var(--color-white)',
          border: '1px solid var(--color-gray-200)',
          padding: '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-gray-900)' }}>
              Pending Applications
            </h3>
            <Link href="/admin/applications" style={{ fontSize: 13, color: 'var(--color-green)', fontWeight: 600, textDecoration: 'none' }}>
              View All →
            </Link>
          </div>
          {pendingApplications === 0 ? (
            <p style={{ fontSize: 14, color: 'var(--color-gray-400)' }}>No pending applications.</p>
          ) : (
            <div style={{
              padding: '12px 16px',
              background: 'var(--color-gold-light)',
              border: '1px solid var(--color-gold)',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="var(--color-gold)">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#7B5800' }}>
                  {pendingApplications} application{pendingApplications > 1 ? 's' : ''} awaiting review
                </div>
                <Link href="/admin/applications" style={{ fontSize: 13, color: '#7B5800', fontWeight: 500, textDecoration: 'underline' }}>
                  Review now
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Assistance Requests */}
        <div style={{
          background: 'var(--color-white)',
          border: '1px solid var(--color-gray-200)',
          padding: '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-gray-900)' }}>
              Assistance Requests
            </h3>
            <Link href="/admin/assistance" style={{ fontSize: 13, color: 'var(--color-green)', fontWeight: 600, textDecoration: 'none' }}>
              View All →
            </Link>
          </div>
          {pendingAssistance === 0 ? (
            <p style={{ fontSize: 14, color: 'var(--color-gray-400)' }}>No pending requests.</p>
          ) : (
            <div style={{
              padding: '12px 16px',
              background: 'var(--color-green-pale)',
              border: '1px solid var(--color-green)',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="var(--color-green)">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-green)' }}>
                  {pendingAssistance} request{pendingAssistance > 1 ? 's' : ''} pending
                </div>
                <Link href="/admin/assistance" style={{ fontSize: 13, color: 'var(--color-green)', fontWeight: 500, textDecoration: 'underline' }}>
                  Review now
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Payments */}
      <div style={{
        background: 'var(--color-white)',
        border: '1px solid var(--color-gray-200)',
      }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-gray-200)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-gray-900)' }}>Recent Payments</h3>
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
                  {p.paymentDate.toLocaleDateString('en-CA')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
