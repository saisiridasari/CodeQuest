import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { contestsAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { formatDateTime } from '../utils/helpers';
import { FiClock, FiUsers, FiPlay, FiAward } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ContestDetail() {
  const { idOrSlug } = useParams();
  const { user } = useAuth();
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    contestsAPI.getOne(idOrSlug).then((res) => setContest(res.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, [idOrSlug]);

  const handleJoin = async () => {
    setJoining(true);
    try {
      await contestsAPI.join(contest._id);
      toast.success('Joined contest!');
      setContest((c) => ({ ...c, isJoined: true, participantCount: (c.participantCount || 0) + 1 }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join');
    }
    setJoining(false);
  };

  if (loading) return <div className="loading-center"><div className="spinner spinner-lg" /></div>;
  if (!contest) return <div className="page container"><div className="empty-state"><h3>Contest not found</h3></div></div>;

  return (
    <div className="page container">
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <span className="badge badge-primary">{contest.status}</span>
          <span className={`badge badge-${contest.difficulty === 'Easy' ? 'easy' : contest.difficulty === 'Hard' ? 'hard' : 'medium'}`}>{contest.difficulty}</span>
        </div>
        <h1 className="page-title">{contest.title}</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>{contest.description}</p>
        <div style={{ display: 'flex', gap: 24, marginTop: 16, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><FiClock size={15} /> {contest.duration} minutes</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><FiUsers size={15} /> {contest.participantCount} participants</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><FiAward size={15} /> {contest.xpReward} XP reward</span>
        </div>
        <div style={{ marginTop: 12, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <strong>Start:</strong> {formatDateTime(contest.startTime)} · <strong>End:</strong> {formatDateTime(contest.endTime)}
        </div>
        {user && contest.status !== 'ended' && !contest.isJoined && (
          <button className="btn btn-primary" onClick={handleJoin} disabled={joining} style={{ marginTop: 20 }}>
            {joining ? 'Joining...' : 'Join Contest'}
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>Problems</h3>
          {contest.problems?.length > 0 ? contest.problems.map((p, i) => (
            <div key={p._id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
              <div>
                <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>{p.title}</span>
                <span className={`badge badge-${p.difficulty === 'Easy' ? 'easy' : p.difficulty === 'Hard' ? 'hard' : 'medium'}`} style={{ marginLeft: 8 }}>{p.difficulty}</span>
              </div>
              {contest.isJoined && contest.status === 'active' && (
                <Link to={`/arena/${p.slug}`} className="btn btn-sm btn-outline"><FiPlay size={12} /> Solve</Link>
              )}
            </div>
          )) : <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Problems will be revealed when the contest starts</p>}
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>Leaderboard</h3>
          {contest.leaderboard?.length > 0 ? (
            <div>
              {contest.leaderboard.slice(0, 10).map((entry, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <span style={{ width: 28, fontWeight: 700, fontSize: '0.9rem', color: i < 3 ? 'var(--primary)' : 'var(--text-muted)' }}>#{entry.rank}</span>
                  <span style={{ flex: 1, fontWeight: 500, fontSize: '0.85rem' }}>{entry.user?.username || 'User'}</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary)' }}>{entry.score} pts</span>
                </div>
              ))}
            </div>
          ) : <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No participants yet</p>}
        </div>
      </div>
    </div>
  );
}
