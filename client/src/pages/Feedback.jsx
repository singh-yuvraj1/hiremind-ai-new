import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, Tooltip
} from 'recharts';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ScoreRing from '../components/ScoreRing';
import { interviewAPI } from '../services/api';

const resourceMap = {
  communication: [
    { title: 'Effective Communication — Coursera', url: 'https://coursera.org',  type: 'Free Course' },
    { title: 'How to Answer Interview Questions',  url: 'https://youtube.com',   type: 'YouTube' },
  ],
  answerQuality: [
    { title: 'LeetCode Practice',                  url: 'https://leetcode.com',  type: 'Practice' },
    { title: 'System Design Primer',               url: 'https://github.com',    type: 'GitHub' },
  ],
};

const scoreColor = v => v >= 70 ? '#22c55e' : v >= 50 ? '#3b82f6' : v >= 35 ? '#f59e0b' : '#ef4444';

export default function Feedback() {
  const { id }               = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState('overview');

  useEffect(() => {
    interviewAPI.getOne(id)
      .then(res => setSession(res.data.session))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen t-bg" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Navbar />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div style={{ width: 28, height: 28, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.75s linear infinite' }} />
      </div>
    </div>
  );

  if (!session) return (
    <div className="min-h-screen t-bg" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Navbar />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', flexDirection: 'column', gap: 16 }}>
        <p style={{ color: 'var(--muted)', fontSize: '0.9375rem' }}>Session not found.</p>
        <Link to="/dashboard" className="btn-primary" style={{ padding: '8px 20px', textDecoration: 'none' }}>
          Back to Dashboard
        </Link>
      </div>
    </div>
  );

  const fb             = session.feedback || {};
  const technicalVal   = Number(fb.technicalScore ?? fb.answerQuality ?? 0);
  const communicationVal = Number(fb.communication ?? 0);
  // Calculate overall score strictly using Technical (70%) and Communication (30%)
  const score = Math.round(technicalVal * 0.70 + communicationVal * 0.30);
  const grade = score >= 85 ? 'A' : score >= 70 ? 'B' : score >= 55 ? 'C' : score >= 35 ? 'D' : 'F';
  const gradeColor = { A: '#22c55e', B: '#3b82f6', C: '#f59e0b', D: '#f97316', F: '#ef4444' }[grade];

  const rings = [
    { label: 'Overall',       val: score },
    { label: 'Technical',     val: technicalVal },
    { label: 'Communication', val: communicationVal },
  ];

  const radarData = [
    { subject: 'Technical',     value: technicalVal },
    { subject: 'Communication', value: communicationVal },
  ];

  const weakAreas = ['communication', 'answerQuality'].filter(
    a => (fb[a] || 0) < 60
  );

  const isNotPostureDressing = (text) => {
    if (typeof text !== 'string') return true;
    return !/posture|dressing/i.test(text);
  };

  const filteredStrengths  = (fb.strengths || []).filter(isNotPostureDressing);
  const filteredWeaknesses = (fb.weaknesses || []).filter(isNotPostureDressing);
  const rawFeedbackList    = (fb.dynamicFeedback?.length > 0 ? fb.dynamicFeedback : fb.suggestions || []);
  const filteredFeedbackList = rawFeedbackList.filter(isNotPostureDressing);

  const cleanSummary = (text) => {
    if (!text) return 'No summary available.';
    return text
      .replace(/,\s*(?:and\s*)?(?:strong|poor|moderate)?\s*body\s*posture\.?/gi, '.')
      .replace(/,\s*(?:and\s*)?sitting\s*upright\.?/gi, '.')
      .replace(/\s+\./g, '.');
  };

  const perQFeedback = fb.perQuestionFeedback || [];
  const fmtDate = new Date(session.createdAt).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const TABS = [
    { id: 'overview',    label: 'Overview' },
    { id: 'questions',   label: 'Questions' },
    { id: 'ai-feedback', label: 'AI Feedback' },
    { id: 'resources',   label: 'Resources' },
  ];

  return (
    <div className="min-h-screen t-bg" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Navbar />

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: 'calc(var(--nav-h) + 2rem) 1.5rem 3rem' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2rem' }}>
          <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', color: 'var(--muted)', textDecoration: 'none', marginBottom: '1rem', fontWeight: 500 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Back to Dashboard
          </Link>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.025em', margin: 0 }}>
                  Interview Feedback
                </h1>
                {fb.aiEvaluated ? (
                  <span className="badge badge-success">AI Evaluated</span>
                ) : (
                  <span className="badge badge-warning">RAG Evaluated</span>
                )}
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--muted)', margin: 0 }}>
                {session.jobRole} · {fmtDate}
              </p>
            </div>

            {/* Grade + Score */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1, color: gradeColor, letterSpacing: '-0.03em' }}>{grade}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 4 }}>Grade</div>
              </div>
              <div
                className="card"
                style={{ padding: '0.75rem 1.125rem', textAlign: 'center', minWidth: 90 }}
              >
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.04em', lineHeight: 1 }}>{score}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 4 }}>out of 100</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Score weight banner */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }}
          className="alert alert-info"
          style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}
        >
          <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>Score weights:</span>
          {[
            ['Technical', '70%', '#3b82f6'],
            ['Communication', '30%', '#a855f7'],
          ].map(([label, pct, col]) => (
            <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: col, flexShrink: 0 }} />
              <span style={{ color: 'var(--text-2)', fontWeight: 500 }}>{label}</span>
              <span style={{ color: 'var(--muted)' }}>{pct}</span>
            </span>
          ))}
        </motion.div>

        {/* Tabs */}
        <div className="tabs" style={{ marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`tab-item${tab === t.id ? ' active' : ''}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Score rings */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text)', margin: '0 0 1.75rem', letterSpacing: '-0.01em' }}>
                Score Breakdown
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'space-around' }}>
                {rings.map(r => <ScoreRing key={r.label} score={r.val} label={r.label} size={90} />)}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }} className="md-grid">

              {/* Radar */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text)', margin: '0 0 1rem', letterSpacing: '-0.01em' }}>
                  Skill Radar
                </h2>
                <ResponsiveContainer width="100%" height={240}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--muted)', fontSize: 11 }} />
                    <Radar name="Score" dataKey="value" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.10} strokeWidth={2} />
                    <Tooltip
                      contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 12 }}
                      formatter={v => [`${v}/100`]}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* AI Assessment */}
              <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text)', margin: 0, letterSpacing: '-0.01em' }}>
                  AI Assessment
                </h2>
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-2)',
                    lineHeight: 1.65,
                    padding: '0.875rem',
                    borderRadius: 8,
                    background: 'var(--surface2)',
                    borderLeft: '3px solid var(--accent)',
                    margin: 0,
                  }}
                >
                  {cleanSummary(fb.summary)}
                </p>

                {filteredStrengths.length > 0 && (
                  <div>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--success)', margin: '0 0 8px' }}>Strengths</p>
                    <ul style={{ margin: 0, paddingLeft: '1.125rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {filteredStrengths.map((s, i) => (
                        <li key={i} style={{ fontSize: '0.8125rem', color: 'var(--text-2)', lineHeight: 1.5 }}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {filteredWeaknesses.length > 0 && (
                  <div>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--warning)', margin: '0 0 8px' }}>Areas to Improve</p>
                    <ul style={{ margin: 0, paddingLeft: '1.125rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {filteredWeaknesses.map((s, i) => (
                        <li key={i} style={{ fontSize: '0.8125rem', color: 'var(--text-2)', lineHeight: 1.5 }}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Session meta */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                {[
                  { label: 'Questions',  val: (session.questions || []).length },
                  { label: 'Duration',   val: `${Math.floor((session.duration || 0) / 60)}m ${(session.duration || 0) % 60}s` },
                  { label: 'Difficulty', val: session.difficulty || 'medium' },
                ].map(m => (
                  <div key={m.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.03em', marginBottom: 4, textTransform: 'capitalize' }}>
                      {m.val}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{m.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <style>{`
              @media (max-width: 768px) { .md-grid { grid-template-columns: 1fr !important; } }
            `}</style>
          </motion.div>
        )}

        {/* ── QUESTIONS ── */}
        {tab === 'questions' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {(session.questions || []).map((q, i) => {
              const pqf    = perQFeedback[i];
              const qScore = pqf?.score ?? null;
              const qColor = qScore !== null ? scoreColor(qScore) : 'var(--muted)';
              const qLabel = qScore !== null
                ? (qScore >= 70 ? 'Strong' : qScore >= 50 ? 'Decent' : qScore >= 25 ? 'Weak' : 'Missed')
                : 'Unscored';
              const qText = typeof q === 'string' ? q : (q?.question || '');
              const aText = typeof q === 'string' ? (session.answers && session.answers[i]) : (q?.answer || (session.answers && session.answers[i]) || '');

              return (
                <div key={i} className="card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        background: 'var(--surface2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--accent)',
                        flexShrink: 0,
                      }}
                    >
                      {i + 1}
                    </div>
                    <p style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--text)', margin: 0, lineHeight: 1.55 }}>
                      {qText}
                    </p>
                  </div>
                  <div style={{ paddingLeft: 40 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '2px 8px',
                          borderRadius: 100,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: `${qColor}15`,
                          color: qColor,
                          border: `1px solid ${qColor}30`,
                        }}
                      >
                        {qLabel}{qScore !== null ? ` · ${qScore}/100` : ''}
                      </span>
                      {pqf?.ragUsed && (
                        <span className="badge badge-accent" style={{ fontSize: '0.6875rem' }}>RAG Evaluated</span>
                      )}
                    </div>
                    <p
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-2)',
                        lineHeight: 1.65,
                        padding: '0.75rem',
                        borderRadius: 8,
                        background: 'var(--surface2)',
                        margin: 0,
                        fontStyle: aText?.trim() ? 'normal' : 'italic',
                        opacity: aText?.trim() ? 1 : 0.6,
                      }}
                    >
                      {aText?.trim() || 'No answer given'}
                    </p>
                    {pqf?.feedback && (
                      <p
                        style={{
                          fontSize: '0.8125rem',
                          color: 'var(--text-2)',
                          padding: '0.625rem 0.875rem',
                          borderRadius: 8,
                          background: 'var(--accent-bg)',
                          borderLeft: '3px solid var(--accent)',
                          marginTop: 8,
                          lineHeight: 1.6,
                        }}
                      >
                        {pqf.feedback}
                      </p>
                    )}
                    {pqf?.matchedConcepts?.length > 0 && (
                      <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {pqf.matchedConcepts.map((c, ci) => (
                          <span key={ci} className="badge badge-success" style={{ fontSize: '0.6875rem' }}>✓ {c}</span>
                        ))}
                        {pqf.missingConcepts?.map((c, ci) => (
                          <span key={`m${ci}`} className="badge badge-danger" style={{ fontSize: '0.6875rem' }}>✗ {c}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* ── AI FEEDBACK ── */}
        {tab === 'ai-feedback' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--muted)', marginBottom: 4 }}>
              Smart feedback generated from your actual performance across all dimensions.
            </p>

            {filteredFeedbackList.map((msg, i) => {
              const isGood = msg.startsWith('✅');
              const isWarn = msg.startsWith('⚠️');
              const type   = isGood ? 'success' : isWarn ? 'error' : 'info';
              return (
                <div key={i} className={`alert alert-${type}`}>
                  <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.6 }}>{msg}</p>
                </div>
              );
            })}

            {fb.matchedConcepts?.length > 0 && (
              <div className="card" style={{ padding: '1.5rem', marginTop: 8 }}>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text)', margin: '0 0 1rem', letterSpacing: '-0.01em' }}>
                  Concept Coverage
                </h3>
                <div style={{ marginBottom: '0.875rem' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Covered</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {fb.matchedConcepts.map((c, i) => (
                      <span key={i} className="badge badge-success" style={{ fontSize: '0.75rem' }}>✓ {c}</span>
                    ))}
                  </div>
                </div>
                {fb.missingConcepts?.length > 0 && (
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Missing</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {fb.missingConcepts.map((c, i) => (
                        <span key={i} className="badge badge-danger" style={{ fontSize: '0.75rem' }}>✗ {c}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* ── RESOURCES ── */}
        {tab === 'resources' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>
              Based on your scores, here are targeted resources to help you improve.
            </p>

            {(weakAreas.length > 0 ? weakAreas : ['answerQuality', 'communication']).map(area => (
              <div key={area} className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text)', margin: 0, textTransform: 'capitalize', letterSpacing: '-0.01em' }}>
                    {area.replace('answerQuality', 'Answer Quality')} Resources
                  </h3>
                  <span className="badge badge-danger" style={{ fontSize: '0.6875rem' }}>Needs Work</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(resourceMap[area] || []).map((r, i) => (
                    <a
                      key={i}
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem', borderRadius: 8, border: '1px solid var(--border)', transition: 'all 0.15s ease' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-border)'; e.currentTarget.style.background = 'var(--surface2)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent'; }}
                    >
                      <div>
                        <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text)', margin: '0 0 3px' }}>{r.title}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--muted)', margin: 0 }}>{r.type}</p>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
              <Link to="/interview" className="btn-primary" style={{ flex: 1, textAlign: 'center', padding: '11px', textDecoration: 'none', display: 'block', borderRadius: 8 }}>
                Practice Again
              </Link>
              <Link to="/mock-test" className="btn-secondary" style={{ flex: 1, textAlign: 'center', padding: '11px', textDecoration: 'none', display: 'block', borderRadius: 8 }}>
                Take Mock Test
              </Link>
            </div>
          </motion.div>
        )}

      </main>
      <Footer />
    </div>
  );
}