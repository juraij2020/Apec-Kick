import { SoccerCard, Formation } from '../types/card';

export interface PlayerChemistryResult {
  cardId: string;
  chemistry: number; // 0 to 3
  isOutOfPosition: boolean;
}

export interface SquadChemistrySummary {
  totalChemistry: number; // 0 to 33
  averageRating: number;
  attackRating: number;
  midfieldRating: number;
  defenseRating: number;
  playerChem: { [cardId: string]: PlayerChemistryResult };
}

export function calculateSquadChemistry(
  formation: Formation,
  slots: { [slotId: string]: string | undefined },
  cardMap: Map<string, SoccerCard>
): SquadChemistrySummary {
  const activeCardsWithSlots: { slotId: string; slotPos: string; card: SoccerCard }[] = [];

  formation.slots.forEach(slot => {
    const cardId = slots[slot.id];
    if (cardId && cardMap.has(cardId)) {
      activeCardsWithSlots.push({
        slotId: slot.id,
        slotPos: slot.position,
        card: cardMap.get(cardId)!,
      });
    }
  });

  const cards = activeCardsWithSlots.map(s => s.card);
  const playerChem: { [cardId: string]: PlayerChemistryResult } = {};

  // Count clubs, nations, leagues
  const clubCounts: { [club: string]: number } = {};
  const nationCounts: { [nation: string]: number } = {};
  const leagueCounts: { [league: string]: number } = {};

  cards.forEach(c => {
    clubCounts[c.club] = (clubCounts[c.club] || 0) + 1;
    nationCounts[c.nation] = (nationCounts[c.nation] || 0) + 1;
    leagueCounts[c.league] = (leagueCounts[c.league] || 0) + 1;
  });

  let totalChemistry = 0;

  activeCardsWithSlots.forEach(({ slotPos, card }) => {
    const isExactPos = card.position === slotPos;
    // Position flexibility (e.g. CF/ST, LM/LW, RM/RW, CM/CAM/CDM)
    const isCompatiblePos =
      isExactPos ||
      (card.position === 'ST' && slotPos === 'CF') ||
      (card.position === 'CF' && slotPos === 'ST') ||
      (card.position === 'LW' && slotPos === 'LM') ||
      (card.position === 'LM' && slotPos === 'LW') ||
      (card.position === 'RW' && slotPos === 'RM') ||
      (card.position === 'RM' && slotPos === 'RW') ||
      (['CM', 'CAM', 'CDM'].includes(card.position) && ['CM', 'CAM', 'CDM'].includes(slotPos));

    if (!isCompatiblePos) {
      playerChem[card.id] = { cardId: card.id, chemistry: 0, isOutOfPosition: true };
      return;
    }

    let chemPoints = 0;
    // Icon bonus: always gives 3 chem
    if (card.rarity === 'icon') {
      chemPoints = 3;
    } else {
      // Base link from club
      const clubMatch = clubCounts[card.club] || 0;
      if (clubMatch >= 4) chemPoints += 2;
      else if (clubMatch >= 2) chemPoints += 1;

      // Nation link
      const nationMatch = nationCounts[card.nation] || 0;
      if (nationMatch >= 5) chemPoints += 2;
      else if (nationMatch >= 2) chemPoints += 1;

      // League link
      const leagueMatch = leagueCounts[card.league] || 0;
      if (leagueMatch >= 5) chemPoints += 1;
      else if (leagueMatch >= 3) chemPoints += 1;

      // Custom card bonus link: custom cards have high adaptability!
      if (card.isCustom) {
        chemPoints += 1;
      }
    }

    // Clamp between 0 and 3
    chemPoints = Math.min(3, Math.max(0, chemPoints));
    totalChemistry += chemPoints;

    playerChem[card.id] = {
      cardId: card.id,
      chemistry: chemPoints,
      isOutOfPosition: false,
    };
  });

  // Calculate Ratings
  let avgRating = 0;
  let attRating = 0;
  let midRating = 0;
  let defRating = 0;

  if (cards.length > 0) {
    avgRating = Math.round(cards.reduce((acc, c) => acc + c.rating, 0) / cards.length);

    const attCards = cards.filter(c => ['ST', 'CF', 'LW', 'RW'].includes(c.position));
    attRating = attCards.length
      ? Math.round(attCards.reduce((acc, c) => acc + c.rating, 0) / attCards.length)
      : avgRating;

    const midCards = cards.filter(c => ['CAM', 'CM', 'CDM', 'LM', 'RM'].includes(c.position));
    midRating = midCards.length
      ? Math.round(midCards.reduce((acc, c) => acc + c.rating, 0) / midCards.length)
      : avgRating;

    const defCards = cards.filter(c => ['CB', 'LB', 'RB', 'LWB', 'RWB', 'GK'].includes(c.position));
    defRating = defCards.length
      ? Math.round(defCards.reduce((acc, c) => acc + c.rating, 0) / defCards.length)
      : avgRating;
  }

  return {
    totalChemistry: Math.min(33, totalChemistry),
    averageRating: avgRating,
    attackRating: attRating,
    midfieldRating: midRating,
    defenseRating: defRating,
    playerChem,
  };
}
