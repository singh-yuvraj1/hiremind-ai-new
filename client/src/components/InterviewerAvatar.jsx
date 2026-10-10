import { motion } from 'framer-motion';

/**
 * InterviewerAvatar
 * Renders an AI Interviewer's emoji avatar with custom accent glows and speaking effects.
 *
 * @param {Object} interviewer - { name, emoji, avatar, color }
 * @param {string|number} [size='md'] - 'sm' (36px), 'md' (56px), 'lg' (72px), 'xl' (96px)
 * @param {boolean} [isSpeaking=false] - When true, triggers subtle pulsing animation
 * @param {string} [className=''] - Custom classes
 */
export default function InterviewerAvatar({
  interviewer,
  size = 'md',
  isSpeaking = false,
  className = '',
}) {
  const sizeMap = {
    sm: { dim: 36, emoji: '1.25rem', border: 2 },
    md: { dim: 56, emoji: '1.85rem', border: 2 },
    lg: { dim: 76, emoji: '2.4rem',  border: 2.5 },
    xl: { dim: 96, emoji: '3.2rem',  border: 3 },
  };

  const currentSize = typeof size === 'number'
    ? { dim: size, emoji: `${size * 0.55}px`, border: 2 }
    : sizeMap[size] || sizeMap.md;

  const color = interviewer?.color || '#00e5ff';
  const emoji = interviewer?.emoji || interviewer?.avatar || '🧑‍💼';
  const name  = interviewer?.name  || 'AI Interviewer';

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Outer subtle glow */}
      <motion.div
        className="rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          width: currentSize.dim,
          height: currentSize.dim,
          minWidth: currentSize.dim,
          minHeight: currentSize.dim,
          background: `linear-gradient(135deg, ${color}18, ${color}08)`,
          border: `${currentSize.border}px solid ${color}`,
          boxShadow: isSpeaking
            ? `0 0 24px ${color}60`
            : `0 0 16px ${color}25`,
        }}
        animate={isSpeaking ? { scale: [1, 1.05, 1] } : { scale: 1 }}
        transition={isSpeaking ? { duration: 0.9, repeat: Infinity, ease: 'easeInOut' } : {}}
      >
        <span
          style={{
            fontSize: currentSize.emoji,
            lineHeight: 1,
            userSelect: 'none',
            display: 'inline-block',
            transform: 'translateY(1px)',
          }}
          role="img"
          aria-label={name}
        >
          {emoji}
        </span>
      </motion.div>

      {/* Speaking wave effect ring */}
      {isSpeaking && (
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ border: `2px solid ${color}` }}
          animate={{ scale: [1, 1.35, 1], opacity: [0.7, 0, 0.7] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
        />
      )}
    </div>
  );
}
