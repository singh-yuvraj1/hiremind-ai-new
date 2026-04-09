import { motion } from 'framer-motion';

// animated AI character for the interview page
// gender changes icon + name
export default function AICharacter({ gender = 'male', isSpeaking = false, question = '' }) {
  const name  = gender === 'female' ? 'Aria' : 'Alex';
  const emoji = gender === 'female' ? '👩‍💼' : '👨‍💼';
  const color = gender === 'female' ? '#a855f7' : 'var(--accent)';

  return (
    <div className="flex flex-col items-center gap-4">
      {/* avatar circle */}
      <div className="relative">
        <motion.div
          className="w-24 h-24 rounded-full flex items-center justify-center text-5xl"
          style={{
            background: `linear-gradient(135deg, ${color}20, ${color}40)`,
            border: `2px solid ${color}60`,
            boxShadow: isSpeaking ? `0 0 30px ${color}50` : 'none',
          }}
          animate={isSpeaking ? { scale: [1, 1.05, 1] } : { scale: 1 }}
          transition={isSpeaking ? { duration: 0.8, repeat: Infinity } : {}}
        >
          {emoji}
        </motion.div>

        {/* speaking ring */}
        {isSpeaking && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full border-2"
              style={{ borderColor: color }}
              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border"
              style={{ borderColor: color }}
              animate={{ scale: [1, 1.7, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
            />
          </>
        )}

        {/* live dot */}
        <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 flex items-center justify-center"
          style={{ background: 'var(--bg)', borderColor: 'var(--bg)' }}>
          <div className={`w-2.5 h-2.5 rounded-full ${isSpeaking ? 'animate-pulse' : ''}`}
            style={{ background: isSpeaking ? '#22c55e' : 'var(--muted)' }} />
        </div>
      </div>

      {/* name + status */}
      <div className="text-center">
        <p className="font-display font-semibold t-text">{name}</p>
        <p className="text-xs t-muted mt-0.5">
          {isSpeaking ? '🔊 Speaking...' : '⏳ Waiting for your answer'}
        </p>
      </div>

      {/* speaking bars animation */}
      {isSpeaking && (
        <div className="flex items-end gap-1 h-8">
          {[0.3, 0.6, 1, 0.7, 0.4, 0.8, 0.5].map((h, i) => (
            <motion.div
              key={i}
              className="w-1.5 rounded-full"
              style={{ background: color }}
              animate={{ height: [`${h * 20}px`, `${h * 32}px`, `${h * 20}px`] }}
              transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.08 }}
            />
          ))}
        </div>
      )}
    </div>
  );
}