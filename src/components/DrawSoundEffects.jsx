import { useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';

const DRAW_SOUND_SRC = '/sfx/card-draw.mp3';
const DRAW_SOUND_SPACING = 240;
const DRAW_SOUND_TAIL = 160;
const SINGLE_DRAW_DURATION = 1000;

export default function DrawSoundEffects() {
  const { state, sfxVolume } = useGame();
  const previousPlayerCountRef = useRef(state.hand.length);
  const previousAiCountRef = useRef(state.aiHand.length);
  const timeoutsRef = useRef([]);
  const activeAudiosRef = useRef([]);

  const stopActiveDrawSounds = () => {
    activeAudiosRef.current.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
    activeAudiosRef.current = [];
  };

  const clearScheduledSounds = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  useEffect(() => {
    return () => {
      clearScheduledSounds();
      stopActiveDrawSounds();
    };
  }, []);

  useEffect(() => {
    const playerIncrease = Math.max(0, state.hand.length - previousPlayerCountRef.current);
    const aiIncrease = Math.max(0, state.aiHand.length - previousAiCountRef.current);
    const drawCount = Math.max(playerIncrease, aiIncrease);

    previousPlayerCountRef.current = state.hand.length;
    previousAiCountRef.current = state.aiHand.length;

    if (drawCount === 0 || sfxVolume <= 0) return;

    clearScheduledSounds();
    stopActiveDrawSounds();

    for (let index = 0; index < drawCount; index += 1) {
      const timeout = setTimeout(() => {
        const audio = new Audio(DRAW_SOUND_SRC);
        audio.volume = Math.min(1, Math.max(0, sfxVolume));
        activeAudiosRef.current.push(audio);
        audio.play().catch(() => {});
      }, index * DRAW_SOUND_SPACING);

      timeoutsRef.current.push(timeout);
    }

    const stopDelay = drawCount === 1
      ? SINGLE_DRAW_DURATION
      : ((drawCount - 1) * DRAW_SOUND_SPACING) + DRAW_SOUND_TAIL;

    const stopTimeout = setTimeout(() => {
      stopActiveDrawSounds();
      clearScheduledSounds();
    }, stopDelay);

    timeoutsRef.current.push(stopTimeout);
  }, [state.hand.length, state.aiHand.length, sfxVolume]);

  return null;
}
