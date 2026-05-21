import { useEffect, useRef, useState } from 'react';
import { useGame } from '../context/GameContext';
import CardComponent from './CardComponent';

const DROP_SOUND_SRC = '/sfx/card-drop.mp3';
const DROP_SOUND_DURATION = 1000;

export default function AgendaBoard({ isAI = false, onSelectCard }) {
  const { state, dragToSlot, upgradeInfrastructure, playSupport, completeProject, sfxVolume } = useGame();

  const [dragOverSlot, setDragOverSlot] = useState(null);
  const dropAudioRef = useRef(null);
  const dropStopRef = useRef(null);

  const slots = isAI ? state.aiSlots : state.agendaSlots;

  useEffect(() => {
    return () => {
      if (dropStopRef.current) clearTimeout(dropStopRef.current);
      if (dropAudioRef.current) {
        dropAudioRef.current.pause();
        dropAudioRef.current.currentTime = 0;
      }
    };
  }, []);

  const playDropSound = () => {
    if (sfxVolume <= 0) return;

    if (dropStopRef.current) clearTimeout(dropStopRef.current);
    if (dropAudioRef.current) {
      dropAudioRef.current.pause();
      dropAudioRef.current.currentTime = 0;
    }

    const audio = new Audio(DROP_SOUND_SRC);
    audio.volume = Math.min(1, Math.max(0, sfxVolume));
    dropAudioRef.current = audio;
    audio.play().catch(() => {});

    dropStopRef.current = setTimeout(() => {
      audio.pause();
      audio.currentTime = 0;
      if (dropAudioRef.current === audio) {
        dropAudioRef.current = null;
      }
    }, DROP_SOUND_DURATION);
  };

  const handleDragOver = (e, idx) => {
    if (isAI) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSlot(idx);
  };

  const handleDragLeave = () => setDragOverSlot(null);

  const handleDrop = (e, idx) => {
    if (isAI) return;
    e.preventDefault();
    setDragOverSlot(null);
    try {
      const cardStr = e.dataTransfer.getData('cardData') || e.dataTransfer.getData('text/plain');
      if (!cardStr) {
        console.warn('Drop failed: No cardData or text/plain found in dataTransfer');
        return;
      }
      const cardData = JSON.parse(cardStr);
      
      if (cardData.type === 'infrastructure') {
        dragToSlot(cardData, idx);
        playDropSound();
      } else if (cardData.type === 'support') {
        playSupport(cardData);
        playDropSound();
      }
    } catch (err) {
      console.error('Drop error:', err);
    }
  };

  const handleCardClick = (idx, card) => {
    if (isAI) return;
    
    if (card.status === 'building') {
      return;
    }

    if (card.status === 'built') {
      upgradeInfrastructure(idx);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5">
        {slots.map((card, idx) => (
          <div
            key={idx}
            className={[
              'arena-slot',
              'w-[100px] sm:w-[120px]',
              card ? 'arena-slot--occupied' : 'arena-slot--empty',
              dragOverSlot === idx ? 'slot-highlight scale-[1.03]' : '',
              !isAI && state.draggingCard?.type === 'support' ? 'slot-highlight-support' : '',
              !card && !isAI ? 'arena-slot--droppable' : '',
            ].join(' ')}
            style={{ aspectRatio: '330 / 539' }}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, idx)}
            onMouseEnter={() => {
              if (card) onSelectCard && onSelectCard(card);
            }}
            onMouseLeave={() => {
              onSelectCard && onSelectCard(null);
            }}
          >
            {card ? (
              <div className="relative w-full h-full">
                <CardComponent
                  card={card}
                  onBoard={true}
                  onClick={!isAI ? () => handleCardClick(idx, card) : undefined}
                />
                {!isAI && card.status === 'built' && card.upgraded && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      completeProject(idx, false);
                    }}
                    className="absolute -top-3 left-1/2 -translate-x-1/2 gov-btn z-50 whitespace-nowrap bg-emerald-700 hover:bg-emerald-600 border-emerald-900 text-white shadow-lg animate-bounce"
                    style={{ fontSize: '10px', padding: '6px 12px', pointerEvents: 'auto' }}
                  >
                    COMPLETE PROJECT
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center">
                <span className="text-2xl text-slate-700 font-bold">{idx + 1}</span>
                {!isAI && (
                  <p className="text-[8px] text-slate-600 mt-1">DROP HERE</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
