'use client'

import { usePathname } from 'next/navigation'

interface MemberHeaderProps {
  user: {
    firstName: string
    lastName: string
  }
}

const pageTitles: Record<string, string> = {
  '/member': 'Dashboard',
  '/member/payments': 'Payments',
  '/member/family': 'Family Members',
  '/member/bylaws': 'Bylaws',
  '/member/assistance': 'Request Assistance',
  '/member/profile': 'My Profile',
}

export default function MemberHeader({ user }: MemberHeaderProps) {
  const pathname = usePathname()

  const title = Object.entries(pageTitles).find(([key]) =>
    key === pathname || (key !== '/member' && pathname.startsWith(key))
  )?.[1] || 'Member Portal'

  const now = new Date()
  const dateStr = now.toLocaleDateString('en-CA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Edmonton',
  })

  return (
    <header style={{
      background: 'var(--color-white)',
      borderBottom: '1px solid var(--color-gray-200)',
      padding: '0 32px',
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0,
    }}>
      <div>
        <h1 style={{
          fontSize: 20,
          fontWeight: 700,
          color: 'var(--color-gray-900)',
          margin: 0,
        }}>
          {title}
        </h1>
        <p style={{ fontSize: 12, color: 'var(--color-gray-400)', margin: 0 }}>
          {dateStr}
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 14, color: 'var(--color-gray-600)' }}>
          Welcome, {user.firstName}
        </span>
        <div style={{
          width: 36, height: 36,
          background: 'var(--color-green)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: 700, fontSize: 14,
        }}>
          {user.firstName[0]}{user.lastName[0]}
        </div>
      </div>
    </header>
  )
}
