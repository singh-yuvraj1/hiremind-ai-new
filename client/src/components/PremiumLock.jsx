import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * PremiumLock — wraps content that requires Premium subscription.
 * Shows blurred overlay with clean upgrade prompt.
 * IMPORTANT: real gate is on the backend — this is UI only.
 */
export default function PremiumLock({ isPremium, children, feature = 'This feature' }) {
  if (isPremium) return children;

  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 12 }}>
      {/* Blurred content */}
      <div style={{ filter: 'blur(5px)', opacity: 0.3, pointerEvents: 'none', userSelect: 'none' }}>
        {children}
      </div>

      {/* Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          textAlign: 'center',
          background: 'rgba(15,17,23,0.80)',
          backdropFilter: 'blur(2px)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{ maxWidth: 280 }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', margin: '0 0 6px' }}>
            Premium Feature
          </p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', margin: '0 0 16px', lineHeight: 1.5 }}>
            {feature} is available on the Premium plan.
          </p>
          <Link
            to="/profile"
            className="btn-primary"
            style={{ display: 'inline-block', padding: '7px 20px', textDecoration: 'none', fontSize: '0.8125rem' }}
          >
            Upgrade to Premium
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
