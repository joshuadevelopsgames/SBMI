'use client'

import Link from 'next/link'

interface MemberFooterProps {
  adminEmail?: string
}

export default function MemberFooter({ adminEmail = 'info@sbmi.ca' }: MemberFooterProps) {
  const year = new Date().getFullYear()

  return (
    <footer style={{
      background: 'var(--color-white)',
      borderTop: '1px solid var(--color-gray-200)',
      padding: '20px 40px',
      flexShrink: 0,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        {/* Logo + org name */}
        <Link href="/member" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 28, height: 28,
            background: 'var(--color-green)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ color: 'white', fontWeight: 800, fontSize: 11, letterSpacing: '-0.5px' }}>SB</span>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-gray-900)', lineHeight: 1.2 }}>
              Samuel Bete
            </div>
            <div style={{ fontSize: 10, color: 'var(--color-gray-500)', lineHeight: 1.2 }}>
              Mutual Iddir
            </div>
          </div>
        </Link>

        {/* Nav links mirroring sidebar */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          {[
            { href: '/member', label: 'Dashboard' },
            { href: '/member/payments', label: 'Payments' },
            { href: '/member/family', label: 'Family Members' },
            { href: '/member/bylaws', label: 'Bylaws' },
            { href: '/member/assistance', label: 'Request Assistance' },
            { href: '/member/profile', label: 'My Profile' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                fontSize: 13,
                color: 'var(--color-gray-500)',
                textDecoration: 'none',
                fontWeight: 500,
                transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-green)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-gray-500)')}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Contact + copyright */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, color: 'var(--color-gray-500)', marginBottom: 2 }}>
            Need help?{' '}
            <a
              href={`mailto:${adminEmail}`}
              style={{ color: 'var(--color-green)', fontWeight: 600, textDecoration: 'none' }}
            >
              {adminEmail}
            </a>
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-gray-400)' }}>
            © {year} Samuel Bete Mutual Iddir
          </div>
        </div>
      </div>
    </footer>
  )
}
