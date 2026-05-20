import { useEffect, useState, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function TurnAnnouncer() {
  const { state } = useGame();
  const [announcement, setAnnouncement] = useState(null);
  const lastAnnouncedTurn = useRef(0);

  useEffect(() => {
    if (state.turnStarted && state.phase === 'play' && lastAnnouncedTurn.current !== state.turnNumber) {
      lastAnnouncedTurn.current = state.turnNumber;
      setAnnouncement(`TURN ${state.turnNumber} START!`);
      const timer = setTimeout(() => setAnnouncement(null), 2000);
      return () => {
        clearTimeout(timer);
      };
    } else if (!state.turnStarted) {
      setAnnouncement(null);
    }
  }, [state.turnStarted, state.turnNumber, state.phase]);

  return (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-[110]">
      <AnimatePresence>
        {announcement && (
          <motion.div
            initial={{ scale: 2, opacity: 0, letterSpacing: "-0.5em" }}
            animate={{ scale: 1, opacity: 1, letterSpacing: "0.2em" }}
            exit={{ scale: 1.5, opacity: 0, filter: "blur(10px)" }}
            transition={{ type: "spring", stiffness: 200, damping: 20, duration: 0.6 }}
            className="flex items-center justify-center bg-transparent w-full"
          >
            {/* Warm parchment band behind the text */}
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 120, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute w-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(to right, transparent, rgba(143, 91, 43, 0.55), rgba(74, 48, 24, 0.7), rgba(143, 91, 43, 0.55), transparent)',
                backdropFilter: 'blur(4px)',
                borderTop: '3px solid rgba(143, 91, 43, 0.5)',
                borderBottom: '3px solid rgba(143, 91, 43, 0.5)',
              }}
            />
            
            <h1 
              className="text-6xl sm:text-8xl font-black z-10"
              style={{ 
                fontFamily: "'Pixelify Sans', monospace",
                color: '#faedcd',
                textShadow: '0 0 20px rgba(252, 194, 3, 0.6), 0 4px 0 #8f5b2b, 0 6px 10px rgba(0,0,0,0.5)',
                WebkitTextStroke: '2px #8f5b2b',
              }}
            >
              {announcement}
            </h1>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
