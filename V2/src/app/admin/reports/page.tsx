'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
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
    <div className="admin-container">
      <h1>Reports & Analytics</h1>

      <div className="admin-filters">
        <button
          className={dateRange === 'week' ? 'active' : ''}
          onClick={() => setDateRange('week')}
        >
          This Week
        </button>
        <button
          className={dateRange === 'month' ? 'active' : ''}
          onClick={() => setDateRange('month')}
        >
          This Month
        </button>
        <button
          className={dateRange === 'year' ? 'active' : ''}
          onClick={() => setDateRange('year')}
        >
          This Year
        </button>
        <button
          className={dateRange === 'all' ? 'active' : ''}
          onClick={() => setDateRange('all')}
        >
          All Time
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <p>Loading report...</p>
      ) : report ? (
        <div className="reports-grid">
          <div className="report-card">
            <h3>Membership</h3>
            <div className="report-stat">
              <span className="stat-label">Total Members</span>
              <span className="stat-value">{report.totalMembers}</span>
            </div>
            <div className="report-stat">
              <span className="stat-label">Active</span>
              <span className="stat-value">{report.activeMembers}</span>
            </div>
            <div className="report-stat">
              <span className="stat-label">Inactive</span>
              <span className="stat-value">{report.inactiveMembers}</span>
            </div>
            <div className="report-stat">
              <span className="stat-label">Overdue</span>
              <span className="stat-value" style={{ color: '#C62828' }}>
                {report.overdueMembers}
              </span>
            </div>
            <div className="report-stat">
              <span className="stat-label">Family Members</span>
              <span className="stat-value">{report.totalFamilyMembers}</span>
            </div>
          </div>

          <div className="report-card">
            <h3>Payments</h3>
            <div className="report-stat">
              <span className="stat-label">Total Amount</span>
              <span className="stat-value">${report.totalPaymentAmount.toFixed(2)}</span>
            </div>
            <div className="report-stat">
              <span className="stat-label">Average Payment</span>
              <span className="stat-value">${report.averagePaymentAmount.toFixed(2)}</span>
            </div>
            <div className="report-stat">
              <span className="stat-label">Recurring</span>
              <span className="stat-value">{report.recurringMembers}</span>
            </div>
          </div>

          <div className="report-card">
            <h3>Support Requests</h3>
            <div className="report-stat">
              <span className="stat-label">Approved</span>
              <span className="stat-value" style={{ color: '#2E7D32' }}>
                {report.supportRequestsApproved}
              </span>
            </div>
            <div className="report-stat">
              <span className="stat-label">Pending</span>
              <span className="stat-value" style={{ color: '#FFA500' }}>
                {report.supportRequestsPending}
              </span>
            </div>
            <div className="report-stat">
              <span className="stat-label">Declined</span>
              <span className="stat-value" style={{ color: '#C62828' }}>
                {report.supportRequestsDeclined}
              </span>
            </div>
            <div className="report-stat">
              <span className="stat-label">Total Amount</span>
              <span className="stat-value">${report.totalSupportAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      ) : (
        <p>No report data available.</p>
      )}
    </div>
  );
}
