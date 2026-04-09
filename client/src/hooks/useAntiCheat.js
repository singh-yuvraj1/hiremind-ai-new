import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useAntiCheat — full anti-cheat hook for interview/mock test sessions
 *
 * Features:
 *  - Tab/window visibility detection
 *  - Window blur detection (alt-tab, other apps)
 *  - Fullscreen enforcement with prompt
 *  - Copy/paste/cut blocking
 *  - Right-click disable
 *  - Auto-submit after maxWarnings violations
 *
 * @param {boolean} active     - Whether anti-cheat is active (only during interview/test)
 * @param {number}  maxWarnings - Number of warnings before auto-submit (default 3)
 * @param {Function} onAutoSubmit - Callback when max warnings reached
 */
export default function useAntiCheat(active, maxWarnings = 3, onAutoSubmit = null) {
  const [violations,       setViolations]       = useState([]);       // array of event objects
  const [warningCount,     setWarningCount]      = useState(0);
  const [showWarning,      setShowWarning]       = useState(false);
  const [warningType,      setWarningType]       = useState('');       // 'tab'|'fullscreen'|'paste'|'blur'
  const [isFullscreen,     setIsFullscreen]      = useState(false);
  const [showFSPrompt,     setShowFSPrompt]      = useState(false);    // fullscreen prompt
  const [blurSeconds,      setBlurSeconds]       = useState(0);
  const blurTimer          = useRef(null);
  const autoSubmitted      = useRef(false);
  const onAutoSubmitRef    = useRef(onAutoSubmit);

  useEffect(() => { onAutoSubmitRef.current = onAutoSubmit; }, [onAutoSubmit]);

  // ── record violation ─────────────────────────────────────────────────────
  const recordViolation = useCallback((type) => {
    if (!active || autoSubmitted.current) return;

    const event = { type, timestamp: new Date().toISOString() };
    setViolations(prev => [...prev, event]);
    setWarningType(type);
    setShowWarning(true);

    setWarningCount(prev => {
      const next = prev + 1;
      if (next >= maxWarnings && !autoSubmitted.current) {
        autoSubmitted.current = true;
        setTimeout(() => onAutoSubmitRef.current?.(), 2500);
      }
      return next;
    });
  }, [active, maxWarnings]);

  // ── tab / visibility change ───────────────────────────────────────────────
  useEffect(() => {
    if (!active) return;
    const onVisibility = () => {
      if (document.hidden) recordViolation('tab_switch');
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [active, recordViolation]);

  // ── window blur (alt-tab, other apps, dev tools) ─────────────────────────
  useEffect(() => {
    if (!active) return;
    const onBlur = () => {
      blurTimer.current = setInterval(() =>
        setBlurSeconds(s => s + 1), 1000
      );
    };
    const onFocus = () => {
      clearInterval(blurTimer.current);
      setBlurSeconds(0);
    };
    window.addEventListener('blur',  onBlur);
    window.addEventListener('focus', onFocus);
    return () => {
      window.removeEventListener('blur',  onBlur);
      window.removeEventListener('focus', onFocus);
      clearInterval(blurTimer.current);
    };
  }, [active]);

  // ── fullscreen enforcement ────────────────────────────────────────────────
  useEffect(() => {
    if (!active) return;
    const onFSChange = () => {
      const inFS = !!(document.fullscreenElement || document.webkitFullscreenElement);
      setIsFullscreen(inFS);
      if (!inFS) {
        setShowFSPrompt(true);
        recordViolation('fullscreen_exit');
      }
    };
    document.addEventListener('fullscreenchange',       onFSChange);
    document.addEventListener('webkitfullscreenchange', onFSChange);
    return () => {
      document.removeEventListener('fullscreenchange',       onFSChange);
      document.removeEventListener('webkitfullscreenchange', onFSChange);
    };
  }, [active, recordViolation]);

  // ── copy / paste / cut blocking ───────────────────────────────────────────
  useEffect(() => {
    if (!active) return;
    const block = (e) => {
      e.preventDefault();
      const type = e.type === 'paste' ? 'paste_attempt' : 'copy_attempt';
      recordViolation(type);
      return false;
    };
    document.addEventListener('copy',  block);
    document.addEventListener('paste', block);
    document.addEventListener('cut',   block);
    return () => {
      document.removeEventListener('copy',  block);
      document.removeEventListener('paste', block);
      document.removeEventListener('cut',   block);
    };
  }, [active, recordViolation]);

  // ── right-click disable ───────────────────────────────────────────────────
  useEffect(() => {
    if (!active) return;
    const block = (e) => { e.preventDefault(); return false; };
    document.addEventListener('contextmenu', block);
    return () => document.removeEventListener('contextmenu', block);
  }, [active]);

  // ── keyboard shortcuts that open devtools / new tabs ─────────────────────
  useEffect(() => {
    if (!active) return;
    const onKey = (e) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && (e.key === 't' || e.key === 'w' || e.key === 'n' || e.key === 'r')) ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C'))
      ) {
        e.preventDefault();
        return false;
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [active]);

  // ── beforeunload guard ────────────────────────────────────────────────────
  useEffect(() => {
    if (!active) return;
    const onUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'Interview in progress — are you sure you want to leave?';
      return e.returnValue;
    };
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, [active]);

  // ── helpers ───────────────────────────────────────────────────────────────
  const requestFullscreen = useCallback(() => {
    const el = document.documentElement;
    if (el.requestFullscreen)       el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    setShowFSPrompt(false);
  }, []);

  const dismissWarning = useCallback(() => setShowWarning(false), []);
  const dismissFSPrompt = useCallback(() => setShowFSPrompt(false), []);

  return {
    violations,
    warningCount,
    showWarning,
    warningType,
    isFullscreen,
    showFSPrompt,
    blurSeconds,
    requestFullscreen,
    dismissWarning,
    dismissFSPrompt,
    autoSubmitted: autoSubmitted.current,
  };
}
