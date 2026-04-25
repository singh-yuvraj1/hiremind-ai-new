import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ScoreRing from '../components/ScoreRing';
import { interviewAPI } from '../services/api';

// resources shown based on weak areas
const resourceMap = {
  communication: [
    { title: 'Effective Communication — Coursera', url: 'https://coursera.org',  type: 'Free Course' },
    { title: 'How to Answer Interview Questions',  url: 'https://youtube.com',   type: 'YouTube' },
  ],
  confidence: [
    { title: 'Body Language for Interviews',       url: 'https://youtube.com',   type: 'YouTube' },
    { title: 'Overcoming Interview Anxiety',       url: '#',                     type: 'Article' },
  ],
  answerQuality: [
    { title: 'LeetCode Practice',                  url: 'https://leetcode.com',  type: 'Practice' },
    { title: 'System Design Primer',               url: 'https://github.com',    type: 'GitHub' },
  ],
  posture: [
    { title: 'Body Language in Interviews',        url: '#',                     type: 'Article' },
    { title: 'Professional Presence Online',       url: '#',                     type: 'Guide' },
  ],
};

// color helper: green >=70, amber >=50, red <50
const scoreColor = v => v >= 70 ? '#22c55e' : v >= 50 ? '#f59e0b' : '#ef4444';

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
    <div className="min-h-screen t-bg flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-transparent rounded-full animate-spin"
        style={{ borderTopColor: 'var(--accent)' }} />
    </div>
  );

  if (!session) return (
    <div className="min-h-screen t-bg flex items-center justify-center text-center px-4">
      <div>
        <p className="t-muted mb-4">Session not found.</p>
        <Link to="/dashboard" style={{ color: 'var(--accent)' }}>← Back to Dashboard</Link>
      </div>
    </div>
  );

  const fb    = session.feedback;
  const score = fb.overallScore || 0;

  const grade = score >= 85 ? 'A' : score >= 70 ? 'B' : score >= 55 ? 'C' : score >= 35 ? 'D' : 'F';
  const gradeColor = { A: '#22c55e', B: '#00e5ff', C: '#fb923c', D: '#f97316', F: '#ef4444' }[grade];

  // All score rings — 7 dimensions
  const rings = [
    { label: 'Overall',       val: score },
    { label: 'Technical',     val: fb.technicalScore || fb.answerQuality || 0 },
    { label: 'Communication', val: fb.communication  || 0 },
    { label: 'Confidence',    val: fb.confidence     || 0 },
    { label: 'Eye Contact',   val: fb.eyeContact     || 0 },
    { label: 'Posture',       val: fb.posture        || 0 },
    { label: 'Dressing',      val: fb.dressing       || 0 },
  ];

  const radarData = [
    { subject: 'Technical',     value: fb.technicalScore || fb.answerQuality || 0 },
    { subject: 'Communication', value: fb.communication  || 0 },
    { subject: 'Confidence',    value: fb.confidence     || 0 },
    { subject: 'Eye Contact',   value: fb.eyeContact     || 0 },
    { subject: 'Posture',       value: fb.posture        || 0 },
    { subject: 'Dressing',      value: fb.dressing       || 0 },
  ];

  // figure out which areas need improvement
  const weakAreas = ['communication', 'confidence', 'answerQuality', 'posture'].filter(
    a => (fb[a] || 0) < 60
  );

  // per-question feedback from RAG evaluator
  const perQFeedback = fb.perQuestionFeedback || [];

  const fmtDate = new Date(session.createdAt).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const TABS = ['overview', 'questions', 'ai-feedback', 'resources'];

  return (
    <div className="min-h-screen t-bg flex flex-col" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-5 pt-24 pb-16">

        {/* header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <Link to="/dashboard" className="text-xs t-muted flex items-center gap-1 mb-3 hover:text-[var(--accent)] transition-colors">
              ← Back to Dashboard
            </Link>
            <div className="flex items-center flex-wrap gap-3 mb-1">
              <h1 className="font-display font-bold text-3xl t-text">Interview Feedback</h1>
              {fb.aiEvaluated ? (
                <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
                  🤖 AI Evaluated
                </span>
              ) : (
                <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{ background: 'rgba(251,146,60,0.1)', color: '#fb923c', border: '1px solid rgba(251,146,60,0.2)' }}>
                  📊 RAG Evaluated
                </span>
              )}
            </div>
            <p className="t-muted text-sm">{session.jobRole} · {fmtDate}</p>
          </div>

          {/* grade + score */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="font-display font-extrabold text-6xl" style={{ color: gradeColor }}>{grade}</div>
              <div className="text-xs t-muted mt-1">Grade</div>
            </div>
            <div className="t-card rounded-2xl p-4 text-center min-w-[100px]">
              <div className="font-display font-bold text-3xl grad-text">{score}</div>
              <div className="text-xs t-muted mt-1">/ 100</div>
            </div>
          </div>
        </motion.div>

        {/* Score Weight Banner */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="mb-6 rounded-xl px-4 py-3 text-xs flex flex-wrap gap-3 items-center"
          style={{ background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.15)' }}>
          <span className="t-muted font-medium">Score Weights:</span>
          {[
            ['Technical', '40%', '#00e5ff'],
            ['Communication', '25%', '#a855f7'],
            ['Confidence', '15%', '#22c55e'],
            ['Eye Contact', '10%', '#f59e0b'],
            ['Posture', '5%', '#f97316'],
            ['Dressing', '5%', '#ec4899'],
          ].map(([label, pct, col]) => (
            <span key={label} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: col }} />
              <span style={{ color: col }} className="font-medium">{label}</span>
              <span className="t-muted">{pct}</span>
            </span>
          ))}
        </motion.div>

        {/* tabs */}
        <div className="flex gap-1 mb-7 p-1 rounded-xl w-fit"
          style={{ background: 'rgba(128,128,128,0.08)' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all"
              style={{
                background: tab === t ? 'rgba(128,128,128,0.15)' : 'transparent',
                color: tab === t ? 'var(--text)' : 'var(--muted)',
                border: tab === t ? '1px solid var(--border)' : '1px solid transparent',
              }}>
              {t.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {tab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">

            {/* score rings — 7 dimensions */}
            <div className="t-card rounded-2xl p-7">
              <h2 className="font-display font-semibold t-text mb-7">Score Breakdown</h2>
              <div className="flex flex-wrap gap-6 justify-around">
                {rings.map(r => <ScoreRing key={r.label} score={r.val} label={r.label} size={100} />)}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">

              {/* radar chart */}
              <div className="t-card rounded-2xl p-6">
                <h2 className="font-display font-semibold t-text mb-4">Skill Radar</h2>
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(128,128,128,0.1)" />
                    <PolarAngleAxis dataKey="subject"
                      tick={{ fill: 'var(--muted)', fontSize: 10 }} />
                    <Radar name="Score" dataKey="value"
                      stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.12} strokeWidth={2} />
                    <Tooltip
                      contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 12 }}
                      formatter={v => [`${v}/100`]}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* summary + strengths + suggestions */}
              <div className="t-card rounded-2xl p-6 space-y-5">
                <div>
                  <h2 className="font-display font-semibold t-text mb-3">AI Assessment</h2>
                  <p className="text-sm t-muted leading-relaxed p-3 rounded-xl"
                    style={{ background: 'rgba(128,128,128,0.05)', borderLeft: '2px solid var(--accent)' }}>
                    {fb.summary || 'No summary available.'}
                  </p>
                </div>

                {fb.strengths?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium t-text mb-2">✅ Strengths</h3>
                    <ul className="space-y-1.5">
                      {fb.strengths.map((s, i) => (
                        <li key={i} className="flex gap-2 text-sm text-green-400">
                          <span className="flex-shrink-0 mt-0.5">→</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {fb.weaknesses?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium t-text mb-2">⚠️ Weaknesses</h3>
                    <ul className="space-y-1.5">
                      {fb.weaknesses.map((s, i) => (
                        <li key={i} className="flex gap-2 text-sm" style={{ color: '#f97316' }}>
                          <span className="flex-shrink-0 mt-0.5">→</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {fb.suggestions?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium t-text mb-2">📌 Improvements</h3>
                    <ul className="space-y-1.5">
                      {fb.suggestions.slice(0, 4).map((s, i) => (
                        <li key={i} className="flex gap-2 text-sm t-muted">
                          <span className="flex-shrink-0 mt-0.5" style={{ color: 'var(--accent)' }}>→</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* session meta */}
            <div className="t-card rounded-2xl p-5">
              <div className="grid grid-cols-3 gap-4 text-center">
                {[
                  { label: 'Questions', val: session.questions.length },
                  { label: 'Duration',  val: `${Math.floor(session.duration / 60)}m ${session.duration % 60}s` },
                  { label: 'Difficulty',val: session.difficulty },
                ].map(m => (
                  <div key={m.label}>
                    <div className="font-display font-bold text-2xl t-text">{m.val}</div>
                    <div className="text-xs t-muted mt-1 capitalize">{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── QUESTIONS TAB ── */}
        {tab === 'questions' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {session.questions.map((q, i) => {
              const pqf    = perQFeedback[i];
              const qScore = pqf?.score ?? null;
              const qColor = qScore !== null ? scoreColor(qScore) : '#6b7280';
              const qLabel = qScore !== null
                ? (qScore >= 70 ? 'Strong' : qScore >= 50 ? 'Decent' : qScore >= 25 ? 'Weak' : 'Missed')
                : 'Unscored';

              return (
                <div key={i} className="t-card rounded-2xl p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: 'rgba(128,128,128,0.1)', color: 'var(--accent)' }}>
                      {i + 1}
                    </div>
                    <p className="font-medium t-text">{q.question}</p>
                  </div>
                  <div className="ml-10">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: `${qColor}15`, color: qColor, border: `1px solid ${qColor}30` }}>
                        {qLabel}{qScore !== null ? ` · ${qScore}/100` : ''}
                      </span>
                      {pqf?.ragUsed && (
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(0,229,255,0.08)', color: 'var(--accent)', border: '1px solid rgba(0,229,255,0.2)' }}>
                          🔍 RAG Evaluated
                        </span>
                      )}
                    </div>
                    <p className="text-sm t-muted leading-relaxed p-3 rounded-xl"
                      style={{ background: 'rgba(128,128,128,0.04)' }}>
                      {q.answer?.trim() || <span className="italic opacity-50">No answer given</span>}
                    </p>
                    {pqf?.feedback && (
                      <p className="text-xs mt-2 p-2 rounded-lg t-accent"
                        style={{ background: 'rgba(128,128,128,0.04)', borderLeft: '2px solid var(--accent)' }}>
                        🤖 {pqf.feedback}
                      </p>
                    )}
                    {pqf?.matchedConcepts?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {pqf.matchedConcepts.map((c, ci) => (
                          <span key={ci} className="text-xs px-1.5 py-0.5 rounded"
                            style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
                            ✓ {c}
                          </span>
                        ))}
                        {pqf.missingConcepts?.map((c, ci) => (
                          <span key={`m${ci}`} className="text-xs px-1.5 py-0.5 rounded"
                            style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                            ✗ {c}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* ── AI FEEDBACK TAB ── */}
        {tab === 'ai-feedback' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <p className="text-sm t-muted mb-2">
              Smart feedback generated based on your actual performance across all dimensions.
            </p>

            {/* Dynamic feedback cards */}
            {(fb.dynamicFeedback?.length > 0 ? fb.dynamicFeedback : fb.suggestions || []).map((msg, i) => {
              const isGood  = msg.startsWith('✅');
              const isWarn  = msg.startsWith('⚠️');
              const color   = isGood ? '#22c55e' : isWarn ? '#ef4444' : 'var(--accent)';
              const bgColor = isGood ? 'rgba(34,197,94,0.07)' : isWarn ? 'rgba(239,68,68,0.07)' : 'rgba(0,229,255,0.06)';
              return (
                <div key={i} className="t-card rounded-xl p-5"
                  style={{ borderLeft: `3px solid ${color}`, background: bgColor }}>
                  <p className="text-sm leading-relaxed" style={{ color: isGood ? '#22c55e' : isWarn ? '#fca5a5' : 'var(--text)' }}>
                    {msg}
                  </p>
                </div>
              );
            })}

            {/* Matched / Missing concepts from RAG */}
            {fb.matchedConcepts?.length > 0 && (
              <div className="t-card rounded-2xl p-6">
                <h3 className="font-semibold t-text mb-3">🧠 Concept Coverage</h3>
                <div className="mb-3">
                  <p className="text-xs t-muted mb-2 font-medium uppercase tracking-wide">Covered</p>
                  <div className="flex flex-wrap gap-1.5">
                    {fb.matchedConcepts.map((c, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded-full"
                        style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }}>
                        ✓ {c}
                      </span>
                    ))}
                  </div>
                </div>
                {fb.missingConcepts?.length > 0 && (
                  <div>
                    <p className="text-xs t-muted mb-2 font-medium uppercase tracking-wide">Missing</p>
                    <div className="flex flex-wrap gap-1.5">
                      {fb.missingConcepts.map((c, i) => (
                        <span key={i} className="text-xs px-2 py-1 rounded-full"
                          style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                          ✗ {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* ── RESOURCES TAB ── */}
        {tab === 'resources' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            <p className="text-sm t-muted">
              Based on your scores, here are resources to help you improve in weak areas.
            </p>

            {(weakAreas.length > 0 ? weakAreas : ['answerQuality', 'communication']).map(area => (
              <div key={area} className="t-card rounded-2xl p-6">
                <h3 className="font-display font-semibold capitalize t-text mb-4">
                  {area.replace('answerQuality', 'Answer Quality')} Resources
                  <span className="ml-2 text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                    Needs Work
                  </span>
                </h3>
                <div className="space-y-2">
                  {(resourceMap[area] || []).map((r, i) => (
                    <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 rounded-xl border transition-all"
                      style={{ background: 'rgba(128,128,128,0.04)', borderColor: 'var(--border)' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                    >
                      <div>
                        <p className="text-sm t-text">{r.title}</p>
                        <p className="text-xs t-muted mt-0.5">{r.type}</p>
                      </div>
                      <svg className="w-4 h-4 t-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex gap-3">
              <Link to="/interview" className="flex-1 py-3.5 rounded-xl text-center text-sm font-semibold text-white btn-primary">
                Practice Again
              </Link>
              <Link to="/mock-test" className="flex-1 py-3.5 rounded-xl text-center text-sm btn-outline">
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