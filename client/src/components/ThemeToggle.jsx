import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function ThemeToggle() {
  const { theme, setTheme, currentTheme, THEMES } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // close when clicking outside
  useEffect(() => {
    const fn = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all btn-outline"
        title="Change theme"
      >
        <span>{currentTheme.emoji}</span>
        <svg className="w-3 h-3 t-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-44 rounded-2xl shadow-2xl overflow-hidden z-50"
            style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
          >
            <div className="p-2">
              <p className="text-xs px-2 py-1.5 t-muted font-medium">Pick Theme</p>
              {THEMES.map(t => (
                <button
                  key={t.id}
                  onClick={() => { setTheme(t.id); setOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all text-left"
                  style={{
                    background: theme === t.id ? 'rgba(128,128,128,0.15)' : 'transparent',
                    color: 'var(--text)',
                  }}
                >
                  <span className="text-base">{t.emoji}</span>
                  <span className="text-sm">{t.label}</span>
                  {theme === t.id && (
                    <span className="ml-auto text-xs" style={{ color: 'var(--accent)' }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}