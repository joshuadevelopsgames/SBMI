import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminApplicationsClient from './AdminApplicationsClient'

export default async function AdminApplicationsPage() {
  const user = await getSession()
  if (!user || user.role !== 'ADMIN') redirect('/login')

  const applications = await prisma.application.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <AdminApplicationsClient
      applications={applications.map((a) => ({
        id: a.id,
        firstName: a.firstName,
        lastName: a.lastName,
        email: a.email,
        phone: a.phone,
        status: a.status,
        createdAt: a.createdAt.toISOString(),
        notes: a.notes || null,
      }))}
    />
  )
}
