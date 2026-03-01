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
        assistanceApprovalThreshold: config.assistanceApprovalThreshold ?? 2,
        assistanceRejectionThreshold: config.assistanceRejectionThreshold ?? 2,
        supportRequestApprovalThreshold: config.supportRequestApprovalThreshold ?? 2,
        supportRequestRejectionThreshold: config.supportRequestRejectionThreshold ?? 2,
      }}
    />
  )
}
