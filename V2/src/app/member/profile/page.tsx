import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/auth'
import ProfileClient from './ProfileClient'

export default async function ProfilePage() {
  const cookieStore = await cookies()
  const isDemo = cookieStore.get('sbmi_demo')?.value === '1'

  if (isDemo) {
    return (
      <ProfileClient
        user={{
          firstName: 'Demo',
          lastName: 'Member',
          email: 'demo@sbmi.ca',
          membershipStartDate: '2023-01-14T00:00:00.000Z',
        }}
      />
    )
  }

  const user = await getSession()
  if (!user) redirect('/login')

  return (
    <ProfileClient
      user={{
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        membershipStartDate: user.membershipStartDate?.toISOString() || null,
      }}
    />
  )
}
