import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { contestsAPI } from '../api/services';
import { formatDateTime } from '../utils/helpers';
import { FiClock, FiUsers, FiArrowRight, FiCalendar } from 'react-icons/fi';

const statusColor = { upcoming: 'var(--info)', active: 'var(--success)', ended: 'var(--text-muted)' };

export default function Contests() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    contestsAPI.getAll(filter ? { status: filter } : {}).then((res) => setContests(res.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="page container">
      <div className="page-header">
        <h1 className="page-title">Contests</h1>
        <p className="page-subtitle">Compete with developers worldwide</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['', 'upcoming', 'active', 'ended'].map((s) => (
          <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter(s)}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? <div className="loading-center"><div className="spinner spinner-lg" /></div> : (
        <div style={{ display: 'grid', gap: 16 }}>
          {contests.length === 0 ? (
            <div className="empty-state"><h3>No contests found</h3><p>Check back soon for upcoming contests</p></div>
          ) : contests.map((c) => (
            <Link to={`/contests/${c.slug || c._id}`} key={c._id} className="card" style={{ textDecoration: 'none', display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '3px 10px', borderRadius: 12, background: `${statusColor[c.status]}20`, color: statusColor[c.status], textTransform: 'uppercase' }}>
                    {c.status}
                  </span>
                  <span className={`badge badge-${c.difficulty === 'Easy' ? 'easy' : c.difficulty === 'Hard' ? 'hard' : 'medium'}`}>{c.difficulty}</span>
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{c.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8 }}>{c.description?.slice(0, 120)}</p>
                <div style={{ display: 'flex', gap: 20, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiCalendar size={13} />{formatDateTime(c.startTime)}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiClock size={13} />{c.duration} min</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiUsers size={13} />{c.participantCount || 0}</span>
                </div>
              </div>
              <FiArrowRight size={20} style={{ color: 'var(--text-muted)' }} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
