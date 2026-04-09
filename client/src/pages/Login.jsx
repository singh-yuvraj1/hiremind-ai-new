import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email,   setEmail]   = useState('');
  const [pass,    setPass]    = useState('');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  // initialize google button
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || !window.google) return;

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
    <div className="min-h-screen t-bg bg-grid flex items-center justify-center px-4 py-12">
      {/* background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-10"
          style={{ background: 'var(--accent)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-md relative z-10"
      >
        {/* logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L15 5V11L8 15L1 11V5L8 1Z" stroke="white" strokeWidth="1.5" fill="none"/>
              <circle cx="8" cy="8" r="2.5" fill="white"/>
            </svg>
          </div>
          <span className="font-display font-bold text-xl t-text">
            Hire<span className="grad-text">Mind</span> AI
          </span>
        </Link>

        <div className="t-card rounded-2xl p-8">
          <h1 className="font-display font-bold text-2xl t-text mb-1">Welcome back</h1>
          <p className="text-sm t-muted mb-7">Sign in to continue your interview prep</p>

          {/* error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-5"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm t-muted mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="input-box"
              />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm t-muted">Password</label>
                <a href="#" className="text-xs" style={{ color: 'var(--accent)' }}>Forgot?</a>
              </div>
              <input
                type="password"
                value={pass}
                onChange={e => setPass(e.target.value)}
                required
                placeholder="••••••••"
                className="input-box"
              />
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-semibold text-white btn-primary mt-2">
              {loading
                ? <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                : 'Sign In'
              }
            </button>
          </form>

          {/* divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            <span className="text-xs t-muted">or continue with</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          </div>

          <div id="google-btn" className="flex justify-center" />

          <p className="text-center text-sm t-muted mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium" style={{ color: 'var(--accent)' }}>
              Sign up free
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}