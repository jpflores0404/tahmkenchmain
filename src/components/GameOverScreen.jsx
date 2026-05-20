import { useGame } from '../context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function GameOverScreen() {
  const { state, restart } = useGame();

  const isVictory = state.gameResult === 'victory' || state.gameResult === 'victory_termlimit';
  const isLoss = state.gameResult && !isVictory;

  const messages = {
    victory: { title: 'VICTORY', subtitle: `You reached ${state.dpWinThreshold || 5} Development Points!`, color: 'from-emerald-400 to-emerald-700', textGlow: 'rgba(52,211,153,0.8)' },
    victory_termlimit: { title: 'VICTORY', subtitle: `TERM ENDED: You won with ${state.developmentPoints} DP vs AI's ${state.aiDP} DP.`, color: 'from-blue-400 to-blue-700', textGlow: 'rgba(96,165,250,0.8)' },
    defeat_impeachment: { title: 'DEFEAT', subtitle: 'IMPEACHED: Your Public Trust hit zero.', color: 'from-red-500 to-red-900', textGlow: 'rgba(239,68,68,0.8)' },
    defeat_termlimit: { title: 'DEFEAT', subtitle: `TERM ENDED: AI had ${state.aiDP} DP vs your ${state.developmentPoints} DP.`, color: 'from-orange-500 to-orange-900', textGlow: 'rgba(249,115,22,0.8)' },
  };

  const msg = messages[state.gameResult] || messages.defeat_impeachment;

  return (
    <AnimatePresence>
      {state.phase === 'gameover' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 pointer-events-auto backdrop-blur-md"
        >
          {/* Slashed Background bar */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`absolute w-full h-48 bg-gradient-to-r ${msg.color} opacity-20 -skew-y-3`}
          />
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
            className={`absolute w-full h-32 bg-gradient-to-r ${msg.color} opacity-40 -skew-y-3 blend-screen`}
          />

          <div className="relative z-10 flex flex-col items-center justify-center w-full">
            <motion.h1
              initial={{ scale: 3, opacity: 0, y: -50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20, duration: 0.6 }}
              className="text-7xl sm:text-[150px] font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 uppercase tracking-widest leading-none drop-shadow-2xl"
              style={{ 
                fontFamily: "'Pixelify Sans', monospace",
                WebkitTextStroke: `4px ${msg.textGlow}`,
                textShadow: `0 0 80px ${msg.textGlow}`
              }}
            >
              {msg.title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-xl sm:text-3xl text-white font-bold my-8 uppercase tracking-widest text-center px-4 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] focus:outline-none"
              style={{ fontFamily: "'Pixelify Sans', monospace" }}
            >
              {msg.subtitle}
            </motion.p>
            
            {/* Stats row */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex gap-8 mb-12 bg-black/50 p-6 border-y-2 border-slate-700/50 w-full justify-center"
            >
              <div className="flex flex-col items-center">
                <span className="text-sm text-slate-400 tracking-widest uppercase">Trust</span>
                <span className="text-4xl text-white font-black">{state.publicTrust}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-sm text-slate-400 tracking-widest uppercase">DP</span>
                <span className="text-4xl text-emerald-400 font-black">{state.developmentPoints}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-sm text-slate-400 tracking-widest uppercase">Turns</span>
                <span className="text-4xl text-cyan-400 font-black">{state.turnNumber}</span>
              </div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 }}
              onClick={restart}
              className="px-12 py-4 bg-slate-100 text-slate-900 font-black text-2xl uppercase tracking-widest rounded transition-all hover:scale-110 hover:bg-white hover:shadow-[0_0_30px_rgba(255,255,255,0.8)]"
              style={{ fontFamily: "'Pixelify Sans', monospace" }}
            >
              Return
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
