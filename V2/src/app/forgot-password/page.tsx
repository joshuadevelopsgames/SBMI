'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

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
    if (emailError || !email) return

    setLoading(true)
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      // Always show same message regardless of whether email exists
      setSubmitted(true)
    } catch {
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-gray-50)', display: 'flex', flexDirection: 'column' }}>
      <header style={{ background: 'var(--color-white)', borderBottom: '1px solid var(--color-gray-200)' }}>
        <div className="flag-bar" />
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
              Reset Password
            </h1>
            <p style={{ color: 'var(--color-gray-500)', fontSize: 15 }}>
              Enter your email address to receive reset instructions
            </p>
          </div>

          {submitted ? (
            <div style={{
              background: 'var(--color-white)',
              border: '1px solid var(--color-gray-200)',
              padding: '36px',
              textAlign: 'center',
            }}>
              <div style={{
                width: 56, height: 56, background: 'var(--color-green)',
                margin: '0 auto 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg viewBox="0 0 24 24" width="28" height="28" fill="white">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 16 }}>
                Check Your Email
              </h2>
              <p style={{ color: 'var(--color-gray-600)', fontSize: 15, lineHeight: 1.7, marginBottom: 16 }}>
                If an account exists for the email address you entered, you will receive
                password reset instructions shortly.
              </p>
              <p style={{ color: 'var(--color-gray-500)', fontSize: 14, lineHeight: 1.7 }}>
                Email delivery may take a few minutes. Please check your spam or junk folder
                if you do not see the message in your inbox.
              </p>
              <div style={{ marginTop: 28 }}>
                <Link href="/login" className="btn-secondary" style={{ display: 'inline-flex' }}>
                  Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              noValidate
              style={{
                background: 'var(--color-white)',
                border: '1px solid var(--color-gray-200)',
                padding: '36px',
              }}
            >
              <div style={{ marginBottom: 24 }}>
                <label className="form-label" htmlFor="email">
                  Email Address
                </label>
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

              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{ width: '100%', padding: '14px', fontSize: 16 }}
              >
                {loading ? 'Sending...' : 'Send Reset Instructions'}
              </button>
            </form>
          )}

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
