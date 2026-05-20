import { useState } from 'react';
import { useGame } from '../context/GameContext';
import CardComponent from './CardComponent';
import { motion, AnimatePresence } from 'framer-motion';

export default function HandArea({ onSelectCard, dimmed = false }) {
  const { state, showToast, setDraggingCard, playSupport, dragToSlot } = useGame();
  const [hoveredId, setHoveredId] = useState(null);

  const handleCardClick = (card) => {
    onSelectCard && onSelectCard(card);
    if (state.phase !== 'play' || !state.turnStarted) return;
    
    // User requested that support cards must be DRAGGED, not clicked
    if (card.type === 'support') {
      return showToast('Drag support cards to the board to activate!', 'info');
    }
    
    if (card.type === 'support' && card.cost > 0 && state.budget < card.cost) return showToast('Not enough budget!', 'error');
  };

  const handleDoubleClick = (card) => {
    if (state.phase !== 'play' || !state.turnStarted) return;

    if (card.type === 'support') {
      playSupport(card);
    } else if (card.type === 'infrastructure') {
      const emptySlotIndex = state.agendaSlots.findIndex(slot => slot === null);
      if (emptySlotIndex === -1) {
        showToast('No empty slot available to build on!', 'error');
        return;
      }
      dragToSlot(card, emptySlotIndex);
    }
  };

  return (
    <div className="relative">
       {/* Hand — Master Duel style: flat row, overlap, hover rises */}
      <div className={`hand-tray ${dimmed ? 'hand-tray--dimmed' : ''}`}>
        <AnimatePresence>
           {state.hand.map((card, i) => {
            const total = state.hand.length;
            const isHovered = hoveredId === card.id;

            // Master Duel style: flat row, cards overlap with fixed spacing
            const cardOverlap = 
              total <= 3 ? 130 :
              total <= 5 ? 105 :
              total <= 7 ? 85 :
              70;

            // Center the row
            const totalWidth = (total - 1) * cardOverlap;
            const startX = -totalWidth / 2;

            // Shift other cards away from the hovered card so they don't get blocked
            let shiftX = 0;
            if (hoveredId) {
              const hoveredIdx = state.hand.findIndex(c => c.id === hoveredId);
              if (i < hoveredIdx) shiftX = -55;
              if (i > hoveredIdx) shiftX = 55;
            }

            const x = startX + i * cardOverlap + shiftX;

            // Cards sit at y=110 (half hidden), hovered card rises to y=-20 (fully visible)
            const restY = 110;
            const hoverY = -20;

            return (
            <motion.div 
              key={card.id} 
              // Initial state simulates coming from the player deck (up and to the right)
              initial={{ opacity: 0, x: 500, y: -200, scale: 0.5, rotateZ: 25 }}
              animate={{ 
                opacity: 1, 
                x, 
                y: isHovered ? hoverY : restY,
                scale: isHovered ? 1.15 : 1,
                rotateZ: 0 
              }}
              exit={{ opacity: 0, y: 200, scale: 0.8 }}
              transition={{ 
                type: "spring", 
                stiffness: isHovered ? 400 : 200, 
                damping: isHovered ? 25 : 25,
                delay: state.turnStarted ? 0 : i * 0.08
              }}
              className="hand-card-slot"
              onMouseEnter={() => {
                setHoveredId(card.id);
                onSelectCard && onSelectCard(card);
              }}
              onMouseLeave={() => {
                setHoveredId(null);
                onSelectCard && onSelectCard(null);
              }}
              style={{ 
                zIndex: isHovered ? 100 : 10 + i, 
              }}
            >
              <motion.div
                initial={{ rotateY: 180 }}
                animate={{ rotateY: 0 }}
                transition={{ type: "spring", stiffness: 120, damping: 20, delay: (i * 0.08) + 0.15 }}
                style={{ transformStyle: 'preserve-3d', width: '100%', height: '100%' }}
                className={isHovered ? 'hand-card-hover-glow' : ''}
              >
                <CardComponent
                  card={card}
                  draggable={
                    (card.type === 'infrastructure' || card.type === 'support') && 
                    state.phase === 'play' && 
                    state.turnStarted
                  }
                  onDragStart={() => setDraggingCard(card)}
                  onDragEnd={() => setDraggingCard(null)}
                  onClick={handleCardClick}
                  onDoubleClick={handleDoubleClick}
                />
              </motion.div>
            </motion.div>
          )})}
        </AnimatePresence>
        {state.hand.length === 0 && (
          <p className="text-slate-500 text-xs italic">No cards in hand</p>
        )}
      </div>
    </div>
  );
}
