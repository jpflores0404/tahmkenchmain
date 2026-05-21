import { createContext, useCallback, useContext, useReducer, useRef, useState } from 'react';
import { createAIDeck, createDeck, drawWeightedCard } from '../data/deck';
import {
  AGENDA_SLOT_COUNT,
  TRUST_MAX,
  UPGRADE_COST,
  UPGRADE_DP_REWARD,
} from '../constants/game';

const GameContext = createContext(null);

function drawCards(deck, hand, count, counters, prefix, forceCategories = null) {
  const nextDeck = [...deck];
  const nextHand = [...hand];
  const nextCounters = { ...counters };

  for (let i = 0; i < count; i += 1) {
    if (nextHand.length >= 12) {
      break;
    }
    if (nextDeck.length === 0) {
      // Regenerate deck if it runs out (infinite scaling)
      const freshDeck = prefix === 'ai' ? createAIDeck() : createDeck();
      nextDeck.push(...freshDeck);
    }
    nextDeck.shift();
    const forceCategory = forceCategories && forceCategories[i] ? forceCategories[i] : undefined;
    const { card, category } = drawWeightedCard({
      prefix,
      drawIndex: 30 - nextDeck.length,
      counters: nextCounters,
      forceCategory,
    });

    if (category === 'autoClean') nextCounters.autoCleanDrawn += 1;
    if (category === 'investigation') nextCounters.investigationDrawn += 1;
    if (category === 'economicBoom') nextCounters.economicBoomDrawn += 1;
    nextHand.push(card);
  }

  return { deck: nextDeck, hand: nextHand, counters: nextCounters };
}

function getHonestDpBonus(state, card) {
  let bonus = 0;
  if (state.humanCapitalActive && (card.name === 'Public Hospital' || card.name === 'Public School')) bonus += 1;
  if (state.greenSubsidyActive && ['Power Grid', 'Water Facility', 'Transit System'].includes(card.name)) bonus += 1;
  return bonus;
}

function getAiHonestDpBonus(state, card) {
  let bonus = 0;
  if (state.aiHumanCapitalActive && (card.name === 'Public Hospital' || card.name === 'Public School')) bonus += 1;
  if (state.aiGreenSubsidyActive && ['Power Grid', 'Water Facility', 'Transit System'].includes(card.name)) bonus += 1;
  return bonus;
}

function getHonestBuildCost(card, discount = 0) {
  return Math.max(0, (card.honestCost || 3) - (discount > 0 ? 1 : 0));
}

function countCutCornersBuilds(slots) {
  return slots.filter(slot => slot && slot.status === 'built' && slot.buildType === 'corrupt').length;
}

function getCorruptionTurnPenalty(isCorrupted) {
  return isCorrupted ? 1 : 0;
}

function completeBuild(state, card, buildType, slotIndex, actor = 'player') {
  const slotsKey = actor === 'player' ? 'agendaSlots' : 'aiSlots';
  const dpKey = actor === 'player' ? 'developmentPoints' : 'aiDP';
  const corruptedKey = actor === 'player' ? 'isCorrupted' : 'aiCorrupted';
  const corruptedAtKey = actor === 'player' ? 'corruptedAtTurn' : 'aiCorruptedAtTurn';
  const slots = [...state[slotsKey]];
  let dp = state[dpKey];
  let becameCorrupted = state[corruptedKey];
  let corruptedAtTurn = state[corruptedAtKey];
  let effects = '';

  const baseCard = {
    ...card,
    pendingAction: null,
    level: 1,
    upgraded: false,
  };

  if (buildType === 'honest') {
    const bonus = actor === 'player' ? getHonestDpBonus(state, card) : getAiHonestDpBonus(state, card);
    slots[slotIndex] = { ...baseCard, status: 'built', buildType, timer: null };
    dp += 1 + bonus;
    effects = `${card.name} built honestly. DP +${1 + bonus}.`;
  } else if (buildType === 'corrupt') {
    slots[slotIndex] = { ...baseCard, status: 'built', buildType, timer: null };
    dp += 1;
    if (!becameCorrupted) {
      corruptedAtTurn = state.turnNumber;
    }
    becameCorrupted = true;
    effects = `${card.name} built by cutting corners. DP +1. You are now Corrupted.`;
  } else {
    slots[slotIndex] = { ...baseCard, status: 'building', buildType: 'bayanihan', timer: 3 };
    effects = `${card.name} began as a Bayanihan build. It finishes in 3 turns.`;
  }

  return {
    ...state,
    [slotsKey]: slots,
    [dpKey]: dp,
    [corruptedKey]: becameCorrupted,
    [corruptedAtKey]: corruptedAtTurn,
    lastBuildResult: actor === 'player' ? { success: true, effects } : state.lastBuildResult,
    turnSupportLog: actor === 'player'
      ? [...state.turnSupportLog, { name: card.name, description: effects }]
      : state.turnSupportLog,
  };
}

function checkGameOver(state) {

  let phase = state.phase;
  let gameResult = state.gameResult;

  if (state.developmentPoints >= state.dpWinThreshold) {
    phase = 'gameover';
    gameResult = 'victory';
  } else if (state.publicTrust <= 0) {
    phase = 'gameover';
    gameResult = 'defeat_impeachment';
  } else if (state.aiTrust <= 0) {
    phase = 'gameover';
    gameResult = 'victory_impeachment';
  } else if (state.aiDP >= state.dpWinThreshold) {
    phase = 'gameover';
    gameResult = 'defeat_development';
  }

  return { ...state, phase, gameResult };
}

function createInitialState(dpThreshold = 5) {
  return {
    publicTrust: TRUST_MAX,
    budget: 0,
    developmentPoints: 0,
    isCorrupted: false,
    corruptedAtTurn: null,
    agendaSlots: Array.from({ length: AGENDA_SLOT_COUNT }, () => null),
    deck: createDeck(),
    hand: [],
    drawCounters: { autoCleanDrawn: 0, investigationDrawn: 0, economicBoomDrawn: 0 },
    turnNumber: 1,
    phase: 'play',
    dpWinThreshold: dpThreshold,
    gameResult: null,
    pendingSlotIndex: null,
    pendingCard: null,
    pendingBuild: null,
    corruptionWheelResult: null,
    precalcWheelSuccess: null,
    precalcWheelAngle: null,
    investigationResult: null,
    autoCleanResult: null,
    lastBuildResult: null,
    turnStarted: false,
    nextHonestDiscount: 0,
    humanCapitalActive: false,
    greenSubsidyActive: false,
    draggingCard: null,
    aiTrust: TRUST_MAX,
    aiBudget: 0,
    aiDP: 0,
    aiCorrupted: false,
    aiCorruptedAtTurn: null,
    aiSlots: Array.from({ length: AGENDA_SLOT_COUNT }, () => null),
    aiDeck: createAIDeck(),
    aiHand: [],
    aiDrawCounters: { autoCleanDrawn: 0, investigationDrawn: 0, economicBoomDrawn: 0 },
    aiNextHonestDiscount: 0,
    aiHumanCapitalActive: false,
    aiGreenSubsidyActive: false,
    aiThinking: false,
    turnSupportLog: [],
    aiTurnSupportLog: [],
    aiInvestigationResult: null,
    playedSupportCardsThisTurn: [],
  };
}

function prepareBuild(state, buildType) {
  if (state.phase !== 'dilemma' || !state.pendingCard) return state;

  let cost = buildType === 'honest' ? state.pendingCard.honestCost || 3 : buildType === 'corrupt' ? state.pendingCard.corruptCost || 1 : 0;
  let nextHonestDiscount = state.nextHonestDiscount;

  if (buildType === 'honest' && nextHonestDiscount > 0) {
    cost = Math.max(0, cost - 1);
    nextHonestDiscount -= 1;
  }

  if (state.budget < cost) return state;

  const hand = state.hand.filter(card => card.id !== state.pendingCard.id);
  const pendingBuild = {
    card: state.pendingCard,
    slotIndex: state.pendingSlotIndex,
    buildType,
  };

  const paidState = {
    ...state,
    budget: state.budget - cost,
    hand,
    pendingSlotIndex: null,
    pendingCard: null,
    nextHonestDiscount,
    investigationResult: null,
    autoCleanResult: null,
    lastBuildResult: null,
  };

  if (state.isCorrupted) {
    const success = Math.random() >= 0.7;
    let finalAngle;
    if (success) {
      const offset = 10 + Math.random() * 88; // 10 to 98 degrees
      finalAngle = 360 * 5 + offset;
    } else {
      const offset = 118 + Math.random() * 232; // 118 to 350 degrees
      finalAngle = 360 * 5 + offset;
    }

    return {
      ...paidState,
      phase: 'corruption_wheel',
      pendingBuild,
      corruptionWheelResult: null,
      precalcWheelSuccess: success,
      precalcWheelAngle: finalAngle,
    };
  }

  const resolved = completeBuild(paidState, pendingBuild.card, buildType, pendingBuild.slotIndex, 'player');
  return checkGameOver({ ...resolved, phase: 'play', pendingBuild: null });
}

function advanceBayanihan(slots, dp) {
  const nextSlots = [...slots];
  let nextDp = dp;

  for (let i = 0; i < nextSlots.length; i += 1) {
    const slot = nextSlots[i];
    if (!slot || slot.status !== 'building' || slot.buildType !== 'bayanihan') continue;

    const updated = { ...slot, timer: slot.timer - 1 };
    if (updated.timer <= 0) {
      updated.status = 'built';
      updated.timer = null;
      nextDp += 1;
    }
    nextSlots[i] = updated;
  }

  return { slots: nextSlots, dp: nextDp };
}

function chooseAiInfrastructureCard(cards, state) {
  return [...cards].sort((a, b) => {
    const aBonus = getAiHonestDpBonus(state, a);
    const bBonus = getAiHonestDpBonus(state, b);
    if (aBonus !== bBonus) return bBonus - aBonus;
    return a.name.localeCompare(b.name);
  })[0];
}

function chooseAiBuildType({ card, aiBudget, aiDP, aiTrust, aiCorrupted, aiNextHonestDiscount, playerDP, dpWinThreshold, honestDp }) {
  const honestCost = getHonestBuildCost(card, aiNextHonestDiscount);
  const corruptCost = card.corruptCost || 1;
  const corruptDp = 1;
  const isBehind = aiDP < playerDP;
  const canWinHonestly = aiDP + honestDp >= dpWinThreshold && aiBudget >= honestCost;
  const canWinCorruptly = aiDP + corruptDp >= dpWinThreshold && aiBudget >= corruptCost;

  if (canWinHonestly) return 'honest';
  if (!aiCorrupted && canWinCorruptly) return 'corrupt';

  if (aiCorrupted) {
    if (aiTrust <= 2 && aiDP + honestDp < dpWinThreshold) return null;
    if (aiBudget >= honestCost && (aiTrust >= 4 || isBehind)) return 'honest';
    if (aiBudget >= corruptCost && aiTrust >= 4 && isBehind) return 'corrupt';
    return aiTrust >= 3 ? 'bayanihan' : null;
  }

  if (aiBudget >= honestCost) return 'honest';
  if (aiBudget >= corruptCost && (isBehind || aiTrust >= 4)) return 'corrupt';
  return 'bayanihan';
}

function runAiTurn(state) {
  let aiBudget = Math.min(10, state.aiBudget + 3);
  let aiTrust = state.aiTrust;
  let aiDP = state.aiDP;
  let aiHand = [...state.aiHand];
  let aiSlots = [...state.aiSlots];
  let aiCorrupted = state.aiCorrupted;
  let aiCorruptedAtTurn = state.aiCorruptedAtTurn;
  let aiNextHonestDiscount = state.aiNextHonestDiscount;
  let aiHumanCapitalActive = state.aiHumanCapitalActive;
  let aiGreenSubsidyActive = state.aiGreenSubsidyActive;
  let playerTrust = state.publicTrust;
  let aiDeck = [...state.aiDeck];
  let aiDrawCounters = { ...state.aiDrawCounters };
  let aiInvestigationResult = null;
  const aiSupportLog = [];
  const playerPenaltyLog = [];

  const getPlayerTurnSupportLog = () => (
    playerPenaltyLog.length > 0 ? [...state.turnSupportLog, ...playerPenaltyLog] : state.turnSupportLog
  );

  const removeAiCard = (card) => {
    aiHand = aiHand.filter(handCard => handCard.id !== card.id);
  };

  const playAiSupportCard = (card, description = card.description) => {
    if (card.cost > 0) aiBudget -= card.cost;
    removeAiCard(card);
    aiSupportLog.push({ name: card.name, description });
  };

  if (state.turnNumber >= 2) {
    const drawn = drawCards(aiDeck, aiHand, 1, aiDrawCounters, 'ai');
    aiDeck = drawn.deck;
    aiHand = drawn.hand;
    aiDrawCounters = drawn.counters;
  }

  if (aiCorrupted) {
    const aiCorruptionPenalty = getCorruptionTurnPenalty(aiCorrupted);
    aiTrust = Math.max(0, aiTrust - aiCorruptionPenalty);
    aiBudget = Math.max(0, aiBudget - aiCorruptionPenalty);
  }

  if (aiTrust <= 0) {
    return {
      ...state,
      aiBudget,
      aiTrust,
      aiDP,
      aiHand,
      aiSlots,
      aiCorrupted,
      aiCorruptedAtTurn,
      aiDeck,
      aiDrawCounters,
      aiNextHonestDiscount,
      aiHumanCapitalActive,
      aiGreenSubsidyActive,
      aiInvestigationResult,
      turnSupportLog: getPlayerTurnSupportLog(),
      aiTurnSupportLog: aiSupportLog,
    };
  }

  const getSupport = (effect) => aiHand.find(card => card.type === 'support' && card.effect === effect);
  const hasInfraInHand = () => aiHand.some(card => card.type === 'infrastructure');

  let supportPlayed = true;
  while (supportPlayed) {
    supportPlayed = false;

    const autoClean = getSupport('auto_clean');
    if (autoClean && aiCorrupted && state.turnNumber >= (aiCorruptedAtTurn + 2) && (aiTrust <= 3 || aiBudget >= 4)) {
      aiCorrupted = false;
      aiCorruptedAtTurn = null;
      playAiSupportCard(autoClean, 'AI removed its Corrupted status.');
      supportPlayed = true;
      continue;
    }

    const investigation = getSupport('investigation');
    const playerCorruptBuilds = countCutCornersBuilds(state.agendaSlots);
    const investigationChance = 0.35;
    if (investigation && state.isCorrupted && playerCorruptBuilds > 0 && Math.random() < investigationChance) {
      playerTrust = Math.max(0, playerTrust - 2);
      aiInvestigationResult = {
        effects: 'AI used Investigation: you were Corrupted, so you lost 2 Trust points.',
      };
      playAiSupportCard(investigation, aiInvestigationResult.effects);
      playerPenaltyLog.push({
        name: 'Trust Penalty',
        description: 'AI Investigation found your corruption. Trust -2.',
      });
      supportPlayed = true;
      if (playerTrust <= 0) break;
      continue;
    }

    const economicBoom = getSupport('budget_boost');
    const upgradableIdx = aiSlots.findIndex(slot => slot && slot.status === 'built' && !slot.upgraded);
    const canUseBoom = economicBoom && aiBudget < 10 && (
      aiBudget < 3 ||
      (upgradableIdx !== -1 && aiBudget < UPGRADE_COST && aiBudget + (economicBoom.value || 2) >= UPGRADE_COST) ||
      (hasInfraInHand() && aiBudget < 3 && aiBudget + (economicBoom.value || 2) >= 3)
    );
    if (canUseBoom) {
      aiBudget += economicBoom.value || 2;
      playAiSupportCard(economicBoom);
      supportPlayed = true;
      continue;
    }

    const humanCapital = getSupport('human_capital_passive');
    if (humanCapital && !aiHumanCapitalActive && aiBudget >= humanCapital.cost) {
      const hasRelevantInfra = aiHand.some(card => card.type === 'infrastructure' && (card.name === 'Public Hospital' || card.name === 'Public School'));
      const retroDp = aiSlots.filter(slot => slot && slot.status === 'built' && slot.buildType === 'honest' && (slot.name === 'Public Hospital' || slot.name === 'Public School')).length;
      if (hasRelevantInfra || retroDp > 0) {
        aiHumanCapitalActive = true;
        aiDP += retroDp;
        playAiSupportCard(humanCapital, retroDp > 0 ? `${humanCapital.description} AI gained +${retroDp} retroactive DP.` : humanCapital.description);
        supportPlayed = true;
        continue;
      }
    }

    const greenSubsidy = getSupport('green_subsidy_passive');
    if (greenSubsidy && !aiGreenSubsidyActive && aiBudget >= greenSubsidy.cost) {
      const greenNames = ['Power Grid', 'Water Facility', 'Transit System'];
      const hasRelevantInfra = aiHand.some(card => card.type === 'infrastructure' && greenNames.includes(card.name));
      const retroDp = aiSlots.filter(slot => slot && slot.status === 'built' && slot.buildType === 'honest' && greenNames.includes(slot.name)).length;
      if (hasRelevantInfra || retroDp > 0) {
        aiGreenSubsidyActive = true;
        aiDP += retroDp;
        playAiSupportCard(greenSubsidy, retroDp > 0 ? `${greenSubsidy.description} AI gained +${retroDp} retroactive DP.` : greenSubsidy.description);
        supportPlayed = true;
        continue;
      }
    }

    const honestDiscount = getSupport('honest_discount');
    if (honestDiscount && hasInfraInHand() && aiNextHonestDiscount === 0 && aiBudget >= 2) {
      aiNextHonestDiscount += 1;
      playAiSupportCard(honestDiscount);
      supportPlayed = true;
    }
  }

  if (playerTrust <= 0) {
    return {
      ...state,
      publicTrust: playerTrust,
      aiBudget: Math.min(10, aiBudget),
      aiTrust,
      aiDP,
      aiHand,
      aiSlots,
      aiCorrupted,
      aiCorruptedAtTurn,
      aiDeck,
      aiDrawCounters,
      aiNextHonestDiscount,
      aiHumanCapitalActive,
      aiGreenSubsidyActive,
      aiInvestigationResult,
      turnSupportLog: getPlayerTurnSupportLog(),
      aiTurnSupportLog: aiSupportLog,
    };
  }

  if (aiDP >= state.dpWinThreshold) {
    return {
      ...state,
      publicTrust: playerTrust,
      aiBudget: Math.min(10, aiBudget),
      aiTrust,
      aiDP,
      aiHand,
      aiSlots,
      aiCorrupted,
      aiCorruptedAtTurn,
      aiDeck,
      aiDrawCounters,
      aiNextHonestDiscount,
      aiHumanCapitalActive,
      aiGreenSubsidyActive,
      aiInvestigationResult,
      turnSupportLog: getPlayerTurnSupportLog(),
      aiTurnSupportLog: aiSupportLog,
    };
  }

  // Cap AI budget at 10 after support card resolutions
  aiBudget = Math.min(10, aiBudget);

  // AI Complete Projects
  for (let i = 0; i < aiSlots.length; i++) {
    const slot = aiSlots[i];
    if (slot && slot.status === 'built' && slot.upgraded) {
      aiSlots[i] = null;
      aiSupportLog.push({ name: slot.name, description: 'AI completed a max-level project to clear space.' });
    }
  }

  const emptySlot = aiSlots.findIndex(slot => slot === null);
  const infraCards = aiHand.filter(card => card.type === 'infrastructure');

  if (emptySlot !== -1 && infraCards.length > 0) {
    const card = chooseAiInfrastructureCard(infraCards, {
      ...state,
      aiHumanCapitalActive,
      aiGreenSubsidyActive,
    });
    const chosen = chooseAiBuildType({
      card,
      aiBudget,
      aiDP,
      aiTrust,
      aiCorrupted,
      aiNextHonestDiscount,
      playerDP: state.developmentPoints,
      dpWinThreshold: state.dpWinThreshold,
      honestDp: 1 + getAiHonestDpBonus({ ...state, aiHumanCapitalActive, aiGreenSubsidyActive }, card),
    });

    if (chosen) {
      const buildCost = chosen === 'honest' ? getHonestBuildCost(card, aiNextHonestDiscount) : chosen === 'corrupt' ? card.corruptCost || 1 : 0;
      aiBudget -= buildCost;
      if (chosen === 'honest' && aiNextHonestDiscount > 0) {
        aiNextHonestDiscount -= 1;
      }
      aiHand = aiHand.filter(handCard => handCard.id !== card.id);

      const wheelPassed = !aiCorrupted || Math.random() >= 0.7;
      if (wheelPassed) {
        const builtState = completeBuild(
          { ...state, aiSlots, aiDP, aiCorrupted, aiCorruptedAtTurn, aiHumanCapitalActive, aiGreenSubsidyActive },
          card,
          chosen,
          emptySlot,
          'ai',
        );
        aiSlots = builtState.aiSlots;
        aiDP = builtState.aiDP;
        aiCorrupted = builtState.aiCorrupted;
        aiCorruptedAtTurn = builtState.aiCorruptedAtTurn;
      } else {
        aiSupportLog.push({ name: card.name, description: 'AI attempted a build while Corrupted, but the project failed.' });
      }
    }
  }

  if (aiDP >= state.dpWinThreshold) {
    return {
      ...state,
      publicTrust: playerTrust,
      aiBudget: Math.min(10, aiBudget),
      aiTrust,
      aiDP,
      aiHand,
      aiSlots,
      aiCorrupted,
      aiCorruptedAtTurn,
      aiDeck,
      aiDrawCounters,
      aiNextHonestDiscount,
      aiHumanCapitalActive,
      aiGreenSubsidyActive,
      aiInvestigationResult,
      turnSupportLog: getPlayerTurnSupportLog(),
      aiTurnSupportLog: aiSupportLog,
    };
  }

  // AI Upgrade: Prioritize if slots are full and budget allows, otherwise check 25% random chance
  const upgradableIdx = aiSlots.findIndex(slot => slot && slot.status === 'built' && !slot.upgraded);
  const slotsFull = emptySlot === -1;
  const isBuilding = aiSlots.some(slot => slot && slot.status === 'building');

  if (upgradableIdx !== -1 && aiBudget >= UPGRADE_COST) {
    const upgradeWins = aiDP + UPGRADE_DP_REWARD >= state.dpWinThreshold;
    const playerNearWin = state.developmentPoints >= state.dpWinThreshold - 1;
    if (upgradeWins || slotsFull || playerNearWin || (!isBuilding && aiBudget >= 9)) {
      aiSlots[upgradableIdx] = {
        ...aiSlots[upgradableIdx],
        upgraded: true,
        level: (aiSlots[upgradableIdx].level || 1) + 1,
      };
      aiBudget -= UPGRADE_COST;
      aiDP += UPGRADE_DP_REWARD;
      aiSupportLog.push({ name: aiSlots[upgradableIdx].name, description: 'AI upgraded an infrastructure project.' });
    }
  }

  if (aiDP >= state.dpWinThreshold) {
    return {
      ...state,
      publicTrust: playerTrust,
      aiBudget: Math.min(10, aiBudget),
      aiTrust,
      aiDP,
      aiHand,
      aiSlots,
      aiCorrupted,
      aiCorruptedAtTurn,
      aiDeck,
      aiDrawCounters,
      aiNextHonestDiscount,
      aiHumanCapitalActive,
      aiGreenSubsidyActive,
      aiInvestigationResult,
      turnSupportLog: getPlayerTurnSupportLog(),
      aiTurnSupportLog: aiSupportLog,
    };
  }

  const aiProgress = advanceBayanihan(aiSlots, aiDP);
  aiSlots = aiProgress.slots;
  aiDP = aiProgress.dp;

  return {
    ...state,
    publicTrust: playerTrust,
    aiBudget: Math.min(10, aiBudget), // Final safety check cap
    aiTrust,
    aiDP,
    aiHand,
    aiSlots,
    aiCorrupted,
    aiCorruptedAtTurn,
    aiDeck,
    aiDrawCounters,
    aiNextHonestDiscount,
    aiHumanCapitalActive,
    aiGreenSubsidyActive,
    aiInvestigationResult,
    turnSupportLog: getPlayerTurnSupportLog(),
    aiTurnSupportLog: aiSupportLog,
  };
}

function gameReducer(state, action) {
  switch (action.type) {
    case 'RESTART': {
      const fresh = createInitialState(action.payload?.dpThreshold || state.dpWinThreshold);
      return fresh;
    }

    case 'AI_START_THINKING':
      return { ...state, aiThinking: true };
    case 'AI_DONE_THINKING':
      return { ...state, aiThinking: false };
    case 'SET_DRAGGING_CARD':
      return { ...state, draggingCard: action.payload };

    case 'START_TURN': {
      if (state.phase !== 'play' || state.turnStarted) return state;

      const drawCount = state.turnNumber === 1 ? 6 : 1;
      const initialHandCategories = state.turnNumber === 1 ? ['infrastructure', 'infrastructure', 'support', 'support', 'support', 'investigation'] : null;
      const playerDraw = drawCards(state.deck, state.hand, drawCount, state.drawCounters, 'p', initialHandCategories);
      let aiDeck = state.aiDeck;
      let aiHand = state.aiHand;
      let aiDrawCounters = state.aiDrawCounters;

      if (state.turnNumber === 1) {
        const aiDraw = drawCards(aiDeck, aiHand, 6, aiDrawCounters, 'ai', initialHandCategories);
        aiDeck = aiDraw.deck;
        aiHand = aiDraw.hand;
        aiDrawCounters = aiDraw.counters;
      }

      const corruptionPenalty = getCorruptionTurnPenalty(state.isCorrupted);
      const corruptedTrust = Math.max(0, state.publicTrust - corruptionPenalty);
      const corruptedBudget = Math.min(10, Math.max(0, state.budget + 3 - corruptionPenalty));

      return checkGameOver({
        ...state,
        deck: playerDraw.deck,
        hand: playerDraw.hand,
        drawCounters: playerDraw.counters,
        aiDeck,
        aiHand,
        aiDrawCounters,
        publicTrust: corruptedTrust,
        budget: corruptedBudget,
        turnStarted: true,
        playedSupportCardsThisTurn: [],
        corruptionWheelResult: null,
        investigationResult: null,
        aiInvestigationResult: null,
        autoCleanResult: null,
        lastBuildResult: null,
      });
    }

    case 'DRAG_TO_SLOT': {
      if (state.phase !== 'play' || !state.turnStarted) return state;
      const { card, slotIndex } = action.payload;
      if (card.type !== 'infrastructure' || state.agendaSlots[slotIndex] !== null) return state;
      return { ...state, phase: 'dilemma', pendingSlotIndex: slotIndex, pendingCard: card };
    }

    case 'BUILD_HONEST':
      return prepareBuild(state, 'honest');
    case 'BUILD_CORRUPT':
      return prepareBuild(state, 'corrupt');
    case 'BUILD_BAYANIHAN':
      return prepareBuild(state, 'bayanihan');

    case 'RESOLVE_CORRUPTION_WHEEL': {
      if (state.phase !== 'corruption_wheel' || !state.pendingBuild) return state;
      const success = state.precalcWheelSuccess;
      const { card, buildType, slotIndex } = state.pendingBuild;

      if (!success) {
      return checkGameOver({
        ...state,
        phase: 'play',
        pendingBuild: null,
        precalcWheelSuccess: null,
        precalcWheelAngle: null,
        corruptionWheelResult: {
          success: false,
          effects: `Build failed. ${card.name} was not completed, the paid Budget is lost, and no DP was gained.`,
        },
        turnSupportLog: [
          ...state.turnSupportLog,
          { name: card.name, description: `Build failed. ${card.name} was not completed, the paid Budget is lost, and no DP was gained.` },
        ],
      });
      }

      const built = completeBuild(state, card, buildType, slotIndex, 'player');
      return checkGameOver({
        ...built,
        phase: 'play',
        pendingBuild: null,
        precalcWheelSuccess: null,
        precalcWheelAngle: null,
        corruptionWheelResult: {
          success: true,
          effects: `Build succeeded. ${built.lastBuildResult?.effects || `${card.name} completed.`}`,
        },
      });
    }

    case 'CANCEL_DILEMMA':
      return { ...state, phase: 'play', pendingSlotIndex: null, pendingCard: null };

    case 'UPGRADE_INFRA': {
      if (state.phase !== 'play' || !state.turnStarted) return state;
      const { slotIndex } = action.payload;
      const current = state.agendaSlots[slotIndex];
      if (!current || current.type !== 'infrastructure' || current.status !== 'built' || current.upgraded) return state;
      if (state.budget < UPGRADE_COST) return state;

      const slots = [...state.agendaSlots];
      slots[slotIndex] = { ...current, upgraded: true, level: (current.level || 1) + 1 };

      return checkGameOver({
        ...state,
        budget: state.budget - UPGRADE_COST,
        agendaSlots: slots,
        developmentPoints: state.developmentPoints + UPGRADE_DP_REWARD,
        lastBuildResult: { success: true, effects: `${current.name} upgraded. DP +${UPGRADE_DP_REWARD}.` },
        turnSupportLog: [
          ...state.turnSupportLog,
          { name: current.name, description: `${current.name} upgraded. DP +${UPGRADE_DP_REWARD}.` },
        ],
      });
    }

    case 'PLAY_SUPPORT': {
      if (state.phase !== 'play' || !state.turnStarted) return state;
      const { card } = action.payload;
      if (card.type !== 'support') return state;
      if (card.effect === 'investigation' && state.playedSupportCardsThisTurn?.includes('investigation')) return state;
      if (card.cost > 0 && state.budget < card.cost) return state;

      let budget = state.budget - (card.cost || 0);
      let publicTrust = state.publicTrust;
      let aiTrust = state.aiTrust;
      let isCorrupted = state.isCorrupted;
      let nextHonestDiscount = state.nextHonestDiscount;
      let humanCapitalActive = state.humanCapitalActive;
      let greenSubsidyActive = state.greenSubsidyActive;
      let developmentPoints = state.developmentPoints;
      let playedSupportCardsThisTurn = [...(state.playedSupportCardsThisTurn || [])];
      let investigationResult = null;
      let autoCleanResult = null;
      let supportLogDesc = card.description;

      playedSupportCardsThisTurn.push(card.effect);

      switch (card.effect) {
        case 'budget_boost':
          budget += card.value || 2;
          break;
        case 'honest_discount':
          nextHonestDiscount += 1;
          break;
        case 'human_capital_passive': {
          humanCapitalActive = true;
          let extra = 0;
          state.agendaSlots.forEach(slot => {
            if (slot && slot.status === 'built' && slot.buildType === 'honest' && (slot.name === 'Public Hospital' || slot.name === 'Public School')) {
              extra += 1;
            }
          });
          if (extra > 0) {
            developmentPoints += extra;
            supportLogDesc = `${card.description} (Retroactively gained +${extra} DP)`;
          }
          break;
        }
        case 'green_subsidy_passive': {
          greenSubsidyActive = true;
          let extra = 0;
          state.agendaSlots.forEach(slot => {
            if (slot && slot.status === 'built' && slot.buildType === 'honest' && ['Power Grid', 'Water Facility', 'Transit System'].includes(slot.name)) {
              extra += 1;
            }
          });
          if (extra > 0) {
            developmentPoints += extra;
            supportLogDesc = `${card.description} (Retroactively gained +${extra} DP)`;
          }
          break;
        }
        case 'investigation':
          if (state.aiCorrupted) {
            aiTrust = Math.max(0, aiTrust - 2);
            budget += 3;
            investigationResult = {
              corrupted: true,
              effects: 'Opponent is Corrupted. Opponent Trust -2. You gained +3 Budget.',
            };
          } else {
            investigationResult = {
              corrupted: false,
              effects: 'Opponent is Clean. No penalty or reward applied.',
            };
          }
          break;
        case 'auto_clean':
          isCorrupted = false;
          autoCleanResult = { effects: 'Corruption removed. You are now Clean.' };
          break;
      }

      budget = Math.min(10, budget);

      return checkGameOver({
        ...state,
        hand: state.hand.filter(handCard => handCard.id !== card.id),
        budget,
        publicTrust,
        aiTrust,
        developmentPoints,
        isCorrupted,
        corruptedAtTurn: isCorrupted ? state.corruptedAtTurn : null,
        nextHonestDiscount,
        humanCapitalActive,
        greenSubsidyActive,
        playedSupportCardsThisTurn,
        investigationResult,
        autoCleanResult,
        lastBuildResult: null,
        turnSupportLog: [...state.turnSupportLog, { name: card.name, description: supportLogDesc }],
        draggingCard: null,
      });
    }

    case 'END_TURN': {
      if (!state.turnStarted && state.phase !== 'play') return state;

      const playerProgress = advanceBayanihan(state.agendaSlots, state.developmentPoints);
      let nextState = {
        ...state,
        agendaSlots: playerProgress.slots,
        developmentPoints: playerProgress.dp,
      };

      nextState = checkGameOver(nextState);
      if (nextState.phase === 'gameover') return nextState;

      nextState = runAiTurn(nextState);
      nextState = {
        ...nextState,
        turnNumber: state.turnNumber + 1,
        turnStarted: false,
        phase: 'play',
        investigationResult: null,
        autoCleanResult: null,
        lastBuildResult: null,
      };

      return checkGameOver(nextState);
    }



    case 'COMPLETE_PROJECT': {
      const { slotIndex, isAI } = action.payload;
      const slotsKey = isAI ? 'aiSlots' : 'agendaSlots';
      const newSlots = [...state[slotsKey]];
      
      const cardToComplete = newSlots[slotIndex];
      if (!cardToComplete || cardToComplete.status !== 'built' || !cardToComplete.upgraded) {
        return state; // Can only complete fully upgraded projects
      }

      // Clear the slot, the DP is already permanently stored in developmentPoints / aiDP
      newSlots[slotIndex] = null;

      return {
        ...state,
        [slotsKey]: newSlots
      };
    }

    default:
      return state;
  }
}

export function GameProvider({ children, dpThreshold = 5, onRestart }) {
  const [state, dispatch] = useReducer(gameReducer, dpThreshold, createInitialState);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);
  const aiThinkingRef = useRef(null);

  const showToast = useCallback((msg, type = 'error') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    const id = Date.now();
    setToast({ msg, type, id });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 4000);
  }, []);

  const startTurn = () => {
    if (state.hand.length >= 12) {
      showToast('Hand is full (12/12)! No card drawn.', 'error');
    }
    const corruptionPenalty = getCorruptionTurnPenalty(state.isCorrupted);
    const income = Math.max(0, 3 - corruptionPenalty);
    if (state.budget + income > 10) {
      showToast('Budget capped at maximum of 10!', 'info');
    }
    dispatch({ type: 'START_TURN' });
  };
  const endTurn = useCallback(() => {
    dispatch({ type: 'AI_START_THINKING' });
    const delay = 1800 + Math.random() * 1200;
    if (aiThinkingRef.current) clearTimeout(aiThinkingRef.current);
    aiThinkingRef.current = setTimeout(() => {
      dispatch({ type: 'AI_DONE_THINKING' });
      dispatch({ type: 'END_TURN' });
      aiThinkingRef.current = null;
    }, delay);
  }, []);

  const [volume, setVolumeState] = useState(() => {
    const saved = localStorage.getItem('musicVolume');
    return saved !== null ? parseFloat(saved) : 0.5;
  });

  const [sfxVolume, setSfxVolumeState] = useState(() => {
    const saved = localStorage.getItem('sfxVolume');
    return saved !== null ? parseFloat(saved) : 0.78;
  });

  const changeVolume = (val) => {
    setVolumeState(val);
    localStorage.setItem('musicVolume', val);
  };

  const changeSfxVolume = (val) => {
    setSfxVolumeState(val);
    localStorage.setItem('sfxVolume', val);
  };

  const restart = () => {
    if (aiThinkingRef.current) clearTimeout(aiThinkingRef.current);
    if (onRestart) {
      onRestart();
    } else {
      dispatch({ type: 'RESTART' });
    }
  };

  const value = {
    state,
    dispatch,
    showToast,
    toast,
    volume,
    changeVolume,
    sfxVolume,
    changeSfxVolume,
    startTurn,
    endTurn,
    restart,
    dragToSlot: (card, slotIndex) => dispatch({ type: 'DRAG_TO_SLOT', payload: { card, slotIndex } }),
    buildHonest: () => dispatch({ type: 'BUILD_HONEST' }),
    buildCorrupt: () => dispatch({ type: 'BUILD_CORRUPT' }),
    buildBayanihan: () => dispatch({ type: 'BUILD_BAYANIHAN' }),
    resolveCorruptionWheel: () => dispatch({ type: 'RESOLVE_CORRUPTION_WHEEL' }),
    cancelDilemma: () => dispatch({ type: 'CANCEL_DILEMMA' }),
    upgradeInfrastructure: (slotIndex) => dispatch({ type: 'UPGRADE_INFRA', payload: { slotIndex } }),
    completeProject: (slotIndex, isAI = false) => dispatch({ type: 'COMPLETE_PROJECT', payload: { slotIndex, isAI } }),

    playSupport: (card) => {
      if (card.effect === 'auto_clean') {
        if (!state.isCorrupted) {
          showToast('You are not Corrupted, so Auto Clean has no effect.');
          return;
        }
        if (state.turnNumber < state.corruptedAtTurn + 2) {
          showToast(`You must wait 2 turns after being Corrupted to use Auto Clean. (Available on turn ${state.corruptedAtTurn + 2})`);
          return;
        }
      }

      if (card.effect === 'investigation' && state.playedSupportCardsThisTurn?.includes('investigation')) {
        showToast('You can only use Investigation once per turn.');
        return;
      }

      if (state.playedSupportCardsThisTurn && state.playedSupportCardsThisTurn.includes(card.effect)) {
        showToast('You can only play one of each support card type per turn.');
        return;
      }

      if (card.cost > 0 && state.budget < card.cost) {
        showToast('Not enough budget!', 'error');
        return;
      }

      // Check budget cap warning
      if (card.effect === 'budget_boost') {
        const added = card.value || 2;
        if (state.budget - (card.cost || 0) + added > 10) {
          showToast('Budget capped at maximum of 10!', 'info');
        }
      } else if (card.effect === 'investigation') {
        if (state.aiCorrupted) {
          if (state.budget - (card.cost || 0) + 3 > 10) {
            showToast('Budget capped at maximum of 10!', 'info');
          }
        }
      }

      dispatch({ type: 'PLAY_SUPPORT', payload: { card } });
    },
    playAction: () => {},
    setDraggingCard: (card) => dispatch({ type: 'SET_DRAGGING_CARD', payload: card }),
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
}
