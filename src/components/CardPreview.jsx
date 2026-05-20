import { motion } from 'framer-motion';

// Card info art mapping — add entries here as you create info images
const CARD_INFO_ART = {
  // Infrastructure
  'Public Hospital': '/hospital-info.jpeg',
  'Transit System': '/transit-info.jpeg',
  'Public School': '/school-info.jpeg',
  'Power Grid': '/powergrid-info.jpeg',
  'Water Facility': '/waterfacility-info.jpeg',
  // Support
  'Grassroots Initiative': '/grassroots-initiative.jfif',
  'Human Capital Investment': '/human-capital-investment.jfif',
  'Green Subsidy': '/green-subsidy.jfif',
  // Special
  'Accountability': '/accountability.jfif',
  'Economic Boom': '/economic-boom.jfif',
  'Investigation': '/investigation.jfif',
};

export default function CardPreview({ card }) {
  if (!card) return null;

  const isInfra = card?.type === 'infrastructure';
  const isSupport = card?.type === 'support';
  const isAction = card?.type === 'action';
  const isPolicy = isAction && card?.actionType === 'policy';

  const infoArt = CARD_INFO_ART[card.name] || null;

  // Parchment-theme type badge colors
  const typeBg = isInfra
    ? 'bg-[#5c9e31]/80 border border-[#3b6e1b]'
    : isPolicy
    ? 'bg-[#4e8bc6]/80 border border-[#2c5f8a]'
    : 'bg-[#8f5b2b]/80 border border-[#643c14]';

  const typeLabel = isInfra ? 'INFRASTRUCTURE' : isSupport ? 'REFORM' : isPolicy ? 'POLICY' : 'ACTION';

  // ─── Full-art info image preview ───
  if (infoArt) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -14, scale: 0.985 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="card-preview-panel"
        style={{ fontFamily: "var(--font-body)", overflow: 'hidden' }}
      >
        <img
          src={infoArt}
          alt={`${card.name} info`}
          className={`w-full h-full ${!isInfra ? 'object-fill' : 'object-cover scale-[1.05]'}`}
        />
      </motion.div>
    );
  }

  // ─── Default text-based preview ───
  return (
    <motion.div
      initial={{ opacity: 0, x: -14, scale: 0.985 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      className="card-preview-panel"
      style={{ fontFamily: "var(--font-body)" }}
    >
      {/* Header */}
      <div className="px-4 pt-3 pb-2 border-b border-[#8f5b2b]/30 bg-[#f0ddb0]/60">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-[9px] font-black tracking-[0.2em] px-2 py-0.5 rounded text-white ${typeBg}`}>
            {typeLabel}
          </span>
        </div>
        <h3
          className="text-lg font-black text-[#3b2512] uppercase tracking-wide leading-tight"
          style={{ fontFamily: "var(--font-display)", letterSpacing: "0.08em" }}
        >
          {card.name}
        </h3>
      </div>

      <div className="card-preview-body">
        {/* Cost section */}
        <div className="px-4 py-2 border-b border-[#8f5b2b]/25 bg-[#e8cfa0]/40">
          {isInfra && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#8f5b2b] tracking-wider font-bold uppercase">Honest Cost</span>
                <span className="text-sm font-black text-[#4a3018]">
                  💰 {card.honestCost}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#8f5b2b] tracking-wider font-bold uppercase">Cut Corners</span>
                <span className="text-sm font-black text-[#cc4f4f]">
                  💰 {card.corruptCost}
                </span>
              </div>
            </div>
          )}
          {isSupport && (
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#8f5b2b] tracking-wider font-bold uppercase">Cost</span>
              <span className="text-sm font-black text-[#4a3018]">
                {card.cost > 0 ? `💰 ${card.cost}` : '✦ FREE'}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="px-4 py-3 card-preview-scroll">
          <div className="text-[10px] font-black text-[#8f5b2b] tracking-[0.15em] mb-1.5 uppercase">Effect</div>
          <p className="text-[13px] font-medium text-[#3b2512] leading-relaxed">
            {card.description}
          </p>
        </div>

        {/* Rewards */}
        {isInfra && (
          <div className="px-4 py-2 border-t border-[#8f5b2b]/25 bg-[#e8cfa0]/40 space-y-1.5">
            <div className="text-[10px] font-black text-[#8f5b2b] tracking-[0.15em] mb-1 uppercase">Rewards</div>
            <div className="flex items-start gap-2">
              <span className="text-[#5c9e31] text-xs font-black">✓</span>
              <div>
                <span className="text-[10px] text-[#3b6e1b] font-black tracking-wider uppercase">Honest</span>
                <p className="text-[12px] text-[#3b6e1b] font-bold">
                  {card.honestReward}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#cc4f4f] text-xs font-black">✗</span>
              <div>
                <span className="text-[10px] text-[#8b2b2b] font-black tracking-wider uppercase">Corrupt</span>
                <p className="text-[12px] text-[#8b2b2b] font-bold">
                  {card.corruptReward}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
