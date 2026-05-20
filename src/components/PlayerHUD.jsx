import { useEffect, useRef, useState } from 'react';
import { useGame } from '../context/GameContext';
import { TRUST_MAX } from '../constants/game';

// Spinning coin using sprite frames
const COIN_FRAMES = Array.from({ length: 10 }, (_, i) => `/coin/coin${i + 1}.png`);

export function SpinningCoin({ size = 32 }) {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setFrame(f => (f + 1) % COIN_FRAMES.length), 80);
    return () => clearInterval(timer);
  }, []);
  return (
    <img
      src={COIN_FRAMES[frame]}
      alt="budget coin"
      width={size}
      height={size}
      style={{ imageRendering: 'pixelated' }}
    />
  );
}

// Animated number component — counts up/down
export function AnimatedNumber({ value, color = 'text-amber-900', size = 'text-xl' }) {
  const [display, setDisplay] = useState(value);
  const [flash, setFlash] = useState(false);
  const prevRef = useRef(value);

  useEffect(() => {
    if (prevRef.current !== value) {
      setFlash(true);
      const diff = value - prevRef.current;
      const steps = Math.min(Math.abs(diff), 10);
      const stepTime = 300 / steps;
      let current = prevRef.current;
      const interval = setInterval(() => {
        current += diff > 0 ? 1 : -1;
        setDisplay(current);
        if (current === value) {
          clearInterval(interval);
          setTimeout(() => setFlash(false), 400);
        }
      }, stepTime);
      prevRef.current = value;
      return () => clearInterval(interval);
    }
  }, [value]);

  return (
    <span
      className={`${size} font-black font-mono tabular-nums transition-all duration-200 ${color} ${
        flash ? 'hud-number-flash scale-110' : ''
      }`}
      style={{
        textShadow: flash ? `0 0 10px rgba(120,80,20,0.5)` : 'none',
      }}
    >
      {display}
    </span>
  );
}


export function TrustSeals({ current, max = TRUST_MAX }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: max }).map((_, i) => {
        const ok = i < current;
        return (
          <div
            key={i}
            className={[
              'gov-seal',
              ok ? 'gov-seal--ok' : 'gov-seal--broken',
            ].join(' ')}
            title={`Trust ${current}/${max}`}
            aria-hidden
          >
            <svg viewBox="0 0 24 24" className="gov-seal-svg">
              <path
                d="M12 2.5l2.1 2.5 3.2-.5.6 3.2 2.9 1.5-1.5 2.9 1.5 2.9-2.9 1.5-.6 3.2-3.2-.5L12 21.5 9.9 19l-3.2.5-.6-3.2-2.9-1.5 1.5-2.9-1.5-2.9 2.9-1.5.6-3.2 3.2.5L12 2.5z"
                fill="currentColor"
                opacity="0.95"
              />
              <path
                d="M12 7l1.2 2.7 2.9.2-2.2 1.9.7 2.8-2.6-1.5-2.6 1.5.7-2.8-2.2-1.9 2.9-.2L12 7z"
                fill="#f5f0e8"
                opacity="0.9"
              />
            </svg>
            {!ok && <span className="gov-seal-crack" />}
          </div>
        );
      })}
    </div>
  );
}

export default function PlayerHUD() {
  const { state } = useGame();

  const trust = state.publicTrust;
  const status = state.isCorrupted ? 'Corrupted' : 'Clean';

  return (
    <div className="gov-hud gov-corruption-hover" style={{ fontFamily: "var(--font-body)" }}>
      <div className="gov-hud-glass">
        <div className="gov-hud-scan" />
        <div className="gov-hud-grid">
          {/* BUDGET */}
          <div className="gov-hud-cell">
            <div className="gov-hud-kicker-lg gov-heading">BUDGET</div>
            <div className="flex items-center gap-2">
              <SpinningCoin size={36} />
              <div className="flex items-baseline gap-0.5">
                <AnimatedNumber value={state.budget} color="text-amber-900" size="text-4xl" />
                <span className="text-xl font-bold text-amber-950/60 font-mono select-none">/10</span>
              </div>
            </div>
          </div>

          {/* TRUST */}
          <div className="gov-hud-cell">
            <div className="gov-hud-kicker-lg gov-heading">TRUST</div>
            <div className="flex flex-col gap-2">
              <TrustSeals current={trust} />
              <div className="gov-hud-mini-lg">
                <AnimatedNumber value={trust} color="text-emerald-800" size="text-lg" />
                <span className="gov-hud-mini-den-lg">/{TRUST_MAX}</span>
              </div>
            </div>
          </div>

          {/* CORRUPTION */}
          <div className="gov-hud-cell gov-corruption-cell">
            <div className="gov-hud-kicker-lg gov-heading" style={{ color: state.isCorrupted ? '#8b2b2b' : '#166534' }}>STATUS</div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className={`text-3xl ${state.isCorrupted ? 'text-red-600 animate-pulse' : 'text-emerald-700'}`}>
                  {state.isCorrupted ? '!' : '✓'}
                </span>
                <span className={`text-2xl font-black uppercase tracking-widest ${state.isCorrupted ? 'text-red-800' : 'text-emerald-800'}`}>
                  {status}
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-[#8b2b2b]/75 leading-snug">
                {state.isCorrupted ? '-1 Trust and -1 Budget each turn. Future builds face a 70% failure wheel.' : 'No corruption penalty active.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hover tooltip — outside glass to avoid overflow:hidden clipping */}
      <div className="gov-corruption-tooltip">
        <div className="gov-corruption-tooltip-title">Corruption Status</div>
        <p>Cut Corners marks your administration as Corrupted.</p>
        <p>While Corrupted, you lose 1 Trust and 1 Budget every turn.</p>
        <p>Accountability removes the status. Investigation is used to expose a Corrupted opponent.</p>
      </div>
    </div>
  );
}
