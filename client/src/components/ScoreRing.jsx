import { useEffect, useRef, useState } from 'react';

/** Clean circular score ring — no glow filter, subtle animation */
export default function ScoreRing({ score = 0, label = '', size = 100, color = null }) {
  const [displayScore, setDisplayScore] = useState(0);
  const animRef = useRef(null);

  const r    = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const fill = circ - (displayScore / 100) * circ;

  const ringColor = color || (
    score >= 75 ? 'var(--success)' :
    score >= 55 ? 'var(--accent)' :
    score >= 35 ? 'var(--warning)' : 'var(--danger)'
  );

  const textColor = color || (
    score >= 75 ? '#22c55e' :
    score >= 55 ? '#3b82f6' :
    score >= 35 ? '#f59e0b' : '#ef4444'
  );

  // Animate score number
  useEffect(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const start = Date.now();
    const duration = 1000;
    const step = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * score));
      if (progress < 1) animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [score]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle
            cx={size / 2} cy={size / 2} r={r}
            stroke="var(--surface2)" strokeWidth="7" fill="none"
          />
          {/* Fill */}
          <circle
            cx={size / 2} cy={size / 2} r={r}
            stroke={ringColor} strokeWidth="7" fill="none"
            strokeDasharray={circ}
            strokeDashoffset={fill}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.05s linear' }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: size * 0.22, fontWeight: 700, color: textColor, letterSpacing: '-0.03em', lineHeight: 1 }}>
            {displayScore}
          </span>
          <span style={{ fontSize: size * 0.1, color: 'var(--muted)', fontWeight: 400 }}>/100</span>
        </div>
      </div>
      {label && (
        <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 500, textAlign: 'center' }}>
          {label}
        </span>
      )}
    </div>
  );
}