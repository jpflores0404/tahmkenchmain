import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '../context/GameContext';

export default function GameFeedbackOverlay() {
  const { state } = useGame();
  const feedback = state.aiInvestigationResult || state.corruptionWheelResult || state.investigationResult || state.autoCleanResult || state.lastBuildResult;

  if (!feedback || state.phase === 'gameover' || state.phase === 'corruption_wheel') return null;

  const isBad = state.aiInvestigationResult || (state.corruptionWheelResult && !state.corruptionWheelResult.success);
  const isGood = state.autoCleanResult || state.investigationResult?.corrupted || state.corruptionWheelResult?.success || state.lastBuildResult;
  const title = state.aiInvestigationResult
    ? 'AI USED INVESTIGATION'
    : state.investigationResult
    ? state.investigationResult.corrupted ? 'OPPONENT IS CORRUPTED' : 'OPPONENT IS CLEAN'
    : state.autoCleanResult
      ? 'ACCOUNTABILITY COMPLETE'
      : state.corruptionWheelResult
        ? state.corruptionWheelResult.success ? 'BUILD SUCCEEDED' : 'BUILD FAILED'
        : 'PROJECT UPDATE';

  return (
    <div className="gov-event-wrap pointer-events-none">
      <AnimatePresence>
        <motion.div
          key={title + feedback.effects}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          className={`gov-event ${isBad ? 'gov-event--scandal gov-shake' : isGood ? 'gov-event--integrity' : 'gov-event--pass'}`}
        >
          <div className="gov-event-kicker gov-heading">{title}</div>
          <div className="gov-event-body">{feedback.effects}</div>
          {!isBad && <div className="gov-sparkles" aria-hidden />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
