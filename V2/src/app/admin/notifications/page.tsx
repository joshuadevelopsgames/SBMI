'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/app/globals.css';

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
  const router = useRouter();
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
        const error = await response.json();
        throw new Error(error.error || 'Failed to vote');
      }

      fetchNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="admin-container">
      <h1>Governance Notifications</h1>

      <div className="admin-filters">
        <button
          className={filter === 'ACTIVE' ? 'active' : ''}
          onClick={() => setFilter('ACTIVE')}
        >
          Active
        </button>
        <button
          className={filter === 'RESOLVED' ? 'active' : ''}
          onClick={() => setFilter('RESOLVED')}
        >
          Resolved
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <p>Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <p>No notifications found.</p>
      ) : (
        <div className="notifications-list">
          {notifications.map(notification => (
            <div key={notification.id} className="notification-card">
              <div className="notification-header">
                <h3>{notification.notificationType.replace(/_/g, ' ')}</h3>
                <span className={`status-badge status-${notification.status.toLowerCase()}`}>
                  {notification.status}
                </span>
              </div>

              {notification.outcome && (
                <p className="notification-outcome">
                  <strong>Outcome:</strong> {notification.outcome}
                </p>
              )}

              <div className="notification-votes">
                <p>
                  <strong>Votes:</strong> {notification.approvalVotes.filter(v => v.decision === 'APPROVE').length} Approve,{' '}
                  {notification.approvalVotes.filter(v => v.decision === 'REJECT').length} Reject
                </p>
              </div>

              <div className="notification-dates">
                <p>
                  <small>Created: {new Date(notification.createdAt).toLocaleString()}</small>
                </p>
                {notification.resolvedAt && (
                  <p>
                    <small>Resolved: {new Date(notification.resolvedAt).toLocaleString()}</small>
                  </p>
                )}
              </div>

              {notification.status === 'ACTIVE' && (
                <div className="notification-actions">
                  <button
                    className="btn-approve"
                    onClick={() => handleVote(notification.id, 'APPROVE')}
                  >
                    Approve
                  </button>
                  <button
                    className="btn-reject"
                    onClick={() => handleVote(notification.id, 'REJECT')}
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
