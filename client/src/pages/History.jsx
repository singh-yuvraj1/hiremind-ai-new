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

  const FILTERS = [
    { id: 'all',  label: 'All sessions' },
    { id: 'high', label: 'Score ≥ 70' },
    { id: 'low',  label: 'Score < 50' },
  ];

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.025em', margin: '0 0 6px' }}>
          Interview History
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--muted)', margin: 0 }}>
          {sessions.length} total session{sessions.length !== 1 ? 's' : ''}
        </p>
      </motion.div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={filter === f.id ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '6px 16px', fontSize: '0.8125rem', borderRadius: 6 }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1,2,3,4].map(i => (
            <div key={i} className="skeleton" style={{ height: 76, borderRadius: 10 }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10"/>
              <path d="M3.51 15a9 9 0 1 0 .49-4.95"/>
            </svg>
          </div>
          <h3>{filter === 'all' ? 'No sessions yet' : 'No sessions match this filter'}</h3>
          <p>
            {filter === 'all'
              ? 'Start your first AI interview to begin tracking your progress.'
              : 'Try changing the filter to see more results.'
            }
          </p>
          {filter === 'all' && (
            <Link to="/interview" className="btn-primary" style={{ padding: '8px 20px', textDecoration: 'none', display: 'inline-block', fontSize: '0.875rem' }}>
              Start interview
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((s, i) => {
            const score = s.feedback?.overallScore || 0;
            return (
              <motion.div
                key={s._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link to={`/feedback/${s._id}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div
                    className="card card-hover"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1rem 1.125rem',
                      transition: 'all 0.15s ease',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'var(--accent-border)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      {/* Score badge */}
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 10,
                          background: `${scoreColor(score)}15`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          color: scoreColor(score),
                          flexShrink: 0,
                        }}
                      >
                        {score}
                      </div>
                      <div>
                        <p style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--text)', margin: '0 0 4px' }}>
                          {s.jobRole}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{fmtDate(s.createdAt)}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'capitalize' }}>{s.difficulty}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{s.questions?.length || 0} questions</span>
                          {s.feedback?.aiEvaluated && (
                            <span className="badge badge-success" style={{ padding: '2px 7px', fontSize: '0.6875rem' }}>AI Evaluated</span>
                          )}
                          {s.tabSwitches > 0 && (
                            <span className="badge badge-danger" style={{ padding: '2px 7px', fontSize: '0.6875rem' }}>
                              {s.tabSwitches} violations
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                      {/* Sub-scores */}
                      <div className="hidden sm:flex" style={{ display: 'flex', gap: 16 }}>
                        {[
                          { label: 'Comm', val: s.feedback?.communication || 0 },
                          { label: 'Conf', val: s.feedback?.confidence    || 0 },
                          { label: 'Tech', val: s.feedback?.answerQuality || 0 },
                        ].map(b => (
                          <div key={b.label} style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.6875rem', color: 'var(--muted)', marginBottom: 2 }}>{b.label}</div>
                            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: scoreColor(b.val) }}>{b.val}</div>
                          </div>
                        ))}
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round">
                        <path d="M9 18l6-6-6-6"/>
                      </svg>
                    </div>
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