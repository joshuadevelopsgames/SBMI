'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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
  updatedAt: string;
}

export default function SupportRequestsPage() {
  const router = useRouter();
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
      const response = await fetch(`/api/support-request?status=${filter}`);
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
    <div className="admin-container">
      <div className="admin-header">
        <h1>Support Requests</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'New Request'}
        </button>
      </div>

      {showForm && (
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Target User ID</label>
            <input
              type="text"
              required
              value={formData.targetUserId}
              onChange={e => setFormData({ ...formData, targetUserId: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Support Type</label>
            <select
              value={formData.supportType}
              onChange={e => setFormData({ ...formData, supportType: e.target.value })}
            >
              <option value="MEDICAL">Medical</option>
              <option value="FUNERAL">Funeral</option>
              <option value="EMERGENCY">Emergency</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Amount Requested</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.amountRequested}
              onChange={e => setFormData({ ...formData, amountRequested: parseFloat(e.target.value) })}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              required
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <button type="submit" className="btn-primary">
            Submit Request
          </button>
        </form>
      )}

      <div className="admin-filters">
        <button
          className={filter === 'PENDING' ? 'active' : ''}
          onClick={() => setFilter('PENDING')}
        >
          Pending
        </button>
        <button
          className={filter === 'APPROVED' ? 'active' : ''}
          onClick={() => setFilter('APPROVED')}
        >
          Approved
        </button>
        <button
          className={filter === 'DECLINED' ? 'active' : ''}
          onClick={() => setFilter('DECLINED')}
        >
          Declined
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <p>Loading support requests...</p>
      ) : requests.length === 0 ? (
        <p>No support requests found.</p>
      ) : (
        <div className="requests-list">
          {requests.map(request => (
            <div key={request.id} className="request-card">
              <div className="request-header">
                <h3>{request.supportType}</h3>
                <span className={`status-badge status-${request.status.toLowerCase()}`}>
                  {request.status}
                </span>
              </div>

              <p className="request-description">{request.description}</p>

              <div className="request-details">
                <p>
                  <strong>Amount:</strong> ${request.amountRequested.toFixed(2)}
                </p>
                <p>
                  <small>Submitted: {new Date(request.createdAt).toLocaleString()}</small>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
