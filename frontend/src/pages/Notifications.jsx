import { useState, useEffect } from 'react';
import { notificationsAPI } from '../api/services';
import { timeAgo } from '../utils/helpers';
import { FiBell, FiCheck, FiCheckCircle, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

const typeIcons = {
  achievement: '🏆',
  submission: '📝',
  contest: '⚔️',
  system: '⚙️',
  streak: '🔥',
  level_up: '🎉',
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationsAPI.getAll().then((res) => setNotifications(res.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const markAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    } catch { /* ignore */ }
  };

  const markAllRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All marked as read');
    } catch { /* ignore */ }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationsAPI.delete(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch { /* ignore */ }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="page container" style={{ maxWidth: 720 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-secondary btn-sm" onClick={markAllRead}>
            <FiCheckCircle size={14} /> Mark all read
          </button>
        )}
      </div>

      {loading ? <div className="loading-center"><div className="spinner spinner-lg" /></div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {notifications.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 48 }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔔</div>
              <h3 style={{ fontWeight: 600, marginBottom: 4 }}>All caught up!</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No notifications at the moment.</p>
            </div>
          ) : notifications.map((n) => (
            <div key={n._id} className="card" style={{
              display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px 20px',
              background: n.isRead ? 'var(--surface)' : 'var(--primary-bg)',
              borderColor: n.isRead ? 'var(--border)' : 'var(--primary-lighter)',
              transition: 'all 0.2s',
            }}>
              <span style={{ fontSize: '1.4rem', flexShrink: 0, marginTop: 2 }}>{typeIcons[n.type] || '📬'}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.88rem', fontWeight: n.isRead ? 400 : 600, color: 'var(--text)', lineHeight: 1.5 }}>{n.message}</p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{timeAgo(n.createdAt)}</span>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                {!n.isRead && (
                  <button className="btn btn-ghost btn-sm" onClick={() => markAsRead(n._id)} title="Mark as read" style={{ padding: 6 }}>
                    <FiCheck size={14} />
                  </button>
                )}
                <button className="btn btn-ghost btn-sm" onClick={() => deleteNotification(n._id)} title="Delete" style={{ padding: 6, color: 'var(--danger)' }}>
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
