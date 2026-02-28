'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface FamilyMember {
  id: string
  fullName: string
  isActive: boolean
}

interface PastRequest {
  id: string
  requestType: string
  familyMemberName: string | null
  otherName: string | null
  description: string
  createdAt: string
}

interface AssistanceClientProps {
  familyMembers: FamilyMember[]
  pastRequests: PastRequest[]
}

type AssistanceFor = 'MYSELF' | 'FAMILY_MEMBER'

export default function AssistanceClient({ familyMembers, pastRequests }: AssistanceClientProps) {
  const router = useRouter()
  const [assistanceFor, setAssistanceFor] = useState<AssistanceFor>('MYSELF')
  const [familyMemberId, setFamilyMemberId] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const validate = () => {
    const errs: Record<string, string> = {}
    if (assistanceFor === 'FAMILY_MEMBER' && !familyMemberId) {
      errs.familyMemberId = 'Please select a family member.'
    }
    if (!description.trim()) errs.description = 'Please describe the situation.'
    return errs
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setLoading(true)
    setSubmitError('')
    try {
      const res = await fetch('/api/assistance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestType: 'SELF',
          familyMemberId: assistanceFor === 'FAMILY_MEMBER' ? familyMemberId : undefined,
          description,
        }),
      })
      if (res.ok) {
        setSubmitted(true)
        router.refresh()
      } else {
        const data = await res.json()
        setSubmitError(data.error || 'Failed to submit request.')
      }
    } catch {
      setSubmitError('An error occurred.')
    } finally {
      setLoading(false)
    }
  }

  const options: { value: AssistanceFor; label: string; sublabel: string }[] = [
    { value: 'MYSELF', label: 'Myself', sublabel: 'The member is the deceased' },
    { value: 'FAMILY_MEMBER', label: 'Family Member', sublabel: 'A registered spouse or child' },
  ]

  return (
    <div>
      {/* New Request Form */}
      <div style={{
        background: 'var(--color-white)',
        border: '1px solid var(--color-gray-200)',
        padding: '32px',
        marginBottom: 32,
      }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 8 }}>
          Submit Assistance Request
        </h2>
        <p style={{ color: 'var(--color-gray-500)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
          Use this form to request bereavement assistance from SBMI. Your request will be
          sent to the SBMI administration for review.
        </p>

        {submitted ? (
          <div className="alert-success">
            <strong>Request submitted.</strong> Your assistance request has been sent to the SBMI administration.
            They will be in touch with you shortly.
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {submitError && <div className="alert-error" style={{ marginBottom: 20 }}>{submitError}</div>}

            {/* Assistance For — two clear options */}
            <div style={{ marginBottom: 24 }}>
              <label className="form-label">Assistance For</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {options.map((opt) => {
                  const selected = assistanceFor === opt.value
                  return (
                    <label
                      key={opt.value}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 12,
                        padding: '14px 16px',
                        border: `2px solid ${selected ? 'var(--color-green)' : 'var(--color-gray-200)'}`,
                        background: selected ? 'var(--color-green-pale)' : 'var(--color-white)',
                        cursor: 'pointer',
                        borderRadius: 2,
                        transition: 'border-color 0.15s, background 0.15s',
                      }}
                    >
                      <input
                        type="radio"
                        name="assistanceFor"
                        value={opt.value}
                        checked={selected}
                        onChange={() => {
                          setAssistanceFor(opt.value)
                          setFamilyMemberId('')
                          setErrors({})
                        }}
                        style={{ accentColor: 'var(--color-green)', marginTop: 2, flexShrink: 0 }}
                      />
                      <div>
                        <div style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: selected ? 'var(--color-green)' : 'var(--color-gray-800)',
                          marginBottom: 2,
                        }}>
                          {opt.label}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--color-gray-500)' }}>
                          {opt.sublabel}
                        </div>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Family Member dropdown — only shown when Family Member is selected */}
            {assistanceFor === 'FAMILY_MEMBER' && (
              <div style={{ marginBottom: 20 }}>
                <label className="form-label" htmlFor="familyMember">Select Family Member</label>
                {familyMembers.length === 0 ? (
                  <div className="alert-info">
                    No active family members on file. You can add them in the{' '}
                    <a href="/member/family" style={{ color: 'var(--color-green)', fontWeight: 600 }}>Family Members</a> section.
                  </div>
                ) : (
                  <select
                    id="familyMember"
                    className={`form-input${errors.familyMemberId ? ' error' : ''}`}
                    value={familyMemberId}
                    onChange={(e) => setFamilyMemberId(e.target.value)}
                  >
                    <option value="">Select a family member...</option>
                    {familyMembers.map((m) => (
                      <option key={m.id} value={m.id}>{m.fullName}</option>
                    ))}
                  </select>
                )}
                {errors.familyMemberId && <p className="error-message">{errors.familyMemberId}</p>}
              </div>
            )}

            {/* Description */}
            <div style={{ marginBottom: 24 }}>
              <label className="form-label" htmlFor="description">
                Description <span style={{ color: 'var(--color-red)' }}>*</span>
              </label>
              <textarea
                id="description"
                rows={5}
                className={`form-input${errors.description ? ' error' : ''}`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe the situation and what assistance is needed..."
                style={{ resize: 'vertical' }}
              />
              {errors.description && <p className="error-message">{errors.description}</p>}
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ minWidth: 180 }}
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        )}
      </div>

      {/* Past Requests */}
      {pastRequests.length > 0 && (
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 16 }}>
            Past Requests
          </h3>
          <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-gray-200)' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>For</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {pastRequests.map((r) => (
                  <tr key={r.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {new Date(r.createdAt).toLocaleDateString('en-CA')}
                    </td>
                    <td>
                      {r.familyMemberName
                        ? r.familyMemberName
                        : <span style={{ color: 'var(--color-gray-500)', fontStyle: 'italic' }}>Myself</span>}
                    </td>
                    <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
