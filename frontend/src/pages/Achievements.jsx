import { useState, useEffect } from 'react';
import { achievementsAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const tierColors = {
  bronze: { bg: '#FFF0E6', border: '#FFD4B2', text: '#E67E22' },
  silver: { bg: '#F0F0F0', border: '#C0C0C0', text: '#7F8C8D' },
  gold: { bg: '#FFF8E7', border: '#FFD700', text: '#D4A017' },
  platinum: { bg: '#F0EDFF', border: '#A29BFE', text: '#6C5CE7' },
  diamond: { bg: '#E8FFF7', border: '#55EFC4', text: '#00B894' },
};

export default function Achievements() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    achievementsAPI.getAll().then((res) => setAchievements(res.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const categories = ['all', 'problems', 'contests', 'streaks', 'special'];
  const filtered = filter === 'all' ? achievements : achievements.filter((a) => a.category === filter);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="page container">
      <div className="page-header">
        <h1 className="page-title">Achievements</h1>
        <p className="page-subtitle">{unlockedCount} of {achievements.length} unlocked</p>
      </div>

      {/* Progress bar */}
      <div style={{ background: 'var(--bg-alt)', borderRadius: 10, height: 10, maxWidth: 400, marginBottom: 32, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 10, background: 'linear-gradient(90deg, var(--primary), var(--gold))', width: `${achievements.length ? (unlockedCount / achievements.length) * 100 : 0}%`, transition: 'width 0.5s' }} />
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {categories.map((c) => (
          <button key={c} className={`btn btn-sm ${filter === c ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter(c)} style={{ textTransform: 'capitalize' }}>{c}</button>
        ))}
      </div>

      {loading ? <div className="loading-center"><div className="spinner spinner-lg" /></div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {filtered.map((a, i) => {
            const tc = tierColors[a.tier] || tierColors.bronze;
            return (
              <motion.div key={a._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                style={{
                  background: a.unlocked ? tc.bg : 'var(--surface)',
                  border: `1px solid ${a.unlocked ? tc.border : 'var(--border)'}`,
                  borderRadius: 16, padding: 20,
                  opacity: a.unlocked ? 1 : 0.5,
                  transition: 'all 0.2s',
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '2rem' }}>{a.icon}</span>
                  <div>
                    <h3 style={{ fontSize: '0.92rem', fontWeight: 600, color: a.unlocked ? tc.text : 'var(--text-muted)' }}>{a.name}</h3>
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', color: tc.text, letterSpacing: '0.05em' }}>{a.tier}</span>
                  </div>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 10 }}>{a.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>+{a.xpReward} XP</span>
                  <span>{a.unlocked ? '✅ Unlocked' : '🔒 Locked'}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
