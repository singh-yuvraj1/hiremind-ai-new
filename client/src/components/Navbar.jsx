import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

export default function Navbar({ onMenuClick }) {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const { user, logout }          = useAuth();
  const navigate                  = useNavigate();
  const location                  = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 15);
    window.addEventListener('scroll', handler);
    handler();
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // this function handles scrolling to sections on home page
  // if user is on another page, it navigates to home first then scrolls
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

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 glass-nav"
      style={{ boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.3)' : 'none' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L15 5V11L8 15L1 11V5L8 1Z" stroke="white" strokeWidth="1.5" fill="none"/>
              <circle cx="8" cy="8" r="2.5" fill="white"/>
            </svg>
          </div>
          <span className="font-display font-bold text-base sm:text-lg t-text">
            Hire<span className="grad-text">Mind</span> AI
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-7">
          {user ? (
            <>
              {[
                { label: 'Dashboard', to: '/dashboard' },
                { label: 'Interview',  to: '/interview'  },
                { label: 'Mock Tests', to: '/mock-test'  },
                { label: 'Jobs',       to: '/jobs'       },
                { label: 'Resume AI',  to: '/resume-analyzer' },
              ].map(link => (
                <Link key={link.to} to={link.to}
                  className="text-sm font-medium transition-colors"
                  style={{ color: isActive(link.to) ? 'var(--accent)' : 'var(--muted)' }}>
                  {link.label}
                </Link>
              ))}
            </>
          ) : (
            <>
              {/* these are buttons not links - they scroll on home page */}
              <button
                onClick={() => scrollToSection('features')}
                className="text-sm font-medium transition-colors"
                style={{ color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                Features
              </button>
              <button
                onClick={() => scrollToSection('howitworks')}
                className="text-sm font-medium transition-colors"
                style={{ color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                How It Works
              </button>
            </>
          )}
        </div>

        {/* Desktop right side */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/profile" className="flex items-center gap-2">
                {user.avatar
                  ? <img src={user.avatar} alt={user.name}
                      className="w-8 h-8 rounded-full border"
                      style={{ borderColor: 'var(--border)' }} />
                  : <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}>
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                }
                <span className="text-sm t-muted">{user.name?.split(' ')[0]}</span>
              </Link>
              <button onClick={handleLogout}
                className="text-sm px-4 py-2 rounded-xl btn-outline">
                Sign Out
              </button>
            </div>
          ) : (
            <>
              <Link to="/login"
                className="text-sm t-muted hover:t-text transition-colors px-3 py-2">
                Sign In
              </Link>
              <Link to="/signup"
                className="text-sm px-5 py-2.5 rounded-xl text-white btn-primary">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile right */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          {/* Sidebar toggle (for dashboard pages) */}
          {user && onMenuClick && (
            <button onClick={onMenuClick} className="p-2 rounded-lg t-muted lg:hidden">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg t-muted">
            <div className="w-5 space-y-1.5">
              <span className={`block h-0.5 bg-current transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}/>
              <span className={`block h-0.5 bg-current transition-all ${menuOpen ? 'opacity-0' : ''}`}/>
              <span className={`block h-0.5 bg-current transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}/>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden px-5 py-4 space-y-3"
            style={{ background: 'var(--nav-bg)', borderTop: '1px solid var(--border)' }}
          >
            {user ? (
              <>
                {[
                  { label: 'Dashboard', to: '/dashboard' },
                  { label: 'Interview',  to: '/interview'  },
                  { label: 'Mock Tests', to: '/mock-test'  },
                  { label: 'History',    to: '/history'    },
                  { label: 'Profile',    to: '/profile'    },
                ].map(link => (
                  <Link key={link.to} to={link.to}
                    className="block py-2 text-sm t-muted"
                    onClick={() => setMenuOpen(false)}>
                    {link.label}
                  </Link>
                ))}
                <button onClick={handleLogout}
                  className="block text-red-400 py-2 text-sm w-full text-left">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => scrollToSection('features')}
                  className="block py-2 text-sm t-muted w-full text-left"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  Features
                </button>
                <button
                  onClick={() => scrollToSection('howitworks')}
                  className="block py-2 text-sm t-muted w-full text-left"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  How It Works
                </button>
                <Link to="/login"
                  className="block py-2 text-sm t-muted"
                  onClick={() => setMenuOpen(false)}>
                  Sign In
                </Link>
                <Link to="/signup"
                  className="block text-center py-2.5 rounded-xl text-white btn-primary text-sm"
                  onClick={() => setMenuOpen(false)}>
                  Get Started
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}