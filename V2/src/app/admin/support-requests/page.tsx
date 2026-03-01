'use client';

import { useEffect, useState } from 'react';

interface SupportRequest {
  id: string;
  submittedByUserId: string;
  targetUserId: string;
  targetFamilyMemberId?: string;
  description: string;
  supportType: string;
  amountRequested: number;
  status: string;
  createdAt: string;
}

export default function SupportRequestsPage() {
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('PENDING');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    targetUserId: '',
    targetFamilyMemberId: '',
    description: '',
    supportType: 'MEDICAL',
    amountRequested: 0,
  });

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/support-request/list?status=${filter}`);
      if (!response.ok) throw new Error('Failed to fetch requests');
      const data = await response.json();
      setRequests(data.requests || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/support-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to create support request');

      setFormData({
        targetUserId: '',
        targetFamilyMemberId: '',
        description: '',
        supportType: 'MEDICAL',
        amountRequested: 0,
      });
      setShowForm(false);
      fetchRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-gray-900)' }}>Support Requests</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Request'}
        </button>
      </div>

      {showForm && (
        <div style={{
          background: 'var(--color-white)',
          border: '1px solid var(--color-gray-200)',
          padding: '24px',
          marginBottom: 24,
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Create Support Request</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label className="form-label">Target Member ID</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={formData.targetUserId}
                  onChange={e => setFormData({ ...formData, targetUserId: e.target.value })}
                  placeholder="Member user ID"
                />
              </div>
              <div>
                <label className="form-label">Support Type</label>
                <select
                  className="form-input"
                  value={formData.supportType}
                  onChange={e => setFormData({ ...formData, supportType: e.target.value })}
                >
                  <option value="MEDICAL">Medical</option>
                  <option value="FUNERAL">Funeral</option>
                  <option value="EMERGENCY">Emergency</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Amount Requested ($)</label>
              <input
                type="number"
                required
                min="0"
                step="1"
                className="form-input"
                style={{ maxWidth: 200 }}
                value={formData.amountRequested}
                onChange={e => setFormData({ ...formData, amountRequested: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label className="form-label">Description</label>
              <textarea
                required
                rows={4}
                className="form-input"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                style={{ resize: 'vertical' }}
              />
            </div>
            <button type="submit" className="btn-primary">
              Submit Request
            </button>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['PENDING', 'APPROVED', 'DECLINED'].map(s => (
          <button
            key={s}
            className={filter === s ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'}
            onClick={() => setFilter(s)}
          >
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {error && (
        <div className="alert-error" style={{ marginBottom: 16 }}>{error}</div>
      )}

      {loading ? (
        <p style={{ color: 'var(--color-gray-400)' }}>Loading support requests...</p>
      ) : requests.length === 0 ? (
        <div style={{
          background: 'var(--color-white)',
          border: '1px solid var(--color-gray-200)',
          padding: '48px',
          textAlign: 'center',
          color: 'var(--color-gray-400)',
        }}>
          No {filter.toLowerCase()} support requests found.
        </div>
      ) : (
        <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-gray-200)' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(request => (
                <tr key={request.id}>
                  <td style={{ fontWeight: 600 }}>{request.supportType}</td>
                  <td style={{ fontSize: 13, color: 'var(--color-gray-600)', maxWidth: 300 }}>
                    {request.description}
                  </td>
                  <td style={{ fontWeight: 600 }}>${request.amountRequested.toLocaleString()}</td>
                  <td>
                    <span className={
                      request.status === 'APPROVED' ? 'badge-current' :
                      request.status === 'DECLINED' ? 'badge-overdue' :
                      'badge-ahead'
                    }>
                      {request.status.charAt(0) + request.status.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--color-gray-500)' }}>
                    {new Date(request.createdAt).toLocaleDateString('en-CA')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
