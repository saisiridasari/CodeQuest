import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { problemsAPI } from '../api/services';
import { FiSearch, FiFilter, FiCheckCircle, FiArrowRight } from 'react-icons/fi';

const s = {
  controls: { display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' },
  searchBox: { flex: 1, minWidth: 200, position: 'relative' },
  searchIcon: { position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' },
  searchInput: { width: '100%', padding: '11px 16px 11px 40px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)', fontSize: '0.875rem' },
  filterBtn: (active) => ({ padding: '9px 16px', borderRadius: 'var(--radius)', border: '1px solid', borderColor: active ? 'var(--primary)' : 'var(--border)', background: active ? 'var(--primary-bg)' : 'var(--surface)', color: active ? 'var(--primary)' : 'var(--text-secondary)', fontSize: '0.825rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }),
  table: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' },
  row: { display: 'grid', gridTemplateColumns: '40px 1fr 100px 100px 80px', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid var(--border-light)', transition: 'background 0.15s', cursor: 'pointer', textDecoration: 'none', color: 'var(--text)' },
  rowHover: { background: 'var(--surface-hover)' },
  status: { width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  title: { fontWeight: 600, fontSize: '0.9rem' },
  tags: { display: 'flex', gap: 6, marginTop: 4 },
  tag: { padding: '2px 8px', borderRadius: 12, fontSize: '0.7rem', background: 'var(--bg-alt)', color: 'var(--text-muted)' },
  diff: (d) => ({ fontSize: '0.8rem', fontWeight: 600, color: d === 'Easy' ? 'var(--easy)' : d === 'Medium' ? '#E67E22' : 'var(--hard)' }),
  rate: { fontSize: '0.82rem', color: 'var(--text-secondary)' },
  headerRow: { display: 'grid', gridTemplateColumns: '40px 1fr 100px 100px 80px', padding: '12px 20px', background: 'var(--bg-alt)', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' },
};

export default function Problems() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState('');
  const [search, setSearch] = useState('');
  const [hoveredRow, setHoveredRow] = useState(null);

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const params = {};
      if (difficulty) params.difficulty = difficulty;
      if (search) params.search = search;
      const { data } = await problemsAPI.getAll(params);
      setProblems(data.data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchProblems(); }, [difficulty]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProblems();
  };

  const difficulties = ['', 'Easy', 'Medium', 'Hard'];

  return (
    <div className="page container">
      <div className="page-header">
        <h1 className="page-title">Problems</h1>
        <p className="page-subtitle">Sharpen your skills across {problems.length} coding challenges</p>
      </div>

      <div style={s.controls}>
        <form onSubmit={handleSearch} style={s.searchBox}>
          <FiSearch size={16} style={s.searchIcon} />
          <input style={s.searchInput} placeholder="Search problems..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </form>
        {difficulties.map((d) => (
          <button key={d || 'all'} style={s.filterBtn(difficulty === d)} onClick={() => setDifficulty(d)}>
            {d || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner spinner-lg" /></div>
      ) : (
        <div style={s.table}>
          <div style={s.headerRow}>
            <span></span>
            <span>Title</span>
            <span>Difficulty</span>
            <span>Acceptance</span>
            <span></span>
          </div>
          {problems.length === 0 ? (
            <div className="empty-state"><p>No problems found</p></div>
          ) : (
            problems.map((p, i) => (
              <Link to={`/problems/${p.slug}`} key={p._id} style={{ ...s.row, ...(hoveredRow === i ? s.rowHover : {}) }}
                onMouseEnter={() => setHoveredRow(i)} onMouseLeave={() => setHoveredRow(null)}>
                <div style={{ ...s.status, color: p.isSolved ? 'var(--success)' : 'var(--border)' }}>
                  <FiCheckCircle size={18} />
                </div>
                <div>
                  <div style={s.title}>{p.title}</div>
                  <div style={s.tags}>
                    {p.tags?.slice(0, 3).map((t) => <span key={t} style={s.tag}>{t}</span>)}
                  </div>
                </div>
                <span style={s.diff(p.difficulty)}>{p.difficulty}</span>
                <span style={s.rate}>{p.acceptanceRate || 0}%</span>
                <FiArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
