import { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';

export default function CorruptionWheelModal() {
  const { state, resolveCorruptionWheel } = useGame();
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (state.phase !== 'corruption_wheel') {
      setRotation(0);
      return undefined;
    }
    
    let timer1;
    let timer2;
    if (state.precalcWheelAngle) {
      // Trigger a reflow/delay to ensure the CSS transition fires from 0
      timer1 = setTimeout(() => {
        setRotation(state.precalcWheelAngle);
      }, 50);
      // Wait for 4s spin + 0.5s pause
      timer2 = setTimeout(() => {
        resolveCorruptionWheel();
      }, 4500);
    }
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [state.phase, state.precalcWheelAngle, resolveCorruptionWheel]);

  if (state.phase !== 'corruption_wheel' || !state.pendingBuild) return null;

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="gov-modal gov-modal--dilemma max-w-lg">
        <div className="gov-modal-scan" />
        <div className="text-center">
          <div className="gov-modal-top gov-heading">CORRUPTION RISK</div>
          <h2 className="gov-modal-title gov-heading">PROCUREMENT WHEEL</h2>
          <p className="gov-modal-sub">
            You are Corrupted. This build must pass a risk check before it can resolve.
          </p>
        </div>

        <div className="my-6 flex justify-center">
          <div className="relative w-[230px] h-[230px]">
            <div 
              className="corruption-wheel" 
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: 'transform 4s cubic-bezier(0.1, 0.8, 0.1, 1)'
              }}
              aria-label="70 percent fail, 30 percent success"
            >
              <div className="corruption-wheel-label corruption-wheel-label--fail">70% FAIL</div>
              <div className="corruption-wheel-label corruption-wheel-label--success">30% SUCCEED</div>
            </div>
            <div className="corruption-wheel-pointer" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="rounded-lg border border-red-500/40 bg-red-950/40 p-3">
            <div className="gov-heading text-red-200 text-sm">BUILD FAILS</div>
            <p className="text-[11px] text-red-100/70 mt-1">Budget spent, no card completed, no DP.</p>
          </div>
          <div className="rounded-lg border border-emerald-500/40 bg-emerald-950/40 p-3">
            <div className="gov-heading text-emerald-200 text-sm">BUILD SUCCEEDS</div>
            <p className="text-[11px] text-emerald-100/70 mt-1">Selected build method resolves normally.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
