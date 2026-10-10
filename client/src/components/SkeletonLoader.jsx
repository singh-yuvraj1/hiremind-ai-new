/**
 * SkeletonLoader — professional shimmer loading states
 */
export default function SkeletonLoader({ rows = 3, height = 48, gap = 10 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{ height, borderRadius: 6 }}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ height = 160 }) {
  return (
    <div
      className="skeleton"
      style={{ height, borderRadius: 12 }}
    />
  );
}

export function SkeletonText({ lines = 3, className = '' }) {
  const widths = [100, 80, 65];
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{ height: 14, width: `${widths[i % widths.length]}%`, borderRadius: 4 }}
        />
      ))}
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div style={{ padding: '1.25rem', borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="skeleton" style={{ height: 12, width: '50%', borderRadius: 4, marginBottom: 10 }} />
      <div className="skeleton" style={{ height: 30, width: '60%', borderRadius: 6 }} />
    </div>
  );
}
