import { useGame } from '../context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function ToastManager() {
  const { toast } = useGame();

  return (
    <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] pointer-events-none flex flex-col items-center justify-center">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(4px)" }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`
              px-6 py-3 rounded border-2 shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-md
              ${toast.type === 'error' ? 'bg-red-900/80 border-red-500 text-red-100' : ''}
              ${toast.type === 'success' ? 'bg-emerald-900/80 border-emerald-500 text-emerald-100' : ''}
              ${toast.type === 'info' ? 'bg-cyan-900/80 border-cyan-500 text-cyan-100' : ''}
            `}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">
                {toast.type === 'error' && '⚠️'}
                {toast.type === 'success' && '🌟'}
                {toast.type === 'info' && '💎'}
              </span>
              <span 
                className="text-lg font-black tracking-widest uppercase"
                style={{ fontFamily: "'Pixelify Sans', monospace", textShadow: '1px 1px 0 #000' }}
              >
                {toast.msg}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
