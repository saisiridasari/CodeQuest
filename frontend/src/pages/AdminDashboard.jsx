import { useState, useEffect, useCallback } from 'react';
import { adminAPI, problemsAPI } from '../api/services';
import { formatDate, formatDateTime } from '../utils/helpers';
import { FiUsers, FiCode, FiFileText, FiTrendingUp, FiSearch, FiTrash2, FiEdit, FiPlus, FiX, FiEye, FiAward, FiCalendar } from 'react-icons/fi';
import toast from 'react-hot-toast';

// ── Modal wrapper ──
const Modal = ({ open, onClose, title, children, wide }) => {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', padding: 20 }} onClick={onClose}>
      <div style={{ background: 'var(--surface)', borderRadius: 16, width: '100%', maxWidth: wide ? 800 : 560, maxHeight: '85vh', overflow: 'auto', padding: 28, boxShadow: 'var(--shadow-xl)' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{title}</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><FiX size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
};

const Field = ({ label, children }) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    {children}
  </div>
);

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [problems, setProblems] = useState([]);
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState({ open: false, type: '', data: null });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === 'overview') { const { data } = await adminAPI.getStats(); setStats(data.data); }
      else if (tab === 'users') { const { data } = await adminAPI.getUsers({ search }); setUsers(data.data); }
      else if (tab === 'problems') { const { data } = await adminAPI.getProblems({ search }); setProblems(data.data); }
      else if (tab === 'contests') { const { data } = await adminAPI.getContests(); setContests(data.data); }
    } catch { /* ignore */ }
    setLoading(false);
  }, [tab, search]);

  useEffect(() => { fetchData(); }, [tab]);

  const doSearch = () => fetchData();

  // ── User actions ──
  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This is permanent.`)) return;
    try { await adminAPI.deleteUser(id); toast.success('User deleted'); fetchData(); } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };
  const handleToggleRole = async (id, current) => {
    try { await adminAPI.updateUser(id, { role: current === 'admin' ? 'user' : 'admin' }); toast.success('Role updated'); fetchData(); } catch { toast.error('Failed'); }
  };

  // ── Problem actions ──
  const handleDeleteProblem = async (id) => {
    if (!window.confirm('Delete this problem?')) return;
    try { await adminAPI.deleteProblem(id); toast.success('Deleted'); fetchData(); } catch { toast.error('Failed'); }
  };

  // ── Contest actions ──
  const handleDeleteContest = async (id) => {
    if (!window.confirm('Delete this contest?')) return;
    try { await adminAPI.deleteContest(id); toast.success('Deleted'); fetchData(); } catch { toast.error('Failed'); }
  };

  const tabs = [
    { key: 'overview', label: 'Overview', icon: <FiTrendingUp size={15} /> },
    { key: 'users', label: 'Users', icon: <FiUsers size={15} /> },
    { key: 'problems', label: 'Problems', icon: <FiCode size={15} /> },
    { key: 'contests', label: 'Contests', icon: <FiCalendar size={15} /> },
  ];

  return (
    <div className="page container">
      <h1 className="page-title" style={{ marginBottom: 4 }}>Admin Dashboard</h1>
      <p className="page-subtitle" style={{ marginBottom: 24 }}>Manage your platform</p>

      <div className="tabs" style={{ marginBottom: 28 }}>
        {tabs.map((t) => (
          <button key={t.key} className={`tab ${tab === t.key ? 'active' : ''}`} onClick={() => { setTab(t.key); setSearch(''); }} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {loading ? <div className="loading-center"><div className="spinner spinner-lg" /></div> : (
        <>
          {/* ═══ OVERVIEW ═══ */}
          {tab === 'overview' && stats && (
            <>
              <div className="stats-grid" style={{ marginBottom: 28 }}>
                {[
                  { icon: <FiUsers />, val: stats.totalUsers, label: 'Users', color: 'var(--primary)' },
                  { icon: <FiCode />, val: stats.totalProblems, label: 'Problems', color: 'var(--accent)' },
                  { icon: <FiFileText />, val: stats.totalSubmissions, label: 'Submissions', color: '#E67E22' },
                  { icon: <FiCalendar />, val: stats.totalContests, label: 'Contests', color: 'var(--danger)' },
                ].map((s, i) => (
                  <div key={i} className="stat-card">
                    <div style={{ color: s.color, fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
                    <div className="stat-value" style={{ color: s.color }}>{s.val || 0}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                <div className="card">
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 14 }}>Quick Stats</h3>
                  {[
                    ['Active Users (7d)', stats.activeUsersWeek || 0],
                    ['Submissions Today', stats.submissionsToday || 0],
                    ['Acceptance Rate', `${stats.avgAcceptanceRate || 0}%`],
                  ].map(([l, v]) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{l}</span><span style={{ fontWeight: 600 }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div className="card">
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 14 }}>Recent Users</h3>
                  {stats.recentUsers?.slice(0, 6).map((u) => (
                    <div key={u._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border-light)', fontSize: '0.82rem' }}>
                      <span style={{ fontWeight: 500 }}>{u.username}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{formatDate(u.createdAt)}</span>
                    </div>
                  ))}
                </div>
              </div>
              {stats.languageStats?.length > 0 && (
                <div className="card">
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 14 }}>Language Distribution</h3>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {stats.languageStats.map((l) => (
                      <div key={l._id} style={{ background: 'var(--bg-alt)', padding: '8px 14px', borderRadius: 8, fontSize: '0.82rem' }}>
                        <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{l._id}</span>
                        <span style={{ color: 'var(--text-muted)', marginLeft: 6 }}>{l.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ═══ USERS ═══ */}
          {tab === 'users' && (
            <>
              <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <FiSearch size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input className="form-input" style={{ paddingLeft: 40 }} placeholder="Search users..."
                    value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && doSearch()} />
                </div>
                <button className="btn btn-primary" onClick={doSearch}>Search</button>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Level</th><th>Solved</th><th>Joined</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
                  <tbody>
                    {users.map((u) => {
                      const solved = (u.problemsSolved?.easy || 0) + (u.problemsSolved?.medium || 0) + (u.problemsSolved?.hard || 0);
                      return (
                        <tr key={u._id}>
                          <td style={{ fontWeight: 600 }}>{u.username}</td>
                          <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                          <td><span className={`badge ${u.role === 'admin' ? 'badge-danger' : 'badge-primary'}`}>{u.role}</span></td>
                          <td>{u.level}</td>
                          <td>{solved}</td>
                          <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{formatDate(u.createdAt)}</td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                              <button className="btn btn-ghost btn-sm" onClick={() => handleToggleRole(u._id, u.role)} title="Toggle role"><FiEdit size={14} /></button>
                              <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDeleteUser(u._id, u.username)} title="Delete"><FiTrash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {users.length === 0 && <div className="empty-state" style={{ padding: 32 }}><p>No users found</p></div>}
              </div>
            </>
          )}

          {/* ═══ PROBLEMS ═══ */}
          {tab === 'problems' && (
            <>
              <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <FiSearch size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input className="form-input" style={{ paddingLeft: 40 }} placeholder="Search problems..."
                    value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && doSearch()} />
                </div>
                <button className="btn btn-primary" onClick={doSearch}>Search</button>
                <button className="btn btn-success" onClick={() => setModal({ open: true, type: 'problem', data: null })}><FiPlus size={14} /> Add Problem</button>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>Title</th><th>Difficulty</th><th>Tags</th><th>Submissions</th><th>XP</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
                  <tbody>
                    {problems.map((p) => (
                      <tr key={p._id}>
                        <td style={{ fontWeight: 600 }}>{p.title}</td>
                        <td><span className={`badge badge-${p.difficulty === 'Easy' ? 'easy' : p.difficulty === 'Hard' ? 'hard' : 'medium'}`}>{p.difficulty}</span></td>
                        <td><div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{p.tags?.slice(0, 3).map((t) => <span key={t} className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{t}</span>)}</div></td>
                        <td style={{ fontSize: '0.82rem' }}>{p.totalSubmissions || 0} ({p.acceptedSubmissions || 0} AC)</td>
                        <td style={{ fontWeight: 600, color: 'var(--gold-dark)' }}>+{p.xpReward}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => setModal({ open: true, type: 'problem', data: p })}><FiEdit size={14} /></button>
                            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDeleteProblem(p._id)}><FiTrash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {problems.length === 0 && <div className="empty-state" style={{ padding: 32 }}><p>No problems found</p></div>}
              </div>
            </>
          )}

          {/* ═══ CONTESTS ═══ */}
          {tab === 'contests' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
                <button className="btn btn-success" onClick={() => setModal({ open: true, type: 'contest', data: null })}><FiPlus size={14} /> Create Contest</button>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>Title</th><th>Status</th><th>Difficulty</th><th>Start</th><th>Duration</th><th>Participants</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
                  <tbody>
                    {contests.map((c) => (
                      <tr key={c._id}>
                        <td style={{ fontWeight: 600 }}>{c.title}</td>
                        <td><span className={`badge ${c.status === 'active' ? 'badge-success' : c.status === 'upcoming' ? 'badge-warning' : 'badge-primary'}`}>{c.status}</span></td>
                        <td><span className={`badge badge-${c.difficulty === 'Easy' ? 'easy' : c.difficulty === 'Hard' ? 'hard' : 'medium'}`}>{c.difficulty}</span></td>
                        <td style={{ fontSize: '0.82rem' }}>{formatDateTime(c.startTime)}</td>
                        <td>{c.duration}m</td>
                        <td>{c.participantCount || 0}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => setModal({ open: true, type: 'contest', data: c })}><FiEdit size={14} /></button>
                            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDeleteContest(c._id)}><FiTrash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {contests.length === 0 && <div className="empty-state" style={{ padding: 32 }}><p>No contests found</p></div>}
              </div>
            </>
          )}
        </>
      )}

      {/* ═══ PROBLEM MODAL ═══ */}
      <Modal open={modal.open && modal.type === 'problem'} onClose={() => setModal({ open: false })} title={modal.data ? 'Edit Problem' : 'Add Problem'} wide>
        <ProblemForm initial={modal.data} onSaved={() => { setModal({ open: false }); fetchData(); }} />
      </Modal>

      {/* ═══ CONTEST MODAL ═══ */}
      <Modal open={modal.open && modal.type === 'contest'} onClose={() => setModal({ open: false })} title={modal.data ? 'Edit Contest' : 'Create Contest'} wide>
        <ContestForm initial={modal.data} onSaved={() => { setModal({ open: false }); fetchData(); }} />
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════
//  PROBLEM FORM
// ═══════════════════════════════════════════════
function ProblemForm({ initial, onSaved }) {
  const [form, setForm] = useState({
    title: initial?.title || '',
    description: initial?.description || '',
    difficulty: initial?.difficulty || 'Easy',
    tags: initial?.tags?.join(', ') || '',
    constraints: initial?.constraints || '',
    xpReward: initial?.xpReward || 10,
    timeLimit: initial?.timeLimit || 2,
    memoryLimit: initial?.memoryLimit || 256,
    hints: initial?.hints?.join('\n') || '',
    examples: initial?.examples || [{ input: '', output: '', explanation: '' }],
    testCases: initial?.testCases || [{ input: '', expectedOutput: '', isHidden: false }],
    starterCode: initial?.starterCode || { javascript: '', python: '' },
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) { toast.error('Title and description required'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        hints: form.hints.split('\n').filter((h) => h.trim()),
      };
      if (initial?._id) await adminAPI.updateProblem(initial._id, payload);
      else await adminAPI.createProblem(payload);
      toast.success(initial ? 'Problem updated' : 'Problem created');
      onSaved();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  const updateExample = (i, key, val) => {
    const copy = [...form.examples]; copy[i] = { ...copy[i], [key]: val }; set('examples', copy);
  };
  const updateTestCase = (i, key, val) => {
    const copy = [...form.testCases]; copy[i] = { ...copy[i], [key]: val }; set('testCases', copy);
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Field label="Title"><input className="form-input" value={form.title} onChange={(e) => set('title', e.target.value)} /></Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <Field label="Difficulty">
            <select className="form-input" value={form.difficulty} onChange={(e) => set('difficulty', e.target.value)}>
              <option>Easy</option><option>Medium</option><option>Hard</option>
            </select>
          </Field>
          <Field label="XP"><input type="number" className="form-input" value={form.xpReward} onChange={(e) => set('xpReward', +e.target.value)} /></Field>
          <Field label="Time Limit (s)"><input type="number" className="form-input" value={form.timeLimit} onChange={(e) => set('timeLimit', +e.target.value)} /></Field>
        </div>
      </div>
      <Field label="Description"><textarea className="form-input" rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} /></Field>
      <Field label="Tags (comma separated)"><input className="form-input" value={form.tags} onChange={(e) => set('tags', e.target.value)} placeholder="Array, Hash Table, Two Pointers" /></Field>
      <Field label="Constraints"><textarea className="form-input" rows={2} value={form.constraints} onChange={(e) => set('constraints', e.target.value)} /></Field>
      <Field label="Hints (one per line)"><textarea className="form-input" rows={2} value={form.hints} onChange={(e) => set('hints', e.target.value)} /></Field>

      {/* Examples */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <label className="form-label" style={{ margin: 0 }}>Examples</label>
          <button className="btn btn-ghost btn-sm" onClick={() => set('examples', [...form.examples, { input: '', output: '', explanation: '' }])}><FiPlus size={13} /> Add</button>
        </div>
        {form.examples.map((ex, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 8, marginBottom: 6 }}>
            <input className="form-input" placeholder="Input" value={ex.input} onChange={(e) => updateExample(i, 'input', e.target.value)} style={{ fontSize: '0.8rem' }} />
            <input className="form-input" placeholder="Output" value={ex.output} onChange={(e) => updateExample(i, 'output', e.target.value)} style={{ fontSize: '0.8rem' }} />
            <input className="form-input" placeholder="Explanation" value={ex.explanation || ''} onChange={(e) => updateExample(i, 'explanation', e.target.value)} style={{ fontSize: '0.8rem' }} />
            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => set('examples', form.examples.filter((_, j) => j !== i))}><FiX size={14} /></button>
          </div>
        ))}
      </div>

      {/* Test Cases */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <label className="form-label" style={{ margin: 0 }}>Test Cases</label>
          <button className="btn btn-ghost btn-sm" onClick={() => set('testCases', [...form.testCases, { input: '', expectedOutput: '', isHidden: false }])}><FiPlus size={13} /> Add</button>
        </div>
        {form.testCases.map((tc, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: 8, marginBottom: 6, alignItems: 'center' }}>
            <input className="form-input" placeholder="Input" value={tc.input} onChange={(e) => updateTestCase(i, 'input', e.target.value)} style={{ fontSize: '0.8rem' }} />
            <input className="form-input" placeholder="Expected Output" value={tc.expectedOutput} onChange={(e) => updateTestCase(i, 'expectedOutput', e.target.value)} style={{ fontSize: '0.8rem' }} />
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', cursor: 'pointer' }}>
              <input type="checkbox" checked={tc.isHidden} onChange={(e) => updateTestCase(i, 'isHidden', e.target.checked)} /> Hidden
            </label>
            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => set('testCases', form.testCases.filter((_, j) => j !== i))}><FiX size={14} /></button>
          </div>
        ))}
      </div>

      {/* Starter code */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Starter Code (JS)"><textarea className="form-input" rows={3} value={form.starterCode.javascript} onChange={(e) => set('starterCode', { ...form.starterCode, javascript: e.target.value })} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }} /></Field>
        <Field label="Starter Code (Python)"><textarea className="form-input" rows={3} value={form.starterCode.python} onChange={(e) => set('starterCode', { ...form.starterCode, python: e.target.value })} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }} /></Field>
      </div>

      <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : initial ? 'Update Problem' : 'Create Problem'}</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
//  CONTEST FORM
// ═══════════════════════════════════════════════
function ContestForm({ initial, onSaved }) {
  const [form, setForm] = useState({
    title: initial?.title || '',
    description: initial?.description || '',
    difficulty: initial?.difficulty || 'Mixed',
    duration: initial?.duration || 120,
    startTime: initial?.startTime ? new Date(initial.startTime).toISOString().slice(0, 16) : '',
    endTime: initial?.endTime ? new Date(initial.endTime).toISOString().slice(0, 16) : '',
    xpReward: initial?.xpReward || 50,
    problems: initial?.problems?.map((p) => p._id || p) || [],
  });
  const [availableProblems, setAvailableProblems] = useState([]);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    adminAPI.getProblems({ limit: 100 }).then((res) => setAvailableProblems(res.data.data)).catch(() => {});
  }, []);

  const toggleProblem = (id) => {
    set('problems', form.problems.includes(id) ? form.problems.filter((p) => p !== id) : [...form.problems, id]);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.startTime || !form.endTime) { toast.error('Title, start time, and end time required'); return; }
    setSaving(true);
    try {
      const payload = { ...form, startTime: new Date(form.startTime).toISOString(), endTime: new Date(form.endTime).toISOString() };
      if (initial?._id) await adminAPI.updateContest(initial._id, payload);
      else await adminAPI.createContest(payload);
      toast.success(initial ? 'Contest updated' : 'Contest created');
      onSaved();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  return (
    <div>
      <Field label="Title"><input className="form-input" value={form.title} onChange={(e) => set('title', e.target.value)} /></Field>
      <Field label="Description"><textarea className="form-input" rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} /></Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <Field label="Difficulty">
          <select className="form-input" value={form.difficulty} onChange={(e) => set('difficulty', e.target.value)}>
            <option>Easy</option><option>Medium</option><option>Hard</option><option>Mixed</option>
          </select>
        </Field>
        <Field label="Duration (min)"><input type="number" className="form-input" value={form.duration} onChange={(e) => set('duration', +e.target.value)} /></Field>
        <Field label="XP Reward"><input type="number" className="form-input" value={form.xpReward} onChange={(e) => set('xpReward', +e.target.value)} /></Field>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Start Time"><input type="datetime-local" className="form-input" value={form.startTime} onChange={(e) => set('startTime', e.target.value)} /></Field>
        <Field label="End Time"><input type="datetime-local" className="form-input" value={form.endTime} onChange={(e) => set('endTime', e.target.value)} /></Field>
      </div>

      {/* Problem selector */}
      <div style={{ marginTop: 4 }}>
        <label className="form-label">Problems ({form.problems.length} selected)</label>
        <div style={{ maxHeight: 200, overflow: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 8 }}>
          {availableProblems.map((p) => (
            <label key={p._id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 6, cursor: 'pointer', fontSize: '0.82rem', background: form.problems.includes(p._id) ? 'var(--primary-bg)' : 'transparent' }}>
              <input type="checkbox" checked={form.problems.includes(p._id)} onChange={() => toggleProblem(p._id)} />
              <span style={{ fontWeight: 500 }}>{p.title}</span>
              <span className={`badge badge-${p.difficulty === 'Easy' ? 'easy' : p.difficulty === 'Hard' ? 'hard' : 'medium'}`} style={{ fontSize: '0.65rem' }}>{p.difficulty}</span>
            </label>
          ))}
          {availableProblems.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textAlign: 'center', padding: 16 }}>No problems available. Create problems first.</p>}
        </div>
      </div>

      <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : initial ? 'Update Contest' : 'Create Contest'}</button>
      </div>
    </div>
  );
}
