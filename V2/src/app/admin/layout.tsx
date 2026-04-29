import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import AdminSidebar from '@/components/AdminSidebar'
import MemberHeader from '@/components/MemberHeader'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getSession()

  if (!user) redirect('/login')
  if (user.role !== 'ADMIN') redirect('/member')

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-gray-50)' }}>
      <AdminSidebar user={{ firstName: user.firstName, lastName: user.lastName, email: user.email }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <MemberHeader user={{ firstName: user.firstName, lastName: user.lastName }} />
        <main style={{ flex: 1, padding: '32px', maxWidth: 1200, width: '100%' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
