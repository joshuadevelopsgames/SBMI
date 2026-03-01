import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminApplicationsClient from './AdminApplicationsClient'

const DEMO_APPLICATIONS = [
  { id: 'demo-app-1', firstName: 'Kebede', lastName: 'Alemu', email: 'kebede@example.com', phone: '416-555-0101', status: 'PENDING', createdAt: new Date('2026-02-25').toISOString(), notes: null },
  { id: 'demo-app-2', firstName: 'Almaz', lastName: 'Bekele', email: 'almaz@example.com', phone: '647-555-0202', status: 'PENDING', createdAt: new Date('2026-02-23').toISOString(), notes: null },
  { id: 'demo-app-3', firstName: 'Tesfaye', lastName: 'Girma', email: 'tesfaye@example.com', phone: '905-555-0303', status: 'PENDING', createdAt: new Date('2026-02-20').toISOString(), notes: null },
  { id: 'demo-app-4', firstName: 'Hana', lastName: 'Tadesse', email: 'hana@example.com', phone: '416-555-0404', status: 'APPROVED', createdAt: new Date('2026-02-10').toISOString(), notes: 'Approved at monthly meeting.' },
  { id: 'demo-app-5', firstName: 'Mulugeta', lastName: 'Haile', email: 'mulugeta@example.com', phone: '647-555-0505', status: 'REJECTED', createdAt: new Date('2026-01-30').toISOString(), notes: 'Does not meet residency requirement.' },
]

export default async function AdminApplicationsPage() {
  const cookieStore = await cookies()
  const isDemoAdmin = cookieStore.get('sbmi_demo_admin')?.value === '1'

  const user = await getAdminSession()
  if (!user || user.role !== 'ADMIN') redirect('/login')

  let applications = DEMO_APPLICATIONS

  if (!isDemoAdmin) {
    try {
      const dbApps = await prisma.application.findMany({ orderBy: { createdAt: 'desc' } })
      applications = dbApps.map((a) => ({
        id: a.id,
        firstName: a.firstName,
        lastName: a.lastName,
        email: a.email,
        phone: a.phone,
        status: a.status,
        createdAt: a.createdAt.toISOString(),
        notes: a.notes || null,
      }))
    } catch {
      // DB unavailable — use demo data
    }
  }

  return <AdminApplicationsClient applications={applications} />
}
