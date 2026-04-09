import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { interviewAPI } from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import ScoreRing from '../components/ScoreRing';
import { scoreColor, scoreLabel } from '../utils/scoreUtils';

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

export default function Dashboard() {
  const { user }   = useAuth();
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
    { subject: 'Comm.',   value: stats.avgCommunication  || 0 },
    { subject: 'Confidence', value: stats.avgConfidence  || 0 },
    { subject: 'Technical',  value: stats.avgAnswerQuality || 0 },
    { subject: 'Posture',    value: stats.avgPosture      || 0 },
    { subject: 'Overall',    value: stats.avgScore        || 0 },
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
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display font-bold text-3xl t-text">
          Welcome back, <span className="grad-text">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p className="t-muted mt-1">Ready for your next interview? Let's keep the streak going.</p>
      </motion.div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {QUICK_ACTIONS.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <Link
              to={c.to}
              className="block t-card rounded-2xl p-5 hover:scale-[1.02] transition-all group"
              style={{ border: c.primary ? '1px solid var(--accent)' : '1px solid var(--border)' }}
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{c.icon}</div>
              <h3 className="font-display font-semibold t-text mb-1 text-sm">{c.title}</h3>
              <p className="text-xs t-muted">{c.desc}</p>
              <div className="text-xs font-medium grad-text mt-3">Go →</div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left col — 2 wide */}
        <div className="lg:col-span-2 space-y-6">

          {/* Performance overview */}
          <motion.div id="analytics-section" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }} className="t-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-semibold t-text">Performance Overview</h2>
              <span className="text-xs t-muted">{stats.totalInterviews || 0} sessions total</span>
            </div>

            {stats.totalInterviews > 0 ? (
              <>
                {/* Score rings */}
                <div className="flex flex-wrap gap-6 justify-around mb-8">
                  {scoreRings.map(s => (
                    <ScoreRing key={s.label} score={s.val} label={s.label} size={100} />
                  ))}
                </div>

                {/* Line chart */}
                {chartData.length > 1 && (
                  <div className="mb-4">
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
                  </div>
                )}

                {/* Radar chart */}
                {stats.totalInterviews >= 2 && (
                  <div>
                    <p className="text-xs t-muted mb-3">Skills Radar</p>
                    <ResponsiveContainer width="100%" height={200}>
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="var(--border)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--muted)', fontSize: 11 }} />
                        <Radar name="You" dataKey="value" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.15} strokeWidth={2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">📊</div>
                <p className="t-muted mb-4">Complete your first interview to see analytics</p>
                <Link to="/interview" className="inline-block text-sm px-5 py-2.5 rounded-xl text-white btn-primary">
                  Start Interview
                </Link>
              </div>
            )}
          </motion.div>

          {/* Recent sessions */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="t-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-semibold t-text">Recent Sessions</h2>
              {sessions.length > 5 && (
                <Link to="/history" className="text-xs t-muted hover:text-[var(--accent)] transition-colors">View all →</Link>
              )}
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: 'rgba(128,128,128,0.08)' }} />
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <p className="text-center py-8 text-sm t-muted">No sessions yet. Start your first interview!</p>
            ) : (
              <div className="space-y-2">
                {sessions.slice(0, 5).map(s => (
                  <Link key={s._id} to={`/feedback/${s._id}`}
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
                      <svg className="w-4 h-4 t-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Right col */}
        <div className="space-y-5">

          {/* Stats card */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="t-card rounded-2xl p-5">
            <h2 className="font-display font-semibold t-text mb-4">Your Stats</h2>
            <div className="space-y-3">
              {[
                { label: 'Sessions',     val: stats.totalInterviews || 0,             icon: '🎯' },
                { label: 'Avg Score',    val: `${stats.avgScore || 0}/100`,            icon: '⭐' },
                { label: 'Best Score',   val: `${stats.bestScore || 0}/100`,           icon: '🏆' },
                { label: 'Technical',    val: `${stats.avgAnswerQuality || 0}/100`,    icon: '💻' },
                { label: 'Posture',      val: `${stats.avgPosture || 0}/100`,          icon: '🧍' },
                { label: 'Mock Tests',   val: stats.totalMockTests || 0,              icon: '📝' },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between py-2.5"
                  style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-2">
                    <span>{s.icon}</span>
                    <span className="text-sm t-muted">{s.label}</span>
                  </div>
                  <span className="text-sm font-semibold t-text">{s.val}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Subscription badge */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="t-card rounded-2xl p-5"
            style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.06), rgba(124,58,237,0.06))' }}>
            <div className="flex items-center gap-2 mb-2">
              <span>✨</span>
              <span className="font-semibold t-text text-sm capitalize">{user?.subscription?.plan || 'Free'} Plan</span>
            </div>
            <p className="text-xs t-muted mb-3">Upgrade for unlimited AI interviews, advanced analytics, and priority support.</p>
            <Link to="/profile" className="block text-center py-2 rounded-xl text-sm btn-primary font-semibold">
              Upgrade to Pro
            </Link>
          </motion.div>

          {/* Resources */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="t-card rounded-2xl p-5">
            <h2 className="font-display font-semibold t-text mb-4">Learning Resources</h2>
            <div className="space-y-1">
              {RESOURCES.map(r => (
                r.url.startsWith('/') ? (
                  <Link key={r.title} to={r.url}
                    className="flex items-center gap-3 p-3 rounded-xl transition-all"
                    style={{ background: 'transparent' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(128,128,128,0.07)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span className="text-xl">{r.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm t-text truncate">{r.title}</p>
                      <p className="text-xs t-muted">{r.type}</p>
                    </div>
                  </Link>
                ) : (
                  <a key={r.title} href={r.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl transition-all"
                    style={{ background: 'transparent' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(128,128,128,0.07)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span className="text-xl">{r.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm t-text truncate">{r.title}</p>
                      <p className="text-xs t-muted">{r.type}</p>
                    </div>
                    <svg className="w-3.5 h-3.5 t-muted flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}