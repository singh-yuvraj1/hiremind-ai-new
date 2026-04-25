import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
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

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState(false);
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      return setError('Passwords do not match');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);

    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. The link might be expired.');
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
            background: 'rgba(10,22,40,0.70)',
            border: '1px solid rgba(0,229,255,0.16)',
            backdropFilter: 'blur(28px)',
            boxShadow: '0 8px 48px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.04) inset',
          }}>
          
          <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible">
            <h1 className="font-display font-bold text-2xl t-text mb-1">Create new password</h1>
            <p className="text-sm t-muted mb-7">Enter your new secure password</p>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-5">
              {error}
            </motion.div>
          )}

          {success ? (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-2xl mx-auto mb-4">
                ✓
              </div>
              <p className="t-text font-medium mb-1">Password Reset Successfully</p>
              <p className="text-sm t-muted">Redirecting to login in 3 seconds...</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible">
                <label className="block text-sm t-muted mb-2">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="input-box"
                />
              </motion.div>

              <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible">
                <label className="block text-sm t-muted mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="input-box"
                />
              </motion.div>

              <motion.div custom={3} variants={fieldVariants} initial="hidden" animate="visible">
                <GlowButton className="w-full">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl text-sm font-semibold text-white btn-primary">
                    {loading
                      ? <span className="flex items-center justify-center gap-2">
                          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                            <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z"/>
                          </svg>
                          Resetting...
                        </span>
                      : 'Reset Password'
                    }
                  </button>
                </GlowButton>
              </motion.div>
            </form>
          )}

        </div>
      </motion.div>
    </div>
  );
}
