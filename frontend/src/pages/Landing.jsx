import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { problemsAPI, contestsAPI } from '../api/services';
import { FiCode, FiAward, FiTrendingUp, FiCpu, FiZap, FiUsers, FiArrowRight, FiCheckCircle, FiClock } from 'react-icons/fi';

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };

const features = [
  { icon: <FiCpu />, title: 'AI-Powered Evaluation', desc: 'Gemini AI evaluates your code, gives complexity analysis, and suggests improvements.' },
  { icon: <FiCode />, title: 'Smart Code Editor', desc: 'Monaco-powered editor with syntax highlighting and multi-language support.' },
  { icon: <FiAward />, title: 'Compete & Rank', desc: 'Join timed contests, earn XP, unlock achievements, and climb leaderboards.' },
  { icon: <FiTrendingUp />, title: 'Track Progress', desc: 'Dashboards with streaks, submission history, and skill analytics.' },
  { icon: <FiZap />, title: 'Instant Feedback', desc: 'Get real-time analysis with time/space complexity after every submission.' },
  { icon: <FiUsers />, title: 'Community Driven', desc: 'Public profiles, contest rankings, and a growing problem library.' },
];

export default function Landing() {
  const [problems, setProblems] = useState([]);
  const [contests, setContests] = useState([]);

  useEffect(() => {
    problemsAPI.getAll({ limit: 6 }).then((r) => setProblems(r.data.data)).catch(() => {});
    contestsAPI.getAll({ limit: 3 }).then((r) => setContests(r.data.data)).catch(() => {});
  }, []);

  return (
    <div style={{ overflow: 'hidden' }}>
      {/* ── Hero ── */}
      <section style={{ position: 'relative', padding: '80px 0 60px', overflow: 'hidden' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.5 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, background: 'var(--primary-bg)', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600, marginBottom: 20 }}>
              <FiCpu size={14} /> Powered by Gemini AI
            </div>
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 20 }}>
              Master Algorithms.<br /><span className="gradient-text">Code Your Future.</span>
            </h1>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 480, marginBottom: 32 }}>
              The coding platform where AI evaluates your solutions, analyzes complexity, and helps you grow.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <Link to="/register" className="btn btn-primary btn-lg" style={{ gap: 8 }}>Start Coding Free <FiArrowRight /></Link>
              <Link to="/problems" className="btn btn-secondary btn-lg">Explore Problems</Link>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 20px 60px rgba(108,92,231,0.12)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-alt)', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF6B6B' }} />
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FDCB6E' }} />
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#00B894' }} />
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>solution.js</span>
              </div>
              <pre style={{ padding: 20, fontSize: '0.82rem', lineHeight: 1.7, fontFamily: 'var(--font-mono)', margin: 0, overflow: 'auto', color: 'var(--text)' }}>{`function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const c = target - nums[i];
    if (map.has(c)) return [map.get(c), i];
    map.set(nums[i], i);
  }
}`}</pre>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderTop: '1px solid var(--border)', fontSize: '0.78rem' }}>
                <span style={{ color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FiCheckCircle size={14} /> Accepted · O(n) time · O(n) space
                </span>
              </div>
            </div>
          </motion.div>
        </div>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,92,231,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
      </section>

      {/* ── Popular Problems ── */}
      {problems.length > 0 && (
        <section style={{ padding: '40px 0' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Popular Problems</h2>
              <Link to="/problems" className="btn btn-ghost" style={{ gap: 4 }}>View all <FiArrowRight size={14} /></Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
              {problems.map((p) => (
                <Link to={`/problems/${p.slug}`} key={p._id} className="card" style={{ textDecoration: 'none', padding: 18, transition: 'transform 0.2s, box-shadow 0.2s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text)' }}>{p.title}</h3>
                    <span className={`badge badge-${p.difficulty === 'Easy' ? 'easy' : p.difficulty === 'Hard' ? 'hard' : 'medium'}`}>{p.difficulty}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                    {p.tags?.slice(0, 3).map((t) => <span key={t} style={{ padding: '2px 8px', borderRadius: 10, fontSize: '0.7rem', background: 'var(--bg-alt)', color: 'var(--text-muted)' }}>{t}</span>)}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>+{p.xpReward} XP</span>
                    <span>{p.acceptanceRate || 0}% acceptance</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Features ── */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 700 }}>Everything You Need to Level Up</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: 6 }}>AI-powered tools for mastering algorithms and competitive programming.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {features.map((f, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.08 }}
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--primary-bg)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 12 }}>{f.icon}</div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 4 }}>{f.title}</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Contests ── */}
      {contests.length > 0 && (
        <section style={{ padding: '40px 0' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Upcoming Contests</h2>
              <Link to="/contests" className="btn btn-ghost" style={{ gap: 4 }}>View all <FiArrowRight size={14} /></Link>
            </div>
            <div style={{ display: 'grid', gap: 14 }}>
              {contests.map((c) => (
                <Link to={`/contests/${c.slug || c._id}`} key={c._id} className="card" style={{ textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 18 }}>
                  <div>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                      <span className={`badge ${c.status === 'active' ? 'badge-success' : c.status === 'upcoming' ? 'badge-warning' : 'badge-primary'}`}>{c.status}</span>
                      <span className={`badge badge-${c.difficulty === 'Easy' ? 'easy' : c.difficulty === 'Hard' ? 'hard' : 'medium'}`}>{c.difficulty}</span>
                    </div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)' }}>{c.title}</h3>
                    <div style={{ display: 'flex', gap: 16, marginTop: 6, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiClock size={12} /> {c.duration}m</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiUsers size={12} /> {c.participantCount || 0}</span>
                    </div>
                  </div>
                  <FiArrowRight size={18} style={{ color: 'var(--text-muted)' }} />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section style={{ padding: '40px 0 80px' }}>
        <div className="container">
          <div style={{ textAlign: 'center', background: 'linear-gradient(135deg, var(--primary-bg), var(--accent-bg))', border: '1px solid var(--border)', borderRadius: 20, padding: '56px 40px' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 700 }}>Ready to Start?</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: 6, marginBottom: 24 }}>Join developers leveling up their coding skills every day.</p>
            <Link to="/register" className="btn btn-primary btn-lg">Create Free Account <FiArrowRight /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
