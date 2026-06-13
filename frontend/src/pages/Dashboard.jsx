import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../api/services';
import { FiTrendingUp, FiZap, FiTarget, FiAward, FiCode, FiClock } from 'react-icons/fi';
import { formatDate, getVerdictColor, calculateXPProgress } from '../utils/helpers';

const s = {
  page: { padding: '32px 0' },
  greeting: { fontSize: '1.75rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' },
  sub: { color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: 4 },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, margin: '28px 0' },
  statCard: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 20, display: 'flex', alignItems: 'flex-start', gap: 14, transition: 'all 0.2s' },
  statIcon: { width: 42, height: 42, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 },
  statVal: { fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 },
  statLbl: { fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 },
  section: { marginTop: 32 },
  sectionTitle: { fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)', marginBottom: 16 },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  card: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 },
  xpBar: { height: 8, background: 'var(--bg-alt)', borderRadius: 10, overflow: 'hidden', marginTop: 8 },
  xpFill: { height: '100%', borderRadius: 10, background: 'linear-gradient(90deg, var(--primary), var(--accent))', transition: 'width 0.6s ease' },
  diffRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-light)' },
  diffLabel: { fontSize: '0.85rem', fontWeight: 500 },
  diffVal: { fontSize: '0.85rem', fontWeight: 700 },
  subItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-light)' },
  subTitle: { fontSize: '0.875rem', fontWeight: 500, color: 'var(--primary)' },
  subVerdict: { fontSize: '0.8rem', fontWeight: 600, padding: '3px 10px', borderRadius: 12 },
  subDate: { fontSize: '0.75rem', color: 'var(--text-muted)' },
};

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userAPI.getDashboard().then((res) => setData(res.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner spinner-lg" /></div>;

  const d = data || {};
  const xpProgress = calculateXPProgress(user?.xp || 0);

  const statCards = [
    { icon: <FiZap />, bg: 'var(--primary-bg)', color: 'var(--primary)', value: user?.xp || 0, label: 'Total XP' },
    { icon: <FiTarget />, bg: 'var(--accent-bg)', color: 'var(--accent)', value: d.problemsSolved?.total || 0, label: 'Problems Solved' },
    { icon: <FiTrendingUp />, bg: 'var(--gold-bg)', color: '#E67E22', value: `${user?.streak || 0}d`, label: 'Current Streak' },
    { icon: <FiAward />, bg: '#FFF0F0', color: 'var(--danger)', value: d.achievementCount || 0, label: 'Achievements' },
  ];

  return (
    <div style={s.page} className="container">
      <div>
        <h1 style={s.greeting}>Welcome back, {user?.username}</h1>
        <p style={s.sub}>Level {user?.level || 1} · {xpProgress}% to next level</p>
        <div style={{ ...s.xpBar, maxWidth: 320, marginTop: 12 }}>
          <div style={{ ...s.xpFill, width: `${xpProgress}%` }} />
        </div>
      </div>

      <div style={s.grid4}>
        {statCards.map((sc, i) => (
          <div key={i} style={s.statCard}>
            <div style={{ ...s.statIcon, background: sc.bg, color: sc.color }}>{sc.icon}</div>
            <div>
              <div style={s.statVal}>{sc.value}</div>
              <div style={s.statLbl}>{sc.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={s.grid2}>
        {/* Problem breakdown */}
        <div style={s.card}>
          <h3 style={s.sectionTitle}>Problem Breakdown</h3>
          {[
            { label: 'Easy', val: d.problemsSolved?.easy || 0, color: 'var(--easy)' },
            { label: 'Medium', val: d.problemsSolved?.medium || 0, color: 'var(--medium)' },
            { label: 'Hard', val: d.problemsSolved?.hard || 0, color: 'var(--hard)' },
          ].map((item, i) => (
            <div key={i} style={s.diffRow}>
              <span style={{ ...s.diffLabel, color: item.color }}>{item.label}</span>
              <span style={{ ...s.diffVal, color: item.color }}>{item.val}</span>
            </div>
          ))}
          <div style={{ ...s.diffRow, borderBottom: 'none', fontWeight: 700 }}>
            <span style={s.diffLabel}>Total</span>
            <span style={s.diffVal}>{d.problemsSolved?.total || 0}</span>
          </div>
          <Link to="/problems" className="btn btn-secondary btn-sm" style={{ marginTop: 16, width: '100%' }}>
            <FiCode size={14} /> Solve More
          </Link>
        </div>

        {/* Submission stats */}
        <div style={s.card}>
          <h3 style={s.sectionTitle}>Submission Stats</h3>
          <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center', margin: '16px 0' }}>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)' }}>{d.submissions?.total || 0}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total</div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>{d.submissions?.accepted || 0}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Accepted</div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>
                {d.submissions?.total ? ((d.submissions.accepted / d.submissions.total) * 100).toFixed(0) : 0}%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rate</div>
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Contests</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{d.contestsParticipated || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Longest Streak</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user?.longestStreak || 0} days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent submissions */}
      <div style={s.section}>
        <h3 style={s.sectionTitle}>Recent Submissions</h3>
        <div style={s.card}>
          {d.recentSubmissions?.length ? d.recentSubmissions.map((sub, i) => (
            <div key={i} style={s.subItem}>
              <div>
                <Link to={`/problems/${sub.problem?.slug}`} style={s.subTitle}>{sub.problem?.title || 'Unknown'}</Link>
                <div style={s.subDate}>{formatDate(sub.createdAt)} · {sub.language}</div>
              </div>
              <span style={{ ...s.subVerdict, color: getVerdictColor(sub.verdict), background: sub.verdict === 'Accepted' ? 'var(--accent-bg)' : '#FFF0F0' }}>
                {sub.verdict}
              </span>
            </div>
          )) : (
            <div className="empty-state">
              <div className="empty-state-icon"><FiCode /></div>
              <h3>No submissions yet</h3>
              <p>Start solving problems to see your progress here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
