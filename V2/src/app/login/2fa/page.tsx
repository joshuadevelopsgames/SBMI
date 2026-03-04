'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function TwoFactorPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strip non-alphanumeric, keep first 6, uppercase
    const raw = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6)
    setCode(raw)
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text')
    const cleaned = pasted.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6)
    setCode(cleaned)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length !== 6) {
      setError('Please enter a 6-character verification code.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })

      const data = await res.json()

      if (res.ok) {
        // Redirect based on role
        if (data.role === 'ADMIN') {
          router.push('/admin')
        } else {
          router.push('/member')
        }
      } else {
        setError(data.error || 'Invalid verification code.')
        setCode('')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    setResent(false)
    try {
      await fetch('/api/auth/2fa/resend', { method: 'POST' })
      setResent(true)
    } catch {
      // Silent fail
    } finally {
      setResending(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-gray-50)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <header style={{ background: 'var(--color-white)', borderBottom: '1px solid var(--color-gray-200)' }}>
        <div className="flag-bar"><div /></div>
        <div className="container" style={{ display: 'flex', alignItems: 'center', height: 60 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 32, height: 32, background: 'var(--color-green)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 800, fontSize: 12,
            }}>SB</div>
            <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-gray-900)' }}>
              Samuel Bete Mutual Iddir
            </span>
          </Link>
        </div>
      </header>

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{
              width: 56, height: 56, background: 'var(--color-green)',
              margin: '0 auto 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg viewBox="0 0 24 24" width="28" height="28" fill="white">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
              </svg>
            </div>
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 28, fontWeight: 700,
              color: 'var(--color-gray-900)', marginBottom: 8,
            }}>
              Two-Factor Verification
            </h1>
            <p style={{ color: 'var(--color-gray-500)', fontSize: 15, lineHeight: 1.6 }}>
              A verification code has been sent to your email address.
            </p>
          </div>

          <div style={{
            background: 'var(--color-white)',
            border: '1px solid var(--color-gray-200)',
            padding: '36px',
          }}>
            <div className="alert-info" style={{ marginBottom: 24, fontSize: 14 }}>
              The email may take up to two minutes to arrive. If you do not see it, please check your spam folder before requesting a new code.
            </div>

            {error && (
              <div className="alert-error" style={{ marginBottom: 24 }}>{error}</div>
            )}

            {resent && (
              <div className="alert-success" style={{ marginBottom: 24 }}>
                A new verification code has been sent to your email.
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div style={{ marginBottom: 28 }}>
                <label className="form-label" htmlFor="code">
                  Verification Code
                </label>
                <input
                  id="code"
                  type="text"
                  inputMode="text"
                  className="form-input"
                  value={code}
                  onChange={handleCodeChange}
                  onPaste={handlePaste}
                  maxLength={6}
                  autoComplete="one-time-code"
                  autoFocus
                  placeholder="XXXXXX"
                  style={{
                    fontSize: 32,
                    letterSpacing: '0.3em',
                    textAlign: 'center',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    padding: '16px',
                    textTransform: 'uppercase',
                  }}
                />
                <p style={{ fontSize: 13, color: 'var(--color-gray-500)', marginTop: 6, textAlign: 'center' }}>
                  Enter the 6-character code from your email
                </p>
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={loading || code.length !== 6}
                style={{ width: '100%', padding: '14px', fontSize: 16 }}
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <button
                onClick={handleResend}
                disabled={resending}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-green)',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0,
                }}
              >
                {resending ? 'Sending...' : 'Resend verification code'}
              </button>
            </div>
          </div>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--color-gray-500)' }}>
            <Link href="/login" style={{ color: 'var(--color-green)', fontWeight: 600, textDecoration: 'none' }}>
              ← Back to sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
