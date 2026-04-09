import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardLayout from '../layouts/DashboardLayout';
import { interviewAPI } from '../services/api';
import { scoreColor } from '../utils/scoreUtils';

export default function History() {
  const [sessions, setSessions] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('all');

  useEffect(() => {
    interviewAPI.getAll()
      .then(res => setSessions(res.data.sessions || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = sessions.filter(s => {
    const score = s.feedback?.overallScore || 0;
    if (filter === 'high') return score >= 70;
    if (filter === 'low')  return score < 50;
    return true;
  });

  const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display font-bold text-3xl t-text mb-1">
          Interview <span className="grad-text">History</span>
        </h1>
        <p className="t-muted text-sm">All your past practice sessions ({sessions.length} total)</p>
      </motion.div>

      {/* filter buttons */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'all',  label: 'All' },
          { id: 'high', label: 'Score ≥ 70' },
          { id: 'low',  label: 'Score < 50' },
        ].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className="px-4 py-2 rounded-xl text-sm transition-all"
            style={{
              background: filter === f.id ? 'linear-gradient(135deg, var(--accent), var(--accent2))' : 'rgba(128,128,128,0.07)',
              color:  filter === f.id ? 'white' : 'var(--muted)',
              border: filter === f.id ? 'none' : '1px solid var(--border)',
            }}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: 'rgba(128,128,128,0.07)' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🎙️</div>
          <p className="t-muted mb-5">
            {filter === 'all' ? 'No sessions yet.' : 'No sessions match this filter.'}
          </p>
          {filter === 'all' && (
            <Link to="/interview" className="px-6 py-3 rounded-xl text-sm font-semibold text-white btn-primary">
              Start First Interview
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s, i) => {
            const score = s.feedback?.overallScore || 0;
            return (
              <motion.div key={s._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}>
                <Link to={`/feedback/${s._id}`}
                  className="flex items-center justify-between p-5 rounded-2xl border transition-all"
                  style={{ background: 'rgba(128,128,128,0.04)', borderColor: 'var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <div className="flex items-center gap-4">
                    {/* score badge */}
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center font-display font-bold text-sm"
                      style={{ background: `${scoreColor(score)}15`, color: scoreColor(score) }}>
                      {score}
                    </div>
                    <div>
                      <p className="font-medium t-text">{s.jobRole}</p>
                      <div className="flex items-center gap-3 text-xs t-muted mt-0.5 flex-wrap">
                        <span>{fmtDate(s.createdAt)}</span>
                        <span className="capitalize">{s.difficulty}</span>
                        <span>{s.questions?.length || 0} questions</span>
                        {s.feedback?.aiEvaluated && (
                          <span className="px-1.5 py-0.5 rounded"
                            style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
                            AI
                          </span>
                        )}
                        {s.tabSwitches > 0 && (
                          <span className="px-1.5 py-0.5 rounded"
                            style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                            ⚠️ {s.tabSwitches} violations
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex gap-2 text-xs">
                      {[
                        { l: 'Comm', v: s.feedback?.communication  || 0 },
                        { l: 'Conf', v: s.feedback?.confidence     || 0 },
                        { l: 'Ans',  v: s.feedback?.answerQuality  || 0 },
                      ].map(b => (
                        <div key={b.l} className="text-center w-10">
                          <div className="t-muted text-xs mb-1">{b.l}</div>
                          <div className="font-medium" style={{ color: scoreColor(b.v) }}>{b.v}</div>
                        </div>
                      ))}
                    </div>
                    <svg className="w-4 h-4 t-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}