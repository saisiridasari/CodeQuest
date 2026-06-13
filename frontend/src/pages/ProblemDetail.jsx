import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { problemsAPI } from '../api/services';
import { FiPlay, FiBookOpen, FiTag } from 'react-icons/fi';

export default function ProblemDetail() {
  const { slug } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    problemsAPI.getOne(slug).then((res) => setProblem(res.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="loading-center"><div className="spinner spinner-lg" /></div>;
  if (!problem) return <div className="page container"><div className="empty-state"><h3>Problem not found</h3></div></div>;

  const diffClass = problem.difficulty === 'Easy' ? 'badge-easy' : problem.difficulty === 'Medium' ? 'badge-medium' : 'badge-hard';

  return (
    <div className="page container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap', marginBottom: 32 }}>
        <div>
          <h1 className="page-title">{problem.title}</h1>
          <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span className={`badge ${diffClass}`}>{problem.difficulty}</span>
            {problem.tags?.map((t) => (
              <span key={t} className="badge badge-primary" style={{ gap: 4 }}><FiTag size={10} />{t}</span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 20, marginTop: 12, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span>Acceptance: {problem.acceptanceRate || 0}%</span>
            <span>Submissions: {problem.totalSubmissions || 0}</span>
            <span>XP: +{problem.xpReward}</span>
          </div>
        </div>
        <Link to={`/arena/${problem.slug}`} className="btn btn-primary btn-lg" style={{ gap: 8 }}>
          <FiPlay size={16} /> Solve Problem
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 12 }}><FiBookOpen style={{ marginRight: 6, verticalAlign: 'middle' }} />Description</h3>
            <div style={{ fontSize: '0.9rem', lineHeight: 1.8, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{problem.description}</div>
          </div>

          {problem.constraints && (
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>Constraints</h3>
              <pre style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', whiteSpace: 'pre-wrap' }}>{problem.constraints}</pre>
            </div>
          )}

          {problem.examples?.length > 0 && (
            <div className="card">
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 12 }}>Examples</h3>
              {problem.examples.map((ex, i) => (
                <div key={i} style={{ background: 'var(--bg-alt)', borderRadius: 12, padding: 16, marginBottom: i < problem.examples.length - 1 ? 12 : 0 }}>
                  <div style={{ marginBottom: 6 }}>
                    <strong style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Input:</strong>
                    <pre style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', marginTop: 2 }}>{ex.input}</pre>
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Output:</strong>
                    <pre style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', marginTop: 2 }}>{ex.output}</pre>
                  </div>
                  {ex.explanation && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 6 }}>
                      <strong>Explanation:</strong> {ex.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 12 }}>Quick Info</h3>
            <div style={{ display: 'grid', gap: 10 }}>
              {[
                ['Time Limit', `${problem.timeLimit || 2}s`],
                ['Memory Limit', `${problem.memoryLimit || 256} MB`],
                ['Test Cases', problem.totalTestCases || '—'],
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                  <span style={{ fontWeight: 600 }}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          {problem.hints?.length > 0 && (
            <div className="card">
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 12 }}>Hints</h3>
              {problem.hints.map((h, i) => (
                <details key={i} style={{ marginBottom: 8, fontSize: '0.82rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <summary style={{ fontWeight: 500, color: 'var(--primary)', padding: '4px 0' }}>Hint {i + 1}</summary>
                  <p style={{ padding: '6px 0 0 12px' }}>{h}</p>
                </details>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
