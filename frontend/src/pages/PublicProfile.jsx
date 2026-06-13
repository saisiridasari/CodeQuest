import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { userAPI } from '../api/services';
import { formatDate } from '../utils/helpers';
import { FiMapPin, FiGithub, FiLinkedin, FiGlobe, FiCalendar, FiZap, FiTarget, FiTrendingUp, FiAward } from 'react-icons/fi';

export default function PublicProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userAPI.getPublicProfile(username).then((res) => setProfile(res.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, [username]);

  if (loading) return <div className="loading-center"><div className="spinner spinner-lg" /></div>;
  if (!profile) return <div className="page container"><div className="empty-state"><h3>User not found</h3></div></div>;

  const totalSolved = (profile.problemsSolved?.easy || 0) + (profile.problemsSolved?.medium || 0) + (profile.problemsSolved?.hard || 0);

  return (
    <div className="page container" style={{ maxWidth: 800 }}>
      {/* Profile header */}
      <div className="card card-elevated" style={{ textAlign: 'center', padding: '40px 24px 32px', marginBottom: 24, background: 'linear-gradient(180deg, var(--primary-bg) 0%, var(--surface) 100%)' }}>
        <div style={{ width: 80, height: 80, borderRadius: 20, background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: '#fff', fontSize: '2rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          {profile.username[0].toUpperCase()}
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{profile.username}</h1>
        <span className="badge badge-primary" style={{ margin: '6px auto' }}>Level {profile.level}</span>
        {profile.bio && <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 8, maxWidth: 400, margin: '8px auto 0' }}>{profile.bio}</p>}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 14, fontSize: '0.82rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
          {profile.location && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiMapPin size={14} />{profile.location}</span>}
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiCalendar size={14} />Joined {formatDate(profile.createdAt)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 12 }}>
          {profile.github && <a href={profile.github} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)' }}><FiGithub size={18} /></a>}
          {profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)' }}><FiLinkedin size={18} /></a>}
          {profile.website && <a href={profile.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)' }}><FiGlobe size={18} /></a>}
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {[
          { icon: <FiZap />, value: profile.xp, label: 'Total XP', color: 'var(--primary)' },
          { icon: <FiTarget />, value: totalSolved, label: 'Solved', color: 'var(--accent)' },
          { icon: <FiTrendingUp />, value: `${profile.streak || 0}d`, label: 'Streak', color: '#E67E22' },
          { icon: <FiAward />, value: profile.achievements?.length || 0, label: 'Achievements', color: 'var(--danger)' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div style={{ color: s.color, marginBottom: 6 }}>{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 14 }}>Problem Breakdown</h3>
          {['easy', 'medium', 'hard'].map((d) => (
            <div key={d} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
              <span style={{ fontSize: '0.85rem', textTransform: 'capitalize', color: d === 'easy' ? 'var(--easy)' : d === 'medium' ? '#E67E22' : 'var(--hard)', fontWeight: 500 }}>{d}</span>
              <span style={{ fontWeight: 700 }}>{profile.problemsSolved?.[d] || 0}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 14 }}>Stats</h3>
          {[
            ['Total Submissions', profile.totalSubmissions || 0],
            ['Accepted', profile.acceptedSubmissions || 0],
            ['Contests', profile.contestsParticipated || 0],
            ['Longest Streak', `${profile.longestStreak || 0} days`],
          ].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{l}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
