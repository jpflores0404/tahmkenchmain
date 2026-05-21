import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';

export default function SupportCardLog() {
  const { state } = useGame();
  const { turnSupportLog, aiTurnSupportLog } = state;

  const hasPlayerCards = turnSupportLog.length > 0;
  const hasAiCards = aiTurnSupportLog.length > 0;
  const hasCards = hasPlayerCards || hasAiCards;

  if (!hasCards) return null;

  return (
    <AnimatePresence>
      {hasCards && (
        <motion.div
          className="support-log-panel"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 30 }}
          transition={{ duration: 0.6 }}
        >
          {/* AI Support Cards */}
          <AnimatePresence>
            {hasAiCards && (
              <motion.div
                className="support-log-section support-log-section--ai"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.35 }}
              >
                <div className="support-log-header support-log-header--ai">
                  <span className="support-log-icon">🤖</span>
                  <span>OPPONENT</span>
                </div>
                {aiTurnSupportLog.map((card, i) => (
                  <motion.div
                    key={`ai-${i}`}
                    className="support-log-card support-log-card--ai"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="support-log-card-name">{card.name}</div>
                    <div className="support-log-card-desc">{card.description}</div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Player Support Cards */}
          <AnimatePresence>
            {hasPlayerCards && (
              <motion.div
                className="support-log-section support-log-section--player"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.35 }}
              >
                <div className="support-log-header support-log-header--player">
                  <span className="support-log-icon">👤</span>
                  <span>PLAYER</span>
                </div>
                {turnSupportLog.map((card, i) => (
                  <motion.div
                    key={`player-${i}`}
                    className="support-log-card support-log-card--player"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="support-log-card-name">{card.name}</div>
                    <div className="support-log-card-desc">{card.description}</div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
