import { useEffect, useRef, useState } from 'react';
import { useGame } from '../context/GameContext';
import { AnimatePresence, motion } from 'framer-motion';

export default function OpponentScanOverlay({ onActiveChange }) {
  const { state } = useGame();
  const [active, setActive] = useState(false);
  const prevTurnRef = useRef(state.turnNumber);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const prevTurn = prevTurnRef.current;
    const turnAdvanced = state.turnNumber !== prevTurn;
    prevTurnRef.current = state.turnNumber;

    if (!turnAdvanced) return;
    if (state.phase === 'gameover') return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setActive(true);
    onActiveChange && onActiveChange(true);

    timeoutRef.current = setTimeout(() => {
      setActive(false);
      requestAnimationFrame(() => {
        if (onActiveChange) onActiveChange(false);
      });
    }, 1300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
        setActive(false);
        requestAnimationFrame(() => {
          if (onActiveChange) onActiveChange(false);
        });
      }
    };
  }, [state.turnNumber, state.phase, onActiveChange]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="gov-opponent-scan"
        >
          <div className="gov-opponent-scan-line" />
          <div className="gov-opponent-scan-noise" />
          <div className="gov-opponent-scan-text">
            <div className="gov-heading gov-opponent-scan-title">OPPONENT TURN</div>
            <div className="gov-opponent-scan-sub">Opponent activity is hidden unless a card effect reveals it.</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
