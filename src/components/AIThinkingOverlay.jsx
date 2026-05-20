import { useGame } from '../context/GameContext';
import { AnimatePresence, motion } from 'framer-motion';

const AI_THINKING_TEXTS = [
  "The opposition is reviewing their strategy...",
  "The AI governor is consulting advisors...",
  "Planning infrastructure investments...",
  "Evaluating procurement options...",
  "The opposition is making their move...",
  "Reviewing budget allocations...",
];

export default function AIThinkingOverlay() {
  const { state } = useGame();

  if (!state.aiThinking) return null;

  const text = AI_THINKING_TEXTS[Math.floor(Math.random() * AI_THINKING_TEXTS.length)];

  return (
    <AnimatePresence>
      <motion.div
        key="ai-thinking"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="gov-modal"
        >
          <div className="gov-modal-top gov-heading">OPPONENT'S TURN</div>
          <div className="gov-modal-title gov-heading" style={{ fontSize: '18px' }}>
            AI Governor is Thinking...
          </div>
          <div className="gov-modal-sub" style={{ marginTop: '8px' }}>
            {text}
          </div>
          <div className="gov-thinking-dots" aria-hidden>
            {[0, 1, 2, 3, 4].map(i => (
              <span key={i} style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
          {/* Animated pixel character */}
          <div className="flex justify-center mt-4">
            <motion.img
              src="/ai_character.gif"
              alt="AI Thinking"
              className="w-12 h-auto"
              style={{ imageRendering: 'pixelated' }}
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
