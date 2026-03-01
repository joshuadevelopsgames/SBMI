import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getAdminSession } from '@/lib/auth'
import { getAppConfig } from '@/lib/payments'
import AdminConfigClient from './AdminConfigClient'

const DEMO_CONFIG = {
  monthlyContributionCents: 2000,
  penaltyAmountCents: 500,
  bylawsPdfUrl: null,
  adminEmail: 'admin@sbmi.ca',
  welcomeMessage: 'Welcome to the Samuel Bete Mutual Iddir member portal.',
  assistanceApprovalThreshold: 2,
  assistanceRejectionThreshold: 2,
  supportRequestApprovalThreshold: 2,
  supportRequestRejectionThreshold: 2,
}

export default async function AdminConfigPage() {
  const cookieStore = await cookies()
  const isDemoAdmin = cookieStore.get('sbmi_demo_admin')?.value === '1'

  const user = await getAdminSession()
  if (!user || user.role !== 'ADMIN') redirect('/login')

  let config: {
    monthlyContributionCents: number; penaltyAmountCents: number; bylawsPdfUrl: string | null;
    adminEmail: string; welcomeMessage: string; assistanceApprovalThreshold: number;
    assistanceRejectionThreshold: number; supportRequestApprovalThreshold: number; supportRequestRejectionThreshold: number;
  } = DEMO_CONFIG

  if (!isDemoAdmin) {
    try {
      const dbConfig = await getAppConfig()
      config = {
        monthlyContributionCents: dbConfig.monthlyContributionCents,
        penaltyAmountCents: dbConfig.penaltyAmountCents,
        bylawsPdfUrl: dbConfig.bylawsPdfUrl,
        adminEmail: dbConfig.adminEmail,
        welcomeMessage: dbConfig.welcomeMessage || '',
        assistanceApprovalThreshold: dbConfig.assistanceApprovalThreshold ?? 2,
        assistanceRejectionThreshold: dbConfig.assistanceRejectionThreshold ?? 2,
        supportRequestApprovalThreshold: dbConfig.supportRequestApprovalThreshold ?? 2,
        supportRequestRejectionThreshold: dbConfig.supportRequestRejectionThreshold ?? 2,
      }
    } catch {
      // DB unavailable — use demo config
    }
  }

  return <AdminConfigClient config={config} />
}
