import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import GoogleAuthButton from '../components/GoogleAuthButton';

export default function Login() {
  const [email,   setEmail]   = useState('');
  const [pass,    setPass]    = useState('');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), pass);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen t-bg flex"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {/* Left panel — branding */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 flex-shrink-0"
        style={{
          width: 420,
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
        }}
      >
        <div>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, marginBottom: '3rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2C5.79 2 4 3.79 4 6c0 1.3.61 2.46 1.56 3.22L5 11h6l-.56-1.78C11.39 8.46 12 7.3 12 6c0-2.21-1.79-4-4-4z" fill="white" opacity="0.9"/>
                <path d="M6 11h4v1.5a.5.5 0 01-1 0V13H7v-.5a.5.5 0 01-1 0V11z" fill="white" opacity="0.7"/>
                <circle cx="8" cy="6" r="1.5" fill="white"/>
              </svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)', letterSpacing: '-0.02em' }}>HireMind AI</span>
          </Link>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.03em', marginBottom: '1rem' }}>
            Practice smarter.<br />Interview better.
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '2rem' }}>
            Get honest AI feedback on your interview answers, track your progress, and land the role you deserve.
          </p>

          {/* Testimonial / feature points */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              'AI interviews that adapt to your target role',
              'Honest scoring — no inflated feedback',
              'ATS resume analysis in seconds',
              'Mock tests for DSA, aptitude & more',
            ].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round">
                    <path d="M2 6l3 3 5-5"/>
                  </svg>
                </div>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-2)', lineHeight: 1.5 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
          © {new Date().getFullYear()} HireMind AI
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: '100%', maxWidth: 400 }}
        >
          {/* Mobile logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, marginBottom: '2rem' }} className="lg:hidden">
            <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 2C5.79 2 4 3.79 4 6c0 1.3.61 2.46 1.56 3.22L5 11h6l-.56-1.78C11.39 8.46 12 7.3 12 6c0-2.21-1.79-4-4-4z" fill="white" opacity="0.9"/>
                <circle cx="8" cy="6" r="1.5" fill="white"/>
              </svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text)', letterSpacing: '-0.02em' }}>HireMind AI</span>
          </Link>

          <h1 style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.03em', margin: '0 0 8px' }}>
            Welcome back
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '2rem' }}>
            Sign in to continue your interview prep
          </p>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="alert alert-error"
              style={{ marginBottom: '1.25rem' }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-2)', marginBottom: 6 }}>
                Email address
              </label>
              <input
                type="email"
                id="login-email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="input-box"
                autoComplete="email"
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-2)' }}>
                  Password
                </label>
                <Link to="/forgot-password" style={{ fontSize: '0.8125rem', color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
                  Forgot?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  id="login-password"
                  value={pass}
                  onChange={e => setPass(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="input-box"
                  style={{ paddingRight: '2.75rem' }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4 }}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    {showPass
                      ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
                      : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                    }
                  </svg>
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="login-submit"
              disabled={loading}
              className="btn-primary"
              style={{ padding: '11px', fontSize: '0.9375rem', marginTop: 4 }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.75s linear infinite', display: 'inline-block' }} />
                  Signing in...
                </span>
              ) : 'Sign in'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '1.5rem 0' }}>
            <div className="divider flex-1" />
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>or continue with</span>
            <div className="divider flex-1" />
          </div>

          <GoogleAuthButton
            mode="signin"
            onError={(msg) => setError(msg)}
          />

          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--muted)', marginTop: '1.5rem' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Sign up free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}