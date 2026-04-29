import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminAssistanceClient from './AdminAssistanceClient'

export default async function AdminAssistancePage() {
  const user = await getSession()
  if (!user || user.role !== 'ADMIN') redirect('/login')

  const requests = await prisma.assistanceRequest.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
      familyMember: true,
    },
  })

  return (
    <AdminAssistanceClient
      requests={requests.map((r) => ({
        id: r.id,
        memberName: `${r.user.firstName} ${r.user.lastName}`,
        memberEmail: r.user.email,
        requestType: r.requestType,
        familyMemberName: r.familyMember?.fullName || null,
        otherName: r.otherName || null,
        otherPhone: r.otherPhone || null,
        description: r.description,
        status: r.status,
        adminNotes: r.adminNotes || null,
        createdAt: r.createdAt.toISOString(),
      }))}
    />
  )
}
