import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AssistanceClient from './AssistanceClient'

export default async function AssistancePage() {
  const user = await getSession()
  if (!user) redirect('/login')

  // Get active family members (under 25)
  const allMembers = await prisma.familyMember.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'asc' },
  })

  const now = new Date()
  const activeMembers = allMembers
    .map((m) => {
      const ageMs = now.getTime() - new Date(m.birthDate).getTime()
      const ageYears = ageMs / (1000 * 60 * 60 * 24 * 365.25)
      return { id: m.id, fullName: m.fullName, isActive: ageYears < 25 }
    })
    .filter((m) => m.isActive)

  // Get past requests
  const pastRequests = await prisma.assistanceRequest.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: { familyMember: true },
  })

  return (
    <AssistanceClient
      familyMembers={activeMembers}
      pastRequests={pastRequests.map((r) => ({
        id: r.id,
        requestType: r.requestType,
        familyMemberName: r.familyMember?.fullName || null,
        otherName: r.otherName || null,
        description: r.description,
        createdAt: r.createdAt.toISOString(),
      }))}
    />
  )
}
