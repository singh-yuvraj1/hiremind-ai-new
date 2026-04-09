// circular score ring with animated fill
export default function ScoreRing({ score = 0, label = '', size = 110, color = null }) {
  const r    = (size - 14) / 2;
  const circ = 2 * Math.PI * r;
  const fill = circ - (score / 100) * circ;

  // auto color based on score
  const ringColor = color || (
    score >= 75 ? '#22c55e' :
    score >= 55 ? '#00e5ff' :
    score >= 35 ? '#fb923c' : '#ef4444'
  );

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* background track */}
          <circle
            cx={size / 2} cy={size / 2} r={r}
            stroke="rgba(128,128,128,0.12)" strokeWidth="7" fill="none"
          />
          {/* filled arc */}
          <circle
            cx={size / 2} cy={size / 2} r={r}
            stroke={ringColor} strokeWidth="7" fill="none"
            strokeDasharray={circ}
            strokeDashoffset={fill}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 1.4s ease',
              filter: `drop-shadow(0 0 6px ${ringColor}70)`,
            }}
          />
        </svg>
        {/* score number in middle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display font-bold" style={{ fontSize: size * 0.22, color: 'var(--text)' }}>
            {score}
          </span>
        </div>
      </div>
      <span className="text-xs t-muted text-center font-medium">{label}</span>
    </div>
  );
}