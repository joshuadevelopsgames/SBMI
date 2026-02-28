import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getAppConfig } from '@/lib/payments'
import AdminConfigClient from './AdminConfigClient'

export default async function AdminConfigPage() {
  const user = await getSession()
  if (!user || user.role !== 'ADMIN') redirect('/login')

  const config = await getAppConfig()

  return (
    <AdminConfigClient
      config={{
        monthlyContributionCents: config.monthlyContributionCents,
        penaltyAmountCents: config.penaltyAmountCents,
        bylawsPdfUrl: config.bylawsPdfUrl,
        adminEmail: config.adminEmail,
        welcomeMessage: config.welcomeMessage || '',
      }}
    />
  )
}
