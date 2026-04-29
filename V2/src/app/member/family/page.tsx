import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import FamilyManagementClient from './FamilyManagementClient'

type FamilyMemberRow = {
  id: string
  fullName: string
  birthDate: string
  isActive: boolean
  ageYears: number
}

export default async function FamilyPage() {
  const cookieStore = await cookies()
  const isDemo = cookieStore.get('sbmi_demo')?.value === '1'

  let membersWithStatus: FamilyMemberRow[] = []

  if (isDemo) {
    membersWithStatus = [
      { id: 'demo-1', fullName: 'Tigist Demo', birthDate: '1985-03-15', isActive: true, ageYears: 40 },
      { id: 'demo-2', fullName: 'Yonas Demo', birthDate: '2010-07-22', isActive: true, ageYears: 15 },
    ]
  } else {
    const user = await getSession()
    if (!user) redirect('/login')

    const familyMembers = await prisma.familyMember.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'asc' },
    })

    const now = new Date()
    membersWithStatus = familyMembers.map((m) => {
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
  }

  return <FamilyManagementClient members={membersWithStatus} />
}
