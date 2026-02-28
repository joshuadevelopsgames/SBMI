'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface PaymentSummaryProps {
  state: 'OVERDUE' | 'UP_TO_DATE' | 'PAID_AHEAD'
  paidThroughDate: string | null
  nextDueDate: string
  nextMinAmountCents: number
  lastPaymentAmount: number | null
  lastPaymentDate: string | null
  totalPastDueCents: number
  dateOverdue: string | null
  recurringActive: boolean
}

interface PaymentsClientProps {
  summary: PaymentSummaryProps
  config: {
    monthlyContributionCents: number
    penaltyAmountCents: number
  }
  pendingPenaltyCents: number
  payments: {
    id: string
    amount: number
    paymentDate: string
    status: string
    paymentType: string
    receiptUrl: string | null
  }[]
}

function formatCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Edmonton',
  })
}

export default function PaymentsClient({ summary, config, pendingPenaltyCents, payments }: PaymentsClientProps) {
  const router = useRouter()
  const [paymentType, setPaymentType] = useState<'ONE_TIME' | 'RECURRING'>('ONE_TIME')
  const [months, setMonths] = useState(1)
  const [loading, setLoading] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [error, setError] = useState('')

  const monthlyAmount = config.monthlyContributionCents
  const penaltyAmount = pendingPenaltyCents
  const totalForMonths = months * monthlyAmount + penaltyAmount

  const handlePayment = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentType, months }),
      })
      const data = await res.json()
      if (res.ok && data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Failed to initiate payment.')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelRecurring = async () => {
    if (!confirm('Are you sure you want to cancel your recurring payment? A penalty may be applied if your membership lapses.')) return
    setCancelLoading(true)
    setError('')
    try {
      const res = await fetch('/api/payments/cancel-recurring', { method: 'POST' })
      if (res.ok) {
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to cancel recurring payment.')
      }
    } catch {
      setError('An error occurred.')
    } finally {
      setCancelLoading(false)
    }
  }

  const stateColors = {
    OVERDUE: { bg: 'var(--color-red-light)', border: 'var(--color-red)', text: 'var(--color-red)', badge: 'badge-overdue', label: 'Overdue' },
    UP_TO_DATE: { bg: 'var(--color-green-pale)', border: 'var(--color-green)', text: 'var(--color-green)', badge: 'badge-current', label: 'Up to Date' },
    PAID_AHEAD: { bg: 'var(--color-gold-light)', border: 'var(--color-gold)', text: '#7B5800', badge: 'badge-ahead', label: 'Paid Ahead' },
  }
  const colors = stateColors[summary.state]

  return (
    <div>
      {/* Payment Status */}
      <div style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        padding: '24px 28px',
        marginBottom: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <span className={colors.badge} style={{ marginBottom: 8, display: 'inline-block' }}>{colors.label}</span>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: colors.text, marginBottom: 4 }}>
              {summary.state === 'OVERDUE'
                ? `Payment overdue — ${formatCents(summary.totalPastDueCents)} due`
                : summary.state === 'UP_TO_DATE'
                ? 'Membership is current'
                : `Paid through ${summary.paidThroughDate ? formatDate(summary.paidThroughDate) : 'N/A'}`}
            </h2>
            {summary.state === 'OVERDUE' && summary.dateOverdue && (
              <p style={{ fontSize: 14, color: colors.text, margin: 0 }}>
                Overdue since {formatDate(summary.dateOverdue)}
              </p>
            )}
            {summary.state !== 'OVERDUE' && (
              <p style={{ fontSize: 14, color: colors.text, margin: 0 }}>
                Next payment due: {formatDate(summary.nextDueDate)} &nbsp;·&nbsp; Min. {formatCents(summary.nextMinAmountCents)}
              </p>
            )}
            {summary.recurringActive && (
              <p style={{ fontSize: 13, color: colors.text, marginTop: 4 }}>
                ✓ Recurring payment active — auto-renews monthly
              </p>
            )}
          </div>
        </div>
      </div>

      {error && <div className="alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      {/* Make a Payment */}
      {!summary.recurringActive && (
        <div style={{
          background: 'var(--color-white)',
          border: '1px solid var(--color-gray-200)',
          padding: '28px',
          marginBottom: 24,
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 20 }}>
            Make a Payment
          </h3>

          {/* Payment type */}
          <div style={{ marginBottom: 20 }}>
            <label className="form-label">Payment Type</label>
            <div style={{ display: 'flex', gap: 12 }}>
              {(['ONE_TIME', 'RECURRING'] as const).map((type) => (
                <label key={type} style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '12px 16px',
                  border: `2px solid ${paymentType === type ? 'var(--color-green)' : 'var(--color-gray-200)'}`,
                  background: paymentType === type ? 'var(--color-green-pale)' : 'var(--color-white)',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: paymentType === type ? 600 : 400,
                  color: paymentType === type ? 'var(--color-green)' : 'var(--color-gray-700)',
                }}>
                  <input
                    type="radio"
                    name="paymentType"
                    value={type}
                    checked={paymentType === type}
                    onChange={() => setPaymentType(type)}
                    style={{ accentColor: 'var(--color-green)' }}
                  />
                  {type === 'ONE_TIME' ? 'One-Time Payment' : 'Recurring Monthly'}
                </label>
              ))}
            </div>
            {paymentType === 'RECURRING' && (
              <div className="alert-info" style={{ marginTop: 12, fontSize: 13 }}>
                By selecting recurring, you agree to have {formatCents(monthlyAmount)} automatically charged to your card each month.
                You may cancel at any time, but a penalty of {formatCents(config.penaltyAmountCents)} will be applied if your membership lapses.
              </div>
            )}
          </div>

          {/* Months selector (one-time only) */}
          {paymentType === 'ONE_TIME' && (
            <div style={{ marginBottom: 20 }}>
              <label className="form-label" htmlFor="months">Number of Months</label>
              <select
                id="months"
                className="form-input"
                value={months}
                onChange={(e) => setMonths(Number(e.target.value))}
                style={{ maxWidth: 200 }}
              >
                {[1, 2, 3, 6, 12].map((m) => (
                  <option key={m} value={m}>{m} month{m > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
          )}

          {/* Payment summary */}
          <div style={{
            background: 'var(--color-gray-50)',
            border: '1px solid var(--color-gray-200)',
            padding: '16px 20px',
            marginBottom: 20,
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-gray-500)', marginBottom: 12 }}>
              Payment Summary
            </div>
            {paymentType === 'ONE_TIME' ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 6 }}>
                  <span style={{ color: 'var(--color-gray-600)' }}>{months} × monthly contribution</span>
                  <span style={{ fontWeight: 500 }}>{formatCents(months * monthlyAmount)}</span>
                </div>
                {penaltyAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 6 }}>
                    <span style={{ color: 'var(--color-red)' }}>Pending penalties</span>
                    <span style={{ fontWeight: 500, color: 'var(--color-red)' }}>{formatCents(penaltyAmount)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700, borderTop: '1px solid var(--color-gray-200)', paddingTop: 10, marginTop: 6 }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--color-green)' }}>{formatCents(totalForMonths)}</span>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 6 }}>
                  <span style={{ color: 'var(--color-gray-600)' }}>Monthly contribution</span>
                  <span style={{ fontWeight: 500 }}>{formatCents(monthlyAmount)}/month</span>
                </div>
                {penaltyAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 6 }}>
                    <span style={{ color: 'var(--color-red)' }}>Pending penalties (first payment)</span>
                    <span style={{ fontWeight: 500, color: 'var(--color-red)' }}>{formatCents(penaltyAmount)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700, borderTop: '1px solid var(--color-gray-200)', paddingTop: 10, marginTop: 6 }}>
                  <span>First payment</span>
                  <span style={{ color: 'var(--color-green)' }}>{formatCents(monthlyAmount + penaltyAmount)}</span>
                </div>
              </>
            )}
          </div>

          <button
            className="btn-primary"
            onClick={handlePayment}
            disabled={loading}
            style={{ minWidth: 200 }}
          >
            {loading ? 'Redirecting to Stripe...' : `Pay ${paymentType === 'ONE_TIME' ? formatCents(totalForMonths) : `${formatCents(monthlyAmount + penaltyAmount)}/mo`}`}
          </button>
          <p style={{ fontSize: 12, color: 'var(--color-gray-400)', marginTop: 8 }}>
            Secure payment powered by Stripe. You will be redirected to complete your payment.
          </p>
        </div>
      )}

      {/* Cancel recurring */}
      {summary.recurringActive && (
        <div style={{
          background: 'var(--color-white)',
          border: '1px solid var(--color-gray-200)',
          padding: '24px 28px',
          marginBottom: 24,
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 8 }}>
            Recurring Payment Active
          </h3>
          <p style={{ fontSize: 14, color: 'var(--color-gray-600)', marginBottom: 16, lineHeight: 1.6 }}>
            Your membership is set to auto-renew monthly at {formatCents(config.monthlyContributionCents)}.
            If you cancel, a penalty of {formatCents(config.penaltyAmountCents)} will be applied when your membership lapses.
          </p>
          <button
            className="btn-danger btn-sm"
            onClick={handleCancelRecurring}
            disabled={cancelLoading}
          >
            {cancelLoading ? 'Cancelling...' : 'Cancel Recurring Payment'}
          </button>
        </div>
      )}

      {/* Payment History */}
      <div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 16 }}>
          Payment History
        </h3>
        {payments.length === 0 ? (
          <div style={{
            background: 'var(--color-white)',
            border: '1px solid var(--color-gray-200)',
            padding: '32px',
            textAlign: 'center',
          }}>
            <p style={{ color: 'var(--color-gray-500)', fontSize: 15 }}>No payment history yet.</p>
          </div>
        ) : (
          <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-gray-200)' }}>
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
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDate(p.paymentDate)}</td>
                    <td style={{ fontWeight: 600 }}>{formatCents(p.amount)}</td>
                    <td>
                      <span style={{ fontSize: 12, color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {p.paymentType === 'ONE_TIME' ? 'One-Time' : 'Recurring'}
                      </span>
                    </td>
                    <td>
                      <span className={
                        p.status === 'SUCCEEDED' ? 'badge-current' :
                        p.status === 'FAILED' || p.status === 'DECLINED' ? 'badge-overdue' :
                        'badge-ahead'
                      }>
                        {p.status.charAt(0) + p.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td>
                      {p.receiptUrl ? (
                        <a
                          href={p.receiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: 'var(--color-green)', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
                        >
                          View Receipt
                        </a>
                      ) : (
                        <span style={{ color: 'var(--color-gray-400)', fontSize: 13 }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
