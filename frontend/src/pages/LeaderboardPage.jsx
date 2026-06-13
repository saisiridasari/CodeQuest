import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { leaderboardAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { FiTrendingUp, FiAward, FiZap } from 'react-icons/fi';

const medalColors = ['#FFD700', '#C0C0C0', '#CD7F32'];

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('global');
  const [myRank, setMyRank] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = tab === 'global' ? await leaderboardAPI.getGlobal() : await leaderboardAPI.getWeekly();
        setLeaderboard(res.data.data);
        if (user) {
          const rankRes = await leaderboardAPI.getMyRank();
          setMyRank(rankRes.data.data);
        }
      } catch { /* ignore */ }
      setLoading(false);
    };
    fetch();
  }, [tab, user]);

  return (
    <div className="page container">
      <div className="page-header">
        <h1 className="page-title">Leaderboard</h1>
        <p className="page-subtitle">See where you stand among the best</p>
      </div>

      {myRank && (
        <div className="card card-elevated" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: 20, marginBottom: 24, background: 'linear-gradient(135deg, var(--primary-bg), var(--accent-bg))' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>#{myRank.rank}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Your Rank</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>Top {myRank.percentile}%</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Percentile</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{user.xp}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Total XP</div>
          </div>
        </div>
      )}

      <div className="tabs" style={{ marginBottom: 24 }}>
        <button className={`tab ${tab === 'global' ? 'active' : ''}`} onClick={() => setTab('global')}>
          <FiTrendingUp style={{ marginRight: 6 }} /> All Time
        </button>
        <button className={`tab ${tab === 'weekly' ? 'active' : ''}`} onClick={() => setTab('weekly')}>
          <FiZap style={{ marginRight: 6 }} /> Weekly
        </button>
      </div>

      {loading ? <div className="loading-center"><div className="spinner spinner-lg" /></div> : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th style={{ width: 60 }}>Rank</th>
                <th>Developer</th>
                <th>Level</th>
                <th>Solved</th>
                <th>Streak</th>
                <th style={{ textAlign: 'right' }}>XP</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry) => (
                <tr key={entry._id} style={entry.username === user?.username ? { background: 'var(--primary-bg)' } : {}}>
                  <td>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: entry.rank <= 3 ? medalColors[entry.rank - 1] : 'var(--text)' }}>
                      {entry.rank <= 3 ? <FiAward style={{ marginRight: 4, color: medalColors[entry.rank - 1] }} /> : null}
                      {entry.rank}
                    </span>
                  </td>
                  <td>
                    <Link to={`/profile/${entry.username}`} style={{ fontWeight: 600, fontSize: '0.9rem' }}>{entry.username}</Link>
                  </td>
                  <td><span className="badge badge-primary">Lv.{entry.level}</span></td>
                  <td style={{ fontSize: '0.85rem' }}>{entry.totalSolved}</td>
                  <td style={{ fontSize: '0.85rem' }}>{entry.streak}d 🔥</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--primary)' }}>{entry.xp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
