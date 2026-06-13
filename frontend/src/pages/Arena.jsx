import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { problemsAPI, submissionsAPI, aiAPI } from '../api/services';
import { useTheme } from '../context/ThemeContext';
import { LANGUAGES, getMonacoLanguage, getVerdictColor } from '../utils/helpers';
import { FiPlay, FiSend, FiCpu, FiCheckCircle, FiXCircle, FiAlertTriangle, FiClock, FiDatabase, FiChevronRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Arena() {
  const { slug } = useParams();
  const { theme } = useTheme();
  const [problem, setProblem] = useState(null);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [tab, setTab] = useState('description');
  const [outputTab, setOutputTab] = useState('output');
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    problemsAPI.getOne(slug).then((res) => {
      const p = res.data.data;
      setProblem(p);
      setCode(p.starterCode?.[language] || getDefaultStarter(language));
    }).catch(() => toast.error('Failed to load problem'));
  }, [slug]);

  useEffect(() => {
    if (problem?.starterCode?.[language]) setCode(problem.starterCode[language]);
    else setCode(getDefaultStarter(language));
  }, [language]);

  useEffect(() => {
    if (problem) {
      submissionsAPI.getAll({ problemId: problem._id, limit: 10 })
        .then((res) => setSubmissions(res.data.data))
        .catch(() => {});
    }
  }, [problem, submitResult]);

  const getDefaultStarter = (lang) => {
    const starters = {
      javascript: '// Write your solution here\nfunction solution(input) {\n  \n}\n',
      python: '# Write your solution here\ndef solution(input):\n    pass\n',
      cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}\n',
      java: 'public class Main {\n    public static void main(String[] args) {\n        \n    }\n}\n',
    };
    return starters[lang] || `// Write your ${lang} solution here\n`;
  };

  const handleRun = async () => {
    setRunning(true);
    setOutputTab('output');
    setRunResult(null);
    try {
      const input = problem?.examples?.[0]?.input || '';
      const { data } = await submissionsAPI.run({
        code, language, input, problemId: problem._id,
      });
      setRunResult(data.data);
    } catch (err) {
      setRunResult({ error: err.response?.data?.message || 'Execution failed', status: 'Error' });
    }
    setRunning(false);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setOutputTab('results');
    setSubmitResult(null);
    try {
      const { data } = await submissionsAPI.submit({ problemId: problem._id, code, language });
      setSubmitResult(data.data);
      if (data.data.analysis?.verdict === 'Accepted') toast.success('Solution Accepted!');
      else toast.error(data.data.analysis?.verdict || 'Not accepted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    }
    setSubmitting(false);
  };

  const handleAI = async (type) => {
    setAiLoading(true);
    setOutputTab('ai');
    try {
      let res;
      if (type === 'hint') res = await aiAPI.getHint({ problemId: problem._id });
      else if (type === 'explain') res = await aiAPI.explainProblem({ problemId: problem._id });
      else if (type === 'optimize') res = await aiAPI.optimize({ code, language, problemId: problem._id });
      else if (type === 'error') res = await aiAPI.explainError({ code, language, errorMessage: runResult?.error || '' });
      setAiResponse(res.data.data[Object.keys(res.data.data)[0]]);
    } catch { setAiResponse('AI service unavailable. Check your GEMINI_API_KEY.'); }
    setAiLoading(false);
  };

  if (!problem) return <div className="loading-center"><div className="spinner spinner-lg" /></div>;

  const diffBadge = problem.difficulty === 'Easy' ? 'badge-easy' : problem.difficulty === 'Medium' ? 'badge-medium' : 'badge-hard';

  return (
    <div style={S.page}>
      {/* LEFT PANEL */}
      <div style={S.left}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
          {['description', 'examples', 'submissions'].map((t) => (
            <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)} style={{ textTransform: 'capitalize', fontSize: '0.82rem' }}>{t}</button>
          ))}
        </div>

        {tab === 'description' && (
          <>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 8 }}>{problem.title}</h2>
            <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
              <span className={`badge ${diffBadge}`}>{problem.difficulty}</span>
              {problem.tags?.map((t) => <span key={t} className="badge badge-primary">{t}</span>)}
            </div>
            <div style={{ fontSize: '0.88rem', lineHeight: 1.8, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{problem.description}</div>
            {problem.constraints && (
              <div style={{ marginTop: 16 }}>
                <h4 style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 4, color: 'var(--text-muted)' }}>Constraints</h4>
                <pre style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>{problem.constraints}</pre>
              </div>
            )}
            {problem.examples?.map((ex, i) => (
              <div key={i} style={{ background: 'var(--bg-alt)', borderRadius: 10, padding: 14, marginTop: 12 }}>
                <strong style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Example {i + 1}</strong>
                <div style={{ marginTop: 6, fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                  <div><span style={{ color: 'var(--text-muted)' }}>Input: </span>{ex.input}</div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Output: </span>{ex.output}</div>
                  {ex.explanation && <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: 4 }}>{ex.explanation}</div>}
                </div>
              </div>
            ))}
          </>
        )}

        {tab === 'examples' && problem.examples?.map((ex, i) => (
          <div key={i} style={{ background: 'var(--bg-alt)', borderRadius: 10, padding: 14, marginBottom: 10 }}>
            <strong style={{ fontSize: '0.8rem' }}>Example {i + 1}</strong>
            <pre style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', marginTop: 6 }}>Input:  {ex.input}{'\n'}Output: {ex.output}</pre>
            {ex.explanation && <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 6 }}>{ex.explanation}</p>}
          </div>
        ))}

        {tab === 'submissions' && (
          submissions.length > 0 ? submissions.map((s) => (
            <div key={s._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-light)', fontSize: '0.82rem' }}>
              <div>
                <span style={{ fontWeight: 600, color: getVerdictColor(s.verdict) }}>{s.verdict}</span>
                <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>{s.language}</span>
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                {s.testCasesPassed}/{s.totalTestCases} passed
              </div>
            </div>
          )) : <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: 20, textAlign: 'center' }}>No submissions yet</p>
        )}

        {/* AI Tools */}
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          <h4 style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Assistant</h4>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              { type: 'hint', label: 'Hint' },
              { type: 'explain', label: 'Explain' },
              { type: 'optimize', label: 'Optimize' },
              ...(runResult?.error ? [{ type: 'error', label: 'Debug Error' }] : []),
            ].map((ai) => (
              <button key={ai.type} className="btn btn-secondary btn-sm" onClick={() => handleAI(ai.type)} disabled={aiLoading} style={{ fontSize: '0.75rem' }}>
                <FiCpu size={12} /> {ai.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={S.right}>
        {/* Toolbar */}
        <div style={S.toolbar}>
          <select style={S.select} value={language} onChange={(e) => setLanguage(e.target.value)}>
            {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-outline btn-sm" onClick={handleRun} disabled={running} style={{ minWidth: 80 }}>
              {running ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : <><FiPlay size={13} /> Run</>}
            </button>
            <button className="btn btn-success btn-sm" onClick={handleSubmit} disabled={submitting} style={{ minWidth: 100 }}>
              {submitting ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : <><FiSend size={13} /> Submit</>}
            </button>
          </div>
        </div>

        {/* Editor */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <Editor
            height="100%"
            language={getMonacoLanguage(language)}
            value={code}
            onChange={(v) => setCode(v || '')}
            theme={theme === 'dark' ? 'vs-dark' : 'light'}
            options={{
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              minimap: { enabled: false },
              padding: { top: 16 },
              scrollBeyondLastLine: false,
              bracketPairColorization: { enabled: true },
              automaticLayout: true,
            }}
          />
        </div>

        {/* Output panel */}
        <div style={S.output}>
          <div style={{ display: 'flex', gap: 4, padding: '0 16px', borderBottom: '1px solid var(--border)' }}>
            {['output', 'results', 'ai'].map((t) => (
              <button key={t} className={`tab ${outputTab === t ? 'active' : ''}`} onClick={() => setOutputTab(t)} style={{ textTransform: 'capitalize', fontSize: '0.78rem' }}>{t}</button>
            ))}
          </div>

          <div style={{ padding: 16, overflow: 'auto', flex: 1 }}>
            {/* RUN OUTPUT */}
            {outputTab === 'output' && (
              runResult ? (
                <div style={{ fontSize: '0.82rem' }}>
                  {runResult.error && <div style={{ color: 'var(--danger)', marginBottom: 8, fontFamily: 'var(--font-mono)' }}>{runResult.error}</div>}
                  {runResult.output && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', fontWeight: 600 }}>Output</div>
                      <pre style={{ fontFamily: 'var(--font-mono)', background: 'var(--bg-alt)', padding: 12, borderRadius: 8 }}>{runResult.output}</pre>
                    </div>
                  )}
                  {runResult.explanation && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', fontWeight: 600 }}>Execution Trace</div>
                      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{runResult.explanation}</p>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 16, color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    {runResult.timeComplexity && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiClock size={12} /> {runResult.timeComplexity}</span>}
                    {runResult.spaceComplexity && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiDatabase size={12} /> {runResult.spaceComplexity}</span>}
                  </div>
                </div>
              ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Click "Run" to test your code</span>
            )}

            {/* SUBMIT RESULTS */}
            {outputTab === 'results' && (
              submitResult ? (
                <div style={{ fontSize: '0.82rem' }}>
                  {/* Verdict banner */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: 14, borderRadius: 10, marginBottom: 16,
                    background: submitResult.analysis?.verdict === 'Accepted' ? 'var(--accent-bg)' : '#FFF0F0',
                    border: `1px solid ${submitResult.analysis?.verdict === 'Accepted' ? 'var(--accent)' : 'var(--danger)'}20`,
                  }}>
                    {submitResult.analysis?.verdict === 'Accepted' ? <FiCheckCircle size={20} color="var(--success)" /> : <FiXCircle size={20} color="var(--danger)" />}
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: getVerdictColor(submitResult.analysis?.verdict) }}>{submitResult.analysis?.verdict}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {submitResult.submission?.testCasesPassed}/{submitResult.submission?.totalTestCases} test cases passed
                        {submitResult.analysis?.score !== undefined && ` · Score: ${submitResult.analysis.score}/100`}
                      </div>
                    </div>
                  </div>

                  {/* Complexity */}
                  <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                    {submitResult.analysis?.timeComplexity && (
                      <div style={{ flex: 1, background: 'var(--bg-alt)', padding: 12, borderRadius: 8, textAlign: 'center' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 2 }}>TIME</div>
                        <div style={{ fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>{submitResult.analysis.timeComplexity}</div>
                      </div>
                    )}
                    {submitResult.analysis?.spaceComplexity && (
                      <div style={{ flex: 1, background: 'var(--bg-alt)', padding: 12, borderRadius: 8, textAlign: 'center' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 2 }}>SPACE</div>
                        <div style={{ fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{submitResult.analysis.spaceComplexity}</div>
                      </div>
                    )}
                  </div>

                  {/* Test results */}
                  {submitResult.analysis?.testResults?.map((tc, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                      {tc.passed ? <FiCheckCircle size={15} color="var(--success)" /> : <FiXCircle size={15} color="var(--danger)" />}
                      <span style={{ fontWeight: 500 }}>Test {i + 1}</span>
                      <span style={{ color: tc.passed ? 'var(--success)' : 'var(--danger)', fontSize: '0.78rem', fontWeight: 500 }}>{tc.passed ? 'Passed' : 'Failed'}</span>
                      {!tc.passed && tc.actualOutput && (
                        <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          got: {tc.actualOutput}
                        </span>
                      )}
                    </div>
                  ))}

                  {/* Explanation */}
                  {submitResult.analysis?.explanation && (
                    <div style={{ marginTop: 14, padding: 12, background: 'var(--bg-alt)', borderRadius: 8 }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', fontWeight: 600 }}>Analysis</div>
                      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{submitResult.analysis.explanation}</p>
                    </div>
                  )}

                  {/* Suggestions */}
                  {submitResult.analysis?.suggestions && (
                    <div style={{ marginTop: 10, padding: 12, background: 'var(--primary-bg)', borderRadius: 8, borderLeft: '3px solid var(--primary)' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--primary)', marginBottom: 4, textTransform: 'uppercase', fontWeight: 600 }}>Suggestions</div>
                      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.82rem' }}>{submitResult.analysis.suggestions}</p>
                    </div>
                  )}
                </div>
              ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Click "Submit" to evaluate your solution</span>
            )}

            {/* AI PANEL */}
            {outputTab === 'ai' && (
              aiLoading ? <div className="spinner" style={{ margin: '30px auto' }} /> : aiResponse ? (
                <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>{aiResponse}</div>
              ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Use the AI Assistant buttons on the left panel</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const S = {
  page: { display: 'flex', height: 'calc(100vh - var(--header-height))', overflow: 'hidden' },
  left: { width: '40%', minWidth: 320, overflow: 'auto', borderRight: '1px solid var(--border)', background: 'var(--surface)', padding: 20 },
  right: { flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)' },
  toolbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', gap: 8 },
  select: { padding: '7px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: '0.82rem', fontWeight: 500, fontFamily: 'var(--font)' },
  output: { height: 260, borderTop: '1px solid var(--border)', background: 'var(--surface)', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
};
