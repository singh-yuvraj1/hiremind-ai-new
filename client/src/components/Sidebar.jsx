import { NavLink, useLocation, Link } from 'react-router-dom';
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

const sidebarVariants = {
  hidden: { x: '-100%' },
  visible: { x: 0 },
};

const itemVariants = {
  hidden:  { opacity: 0, x: -14 },
  visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.05, duration: 0.28, ease: [0.22, 1, 0.36, 1] } }),
};

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
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 lg:hidden"
            style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: open ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="fixed top-0 left-0 h-full z-40 lg:hidden flex flex-col"
        style={{
          width: 260,
          background: 'var(--bg2)',
          borderRight: '1px solid var(--border)',
          backdropFilter: 'blur(24px)',
        }}
      >
        <SidebarContent user={user} location={location} onClose={onClose} />
      </motion.aside>

      {/* Desktop always-visible sidebar */}
      <aside
        className="hidden lg:flex flex-col flex-shrink-0"
        style={{
          width: 248,
          minHeight: '100vh',
          background: 'var(--bg2)',
          borderRight: '1px solid var(--border)',
          backdropFilter: 'blur(20px)',
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
  const isPremium = user?.subscription?.plan && user.subscription.plan !== 'free';

  return (
    <div className="flex flex-col h-full py-6 px-4">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-center gap-2 mb-8 px-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
          style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent2))' }}>
          🧠
        </div>
        <span className="font-bold font-display grad-text text-lg">HireMind</span>
      </motion.div>

      {/* Nav items */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item, i) => {
          const isActive = location.pathname === item.to ||
            (item.to !== '/dashboard' && location.pathname.startsWith(item.to));

          return (
            <motion.div
              key={item.to}
              custom={i}
              variants={itemVariants}
              initial="hidden"
              animate="visible">
              <NavLink
                to={item.to}
                onClick={onClose}
                className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors overflow-hidden"
                style={{
                  color: isActive ? 'var(--accent)' : 'var(--muted)',
                }}>
                {/* Active background pill */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-pill"
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: 'linear-gradient(90deg, rgba(0,229,255,0.10), rgba(41,121,255,0.06))',
                      borderLeft: '2px solid var(--accent)',
                    }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative text-base w-5 text-center">{item.icon}</span>
                <span className="relative">{item.label}</span>
              </NavLink>
            </motion.div>
          );
        })}
      </nav>

      {/* Upgrade CTA (only for free users) */}
      {user && !isPremium && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-4 p-3 rounded-xl relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(0,229,255,0.08), rgba(124,58,237,0.10))',
            border: '1px solid rgba(0,229,255,0.18)',
          }}>
          <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full blur-2xl opacity-30"
            style={{ background: 'var(--accent)' }} />
          <p className="text-xs font-semibold t-text mb-1 relative">✨ Upgrade to Pro</p>
          <p className="text-xs t-muted mb-2.5 relative">Unlimited AI interviews & analytics</p>
          <Link
            to="/profile"
            onClick={onClose}
            className="block text-center py-1.5 rounded-lg text-xs font-semibold text-white btn-primary relative pulse-glow">
            Upgrade Now
          </Link>
        </motion.div>
      )}

      {/* User card */}
      {user && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mt-4 p-3 rounded-xl"
          style={{ background: 'rgba(128,128,128,0.06)', border: '1px solid var(--border)' }}>
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
        </motion.div>
      )}
    </div>
  );
}
