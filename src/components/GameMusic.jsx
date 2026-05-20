import { useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';

export default function GameMusic() {
  const { state } = useGame();
  const audioRef = useRef(null);
  const hasStartedRef = useRef(false);

  // Start music on first user interaction
  useEffect(() => {
    const startMusic = () => {
      if (audioRef.current && !hasStartedRef.current) {
        audioRef.current.play()
          .then(() => {
            hasStartedRef.current = true;
            removeListeners();
          })
          .catch(() => {});
      }
    };

    const removeListeners = () => {
      window.removeEventListener('click', startMusic);
      window.removeEventListener('keydown', startMusic);
      window.removeEventListener('mousedown', startMusic);
    };

    window.addEventListener('click', startMusic);
    window.addEventListener('keydown', startMusic);
    window.addEventListener('mousedown', startMusic);

    // Try auto-play immediately
    startMusic();

    return () => removeListeners();
  }, []);

  // Stop music when game is over
  useEffect(() => {
    if (state.phase === 'gameover' && audioRef.current) {
      audioRef.current.pause();
    }
  }, [state.phase]);

  return (
    <audio
      ref={audioRef}
      src="/Border_Negotiations.mp3"
      loop
      preload="auto"
    />
  );
}
