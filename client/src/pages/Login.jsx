import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import FloatingBlobs from '../components/FloatingBlobs';
import GlowButton from '../components/GlowButton';

const fieldVariants = {
  hidden:  { opacity: 0, y: 14 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: 0.1 + i * 0.08, duration: 0.38, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function Login() {
  const [email,   setEmail]   = useState('');
  const [pass,    setPass]    = useState('');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  // initialize google button safely by waiting for script to load
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    let intervalId;

    const initGoogle = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (res) => {
            try {
              setLoading(true);
              await googleLogin(res.credential);
              navigate('/dashboard');
            } catch {
              setError('Google sign in failed. Try again.');
            } finally {
              setLoading(false);
            }
          },
        });

        window.google.accounts.id.renderButton(
          document.getElementById('google-btn'),
          { theme: 'filled_black', size: 'large', width: '100%', shape: 'rectangular' }
        );
        
        if (intervalId) clearInterval(intervalId);
      }
    };

    // try init immediately
    initGoogle();
    
    // if it didn't work immediately, try every 100ms
    if (!window.google?.accounts?.id) {
      intervalId = setInterval(initGoogle, 100);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, pass);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen t-bg flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Animated background blobs */}
      <FloatingBlobs density="medium" opacity={0.14} />

      {/* Background grid */}
      <div className="absolute inset-0 bg-grid pointer-events-none" />

      {/* Centre glow */}
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
            <h1 className="font-display font-bold text-2xl t-text mb-1">Welcome back</h1>
            <p className="text-sm t-muted mb-7">Sign in to continue your interview prep</p>
          </motion.div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-5">
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible">
              <label className="block text-sm t-muted mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="input-box"
              />
            </motion.div>

            <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible">
              <div className="flex justify-between mb-2">
                <label className="text-sm t-muted">Password</label>
                <Link to="/forgot-password" className="text-xs" style={{ color: 'var(--accent)' }}>Forgot?</Link>
              </div>
              <input
                type="password"
                value={pass}
                onChange={e => setPass(e.target.value)}
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
                        Signing in...
                      </span>
                    : 'Sign In'
                  }
                </button>
              </GlowButton>
            </motion.div>
          </form>

          {/* Divider */}
          <motion.div custom={4} variants={fieldVariants} initial="hidden" animate="visible"
            className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            <span className="text-xs t-muted">or continue with</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          </motion.div>

          <motion.div custom={5} variants={fieldVariants} initial="hidden" animate="visible">
            <div id="google-btn" className="flex justify-center" />
          </motion.div>

          <motion.p custom={6} variants={fieldVariants} initial="hidden" animate="visible"
            className="text-center text-sm t-muted mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium" style={{ color: 'var(--accent)' }}>
              Sign up free
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}