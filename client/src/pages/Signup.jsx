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
    if (!clientId || !window.google) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (res) => {
        try {
          setLoading(true);
          await googleLogin(res.credential);
          navigate('/dashboard');
        } catch {
          setError('Google sign up failed. Try again.');
        } finally {
          setLoading(false);
        }
      },
    });

    window.google.accounts.id.renderButton(
      document.getElementById('google-btn-signup'),
      { theme: 'filled_black', size: 'large', width: '100%', text: 'signup_with', shape: 'rectangular' }
    );
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) return setError('Passwords do not match.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');

    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'name',     label: 'Full Name',        type: 'text',     placeholder: 'Yuvraj Singh' },
    { name: 'email',    label: 'Email',             type: 'email',    placeholder: 'you@example.com' },
    { name: 'password', label: 'Password',          type: 'password', placeholder: '6+ characters' },
    { name: 'confirm',  label: 'Confirm Password',  type: 'password', placeholder: 'Same as above' },
  ];

  return (
    <div className="min-h-screen t-bg bg-grid flex items-center justify-center px-4 py-12">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-10"
          style={{ background: 'var(--accent2)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-md relative z-10"
      >
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
          <h1 className="font-display font-bold text-2xl t-text mb-1">Create your account</h1>
          <p className="text-sm t-muted mb-7">Start practicing interviews for free</p>

          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-5">
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(f => (
              <div key={f.name}>
                <label className="block text-sm t-muted mb-2">{f.label}</label>
                <input
                  type={f.type}
                  name={f.name}
                  value={form[f.name]}
                  onChange={handleChange}
                  required
                  placeholder={f.placeholder}
                  className="input-box"
                />
              </div>
            ))}

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-semibold text-white btn-primary mt-2">
              {loading
                ? <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </span>
                : 'Create Account'
              }
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            <span className="text-xs t-muted">or</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          </div>

          <div id="google-btn-signup" className="flex justify-center" />

          <p className="text-center text-sm t-muted mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-medium" style={{ color: 'var(--accent)' }}>
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}