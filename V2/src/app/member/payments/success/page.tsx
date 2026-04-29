import Link from 'next/link'

export default function PaymentSuccessPage() {
  return (
    <div style={{
      background: 'var(--color-white)',
      border: '1px solid var(--color-gray-200)',
      padding: '48px 40px',
      maxWidth: 480,
      textAlign: 'center',
    }}>
      <div style={{
        width: 64, height: 64,
        background: 'var(--color-green)',
        margin: '0 auto 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg viewBox="0 0 24 24" width="32" height="32" fill="white">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
      </div>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 12 }}>
        Payment Successful
      </h2>
      <p style={{ color: 'var(--color-gray-600)', fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>
        Your payment has been processed successfully. Your membership has been updated.
      </p>
      <Link href="/member/payments" className="btn-primary">
        View Payment History
      </Link>
    </div>
  )
}
