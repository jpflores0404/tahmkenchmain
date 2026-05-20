// Card art mapping — add entries here as you create full-art images
const CARD_ART = {
  // Infrastructure
  'Public Hospital': '/hospital-play.jpeg',
  'Transit System': '/transit-play.jpeg',
  'Public School': '/school-play.jpeg',
  'Power Grid': '/powergrid-play.jpeg',
  'Water Facility': '/waterfacility-play.jpeg',
  // Support
  'Grassroots Initiative': '/grassroots-initiative.jfif',
  'Human Capital Investment': '/human-capital-investment.jfif',
  'Green Subsidy': '/green-subsidy.jfif',
  // Special
  'Accountability': '/accountability.jfif',
  'Economic Boom': '/economic-boom.jfif',
  'Investigation': '/investigation.jfif',
};

export default function CardComponent({ card, onClick, onDoubleClick, draggable = false, onBoard = false, inDeck = false, onDragStart, onDragEnd }) {
  const isInfra = card.type === 'infrastructure';
  const cardArt = CARD_ART[card.name] || null;
  const isSupport = card.type === 'support';
  const isAction = card.type === 'action';
  const isReform = isSupport || (isAction && card.actionType === 'reform');
  const isPolicy = isAction && card.actionType === 'policy';
  
  const cardClass =
    isInfra ? 'gov-card--infra' : isPolicy ? 'gov-card--policy' : isReform ? 'gov-card--reform' : 'gov-card--neutral';

  const isPending = false;
  const isFaceDown = inDeck;
  const isCorrupt = false;
  const isUpgraded = onBoard && isInfra && card.status === 'built' && card.upgraded;
  const canUpgrade = onBoard && isInfra && card.status === 'built' && !card.upgraded;
  const isBuilding = onBoard && card.status === 'building';

  const handleDragStart = (e) => {
    if (!draggable) return;

    const ghostInfo = e.currentTarget.getBoundingClientRect();
    const ghostNode = e.currentTarget.cloneNode(true);
    
    if (ghostNode.childNodes.length > 1) {
      ghostNode.lastChild.style.display = 'none';
    }
    
    ghostNode.style.position = 'absolute';
    ghostNode.style.top = '-1000px';
    ghostNode.style.left = '-1000px';
    ghostNode.style.width = ghostInfo.width + 'px';
    ghostNode.style.height = ghostInfo.height + 'px';
    ghostNode.style.transform = 'none';
    document.body.appendChild(ghostNode);
    
    e.dataTransfer.setDragImage(ghostNode, ghostInfo.width / 2, ghostInfo.height / 2);
    
    setTimeout(() => {
      if (document.body.contains(ghostNode)) {
        document.body.removeChild(ghostNode);
      }
    }, 0);

    e.dataTransfer.setData('cardId', card.id);
    const cardStr = JSON.stringify(card);
    e.dataTransfer.setData('cardData', cardStr);
    e.dataTransfer.setData('text/plain', cardStr);
    e.dataTransfer.effectAllowed = 'move';
    
    if (onDragStart) onDragStart(e, card);
  };

  const handleDragEnd = (e) => {
    if (onDragEnd) onDragEnd(e, card);
  };

  // Build cost/reward display text
  const getCostText = () => {
    if (isInfra) {
      return `Honest: ${card.honestCost}💰 / Cut: ${card.corruptCost}💰`;
    }
    if (isSupport) {
      if (card.cost > 0) return `Cost: ${card.cost} Budget`;
      return 'Free';
    }
    return '';
  };

  const getTypeLabel = () => {
    if (isInfra) return 'INFRA';
    if (isSupport) return 'SUPPORT';
    return 'ACTION';
  };

  const getCostBadge = () => {
    if (isInfra) return `⚒ ${card.honestCost}/${card.corruptCost}`;
    if (isSupport && card.cost > 0) return `💰 ${card.cost}`;
    if (isSupport) return '✦ Free';
    return '⚡ Act';
  };

  return (
    <div
      className={[
        'gov-card',
        cardClass,
        'relative select-none outline-none',
        onBoard ? 'w-full max-h-full' : inDeck ? 'w-full h-full' : 'w-[120px] sm:w-[150px] mx-1 flex-shrink-0',
        onBoard ? 'gov-card--board' : inDeck ? 'gov-card--deck' : 'gov-card--hand',
        draggable && !inDeck ? 'cursor-grab active:cursor-grabbing' : '',
        onClick ? 'cursor-pointer' : '',
        isFaceDown ? 'gov-card--facedown' : '',
        isCorrupt ? 'gov-card--corrupt' : '',
        isBuilding ? 'opacity-80 scale-[0.98]' : '',
      ].join(' ')}
      style={{ 
        aspectRatio: '330 / 539',
        transformStyle: 'preserve-3d'
      }}
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => onClick && onClick(card)}
      onDoubleClick={() => onDoubleClick && onDoubleClick(card)}
      data-card-type={card.type}
      data-action-type={card.actionType || ''}
      data-status={card.status || ''}
    >
      {/* Upgrade badges (Floating below) */}
      {(isUpgraded || canUpgrade) && !isPending && !isFaceDown && (
        <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 z-[60] whitespace-nowrap pointer-events-none">
          <span className={`text-[10px] px-2 py-0.5 rounded-lg font-black drop-shadow-md border border-[#8f5b2b] bg-[#fcebc4] ${
            isUpgraded ? 'text-emerald-700' : 'text-amber-700'
          }`}>
            {isUpgraded ? `★ LEVEL ${(card.level || 2)}` : '▲ UPGRADE (8💰)'}
          </span>
        </div>
      )}

      {/* ════ FRONT FACE ════ */}
      <div 
        className={[
          'gov-card-face',
          'gov-card-face--front',
          'absolute inset-0 rounded-[10px] border-[1px]',
          isPending ? 'pending-shimmer' : '',
        ].join(' ')}
        style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-between overflow-hidden rounded-[10px]">
        {/* Full-art card image */}
        {cardArt && (
          <img
            src={cardArt}
            alt={card.name}
            className={`absolute inset-0 w-full h-full ${!isInfra ? 'object-fill' : 'object-cover scale-[1.05]'} rounded-[10px] pointer-events-none`}
            style={{ zIndex: 0 }}
          />
        )}
        {/* Building Overlay */}
        {isBuilding && (
          <div className="absolute inset-x-0 bottom-0 top-auto h-1/3 bg-gradient-to-t from-indigo-900/90 to-transparent flex items-end justify-center pb-2 z-30">
            <div className="text-center">
              {card.buildType === 'bayanihan' && (
                <div className="text-[10px] font-black text-slate-300 drop-shadow-[0_1px_3px_rgb(0,0,0)] tracking-widest leading-tight">
                  <span className="text-white block text-[8px] opacity-70">BAYANIHAN</span>
                  ⏳ {card.timer} TURNS
                </div>
              )}
            </div>
          </div>
        )}

        {/* Removed pending overlay from front face to prevent bleeding through */}

        {/* Category glyphs / stamps — positioned above footer to avoid obscuring card name */}
        {!isFaceDown && !onBoard && (
          <div className="absolute bottom-8 right-1 z-20 flex items-center gap-1">

            {isPolicy && (
              <span className="gov-chip gov-chip--policy" style={{ fontSize: '7px', padding: '2px 4px' }} aria-hidden title="Policy">
                §
              </span>
            )}
            {isInfra && (
              <span className="gov-chip gov-chip--blueprint" style={{ fontSize: '7px', padding: '2px 4px' }} aria-hidden title="Blueprint">
                ⌁
              </span>
            )}
          </div>
        )}

        {/* --- Card Text Overlay --- */}
        {!cardArt && (
          <div className="relative z-10 w-full h-full flex flex-col p-2 text-center items-center pointer-events-none">
            
            {/* Top Header: Name */}
            <div 
              className="gov-card-title text-[18px] font-black text-white uppercase leading-tight mt-[2%]"
            >
              {card.name}
            </div>
            
            {/* Middle: Effect and Description */}
            <div className="gov-card-body">
              <div
                className="gov-card-cost"
                style={{ fontFamily: "var(--font-display)", letterSpacing: "0.12em" }}
              >
                {getCostText()}
              </div>

              <div
                className="gov-card-brief gov-heading"
              >
                {isInfra ? 'PROJECT BRIEF' : isPolicy ? 'POLICY BRIEF' : 'REFORM BRIEF'}
              </div>

              <div className="gov-card-divider" />

              <div
                className="gov-card-desc"
              >
                {card.description}
              </div>

              {isInfra && (
                <div className="gov-card-rewards">
                  <div className="gov-card-reward gov-card-reward--good">
                    <span>✓</span>
                    <span>Honest: {card.honestReward}</span>
                  </div>
                  <div className="gov-card-reward gov-card-reward--bad">
                    <span>!</span>
                    <span>Corrupt: {card.corruptReward}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer: Type + Cost badges */}
        {!onBoard && !cardArt && (
          <div className="absolute bottom-1 left-0 w-full px-1.5 flex justify-between items-center text-[13px] font-black tracking-wider z-10 pointer-events-none pb-0.5">
            <span className="px-1.5 py-0.5 rounded bg-black/60 text-white drop-shadow">
              {getTypeLabel()}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-black/60 text-amber-300 drop-shadow">
              {getCostBadge()}
            </span>
          </div>
        )}

        {/* Corruption indicator lower text */}
        {isCorrupt && !isPending && (
          <div className="absolute bottom-1 left-1.5 z-20">
            <span className="text-[9px] bg-black/60 px-1 py-0.5 rounded text-red-500 font-black drop-shadow">⚠ CORRUPT</span>
          </div>
        )}
        </div>
      </div>

      {/* ════ BACK FACE ════ */}
      <div 
        className={[
          'gov-card-face',
          'gov-card-face--back',
          'absolute inset-0 rounded-[10px]',
        ].join(' ')}
        style={{
          backfaceVisibility: 'hidden', 
          WebkitBackfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
        }}
      >
        {/* Back face is now plain wood texture, no stamp */}
      </div>
    </div>
  );
}
