'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const message = searchParams.get('message')
  const type = searchParams.get('type') // 'admin' or 'member' (default)

  const isAdmin = type === 'admin'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [stayLoggedIn, setStayLoggedIn] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)

  const validateEmail = (value: string) => {
    if (!value) {
      setEmailError('Email address is required.')
    } else if (value.length > 50) {
      setEmailError('Email address must be 50 characters or fewer.')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setEmailError('Please enter a valid email address.')
    } else {
      setEmailError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    validateEmail(email)
    if (emailError || !email || !password) return

    setLoading(true)
    setLoginError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, stayLoggedIn }),
      })

      const data = await res.json()

      if (res.ok) {
        router.push('/login/2fa')
      } else {
        setLoginError(data.error || 'Invalid email or password.')
      }
    } catch {
      setLoginError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDemo = async () => {
    setDemoLoading(true)
    try {
      const endpoint = isAdmin ? '/api/auth/demo-admin' : '/api/auth/demo'
      await fetch(endpoint, { method: 'POST' })
      router.push(isAdmin ? '/admin' : '/member')
    } catch {
      setDemoLoading(false)
    }
  }

  const accentColor = isAdmin ? '#B71C1C' : 'var(--color-green)'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-gray-50)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ background: 'var(--color-white)', borderBottom: '1px solid var(--color-gray-200)' }}>
        <div className="flag-bar"><div /></div>
        <div className="container" style={{ display: 'flex', alignItems: 'center', height: 60 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div style={{
              width: 36, height: 36,
              background: accentColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 800, fontSize: 12, letterSpacing: '0.04em',
            }}>SBMI</div>
            <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-gray-900)' }}>
              Samuel Bete Mutual Iddir
            </span>
          </Link>
        </div>
      </header>

      {/* Main */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 460 }}>

          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              width: 56, height: 56,
              background: accentColor,
              margin: '0 auto 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 8 }}>
              {isAdmin ? 'Executive Committee Login' : 'Member Sign In'}
            </h1>
            <p style={{ color: 'var(--color-gray-500)', fontSize: 15 }}>
              {isAdmin ? 'Sign in to the governance portal' : 'Sign in to your SBMI member portal'}
            </p>
          </div>

          {/* Demo Banner */}
          <div style={{
            background: isAdmin ? '#FFEBEE' : '#FFF8E1',
            border: `1px solid ${isAdmin ? '#EF9A9A' : '#F9A825'}`,
            padding: '16px 20px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: isAdmin ? '#7B1010' : '#7B5800', marginBottom: 2 }}>
                {isAdmin ? 'Preview the Admin Portal' : 'Want to explore first?'}
              </div>
              <div style={{ fontSize: 13, color: isAdmin ? '#922020' : '#92650A' }}>
                {isAdmin ? 'Try the governance portal with demo data.' : 'Try the member portal without an account.'}
              </div>
            </div>
            <button
              onClick={handleDemo}
              disabled={demoLoading}
              style={{
                background: isAdmin ? '#B71C1C' : '#F9A825',
                border: 'none',
                color: isAdmin ? '#fff' : '#1a1a1a',
                fontSize: 13,
                fontWeight: 700,
                padding: '10px 20px',
                cursor: demoLoading ? 'wait' : 'pointer',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {demoLoading ? 'Loading...' : (isAdmin ? 'Admin Demo →' : 'View Demo →')}
            </button>
          </div>

          {/* Message alerts */}
          {message && (
            <div className="alert-info" style={{ marginBottom: 24 }}>
              {message === 'password-changed' && 'Your password has been changed. Please sign in with your new password.'}
              {message === 'email-changed' && 'Your email address has been updated. Please sign in with your new email.'}
              {message === 'logged-out' && 'You have been signed out.'}
            </div>
          )}

          {/* Login Form */}
          <form
            onSubmit={handleSubmit}
            noValidate
            style={{ background: 'var(--color-white)', border: '1px solid var(--color-gray-200)', padding: '36px' }}
          >
            {loginError && (
              <div className="alert-error" style={{ marginBottom: 24 }}>{loginError}</div>
            )}

            <div style={{ marginBottom: 20 }}>
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                className={`form-input${emailError ? ' error' : ''}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => validateEmail(email)}
                maxLength={50}
                autoComplete="email"
                autoFocus
              />
              {emailError && <p className="error-message">{emailError}</p>}
            </div>

            <div style={{ marginBottom: 20 }}>
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: 'var(--color-gray-700)' }}>
                <input
                  type="checkbox"
                  checked={stayLoggedIn}
                  onChange={(e) => setStayLoggedIn(e.target.checked)}
                  style={{ width: 16, height: 16, cursor: 'pointer' }}
                />
                Stay logged in
              </label>
              <Link href="/forgot-password" style={{ fontSize: 14, color: accentColor, textDecoration: 'none', fontWeight: 500 }}>
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '14px', fontSize: 16, justifyContent: 'center', background: accentColor, borderColor: accentColor }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            {isAdmin ? (
              <p style={{ fontSize: 14, color: 'var(--color-gray-500)' }}>
                Are you a member?{' '}
                <Link href="/login" style={{ color: 'var(--color-green)', fontWeight: 600, textDecoration: 'none' }}>
                  Member Login
                </Link>
              </p>
            ) : (
              <>
                <p style={{ fontSize: 14, color: 'var(--color-gray-500)', marginBottom: 8 }}>
                  Not a member yet?{' '}
                  <Link href="/#apply" style={{ color: 'var(--color-green)', fontWeight: 600, textDecoration: 'none' }}>
                    Apply for membership
                  </Link>
                </p>
                <Link
                  href="/login?type=admin"
                  style={{ fontSize: 13, color: 'var(--color-gray-400)', textDecoration: 'none', fontWeight: 500 }}
                >
                  Executive Committee Login →
                </Link>
              </>
            )}
          </div>
        </div>
      </main>

      <footer style={{ padding: '20px', textAlign: 'center', borderTop: '1px solid var(--color-gray-200)' }}>
        <p style={{ fontSize: 13, color: 'var(--color-gray-400)' }}>
          &copy; {new Date().getFullYear()} Samuel Bete Mutual Iddir
        </p>
      </footer>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
