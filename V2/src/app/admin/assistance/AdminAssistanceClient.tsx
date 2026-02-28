'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface AssistanceRequest {
  id: string
  memberName: string
  memberEmail: string
  requestType: string
  familyMemberName: string | null
  otherName: string | null
  otherPhone: string | null
  description: string
  status: string
  adminNotes: string | null
  createdAt: string
}

export default function AdminAssistanceClient({ requests: initial }: { requests: AssistanceRequest[] }) {
  const router = useRouter()
  const [requests, setRequests] = useState(initial)
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'REVIEWED'>('PENDING')

  const handleReview = async (id: string, status: 'REVIEWED') => {
    setLoading(id)
    setError('')
    setSuccess('')
    try {
      const res = await fetch(`/api/admin/assistance/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNotes: notes[id] || '' }),
      })
      if (res.ok) {
        setSuccess('Request marked as reviewed.')
        setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status, adminNotes: notes[id] || r.adminNotes } : r))
        setExpandedId(null)
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to update request.')
      }
    } catch { setError('An error occurred.') }
    finally { setLoading(null) }
  }

  const filtered = filter === 'ALL' ? requests : requests.filter((r) => r.status === filter)

  return (
    <div>
      {error && <div className="alert-error" style={{ marginBottom: 16 }}>{error}</div>}
      {success && <div className="alert-success" style={{ marginBottom: 16 }}>{success}</div>}

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['PENDING', 'REVIEWED', 'ALL'] as const).map((f) => (
          <button
            key={f}
            className={`btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(f)}
          >
            {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
            {' '}({f === 'ALL' ? requests.length : requests.filter((r) => r.status === f).length})
          </button>
        ))}
      </div>

      <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-gray-200)' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-gray-400)' }}>
            No requests found.
          </div>
        ) : filtered.map((req) => (
          <div key={req.id} style={{ borderBottom: '1px solid var(--color-gray-200)', padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-gray-900)' }}>
                    {req.memberName}
                  </div>
                  <span className={req.status === 'PENDING' ? 'badge-ahead' : 'badge-current'}>
                    {req.status.charAt(0) + req.status.slice(1).toLowerCase()}
                  </span>
                  <span className={req.requestType === 'SELF' ? 'badge-current' : 'badge-overdue'} style={{ fontSize: 11 }}>
                    {req.requestType === 'SELF' ? 'Self/Family' : 'Other'}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-gray-500)', marginBottom: 6 }}>
                  {req.memberEmail} &nbsp;·&nbsp;
                  {new Date(req.createdAt).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                {req.requestType === 'SELF' && req.familyMemberName && (
                  <div style={{ fontSize: 13, color: 'var(--color-gray-600)', marginBottom: 4 }}>
                    <strong>For:</strong> {req.familyMemberName}
                  </div>
                )}
                {req.requestType === 'OTHER' && (
                  <div style={{ fontSize: 13, color: 'var(--color-gray-600)', marginBottom: 4 }}>
                    <strong>For:</strong> {req.otherName} ({req.otherPhone})
                  </div>
                )}
                <div style={{
                  fontSize: 14,
                  color: 'var(--color-gray-700)',
                  background: 'var(--color-gray-50)',
                  border: '1px solid var(--color-gray-200)',
                  padding: '10px 14px',
                  marginTop: 8,
                  lineHeight: 1.6,
                }}>
                  {req.description}
                </div>
                {req.adminNotes && (
                  <div style={{ marginTop: 8, fontSize: 13, color: 'var(--color-gray-500)', fontStyle: 'italic' }}>
                    Admin note: {req.adminNotes}
                  </div>
                )}
              </div>

              {req.status === 'PENDING' && (
                <button
                  className="btn-secondary btn-sm"
                  onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
                >
                  {expandedId === req.id ? 'Cancel' : 'Review'}
                </button>
              )}
            </div>

            {expandedId === req.id && req.status === 'PENDING' && (
              <div style={{
                marginTop: 16,
                padding: '16px',
                background: 'var(--color-gray-50)',
                border: '1px solid var(--color-gray-200)',
              }}>
                <div style={{ marginBottom: 12 }}>
                  <label className="form-label" htmlFor={`notes-${req.id}`}>Admin Notes</label>
                  <textarea
                    id={`notes-${req.id}`}
                    rows={2}
                    className="form-input"
                    value={notes[req.id] || ''}
                    onChange={(e) => setNotes((prev) => ({ ...prev, [req.id]: e.target.value }))}
                    placeholder="Add notes about the action taken..."
                    style={{ resize: 'vertical' }}
                  />
                </div>
                <button
                  className="btn-primary btn-sm"
                  onClick={() => handleReview(req.id, 'REVIEWED')}
                  disabled={loading === req.id}
                >
                  {loading === req.id ? 'Saving...' : 'Mark as Reviewed'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
