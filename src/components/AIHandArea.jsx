import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '../context/GameContext';

export default function AIHandArea() {
  const { state } = useGame();
  const cards = state.aiHand || [];

  if (cards.length === 0) return null;

  return (
    <div className="opponent-hand" aria-label={`${cards.length} hidden opponent cards`}>
      <AnimatePresence>
        {cards.map((card, index) => {
          const center = (cards.length - 1) / 2;
          const offset = index - center;
          const fan = Math.max(-5, Math.min(5, offset * 1.45));
          const lift = Math.abs(offset) * 1.1;

          return (
            <motion.div
              key={card.id}
              className="opponent-hand-card"
              initial={{ opacity: 0, x: -300, y: 110, scale: 0.45, rotate: -14 }}
              animate={{ opacity: 1, x: offset * 48, y: lift, scale: 1, rotate: fan }}
              exit={{ opacity: 0, y: -40, scale: 0.72 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24, delay: Math.min(index * 0.035, 0.22) }}
              style={{ zIndex: index }}
              title="Hidden opponent card"
            >
              <div className="opponent-hand-card-inner" />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
