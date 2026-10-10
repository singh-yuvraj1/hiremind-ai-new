import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import UserAvatar from './UserAvatar';

/* ── Clean SVG icons (Heroicons-style) ──────────────────── */
const Icons = {
  Dashboard: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  Interview: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/>
      <line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
  ),
  MockTest: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>
  ),
  Jobs: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
      <line x1="12" y1="12" x2="12" y2="12"/><path d="M12 12h.01"/>
    </svg>
  ),
  Resume: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  History: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/>
      <polyline points="12 7 12 12 15 15"/>
    </svg>
  ),
  Profile: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
};

const NAV_ITEMS = [
  { to: '/dashboard',       icon: Icons.Dashboard, label: 'Dashboard' },
  { to: '/interview',       icon: Icons.Interview, label: 'AI Interview' },
  { to: '/mock-test',       icon: Icons.MockTest,  label: 'Mock Test' },
  { to: '/jobs',            icon: Icons.Jobs,      label: 'Job Board' },
  { to: '/resume-analyzer', icon: Icons.Resume,    label: 'Resume AI' },
  { to: '/history',         icon: Icons.History,   label: 'History' },
  { to: '/profile',         icon: Icons.Profile,   label: 'Profile' },
];

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 lg:hidden"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: open ? 0 : '-100%' }}
        transition={{ type: 'tween', duration: 0.25, ease: 'easeInOut' }}
        className="fixed top-0 left-0 h-full z-40 lg:hidden flex flex-col sidebar"
        style={{ width: 'var(--sidebar-w, 236px)' }}
      >
        <SidebarContent user={user} location={location} onClose={onClose} />
      </motion.aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col sidebar">
        <SidebarContent user={user} location={location} />
      </aside>
    </>
  );
}

function SidebarContent({ user, location, onClose }) {
  const isPremium = user?.subscription?.plan && user.subscription.plan !== 'free';

  return (
    <div className="flex flex-col h-full" style={{ paddingTop: 'var(--nav-h, 60px)' }}>
      <div className="flex flex-col flex-1 p-3">

        {/* Section label */}
        <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '8px 10px 6px' }}>
          Navigation
        </p>

        {/* Nav items */}
        <nav className="flex-1 space-y-0.5">
          {NAV_ITEMS.map(item => {
            const isActive = location.pathname === item.to ||
              (item.to !== '/dashboard' && location.pathname.startsWith(item.to));
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className="nav-link"
                style={{
                  color: isActive ? 'var(--accent)' : 'var(--muted)',
                  background: isActive ? 'var(--accent-bg)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  borderRadius: '6px',
                }}
              >
                <Icon />
                <span>{item.label}</span>
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: '25%',
                      bottom: '25%',
                      width: '2px',
                      borderRadius: '0 2px 2px 0',
                      background: 'var(--accent)',
                    }}
                  />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="divider my-3" />

        {/* Plan indicator */}
        {user && (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              background: isPremium ? 'var(--accent-bg)' : 'var(--surface)',
              border: `1px solid ${isPremium ? 'var(--accent-border)' : 'var(--border)'}`,
            }}
          >
            <div className="flex items-center gap-2.5">
              <UserAvatar
                user={user}
                size={34}
                borderColor="var(--border)"
              />
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>
                  {user.name}
                </p>
                <p style={{ fontSize: '0.6875rem', color: isPremium ? 'var(--accent)' : 'var(--muted)', margin: 0, fontWeight: isPremium ? 600 : 400 }}>
                  {isPremium ? 'Premium' : 'Free plan'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
