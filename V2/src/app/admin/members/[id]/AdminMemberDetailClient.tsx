'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface AdminMemberDetailClientProps {
  member: {
    id: string
    firstName: string
    lastName: string
    email: string
    status: string
    role: string
    membershipStartDate: string | null
    isOverdue: boolean
    recurringActive: boolean
    paidThroughDate: string | null
    familyMembers: { id: string; fullName: string; birthDate: string }[]
    payments: { id: string; amount: number; paymentDate: string; status: string; paymentType: string; receiptUrl: string | null }[]
    penalties: { id: string; amount: number; reason: string; createdAt: string; paidAt: string | null }[]
    assistanceRequests: { id: string; requestType: string; familyMemberName: string | null; otherName: string | null; description: string; status: string; createdAt: string }[]
  }
}

function fmt(cents: number) { return `$${(cents / 100).toFixed(2)}` }
function fmtDate(iso: string) { return new Date(iso).toLocaleDateString('en-CA') }

export default function AdminMemberDetailClient({ member }: AdminMemberDetailClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [manualAmount, setManualAmount] = useState('')
  const [penaltyReason, setPenaltyReason] = useState('')
  const [penaltyAmount, setPenaltyAmount] = useState('')
  const [waiveId, setWaiveId] = useState<string | null>(null)

  const handleManualPayment = async () => {
    if (!manualAmount || isNaN(Number(manualAmount)) || Number(manualAmount) <= 0) {
      setError('Please enter a valid amount.')
      return
    }
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch(`/api/admin/members/${member.id}/manual-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountDollars: Number(manualAmount) }),
      })
      if (res.ok) {
        setSuccess('Manual payment recorded.')
        setManualAmount('')
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to record payment.')
      }
    } catch { setError('An error occurred.') }
    finally { setLoading(false) }
  }

  const handleAddPenalty = async () => {
    if (!penaltyAmount || isNaN(Number(penaltyAmount)) || Number(penaltyAmount) <= 0) {
      setError('Please enter a valid penalty amount.')
      return
    }
    if (!penaltyReason.trim()) {
      setError('Please enter a reason for the penalty.')
      return
    }
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch(`/api/admin/members/${member.id}/penalty`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountDollars: Number(penaltyAmount), reason: penaltyReason }),
      })
      if (res.ok) {
        setSuccess('Penalty applied.')
        setPenaltyAmount('')
        setPenaltyReason('')
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to apply penalty.')
      }
    } catch { setError('An error occurred.') }
    finally { setLoading(false) }
  }

  const handleWaivePenalty = async (penaltyId: string) => {
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch(`/api/admin/members/${member.id}/penalty/${penaltyId}/waive`, {
        method: 'POST',
      })
      if (res.ok) {
        setSuccess('Penalty waived.')
        setWaiveId(null)
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to waive penalty.')
      }
    } catch { setError('An error occurred.') }
    finally { setLoading(false) }
  }

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch(`/api/admin/members/${member.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setSuccess('Member status updated.')
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to update status.')
      }
    } catch { setError('An error occurred.') }
    finally { setLoading(false) }
  }

  return (
    <div>
      {error && <div className="alert-error" style={{ marginBottom: 16 }}>{error}</div>}
      {success && <div className="alert-success" style={{ marginBottom: 16 }}>{success}</div>}

      {/* Member header */}
      <div style={{
        background: 'var(--color-white)',
        border: '1px solid var(--color-gray-200)',
        padding: '24px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 52, height: 52,
            background: 'var(--color-green)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: 18,
          }}>
            {member.firstName[0]}{member.lastName[0]}
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 4 }}>
              {member.firstName} {member.lastName}
            </h2>
            <div style={{ fontSize: 14, color: 'var(--color-gray-500)' }}>{member.email}</div>
            {member.membershipStartDate && (
              <div style={{ fontSize: 13, color: 'var(--color-gray-400)', marginTop: 2 }}>
                Member since {fmtDate(member.membershipStartDate)}
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className={member.isOverdue ? 'badge-overdue' : 'badge-current'}>
            {member.isOverdue ? 'Overdue' : 'Current'}
          </span>
          {member.recurringActive && <span className="badge-ahead">Recurring</span>}
          <select
            className="form-input"
            style={{ fontSize: 13, padding: '6px 10px', maxWidth: 160 }}
            value={member.status}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Manual Payment */}
        <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-gray-200)', padding: '24px' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 16 }}>
            Record Manual Payment
          </h3>
          <p style={{ fontSize: 13, color: 'var(--color-gray-500)', marginBottom: 16 }}>
            Record a cash or e-transfer payment on behalf of this member.
          </p>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label className="form-label" htmlFor="manualAmount">Amount ($)</label>
              <input
                id="manualAmount"
                type="number"
                min="0.01"
                step="0.01"
                className="form-input"
                value={manualAmount}
                onChange={(e) => setManualAmount(e.target.value)}
                placeholder="e.g. 25.00"
              />
            </div>
            <button
              className="btn-primary btn-sm"
              onClick={handleManualPayment}
              disabled={loading}
              style={{ marginBottom: 0 }}
            >
              Record
            </button>
          </div>
          {member.paidThroughDate && (
            <p style={{ fontSize: 12, color: 'var(--color-gray-400)', marginTop: 10 }}>
              Currently paid through: {fmtDate(member.paidThroughDate)}
            </p>
          )}
        </div>

        {/* Apply Penalty */}
        <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-gray-200)', padding: '24px' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 16 }}>
            Apply Penalty
          </h3>
          <div style={{ marginBottom: 12 }}>
            <label className="form-label" htmlFor="penaltyReason">Reason</label>
            <input
              id="penaltyReason"
              type="text"
              className="form-input"
              value={penaltyReason}
              onChange={(e) => setPenaltyReason(e.target.value)}
              placeholder="e.g. Late payment"
            />
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label className="form-label" htmlFor="penaltyAmount">Amount ($)</label>
              <input
                id="penaltyAmount"
                type="number"
                min="0.01"
                step="0.01"
                className="form-input"
                value={penaltyAmount}
                onChange={(e) => setPenaltyAmount(e.target.value)}
                placeholder="e.g. 10.00"
              />
            </div>
            <button
              className="btn-danger btn-sm"
              onClick={handleAddPenalty}
              disabled={loading}
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* Family Members */}
      <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-gray-200)', padding: '24px', marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 16 }}>
          Family Members ({member.familyMembers.length})
        </h3>
        {member.familyMembers.length === 0 ? (
          <p style={{ fontSize: 14, color: 'var(--color-gray-400)' }}>No family members registered.</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {member.familyMembers.map((f) => {
              const age = Math.floor((Date.now() - new Date(f.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
              return (
                <div key={f.id} style={{
                  padding: '8px 14px',
                  background: age < 25 ? 'var(--color-green-pale)' : 'var(--color-gray-100)',
                  border: `1px solid ${age < 25 ? 'var(--color-green)' : 'var(--color-gray-200)'}`,
                  fontSize: 13,
                }}>
                  <strong>{f.fullName}</strong>
                  <span style={{ color: 'var(--color-gray-500)', marginLeft: 6 }}>Age {age}</span>
                  {age >= 25 && <span style={{ color: 'var(--color-gray-400)', marginLeft: 6 }}>(inactive)</span>}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Penalties */}
      {member.penalties.length > 0 && (
        <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-gray-200)', marginBottom: 20 }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-gray-200)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-gray-900)' }}>Penalties</h3>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {member.penalties.map((p) => (
                <tr key={p.id}>
                  <td>{fmtDate(p.createdAt)}</td>
                  <td style={{ fontWeight: 600, color: 'var(--color-red)' }}>{fmt(p.amount)}</td>
                  <td>{p.reason}</td>
                  <td>
                    <span className={p.paidAt ? 'badge-current' : 'badge-overdue'}>
                      {p.paidAt ? 'Paid' : 'Unpaid'}
                    </span>
                  </td>
                  <td>
                    {!p.paidAt && (
                      waiveId === p.id ? (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn-danger btn-sm" onClick={() => handleWaivePenalty(p.id)} disabled={loading}>Confirm</button>
                          <button className="btn-secondary btn-sm" onClick={() => setWaiveId(null)}>Cancel</button>
                        </div>
                      ) : (
                        <button className="btn-secondary btn-sm" onClick={() => setWaiveId(p.id)}>Waive</button>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Payment History */}
      <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-gray-200)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-gray-200)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-gray-900)' }}>Payment History</h3>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Status</th>
              <th>Receipt</th>
            </tr>
          </thead>
          <tbody>
            {member.payments.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--color-gray-400)', padding: '24px' }}>
                  No payments recorded.
                </td>
              </tr>
            ) : member.payments.map((p) => (
              <tr key={p.id}>
                <td>{fmtDate(p.paymentDate)}</td>
                <td style={{ fontWeight: 600 }}>{fmt(p.amount)}</td>
                <td style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-gray-500)' }}>
                  {p.paymentType === 'ONE_TIME' ? 'One-Time' : 'Recurring'}
                </td>
                <td>
                  <span className={p.status === 'SUCCEEDED' ? 'badge-current' : p.status === 'DECLINED' ? 'badge-overdue' : 'badge-ahead'}>
                    {p.status.charAt(0) + p.status.slice(1).toLowerCase()}
                  </span>
                </td>
                <td>
                  {p.receiptUrl ? (
                    <a href={p.receiptUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-green)', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                      View
                    </a>
                  ) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
