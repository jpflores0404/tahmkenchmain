// ============================================================
// State of Affairs — Weighted card pools
// ============================================================

const INFRASTRUCTURE_CARDS = [
  { id: 'inf-hospital', type: 'infrastructure', name: 'Public Hospital', description: 'Build a hospital for the people.', honestCost: 3, corruptCost: 1, honestReward: '+1 DP', corruptReward: '+1 DP, become Corrupted' },
  { id: 'inf-transit', type: 'infrastructure', name: 'Transit System', description: 'Expand metro and bus systems.', honestCost: 3, corruptCost: 1, honestReward: '+1 DP', corruptReward: '+1 DP, become Corrupted' },
  { id: 'inf-school', type: 'infrastructure', name: 'Public School', description: 'Invest in education infrastructure.', honestCost: 3, corruptCost: 1, honestReward: '+1 DP', corruptReward: '+1 DP, become Corrupted' },
  { id: 'inf-grid', type: 'infrastructure', name: 'Power Grid', description: 'Modernize the electrical grid.', honestCost: 3, corruptCost: 1, honestReward: '+1 DP', corruptReward: '+1 DP, become Corrupted' },
  { id: 'inf-water', type: 'infrastructure', name: 'Water Facility', description: 'Clean water for rural areas.', honestCost: 3, corruptCost: 1, honestReward: '+1 DP', corruptReward: '+1 DP, become Corrupted' },
];

const SUPPORT_CARDS = [
  { id: 'sup-grassroots', type: 'support', subtype: 'consumable', name: 'Grassroots Initiative', description: 'Your next Honest Build costs -1 Budget.\n\n"True progress starts with the community, one brick at a time."', cost: 0, effect: 'honest_discount' },
  { id: 'sup-human-capital', type: 'support', subtype: 'consumable_budget', name: 'Human Capital Investment', description: 'Passive: honest Public Hospital and Public School builds provide +1 DP.', cost: 2, effect: 'human_capital_passive' },
  { id: 'sup-green', type: 'support', subtype: 'consumable_budget', name: 'Green Subsidy', description: 'Passive: honest Power Grid, Water Facility, and Transit System builds provide +1 DP.', cost: 2, effect: 'green_subsidy_passive' },
];

const SPECIAL_CARDS = {
  autoClean: {
    id: 'special-auto-clean',
    type: 'support',
    subtype: 'special',
    name: 'Accountability',
    description: 'Remove your Corrupted status. You become Clean.\\n(Requires 2 turns of being Corrupted)',
    cost: 0,
    effect: 'auto_clean',
  },
  investigation: {
    id: 'special-investigation',
    type: 'support',
    subtype: 'special',
    name: 'Investigation',
    description: 'Reveal whether the opponent is Corrupted. If yes: opponent Trust -2 and you gain +3 Budget.',
    cost: 0,
    effect: 'investigation',
  },
  economicBoom: {
    id: 'special-economic-boom',
    type: 'support',
    subtype: 'special',
    name: 'Economic Boom',
    description: 'Provides a one-time +2 Budget boost.',
    cost: 0,
    effect: 'budget_boost',
    value: 2,
  },
};

/** Fisher-Yates shuffle */
export function shuffleDeck(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function createDeck() {
  return Array.from({ length: 30 }, (_, index) => ({ id: `draw-${index + 1}`, type: 'draw' }));
}

/** Creates a separate deck for the AI with unique 'ai-' prefixed IDs */
export function createAIDeck() {
  return Array.from({ length: 30 }, (_, index) => ({ id: `ai-draw-${index + 1}`, type: 'draw' }));
}

function pickRandom(pool) {
  return pool[Math.floor(Math.random() * pool.length)];
}

function chooseWeightedCategory(counters) {
  const weights = [
    { category: 'infrastructure', weight: 40, valid: true },
    { category: 'support', weight: 20, valid: true },
    { category: 'autoClean', weight: 10, valid: counters.autoCleanDrawn < 1 },
    { category: 'investigation', weight: 10, valid: counters.investigationDrawn < 2 },
    { category: 'economicBoom', weight: 20, valid: counters.economicBoomDrawn < 1 },
  ].filter(item => item.valid);

  const total = weights.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * total;
  for (const item of weights) {
    roll -= item.weight;
    if (roll <= 0) return item.category;
  }
  return weights[weights.length - 1].category;
}

export function drawWeightedCard({ prefix = 'p', drawIndex = 0, counters = { autoCleanDrawn: 0, investigationDrawn: 0, economicBoomDrawn: 0 }, forceCategory } = {}) {
  const category = forceCategory || chooseWeightedCategory(counters);
  const suffix = `${prefix}-${Date.now()}-${drawIndex}-${Math.floor(Math.random() * 100000)}`;

  if (category === 'infrastructure') {
    const template = pickRandom(INFRASTRUCTURE_CARDS);
    return { card: { ...template, id: `${template.id}-${suffix}` }, category };
  }

  if (category === 'autoClean') {
    return { card: { ...SPECIAL_CARDS.autoClean, id: `${SPECIAL_CARDS.autoClean.id}-${suffix}` }, category };
  }

  if (category === 'investigation') {
    return { card: { ...SPECIAL_CARDS.investigation, id: `${SPECIAL_CARDS.investigation.id}-${suffix}` }, category };
  }

  if (category === 'economicBoom') {
    return { card: { ...SPECIAL_CARDS.economicBoom, id: `${SPECIAL_CARDS.economicBoom.id}-${suffix}` }, category };
  }

  const template = pickRandom(SUPPORT_CARDS);
  return { card: { ...template, id: `${template.id}-${suffix}` }, category };
}

export { INFRASTRUCTURE_CARDS, SUPPORT_CARDS, SPECIAL_CARDS };
