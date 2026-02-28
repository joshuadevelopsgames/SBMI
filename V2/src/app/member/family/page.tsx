import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import FamilyManagementClient from './FamilyManagementClient'

export default async function FamilyPage() {
  const user = await getSession()
  if (!user) redirect('/login')

  const familyMembers = await prisma.familyMember.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'asc' },
  })

  // Determine which members are "active" (children under 25)
  const now = new Date()
  const membersWithStatus = familyMembers.map((m) => {
    const birthDate = new Date(m.birthDate)
    const ageMs = now.getTime() - birthDate.getTime()
    const ageYears = ageMs / (1000 * 60 * 60 * 24 * 365.25)
    const isActive = ageYears < 25
    return {
      id: m.id,
      fullName: m.fullName,
      birthDate: m.birthDate.toISOString().split('T')[0],
      isActive,
      ageYears: Math.floor(ageYears),
    }
  })

  return <FamilyManagementClient members={membersWithStatus} />
}
