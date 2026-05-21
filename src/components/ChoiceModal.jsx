import { useGame } from '../context/GameContext';

export default function ChoiceModal() {
  const { state, buildHonest, buildCorrupt, buildBayanihan, cancelDilemma, showToast } = useGame();

  if (state.phase !== 'dilemma' || !state.pendingCard) return null;

  const honestCost = state.pendingCard.honestCost || 3;
  const corruptCost = state.pendingCard.corruptCost || 1;

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="gov-modal gov-modal--dilemma">
        <div className="gov-modal-scan" />
          
          {/* Header */}
          <div className="text-center pb-3 border-b border-slate-700/50">
            <div className="gov-modal-top gov-heading">PROCUREMENT DECISION</div>
            <h2 className="gov-modal-title gov-heading">THE DILEMMA</h2>
            <p className="gov-modal-sub">
              How will you build <span className="text-amber-300 font-semibold">{state.pendingCard.name}</span>?
            </p>
            {state.isCorrupted && (
              <p className="mt-2 text-[11px] uppercase tracking-widest text-red-300">
                Corrupted status active: your build must survive the 70% failure wheel.
              </p>
            )}
          </div>

          {/* Card preview */}
          <div className="mt-3 bg-black/35 border border-slate-700/40 rounded-xl p-3 shadow-inner">
            <p className="text-[13px] text-slate-200/80 leading-relaxed text-center" style={{ fontFamily: "var(--font-body)" }}>
              {state.pendingCard.description}
            </p>
          </div>

          {/* Choice buttons */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            {/* Honest Option */}
            <button
              onClick={() => {
                if (state.budget < honestCost) showToast('Not enough budget for Honest Build!', 'error');
                else buildHonest();
              }}
              className={`col-span-1 gov-choice ${state.budget >= honestCost ? 'gov-choice--honest' : 'gov-choice--disabled'}`}
              disabled={state.budget < honestCost}
            >
              <div className="gov-choice-title gov-heading text-[11px]">HONEST BUILD</div>
              <div className="gov-choice-sub text-[9px]">Cost {honestCost} • {state.pendingCard.honestReward || '+1 DP'}</div>
            </button>

            {/* Corrupt Option */}
            <button
              onClick={() => {
                if (state.budget < corruptCost) showToast('Not enough budget to Cut Corners!', 'error');
                else buildCorrupt();
              }}
              className={`col-span-1 gov-choice ${state.budget >= corruptCost ? 'gov-choice--corrupt' : 'gov-choice--disabled'}`}
              disabled={state.budget < corruptCost}
            >
              <div className="gov-choice-title gov-heading text-[11px]">CUT CORNERS</div>
              <div className="gov-choice-sub text-[9px]">Cost {corruptCost} • {state.pendingCard.corruptReward || '+1 DP, Corrupted'}</div>
            </button>

            {/* Bayanihan Option */}
            <button
              onClick={() => {
                buildBayanihan();
              }}
              className="col-span-2 gov-choice bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600 shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-all"
            >
              <div className="gov-choice-title gov-heading text-slate-200">BAYANIHAN (0 Budget)</div>
              <div className="gov-choice-sub">Takes 3 turns • +1 DP upon finish</div>
            </button>
          </div>

          {/* Budget row */}
          <div className="mt-4 flex justify-between items-center bg-black/25 border border-slate-700/40 rounded-xl p-2">
            <span className="text-[11px] text-amber-200/90 uppercase tracking-widest" style={{ fontFamily: "var(--font-display)" }}>
              Available Budget
            </span>
            <span className="text-amber-300 font-black text-xl" style={{ fontFamily: "var(--font-display)", letterSpacing: "0.08em" }}>
              {state.budget}/10
            </span>
          </div>

          {/* Cancel */}
          <button
            onClick={cancelDilemma}
            className="mt-3 w-full py-2.5 text-sm text-red-800 font-bold hover:text-white hover:bg-red-700 uppercase tracking-widest border-2 border-red-400 bg-red-100 transition-colors rounded-xl flex items-center justify-center gap-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <span className="text-lg leading-none">✕</span> Cancel
          </button>
      </div>
    </div>
  );
}
