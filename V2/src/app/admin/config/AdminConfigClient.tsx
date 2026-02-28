'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface AdminConfigClientProps {
  config: {
    monthlyContributionCents: number
    penaltyAmountCents: number
    bylawsPdfUrl: string
    adminEmail: string
    welcomeMessage: string
  }
}

export default function AdminConfigClient({ config: initial }: AdminConfigClientProps) {
  const router = useRouter()
  const [monthlyAmount, setMonthlyAmount] = useState((initial.monthlyContributionCents / 100).toFixed(2))
  const [penaltyAmount, setPenaltyAmount] = useState((initial.penaltyAmountCents / 100).toFixed(2))
  const [bylawsUrl, setBylawsUrl] = useState(initial.bylawsPdfUrl)
  const [adminEmail, setAdminEmail] = useState(initial.adminEmail)
  const [welcomeMessage, setWelcomeMessage] = useState(initial.welcomeMessage)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!monthlyAmount || isNaN(Number(monthlyAmount)) || Number(monthlyAmount) <= 0) {
      setError('Monthly contribution must be a positive number.')
      return
    }
    if (!penaltyAmount || isNaN(Number(penaltyAmount)) || Number(penaltyAmount) <= 0) {
      setError('Penalty amount must be a positive number.')
      return
    }
    if (!bylawsUrl.trim()) {
      setError('Bylaws PDF URL is required.')
      return
    }
    if (!adminEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) {
      setError('A valid admin email is required.')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthlyContributionCents: Math.round(Number(monthlyAmount) * 100),
          penaltyAmountCents: Math.round(Number(penaltyAmount) * 100),
          bylawsPdfUrl: bylawsUrl.trim(),
          adminEmail: adminEmail.trim().toLowerCase(),
          welcomeMessage: welcomeMessage.trim(),
        }),
      })
      if (res.ok) {
        setSuccess('Configuration saved successfully.')
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to save configuration.')
      }
    } catch { setError('An error occurred.') }
    finally { setSaving(false) }
  }

  return (
    <div style={{ maxWidth: 640 }}>
      {error && <div className="alert-error" style={{ marginBottom: 16 }}>{error}</div>}
      {success && <div className="alert-success" style={{ marginBottom: 16 }}>{success}</div>}

      <div className="alert-info" style={{ marginBottom: 24 }}>
        <strong>Important:</strong> Changes to the monthly contribution amount will only affect new payments.
        Existing recurring subscriptions will continue at the original amount until renewed.
      </div>

      <form onSubmit={handleSave} noValidate>
        {/* Financial settings */}
        <div style={{
          background: 'var(--color-white)',
          border: '1px solid var(--color-gray-200)',
          padding: '28px',
          marginBottom: 16,
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 20 }}>
            Financial Settings
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <label className="form-label" htmlFor="monthlyAmount">Monthly Contribution ($)</label>
              <input
                id="monthlyAmount"
                type="number"
                min="0.01"
                step="0.01"
                className="form-input"
                value={monthlyAmount}
                onChange={(e) => setMonthlyAmount(e.target.value)}
              />
              <p style={{ fontSize: 12, color: 'var(--color-gray-400)', marginTop: 4 }}>
                Current: ${(initial.monthlyContributionCents / 100).toFixed(2)}/month
              </p>
            </div>
            <div>
              <label className="form-label" htmlFor="penaltyAmount">Late Payment Penalty ($)</label>
              <input
                id="penaltyAmount"
                type="number"
                min="0.01"
                step="0.01"
                className="form-input"
                value={penaltyAmount}
                onChange={(e) => setPenaltyAmount(e.target.value)}
              />
              <p style={{ fontSize: 12, color: 'var(--color-gray-400)', marginTop: 4 }}>
                Applied when recurring payment fails
              </p>
            </div>
          </div>
        </div>

        {/* Organization settings */}
        <div style={{
          background: 'var(--color-white)',
          border: '1px solid var(--color-gray-200)',
          padding: '28px',
          marginBottom: 16,
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 20 }}>
            Organization Settings
          </h3>
          <div style={{ marginBottom: 16 }}>
            <label className="form-label" htmlFor="adminEmail">Admin Email</label>
            <input
              id="adminEmail"
              type="email"
              className="form-input"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
            />
            <p style={{ fontSize: 12, color: 'var(--color-gray-400)', marginTop: 4 }}>
              Receives notifications for new applications and assistance requests
            </p>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label className="form-label" htmlFor="bylawsUrl">Bylaws PDF URL</label>
            <input
              id="bylawsUrl"
              type="url"
              className="form-input"
              value={bylawsUrl}
              onChange={(e) => setBylawsUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="form-label" htmlFor="welcomeMessage">Welcome Page Message (optional)</label>
            <textarea
              id="welcomeMessage"
              rows={4}
              className="form-input"
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              placeholder="A message to display on the welcome page..."
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary"
          disabled={saving}
          style={{ minWidth: 180 }}
        >
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </form>
    </div>
  )
}
