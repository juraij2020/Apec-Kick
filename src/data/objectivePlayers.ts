import { SoccerCard } from '../types/card';

/**
 * 100% EXCLUSIVE DAILY OBJECTIVE REWARD PLAYERS
 * 
 * CRITICAL RULE: These players are EXCLUSIVELY awarded by completing all 5 Daily Objectives
 * on designated 'Player Reward' days.
 * 
 * They MUST NEVER be added to packs, transfer market packs, or random drops.
 * If a player day passes without claiming, the player expires forever.
 */
export const EXCLUSIVE_OBJECTIVE_PLAYERS: SoccerCard[] = [
  {
    id: 'obj-rafael-leao-93',
    name: 'Rafael Leão',
    shortName: 'R. Leão',
    rating: 93,
    position: 'LW',
    nation: 'Portugal',
    nationFlag: '🇵🇹',
    club: 'AC Milan',
    league: 'Serie A',
    rarity: 'objective_exclusive',
    cardStyle: 'objective_obsidian_gold',
    photoUrl: '🏄‍♂️',
    program: 'Daily Objectives Exclusive',
    stats: {
      pac: 96,
      sho: 91,
      pas: 88,
      dri: 95,
      def: 42,
      phy: 86,
    },
    weakFoot: 4,
    skillMoves: 5,
    workRate: 'High / Medium',
    price: 450000,
    playStylePlus: {
      id: 'quick_step',
      name: 'Quick Step+',
      shortDesc: 'Explosive acceleration burst off the dribble',
      iconSymbol: '⚡',
      statBoost: { attribute: 'pac', bonus: 12 },
    },
    metaDescription: 'Objective Exclusive Milestone: Blistering sprint pace with 5-star skill moves.'
  },
  {
    id: 'obj-federico-valverde-93',
    name: 'Federico Valverde',
    shortName: 'F. Valverde',
    rating: 93,
    position: 'CM',
    nation: 'Uruguay',
    nationFlag: '🇺🇾',
    club: 'Real Madrid',
    league: 'La Liga',
    rarity: 'objective_exclusive',
    cardStyle: 'objective_obsidian_gold',
    photoUrl: '🦅',
    program: 'Daily Objectives Exclusive',
    stats: {
      pac: 91,
      sho: 90,
      pas: 92,
      dri: 89,
      def: 86,
      phy: 91,
    },
    weakFoot: 4,
    skillMoves: 4,
    workRate: 'High / High',
    price: 490000,
    playStylePlus: {
      id: 'relentless',
      name: 'Relentless+',
      shortDesc: 'Iron stamina engine with clutch box-to-box dominance',
      iconSymbol: '🔋',
      statBoost: { attribute: 'phy', bonus: 14 },
    },
    metaDescription: 'Objective Exclusive Milestone: The tireless box-to-box engine.'
  },
  {
    id: 'obj-xavi-simons-92',
    name: 'Xavi Simons',
    shortName: 'X. Simons',
    rating: 92,
    position: 'CAM',
    nation: 'Netherlands',
    nationFlag: '🇳🇱',
    club: 'RB Leipzig',
    league: 'Bundesliga',
    rarity: 'objective_exclusive',
    cardStyle: 'objective_obsidian_gold',
    photoUrl: '🦁',
    program: 'Daily Objectives Exclusive',
    stats: {
      pac: 92,
      sho: 89,
      pas: 93,
      dri: 94,
      def: 56,
      phy: 80,
    },
    weakFoot: 5,
    skillMoves: 5,
    workRate: 'High / Medium',
    price: 420000,
    playStylePlus: {
      id: 'technical',
      name: 'Technical+',
      shortDesc: 'Razor-close precision acceleration and ball manipulation',
      iconSymbol: '🪄',
      statBoost: { attribute: 'dri', bonus: 15 },
    },
    metaDescription: 'Objective Exclusive Milestone: Dutch maestro with 5-star double skills.'
  },
  {
    id: 'obj-takehiro-tomiyasu-91',
    name: 'Takehiro Tomiyasu',
    shortName: 'T. Tomiyasu',
    rating: 91,
    position: 'CB',
    nation: 'Japan',
    nationFlag: '🇯🇵',
    club: 'Arsenal',
    league: 'Premier League',
    rarity: 'objective_exclusive',
    cardStyle: 'objective_obsidian_gold',
    photoUrl: '🛡️',
    program: 'Daily Objectives Exclusive',
    stats: {
      pac: 87,
      sho: 58,
      pas: 84,
      dri: 83,
      def: 93,
      phy: 90,
    },
    weakFoot: 5,
    skillMoves: 3,
    workRate: 'Medium / High',
    price: 360000,
    playStylePlus: {
      id: 'anticipate',
      name: 'Anticipate+',
      shortDesc: 'Flawless standing tackles and defensive intercept range',
      iconSymbol: '🛑',
      statBoost: { attribute: 'def', bonus: 15 },
    },
    metaDescription: 'Objective Exclusive Milestone: Two-footed defensive fortress.'
  },
  {
    id: 'obj-tariq-lamptey-91',
    name: 'Tariq Lamptey',
    shortName: 'T. Lamptey',
    rating: 91,
    position: 'RB',
    nation: 'Ghana',
    nationFlag: '🇬🇭',
    club: 'Brighton',
    league: 'Premier League',
    rarity: 'objective_exclusive',
    cardStyle: 'objective_obsidian_gold',
    photoUrl: '🚀',
    program: 'Daily Objectives Exclusive',
    stats: {
      pac: 98,
      sho: 75,
      pas: 85,
      dri: 91,
      def: 86,
      phy: 84,
    },
    weakFoot: 4,
    skillMoves: 4,
    workRate: 'High / High',
    price: 380000,
    playStylePlus: {
      id: 'rapid',
      name: 'Rapid+',
      shortDesc: 'Supersonic sprint down the wing without losing velocity',
      iconSymbol: '⚡',
      statBoost: { attribute: 'pac', bonus: 14 },
    },
    metaDescription: 'Objective Exclusive Milestone: 98 Pace speedster.'
  },
  {
    id: 'obj-adama-traore-92',
    name: 'Adama Traoré',
    shortName: 'A. Traoré',
    rating: 92,
    position: 'RW',
    nation: 'Spain',
    nationFlag: '🇪🇸',
    club: 'Fulham',
    league: 'Premier League',
    rarity: 'objective_exclusive',
    cardStyle: 'objective_obsidian_gold',
    photoUrl: '🐂',
    program: 'Daily Objectives Exclusive',
    stats: {
      pac: 98,
      sho: 87,
      pas: 84,
      dri: 93,
      def: 52,
      phy: 95,
    },
    weakFoot: 4,
    skillMoves: 4,
    workRate: 'High / Low',
    price: 430000,
    playStylePlus: {
      id: 'bruiser',
      name: 'Bruiser+',
      shortDesc: 'Unstoppable physical shielding and devastating shoulder charges',
      iconSymbol: '💥',
      statBoost: { attribute: 'phy', bonus: 16 },
    },
    metaDescription: 'Objective Exclusive Milestone: Pure powerhouse winger.'
  },
  {
    id: 'obj-achraf-hakimi-93',
    name: 'Achraf Hakimi',
    shortName: 'A. Hakimi',
    rating: 93,
    position: 'RB',
    nation: 'Morocco',
    nationFlag: '🇲🇦',
    club: 'Paris SG',
    league: 'Ligue 1',
    rarity: 'objective_exclusive',
    cardStyle: 'objective_obsidian_gold',
    photoUrl: '🇲🇦',
    program: 'Daily Objectives Exclusive',
    stats: {
      pac: 97,
      sho: 85,
      pas: 89,
      dri: 90,
      def: 87,
      phy: 88,
    },
    weakFoot: 4,
    skillMoves: 4,
    workRate: 'High / Medium',
    price: 460000,
    playStylePlus: {
      id: 'whipped_pass',
      name: 'Whipped Cross+',
      shortDesc: 'Curling delivery that finds attackers with lethal trajectory',
      iconSymbol: '🎯',
      statBoost: { attribute: 'pas', bonus: 14 },
    },
    metaDescription: 'Objective Exclusive Milestone: Atlas Lion world-class wingback.'
  },
  {
    id: 'obj-nasser-al-dawsari-92',
    name: 'Nasser Al-Dawsari',
    shortName: 'N. Al-Dawsari',
    rating: 92,
    position: 'CM',
    nation: 'Saudi Arabia',
    nationFlag: '🇸🇦',
    club: 'Al-Hilal',
    league: 'Roshn Saudi League',
    rarity: 'objective_exclusive',
    cardStyle: 'objective_obsidian_gold',
    photoUrl: '🇸🇦',
    program: 'Daily Objectives Exclusive',
    stats: {
      pac: 90,
      sho: 89,
      pas: 94,
      dri: 92,
      def: 84,
      phy: 87,
    },
    weakFoot: 5,
    skillMoves: 4,
    workRate: 'High / High',
    price: 410000,
    playStylePlus: {
      id: 'finesse_shot',
      name: 'Finesse Shot+',
      shortDesc: 'Unstoppable top-corner curving missiles from deep midfield',
      iconSymbol: '💫',
      statBoost: { attribute: 'sho', bonus: 15 },
    },
    metaDescription: 'Objective Exclusive Milestone: Saudi long-range maestro.'
  },
];

export interface DailyObjectiveSchedule {
  dateStr: string;
  dayIndex: number;
  rewardType: 'pack' | 'player';
  playerReward?: SoccerCard;
  isTodayPlayerReward: boolean;
}

export const OBJECTIVE_STORAGE_KEYS = {
  CLAIMED_PLAYERS: 'apex_fut_claimed_objective_player_ids_v1',
  MISSED_PLAYERS: 'apex_fut_missed_objective_player_ids_v1',
  OBJECTIVE_STATE: 'apex_fut_daily_objectives_v3',
};

/**
 * Calculates the day's reward configuration:
 * Alternates:
 *   - Even days: Exclusive Player Day (gives user immediate access to exclusive player!)
 *   - Odd days: Daily Bonus Pack Day
 */
export function getObjectiveDaySchedule(dateStr: string): DailyObjectiveSchedule {
  // Epoch days calculation
  const epochDays = Math.floor(new Date(dateStr + 'T00:00:00Z').getTime() / (1000 * 60 * 60 * 24));
  
  // Alternating schedule: even days = Player, odd days = Pack
  const isPlayerDay = Math.abs(epochDays) % 2 === 0;
  
  if (isPlayerDay) {
    const playerIndex = Math.abs(Math.floor(epochDays / 2)) % EXCLUSIVE_OBJECTIVE_PLAYERS.length;
    const player = EXCLUSIVE_OBJECTIVE_PLAYERS[playerIndex];
    return {
      dateStr,
      dayIndex: epochDays,
      rewardType: 'player',
      playerReward: player,
      isTodayPlayerReward: true,
    };
  }

  return {
    dateStr,
    dayIndex: epochDays,
    rewardType: 'pack',
    isTodayPlayerReward: false,
  };
}

/**
 * Checks if a player was claimed
 */
export function getClaimedPlayerIds(): string[] {
  try {
    const saved = localStorage.getItem(OBJECTIVE_STORAGE_KEYS.CLAIMED_PLAYERS);
    return saved ? JSON.parse(saved) : [];
  } catch (_) {
    return [];
  }
}

/**
 * Checks if a player was missed forever (expired)
 */
export function getMissedPlayerIds(): string[] {
  try {
    const saved = localStorage.getItem(OBJECTIVE_STORAGE_KEYS.MISSED_PLAYERS);
    return saved ? JSON.parse(saved) : [];
  } catch (_) {
    return [];
  }
}
