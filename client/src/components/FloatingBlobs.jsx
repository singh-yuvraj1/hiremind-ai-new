/**
 * FloatingBlobs — decorative animated background blobs.
 * Purely visual, pointer-events disabled, zero functional impact.
 *
 * Props:
 *   density  — 'low' | 'medium' | 'high'  (default: 'medium')
 *   opacity  — number 0-1                  (default: 0.18)
 */

const BLOB_CONFIGS = [
  { size: 480, top: '5%',  left: '10%',  color: 'var(--accent)',  duration: 18, delay: 0 },
  { size: 360, top: '60%', left: '75%',  color: 'var(--accent2)', duration: 22, delay: 3 },
  { size: 300, top: '40%', left: '50%',  color: 'var(--accent3)', duration: 26, delay: 6 },
  { size: 220, top: '80%', left: '20%',  color: 'var(--accent)',  duration: 20, delay: 2 },
  { size: 160, top: '15%', left: '80%',  color: 'var(--accent2)', duration: 15, delay: 9 },
];

const densityMap = { low: 2, medium: 3, high: 5 };

export default function FloatingBlobs({ density = 'medium', opacity = 0.18 }) {
  const count = densityMap[density] ?? 3;
  const blobs = BLOB_CONFIGS.slice(0, count);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {blobs.map((b, i) => (
        <div
          key={i}
          className="floating-blob"
          style={{
            width:  b.size,
            height: b.size,
            top:    b.top,
            left:   b.left,
            background: b.color,
            opacity,
            animation: `blob-drift ${b.duration}s ease-in-out ${b.delay}s infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}
