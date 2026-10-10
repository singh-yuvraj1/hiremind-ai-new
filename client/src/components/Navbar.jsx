import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import UserAvatar from './UserAvatar';

export default function Navbar({ onMenuClick }) {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const { user, logout }          = useAuth();
  const navigate                  = useNavigate();
  const location                  = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler, { passive: true });
    handler();
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const scrollToSection = (id) => {
    setMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 400);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isActive = (path) => location.pathname === path;

  const appLinks = [
    { label: 'Dashboard',    to: '/dashboard' },
    { label: 'Interview',    to: '/interview'  },
    { label: 'Mock Tests',   to: '/mock-test'  },
    { label: 'Jobs',         to: '/jobs'       },
    { label: 'Resume AI',    to: '/resume-analyzer' },
  ];

  return (
    <header
      className={`nav-bar t-bg${scrolled ? ' scrolled' : ''}`}
      style={{ transition: 'box-shadow 0.3s ease, border-color 0.3s ease' }}
    >
      <div className="max-w-[1200px] mx-auto h-full flex items-center justify-between px-5">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 flex-shrink-0"
          style={{ textDecoration: 'none' }}
        >
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--accent)' }}
          >
            {/* Brain/target icon */}
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 2C5.79 2 4 3.79 4 6c0 1.3.61 2.46 1.56 3.22L5 11h6l-.56-1.78C11.39 8.46 12 7.3 12 6c0-2.21-1.79-4-4-4z" fill="white" opacity="0.9"/>
              <path d="M6 11h4v1.5a.5.5 0 01-1 0V13H7v-.5a.5.5 0 01-1 0V11z" fill="white" opacity="0.7"/>
              <circle cx="8" cy="6" r="1.5" fill="white"/>
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text)', letterSpacing: '-0.02em' }}>
            HireMind<span style={{ color: 'var(--accent)' }}> AI</span>
          </span>
        </Link>

        {/* Desktop center links */}
        <nav className="hidden md:flex items-center gap-1">
          {user ? (
            appLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: isActive(link.to) ? 600 : 500,
                  color: isActive(link.to) ? 'var(--accent)' : 'var(--muted)',
                  background: isActive(link.to) ? 'var(--accent-bg)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => {
                  if (!isActive(link.to)) {
                    e.target.style.color = 'var(--text-2)';
                    e.target.style.background = 'var(--surface)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive(link.to)) {
                    e.target.style.color = 'var(--muted)';
                    e.target.style.background = 'transparent';
                  }
                }}
              >
                {link.label}
              </Link>
            ))
          ) : (
            <>
              <button
                onClick={() => scrollToSection('features')}
                style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 500, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.15s ease' }}
                onMouseEnter={e => e.target.style.color = 'var(--text-2)'}
                onMouseLeave={e => e.target.style.color = 'var(--muted)'}
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('howitworks')}
                style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 500, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.15s ease' }}
                onMouseEnter={e => e.target.style.color = 'var(--text-2)'}
                onMouseLeave={e => e.target.style.color = 'var(--muted)'}
              >
                How It Works
              </button>
            </>
          )}
        </nav>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/profile"
                className="flex items-center gap-2 group"
                style={{ textDecoration: 'none' }}
              >
                <UserAvatar
                  user={user}
                  size={34}
                  borderColor="var(--border)"
                  className="group-hover:ring-2 group-hover:ring-[var(--accent)] transition-all"
                />
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-2)' }}>
                  {user.name?.split(' ')[0]}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="btn-ghost"
                style={{ padding: '6px 10px', fontSize: '0.8125rem' }}
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                style={{ padding: '7px 14px', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 500, color: 'var(--muted)', textDecoration: 'none', transition: 'color 0.15s ease' }}
                onMouseEnter={e => e.target.style.color = 'var(--text)'}
                onMouseLeave={e => e.target.style.color = 'var(--muted)'}
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="btn-primary"
                style={{ padding: '7px 16px', textDecoration: 'none', display: 'inline-block' }}
              >
                Get started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile right */}
        <div className="md:hidden flex items-center gap-1">
          <ThemeToggle />

          {/* Sidebar toggle for authenticated pages */}
          {user && onMenuClick && (
            <button
              onClick={onMenuClick}
              className="btn-ghost w-8 h-8 flex items-center justify-center rounded-md lg:hidden"
              aria-label="Open navigation"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 12h18M3 6h18M3 18h18"/>
              </svg>
            </button>
          )}

          {/* Mobile hamburger for public pages */}
          {!user && (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="btn-ghost w-8 h-8 flex items-center justify-center rounded-md"
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 12h18M3 6h18M3 18h18"/>
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Mobile dropdown menu (public only) */}
      <AnimatePresence>
        {menuOpen && !user && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="md:hidden"
            style={{
              background: 'var(--bg)',
              borderTop: '1px solid var(--border)',
              padding: '1rem 1.25rem',
            }}
          >
            <div className="space-y-1 mb-4">
              <button
                onClick={() => scrollToSection('features')}
                className="block w-full text-left"
                style={{ padding: '8px 10px', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 500, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('howitworks')}
                className="block w-full text-left"
                style={{ padding: '8px 10px', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 500, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                How It Works
              </button>
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', gap: '8px' }}>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="btn-outline flex-1 text-center"
                style={{ padding: '8px 16px', textDecoration: 'none', display: 'block' }}
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                onClick={() => setMenuOpen(false)}
                className="btn-primary flex-1 text-center"
                style={{ padding: '8px 16px', textDecoration: 'none', display: 'block' }}
              >
                Get started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}