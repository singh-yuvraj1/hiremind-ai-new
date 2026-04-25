import { useRef, useCallback } from 'react';

/**
 * TiltCard — wraps children with a CSS perspective 3D tilt effect on mouse move.
 * On touch devices the effect is skipped automatically.
 *
 * Props:
 *   className   — extra classes for the outer wrapper
 *   intensity   — tilt depth in degrees (default: 10)
 *   scale       — scale on hover (default: 1.02)
 *   glare       — show shine glare overlay (default: true)
 *   children    — anything
 */
export default function TiltCard({
  children,
  className = '',
  intensity = 10,
  scale = 1.02,
  glare = true,
  style = {},
}) {
  const wrapRef  = useRef(null);
  const glareRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const el = wrapRef.current;
    if (!el) return;

    const { left, top, width, height } = el.getBoundingClientRect();
    const x = (e.clientX - left) / width  - 0.5; // -0.5 → 0.5
    const y = (e.clientY - top)  / height - 0.5;

    const rotY =  x * intensity * 2;
    const rotX = -y * intensity * 2;

    el.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scale})`;

    if (glare && glareRef.current) {
      // glare moves opposite to tilt
      const gx = (x + 0.5) * 100;
      const gy = (y + 0.5) * 100;
      glareRef.current.style.background =
        `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.10) 0%, transparent 65%)`;
    }
  }, [intensity, scale, glare]);

  const handleMouseLeave = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    el.style.transform = `perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)`;
    if (glare && glareRef.current) {
      glareRef.current.style.background = 'transparent';
    }
  }, [glare]);

  return (
    <div
      ref={wrapRef}
      className={`tilt-inner ${className}`}
      style={{ transformStyle: 'preserve-3d', ...style }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {glare && (
        <div
          ref={glareRef}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            pointerEvents: 'none',
            transition: 'background 0.1s',
          }}
        />
      )}
    </div>
  );
}
