'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Application {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  status: string
  createdAt: string
  notes: string | null
}

interface AdminApplicationsClientProps {
  applications: Application[]
}

export default function AdminApplicationsClient({ applications: initial }: AdminApplicationsClientProps) {
  const router = useRouter()
  const [applications, setApplications] = useState(initial)
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING')

  const handleAction = async (id: string, action: 'APPROVED' | 'REJECTED') => {
    setLoading(id)
    setError('')
    setSuccess('')
    try {
      const res = await fetch(`/api/admin/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action, notes: notes[id] || '' }),
      })
      if (res.ok) {
        setSuccess(`Application ${action === 'APPROVED' ? 'approved' : 'rejected'}.`)
        router.refresh()
        setApplications((prev) =>
          prev.map((a) => a.id === id ? { ...a, status: action } : a)
        )
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to update application.')
      }
    } catch { setError('An error occurred.') }
    finally { setLoading(null) }
  }

  const filtered = filter === 'ALL' ? applications : applications.filter((a) => a.status === filter)

  return (
    <div>
      {error && <div className="alert-error" style={{ marginBottom: 16 }}>{error}</div>}
      {success && <div className="alert-success" style={{ marginBottom: 16 }}>{success}</div>}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map((f) => (
          <button
            key={f}
            className={`btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(f)}
          >
            {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
            {' '}({f === 'ALL' ? applications.length : applications.filter((a) => a.status === f).length})
          </button>
        ))}
      </div>

      <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-gray-200)' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-gray-400)' }}>
            No applications found.
          </div>
        ) : (
          filtered.map((app) => (
            <div
              key={app.id}
              style={{
                borderBottom: '1px solid var(--color-gray-200)',
                padding: '20px 24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--color-gray-900)' }}>
                      {app.firstName} {app.lastName}
                    </div>
                    <span className={
                      app.status === 'PENDING' ? 'badge-ahead' :
                      app.status === 'APPROVED' ? 'badge-current' :
                      'badge-overdue'
                    }>
                      {app.status.charAt(0) + app.status.slice(1).toLowerCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--color-gray-600)' }}>
                    {app.email} &nbsp;·&nbsp; {app.phone}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-gray-400)', marginTop: 4 }}>
                    Applied: {new Date(app.createdAt).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  {app.notes && (
                    <div style={{ marginTop: 8, fontSize: 13, color: 'var(--color-gray-600)', fontStyle: 'italic' }}>
                      Note: {app.notes}
                    </div>
                  )}
                </div>

                {app.status === 'PENDING' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 200 }}>
                    <button
                      className="btn-sm"
                      style={{ background: 'none', border: 'none', color: 'var(--color-green)', fontWeight: 600, fontSize: 13, cursor: 'pointer', textAlign: 'left', padding: 0 }}
                      onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                    >
                      {expandedId === app.id ? '▲ Hide actions' : '▼ Review application'}
                    </button>
                  </div>
                )}
              </div>

              {expandedId === app.id && app.status === 'PENDING' && (
                <div style={{
                  marginTop: 16,
                  padding: '16px',
                  background: 'var(--color-gray-50)',
                  border: '1px solid var(--color-gray-200)',
                }}>
                  <div style={{ marginBottom: 12 }}>
                    <label className="form-label" htmlFor={`notes-${app.id}`}>Admin Notes (optional)</label>
                    <textarea
                      id={`notes-${app.id}`}
                      rows={2}
                      className="form-input"
                      value={notes[app.id] || ''}
                      onChange={(e) => setNotes((prev) => ({ ...prev, [app.id]: e.target.value }))}
                      placeholder="Add any notes about this decision..."
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      className="btn-primary btn-sm"
                      onClick={() => handleAction(app.id, 'APPROVED')}
                      disabled={loading === app.id}
                    >
                      {loading === app.id ? 'Processing...' : '✓ Approve'}
                    </button>
                    <button
                      className="btn-danger btn-sm"
                      onClick={() => handleAction(app.id, 'REJECTED')}
                      disabled={loading === app.id}
                    >
                      ✕ Reject
                    </button>
                    <button
                      className="btn-secondary btn-sm"
                      onClick={() => setExpandedId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
