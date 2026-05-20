import { useEffect } from 'react';
import { useGame } from '../context/GameContext';

export default function TurnControls() {
  const { state, startTurn, endTurn } = useGame();

  const canStart = state.phase === 'play' && !state.turnStarted && !state.aiThinking;
  const canEnd = state.phase === 'play' && state.turnStarted && !state.aiThinking;

  useEffect(() => {
    if (canStart) {
      startTurn();
    }
  }, [canStart, startTurn]);

  return (
    <div className="flex flex-col items-center gap-2">
      {canEnd && (
        <button
          onClick={endTurn}
          className="gov-btn gov-btn--end"
          style={{ fontSize: '16px', padding: '16px 28px', minWidth: '160px' }}
        >
          End Turn
        </button>
      )}
    </div>
  );
}

