import { motion } from 'framer-motion';

/**
 * GlowButton — wraps any button/link child with Framer Motion
 * whileHover + whileTap animations and a CSS glow ring effect.
 *
 * Props:
 *   as        — element type to render: 'button' | 'div' (default: 'div')
 *   className — outer wrapper classes
 *   glow      — enable glow ring (default: true)
 *   scaleHover — hover scale (default: 1.04)
 *   scaleTap   — tap scale (default: 0.97)
 */
export default function GlowButton({
  children,
  as = 'div',
  className = '',
  glow = true,
  scaleHover = 1.04,
  scaleTap = 0.97,
  style = {},
  onClick,
}) {
  return (
    <motion.div
      className={`glow-btn ${className}`}
      style={{ display: 'inline-block', ...style }}
      whileHover={{ scale: scaleHover }}
      whileTap={{ scale: scaleTap }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
