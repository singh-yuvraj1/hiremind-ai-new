/**
 * PremiumLock.jsx — HireMind AI
 *
 * Wraps any content that requires a Premium subscription.
 * If isPremium is false, shows a blurred overlay with an upgrade prompt.
 *
 * Usage:
 *   <PremiumLock isPremium={user?.isPremium}>
 *     <DetailedAnalytics />
 *   </PremiumLock>
 *
 * IMPORTANT: this is UI-only — real gate is on the backend.
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function PremiumLock({ isPremium, children, feature = 'This feature' }) {
  if (isPremium) return children;

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Actual content — blurred */}
      <div className="pointer-events-none select-none" style={{ filter: 'blur(6px)', opacity: 0.35 }}>
        {children}
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
        style={{ background: 'rgba(10,18,40,0.72)', backdropFilter: 'blur(2px)' }}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38 }}
          className="max-w-xs">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3"
            style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.15), rgba(124,58,237,0.20))', border: '1px solid rgba(0,229,255,0.25)' }}>
            🔒
          </div>
          <p className="font-display font-semibold t-text text-sm mb-1">Premium Feature</p>
          <p className="text-xs t-muted mb-4">
            {feature} is available on the Premium plan. Upgrade to unlock full access.
          </p>
          <Link to="/profile"
            className="inline-block px-5 py-2 text-xs font-bold rounded-xl text-white"
            style={{
              background: 'linear-gradient(135deg, #00e5ff, #2979ff)',
              boxShadow: '0 0 18px rgba(0,229,255,0.30)',
            }}>
            Upgrade to Premium →
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
