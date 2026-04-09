import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../layouts/DashboardLayout';
import { authAPI, paymentAPI } from '../services/api';

/* ── Razorpay checkout helper ──────────────────────────────────── */
const loadRazorpayScript = () => {
  if (document.getElementById('rzp-script')) return Promise.resolve(true);
  return new Promise((resolve) => {
    const s  = document.createElement('script');
    s.id     = 'rzp-script';
    s.src    = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror= () => resolve(false);
    document.head.appendChild(s);
  });
};

const openRazorpay = async (user, onSuccess, onError) => {
  const loaded = await loadRazorpayScript();
  if (!loaded || typeof window.Razorpay === 'undefined') {
    onError?.('Razorpay script failed to load. Please refresh and try again.');
    return;
  }

  try {
    const orderRes = await paymentAPI.createOrder();
    const { order, keyId, plan } = orderRes.data;

    const options = {
      key:          keyId,
      amount:       order.amount,
      currency:     order.currency,
      name:         'HireMind AI',
      description:  plan?.description || 'Premium — ₹199/month',
      order_id:     order.id,
      prefill:      { name: user?.name, email: user?.email },
      theme:        { color: '#00e5ff' },
      handler: async (response) => {
        try {
          const verifyRes = await paymentAPI.verifyPayment({
            razorpay_order_id:   response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature:  response.razorpay_signature,
          });
          onSuccess?.(verifyRes.data);
        } catch (e) {
          onError?.('Payment verification failed. Please contact support.');
        }
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', () => onError?.('Payment failed. Please try again.'));
    rzp.open();
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    if (msg?.includes('not configured') || msg?.includes('not installed')) {
      onError?.('Payment system setup needed: add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to server/.env');
    } else {
      onError?.(msg || 'Could not start payment.');
    }
  }
};

/* ════════════════════════════════════════════════════════════════ */
export default function Profile() {
  const [userData,     setUserData]     = useState(null);
  const [payStatus,    setPayStatus]    = useState(null);
  const [usageData,    setUsageData]    = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [upgrading,    setUpgrading]    = useState(false);
  const [upgradeMsg,   setUpgradeMsg]   = useState('');
  const [upgradeError, setUpgradeError] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [meRes, payRes, usageRes] = await Promise.allSettled([
        authAPI.me(),
        paymentAPI.getStatus(),
        authAPI.usage(),
      ]);

      if (meRes.status === 'fulfilled')    setUserData(meRes.value.data.user);
      if (payRes.status === 'fulfilled')   setPayStatus(payRes.value.data);
      if (usageRes.status === 'fulfilled') setUsageData(usageRes.value.data);
    } catch (err) {
      console.error('[Profile] Fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleUpgrade = () => {
    if (upgrading) return;
    setUpgrading(true);
    setUpgradeMsg('');
    setUpgradeError('');

    openRazorpay(
      userData,
      (result) => {
        setUpgrading(false);
        setUpgradeMsg('🎉 Premium activated! All features unlocked.');
        // Update stored user
        try {
          const stored = JSON.parse(localStorage.getItem('hm_user') || '{}');
          localStorage.setItem('hm_user', JSON.stringify({ ...stored, isPremium: true, plan: 'premium' }));
        } catch {}
        fetchAll();
      },
      (errMsg) => {
        setUpgrading(false);
        setUpgradeError(errMsg);
      }
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
        </div>
      </DashboardLayout>
    );
  }

  const isPremium = payStatus?.isPremium || userData?.isPremium || false;
  const daysLeft  = payStatus?.daysLeft || 0;

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div>
          <h1 className="font-display font-bold text-3xl t-text">
            My <span className="grad-text">Profile</span>
          </h1>
          <p className="t-muted mt-1 text-sm">Manage your account and subscription</p>
        </div>

        {/* ── User Info Card ── */}
        <div className="t-card rounded-2xl p-6 flex items-center gap-5"
          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
            style={{ background: 'rgba(0,229,255,0.1)', border: '2px solid var(--accent)' }}>
            {userData?.avatar ? (
              <img src={userData.avatar} alt="Avatar" className="w-full h-full rounded-2xl object-cover" />
            ) : '👤'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-lg t-text truncate">{userData?.name || 'User'}</p>
            <p className="text-sm t-muted truncate">{userData?.email}</p>
            <div className="flex items-center gap-2 mt-1.5">
              {isPremium ? (
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
                  style={{ background: 'rgba(0,229,255,0.15)', color: 'var(--accent)', border: '1px solid var(--accent)' }}>
                  ✨ Premium Member
                </span>
              ) : (
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
                  style={{ background: 'rgba(128,128,128,0.12)', color: 'var(--muted)', border: '1px solid var(--border)' }}>
                  Free Plan
                </span>
              )}
              <span className="text-xs t-muted">via {userData?.authProvider === 'google' ? '🔵 Google' : '✉️ Email'}</span>
            </div>
          </div>
        </div>

        {/* ── Daily Usage ── */}
        <UsageCard usageData={usageData} isPremium={isPremium} />

        {/* ── Subscription Card ── */}
        <SubscriptionCard
          isPremium={isPremium}
          daysLeft={daysLeft}
          payStatus={payStatus}
          upgrading={upgrading}
          upgradeMsg={upgradeMsg}
          upgradeError={upgradeError}
          onUpgrade={handleUpgrade}
        />

        {/* ── Stats ── */}
        {userData?.stats && <StatsCard stats={userData.stats} />}

      </motion.div>
    </DashboardLayout>
  );
}

/* ── Usage Card ─────────────────────────────────────────────────── */
function UsageCard({ usageData, isPremium }) {
  if (!usageData) return null;

  const items = [
    { label: 'Interviews',     used: usageData.usage?.interviews,   limit: usageData.limits?.interviews,   icon: '🎙️' },
    { label: 'Mock Tests',     used: usageData.usage?.tests,        limit: usageData.limits?.tests,        icon: '📝' },
    { label: 'Resume Checks',  used: usageData.usage?.resumeChecks, limit: usageData.limits?.resumeChecks, icon: '📄' },
  ];

  return (
    <div className="t-card rounded-2xl p-6" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold t-text">Today's Usage</h2>
        {isPremium && (
          <span className="text-xs t-muted py-0.5 px-2 rounded-lg"
            style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
            ∞ Unlimited
          </span>
        )}
        {!isPremium && (
          <span className="text-xs t-muted">Resets daily at midnight</span>
        )}
      </div>

      <div className="space-y-4">
        {items.map(({ label, used = 0, limit, icon }) => {
          const isUnlimited = limit === Infinity || limit === null;
          const pct = isUnlimited ? 20 : Math.min(100, (used / limit) * 100);
          const remaining = isUnlimited ? '∞' : Math.max(0, limit - used);
          const danger = !isUnlimited && used >= limit;

          return (
            <div key={label}>
              <div className="flex justify-between items-center mb-1.5 text-sm">
                <span className="t-text flex items-center gap-2">{icon} {label}</span>
                <span style={{ color: danger ? '#ef4444' : isUnlimited ? '#22c55e' : 'var(--muted)' }}>
                  {isUnlimited ? '∞ unlimited' : `${used} / ${limit} used`}
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(128,128,128,0.12)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{
                    background: danger
                      ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                      : isUnlimited
                        ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                        : 'linear-gradient(90deg, var(--accent), var(--accent2))',
                  }}
                />
              </div>
              {!isUnlimited && (
                <p className="text-xs mt-1" style={{ color: danger ? '#ef4444' : 'var(--muted)' }}>
                  {danger ? '⚠️ Limit reached — upgrade for more' : `${remaining} remaining today`}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Subscription Card ──────────────────────────────────────────── */
function SubscriptionCard({ isPremium, daysLeft, payStatus, upgrading, upgradeMsg, upgradeError, onUpgrade }) {
  const FREE_FEATURES = [
    { label: '3 interviews/day (Easy only)', ok: false },
    { label: '2 mock tests/day', ok: false },
    { label: '2 resume checks/day', ok: false },
    { label: 'Job apply access', ok: false },
    { label: 'Medium & Hard difficulty', ok: false },
  ];

  const PREMIUM_FEATURES = [
    { label: 'Unlimited interviews (all difficulties)', ok: true },
    { label: 'Unlimited mock tests daily', ok: true },
    { label: 'Unlimited resume ATS checks', ok: true },
    { label: 'Apply to all jobs directly', ok: true },
    { label: 'RAG-based AI evaluation', ok: true },
    { label: 'Priority support', ok: true },
  ];

  if (isPremium) {
    return (
      <motion.div
        className="t-card rounded-2xl p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(0,229,255,0.08), rgba(41,121,255,0.04))',
          border:     '2px solid rgba(0,229,255,0.3)',
          boxShadow: '0 0 40px rgba(0,229,255,0.1)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-xl t-text flex items-center gap-2">✨ Premium Active</h2>
            <p className="text-sm t-muted mt-0.5">
              {daysLeft > 0 ? `${daysLeft} days remaining` : 'Active subscription'}
              {payStatus?.premiumExpiry && (
                <span> · Expires {new Date(payStatus.premiumExpiry).toLocaleDateString()}</span>
              )}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs t-muted">Your plan</p>
            <p className="font-bold grad-text text-lg">₹199/mo</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-2">
          {PREMIUM_FEATURES.map(f => (
            <p key={f.label} className="text-sm flex items-center gap-2 t-text">
              <span className="text-green-400">✓</span> {f.label}
            </p>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="t-card rounded-2xl p-6" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
      <div className="flex items-start justify-between mb-4 flex-wrap gap-4">
        <div>
          <h2 className="font-bold text-xl t-text">Free Plan</h2>
          <p className="text-sm t-muted mt-0.5">Upgrade to unlock everything</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xs t-muted">Premium price</p>
          <p className="font-bold grad-text text-xl">₹199<span className="text-sm font-normal t-muted">/mo</span></p>
        </div>
      </div>

      {/* Feature comparison */}
      <div className="mb-6 space-y-2">
        {FREE_FEATURES.map(f => (
          <p key={f.label} className="text-sm flex items-center gap-2 t-muted">
            <span className="text-red-400 text-base">✗</span> {f.label}
          </p>
        ))}
      </div>

      <div className="mb-4 p-3 rounded-xl" style={{ background: 'rgba(0,229,255,0.05)', border: '1px solid rgba(0,229,255,0.15)' }}>
        <p className="text-xs t-muted mb-2 font-medium">Premium includes:</p>
        <div className="grid sm:grid-cols-2 gap-1.5">
          {PREMIUM_FEATURES.map(f => (
            <p key={f.label} className="text-xs flex items-center gap-1.5 t-text">
              <span className="text-green-400">✓</span> {f.label}
            </p>
          ))}
        </div>
      </div>

      {/* Messages */}
      <AnimatePresence>
        {upgradeMsg && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-xl text-sm font-medium text-green-400 text-center"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
            {upgradeMsg}
          </motion.div>
        )}
        {upgradeError && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-xl text-sm text-red-400"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            ⚠️ {upgradeError}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(0,229,255,0.4)' }}
        whileTap={{ scale: 0.98 }}
        onClick={onUpgrade}
        disabled={upgrading}
        className="w-full py-3.5 rounded-xl font-bold text-white btn-primary disabled:opacity-60 flex items-center justify-center gap-2"
        style={{ boxShadow: '0 4px 20px rgba(0,229,255,0.25)' }}
      >
        {upgrading ? (
          <>
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          <>🚀 Upgrade to Premium — ₹199/month</>
        )}
      </motion.button>

      <p className="text-xs t-muted text-center mt-3">
        Secure payment via Razorpay 🔒 · Cancel anytime
      </p>
    </div>
  );
}

/* ── Stats Card ─────────────────────────────────────────────────── */
function StatsCard({ stats }) {
  const items = [
    { label: 'Interviews',   value: stats.totalInterviews || 0,         icon: '🎙️' },
    { label: 'Mock Tests',   value: stats.totalMockTests  || 0,         icon: '📝' },
    { label: 'Avg Score',    value: `${Math.round(stats.avgScore || 0)}%`, icon: '📊' },
    { label: 'Best Score',   value: `${Math.round(stats.bestScore || 0)}%`, icon: '🏆' },
    { label: 'Avg Posture',  value: `${Math.round(stats.avgPosture || 0)}%`, icon: '🧘' },
    { label: 'Avg Confidence', value: `${Math.round(stats.avgConfidence || 0)}%`, icon: '💪' },
  ];

  return (
    <div className="t-card rounded-2xl p-6" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
      <h2 className="font-semibold t-text mb-4">Performance Stats</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {items.map(({ label, value, icon }) => (
          <div key={label} className="rounded-xl p-4 text-center"
            style={{ background: 'rgba(128,128,128,0.05)', border: '1px solid var(--border)' }}>
            <div className="text-2xl mb-1">{icon}</div>
            <p className="font-bold text-lg grad-text">{value}</p>
            <p className="text-xs t-muted mt-0.5">{label}</p>
          </div>
        ))}
      </div>
      {stats.lastPracticed && (
        <p className="text-xs t-muted mt-4 text-center">
          Last practiced: {new Date(stats.lastPracticed).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}