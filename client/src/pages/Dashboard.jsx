import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { interviewAPI } from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import ScoreRing from '../components/ScoreRing';
import SkeletonLoader, { SkeletonCard } from '../components/SkeletonLoader';
import PremiumLock from '../components/PremiumLock';
import UserAvatar from '../components/UserAvatar';
import { scoreColor } from '../utils/scoreUtils';

/* ── Quick actions ─────────────────────────────────────────── */
const QUICK_ACTIONS = [
  {
    title: 'Start AI Interview',
    desc: 'Practice with a live AI interviewer',
    to: '/interview',
    primary: true,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/>
        <line x1="8" y1="23" x2="16" y2="23"/>
      </svg>
    ),
  },
  {
    title: 'Take Mock Test',
    desc: 'DSA, Aptitude, Core CS & more',
    to: '/mock-test',
    primary: false,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
  },
  {
    title: 'Browse Jobs',
    desc: '50+ curated opportunities',
    to: '/jobs',
    primary: false,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
      </svg>
    ),
  },
  {
    title: 'Analyze Resume',
    desc: 'Get your ATS score instantly',
    to: '/resume-analyzer',
    primary: false,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
];

const RESOURCES = [
  { title: 'System Design Interview',   type: 'YouTube',   url: 'https://youtube.com/results?search_query=system+design+interview' },
  { title: 'LeetCode DSA Practice',     type: 'Platform',  url: 'https://leetcode.com' },
  { title: 'STAR Method Guide',         type: 'Article',   url: 'https://www.themuse.com/advice/star-interview-method' },
  { title: 'Pramp Mock Interviews',     type: 'Free Tool', url: 'https://pramp.com' },
  { title: 'HireMind AI Interview',     type: 'Practice',  url: '/interview', internal: true },
  { title: 'Resume ATS Analyzer',       type: 'Tool',      url: '/resume-analyzer', internal: true },
];

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.38, ease: [0.22, 1, 0.36, 1] },
});

export default function Dashboard() {
  const { user }  = useAuth();
  const isPremium = user?.isPremium || false;
  const [sessions, setSessions] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    interviewAPI.getAll()
      .then(res => setSessions(res.data.sessions || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = user?.stats || {};

  const chartData = [...sessions].reverse().slice(-8).map((s, i) => ({
    name:  `S${i + 1}`,
    score: s.feedback?.overallScore || 0,
  }));

  const radarData = [
    { subject: 'Comm.',      value: stats.avgCommunication || 0 },
    { subject: 'Confidence', value: stats.avgConfidence    || 0 },
    { subject: 'Technical',  value: stats.avgAnswerQuality || 0 },
    { subject: 'Overall',    value: stats.avgScore         || 0 },
  ];

  const scoreRings = [
    { label: 'Overall',       val: stats.avgScore         || 0 },
    { label: 'Communication', val: stats.avgCommunication || 0 },
    { label: 'Confidence',    val: stats.avgConfidence    || 0 },
    { label: 'Technical',     val: stats.avgAnswerQuality || 0 },
  ];

  const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <DashboardLayout>

      {/* ── Page header ── */}
      <motion.div {...fade(0)} style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6, flexWrap: 'wrap' }}>
          <UserAvatar user={user} size={44} borderColor="var(--accent)" />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.025em', margin: 0 }}>
                {greeting()}, {user?.name?.split(' ')[0]}
              </h1>
              {isPremium && (
                <span className="badge badge-accent">Premium</span>
              )}
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--muted)', margin: '2px 0 0' }}>
              Ready for your next interview? Let's keep the momentum going.
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Quick actions ── */}
      <motion.div {...fade(0.04)} style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
          {QUICK_ACTIONS.map((c, i) => (
            <Link
              key={c.title}
              to={c.to}
              style={{ textDecoration: 'none' }}
            >
              <div
                className="card card-hover"
                style={{
                  padding: '1.125rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  borderColor: c.primary ? 'var(--accent-border)' : 'var(--border)',
                  background: c.primary ? 'var(--accent-bg)' : 'var(--surface)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = c.primary ? 'var(--accent-border)' : 'var(--border)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div
                  className="icon-box"
                  style={{
                    marginBottom: '0.875rem',
                    background: c.primary ? 'var(--accent)' : 'var(--surface2)',
                    color: c.primary ? '#fff' : 'var(--muted)',
                    border: 'none',
                  }}
                >
                  {c.icon}
                </div>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', margin: '0 0 4px', letterSpacing: '-0.01em' }}>
                  {c.title}
                </p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>{c.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* ── Main content grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }} className="lg-grid">

        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>

          {/* Performance card */}
          <motion.div {...fade(0.08)}>
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text)', margin: '0 0 4px', letterSpacing: '-0.01em' }}>
                    Performance Overview
                  </h2>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', margin: 0 }}>
                    Based on all your interview sessions
                  </p>
                </div>
                <span className="badge badge-neutral">{stats.totalInterviews || 0} sessions</span>
              </div>

              {stats.totalInterviews > 0 ? (
                <>
                  {/* Score rings */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'space-around', marginBottom: '2rem', padding: '1rem 0' }}>
                    {scoreRings.map(s => (
                      <ScoreRing key={s.label} score={s.val} label={s.label} size={88} />
                    ))}
                  </div>

                  {/* Line chart */}
                  {chartData.length > 1 && (
                    <PremiumLock isPremium={isPremium} feature="Score Trend Analytics">
                      <div>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', marginBottom: '0.75rem', fontWeight: 500 }}>
                          Score trend — last {chartData.length} sessions
                        </p>
                        <ResponsiveContainer width="100%" height={120}>
                          <LineChart data={chartData}>
                            <XAxis dataKey="name" tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis domain={[0, 100]} tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                            <Tooltip
                              contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 12 }}
                              formatter={v => [`${v}/100`, 'Score']}
                            />
                            <Line type="monotone" dataKey="score" stroke="var(--accent)" strokeWidth={2} dot={{ fill: 'var(--accent)', r: 3, strokeWidth: 0 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </PremiumLock>
                  )}

                  {/* Radar chart */}
                  {stats.totalInterviews >= 2 && (
                    <PremiumLock isPremium={isPremium} feature="Skills Radar">
                      <div style={{ marginTop: '1.5rem' }}>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', marginBottom: '0.75rem', fontWeight: 500 }}>
                          Skills radar
                        </p>
                        <ResponsiveContainer width="100%" height={200}>
                          <RadarChart data={radarData}>
                            <PolarGrid stroke="var(--border)" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--muted)', fontSize: 11 }} />
                            <Radar name="You" dataKey="value" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.12} strokeWidth={2} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </PremiumLock>
                  )}
                </>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
                      <line x1="6" y1="20" x2="6" y2="14"/>
                    </svg>
                  </div>
                  <h3>No data yet</h3>
                  <p>Complete your first AI interview to see your performance analytics here.</p>
                  <Link to="/interview" className="btn-primary" style={{ padding: '8px 20px', textDecoration: 'none', display: 'inline-block', fontSize: '0.875rem' }}>
                    Start interview
                  </Link>
                </div>
              )}
            </div>
          </motion.div>

          {/* Recent sessions */}
          <motion.div {...fade(0.12)}>
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text)', margin: 0, letterSpacing: '-0.01em' }}>
                  Recent Sessions
                </h2>
                {sessions.length > 5 && (
                  <Link to="/history" style={{ fontSize: '0.8125rem', color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
                    View all
                  </Link>
                )}
              </div>

              {loading ? (
                <SkeletonLoader rows={3} height={56} />
              ) : sessions.length === 0 ? (
                <div className="empty-state" style={{ padding: '2rem 0' }}>
                  <p style={{ fontSize: '0.875rem', color: 'var(--muted)', margin: 0 }}>
                    No sessions yet. Start your first AI interview to see results here.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {sessions.slice(0, 5).map((s, i) => {
                    const score = s.feedback?.overallScore || 0;
                    return (
                      <Link
                        key={s._id}
                        to={`/feedback/${s._id}`}
                        style={{ textDecoration: 'none' }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.75rem',
                            borderRadius: 8,
                            transition: 'background 0.15s ease',
                            cursor: 'pointer',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: 8,
                                background: `${scoreColor(score)}15`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                color: scoreColor(score),
                                flexShrink: 0,
                              }}
                            >
                              {score}
                            </div>
                            <div>
                              <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text)', margin: '0 0 2px' }}>
                                {s.jobRole}
                              </p>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{fmtDate(s.createdAt)}</span>
                                {s.feedback?.aiEvaluated && (
                                  <span className="badge badge-success" style={{ padding: '1px 6px', fontSize: '0.6875rem' }}>AI</span>
                                )}
                                {s.tabSwitches > 0 && (
                                  <span className="badge badge-danger" style={{ padding: '1px 6px', fontSize: '0.6875rem' }}>
                                    {s.tabSwitches} violations
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round">
                            <path d="M9 18l6-6-6-6"/>
                          </svg>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right sidebar column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Stats */}
          <motion.div {...fade(0.1)}>
            <div className="card" style={{ padding: '1.25rem' }}>
              <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text)', margin: '0 0 1rem', letterSpacing: '-0.01em' }}>
                Your Stats
              </h2>
              {loading ? (
                <SkeletonLoader rows={5} height={32} gap={6} />
              ) : (
                <div>
                  {[
                    { label: 'Total sessions',  val: stats.totalInterviews || 0 },
                    { label: 'Average score',   val: `${stats.avgScore || 0}/100` },
                    { label: 'Best score',      val: `${stats.bestScore || 0}/100` },
                    { label: 'Technical avg',   val: `${stats.avgAnswerQuality || 0}/100` },
                    { label: 'Mock tests',      val: stats.totalMockTests || 0 },
                  ].map((s, i, arr) => (
                    <div
                      key={s.label}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 0',
                        borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
                      }}
                    >
                      <span style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>{s.label}</span>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text)' }}>{s.val}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Subscription card */}
          <motion.div {...fade(0.14)}>
            {isPremium ? (
              <div
                className="card"
                style={{
                  padding: '1.25rem',
                  background: 'var(--accent-bg)',
                  borderColor: 'var(--accent-border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent)' }}>Premium Active</span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', margin: '0 0 12px', lineHeight: 1.5 }}>
                  You have unlimited access to AI interviews, analytics, and all features.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {['Unlimited', 'All Difficulties', 'Full Analytics'].map(f => (
                    <span key={f} className="badge badge-success" style={{ fontSize: '0.6875rem' }}>{f}</span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)' }}>Free Plan</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--accent)' }}>₹199/mo</span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', margin: '0 0 14px', lineHeight: 1.5 }}>
                  Upgrade for unlimited interviews, advanced analytics, and all job applications.
                </p>
                <Link
                  to="/profile"
                  className="btn-primary"
                  style={{ display: 'block', textAlign: 'center', padding: '9px', textDecoration: 'none', fontSize: '0.875rem', borderRadius: 8 }}
                >
                  Upgrade to Premium
                </Link>
              </div>
            )}
          </motion.div>

          {/* Resources */}
          <motion.div {...fade(0.18)}>
            <div className="card" style={{ padding: '1.25rem' }}>
              <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text)', margin: '0 0 0.875rem', letterSpacing: '-0.01em' }}>
                Learning Resources
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {RESOURCES.map(r => (
                  r.internal ? (
                    <Link
                      key={r.title}
                      to={r.url}
                      style={{ textDecoration: 'none' }}
                    >
                      <ResourceItem r={r} />
                    </Link>
                  ) : (
                    <a
                      key={r.title}
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: 'none' }}
                    >
                      <ResourceItem r={r} external />
                    </a>
                  )
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Responsive: collapse right column below lg */}
      <style>{`
        @media (max-width: 1024px) {
          .lg-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}

function ResourceItem({ r, external }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px',
        borderRadius: 6,
        transition: 'background 0.15s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <div>
        <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text)', margin: '0 0 2px' }}>{r.title}</p>
        <p style={{ fontSize: '0.75rem', color: 'var(--muted)', margin: 0 }}>{r.type}</p>
      </div>
      {external && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
          <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
        </svg>
      )}
    </div>
  );
}