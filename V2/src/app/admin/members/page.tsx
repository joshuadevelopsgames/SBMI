import { redirect } from 'next/navigation'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type MemberRow = {
  id: string; firstName: string; lastName: string; email: string; status: string;
  membershipStartDate: string | null; isOverdue: boolean; recurringActive: boolean;
  paidThroughDate: string | null; familyCount: number; lastPayment: string | null;
}

const DEMO_MEMBERS: MemberRow[] = [
  { id: 'd1', firstName: 'Abebe', lastName: 'Girma', email: 'abebe@example.com', status: 'ACTIVE', membershipStartDate: '2022-01-15', isOverdue: false, recurringActive: true, paidThroughDate: '2026-03-31', familyCount: 3, lastPayment: '2026-02-28' },
  { id: 'd2', firstName: 'Tigist', lastName: 'Bekele', email: 'tigist@example.com', status: 'ACTIVE', membershipStartDate: '2021-06-01', isOverdue: false, recurringActive: false, paidThroughDate: '2026-02-28', familyCount: 1, lastPayment: '2026-02-27' },
  { id: 'd3', firstName: 'Dawit', lastName: 'Haile', email: 'dawit@example.com', status: 'ACTIVE', membershipStartDate: '2023-03-10', isOverdue: true, recurringActive: false, paidThroughDate: '2026-01-31', familyCount: 2, lastPayment: '2026-01-30' },
  { id: 'd4', firstName: 'Selamawit', lastName: 'Tesfaye', email: 'selam@example.com', status: 'ACTIVE', membershipStartDate: '2020-09-01', isOverdue: false, recurringActive: true, paidThroughDate: '2026-03-31', familyCount: 4, lastPayment: '2026-02-25' },
  { id: 'd5', firstName: 'Yonas', lastName: 'Alemu', email: 'yonas@example.com', status: 'ACTIVE', membershipStartDate: '2024-01-20', isOverdue: true, recurringActive: false, paidThroughDate: '2025-12-31', familyCount: 0, lastPayment: '2025-12-30' },
  { id: 'd6', firstName: 'Meron', lastName: 'Tadesse', email: 'meron@example.com', status: 'ACTIVE', membershipStartDate: '2022-11-05', isOverdue: false, recurringActive: true, paidThroughDate: '2026-03-31', familyCount: 2, lastPayment: '2026-02-20' },
  { id: 'd7', firstName: 'Biruk', lastName: 'Worku', email: 'biruk@example.com', status: 'ACTIVE', membershipStartDate: '2023-07-15', isOverdue: true, recurringActive: false, paidThroughDate: '2026-01-15', familyCount: 1, lastPayment: '2026-01-14' },
  { id: 'd8', firstName: 'Hiwot', lastName: 'Mengistu', email: 'hiwot@example.com', status: 'ACTIVE', membershipStartDate: '2021-02-28', isOverdue: false, recurringActive: true, paidThroughDate: '2026-03-31', familyCount: 3, lastPayment: '2026-02-15' },
]

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; q?: string }>
}) {
  const cookieStore = await cookies()
  const isDemoAdmin = cookieStore.get('sbmi_demo_admin')?.value === '1'

  const { filter, q } = await searchParams

  let membersWithStatus = DEMO_MEMBERS

  if (!isDemoAdmin) {
    const user = await getAdminSession()
    if (!user || user.role !== 'ADMIN') redirect('/login')

    try {
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
      membersWithStatus = members.map((m) => {
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
    } catch {
      // DB unavailable — use demo data
    }
  }

  const filtered = filter === 'overdue'
    ? membersWithStatus.filter((m) => m.isOverdue)
    : membersWithStatus

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 20 }}>
        Member Management
      </h1>

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
          <Link href="/admin/members" className={`btn-sm ${!filter ? 'btn-primary' : 'btn-secondary'}`}>
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
                  {m.paidThroughDate ? new Date(m.paidThroughDate).toLocaleDateString('en-CA') : '—'}
                </td>
                <td style={{ fontSize: 13, color: 'var(--color-gray-600)' }}>
                  {m.familyCount} member{m.familyCount !== 1 ? 's' : ''}
                </td>
                <td style={{ fontSize: 13, color: 'var(--color-gray-600)' }}>
                  {m.lastPayment ? new Date(m.lastPayment).toLocaleDateString('en-CA') : 'Never'}
                </td>
                <td>
                  <Link href={`/admin/members/${m.id}`} style={{ fontSize: 13, color: 'var(--color-green)', fontWeight: 600, textDecoration: 'none' }}>
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
