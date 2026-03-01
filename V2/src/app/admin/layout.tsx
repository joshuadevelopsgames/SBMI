import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getAdminSession } from '@/lib/auth'
import AdminSidebar from '@/components/AdminSidebar'
import MemberHeader from '@/components/MemberHeader'

const DEMO_ADMIN = {
  firstName: 'Demo',
  lastName: 'Administrator',
  email: 'admin@sbmi.ca',
  role: 'ADMIN' as const,
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const isDemoAdmin = cookieStore.get('sbmi_demo_admin')?.value === '1'

  if (isDemoAdmin) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-gray-50)' }}>
        {/* Demo banner */}
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 999,
          background: '#B71C1C',
          color: '#fff',
          textAlign: 'center',
          padding: '8px 16px',
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: '0.04em',
        }}>
          DEMO MODE — Executive Committee Portal Preview. No real data is shown or stored.
        </div>

        <div style={{ paddingTop: 36, display: 'flex', width: '100%' }}>
          <AdminSidebar user={DEMO_ADMIN} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <MemberHeader user={{ firstName: DEMO_ADMIN.firstName, lastName: DEMO_ADMIN.lastName }} />
            <main style={{ flex: 1, padding: '32px', maxWidth: 1200, width: '100%' }}>
              {children}
            </main>
          </div>
        </div>
      </div>
    )
  }

  const user = await getAdminSession()

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
