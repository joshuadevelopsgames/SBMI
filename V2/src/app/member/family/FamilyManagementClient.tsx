'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface FamilyMemberData {
  id: string
  fullName: string
  birthDate: string
  isActive: boolean
  ageYears: number
}

interface FamilyManagementClientProps {
  members: FamilyMemberData[]
}

export default function FamilyManagementClient({ members: initialMembers }: FamilyManagementClientProps) {
  const router = useRouter()
  const [members, setMembers] = useState(initialMembers)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ fullName: '', birthDate: '' })
  const [formErrors, setFormErrors] = useState<{ fullName?: string; birthDate?: string }>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const validate = () => {
    const errs: { fullName?: string; birthDate?: string } = {}
    if (!formData.fullName.trim()) errs.fullName = 'Full name is required.'
    if (!formData.birthDate) {
      errs.birthDate = 'Date of birth is required.'
    } else {
      const birth = new Date(formData.birthDate)
      const now = new Date()
      if (birth > now) errs.birthDate = 'Date of birth cannot be in the future.'
    }
    return errs
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return }

    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/family', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        router.refresh()
        setShowAddForm(false)
        setFormData({ fullName: '', birthDate: '' })
        setFormErrors({})
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to add family member.')
      }
    } catch {
      setError('An error occurred.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async (id: string) => {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return }

    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/family/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        router.refresh()
        setEditingId(null)
        setFormData({ fullName: '', birthDate: '' })
        setFormErrors({})
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to update family member.')
      }
    } catch {
      setError('An error occurred.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/family/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setMembers((prev) => prev.filter((m) => m.id !== id))
        setDeletingId(null)
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to remove family member.')
      }
    } catch {
      setError('An error occurred.')
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (member: FamilyMemberData) => {
    setEditingId(member.id)
    setFormData({ fullName: member.fullName, birthDate: member.birthDate })
    setFormErrors({})
    setShowAddForm(false)
  }

  return (
    <div>
      {/* Info banner */}
      <div className="alert-info" style={{ marginBottom: 24 }}>
        <strong>Coverage Note:</strong> Family members under 25 years of age are covered under your membership.
        Members who have reached age 25 remain on record but are shown as inactive (greyed out).
      </div>

      {error && <div className="alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      {/* Members list */}
      {members.length === 0 ? (
        <div style={{
          background: 'var(--color-white)',
          border: '1px solid var(--color-gray-200)',
          padding: '48px',
          textAlign: 'center',
          marginBottom: 24,
        }}>
          <div style={{
            width: 56, height: 56,
            background: 'var(--color-gray-100)',
            margin: '0 auto 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg viewBox="0 0 24 24" width="28" height="28" fill="var(--color-gray-400)">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
          </div>
          <p style={{ color: 'var(--color-gray-500)', fontSize: 15 }}>
            No family members registered yet.
          </p>
        </div>
      ) : (
        <div style={{ marginBottom: 24 }}>
          {members.map((member) => (
            <div
              key={member.id}
              className={member.isActive ? '' : 'family-member-inactive'}
              style={{
                background: 'var(--color-white)',
                border: '1px solid var(--color-gray-200)',
                padding: '20px 24px',
                marginBottom: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
              }}
            >
              {editingId === member.id ? (
                <form
                  onSubmit={(e) => { e.preventDefault(); handleEdit(member.id) }}
                  style={{ flex: 1, display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}
                >
                  <div style={{ flex: 2, minWidth: 180 }}>
                    <label className="form-label" htmlFor={`edit-name-${member.id}`}>Full Name</label>
                    <input
                      id={`edit-name-${member.id}`}
                      type="text"
                      className={`form-input${formErrors.fullName ? ' error' : ''}`}
                      value={formData.fullName}
                      onChange={(e) => setFormData((p) => ({ ...p, fullName: e.target.value }))}
                    />
                    {formErrors.fullName && <p className="error-message">{formErrors.fullName}</p>}
                  </div>
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <label className="form-label" htmlFor={`edit-dob-${member.id}`}>Date of Birth</label>
                    <input
                      id={`edit-dob-${member.id}`}
                      type="date"
                      className={`form-input${formErrors.birthDate ? ' error' : ''}`}
                      value={formData.birthDate}
                      onChange={(e) => setFormData((p) => ({ ...p, birthDate: e.target.value }))}
                    />
                    {formErrors.birthDate && <p className="error-message">{formErrors.birthDate}</p>}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="submit" className="btn-primary btn-sm" disabled={loading}>Save</button>
                    <button type="button" className="btn-secondary btn-sm" onClick={() => { setEditingId(null); setFormErrors({}) }}>Cancel</button>
                  </div>
                </form>
              ) : (
                <>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 36, height: 36,
                        background: member.isActive ? 'var(--color-green-pale)' : 'var(--color-gray-100)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: member.isActive ? 'var(--color-green)' : 'var(--color-gray-400)',
                        fontWeight: 700, fontSize: 14,
                      }}>
                        {member.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--color-gray-900)' }}>
                          {member.fullName}
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--color-gray-500)' }}>
                          Born: {new Date(member.birthDate).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}
                          &nbsp;·&nbsp; Age: {member.ageYears}
                        </div>
                        {!member.isActive && (
                          <div className="family-member-inactive-note">
                            Coverage inactive — member has reached age 25
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {member.isActive && (
                      <span className="badge-current">Active</span>
                    )}
                    <button
                      className="btn-secondary btn-sm"
                      onClick={() => startEdit(member)}
                    >
                      Edit
                    </button>
                    {deletingId === member.id ? (
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span style={{ fontSize: 13, color: 'var(--color-red)' }}>Remove?</span>
                        <button
                          className="btn-danger btn-sm"
                          onClick={() => handleDelete(member.id)}
                          disabled={loading}
                        >
                          Yes
                        </button>
                        <button
                          className="btn-secondary btn-sm"
                          onClick={() => setDeletingId(null)}
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        className="btn-secondary btn-sm"
                        style={{ borderColor: 'var(--color-red)', color: 'var(--color-red)' }}
                        onClick={() => setDeletingId(member.id)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add family member */}
      {showAddForm ? (
        <div style={{
          background: 'var(--color-white)',
          border: '1px solid var(--color-green)',
          padding: '24px',
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 20 }}>
            Add Family Member
          </h3>
          <form onSubmit={handleAdd} noValidate>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              <div>
                <label className="form-label" htmlFor="add-name">Full Name</label>
                <input
                  id="add-name"
                  type="text"
                  className={`form-input${formErrors.fullName ? ' error' : ''}`}
                  value={formData.fullName}
                  onChange={(e) => setFormData((p) => ({ ...p, fullName: e.target.value }))}
                  autoFocus
                />
                {formErrors.fullName && <p className="error-message">{formErrors.fullName}</p>}
              </div>
              <div>
                <label className="form-label" htmlFor="add-dob">Date of Birth</label>
                <input
                  id="add-dob"
                  type="date"
                  className={`form-input${formErrors.birthDate ? ' error' : ''}`}
                  value={formData.birthDate}
                  onChange={(e) => setFormData((p) => ({ ...p, birthDate: e.target.value }))}
                />
                {formErrors.birthDate && <p className="error-message">{formErrors.birthDate}</p>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Adding...' : 'Add Family Member'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => { setShowAddForm(false); setFormData({ fullName: '', birthDate: '' }); setFormErrors({}) }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          className="btn-secondary"
          onClick={() => { setShowAddForm(true); setEditingId(null); setFormErrors({}) }}
        >
          + Add Family Member
        </button>
      )}
    </div>
  )
}
