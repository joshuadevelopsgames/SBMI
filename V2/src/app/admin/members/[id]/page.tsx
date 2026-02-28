import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminMemberDetailClient from './AdminMemberDetailClient'

export default async function AdminMemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await getSession()
  if (!user || user.role !== 'ADMIN') redirect('/login')

  const { id } = await params

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

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Link href="/admin/members" style={{ fontSize: 13, color: 'var(--color-green)', fontWeight: 600, textDecoration: 'none' }}>
          ← Back to Members
        </Link>
      </div>

      <AdminMemberDetailClient
        member={{
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
        }}
      />
    </div>
  )
}
