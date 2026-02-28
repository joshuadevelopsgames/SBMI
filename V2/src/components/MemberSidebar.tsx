'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface MemberSidebarProps {
  user: {
    firstName: string
    lastName: string
    email: string
    role: string
  }
}

const navItems = [
  {
    href: '/member',
    label: 'Dashboard',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
      </svg>
    ),
  },
  {
    href: '/member/payments',
    label: 'Payments',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
      </svg>
    ),
  },
  {
    href: '/member/family',
    label: 'Family Members',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
      </svg>
    ),
  },
  {
    href: '/member/bylaws',
    label: 'Bylaws',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
      </svg>
    ),
  },
  {
    href: '/member/assistance',
    label: 'Request Assistance',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
      </svg>
    ),
  },
  {
    href: '/member/profile',
    label: 'My Profile',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
      </svg>
    ),
  },
]

export default function MemberSidebar({ user }: MemberSidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/member') return pathname === '/member'
    return pathname.startsWith(href)
  }

  return (
    <aside style={{
      width: 240,
      background: 'var(--color-white)',
      borderRight: '1px solid var(--color-gray-200)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{
        padding: '20px 16px',
        borderBottom: '1px solid var(--color-gray-200)',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 32, height: 32,
            background: 'var(--color-green)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 800, fontSize: 12,
            flexShrink: 0,
          }}>SB</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-gray-900)', lineHeight: 1.2 }}>
              Samuel Bete
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-gray-500)', letterSpacing: '0.04em' }}>
              Mutual Iddir
            </div>
          </div>
        </Link>
        <div className="flag-bar" style={{ marginTop: 16 }} />
      </div>

      {/* User info */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid var(--color-gray-100)',
        background: 'var(--color-gray-50)',
      }}>
        <div style={{
          width: 40, height: 40,
          background: 'var(--color-green)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: 700, fontSize: 16,
          marginBottom: 8,
        }}>
          {user.firstName[0]}{user.lastName[0]}
        </div>
        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-gray-900)' }}>
          {user.firstName} {user.lastName}
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-gray-500)', marginTop: 2 }}>
          {user.email}
        </div>
        {user.role === 'ADMIN' && (
          <div style={{
            display: 'inline-block',
            marginTop: 6,
            padding: '2px 8px',
            background: 'var(--color-green-pale)',
            color: 'var(--color-green)',
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            Admin
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '8px 0' }}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-nav-link${isActive(item.href) ? ' active' : ''}`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}

        {user.role === 'ADMIN' && (
          <>
            <div style={{
              padding: '12px 16px 4px',
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--color-gray-400)',
            }}>
              Administration
            </div>
            <Link
              href="/admin"
              className={`sidebar-nav-link${pathname.startsWith('/admin') ? ' active' : ''}`}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
              </svg>
              Admin Portal
            </Link>
          </>
        )}
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px 0', borderTop: '1px solid var(--color-gray-200)' }}>
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="sidebar-nav-link"
            style={{
              width: '100%',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
            </svg>
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  )
}
