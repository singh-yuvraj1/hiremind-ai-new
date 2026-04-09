import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../layouts/DashboardLayout';
import { jobAPI, paymentAPI } from '../services/api';

const ROLES = [
  { value: 'all',            label: 'All Roles' },
  { value: 'frontend',       label: 'Frontend' },
  { value: 'backend',        label: 'Backend' },
  { value: 'fullstack',      label: 'Full Stack' },
  { value: 'data_scientist', label: 'Data Science' },
  { value: 'devops',         label: 'DevOps' },
  { value: 'aiml',           label: 'AI / ML' },
  { value: 'mobile',         label: 'Mobile' },
  { value: 'product_manager',label: 'Product Manager' },
  { value: 'general',        label: 'Other' },
];

const TYPES = ['All Types', 'Full-time', 'Part-time', 'Contract', 'Internship'];

const TAG_COLORS = [
  { bg: 'rgba(0,229,255,0.08)',  color: 'var(--accent)' },
  { bg: 'rgba(41,121,255,0.08)', color: 'var(--accent2)' },
  { bg: 'rgba(124,58,237,0.08)', color: 'var(--accent3)' },
  { bg: 'rgba(34,197,94,0.08)',  color: '#22c55e' },
];

/* ── Razorpay checkout helper ──────────────────────────────────────── */
const openRazorpay = async (onSuccess) => {
  try {
    const orderRes = await paymentAPI.createOrder();
    const { order, keyId, user, plan } = orderRes.data;

    const options = {
      key:          keyId,
      amount:       order.amount,
      currency:     order.currency,
      name:         'HireMind AI',
      description:  plan?.description || 'Premium Subscription — ₹199/month',
      order_id:     order.id,
      prefill:      { name: user?.name, email: user?.email },
      theme:        { color: '#00e5ff' },
      handler: async (response) => {
        try {
          await paymentAPI.verifyPayment({
            razorpay_order_id:   response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature:  response.razorpay_signature,
          });
          onSuccess?.();
        } catch {
          alert('Payment verification failed. Please contact support.');
        }
      },
    };

    if (typeof window.Razorpay === 'undefined') {
      alert('Razorpay not loaded. Please refresh the page.');
      return;
    }

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', () => alert('Payment failed. Please try again.'));
    rzp.open();
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    // Show a friendly message if Razorpay keys aren't configured yet
    if (msg?.includes('not configured') || msg?.includes('not installed')) {
      alert(`⚠️ Payment system is being set up.\n\nTo enable payments, add your Razorpay keys to server/.env\n\nGet keys at: https://dashboard.razorpay.com/app/keys`);
    } else {
      alert('Could not initiate payment. ' + msg);
    }
  }
};

/* ═══════════════════════════════════════════════════════════════════ */
export default function Jobs() {
  const [jobs,       setJobs]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [role,       setRole]       = useState('all');
  const [type,       setType]       = useState('All Types');
  const [remote,     setRemote]     = useState(false);
  const [savedTab,   setSavedTab]   = useState(false);
  const [savedJobs,  setSavedJobs]  = useState([]);
  const [total,      setTotal]      = useState(0);
  const [saving,     setSaving]     = useState(null);
  const [userPlan,   setUserPlan]   = useState('free'); // 'free' | 'premium' | 'guest'
  const [showUpgrade,setShowUpgrade]= useState(false);  // upgrade modal
  const [applying,   setApplying]   = useState(null);   // jobId being applied to

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (role !== 'all') params.set('role', role);
      if (type !== 'All Types') params.set('type', type);
      if (remote) params.set('remote', 'true');
      if (search.trim()) params.set('search', search.trim());
      const res = await jobAPI.getAll(params.toString());
      setJobs(res.data.jobs || []);
      setTotal(res.data.total || 0);
      setUserPlan(res.data.userPlan || 'free');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [role, type, remote, search]);

  const fetchSaved = useCallback(async () => {
    try {
      const res = await jobAPI.getSaved();
      setSavedJobs(res.data.jobs || []);
    } catch {}
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);
  useEffect(() => { if (savedTab) fetchSaved(); }, [savedTab, fetchSaved]);

  // Load Razorpay script once
  useEffect(() => {
    if (document.getElementById('razorpay-script')) return;
    const script = document.createElement('script');
    script.id  = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    document.head.appendChild(script);
  }, []);

  const toggleSave = async (jobId) => {
    setSaving(jobId);
    try {
      await jobAPI.toggleSave(jobId);
      setJobs(prev => prev.map(j => j._id === jobId ? { ...j, isSaved: !j.isSaved } : j));
      if (savedTab) fetchSaved();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(null);
    }
  };

  const handleApply = async (job) => {
    // Free/guest users → show upgrade modal
    if (userPlan !== 'premium') {
      setShowUpgrade(true);
      return;
    }

    // Premium users → call apply API and open link
    setApplying(job._id);
    try {
      const res = await jobAPI.apply(job._id);
      if (res.data.applyUrl) {
        window.open(res.data.applyUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not get apply link.';
      if (err.response?.status === 403) {
        setShowUpgrade(true);
      } else {
        alert(msg);
      }
    } finally {
      setApplying(null);
    }
  };

  const handleUpgradeSuccess = () => {
    setShowUpgrade(false);
    setUserPlan('premium');
    // Update localStorage user so navbar/profile reflects premium
    try {
      const stored = JSON.parse(localStorage.getItem('hm_user') || '{}');
      localStorage.setItem('hm_user', JSON.stringify({ ...stored, isPremium: true, plan: 'premium' }));
    } catch {}
    // Refresh jobs to show updated canApply flags
    fetchJobs();
    alert('🎉 Premium activated! You can now apply to all jobs.');
  };

  const displayed = savedTab ? savedJobs : jobs;

  return (
    <DashboardLayout>
      {/* Upgrade Modal */}
      <AnimatePresence>
        {showUpgrade && (
          <UpgradeModal
            onClose={() => setShowUpgrade(false)}
            onUpgrade={() => openRazorpay(handleUpgradeSuccess)}
          />
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display font-bold text-3xl t-text">
              Job <span className="grad-text">Board</span>
            </h1>
            <p className="t-muted mt-1 text-sm">
              Discover {total}+ opportunities matched to your skills
            </p>
          </div>

          {/* Plan Badge */}
          {userPlan !== 'guest' && (
            <div className="flex items-center gap-3">
              {userPlan === 'premium' ? (
                <span className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                  style={{ background: 'rgba(0,229,255,0.1)', border: '1px solid var(--accent)', color: 'var(--accent)' }}>
                  ✨ Premium Active
                </span>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  onClick={() => setShowUpgrade(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold btn-primary"
                  style={{ boxShadow: '0 0 20px rgba(0,229,255,0.3)' }}>
                  🔓 Upgrade — ₹199/mo
                </motion.button>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Tabs ── */}
      <div className="flex gap-2 mb-6">
        {['Browse Jobs', 'Saved Jobs'].map((tab, i) => (
          <button
            key={tab}
            onClick={() => setSavedTab(i === 1)}
            className="px-5 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              background: savedTab === (i === 1) ? 'var(--accent)' : 'rgba(128,128,128,0.08)',
              color:      savedTab === (i === 1) ? '#fff' : 'var(--muted)',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {!savedTab && (
        <>
          {/* ── Search ── */}
          <div className="relative mb-5">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base">🔍</span>
            <input
              type="text"
              placeholder="Search jobs, companies, skills..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchJobs()}
              className="input-box pl-10 pr-4"
            />
          </div>

          {/* ── Filters ── */}
          <div className="flex flex-wrap gap-2 mb-6">
            <select value={role} onChange={e => setRole(e.target.value)}
              className="input-box !w-auto px-3 py-2 text-sm" style={{ minWidth: 130 }}>
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>

            <select value={type} onChange={e => setType(e.target.value)}
              className="input-box !w-auto px-3 py-2 text-sm" style={{ minWidth: 120 }}>
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>

            <button onClick={() => setRemote(r => !r)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all"
              style={{
                borderColor: remote ? 'var(--accent)' : 'var(--border)',
                color:       remote ? 'var(--accent)' : 'var(--muted)',
                background:  remote ? 'rgba(0,229,255,0.06)' : 'transparent',
              }}>
              🌍 Remote only
            </button>

            <button onClick={fetchJobs} className="px-4 py-2 rounded-xl text-sm font-medium btn-primary">
              Search
            </button>
          </div>

          {/* Free plan notice */}
          {userPlan === 'free' && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3 rounded-xl flex items-center gap-3 text-sm"
              style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)' }}>
              <span className="text-xl">🔒</span>
              <div className="flex-1">
                <span className="text-yellow-400 font-medium">Free Plan — </span>
                <span className="t-muted">You can browse all jobs. </span>
                <button onClick={() => setShowUpgrade(true)}
                  className="text-yellow-400 underline font-medium hover:text-yellow-300 transition-colors">
                  Upgrade to Premium (₹199)
                </button>
                <span className="t-muted"> to apply directly.</span>
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* ── Job Cards ── */}
      {loading ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-52 rounded-2xl animate-pulse"
              style={{ background: 'rgba(128,128,128,0.08)' }} />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">💼</div>
          <p className="t-muted mb-3">{savedTab ? 'No saved jobs yet.' : 'No jobs found for your filters.'}</p>
          {!savedTab && (
            <button onClick={() => { setRole('all'); setType('All Types'); setRemote(false); setSearch(''); }}
              className="text-sm px-4 py-2 rounded-xl btn-primary">
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {displayed.map((job, idx) => (
              <JobCard
                key={job._id}
                job={job}
                idx={idx}
                onSave={toggleSave}
                saving={saving === job._id}
                onApply={handleApply}
                applying={applying === job._id}
                userPlan={userPlan}
              />
            ))}
          </div>
        </AnimatePresence>
      )}
    </DashboardLayout>
  );
}

/* ── Job Card ─────────────────────────────────────────────────────── */
function JobCard({ job, idx, onSave, saving, onApply, applying, userPlan }) {
  const tagColor = (i) => TAG_COLORS[i % TAG_COLORS.length];
  const daysAgo  = Math.floor((Date.now() - new Date(job.postedAt)) / 86400000);
  const isPremium = userPlan === 'premium';
  const canApply  = job.canApply || isPremium;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: idx * 0.04 }}
      className="t-card rounded-2xl p-5 flex flex-col group hover:scale-[1.02] transition-transform"
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: 'rgba(128,128,128,0.1)' }}>
            {job.logo || '🏢'}
          </div>
          <div>
            <p className="font-semibold t-text text-sm leading-tight">{job.title}</p>
            <p className="text-xs t-muted">{job.company}</p>
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={() => onSave(job._id)}
          disabled={saving}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-all"
          style={{ background: job.isSaved ? 'rgba(239,68,68,0.12)' : 'rgba(128,128,128,0.08)' }}
          title={job.isSaved ? 'Unsave' : 'Save job'}
        >
          {saving ? (
            <div className="w-4 h-4 border border-t-transparent rounded-full animate-spin"
              style={{ borderColor: 'var(--accent)' }} />
          ) : (
            <span className="text-sm">{job.isSaved ? '❤️' : '🤍'}</span>
          )}
        </button>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-2 mb-3 text-xs t-muted">
        <span>📍 {job.location}</span>
        <span>💼 {job.type}</span>
        {job.remote && <span className="text-green-400">🌍 Remote</span>}
      </div>

      {/* Salary */}
      <div className="text-sm font-semibold mb-3" style={{ color: 'var(--accent)' }}>
        💰 {job.salary}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {job.tags?.slice(0, 4).map((tag, i) => {
          const c = tagColor(i);
          return (
            <span key={tag} className="px-2 py-0.5 rounded-md text-xs font-medium"
              style={{ background: c.bg, color: c.color }}>
              {tag}
            </span>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-2"
        style={{ borderTop: '1px solid var(--border)' }}>
        <span className="text-xs t-muted">
          {daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo}d ago`}
          {job.featured && (
            <span className="ml-2 px-1.5 py-0.5 rounded text-xs"
              style={{ background: 'rgba(0,229,255,0.1)', color: 'var(--accent)' }}>Featured</span>
          )}
        </span>

        {/* Apply Button — premium-gated */}
        {canApply ? (
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => onApply(job)}
            disabled={applying}
            className="text-sm px-4 py-1.5 rounded-lg font-medium btn-primary disabled:opacity-60"
          >
            {applying ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 border border-t-transparent rounded-full animate-spin" />
                Opening...
              </span>
            ) : 'Apply Now →'}
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => onApply(job)}
            className="text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all"
            style={{
              background: 'rgba(245,158,11,0.1)',
              border:     '1px solid rgba(245,158,11,0.4)',
              color:      '#f59e0b',
            }}
          >
            🔒 Upgrade to Apply
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

/* ── Upgrade Modal ────────────────────────────────────────────────── */
function UpgradeModal({ onClose, onUpgrade }) {
  const features = [
    '✅ Unlimited AI interviews (all difficulties)',
    '✅ Apply to all jobs directly',
    '✅ Unlimited mock tests daily',
    '✅ Unlimited resume ATS checks',
    '✅ Priority AI evaluation with RAG',
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        onClick={e => e.stopPropagation()}
        className="t-card rounded-3xl p-8 max-w-md w-full text-center"
        style={{
          border:     '2px solid rgba(0,229,255,0.3)',
          boxShadow: '0 0 60px rgba(0,229,255,0.15)',
          background: 'linear-gradient(135deg, rgba(0,229,255,0.06), rgba(41,121,255,0.04))',
        }}
      >
        <div className="text-5xl mb-3">✨</div>
        <h2 className="font-display font-bold text-2xl t-text mb-1">Upgrade to Premium</h2>
        <p className="t-muted text-sm mb-6">Unlock everything for just ₹199/month</p>

        <div className="text-left space-y-2 mb-6 px-2">
          {features.map(f => (
            <p key={f} className="text-sm t-text">{f}</p>
          ))}
        </div>

        {/* Price */}
        <div className="flex items-baseline justify-center gap-1 mb-6">
          <span className="text-4xl font-bold grad-text">₹199</span>
          <span className="t-muted text-sm">/month</span>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm btn-outline font-medium">
            Maybe Later
          </button>
          <motion.button
            whileHover={{ scale: 1.03, boxShadow: '0 0 25px rgba(0,229,255,0.5)' }}
            whileTap={{ scale: 0.97 }}
            onClick={onUpgrade}
            className="flex-1 py-3 rounded-xl text-sm btn-primary font-semibold text-white"
          >
            🚀 Upgrade Now
          </motion.button>
        </div>

        <p className="text-xs t-muted mt-4">Secure payment powered by Razorpay 🔒</p>
      </motion.div>
    </motion.div>
  );
}
