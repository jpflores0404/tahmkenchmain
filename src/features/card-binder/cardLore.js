// ─────────────────────────────────────────────────────────────
// Card Lore — binder-exclusive data (no gameplay impact)
// Each entry: { type, cost, bestCase, worstCase, realLife }
// ─────────────────────────────────────────────────────────────

const CARD_LORE = {

  // ── INFRASTRUCTURE ──────────────────────────────────────────

  'Public Hospital': {
    type: 'Infrastructure',
    cost: 'Honest: 3 Budget  |  Cut Corners: 1 Budget',
    bestCase: 'You have enough budget and play it honestly early — it grants +1 DP and signals trustworthy governance to voters.',
    worstCase: 'You cut corners to afford it when budget is tight — you gain the DP but become Corrupted, making you vulnerable to Investigation.',
    realLife: 'Public hospitals are the backbone of a nation\'s healthcare system, serving communities that private clinics cannot reach. Underfunded hospitals lead to longer wait times, staff shortages, and preventable deaths. Investing honestly in public health creates a multiplier effect — a healthier workforce is a more productive one.',
  },

  'Transit System': {
    type: 'Infrastructure',
    cost: 'Honest: 3 Budget  |  Cut Corners: 1 Budget',
    bestCase: 'Built honestly when you have budget surplus — the +1 DP reward keeps you ahead without triggering corruption risk.',
    worstCase: 'Built cheaply mid-game when budget is low — corruption status exposes you to your opponent\'s Investigation card at the worst time.',
    realLife: 'Efficient public transit reduces traffic congestion, lowers carbon emissions, and improves access to jobs for low-income communities. Countries that invest in mass transit infrastructure see measurable drops in urban poverty rates. Underfunded systems, however, deteriorate quickly — half-built transit projects are often cited as the most visible symbol of government mismanagement.',
  },

  'Public School': {
    type: 'Infrastructure',
    cost: 'Honest: 3 Budget  |  Cut Corners: 1 Budget',
    bestCase: 'Played honestly alongside Human Capital Investment — you earn +2 DP total from a single card play.',
    worstCase: 'Built corruptly when you already have a Corrupted status — stacking corruption leaves you with no way to recover without Accountability.',
    realLife: 'Education is the single most studied driver of long-term economic growth and social mobility. Public schools ensure that access to education is not determined by a family\'s wealth. When school infrastructure is neglected or funds are siphoned through corruption, entire generations bear the cost through reduced lifetime earnings and civic disengagement.',
  },

  'Power Grid': {
    type: 'Infrastructure',
    cost: 'Honest: 3 Budget  |  Cut Corners: 1 Budget',
    bestCase: 'Played honestly with Green Subsidy active — earns +2 DP, and the passive bonus makes every subsequent infrastructure card more rewarding.',
    worstCase: 'Built corruptly when Green Subsidy is active — you lose the passive bonus AND become Corrupted, wasting the synergy entirely.',
    realLife: 'Reliable electricity is foundational to virtually every sector of modern life — healthcare, education, business, and emergency services all depend on it. Power grid failures have cascading consequences: hospitals lose power, factories halt, and food supply chains break down. In many developing nations, chronic underfunding of grid maintenance is a leading cause of economic stagnation.',
  },

  'Water Facility': {
    type: 'Infrastructure',
    cost: 'Honest: 3 Budget  |  Cut Corners: 1 Budget',
    bestCase: 'Played honestly as a final DP push — clean water access is universally popular and, paired with Green Subsidy, yields a double reward.',
    worstCase: 'Built cheaply near the endgame when opponent has Investigation ready — corruption exposure at that moment can cost you the match.',
    realLife: 'Access to clean water is recognized as a fundamental human right, yet over two billion people worldwide still lack it. Waterborne diseases remain one of the leading causes of child mortality globally, especially in regions where water infrastructure has been neglected or privatized. Every dollar invested in safe water and sanitation yields an estimated $4–$12 in economic returns through reduced healthcare costs and increased productivity.',
  },

  // ── SUPPORT ─────────────────────────────────────────────────

  'Grassroots Initiative': {
    type: 'Support Card',
    cost: 'Free (0 Budget)',
    bestCase: 'Used just before you play a 3-cost infrastructure card — effectively turns a 3-cost card into a 2-cost card, enabling a turn where you build and still have budget left.',
    worstCase: 'Saved too long and never used before game ends — the discount is wasted if no honest build follows it in time.',
    realLife: 'Grassroots movements have historically been the driving force behind major policy change — from civil rights to environmental reform. Community-organized labor reduces costs while increasing public ownership and accountability of infrastructure projects. When people are stakeholders in what is being built, projects are more likely to be maintained, protected, and used effectively.',
  },

  'Human Capital Investment': {
    type: 'Support Card',
    cost: '2 Budget',
    bestCase: 'Played early — the passive bonus stacks over multiple honest hospital and school builds, potentially yielding +2 to +4 DP across the game.',
    worstCase: 'Played late when only one or two infrastructure cards remain — the 2-cost investment barely recoups its value.',
    realLife: 'Human capital — the skills, health, and knowledge of a population — is widely regarded by economists as the most critical driver of sustained national growth. Nations that invest heavily in education and healthcare consistently outperform those that rely solely on physical capital. The returns are not immediate, but compounding: a more educated workforce attracts higher-value industries, generates more tax revenue, and requires less public spending on social safety nets.',
  },

  'Green Subsidy': {
    type: 'Support Card',
    cost: '2 Budget',
    bestCase: 'Played with three target infrastructure cards still in your remaining turns — Power Grid, Water Facility, and Transit System each become +2 DP plays.',
    worstCase: 'Played late when the target infrastructure cards have already been built — the passive bonus never triggers, making this a 2-cost card with zero return.',
    realLife: 'Green subsidies are government incentives designed to accelerate the transition to environmentally sustainable infrastructure. Investments in renewable energy grids, water recycling, and clean transit not only reduce long-term maintenance costs but also attract climate-focused international funding. Critics argue that poorly targeted subsidies benefit corporations more than communities — making transparency in their allocation critically important.',
  },

  // ── SPECIAL ─────────────────────────────────────────────────

  'Accountability': {
    type: 'Special Card',
    cost: 'Free (0 Budget)',
    bestCase: 'Used immediately after 2 turns of corruption — cleanses your status before the opponent can play Investigation, denying them the penalty.',
    worstCase: 'Drawn before you are Corrupted — the card sits unusable in hand, occupying a slot that could have held a more immediately useful card.',
    realLife: 'Accountability mechanisms — such as audits, anti-corruption commissions, and whistleblower protections — are the primary tools governments use to self-correct when misconduct occurs. The absence of accountability allows corruption to compound: a single unaddressed incident normalizes the behavior and encourages further abuse. International studies consistently show that nations with strong accountability institutions recover faster from economic shocks and maintain higher levels of public trust.',
  },

  'Investigation': {
    type: 'Special Card',
    cost: 'Free (0 Budget)',
    bestCase: 'Played when you are confident the opponent is Corrupted — you gain +3 Budget and reduce their Trust by 2, a massive swing in your favor.',
    worstCase: 'Played when the opponent is actually Clean — the investigation reveals nothing, you waste the card, and your opponent knows you suspected them.',
    realLife: 'Legislative investigations and independent inquiries serve as one of the most powerful checks on executive power in democratic systems. When conducted transparently and without political bias, they restore public trust and deter future misconduct. However, weaponized investigations — used to harass political opponents rather than uncover genuine wrongdoing — can erode the very democratic norms they claim to protect.',
  },

  'Economic Boom': {
    type: 'Special Card',
    cost: 'Free (0 Budget)',
    bestCase: 'Used at a budget bottleneck turn when you need exactly 2 more Budget to play a key infrastructure card — it perfectly unlocks the next build.',
    worstCase: 'Used recklessly when budget was already sufficient — the +2 boost goes to waste as it overflows past what you needed for the next turn.',
    realLife: 'Economic booms are periods of rapid growth driven by increased investment, consumer spending, or technological innovation. While they create prosperity, they also carry risks: overheated economies can breed inflation, asset bubbles, and inequality if the gains are not distributed equitably. Governments face the difficult task of sustaining growth without letting short-term enthusiasm lead to long-term structural vulnerabilities.',
  },
};

export default CARD_LORE;
