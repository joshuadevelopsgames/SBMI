import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/auth'
import { getAppConfig } from '@/lib/payments'

export default async function BylawsPage() {
  const cookieStore = await cookies()
  const isDemo = cookieStore.get('sbmi_demo')?.value === '1'

  let config = { bylawsPdfUrl: '/sbmi-bylaws.pdf', adminEmail: 'info@sbmi.ca' }

  if (!isDemo) {
    const user = await getSession()
    if (!user) redirect('/login')
    config = await getAppConfig()
  }

  return (
    <div>
      <div style={{
        background: 'var(--color-white)',
        border: '1px solid var(--color-gray-200)',
        padding: '40px',
      }}>
        {/* Document icon */}
        <div style={{
          width: 64, height: 64,
          background: 'var(--color-green-pale)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 24,
        }}>
          <svg viewBox="0 0 24 24" width="32" height="32" fill="var(--color-green)">
            <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
          </svg>
        </div>

        <h2 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 24,
          fontWeight: 700,
          color: 'var(--color-gray-900)',
          marginBottom: 12,
        }}>
          SBMI Bylaws
        </h2>

        <p style={{ color: 'var(--color-gray-600)', fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>
          The Samuel Bete Mutual Iddir bylaws outline the rules, rights, and responsibilities
          of all members. Please read this document carefully to understand how the organization
          operates, how contributions are managed, and the conditions under which assistance
          is provided.
        </p>

        <div style={{
          background: 'var(--color-gray-50)',
          border: '1px solid var(--color-gray-200)',
          padding: '16px 20px',
          marginBottom: 28,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-gray-700)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Document Details
          </div>
          <table style={{ width: '100%', fontSize: 14 }}>
            <tbody>
              <tr>
                <td style={{ padding: '4px 0', color: 'var(--color-gray-500)', width: 140 }}>Document</td>
                <td style={{ padding: '4px 0', color: 'var(--color-gray-800)', fontWeight: 500 }}>SBMI Bylaws</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0', color: 'var(--color-gray-500)' }}>Organization</td>
                <td style={{ padding: '4px 0', color: 'var(--color-gray-800)', fontWeight: 500 }}>Samuel Bete Mutual Iddir</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0', color: 'var(--color-gray-500)' }}>Format</td>
                <td style={{ padding: '4px 0', color: 'var(--color-gray-800)', fontWeight: 500 }}>PDF</td>
              </tr>
            </tbody>
          </table>
        </div>

        <a
          href={config.bylawsPdfUrl || '/bylaws.pdf'}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
          </svg>
          Download Bylaws (PDF)
        </a>

        <p style={{ marginTop: 16, fontSize: 13, color: 'var(--color-gray-400)' }}>
          If you have questions about the bylaws, please contact the SBMI administration at{' '}
          <a href={`mailto:${config.adminEmail}`} style={{ color: 'var(--color-green)' }}>
            {config.adminEmail || 'info@sbmi.ca'}
          </a>
        </p>
      </div>
    </div>
  )
}
