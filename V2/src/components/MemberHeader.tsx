'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

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
  const router = useRouter()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    setLoggingOut(true)
    setDropdownOpen(false)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch { /* ignore */ }
    router.push('/login?message=logged-out')
  }

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
      position: 'relative',
      zIndex: 10,
    }}>
      <div>
        <h1 style={{
          fontSize: 20,
          fontWeight: 700,
          color: 'var(--color-gray-900)',
          margin: 0,
          fontFamily: 'var(--font-serif)',
        }}>
          {title}
        </h1>
        <p style={{ fontSize: 12, color: 'var(--color-gray-400)', margin: 0 }}>
          {dateStr}
        </p>
      </div>

      {/* Profile avatar with dropdown */}
      <div ref={dropdownRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '6px 8px',
            borderRadius: 4,
            transition: 'background 0.15s',
          }}
          aria-label="Account menu"
          aria-expanded={dropdownOpen}
        >
          <span style={{ fontSize: 14, color: 'var(--color-gray-600)', fontWeight: 500 }}>
            {user.firstName} {user.lastName}
          </span>
          <div style={{
            width: 36, height: 36,
            background: 'var(--color-green)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: 14,
            borderRadius: 2,
            flexShrink: 0,
          }}>
            {user.firstName[0]}{user.lastName[0]}
          </div>
          {/* Chevron */}
          <svg
            viewBox="0 0 24 24" width="14" height="14"
            fill="none" stroke="var(--color-gray-400)" strokeWidth="2"
            style={{ transition: 'transform 0.15s', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {/* Dropdown menu */}
        {dropdownOpen && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            background: 'var(--color-white)',
            border: '1px solid var(--color-gray-200)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
            minWidth: 200,
            zIndex: 100,
            borderRadius: 2,
            overflow: 'hidden',
          }}>
            {/* User info header */}
            <div style={{
              padding: '14px 16px',
              borderBottom: '1px solid var(--color-gray-100)',
              background: 'var(--color-gray-50)',
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-gray-900)' }}>
                {user.firstName} {user.lastName}
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-gray-500)', marginTop: 2 }}>
                Member Account
              </div>
            </div>

            {/* Edit Profile */}
            <Link
              href="/member/profile"
              onClick={() => setDropdownOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 16px',
                color: 'var(--color-gray-700)',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 500,
                transition: 'background 0.1s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-gray-50)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Edit Profile
            </Link>

            <div style={{ borderTop: '1px solid var(--color-gray-100)' }} />

            {/* Sign Out */}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 16px',
                color: 'var(--color-red)',
                background: 'none',
                border: 'none',
                cursor: loggingOut ? 'not-allowed' : 'pointer',
                fontSize: 14,
                fontWeight: 500,
                width: '100%',
                textAlign: 'left',
                transition: 'background 0.1s',
                opacity: loggingOut ? 0.6 : 1,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#fff5f5')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              {loggingOut ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
