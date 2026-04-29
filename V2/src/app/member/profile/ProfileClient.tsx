'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ProfileClientProps {
  user: {
    firstName: string
    lastName: string
    email: string
    membershipStartDate: string | null
  }
}

export default function ProfileClient({ user }: ProfileClientProps) {
  const router = useRouter()

  // Name section
  const [firstName, setFirstName] = useState(user.firstName)
  const [lastName, setLastName] = useState(user.lastName)
  const [nameErrors, setNameErrors] = useState<{ firstName?: string; lastName?: string }>({})
  const [nameSaving, setNameSaving] = useState(false)
  const [nameSuccess, setNameSuccess] = useState(false)
  const [nameError, setNameError] = useState('')

  // Email section
  const [newEmail, setNewEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [emailSaving, setEmailSaving] = useState(false)
  const [emailSuccess, setEmailSuccess] = useState(false)
  const [emailSubmitError, setEmailSubmitError] = useState('')

  // Password section
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordErrors, setPasswordErrors] = useState<{ current?: string; new?: string; confirm?: string }>({})
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordSubmitError, setPasswordSubmitError] = useState('')

  const handleNameSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: { firstName?: string; lastName?: string } = {}
    if (!firstName.trim()) errs.firstName = 'First name is required.'
    if (!lastName.trim()) errs.lastName = 'Last name is required.'
    if (Object.keys(errs).length > 0) { setNameErrors(errs); return }

    setNameSaving(true)
    setNameError('')
    setNameSuccess(false)
    try {
      const res = await fetch('/api/profile/name', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: firstName.trim(), lastName: lastName.trim() }),
      })
      if (res.ok) {
        setNameSuccess(true)
        router.refresh()
      } else {
        const data = await res.json()
        setNameError(data.error || 'Failed to update name.')
      }
    } catch {
      setNameError('An error occurred.')
    } finally {
      setNameSaving(false)
    }
  }

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEmail.trim()) { setEmailError('Email address is required.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) { setEmailError('Please enter a valid email address.'); return }
    if (newEmail.toLowerCase() === user.email.toLowerCase()) { setEmailError('This is already your current email address.'); return }

    setEmailSaving(true)
    setEmailSubmitError('')
    setEmailSuccess(false)
    try {
      const res = await fetch('/api/profile/email', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail.trim().toLowerCase() }),
      })
      if (res.ok) {
        setEmailSuccess(true)
        setNewEmail('')
      } else {
        const data = await res.json()
        setEmailSubmitError(data.error || 'Failed to initiate email change.')
      }
    } catch {
      setEmailSubmitError('An error occurred.')
    } finally {
      setEmailSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: { current?: string; new?: string; confirm?: string } = {}
    if (!currentPassword) errs.current = 'Current password is required.'
    if (!newPassword) errs.new = 'New password is required.'
    else if (newPassword.length < 8) errs.new = 'Password must be at least 8 characters.'
    if (!confirmPassword) errs.confirm = 'Please confirm your new password.'
    else if (newPassword !== confirmPassword) errs.confirm = 'Passwords do not match.'
    if (Object.keys(errs).length > 0) { setPasswordErrors(errs); return }

    setPasswordSaving(true)
    setPasswordSubmitError('')
    setPasswordSuccess(false)
    try {
      const res = await fetch('/api/profile/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      if (res.ok) {
        setPasswordSuccess(true)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setPasswordErrors({})
      } else {
        const data = await res.json()
        setPasswordSubmitError(data.error || 'Failed to change password.')
      }
    } catch {
      setPasswordSubmitError('An error occurred.')
    } finally {
      setPasswordSaving(false)
    }
  }

  const memberSince = user.membershipStartDate
    ? new Date(user.membershipStartDate).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A'

  return (
    <div>
      {/* Member info */}
      <div style={{
        background: 'var(--color-white)',
        border: '1px solid var(--color-gray-200)',
        padding: '24px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        <div style={{
          width: 56, height: 56,
          background: 'var(--color-green)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: 700, fontSize: 20,
          flexShrink: 0,
        }}>
          {user.firstName[0]}{user.lastName[0]}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--color-gray-900)' }}>
            {user.firstName} {user.lastName}
          </div>
          <div style={{ fontSize: 14, color: 'var(--color-gray-500)', marginTop: 2 }}>
            {user.email}
          </div>
          <div style={{ fontSize: 13, color: 'var(--color-gray-400)', marginTop: 2 }}>
            Member since {memberSince}
          </div>
        </div>
      </div>

      {/* Update Name */}
      <div style={{
        background: 'var(--color-white)',
        border: '1px solid var(--color-gray-200)',
        padding: '28px',
        marginBottom: 16,
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 20 }}>
          Update Name
        </h3>
        {nameError && <div className="alert-error" style={{ marginBottom: 16 }}>{nameError}</div>}
        {nameSuccess && <div className="alert-success" style={{ marginBottom: 16 }}>Name updated successfully.</div>}
        <form onSubmit={handleNameSave} noValidate>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <label className="form-label" htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                type="text"
                className={`form-input${nameErrors.firstName ? ' error' : ''}`}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              {nameErrors.firstName && <p className="error-message">{nameErrors.firstName}</p>}
            </div>
            <div>
              <label className="form-label" htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                type="text"
                className={`form-input${nameErrors.lastName ? ' error' : ''}`}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              {nameErrors.lastName && <p className="error-message">{nameErrors.lastName}</p>}
            </div>
          </div>
          <button type="submit" className="btn-primary btn-sm" disabled={nameSaving}>
            {nameSaving ? 'Saving...' : 'Save Name'}
          </button>
        </form>
      </div>

      {/* Change Email */}
      <div style={{
        background: 'var(--color-white)',
        border: '1px solid var(--color-gray-200)',
        padding: '28px',
        marginBottom: 16,
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 8 }}>
          Change Email Address
        </h3>
        <p style={{ fontSize: 13, color: 'var(--color-gray-500)', marginBottom: 20 }}>
          Current email: <strong>{user.email}</strong>
        </p>
        {emailSubmitError && <div className="alert-error" style={{ marginBottom: 16 }}>{emailSubmitError}</div>}
        {emailSuccess && (
          <div className="alert-success" style={{ marginBottom: 16 }}>
            A confirmation email has been sent to your current email address. Please click the link in that email to confirm the change to your new address.
          </div>
        )}
        <form onSubmit={handleEmailChange} noValidate>
          <div style={{ marginBottom: 20 }}>
            <label className="form-label" htmlFor="newEmail">New Email Address</label>
            <input
              id="newEmail"
              type="email"
              className={`form-input${emailError ? ' error' : ''}`}
              value={newEmail}
              onChange={(e) => { setNewEmail(e.target.value); setEmailError('') }}
              maxLength={50}
            />
            {emailError && <p className="error-message">{emailError}</p>}
          </div>
          <button type="submit" className="btn-primary btn-sm" disabled={emailSaving}>
            {emailSaving ? 'Sending...' : 'Request Email Change'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div style={{
        background: 'var(--color-white)',
        border: '1px solid var(--color-gray-200)',
        padding: '28px',
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 20 }}>
          Change Password
        </h3>
        {passwordSubmitError && <div className="alert-error" style={{ marginBottom: 16 }}>{passwordSubmitError}</div>}
        {passwordSuccess && <div className="alert-success" style={{ marginBottom: 16 }}>Password changed successfully.</div>}
        <form onSubmit={handlePasswordChange} noValidate>
          <div style={{ marginBottom: 16 }}>
            <label className="form-label" htmlFor="currentPassword">Current Password</label>
            <input
              id="currentPassword"
              type="password"
              className={`form-input${passwordErrors.current ? ' error' : ''}`}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
            {passwordErrors.current && <p className="error-message">{passwordErrors.current}</p>}
          </div>
          <div style={{ marginBottom: 16 }}>
            <label className="form-label" htmlFor="newPassword">New Password</label>
            <input
              id="newPassword"
              type="password"
              className={`form-input${passwordErrors.new ? ' error' : ''}`}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
            {passwordErrors.new && <p className="error-message">{passwordErrors.new}</p>}
            <p style={{ fontSize: 12, color: 'var(--color-gray-500)', marginTop: 4 }}>Minimum 8 characters</p>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label className="form-label" htmlFor="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              type="password"
              className={`form-input${passwordErrors.confirm ? ' error' : ''}`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
            {passwordErrors.confirm && <p className="error-message">{passwordErrors.confirm}</p>}
          </div>
          <button type="submit" className="btn-primary btn-sm" disabled={passwordSaving}>
            {passwordSaving ? 'Saving...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
