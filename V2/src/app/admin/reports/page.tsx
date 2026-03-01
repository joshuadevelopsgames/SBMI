'use client';

import { useEffect, useState } from 'react';

interface Report {
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  totalFamilyMembers: number;
  totalPaymentAmount: number;
  averagePaymentAmount: number;
  overdueMembers: number;
  recurringMembers: number;
  supportRequestsApproved: number;
  supportRequestsPending: number;
  supportRequestsDeclined: number;
  totalSupportAmount: number;
}

export default function ReportsPage() {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('month');

  useEffect(() => {
    fetchReport();
  }, [dateRange]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/reports?range=${dateRange}`);
      if (!response.ok) throw new Error('Failed to fetch report');
      const data = await response.json();
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 24 }}>
        Reports &amp; Analytics
      </h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[
          { value: 'week', label: 'This Week' },
          { value: 'month', label: 'This Month' },
          { value: 'year', label: 'This Year' },
          { value: 'all', label: 'All Time' },
        ].map(({ value, label }) => (
          <button
            key={value}
            className={dateRange === value ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'}
            onClick={() => setDateRange(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="alert-error" style={{ marginBottom: 16 }}>{error}</div>
      )}

      {loading ? (
        <p style={{ color: 'var(--color-gray-400)' }}>Loading report...</p>
      ) : report ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {/* Membership */}
          <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-gray-200)', padding: '24px' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 16 }}>
              Membership
            </h3>
            {[
              { label: 'Total Members', value: report.totalMembers },
              { label: 'Active', value: report.activeMembers, color: 'var(--color-green)' },
              { label: 'Inactive', value: report.inactiveMembers },
              { label: 'Overdue', value: report.overdueMembers, color: '#C62828' },
              { label: 'Family Members', value: report.totalFamilyMembers },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 13, color: 'var(--color-gray-600)' }}>{label}</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: color || 'var(--color-gray-900)' }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Payments */}
          <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-gray-200)', padding: '24px' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 16 }}>
              Payments
            </h3>
            {[
              { label: 'Total Collected', value: `$${(report.totalPaymentAmount / 100).toFixed(2)}` },
              { label: 'Average Payment', value: `$${(report.averagePaymentAmount / 100).toFixed(2)}` },
              { label: 'Recurring Members', value: report.recurringMembers },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 13, color: 'var(--color-gray-600)' }}>{label}</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-gray-900)' }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Support Requests */}
          <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-gray-200)', padding: '24px' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 16 }}>
              Support Requests
            </h3>
            {[
              { label: 'Approved', value: report.supportRequestsApproved, color: 'var(--color-green)' },
              { label: 'Pending', value: report.supportRequestsPending, color: '#FFA500' },
              { label: 'Declined', value: report.supportRequestsDeclined, color: '#C62828' },
              { label: 'Total Amount', value: `$${(report.totalSupportAmount / 100).toFixed(2)}` },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 13, color: 'var(--color-gray-600)' }}>{label}</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: color || 'var(--color-gray-900)' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p style={{ color: 'var(--color-gray-400)' }}>No report data available.</p>
      )}
    </div>
  );
}
