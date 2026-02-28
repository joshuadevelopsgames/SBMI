import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AssistanceClient from './AssistanceClient'

export default async function AssistancePage() {
  const cookieStore = await cookies()
  const isDemo = cookieStore.get('sbmi_demo')?.value === '1'

  if (isDemo) {
    return (
      <AssistanceClient
        familyMembers={[
          { id: 'demo-1', fullName: 'Tigist Demo', isActive: true },
          { id: 'demo-2', fullName: 'Yonas Demo', isActive: true },
        ]}
        pastRequests={[
          {
            id: 'demo-req-1',
            requestType: 'MEMBER',
            familyMemberName: null,
            otherName: null,
            description: 'Demo assistance request — no real data.',
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ]}
      />
    )
  }

  const user = await getSession()
  if (!user) redirect('/login')

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
