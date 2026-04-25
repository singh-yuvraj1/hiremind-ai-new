import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { interviewAPI } from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import ScoreRing from '../components/ScoreRing';
import TiltCard from '../components/TiltCard';
import GlowButton from '../components/GlowButton';
import FloatingBlobs from '../components/FloatingBlobs';
import SkeletonLoader, { SkeletonCard } from '../components/SkeletonLoader';
import { scoreColor, scoreLabel } from '../utils/scoreUtils';
import PremiumLock from '../components/PremiumLock';

const RESOURCES = [
  { icon: '🎓', title: 'System Design Course',  type: 'YouTube',   url: 'https://youtube.com/results?search_query=system+design+interview' },
  { icon: '💻', title: 'LeetCode DSA Practice', type: 'Practice',  url: 'https://leetcode.com' },
  { icon: '📖', title: 'STAR Method Guide',     type: 'Article',   url: 'https://www.themuse.com/advice/star-interview-method' },
  { icon: '🎯', title: 'Pramp Mock Interviews', type: 'Free Tool', url: 'https://pramp.com' },
  { icon: '🤖', title: 'HireMind AI Interview', type: 'Practice',  url: '/interview' },
  { icon: '📄', title: 'Resume ATS Analyzer',   type: 'Tool',      url: '/resume-analyzer' },
];

const QUICK_ACTIONS = [
  { icon: '🎙️', title: 'Start AI Interview',  desc: 'Practice with a live AI interviewer',   to: '/interview',        primary: true  },
  { icon: '📝', title: 'Take Mock Test',       desc: 'DSA, Aptitude, Core CS & more',         to: '/mock-test',        primary: false },
  { icon: '💼', title: 'Browse Jobs',          desc: '50+ curated job opportunities',         to: '/jobs',             primary: false },
  { icon: '📄', title: 'Analyze Resume',       desc: 'Get your ATS score instantly',          to: '/resume-analyzer',  primary: false },
];

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.42, ease: [0.22, 1, 0.36, 1] },
});

export default function Dashboard() {
  const { user }   = useAuth();
  const isPremium  = user?.isPremium || false;
  const [sessions,  setSessions]  = useState([]);
  const [loading,   setLoading]   = useState(true);

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
    { subject: 'Comm.',      value: stats.avgCommunication  || 0 },
    { subject: 'Confidence', value: stats.avgConfidence     || 0 },
    { subject: 'Technical',  value: stats.avgAnswerQuality  || 0 },
    { subject: 'Posture',    value: stats.avgPosture        || 0 },
    { subject: 'Overall',    value: stats.avgScore          || 0 },
  ];

  const scoreRings = [
    { label: 'Overall',       val: stats.avgScore          || 0 },
    { label: 'Communication', val: stats.avgCommunication  || 0 },
    { label: 'Confidence',    val: stats.avgConfidence     || 0 },
    { label: 'Technical',     val: stats.avgAnswerQuality  || 0 },
  ];

  const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <DashboardLayout>
      {/* Greeting */}
      <motion.div {...fadeIn(0)} className="mb-8 relative">
        <div className="flex items-center flex-wrap gap-3 mb-1">
          <h1 className="font-display font-bold text-3xl t-text">
            Welcome back,{' '}
            <span className="grad-text">{user?.name?.split(' ')[0]}</span>{' '}
            <motion.span
              animate={{ rotate: [0, 20, -10, 20, 0] }}
              transition={{ duration: 1.2, delay: 0.5 }}
              className="inline-block">
              👋
            </motion.span>
          </h1>
          {/* Premium badge — only shown to premium users; backend decides */}
          {isPremium && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: 'spring' }}
              className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold"
              style={{
                background: 'linear-gradient(135deg, rgba(0,229,255,0.18), rgba(124,58,237,0.22))',
                border: '1px solid rgba(0,229,255,0.35)',
                color: '#00e5ff',
                boxShadow: '0 0 12px rgba(0,229,255,0.2)',
              }}>
              ✨ Premium
            </motion.span>
          )}
        </div>
        <p className="t-muted mt-1">Ready for your next interview? Let's keep the streak going.</p>
      </motion.div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {QUICK_ACTIONS.map((c, i) => (
          <motion.div key={c.title} {...fadeIn(i * 0.07)}>
            <TiltCard intensity={7} scale={1.03} className="h-full">
              <Link
                to={c.to}
                className="block t-card rounded-2xl p-5 group h-full transition-all"
                style={{
                  border: c.primary ? '1px solid rgba(0,229,255,0.30)' : '1px solid var(--border)',
                  background: c.primary
                    ? 'linear-gradient(135deg, rgba(0,229,255,0.07), rgba(41,121,255,0.07))'
                    : 'var(--card)',
                  boxShadow: c.primary ? '0 0 20px rgba(0,229,255,0.08)' : 'none',
                }}>
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">
                  {c.icon}
                </div>
                <h3 className="font-display font-semibold t-text mb-1 text-sm">{c.title}</h3>
                <p className="text-xs t-muted">{c.desc}</p>
                <div className="text-xs font-medium grad-text mt-3 flex items-center gap-1">
                  Go
                  <motion.span
                    animate={{ x: [0, 3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}>
                    →
                  </motion.span>
                </div>
              </Link>
            </TiltCard>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left col — 2 wide */}
        <div className="lg:col-span-2 space-y-6">

          {/* Performance overview */}
          <motion.div id="analytics-section" {...fadeIn(0.2)} className="t-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-semibold t-text">Performance Overview</h2>
              <span className="text-xs t-muted px-2.5 py-1 rounded-full" style={{ background: 'rgba(128,128,128,0.08)' }}>
                {stats.totalInterviews || 0} sessions
              </span>
            </div>

            {stats.totalInterviews > 0 ? (
              <>
                {/* Score rings */}
                <div className="flex flex-wrap gap-6 justify-around mb-8">
                  {scoreRings.map(s => (
                    <ScoreRing key={s.label} score={s.val} label={s.label} size={100} />
                  ))}
                </div>

                {/* Line chart — premium locked for free users */}
                {chartData.length > 1 && (
                  <PremiumLock isPremium={isPremium} feature="Score Trend Analytics">
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5 }}
                      className="mb-4">
                      <p className="text-xs t-muted mb-3">Score Trend (last sessions)</p>
                      <ResponsiveContainer width="100%" height={130}>
                        <LineChart data={chartData}>
                          <XAxis dataKey="name" tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis domain={[0, 100]} tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                          <Tooltip
                            contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 12 }}
                            formatter={v => [`${v}/100`, 'Score']}
                          />
                          <Line type="monotone" dataKey="score" stroke="var(--accent)" strokeWidth={2} dot={{ fill: 'var(--accent)', r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </motion.div>
                  </PremiumLock>
                )}

                {/* Radar chart — premium locked for free users */}
                {stats.totalInterviews >= 2 && (
                  <PremiumLock isPremium={isPremium} feature="Skills Radar">
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.1 }}>
                      <p className="text-xs t-muted mb-3">Skills Radar</p>
                      <ResponsiveContainer width="100%" height={200}>
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="var(--border)" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--muted)', fontSize: 11 }} />
                          <Radar name="You" dataKey="value" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.15} strokeWidth={2} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </motion.div>
                  </PremiumLock>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">📊</div>
                <p className="t-muted mb-4">Complete your first interview to see analytics</p>
                <GlowButton>
                  <Link to="/interview" className="inline-block text-sm px-5 py-2.5 rounded-xl text-white btn-primary">
                    Start Interview
                  </Link>
                </GlowButton>
              </div>
            )}
          </motion.div>

          {/* Recent sessions */}
          <motion.div {...fadeIn(0.3)} className="t-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-semibold t-text">Recent Sessions</h2>
              {sessions.length > 5 && (
                <Link to="/history" className="text-xs t-muted hover:text-[var(--accent)] transition-colors">View all →</Link>
              )}
            </div>

            {loading ? (
              <SkeletonLoader rows={3} height={56} />
            ) : sessions.length === 0 ? (
              <p className="text-center py-8 text-sm t-muted">No sessions yet. Start your first interview!</p>
            ) : (
              <div className="space-y-2">
                {sessions.slice(0, 5).map((s, i) => (
                  <motion.div
                    key={s._id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.3 }}>
                    <Link to={`/feedback/${s._id}`}
                      className="flex items-center justify-between p-4 rounded-xl transition-all group"
                      style={{ background: 'rgba(128,128,128,0.04)', border: '1px solid var(--border)' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm"
                          style={{ background: 'rgba(128,128,128,0.08)' }}>🎙️</div>
                        <div>
                          <p className="text-sm font-medium t-text">{s.jobRole}</p>
                          <p className="text-xs t-muted flex items-center gap-2">
                            {fmtDate(s.createdAt)}
                            {s.feedback?.aiEvaluated && (
                              <span className="px-1.5 py-0.5 rounded text-xs"
                                style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>AI</span>
                            )}
                            {s.tabSwitches > 0 && (
                              <span className="px-1.5 py-0.5 rounded text-xs"
                                style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                                ⚠️ {s.tabSwitches}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-display font-bold text-sm"
                          style={{ color: scoreColor(s.feedback?.overallScore || 0) }}>
                          {s.feedback?.overallScore || 0}/100
                        </span>
                        <svg className="w-4 h-4 t-muted group-hover:text-[var(--accent)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Right col */}
        <div className="space-y-5">

          {/* Stats card */}
          <motion.div {...fadeIn(0.25)} className="t-card rounded-2xl p-5">
            <h2 className="font-display font-semibold t-text mb-4">Your Stats</h2>
            {loading ? (
              <SkeletonLoader rows={6} height={36} gap={8} />
            ) : (
              <div className="space-y-1">
                {[
                  { label: 'Sessions',   val: stats.totalInterviews || 0,           icon: '🎯' },
                  { label: 'Avg Score',  val: `${stats.avgScore || 0}/100`,          icon: '⭐' },
                  { label: 'Best Score', val: `${stats.bestScore || 0}/100`,         icon: '🏆' },
                  { label: 'Technical',  val: `${stats.avgAnswerQuality || 0}/100`,  icon: '💻' },
                  { label: 'Posture',    val: `${stats.avgPosture || 0}/100`,        icon: '🧍' },
                  { label: 'Mock Tests', val: stats.totalMockTests || 0,            icon: '📝' },
                ].map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className="flex items-center justify-between py-2.5"
                    style={{ borderBottom: '1px solid var(--border)' }}>
                    <div className="flex items-center gap-2">
                      <span>{s.icon}</span>
                      <span className="text-sm t-muted">{s.label}</span>
                    </div>
                    <span className="text-sm font-semibold t-text">{s.val}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Subscription / Premium card */}
          <motion.div {...fadeIn(0.3)}
            className="rounded-2xl p-5 relative overflow-hidden"
            style={{
              background: isPremium
                ? 'linear-gradient(135deg, rgba(0,229,255,0.10), rgba(124,58,237,0.14))'
                : 'linear-gradient(135deg, rgba(0,229,255,0.06), rgba(124,58,237,0.08))',
              border: isPremium ? '1px solid rgba(0,229,255,0.35)' : '1px solid rgba(0,229,255,0.18)',
              backdropFilter: 'blur(16px)',
            }}>
            {/* Corner glow */}
            <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-3xl opacity-25"
              style={{ background: 'var(--accent)' }} />
            <div className="absolute -bottom-8 -left-8 w-20 h-20 rounded-full blur-3xl opacity-20"
              style={{ background: 'var(--accent3)' }} />

            <div className="relative z-10">
              {isPremium ? (
                // Premium user view
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <motion.span
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}>
                      ✨
                    </motion.span>
                    <span className="font-bold t-text text-sm" style={{ color: '#00e5ff' }}>Premium Member</span>
                  </div>
                  <p className="text-xs t-muted mb-3">
                    You have unlimited access to all AI interviews, advanced analytics, and priority features.
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    {['Unlimited Interviews', 'All Difficulties', 'Full Analytics', 'Priority AI'].map(f => (
                      <span key={f} className="hidden" />
                    ))}
                    {['✅ Unlimited', '✅ All Difficulties', '✅ Full Reports'].map(f => (
                      <span key={f}
                        className="px-2 py-0.5 rounded-full text-xs"
                        style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }}>
                        {f}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                // Free user view
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <motion.span
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}>
                      ✨
                    </motion.span>
                    <span className="font-semibold t-text text-sm capitalize">
                      {user?.subscription?.plan || 'Free'} Plan
                    </span>
                  </div>
                  <p className="text-xs t-muted mb-4">
                    Upgrade for unlimited AI interviews, advanced analytics, and priority support.
                  </p>
                  <GlowButton className="w-full">
                    <Link to="/profile"
                      className="block text-center py-2 rounded-xl text-sm btn-primary font-semibold pulse-glow">
                      Upgrade to Pro
                    </Link>
                  </GlowButton>
                </>
              )}
            </div>
          </motion.div>

          {/* Resources */}
          <motion.div {...fadeIn(0.35)} className="t-card rounded-2xl p-5">
            <h2 className="font-display font-semibold t-text mb-4">Learning Resources</h2>
            <div className="space-y-1">
              {RESOURCES.map((r, i) => (
                r.url.startsWith('/') ? (
                  <motion.div
                    key={r.title}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 + i * 0.05 }}>
                    <Link to={r.url}
                      className="flex items-center gap-3 p-3 rounded-xl transition-all group"
                      style={{ background: 'transparent' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(128,128,128,0.07)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <span className="text-xl group-hover:scale-110 transition-transform">{r.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm t-text truncate">{r.title}</p>
                        <p className="text-xs t-muted">{r.type}</p>
                      </div>
                    </Link>
                  </motion.div>
                ) : (
                  <motion.div
                    key={r.title}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 + i * 0.05 }}>
                    <a href={r.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl transition-all group"
                      style={{ background: 'transparent' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(128,128,128,0.07)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <span className="text-xl group-hover:scale-110 transition-transform">{r.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm t-text truncate">{r.title}</p>
                        <p className="text-xs t-muted">{r.type}</p>
                      </div>
                      <svg className="w-3.5 h-3.5 t-muted flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </motion.div>
                )
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}