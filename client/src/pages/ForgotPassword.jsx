import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import FloatingBlobs from '../components/FloatingBlobs';
import GlowButton from '../components/GlowButton';
import api from '../services/api';

const fieldVariants = {
  hidden:  { opacity: 0, y: 14 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: 0.1 + i * 0.08, duration: 0.38, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function ForgotPassword() {
  const [email,    setEmail]    = useState('');
  const [error,    setError]    = useState('');
  const [sent,     setSent]     = useState(false);   // email really sent
  const [devLink,  setDevLink]  = useState('');      // dev-mode reset URL
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email });

      if (res.data.devMode && res.data.resetUrl) {
        // Email not configured on server — show clickable dev link
        setDevLink(res.data.resetUrl);
      } else {
        setSent(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen t-bg flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <FloatingBlobs density="low" opacity={0.12} />
      <div className="absolute inset-0 bg-grid pointer-events-none" />

      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-3xl opacity-10"
          style={{ background: 'var(--accent)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <motion.div
            whileHover={{ rotate: 15, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L15 5V11L8 15L1 11V5L8 1Z" stroke="white" strokeWidth="1.5" fill="none"/>
              <circle cx="8" cy="8" r="2.5" fill="white"/>
            </svg>
          </motion.div>
          <span className="font-display font-bold text-xl t-text">
            Hire<span className="grad-text">Mind</span> AI
          </span>
        </Link>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background:    'rgba(10,22,40,0.70)',
            border:        '1px solid rgba(0,229,255,0.16)',
            backdropFilter:'blur(28px)',
            boxShadow:     '0 8px 48px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.04) inset',
          }}>

          <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible">
            <h1 className="font-display font-bold text-2xl t-text mb-1">Reset Password</h1>
            <p className="text-sm t-muted mb-7">
              Enter your email and we'll send you a link to reset your password.
            </p>
          </motion.div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-5">
              {error}
            </motion.div>
          )}

          {/* ── Email sent (real email) ── */}
          {sent && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4 space-y-3">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto text-2xl"
                style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>
                ✉️
              </div>
              <p className="font-medium t-text">Check your inbox!</p>
              <p className="text-sm t-muted">
                We sent a password reset link to <strong className="t-text">{email}</strong>.
                <br/>It expires in 15 minutes. Check your spam folder too.
              </p>
              <Link to="/login"
                className="inline-block mt-2 text-sm font-medium"
                style={{ color: 'var(--accent)' }}>
                ← Back to Sign In
              </Link>
            </motion.div>
          )}

          {/* ── Dev mode: email not configured ── */}
          {devLink && !sent && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl p-4 mb-5 space-y-3"
              style={{ background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.25)' }}>
              <p className="text-sm font-medium" style={{ color: '#fb923c' }}>
                ⚡ Dev Mode — Email service not configured
              </p>
              <p className="text-xs t-muted">
                Set <code style={{ color: 'var(--accent)' }}>EMAIL_USER</code> and{' '}
                <code style={{ color: 'var(--accent)' }}>EMAIL_PASS</code> in{' '}
                <code style={{ color: 'var(--accent)' }}>server/.env</code> to send real emails.
              </p>
              <p className="text-xs t-muted">Click the link below to reset your password:</p>
              <a
                href={devLink}
                className="block text-xs font-medium break-all"
                style={{ color: '#00e5ff' }}>
                {devLink}
              </a>
            </motion.div>
          )}

          {/* ── Form (hidden once link sent) ── */}
          {!sent && !devLink && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible">
                <label className="block text-sm t-muted mb-2">Email Address</label>
                <input
                  type="email"
                  id="forgot-email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="input-box"
                />
              </motion.div>

              <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible">
                <GlowButton className="w-full">
                  <button
                    id="forgot-submit"
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl text-sm font-semibold text-white btn-primary">
                    {loading
                      ? <span className="flex items-center justify-center gap-2">
                          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                            <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z"/>
                          </svg>
                          Sending...
                        </span>
                      : 'Send Reset Link'
                    }
                  </button>
                </GlowButton>
              </motion.div>
            </form>
          )}

          <motion.p custom={3} variants={fieldVariants} initial="hidden" animate="visible"
            className="text-center text-sm t-muted mt-6">
            Remembered your password?{' '}
            <Link to="/login" className="font-medium" style={{ color: 'var(--accent)' }}>
              Sign in
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
