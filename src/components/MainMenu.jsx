import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';

export default function MainMenu() {
  const { state, startGameMode } = useGame();

  if (state.phase !== 'menu') return null;

  const handleStartGame = (dpThreshold) => {
    startGameMode(dpThreshold);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md font-display"
    >
      <div className="flex flex-col items-center gap-8 max-w-2xl w-full p-8 rounded-xl border-2 border-[#d1a454] bg-[#2a1b12] shadow-[0_0_50px_rgba(209,164,84,0.3)]">
        
        <div className="text-center space-y-2">
          <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#fcebc4] to-[#d1a454] tracking-widest uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            SELECT GAME MODE
          </h1>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-sm mt-4">
          <button
            onClick={() => handleStartGame(5)}
            className="gov-btn flex flex-col items-center justify-center py-4 border-2 border-[#5c9e31] hover:bg-[#5c9e31]/20 transition-colors"
          >
            <span className="text-2xl font-black tracking-widest text-[#fcebc4]">QUICK PLAY</span>
            <span className="text-sm font-bold tracking-widest text-[#5c9e31] mt-1">WIN AT 5 DP</span>
          </button>

          <button
            onClick={() => handleStartGame(10)}
            className="gov-btn flex flex-col items-center justify-center py-4 border-2 border-[#cc4f4f] hover:bg-[#cc4f4f]/20 transition-colors"
          >
            <span className="text-2xl font-black tracking-widest text-[#fcebc4]">NORMAL</span>
            <span className="text-sm font-bold tracking-widest text-[#cc4f4f] mt-1">WIN AT 10 DP</span>
          </button>
        </div>

        <p className="text-xs text-[#a87f4c]/60 max-w-md text-center mt-4 tracking-widest leading-relaxed">
          IN NORMAL MODE, UPGRADE BUILDINGS TO LEVEL 2 AND CLICK "COMPLETE PROJECT" TO FREE UP SLOTS FOR CONTINUED EXPANSION.
        </p>

      </div>
    </motion.div>
  );
}
