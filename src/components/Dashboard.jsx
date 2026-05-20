import { useGame } from '../context/GameContext';
import { DP_DISPLAY_MAX, DP_WIN_THRESHOLD, TRUST_MAX } from '../constants/game';
import { SpinningCoin, AnimatedNumber } from './PlayerHUD';

function MiniSeals({ current, max = TRUST_MAX }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className={i < current ? 'gov-mini-seal gov-mini-seal--ok' : 'gov-mini-seal'}
          aria-hidden
        />
      ))}
    </div>
  );
}

export default function Dashboard({ isAI = false, variant = 'full' }) {
  const { state } = useGame();

  const trust = isAI ? state.aiTrust : state.publicTrust;
  const budget = isAI ? state.aiBudget : state.budget;
  const dp = isAI ? state.aiDP : state.developmentPoints;
  const label = isAI ? 'OPPONENT' : 'PLAYER';

  const trustPercent = (trust / TRUST_MAX) * 100;
  const barColor = trust <= 1 ? '#dc2626' : trust <= 3 ? '#d97706' : '#059669';

  // ─── Opponent grid variant (matches player HUD layout) ───
  if (variant === 'opponent') {
    return (
      <div className="gov-opponent-hud">
        <div className="gov-opponent-hud-glass">
          <div className="gov-opponent-hud-grid">
            <div className="gov-opponent-hud-cell">
              <div className="gov-opponent-hud-kicker gov-heading">OPPONENT DP</div>
              <div className="flex items-baseline gap-2">
                <AnimatedNumber value={dp} color="text-emerald-800" size="text-4xl" />
                <span className="font-black text-amber-900/60 text-lg">/{DP_WIN_THRESHOLD}</span>
              </div>
              <div className="text-[10px] uppercase tracking-widest text-amber-900/50 mt-1">
                Trust, Budget, and Status Hidden
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Trust-only variant (left corner) ───
  if (variant === 'trust') {
    return (
      <div className="gov-mini-panel">
        <div className="flex items-center gap-2">
          <span className="gov-mini-label gov-heading">{label}</span>
          <span className="ml-auto gov-mini-den gov-heading">{trust}/{TRUST_MAX}</span>
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <MiniSeals current={trust} />
          <div className="gov-mini-bar">
            <div className="gov-mini-bar-fill" style={{ width: `${trustPercent}%` }} />
          </div>
        </div>
      </div>
    );
  }

  // ─── Stats-only variant (right corner) ───
  if (variant === 'stats') {
    return (
      <div className="gov-mini-panel gov-mini-panel--stats">
        <div className="gov-mini-stat">
          <span className="gov-mini-stat-k gov-heading">BUDGET</span>
          <div className="flex items-center gap-1.5">
            <SpinningCoin size={18} />
            <AnimatedNumber value={budget} color="text-amber-900" size="text-sm" />
          </div>
        </div>
        <div className="gov-mini-stat">
          <span className="gov-mini-stat-k gov-heading">DP</span>
          <div className="flex items-center gap-1">
            {[...Array(Math.min(DP_DISPLAY_MAX, 10))].map((_, i) => (
              <span key={i} className={i < dp ? 'gov-mini-dp gov-mini-dp--lit' : 'gov-mini-dp'} aria-hidden />
            ))}
            <span className="gov-mini-den gov-heading ml-1">{dp}/{DP_WIN_THRESHOLD}</span>
          </div>
        </div>
        {/* Turn (player only) */}
        {!isAI && (
          <div className="gov-mini-stat">
            <span className="gov-mini-stat-k gov-heading">TURN</span>
            <span className="gov-mini-stat-v">{state.turnNumber}</span>
          </div>
        )}
        {/* Deck count (player only) */}
        {!isAI && (
          <div className="gov-mini-stat">
            <span className="gov-mini-stat-k gov-heading">DECK</span>
            <span className="gov-mini-stat-v">{state.deck.length}</span>
          </div>
        )}
      </div>
    );
  }

  // ─── Full variant (legacy fallback) ───
  return (
    <div className={`flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 ${isAI ? 'flex-row-reverse' : ''}`}>
      <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase w-16 text-center">
        {label}
      </div>
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span>Trust</span>
          <span className="font-mono">{trust}/{TRUST_MAX}</span>
        </div>
        <div className="h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-600">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${trustPercent}%`, backgroundColor: barColor }}
          />
        </div>
      </div>
      <div className="flex flex-col items-center px-2">
        <span className="text-[10px] text-slate-400">Budget</span>
        <div className="flex items-center gap-1.5">
          <SpinningCoin size={20} />
          <AnimatedNumber value={budget} color="text-amber-400" size="text-lg" />
        </div>
      </div>
      <div className="flex flex-col items-center px-2">
        <span className="text-[10px] text-slate-400">DP</span>
        <div className="flex gap-0.5 mt-0.5">
          {[...Array(DP_WIN_THRESHOLD)].map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-sm border ${
                i < dp
                  ? 'bg-emerald-400 border-emerald-300'
                  : 'bg-slate-700 border-slate-600'
              }`}
            />
          ))}
        </div>
      </div>
      {!isAI && (
        <div className="flex flex-col items-center px-2">
          <span className="text-[10px] text-slate-400">Turn</span>
          <span className="text-sm font-bold text-slate-300 font-mono">{state.turnNumber}</span>
        </div>
      )}
      {!isAI && (
        <div className="flex flex-col items-center px-2">
          <span className="text-[10px] text-slate-400">Deck</span>
          <span className="text-sm font-bold text-slate-300 font-mono">{state.deck.length}</span>
        </div>
      )}
    </div>
  );
}
