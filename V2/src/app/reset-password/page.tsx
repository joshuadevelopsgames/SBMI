'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({})
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const validate = () => {
    const errs: { password?: string; confirm?: string } = {}
    if (!password) {
      errs.password = 'Password is required.'
    } else if (password.length < 8) {
      errs.password = 'Password must be at least 8 characters.'
    }
    if (!confirmPassword) {
      errs.confirm = 'Please confirm your password.'
    } else if (password !== confirmPassword) {
      errs.confirm = 'Passwords do not match.'
    }
    return errs
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setLoading(true)
    setSubmitError('')

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await res.json()

      if (res.ok) {
        router.push('/login?message=password-changed')
      } else {
        setSubmitError(data.error || 'Failed to reset password. The link may be invalid.')
      }
    } catch {
      setSubmitError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div className="alert-error">
          Invalid or missing reset token. Please request a new password reset.
        </div>
        <Link href="/forgot-password" className="btn-primary" style={{ display: 'inline-flex', marginTop: 20 }}>
          Request Password Reset
        </Link>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      style={{
        background: 'var(--color-white)',
        border: '1px solid var(--color-gray-200)',
        padding: '36px',
      }}
    >
      {submitError && (
        <div className="alert-error" style={{ marginBottom: 24 }}>{submitError}</div>
      )}

      <div style={{ marginBottom: 20 }}>
        <label className="form-label" htmlFor="password">
          New Password
        </label>
        <input
          id="password"
          type="password"
          className={`form-input${errors.password ? ' error' : ''}`}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          autoFocus
        />
        {errors.password && <p className="error-message">{errors.password}</p>}
        <p style={{ fontSize: 12, color: 'var(--color-gray-500)', marginTop: 4 }}>
          Minimum 8 characters
        </p>
      </div>

      <div style={{ marginBottom: 28 }}>
        <label className="form-label" htmlFor="confirmPassword">
          Confirm New Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          className={`form-input${errors.confirm ? ' error' : ''}`}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
        />
        {errors.confirm && <p className="error-message">{errors.confirm}</p>}
      </div>

      <button
        type="submit"
        className="btn-primary"
        disabled={loading}
        style={{ width: '100%', padding: '14px', fontSize: 16 }}
      >
        {loading ? 'Saving...' : 'Set New Password'}
      </button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-gray-50)', display: 'flex', flexDirection: 'column' }}>
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
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 28, fontWeight: 700,
              color: 'var(--color-gray-900)', marginBottom: 8,
            }}>
              Set New Password
            </h1>
            <p style={{ color: 'var(--color-gray-500)', fontSize: 15 }}>
              Choose a new password for your account
            </p>
          </div>

          <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>

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
