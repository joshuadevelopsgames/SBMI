import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; q?: string }>
}) {
  const user = await getSession()
  if (!user || user.role !== 'ADMIN') redirect('/login')

  const { filter, q } = await searchParams

  const members = await prisma.user.findMany({
    where: {
      role: 'MEMBER',
      ...(q ? {
        OR: [
          { firstName: { contains: q, mode: 'insensitive' } },
          { lastName: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ],
      } : {}),
    },
    include: {
      memberBalance: true,
      familyMembers: true,
      payments: { take: 1, orderBy: { paymentDate: 'desc' } },
    },
    orderBy: { lastName: 'asc' },
  })

  const now = new Date()
  const membersWithStatus = members.map((m) => {
    const balance = m.memberBalance
    const isOverdue = !balance?.paidThroughDate || balance.paidThroughDate < now
    return {
      id: m.id,
      firstName: m.firstName,
      lastName: m.lastName,
      email: m.email,
      status: m.status,
      membershipStartDate: m.membershipStartDate?.toISOString() || null,
      isOverdue,
      recurringActive: balance?.recurringActive || false,
      paidThroughDate: balance?.paidThroughDate?.toISOString() || null,
      familyCount: m.familyMembers.length,
      lastPayment: m.payments[0]?.paymentDate?.toISOString() || null,
    }
  })

  const filtered = filter === 'overdue'
    ? membersWithStatus.filter((m) => m.isOverdue)
    : membersWithStatus

  return (
    <div>
      {/* Search and filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <form style={{ flex: 1, minWidth: 200 }}>
          <input
            type="text"
            name="q"
            defaultValue={q || ''}
            placeholder="Search by name or email..."
            className="form-input"
            style={{ maxWidth: 320 }}
          />
        </form>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link
            href="/admin/members"
            className={`btn-sm ${!filter ? 'btn-primary' : 'btn-secondary'}`}
          >
            All ({membersWithStatus.length})
          </Link>
          <Link
            href="/admin/members?filter=overdue"
            className={`btn-sm ${filter === 'overdue' ? 'btn-primary' : 'btn-secondary'}`}
            style={filter === 'overdue' ? { background: 'var(--color-red)', borderColor: 'var(--color-red)' } : {}}
          >
            Overdue ({membersWithStatus.filter((m) => m.isOverdue).length})
          </Link>
        </div>
      </div>

      {/* Members table */}
      <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-gray-200)' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Status</th>
              <th>Paid Through</th>
              <th>Family</th>
              <th>Last Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: 'var(--color-gray-400)', padding: '32px' }}>
                  No members found.
                </td>
              </tr>
            ) : filtered.map((m) => (
              <tr key={m.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{m.firstName} {m.lastName}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-gray-400)' }}>{m.email}</div>
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span className={m.isOverdue ? 'badge-overdue' : 'badge-current'}>
                      {m.isOverdue ? 'Overdue' : 'Current'}
                    </span>
                    {m.recurringActive && (
                      <span className="badge-ahead">Recurring</span>
                    )}
                  </div>
                </td>
                <td style={{ fontSize: 13, color: 'var(--color-gray-600)' }}>
                  {m.paidThroughDate
                    ? new Date(m.paidThroughDate).toLocaleDateString('en-CA')
                    : '—'}
                </td>
                <td style={{ fontSize: 13, color: 'var(--color-gray-600)' }}>
                  {m.familyCount} member{m.familyCount !== 1 ? 's' : ''}
                </td>
                <td style={{ fontSize: 13, color: 'var(--color-gray-600)' }}>
                  {m.lastPayment
                    ? new Date(m.lastPayment).toLocaleDateString('en-CA')
                    : 'Never'}
                </td>
                <td>
                  <Link
                    href={`/admin/members/${m.id}`}
                    style={{ fontSize: 13, color: 'var(--color-green)', fontWeight: 600, textDecoration: 'none' }}
                  >
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
