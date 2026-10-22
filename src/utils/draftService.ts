import { SoccerCard, Position, Formation } from '../types/card';
import { FORMATIONS } from '../data/formations';
import { isRaffleCard } from '../data/raffleCards';
import { calculateSquadChemistry } from './chemistry';
import {
  DraftSlot,
  DraftSquadState,
  DraftDayCondition,
  TournamentRound,
  TournamentOpponent,
  TournamentMatch,
  MatchCommentaryItem,
  TournamentCup,
} from '../types/draft';
import { RAFFLE_JUMBO_RARE_PACK } from '../data/packs';

export const DRAFT_STORAGE_KEY = 'apex_fut_draft_state_v2';
export const TOURNAMENT_STORAGE_KEY = 'apex_fut_draft_tournament_v2';

// 5 Tactical Formations available for Draft
export const DRAFT_FORMATIONS: Formation[] = [
  FORMATIONS.find((f) => f.id === '4-3-3') || FORMATIONS[0],
  FORMATIONS.find((f) => f.id === '4-4-2') || FORMATIONS[1],
  FORMATIONS.find((f) => f.id === '4-2-3-1') || FORMATIONS[2],
  FORMATIONS.find((f) => f.id === '3-5-2') || FORMATIONS[3],
  {
    id: '4-1-2-1-2',
    name: '4-1-2-1-2 (Narrow Diamond)',
    slots: [
      { id: 'gk', position: 'GK', x: 50, y: 88 },
      { id: 'lb', position: 'LB', x: 15, y: 68 },
      { id: 'cb1', position: 'CB', x: 38, y: 70 },
      { id: 'cb2', position: 'CB', x: 62, y: 70 },
      { id: 'rb', position: 'RB', x: 85, y: 68 },
      { id: 'cdm', position: 'CDM', x: 50, y: 56 },
      { id: 'cm1', position: 'CM', x: 28, y: 44 },
      { id: 'cm2', position: 'CM', x: 72, y: 44 },
      { id: 'cam', position: 'CAM', x: 50, y: 32 },
      { id: 'st1', position: 'ST', x: 36, y: 15 },
      { id: 'st2', position: 'ST', x: 64, y: 15 },
    ],
  },
];

// Default Tournament Cups
export const TOURNAMENT_CUPS: TournamentCup[] = [
  {
    id: 'champions-cup',
    name: 'Champions Draft Cup',
    tagline: 'The premier 16-team knockout showdown against global online draft contenders.',
    difficulty: 'Standard',
    icon: '🏆',
    gradient: 'from-amber-500 via-yellow-500 to-amber-600',
    championCoins: 25000,
    championPack: RAFFLE_JUMBO_RARE_PACK,
  },
  {
    id: 'apex-legends-cup',
    name: 'Apex Legends Invitational',
    tagline: 'High-intensity knockout tournament against world-class tactical managers.',
    difficulty: 'Elite',
    icon: '⚡',
    gradient: 'from-cyan-500 via-blue-600 to-indigo-700',
    championCoins: 35000,
    championPack: RAFFLE_JUMBO_RARE_PACK,
  },
  {
    id: 'continental-glory-cup',
    name: 'Continental Glory Trophy',
    tagline: 'Fast-paced knockout gauntlet testing chemistry cohesion and clutch play.',
    difficulty: 'World Class',
    icon: '🌍',
    gradient: 'from-emerald-500 via-teal-600 to-cyan-700',
    championCoins: 30000,
    championPack: RAFFLE_JUMBO_RARE_PACK,
  },
];

// Online Opponent Personas for realistic matchup immersion
export const OPPONENT_PERSONAS: TournamentOpponent[] = [
  {
    id: 'opp-1',
    name: 'Kaiser Munich XI',
    gamerTag: '@Kaiser_Munich',
    avatarSeed: 'kaiser',
    nation: 'Germany',
    nationFlag: '🇩🇪',
    badge: '⚡',
    rating: 83,
    chemistry: 27,
    formationName: '4-3-3',
    starPlayer: 'Jamal Musiala',
    playStyle: 'High-Press & Vertical Counter',
  },
  {
    id: 'opp-2',
    name: 'Joga Bonito Rio',
    gamerTag: '@JogaBonito_Rio',
    avatarSeed: 'joga',
    nation: 'Brazil',
    nationFlag: '🇧🇷',
    badge: '🌴',
    rating: 85,
    chemistry: 29,
    formationName: '4-2-3-1',
    starPlayer: 'Vinícius Jr.',
    playStyle: 'Samba Flair & Trickster Dribbling',
  },
  {
    id: 'opp-3',
    name: 'London Cannons',
    gamerTag: '@LondonCannon_04',
    avatarSeed: 'cannon',
    nation: 'England',
    nationFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    badge: '🔴',
    rating: 84,
    chemistry: 28,
    formationName: '4-3-3',
    starPlayer: 'Bukayo Saka',
    playStyle: 'Controlled Wing Overload',
  },
  {
    id: 'opp-4',
    name: 'Galáctico Elite',
    gamerTag: '@Galactico_King',
    avatarSeed: 'madrid',
    nation: 'Spain',
    nationFlag: '🇪🇸',
    badge: '👑',
    rating: 86,
    chemistry: 31,
    formationName: '4-4-2',
    starPlayer: 'Jude Bellingham',
    playStyle: 'Box-to-Box Midfield Dominance',
  },
  {
    id: 'opp-5',
    name: 'El Toro Milano',
    gamerTag: '@ElToro_Milan',
    avatarSeed: 'milano',
    nation: 'Italy',
    nationFlag: '🇮🇹',
    badge: '🔵',
    rating: 85,
    chemistry: 30,
    formationName: '3-5-2',
    starPlayer: 'Lautaro Martínez',
    playStyle: 'Direct Aerial Strike & Twin Strikers',
  },
  {
    id: 'opp-6',
    name: 'Lisbon Flair SC',
    gamerTag: '@LisbonFlair_7',
    avatarSeed: 'lisbon',
    nation: 'Portugal',
    nationFlag: '🇵🇹',
    badge: '🦅',
    rating: 84,
    chemistry: 26,
    formationName: '4-3-3',
    starPlayer: 'Rafael Leão',
    playStyle: 'Rapid Flank Breakaways',
  },
  {
    id: 'opp-7',
    name: 'Tiki-Taka Catalunya',
    gamerTag: '@TikiTaka_Barca',
    avatarSeed: 'barca',
    nation: 'Spain',
    nationFlag: '🇪🇸',
    badge: '🔵🔴',
    rating: 87,
    chemistry: 32,
    formationName: '4-3-3',
    starPlayer: 'Lamine Yamal',
    playStyle: 'Relentless Possession & Incisive Through-Balls',
  },
  {
    id: 'opp-8',
    name: 'Bavarian Machine',
    gamerTag: '@BavarianBeast',
    avatarSeed: 'bavaria',
    nation: 'Germany',
    nationFlag: '🇩🇪',
    badge: '🛡️',
    rating: 88,
    chemistry: 31,
    formationName: '4-2-3-1',
    starPlayer: 'Harry Kane',
    playStyle: 'Physical Hold-Up & Power Shooting',
  },
  {
    id: 'opp-9',
    name: 'Parisian Speed',
    gamerTag: '@ParisienSpeed',
    avatarSeed: 'paris',
    nation: 'France',
    nationFlag: '🇫🇷',
    badge: '🗼',
    rating: 87,
    chemistry: 29,
    formationName: '4-3-3',
    starPlayer: 'Bradley Barcola',
    playStyle: 'Sonic Wing Acceleration & Cutbacks',
  },
  {
    id: 'opp-10',
    name: 'Red Devil Theatre',
    gamerTag: '@RedDevil_FUT',
    avatarSeed: 'manchester',
    nation: 'England',
    nationFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    badge: '👹',
    rating: 84,
    chemistry: 27,
    formationName: '4-2-3-1',
    starPlayer: 'Bruno Fernandes',
    playStyle: 'Long-Ball Distribution & Direct Volleys',
  },
  {
    id: 'opp-11',
    name: 'Viking Thunder FC',
    gamerTag: '@VikingStriker',
    avatarSeed: 'viking',
    nation: 'Norway',
    nationFlag: '🇳🇴',
    badge: '⚡',
    rating: 88,
    chemistry: 30,
    formationName: '4-4-2',
    starPlayer: 'Erling Haaland',
    playStyle: 'Bulldozer Sprint & Venomous Finishing',
  },
  {
    id: 'opp-12',
    name: 'Oranje Clockwork',
    gamerTag: '@OranjeClockwork',
    avatarSeed: 'oranje',
    nation: 'Netherlands',
    nationFlag: '🇳🇱',
    badge: '🦁',
    rating: 86,
    chemistry: 30,
    formationName: '4-3-3',
    starPlayer: 'Virgil van Dijk',
    playStyle: 'Impenetrable Defensive Anchor',
  },
  {
    id: 'opp-13',
    name: 'Celtic Pride',
    gamerTag: '@CelticWarrior',
    avatarSeed: 'celtic',
    nation: 'Scotland',
    nationFlag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    badge: '🍀',
    rating: 83,
    chemistry: 25,
    formationName: '4-4-2',
    starPlayer: 'Callum McGregor',
    playStyle: 'High-Workrate Midfield Pressure',
  },
  {
    id: 'opp-14',
    name: 'Samba Kings FC',
    gamerTag: '@SambaSensation',
    avatarSeed: 'samba',
    nation: 'Brazil',
    nationFlag: '🇧🇷',
    badge: '⭐',
    rating: 89,
    chemistry: 32,
    formationName: '4-2-3-1',
    starPlayer: 'Neymar Jr',
    playStyle: 'Acrobatic Skill Moves & Deadly Free-Kicks',
  },
  {
    id: 'opp-15',
    name: 'Apex Grand Finalist',
    gamerTag: '@ApexGrandMaster',
    avatarSeed: 'grandmaster',
    nation: 'France',
    nationFlag: '🇫🇷',
    badge: '🏆',
    rating: 90,
    chemistry: 33,
    formationName: '4-3-3',
    starPlayer: 'Kylian Mbappé',
    playStyle: 'Endgame Pace Burst & World-Class Composure',
  },
];

/**
 * Creates empty 23 draft slots based on chosen formation:
 * - 11 Starting Pitch slots
 * - 7 Bench slots
 * - 5 Reserve slots
 */
export function initializeDraftSlots(formation: Formation): {
  startingSlots: DraftSlot[];
  benchSlots: DraftSlot[];
  reserveSlots: DraftSlot[];
} {
  const startingSlots: DraftSlot[] = formation.slots.map((slot) => ({
    id: `starting_${slot.id}`,
    label: slot.position,
    type: 'starting',
    position: slot.position,
    x: slot.x,
    y: slot.y,
  }));

  const benchPositions: Position[] = ['GK', 'CB', 'CM', 'CAM', 'LW', 'RW', 'ST'];
  const benchSlots: DraftSlot[] = benchPositions.map((pos, idx) => ({
    id: `bench_${idx}`,
    label: `SUB ${idx + 1}`,
    type: 'bench',
    position: pos,
  }));

  const reservePositions: Position[] = ['LB', 'RB', 'CDM', 'ST', 'CM'];
  const reserveSlots: DraftSlot[] = reservePositions.map((pos, idx) => ({
    id: `reserve_${idx}`,
    label: `RES ${idx + 1}`,
    type: 'reserve',
    position: pos,
  }));

  return { startingSlots, benchSlots, reserveSlots };
}

/**
 * Generates the rotating "Draft of the Day" challenge condition
 */
export function getDailyDraftCondition(date = new Date()): DraftDayCondition {
  const dayIndex = date.getUTCDay(); // 0 to 6
  const conditions: DraftDayCondition[] = [
    {
      id: 'cond_pl_stars',
      title: 'Premier League Authority',
      description: 'Draft at least 4 Premier League players in your 23-man squad.',
      rewardCoins: 5000,
      targetValue: 4,
      currentValue: 0,
      isMet: false,
      category: 'league',
    },
    {
      id: 'cond_chem_master',
      title: 'Chemistry Mastermind',
      description: 'Achieve 28 or more total starting XI chemistry.',
      rewardCoins: 5000,
      targetValue: 28,
      currentValue: 0,
      isMet: false,
      category: 'chemistry',
    },
    {
      id: 'cond_global_nations',
      title: 'Global Coalition',
      description: 'Draft players from at least 5 different nations across your squad.',
      rewardCoins: 5000,
      targetValue: 5,
      currentValue: 0,
      isMet: false,
      category: 'nation',
    },
    {
      id: 'cond_rating_elite',
      title: 'Apex Squad Rating',
      description: 'Build a starting XI with an 86 or higher average squad rating.',
      rewardCoins: 5000,
      targetValue: 86,
      currentValue: 0,
      isMet: false,
      category: 'rating',
    },
    {
      id: 'cond_laliga_master',
      title: 'La Liga Supremacy',
      description: 'Draft at least 4 La Liga players in your squad.',
      rewardCoins: 5000,
      targetValue: 4,
      currentValue: 0,
      isMet: false,
      category: 'league',
    },
    {
      id: 'cond_chem_apex',
      title: 'Maximum Synergy',
      description: 'Reach 30+ team chemistry with high tactical cohesion.',
      rewardCoins: 5000,
      targetValue: 30,
      currentValue: 0,
      isMet: false,
      category: 'chemistry',
    },
    {
      id: 'cond_icon_moment',
      title: 'Legendary Presence',
      description: 'Draft at least 2 Icons, Hall of Fame, or Throwback superstars.',
      rewardCoins: 5000,
      targetValue: 2,
      currentValue: 0,
      isMet: false,
      category: 'program',
    },
  ];

  return conditions[dayIndex] || conditions[0];
}

/**
 * Evaluates the Draft of the Day condition against current drafted squad
 */
export function evaluateDraftDayCondition(
  condition: DraftDayCondition,
  allSlots: DraftSlot[],
  startingChem: number,
  startingRating: number
): DraftDayCondition {
  const draftedCards = allSlots.map((s) => s.card).filter((c): c is SoccerCard => c !== undefined);

  let currentValue = 0;
  if (condition.id === 'cond_pl_stars') {
    currentValue = draftedCards.filter(
      (c) => c.league === 'Premier League' || c.league.toLowerCase().includes('premier')
    ).length;
  } else if (condition.id === 'cond_laliga_master') {
    currentValue = draftedCards.filter(
      (c) => c.league === 'La Liga' || c.league.toLowerCase().includes('liga')
    ).length;
  } else if (condition.id === 'cond_chem_master' || condition.id === 'cond_chem_apex') {
    currentValue = startingChem;
  } else if (condition.id === 'cond_global_nations') {
    const nationSet = new Set(draftedCards.map((c) => c.nation));
    currentValue = nationSet.size;
  } else if (condition.id === 'cond_rating_elite') {
    currentValue = startingRating;
  } else if (condition.id === 'cond_icon_moment') {
    currentValue = draftedCards.filter(
      (c) =>
        c.rarity === 'icon' ||
        c.rarity === 'hall_of_fame' ||
        c.rarity === 'throwback' ||
        c.program === 'Hall of Fame' ||
        c.program === 'Throwback'
    ).length;
  }

  return {
    ...condition,
    currentValue,
    isMet: currentValue >= condition.targetValue,
  };
}

/**
 * Calculates current Draft Squad rating & chemistry stats
 */
export function calculateDraftSquadStats(
  formation: Formation,
  startingSlots: DraftSlot[],
  benchSlots: DraftSlot[],
  reserveSlots: DraftSlot[]
): {
  rating: number;
  chemistry: number;
  attackRating: number;
  midfieldRating: number;
  defenseRating: number;
  draftedCount: number;
} {
  const cardMap = new Map<string, SoccerCard>();
  const slotMap: { [slotId: string]: string | undefined } = {};

  startingSlots.forEach((slot) => {
    const baseId = slot.id.replace('starting_', '');
    if (slot.card) {
      cardMap.set(slot.card.id, slot.card);
      slotMap[baseId] = slot.card.id;
    }
  });

  const chemSummary = calculateSquadChemistry(formation, slotMap, cardMap);

  const startingCards = startingSlots.map((s) => s.card).filter((c): c is SoccerCard => c !== undefined);
  const benchCards = benchSlots.map((s) => s.card).filter((c): c is SoccerCard => c !== undefined);
  const reserveCards = reserveSlots.map((s) => s.card).filter((c): c is SoccerCard => c !== undefined);

  const totalDrafted = startingCards.length + benchCards.length + reserveCards.length;

  const avgRating =
    startingCards.length > 0
      ? Math.round(startingCards.reduce((acc, c) => acc + c.rating, 0) / startingCards.length)
      : 0;

  return {
    rating: avgRating,
    chemistry: chemSummary.totalChemistry,
    attackRating: chemSummary.attackRating,
    midfieldRating: chemSummary.midfieldRating,
    defenseRating: chemSummary.defenseRating,
    draftedCount: totalDrafted,
  };
}

/**
 * Generates 5 diverse, high-caliber player choices for a specific slot.
 * Strictly excludes 99 OVR Daily Raffle cards and Set-Reward only cards!
 */
export function generateDraftChoices(
  slot: DraftSlot,
  pool: SoccerCard[],
  alreadyDraftedCardIds: Set<string>
): SoccerCard[] {
  // Filter out raffle cards, set-reward cards, and already drafted cards
  const eligiblePool = pool.filter(
    (c) =>
      !isRaffleCard(c) &&
      !c.isSetRewardOnly &&
      !alreadyDraftedCardIds.has(c.id) &&
      !alreadyDraftedCardIds.has(c.id.split('_inst_')[0])
  );

  const targetPos = slot.position;

  // Filter exact position cards
  const exactCandidates = eligiblePool.filter((c) => c.position === targetPos);

  // Filter compatible position cards
  const compatibleCandidates = eligiblePool.filter((c) => {
    if (c.position === targetPos) return true;
    if ((targetPos === 'ST' || targetPos === 'CF') && (c.position === 'ST' || c.position === 'CF')) return true;
    if ((targetPos === 'LW' || targetPos === 'LM') && (c.position === 'LW' || c.position === 'LM')) return true;
    if ((targetPos === 'RW' || targetPos === 'RM') && (c.position === 'RW' || c.position === 'RM')) return true;
    if (
      (targetPos === 'CM' || targetPos === 'CAM' || targetPos === 'CDM') &&
      (c.position === 'CM' || c.position === 'CAM' || c.position === 'CDM')
    )
      return true;
    if ((targetPos === 'LB' || targetPos === 'LWB') && (c.position === 'LB' || c.position === 'LWB')) return true;
    if ((targetPos === 'RB' || targetPos === 'RWB') && (c.position === 'RB' || c.position === 'RWB')) return true;
    return false;
  });

  const primaryPool = exactCandidates.length >= 5 ? exactCandidates : compatibleCandidates.length >= 5 ? compatibleCandidates : eligiblePool;

  // Tier 1: Walkout / Superstar (88+ rating)
  const eliteCandidates = primaryPool.filter((c) => c.rating >= 88);
  // Tier 2: Strong player (83-87 rating)
  const midCandidates = primaryPool.filter((c) => c.rating >= 83 && c.rating < 88);
  // Tier 3: General player (78-82 rating)
  const baseCandidates = primaryPool.filter((c) => c.rating < 83);

  const selected: SoccerCard[] = [];
  const pickedIds = new Set<string>();

  const pickOne = (candidatesList: SoccerCard[]): SoccerCard | null => {
    const available = candidatesList.filter((c) => !pickedIds.has(c.id));
    if (available.length === 0) return null;
    const chosen = available[Math.floor(Math.random() * available.length)];
    pickedIds.add(chosen.id);
    return chosen;
  };

  // Slot 1: Guaranteed marquee/walkout option (prefer 88+ or top available)
  const star = pickOne(eliteCandidates) || pickOne(midCandidates) || pickOne(primaryPool);
  if (star) selected.push(star);

  // Slot 2: High tier (83+)
  const strong = pickOne(midCandidates) || pickOne(eliteCandidates) || pickOne(primaryPool);
  if (strong) selected.push(strong);

  // Slot 3 & 4: Diverse options
  const third = pickOne(primaryPool);
  if (third) selected.push(third);

  const fourth = pickOne(primaryPool);
  if (fourth) selected.push(fourth);

  // Slot 5: Wildcard from any eligible pool
  const fifth = pickOne(eligiblePool);
  if (fifth) selected.push(fifth);

  // Fallback if needed to ensure exactly 5 choices
  while (selected.length < 5 && eligiblePool.length > selected.length) {
    const extra = pickOne(eligiblePool);
    if (extra) selected.push(extra);
    else break;
  }

  // Sort choices by rating descending
  return selected.sort((a, b) => b.rating - a.rating);
}

/**
 * Initializes a full 16-team knockout tournament bracket:
 * 8 Round of 16 matches, with user in Match 0.
 */
export function createTournamentBracket(
  userTeamName: string,
  userRating: number,
  cup: TournamentCup
): TournamentMatch[] {
  // Shuffle opponent personas
  const shuffledOpps = [...OPPONENT_PERSONAS].sort(() => 0.5 - Math.random());

  const matches: TournamentMatch[] = [];

  // Round of 16 (8 matches)
  // Match 0: User vs Opponent 1
  matches.push({
    id: 'match_r16_0',
    round: 'r16',
    roundName: 'Round of 16',
    matchIndex: 0,
    homeTeam: {
      name: userTeamName,
      gamerTag: '@You (Draft Manager)',
      badge: '👑',
      rating: userRating,
      isUser: true,
    },
    awayTeam: {
      name: shuffledOpps[0].name,
      gamerTag: shuffledOpps[0].gamerTag,
      badge: shuffledOpps[0].badge,
      rating: Math.max(78, userRating - Math.floor(Math.random() * 3) + 1),
      isUser: false,
    },
    homeScore: 0,
    awayScore: 0,
    isUserMatch: true,
    status: 'ready',
    commentaryLog: [],
  });

  // Matches 1 to 7: Bot vs Bot R16
  for (let i = 1; i < 8; i++) {
    const oppA = shuffledOpps[i];
    const oppB = shuffledOpps[i + 7] || shuffledOpps[i - 1];
    matches.push({
      id: `match_r16_${i}`,
      round: 'r16',
      roundName: 'Round of 16',
      matchIndex: i,
      homeTeam: {
        name: oppA.name,
        gamerTag: oppA.gamerTag,
        badge: oppA.badge,
        rating: oppA.rating,
        isUser: false,
      },
      awayTeam: {
        name: oppB.name,
        gamerTag: oppB.gamerTag,
        badge: oppB.badge,
        rating: oppB.rating,
        isUser: false,
      },
      homeScore: 0,
      awayScore: 0,
      isUserMatch: false,
      status: 'ready',
      commentaryLog: [],
    });
  }

  // Quarter-Finals (4 upcoming matches)
  for (let i = 0; i < 4; i++) {
    matches.push({
      id: `match_qf_${i}`,
      round: 'qf',
      roundName: 'Quarter-Finals',
      matchIndex: i,
      homeTeam: {
        name: i === 0 ? 'Winner Match 1' : `Winner Match ${i * 2 + 1}`,
        badge: '⚽',
        rating: 84,
        isUser: i === 0,
      },
      awayTeam: {
        name: `Winner Match ${i * 2 + 2}`,
        badge: '⚽',
        rating: 84,
        isUser: false,
      },
      homeScore: 0,
      awayScore: 0,
      isUserMatch: i === 0,
      status: 'upcoming',
      commentaryLog: [],
    });
  }

  // Semi-Finals (2 upcoming matches)
  for (let i = 0; i < 2; i++) {
    matches.push({
      id: `match_sf_${i}`,
      round: 'sf',
      roundName: 'Semi-Finals',
      matchIndex: i,
      homeTeam: {
        name: i === 0 ? 'Winner QF 1' : 'Winner QF 3',
        badge: '🔥',
        rating: 86,
        isUser: i === 0,
      },
      awayTeam: {
        name: i === 0 ? 'Winner QF 2' : 'Winner QF 4',
        badge: '🔥',
        rating: 86,
        isUser: false,
      },
      homeScore: 0,
      awayScore: 0,
      isUserMatch: i === 0,
      status: 'upcoming',
      commentaryLog: [],
    });
  }

  // The Grand Final (1 upcoming match)
  matches.push({
    id: 'match_final_0',
    round: 'final',
    roundName: 'The Grand Final',
    matchIndex: 0,
    homeTeam: {
      name: 'Winner SF 1',
      badge: '🏆',
      rating: 88,
      isUser: true,
    },
    awayTeam: {
      name: 'Winner SF 2',
      badge: '🏆',
      rating: 88,
      isUser: false,
    },
    homeScore: 0,
    awayScore: 0,
    isUserMatch: true,
    status: 'upcoming',
    commentaryLog: [],
  });

  return matches;
}

/**
 * Simulates minute-by-minute commentary and goals for a tournament match.
 * Generates an engaging, fast-paced play-by-play narrative with scorers and clutch moments!
 */
export function simulateFullMatchEvents(
  userTeamName: string,
  userCards: SoccerCard[],
  userRating: number,
  userChem: number,
  oppName: string,
  oppGamerTag: string,
  oppRating: number
): {
  homeScore: number;
  awayScore: number;
  events: MatchCommentaryItem[];
  winnerTeamName: string;
} {
  const events: MatchCommentaryItem[] = [];

  // Determine scoring probabilities based on rating delta + chemistry boost
  const chemBoost = (userChem - 20) * 0.15; // +0 to +2 rating equivalent
  const effectiveUserRating = userRating + chemBoost;
  const ratingDelta = effectiveUserRating - oppRating;

  // Strikers / key scorers
  const userStrikers = userCards.filter((c) => ['ST', 'CF', 'LW', 'RW'].includes(c.position));
  const userMidfielders = userCards.filter((c) => ['CAM', 'CM', 'LM', 'RM'].includes(c.position));
  const primaryAttackers = userStrikers.length > 0 ? userStrikers : userCards.slice(0, 5);

  const getRandomScorer = (): string => {
    const pool = primaryAttackers.length > 0 ? primaryAttackers : userCards;
    return pool[Math.floor(Math.random() * pool.length)]?.name || 'Your Striker';
  };

  const oppStars = [
    'Vinícius Jr.',
    'Erling Haaland',
    'Kylian Mbappé',
    'Jude Bellingham',
    'Harry Kane',
    'Bukayo Saka',
    'Jamal Musiala',
    'Rafael Leão',
  ];
  const getOppScorer = (): string => oppStars[Math.floor(Math.random() * oppStars.length)];

  // Kickoff
  events.push({
    id: `ev_0`,
    minute: 1,
    text: `Referee blows the whistle! ${userTeamName} kicks off against ${oppGamerTag} in this high-stakes knockout clash!`,
    type: 'chance',
    team: 'user',
  });

  let userGoals = 0;
  let oppGoals = 0;

  // Simulated match minutes checkpoints
  const minutes = [8, 17, 26, 35, 44, 45, 52, 61, 70, 79, 87, 90];

  minutes.forEach((min) => {
    if (min === 45) {
      events.push({
        id: `ev_ht_${min}`,
        minute: 45,
        text: `HALF TIME: Intense tactical chess! Score stands at ${userTeamName} ${userGoals} - ${oppGoals} ${oppName}.`,
        type: 'half_time',
        team: 'user',
      });
      return;
    }

    const roll = Math.random();

    // Goal chance roll
    if (roll < 0.32) {
      // User scoring chance favored by rating delta
      const userScoringChance = 0.5 + ratingDelta * 0.04;
      if (Math.random() < userScoringChance) {
        userGoals++;
        const scorer = getRandomScorer();
        const assists = userMidfielders.length > 0 ? userMidfielders[Math.floor(Math.random() * userMidfielders.length)].name : 'midfield';
        events.push({
          id: `ev_${min}`,
          minute: min,
          text: `⚽ GOAAAL! ${scorer} breaks through the defensive line with laser precision after a sublime pass from ${assists}!`,
          type: 'goal',
          team: 'user',
          actor: scorer,
        });
      } else {
        oppGoals++;
        const scorer = getOppScorer();
        events.push({
          id: `ev_${min}`,
          minute: min,
          text: `⚠️ GOAL for ${oppGamerTag}! ${scorer} curls a venomous strike into the top corner on the counter!`,
          type: 'goal',
          team: 'opp',
          actor: scorer,
        });
      }
    } else if (roll < 0.55) {
      // Magnificent Save or Woodwork
      const isUserAction = Math.random() < 0.5;
      if (isUserAction) {
        events.push({
          id: `ev_${min}`,
          minute: min,
          text: `🧤 WHAT A SAVE! The opponent goalkeeper leaps acrobatically to tip ${getRandomScorer()}'s thunderous volley over the bar!`,
          type: 'save',
          team: 'user',
        });
      } else {
        events.push({
          id: `ev_${min}`,
          minute: min,
          text: `🧱 CLUTCH DEFENSE! Your backline makes an iron sliding challenge inside the penalty box to deny ${getOppScorer()}!`,
          type: 'save',
          team: 'opp',
        });
      }
    } else if (roll < 0.72) {
      // Woodwork hit or narrow miss
      events.push({
        id: `ev_${min}`,
        minute: min,
        text: `💥 RATTLED THE WOODWORK! A fierce dipping shot smashes off the crossbar! The crowd gasps!`,
        type: 'woodwork',
        team: Math.random() < 0.5 ? 'user' : 'opp',
      });
    } else if (roll < 0.88) {
      // Tactical Foul / Yellow Card
      events.push({
        id: `ev_${min}`,
        minute: min,
        text: `🟨 Cynical tactical foul in the center circle to stop a dangerous breakaway! Yellow card shown.`,
        type: 'card_yellow',
        team: Math.random() < 0.5 ? 'user' : 'opp',
      });
    }
  });

  // Guarantee no draw in knockout! If tied at 90', resolve via dramatic extra-time / penalty
  if (userGoals === oppGoals) {
    const suddenDeathWin = Math.random() < 0.55 + ratingDelta * 0.05;
    if (suddenDeathWin) {
      userGoals++;
      const hero = getRandomScorer();
      events.push({
        id: `ev_94`,
        minute: 94,
        text: `🔥 EXTRA TIME WINNER! ${hero} scores a breathtaking clutch 94th-minute tap-in to seal the victory!`,
        type: 'goal',
        team: 'user',
        actor: hero,
      });
    } else {
      oppGoals++;
      const oppHero = getOppScorer();
      events.push({
        id: `ev_94`,
        minute: 94,
        text: `💔 Heartbreak in stoppage time! ${oppHero} slots home on the breakaway to steal the lead.`,
        type: 'goal',
        team: 'opp',
        actor: oppHero,
      });
    }
  }

  // Final whistle
  events.push({
    id: `ev_ft`,
    minute: 90,
    text: `FINAL WHISTLE! Match ends: ${userTeamName} ${userGoals} - ${oppGoals} ${oppName}!`,
    type: 'full_time',
    team: userGoals > oppGoals ? 'user' : 'opp',
  });

  const winnerTeamName = userGoals > oppGoals ? userTeamName : oppName;

  return {
    homeScore: userGoals,
    awayScore: oppGoals,
    events,
    winnerTeamName,
  };
}

/**
 * Advances the knockout bracket:
 * Resolves remaining bot vs bot matches, assigns winners to next round matches,
 * and unlocks the user's next matchup.
 */
export function advanceTournamentBracket(
  currentMatches: TournamentMatch[],
  currentRound: TournamentRound,
  userWon: boolean,
  userScore: number,
  oppScore: number,
  userTeamName: string,
  userRating: number
): {
  updatedMatches: TournamentMatch[];
  nextRound: TournamentRound;
  isEliminated: boolean;
  isChampion: boolean;
} {
  const matches = [...currentMatches];

  // 1. Update User's match in current round
  const userMatchIndex = matches.findIndex((m) => m.round === currentRound && m.isUserMatch);
  if (userMatchIndex !== -1) {
    matches[userMatchIndex] = {
      ...matches[userMatchIndex],
      homeScore: userScore,
      awayScore: oppScore,
      winnerTeamName: userWon ? userTeamName : matches[userMatchIndex].awayTeam.name,
      status: 'completed',
    };
  }

  // 2. Resolve all uncompleted bot matches in current round
  const botMatchesInRound = matches.filter((m) => m.round === currentRound && !m.isUserMatch);
  botMatchesInRound.forEach((m) => {
    const idx = matches.findIndex((match) => match.id === m.id);
    if (idx !== -1 && matches[idx].status !== 'completed') {
      const scoreA = Math.floor(Math.random() * 3) + (m.homeTeam.rating > m.awayTeam.rating ? 1 : 0);
      let scoreB = Math.floor(Math.random() * 3);
      if (scoreA === scoreB) scoreB = Math.random() < 0.5 ? scoreA + 1 : Math.max(0, scoreA - 1);

      const winner = scoreA > scoreB ? m.homeTeam : m.awayTeam;
      matches[idx] = {
        ...matches[idx],
        homeScore: scoreA,
        awayScore: scoreB,
        winnerTeamName: winner.name,
        status: 'completed',
      };
    }
  });

  if (!userWon) {
    return {
      updatedMatches: matches,
      nextRound: currentRound,
      isEliminated: true,
      isChampion: false,
    };
  }

  // 3. Advance User and Bot Winners into next round
  if (currentRound === 'r16') {
    // QF 0 is User match
    const qfUserMatchIdx = matches.findIndex((m) => m.id === 'match_qf_0');
    const r16Match1Winner = matches.find((m) => m.id === 'match_r16_1')?.winnerTeamName || 'Opponent QF';
    const r16Match1Team = matches.find((m) => m.id === 'match_r16_1')?.homeTeam.name === r16Match1Winner
      ? matches.find((m) => m.id === 'match_r16_1')?.homeTeam
      : matches.find((m) => m.id === 'match_r16_1')?.awayTeam;

    if (qfUserMatchIdx !== -1) {
      matches[qfUserMatchIdx] = {
        ...matches[qfUserMatchIdx],
        homeTeam: {
          name: userTeamName,
          gamerTag: '@You (Draft Manager)',
          badge: '👑',
          rating: userRating,
          isUser: true,
        },
        awayTeam: {
          name: r16Match1Winner,
          gamerTag: r16Match1Team?.gamerTag || '@EliteChallenger',
          badge: r16Match1Team?.badge || '⚡',
          rating: Math.max(83, userRating + Math.floor(Math.random() * 3) - 1),
          isUser: false,
        },
        status: 'ready',
      };
    }

    // QF 1, 2, 3 Bot Matchups
    for (let i = 1; i < 4; i++) {
      const qfIdx = matches.findIndex((m) => m.id === `match_qf_${i}`);
      const winA = matches.find((m) => m.id === `match_r16_${i * 2}`)?.winnerTeamName || `Team ${i * 2}`;
      const winB = matches.find((m) => m.id === `match_r16_${i * 2 + 1}`)?.winnerTeamName || `Team ${i * 2 + 1}`;
      if (qfIdx !== -1) {
        matches[qfIdx] = {
          ...matches[qfIdx],
          homeTeam: { name: winA, badge: '⚽', rating: 85, isUser: false },
          awayTeam: { name: winB, badge: '⚽', rating: 85, isUser: false },
          status: 'ready',
        };
      }
    }

    return {
      updatedMatches: matches,
      nextRound: 'qf',
      isEliminated: false,
      isChampion: false,
    };
  }

  if (currentRound === 'qf') {
    // SF 0 is User match
    const sfUserMatchIdx = matches.findIndex((m) => m.id === 'match_sf_0');
    const qfMatch1Winner = matches.find((m) => m.id === 'match_qf_1')?.winnerTeamName || 'Semi-Finalist';
    const qfMatch1Team = matches.find((m) => m.id === 'match_qf_1')?.homeTeam.name === qfMatch1Winner
      ? matches.find((m) => m.id === 'match_qf_1')?.homeTeam
      : matches.find((m) => m.id === 'match_qf_1')?.awayTeam;

    if (sfUserMatchIdx !== -1) {
      matches[sfUserMatchIdx] = {
        ...matches[sfUserMatchIdx],
        homeTeam: {
          name: userTeamName,
          gamerTag: '@You (Draft Manager)',
          badge: '👑',
          rating: userRating,
          isUser: true,
        },
        awayTeam: {
          name: qfMatch1Winner,
          gamerTag: qfMatch1Team?.gamerTag || '@SemifinalTitan',
          badge: qfMatch1Team?.badge || '🔥',
          rating: Math.max(86, userRating + Math.floor(Math.random() * 3)),
          isUser: false,
        },
        status: 'ready',
      };
    }

    // SF 1 Bot Matchup
    const sf1Idx = matches.findIndex((m) => m.id === 'match_sf_1');
    const winA = matches.find((m) => m.id === 'match_qf_2')?.winnerTeamName || 'Team QF2';
    const winB = matches.find((m) => m.id === 'match_qf_3')?.winnerTeamName || 'Team QF3';
    if (sf1Idx !== -1) {
      matches[sf1Idx] = {
        ...matches[sf1Idx],
        homeTeam: { name: winA, badge: '🔥', rating: 87, isUser: false },
        awayTeam: { name: winB, badge: '🔥', rating: 87, isUser: false },
        status: 'ready',
      };
    }

    return {
      updatedMatches: matches,
      nextRound: 'sf',
      isEliminated: false,
      isChampion: false,
    };
  }

  if (currentRound === 'sf') {
    // Final is User match
    const finalMatchIdx = matches.findIndex((m) => m.id === 'match_final_0');
    const sf1Winner = matches.find((m) => m.id === 'match_sf_1')?.winnerTeamName || 'Apex Finalist';
    const sf1Team = matches.find((m) => m.id === 'match_sf_1')?.homeTeam.name === sf1Winner
      ? matches.find((m) => m.id === 'match_sf_1')?.homeTeam
      : matches.find((m) => m.id === 'match_sf_1')?.awayTeam;

    if (finalMatchIdx !== -1) {
      matches[finalMatchIdx] = {
        ...matches[finalMatchIdx],
        homeTeam: {
          name: userTeamName,
          gamerTag: '@You (Draft Manager)',
          badge: '👑',
          rating: userRating,
          isUser: true,
        },
        awayTeam: {
          name: sf1Winner,
          gamerTag: sf1Team?.gamerTag || '@GrandFinalBoss',
          badge: sf1Team?.badge || '🏆',
          rating: Math.max(88, userRating + 2),
          isUser: false,
        },
        status: 'ready',
      };
    }

    return {
      updatedMatches: matches,
      nextRound: 'final',
      isEliminated: false,
      isChampion: false,
    };
  }

  // Won the Grand Final!
  return {
    updatedMatches: matches,
    nextRound: 'final',
    isEliminated: false,
    isChampion: true,
  };
}
