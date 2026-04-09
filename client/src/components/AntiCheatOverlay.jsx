import { motion, AnimatePresence } from 'framer-motion';

/**
 * AntiCheatOverlay
 * Shown when a cheating violation is detected.
 * Displays warning type, count, and auto-submit countdown.
 */
export default function AntiCheatOverlay({
  show,
  warningType,
  warningCount,
  maxWarnings,
  onDismiss,
  autoSubmitting,
}) {
  if (!show && !autoSubmitting) return null;

  const typeLabels = {
    tab_switch:       { icon: '🔁', title: 'Tab Switch Detected!',        msg: 'You switched away from this page during the session.' },
    fullscreen_exit:  { icon: '📺', title: 'Fullscreen Exited!',           msg: 'Please stay in fullscreen during the interview.' },
    paste_attempt:    { icon: '📋', title: 'Paste Attempt Blocked!',       msg: 'Copy-pasting is not allowed during the session.' },
    copy_attempt:     { icon: '🚫', title: 'Copy Attempt Blocked!',        msg: 'Copying content is not allowed during the session.' },
    window_blur:      { icon: '👀', title: 'Focus Lost!',                  msg: 'You moved focus away from the interview window.' },
  };

  const info = typeLabels[warningType] || { icon: '⚠️', title: 'Violation Detected!', msg: 'Suspicious activity detected.' };
  const remaining = maxWarnings - warningCount;

  return (
    <AnimatePresence>
      {(show || autoSubmitting) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(4px)' }}
        >
          <motion.div
            initial={{ scale: 0.85, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.85, y: 30 }}
            className="t-card rounded-2xl p-8 max-w-md mx-4 text-center"
            style={{ border: `2px solid ${autoSubmitting ? '#ef4444' : '#f59e0b'}` }}
          >
            {autoSubmitting ? (
              <>
                <div className="text-6xl mb-4">🛑</div>
                <h2 className="font-bold text-2xl text-red-400 mb-3">Auto-Submitting...</h2>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  You reached the maximum number of violations ({maxWarnings}). Your session is being submitted automatically.
                </p>
                <div className="mt-6">
                  <div className="w-8 h-8 border-2 border-red-400 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              </>
            ) : (
              <>
                <div className="text-5xl mb-4">{info.icon}</div>
                <h2 className="font-bold text-xl mb-2" style={{ color: '#f59e0b' }}>{info.title}</h2>
                <p className="text-sm mb-5 leading-relaxed" style={{ color: 'var(--muted)' }}>
                  {info.msg}
                </p>

                {/* violation meter */}
                <div className="mb-5">
                  <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--muted)' }}>
                    <span>Violations</span>
                    <span className="font-bold" style={{ color: remaining <= 1 ? '#ef4444' : '#f59e0b' }}>
                      {warningCount} / {maxWarnings}
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(239,68,68,0.15)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: remaining <= 1 ? '#ef4444' : '#f59e0b' }}
                      animate={{ width: `${(warningCount / maxWarnings) * 100}%` }}
                    />
                  </div>
                  {remaining <= 1 && (
                    <p className="text-xs text-red-400 mt-1 font-medium">
                      ⚠️ {remaining === 0 ? 'Auto-submitting now!' : 'One more violation = auto-submit!'}
                    </p>
                  )}
                </div>

                <button
                  onClick={onDismiss}
                  className="w-full py-3 rounded-xl font-semibold text-white btn-primary"
                >
                  I Understand — Resume Session
                </button>
                <p className="text-xs mt-3" style={{ color: 'var(--muted)' }}>
                  This violation has been recorded and may affect your score.
                </p>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
