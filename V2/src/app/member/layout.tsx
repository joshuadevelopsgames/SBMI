import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/auth'
import MemberSidebar from '@/components/MemberSidebar'
import MemberHeader from '@/components/MemberHeader'

// Demo user shown when sbmi_demo cookie is set
const DEMO_USER = {
  firstName: 'Demo',
  lastName: 'Member',
  email: 'demo@sbmi.ca',
  role: 'MEMBER' as const,
}

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const isDemo = cookieStore.get('sbmi_demo')?.value === '1'

  if (isDemo) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-gray-50)' }}>
        {/* Demo banner */}
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 999,
          background: '#F9A825',
          color: '#1a1a1a',
          textAlign: 'center',
          padding: '8px 16px',
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: '0.04em',
        }}>
          DEMO MODE — You are viewing a preview of the member portal. No real data is shown.
        </div>

        <MemberSidebar user={DEMO_USER} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, paddingTop: 36 }}>
          <MemberHeader user={{ firstName: DEMO_USER.firstName, lastName: DEMO_USER.lastName }} />
          <main style={{ flex: 1, padding: '32px 40px' }}>
            {children}
          </main>
        </div>
      </div>
    )
  }

  const user = await getSession()

  if (!user) {
    redirect('/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-gray-50)' }}>
      <MemberSidebar user={{ firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role }} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <MemberHeader user={{ firstName: user.firstName, lastName: user.lastName }} />
        <main style={{ flex: 1, padding: '32px 40px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
