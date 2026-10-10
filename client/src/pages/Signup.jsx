import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [form,    setForm]    = useState({ name: '', email: '', password: '', confirm: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    let intervalId;
    let isMounted = true;

    const initGoogle = () => {
      const btnEl = document.getElementById('google-btn-signup');
      if (window.google?.accounts?.id && btnEl && isMounted) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: async (res) => {
              if (!res.credential || !isMounted) return;
              try {
                setLoading(true);
                setError('');
                await googleLogin(res.credential);
                navigate('/dashboard');
              } catch (err) {
                if (isMounted) {
                  setError(err.response?.data?.message || 'Google sign up failed. Please try again.');
                }
              } finally {
                if (isMounted) setLoading(false);
              }
            },
          });
          btnEl.innerHTML = '';
          window.google.accounts.id.renderButton(
            btnEl,
            { theme: 'outline', size: 'large', width: '100%', text: 'signup_with', shape: 'rectangular' }
          );
          if (intervalId) clearInterval(intervalId);
        } catch (err) {
          console.error('[Google Signup Button Render Error]:', err);
        }
      }
    };

    initGoogle();
    if (!window.google?.accounts?.id || !document.getElementById('google-btn-signup')) {
      intervalId = setInterval(initGoogle, 150);
    }
    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [googleLogin, navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError('Please enter your full name.');
    if (!form.email.trim()) return setError('Please enter your email address.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    if (form.password !== form.confirm) return setError('Passwords do not match.');

    setLoading(true);
    try {
      await register(form.name.trim(), form.email.trim(), form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen t-bg flex" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* Left branding panel */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 flex-shrink-0"
        style={{ width: 420, background: 'var(--surface)', borderRight: '1px solid var(--border)' }}
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
            Your interview career<br />starts here.
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '2rem' }}>
            Create your free account and start practicing with AI-powered mock interviews. No credit card required.
          </p>

          <div
            style={{
              padding: '1rem 1.25rem',
              borderRadius: 10,
              background: 'var(--accent-bg)',
              border: '1px solid var(--accent-border)',
            }}
          >
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-2)', lineHeight: 1.6, margin: 0 }}>
              <span style={{ fontWeight: 600, color: 'var(--accent)' }}>Free plan includes:</span> 3 AI interviews/day, 2 mock tests, 2 resume checks. Upgrade for unlimited access.
            </p>
          </div>
        </div>

        <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
          © {new Date().getFullYear()} HireMind AI
        </p>
      </div>

      {/* Right form panel */}
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
            Create your account
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--muted)', marginBottom: '2rem' }}>
            Start practicing interviews for free — no credit card needed
          </p>

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
            {[
              { name: 'name',     label: 'Full name',        type: 'text',     placeholder: 'Yuvraj Singh',    autocomplete: 'name' },
              { name: 'email',    label: 'Email address',    type: 'email',    placeholder: 'you@example.com', autocomplete: 'email' },
              { name: 'password', label: 'Password',         type: 'password', placeholder: 'At least 6 characters', autocomplete: 'new-password' },
              { name: 'confirm',  label: 'Confirm password', type: 'password', placeholder: 'Repeat your password',  autocomplete: 'new-password' },
            ].map(f => (
              <div key={f.name}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-2)', marginBottom: 6 }}>
                  {f.label}
                </label>
                <input
                  type={f.type}
                  name={f.name}
                  id={`signup-${f.name}`}
                  value={form[f.name]}
                  onChange={handleChange}
                  required
                  placeholder={f.placeholder}
                  autoComplete={f.autocomplete}
                  className="input-box"
                />
              </div>
            ))}

            <button
              type="submit"
              id="signup-submit"
              disabled={loading}
              className="btn-primary"
              style={{ padding: '11px', fontSize: '0.9375rem', marginTop: 4 }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.75s linear infinite', display: 'inline-block' }} />
                  Creating account...
                </span>
              ) : 'Create free account'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '1.5rem 0' }}>
            <div className="divider flex-1" />
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>or</span>
            <div className="divider flex-1" />
          </div>

          <div id="google-btn-signup" style={{ display: 'flex', justifyContent: 'center' }} />

          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--muted)', marginTop: '1.5rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}