/**
 * SkeletonLoader — shimmer skeleton placeholders for loading states.
 *
 * Props:
 *   rows    — number of rows to render (default: 3)
 *   height  — height of each row in px (default: 56)
 *   gap     — gap between rows in px (default: 12)
 *   rounded — border radius (default: '0.75rem')
 */
export default function SkeletonLoader({
  rows = 3,
  height = 56,
  gap = 12,
  rounded = '0.75rem',
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{
            height,
            borderRadius: rounded,
            // Stagger the widths slightly so they look natural
            width: i % 3 === 2 ? '75%' : '100%',
          }}
        />
      ))}
    </div>
  );
}

/**
 * SkeletonCard — single-item skeleton card with icon + two lines.
 */
export function SkeletonCard() {
  return (
    <div
      className="t-card rounded-2xl p-5"
      style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}
    >
      <div className="skeleton" style={{ width: 44, height: 44, borderRadius: '0.625rem', flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="skeleton" style={{ height: 16, borderRadius: 6, width: '60%' }} />
        <div className="skeleton" style={{ height: 12, borderRadius: 6, width: '85%' }} />
      </div>
    </div>
  );
}
