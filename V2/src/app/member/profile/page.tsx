import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import ProfileClient from './ProfileClient'

export default async function ProfilePage() {
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
