import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminMemberDetailClient from './AdminMemberDetailClient'

const DEMO_MEMBER_MAP: Record<string, object> = {
  'd1': {
    id: 'd1', firstName: 'Abebe', lastName: 'Girma', email: 'abebe@example.com',
    status: 'ACTIVE', role: 'MEMBER', membershipStartDate: '2022-01-15T00:00:00.000Z',
    isOverdue: false, recurringActive: true, paidThroughDate: '2026-03-31T00:00:00.000Z',
    familyMembers: [
      { id: 'fm1', fullName: 'Tigist Girma', birthDate: '1985-04-12' },
      { id: 'fm2', fullName: 'Liya Girma', birthDate: '2010-08-22' },
      { id: 'fm3', fullName: 'Naol Girma', birthDate: '2013-11-05' },
    ],
    payments: [
      { id: 'p1', amount: 2000, paymentDate: '2026-02-28T00:00:00.000Z', status: 'SUCCEEDED', paymentType: 'RECURRING', receiptUrl: null },
      { id: 'p2', amount: 2000, paymentDate: '2026-01-28T00:00:00.000Z', status: 'SUCCEEDED', paymentType: 'RECURRING', receiptUrl: null },
    ],
    penalties: [],
    assistanceRequests: [],
  },
  'd3': {
    id: 'd3', firstName: 'Dawit', lastName: 'Haile', email: 'dawit@example.com',
    status: 'ACTIVE', role: 'MEMBER', membershipStartDate: '2023-03-10T00:00:00.000Z',
    isOverdue: true, recurringActive: false, paidThroughDate: '2026-01-31T00:00:00.000Z',
    familyMembers: [
      { id: 'fm4', fullName: 'Sara Haile', birthDate: '1990-06-15' },
    ],
    payments: [
      { id: 'p3', amount: 2000, paymentDate: '2026-01-30T00:00:00.000Z', status: 'SUCCEEDED', paymentType: 'ONE_TIME', receiptUrl: null },
    ],
    penalties: [
      { id: 'pen1', amount: 500, reason: 'Late payment — February 2026', createdAt: '2026-02-05T00:00:00.000Z', paidAt: null },
    ],
    assistanceRequests: [
      { id: 'ar1', requestType: 'MEDICAL', familyMemberName: null, otherName: null, description: 'Emergency surgery costs.', status: 'PENDING', createdAt: '2026-02-28T00:00:00.000Z' },
    ],
  },
}

const DEMO_FALLBACK = {
  id: 'demo', firstName: 'Demo', lastName: 'Member', email: 'member@example.com',
  status: 'ACTIVE', role: 'MEMBER', membershipStartDate: '2023-01-01T00:00:00.000Z',
  isOverdue: false, recurringActive: true, paidThroughDate: '2026-03-31T00:00:00.000Z',
  familyMembers: [], payments: [], penalties: [], assistanceRequests: [],
}

export default async function AdminMemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const cookieStore = await cookies()
  const isDemoAdmin = cookieStore.get('sbmi_demo_admin')?.value === '1'

  const user = await getAdminSession()
  if (!user || user.role !== 'ADMIN') redirect('/login')

  const { id } = await params

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let memberData: any = null

  if (isDemoAdmin) {
    memberData = DEMO_MEMBER_MAP[id] || DEMO_FALLBACK
  } else {
    try {
      const member = await prisma.user.findUnique({
        where: { id },
        include: {
          memberBalance: true,
          familyMembers: { orderBy: { createdAt: 'asc' } },
          payments: { orderBy: { paymentDate: 'desc' }, take: 50 },
          penalties: { orderBy: { createdAt: 'desc' } },
          assistanceRequests: {
            orderBy: { createdAt: 'desc' },
            include: { familyMember: true },
          },
        },
      })

      if (!member) notFound()

      const now = new Date()
      const isOverdue = !member.memberBalance?.paidThroughDate || member.memberBalance.paidThroughDate < now

      memberData = {
        id: member.id,
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        status: member.status,
        role: member.role,
        membershipStartDate: member.membershipStartDate?.toISOString() || null,
        isOverdue,
        recurringActive: member.memberBalance?.recurringActive || false,
        paidThroughDate: member.memberBalance?.paidThroughDate?.toISOString() || null,
        familyMembers: member.familyMembers.map((f) => ({
          id: f.id,
          fullName: f.fullName,
          birthDate: f.birthDate.toISOString().split('T')[0],
        })),
        payments: member.payments.map((p) => ({
          id: p.id,
          amount: p.amount,
          paymentDate: p.paymentDate.toISOString(),
          status: p.status,
          paymentType: p.paymentType,
          receiptUrl: p.receiptUrl || null,
        })),
        penalties: member.penalties.map((p) => ({
          id: p.id,
          amount: p.amount,
          reason: p.reason,
          createdAt: p.createdAt.toISOString(),
          paidAt: p.paidAt?.toISOString() || null,
        })),
        assistanceRequests: member.assistanceRequests.map((r) => ({
          id: r.id,
          requestType: r.requestType,
          familyMemberName: r.familyMember?.fullName || null,
          otherName: r.otherName || null,
          description: r.description,
          status: r.status,
          createdAt: r.createdAt.toISOString(),
        })),
      }
    } catch {
      memberData = DEMO_FALLBACK
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Link href="/admin/members" style={{ fontSize: 13, color: 'var(--color-green)', fontWeight: 600, textDecoration: 'none' }}>
          ← Back to Members
        </Link>
      </div>
      <AdminMemberDetailClient member={memberData} />
    </div>
  )
}
