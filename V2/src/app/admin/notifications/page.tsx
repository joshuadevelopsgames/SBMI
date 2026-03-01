'use client';

import { useEffect, useState } from 'react';

interface Notification {
  id: string;
  notificationType: string;
  status: string;
  outcome?: string;
  createdAt: string;
  resolvedAt?: string;
  approvalVotes: Array<{
    id: string;
    decision: string;
  }>;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ACTIVE');

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/notifications?status=${filter}`);
      if (!response.ok) throw new Error('Failed to fetch notifications');
      const data = await response.json();
      setNotifications(data.notifications);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (notificationId: string, decision: string) => {
    try {
      const response = await fetch(`/api/admin/notifications/${notificationId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to vote');
      }

      fetchNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 24 }}>
        Governance Notifications
      </h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <button
          className={filter === 'ACTIVE' ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'}
          onClick={() => setFilter('ACTIVE')}
        >
          Active
        </button>
        <button
          className={filter === 'RESOLVED' ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'}
          onClick={() => setFilter('RESOLVED')}
        >
          Resolved
        </button>
      </div>

      {error && (
        <div className="alert-error" style={{ marginBottom: 16 }}>{error}</div>
      )}

      {loading ? (
        <p style={{ color: 'var(--color-gray-400)' }}>Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <div style={{
          background: 'var(--color-white)',
          border: '1px solid var(--color-gray-200)',
          padding: '48px',
          textAlign: 'center',
          color: 'var(--color-gray-400)',
        }}>
          No {filter.toLowerCase()} notifications found.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {notifications.map(notification => (
            <div
              key={notification.id}
              style={{
                background: 'var(--color-white)',
                border: '1px solid var(--color-gray-200)',
                padding: '20px 24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-gray-900)' }}>
                  {notification.notificationType.replace(/_/g, ' ')}
                </h3>
                <span className={notification.status === 'ACTIVE' ? 'badge-current' : 'badge-ahead'}>
                  {notification.status}
                </span>
              </div>

              {notification.outcome && (
                <p style={{ fontSize: 14, color: 'var(--color-gray-600)', marginBottom: 8 }}>
                  <strong>Outcome:</strong> {notification.outcome}
                </p>
              )}

              <div style={{ fontSize: 13, color: 'var(--color-gray-500)', marginBottom: 12 }}>
                <span style={{ marginRight: 16 }}>
                  ✓ {notification.approvalVotes.filter(v => v.decision === 'APPROVE').length} Approve
                </span>
                <span>
                  ✗ {notification.approvalVotes.filter(v => v.decision === 'REJECT').length} Reject
                </span>
              </div>

              <p style={{ fontSize: 12, color: 'var(--color-gray-400)', marginBottom: notification.status === 'ACTIVE' ? 16 : 0 }}>
                Created: {new Date(notification.createdAt).toLocaleString()}
                {notification.resolvedAt && ` · Resolved: ${new Date(notification.resolvedAt).toLocaleString()}`}
              </p>

              {notification.status === 'ACTIVE' && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn-primary btn-sm"
                    onClick={() => handleVote(notification.id, 'APPROVE')}
                    style={{ background: 'var(--color-green)', borderColor: 'var(--color-green)' }}
                  >
                    Approve
                  </button>
                  <button
                    className="btn-secondary btn-sm"
                    onClick={() => handleVote(notification.id, 'REJECT')}
                    style={{ color: 'var(--color-red)', borderColor: 'var(--color-red)' }}
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
