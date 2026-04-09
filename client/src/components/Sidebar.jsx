import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/dashboard',        icon: '📊', label: 'Dashboard' },
  { to: '/interview',        icon: '🎙️', label: 'AI Interview' },
  { to: '/mock-test',        icon: '📝', label: 'Mock Test' },
  { to: '/jobs',             icon: '💼', label: 'Job Board' },
  { to: '/resume-analyzer',  icon: '📄', label: 'Resume AI' },
  { to: '/history',          icon: '📂', label: 'History' },
  { to: '/profile',          icon: '👤', label: 'Profile' },
];

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <>
      {/* Overlay (mobile) */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 lg:hidden"
            style={{ background: 'rgba(0,0,0,0.6)' }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: open ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="fixed top-0 left-0 h-full z-40 lg:hidden flex flex-col"
        style={{ width: 260, background: 'var(--bg2)', borderRight: '1px solid var(--border)' }}
      >
        <SidebarContent user={user} location={location} onClose={onClose} />
      </motion.aside>

      {/* Desktop always-visible sidebar */}
      <aside
        className="hidden lg:flex flex-col flex-shrink-0"
        style={{
          width: 240,
          minHeight: '100vh',
          background: 'var(--bg2)',
          borderRight: '1px solid var(--border)',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
        }}
      >
        <SidebarContent user={user} location={location} />
      </aside>
    </>
  );
}

function SidebarContent({ user, location, onClose }) {
  return (
    <div className="flex flex-col h-full py-6 px-4">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
          style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent2))' }}>
          🧠
        </div>
        <span className="font-bold font-display grad-text text-lg">HireMind</span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(item => {
          const isActive = location.pathname === item.to ||
            (item.to !== '/dashboard' && location.pathname.startsWith(item.to));
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background:  isActive ? 'rgba(128,128,128,0.12)' : 'transparent',
                color:       isActive ? 'var(--accent)'           : 'var(--muted)',
                borderLeft:  isActive ? '2px solid var(--accent)' : '2px solid transparent',
              }}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* User card */}
      {user && (
        <div className="mt-6 p-3 rounded-xl" style={{ background: 'rgba(128,128,128,0.06)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent2))', color: '#fff' }}>
                {user.name?.[0]?.toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold t-text truncate">{user.name}</p>
              <p className="text-xs t-muted capitalize">{user.subscription?.plan || 'free'} plan</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
