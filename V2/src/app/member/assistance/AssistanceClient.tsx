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

export default function AssistanceClient({ familyMembers, pastRequests }: AssistanceClientProps) {
  const router = useRouter()
  const [requestType, setRequestType] = useState<'SELF' | 'OTHER'>('SELF')
  const [familyMemberId, setFamilyMemberId] = useState('')
  const [otherName, setOtherName] = useState('')
  const [otherPhone, setOtherPhone] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const validate = () => {
    const errs: Record<string, string> = {}
    if (requestType === 'SELF' && !familyMemberId) {
      errs.familyMemberId = 'Please select a family member.'
    }
    if (requestType === 'OTHER') {
      if (!otherName.trim()) errs.otherName = 'Name is required.'
      if (!otherPhone.trim()) errs.otherPhone = 'Phone number is required.'
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
          requestType,
          familyMemberId: requestType === 'SELF' ? familyMemberId : undefined,
          otherName: requestType === 'OTHER' ? otherName : undefined,
          otherPhone: requestType === 'OTHER' ? otherPhone : undefined,
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

  return (
    <div>
      {/* New Request Form */}
      <div style={{
        background: 'var(--color-white)',
        border: '1px solid var(--color-gray-200)',
        padding: '32px',
        marginBottom: 32,
        maxWidth: 640,
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

            {/* Request type */}
            <div style={{ marginBottom: 24 }}>
              <label className="form-label">Assistance For</label>
              <div style={{ display: 'flex', gap: 12 }}>
                <label style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '12px 16px',
                  border: `2px solid ${requestType === 'SELF' ? 'var(--color-green)' : 'var(--color-gray-200)'}`,
                  background: requestType === 'SELF' ? 'var(--color-green-pale)' : 'var(--color-white)',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: requestType === 'SELF' ? 600 : 400,
                  color: requestType === 'SELF' ? 'var(--color-green)' : 'var(--color-gray-700)',
                }}>
                  <input
                    type="radio"
                    name="requestType"
                    value="SELF"
                    checked={requestType === 'SELF'}
                    onChange={() => setRequestType('SELF')}
                    style={{ accentColor: 'var(--color-green)' }}
                  />
                  Myself / Family Member
                </label>
                <label style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '12px 16px',
                  border: `2px solid ${requestType === 'OTHER' ? 'var(--color-green)' : 'var(--color-gray-200)'}`,
                  background: requestType === 'OTHER' ? 'var(--color-green-pale)' : 'var(--color-white)',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: requestType === 'OTHER' ? 600 : 400,
                  color: requestType === 'OTHER' ? 'var(--color-green)' : 'var(--color-gray-700)',
                }}>
                  <input
                    type="radio"
                    name="requestType"
                    value="OTHER"
                    checked={requestType === 'OTHER'}
                    onChange={() => setRequestType('OTHER')}
                    style={{ accentColor: 'var(--color-green)' }}
                  />
                  Someone Else
                </label>
              </div>
            </div>

            {/* SELF: family member selector */}
            {requestType === 'SELF' && (
              <div style={{ marginBottom: 20 }}>
                <label className="form-label" htmlFor="familyMember">Family Member</label>
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

            {/* OTHER: name and phone */}
            {requestType === 'OTHER' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <label className="form-label" htmlFor="otherName">Full Name</label>
                  <input
                    id="otherName"
                    type="text"
                    className={`form-input${errors.otherName ? ' error' : ''}`}
                    value={otherName}
                    onChange={(e) => setOtherName(e.target.value)}
                  />
                  {errors.otherName && <p className="error-message">{errors.otherName}</p>}
                </div>
                <div>
                  <label className="form-label" htmlFor="otherPhone">Phone Number</label>
                  <input
                    id="otherPhone"
                    type="tel"
                    className={`form-input${errors.otherPhone ? ' error' : ''}`}
                    value={otherPhone}
                    onChange={(e) => setOtherPhone(e.target.value)}
                  />
                  {errors.otherPhone && <p className="error-message">{errors.otherPhone}</p>}
                </div>
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
                  <th>Type</th>
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
                      <span className={r.requestType === 'SELF' ? 'badge-current' : 'badge-ahead'}>
                        {r.requestType === 'SELF' ? 'Self/Family' : 'Other'}
                      </span>
                    </td>
                    <td>
                      {r.requestType === 'SELF'
                        ? r.familyMemberName || 'Self'
                        : r.otherName || '—'}
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
