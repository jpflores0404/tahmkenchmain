import { useGame } from '../context/GameContext';

function Diamond({ lit, isGoal }) {
  const litColor = isGoal
    ? 'linear-gradient(180deg, rgba(245,158,11,0.95), rgba(245,158,11,0.5))'
    : 'linear-gradient(180deg, rgba(34,211,238,0.95), rgba(34,211,238,0.5))';
  const litBorder = isGoal ? 'rgba(245,158,11,0.9)' : 'rgba(34,211,238,0.8)';
  const litShadow = isGoal
    ? '0 0 14px rgba(245,158,11,0.8), 0 0 30px rgba(245,158,11,0.35)'
    : '0 0 14px rgba(34,211,238,0.7), 0 0 30px rgba(34,211,238,0.3)';

  return (
    <div
      style={{
        width: '26px',
        height: '26px',
        transform: 'rotate(45deg)',
        borderRadius: '4px',
        border: `2.5px solid ${lit ? litBorder : 'rgba(200,160,80,0.25)'}`,
        background: lit ? litColor : 'rgba(25,15,5,0.7)',
        boxShadow: lit ? litShadow : 'inset 0 0 0 1px rgba(25,15,5,0.5)',
        transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.4s ease',
        flexShrink: 0,
      }}
    />
  );
}

export default function DPBadge({ isAI = false }) {
  const { state } = useGame();
  const dp = isAI ? state.aiDP : state.developmentPoints;

  return (
    <div
      style={{
        zIndex: 90,
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'stretch',
          background: 'linear-gradient(135deg, #1a120a 0%, #2d1d0d 60%, #1a120a 100%)',
          border: '3px solid rgba(160,100,30,0.75)',
          borderRadius: '10px',
          overflow: 'hidden',
          boxShadow:
            '0 8px 36px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        {/* Left: "You" name tab */}
        <div
          style={{
            background: isAI 
              ? 'linear-gradient(180deg, #320f08 0%, #1e0504 100%)' 
              : 'linear-gradient(180deg, #321d08 0%, #1e0f04 100%)',
            borderRight: isAI 
              ? '3px solid rgba(160,30,30,0.4)' 
              : '3px solid rgba(160,100,30,0.4)',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: isAI ? '12px' : '16px',
              fontWeight: 800,
              color: isAI ? '#c64f4f' : '#e8c06a',
              letterSpacing: isAI ? '0.06em' : '0.12em',
              textTransform: 'uppercase',
              textShadow: '0 1px 6px rgba(0,0,0,0.7)',
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              transform: 'rotate(180deg)',
            }}
          >
            {isAI ? 'Opponent' : 'You'}
          </span>
        </div>

        {/* Center: big DP + diamonds */}
        <div
          style={{
            padding: '16px 24px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            alignItems: 'flex-start',
          }}
        >
          {/* Big "DP" label */}
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '48px',
              fontWeight: 900,
              color: isAI ? '#d65b5b' : '#e8c06a',
              lineHeight: 1,
              letterSpacing: '0.05em',
              textShadow: isAI 
                ? '0 2px 10px rgba(0,0,0,0.8), 0 0 24px rgba(214,91,91,0.25)' 
                : '0 2px 10px rgba(0,0,0,0.8), 0 0 24px rgba(232,192,106,0.25)',
            }}
          >
            DP
          </span>

          {/* Diamond row */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {[...Array(state.dpWinThreshold || 5)].map((_, i) => (
              <Diamond key={i} lit={i < dp} isGoal={i < (state.dpWinThreshold || 5)} />
            ))}
          </div>

          {/* Goal sub-label */}
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              color: isAI ? 'rgba(214,91,91,0.5)' : 'rgba(232,192,106,0.5)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginTop: '-4px',
            }}
          >
            Goal: {state.dpWinThreshold || 5} DP
          </span>
        </div>
      </div>
    </div>
  );
}
