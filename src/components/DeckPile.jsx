import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import CardComponent from './CardComponent';

export default function DeckPile({ isAI = false }) {
  const { state } = useGame();
  
  const deck = isAI ? state.aiDeck : state.deck;
  const deckCount = deck.length;

  return (
    <div className="relative w-[62px] sm:w-[82px] flex items-center justify-center" style={{ aspectRatio: '330 / 539' }}>
      {deck.map((card, idx) => {
        // Fix deck moving bug: base offset on distance from the BOTTOM of the deck
        // so remaining cards don't change their physical offset when the top card is drawn.
        const reversedIdx = deckCount - 1 - idx;
        const offsetY = reversedIdx * 1.5;
        const offsetX = reversedIdx * 0.5;
        
        return (
          <motion.div
            key={card.id}
            layoutId={card.id}
            className="absolute"
            style={{
              width: '100%',
              height: '100%',
              bottom: `${offsetY}px`,
              left: `${offsetX}px`,
              zIndex: deckCount - idx,
            }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <motion.div
              style={{ transformStyle: 'preserve-3d', width: '100%', height: '100%' }}
            >
              <CardComponent card={card} inDeck={true} />
            </motion.div>
          </motion.div>
        );
      })}
      
      {deckCount > 0 && !isAI && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 min-w-[max-content] gov-deck-tag z-50 whitespace-nowrap">
          DECK • {deckCount}
        </div>
      )}
      
      {deckCount === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gov-deck-empty text-xs font-black">
          <span>NO CARDS</span>
        </div>
      )}
    </div>
  );
}
