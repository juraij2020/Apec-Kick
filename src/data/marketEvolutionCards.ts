import { SoccerCard } from '../types/card';
import { PLAYSTYLE_PRESETS } from './cardSvgGenerator';

export interface MarketEvolutionObjective {
  id: string;
  title: string;
  description: string;
  targetCount: number;
  currentType: 'matches' | 'goals' | 'wins' | 'clean_sheets';
}

export interface MarketEvolutionStage {
  stageNumber: number;
  stageName: string;
  objectives: MarketEvolutionObjective[];
  statBoosts: { [key: string]: number };
  ratingUpgrade: number;
}

export interface MarketEvolutionCardPair {
  id: string;
  key: 'francescoli' | 'di_natale' | 'marquez' | 'carvalho' | 'stam';
  name: string;
  baseCard: SoccerCard;
  maxCard: SoccerCard;
  isGrandReward?: boolean;
  stages: MarketEvolutionStage[];
}

// =========================================================================
// 5 BASE CARDS (PURCHASABLE ON TRANSFER MARKET)
// =========================================================================

export const EVO_FRANCESCOLI_BASE_95: SoccerCard = {
  id: 'evo_francescoli_base_95',
  name: 'Enzo Francescoli',
  shortName: 'Francescoli',
  rating: 95,
  position: 'CAM',
  nation: 'Uruguay',
  nationFlag: '🇺🇾',
  club: 'River Plate',
  league: 'Liga Profesional',
  rarity: 'market_evolution',
  cardStyle: 'market_evolution',
  program: 'Market Evolution',
  isCustom: true,
  photoUrl: '🏆',
  weakFoot: 5,
  skillMoves: 5,
  workRate: 'H/M',
  price: 65000,
  fullCardImage: '/assets/aistudio/Francescoli_82618683.png',
  playStylePlus: PLAYSTYLE_PRESETS.finesse_shot,
  stats: { pac: 87, sho: 88, pas: 83, dri: 89, def: 45, phy: 70 },
};

export const EVO_DI_NATALE_BASE_100: SoccerCard = {
  id: 'evo_di_natale_base_100',
  name: 'Antonio Di Natale',
  shortName: 'Di Natale',
  rating: 100,
  position: 'ST',
  nation: 'Italy',
  nationFlag: '🇮🇹',
  club: 'Udinese',
  league: 'Serie A',
  rarity: 'market_evolution',
  cardStyle: 'market_evolution',
  program: 'Market Evolution',
  isCustom: true,
  photoUrl: '🎯',
  weakFoot: 5,
  skillMoves: 4,
  workRate: 'H/M',
  price: 75000,
  fullCardImage: '/assets/aistudio/Di_Natale_6118a7db.png',
  playStylePlus: PLAYSTYLE_PRESETS.finesse_shot,
  stats: { pac: 98, sho: 99, pas: 88, dri: 97, def: 48, phy: 71 },
};

export const EVO_MARQUEZ_BASE_101: SoccerCard = {
  id: 'evo_marquez_base_101',
  name: 'Rafael Márquez',
  shortName: 'Márquez',
  rating: 101,
  position: 'CB',
  nation: 'Mexico',
  nationFlag: '🇲🇽',
  club: 'FC Barcelona',
  league: 'La Liga',
  rarity: 'market_evolution',
  cardStyle: 'market_evolution',
  program: 'Market Evolution',
  isCustom: true,
  photoUrl: '🛡️',
  weakFoot: 4,
  skillMoves: 3,
  workRate: 'M/H',
  price: 80000,
  fullCardImage: '/assets/aistudio/M_rquez_d021b3a1.png',
  playStylePlus: PLAYSTYLE_PRESETS.anticipate,
  stats: { pac: 88, sho: 66, pas: 84, dri: 80, def: 100, phy: 98 },
};

export const EVO_CARVALHO_BASE_94: SoccerCard = {
  id: 'evo_carvalho_base_94',
  name: 'Ricardo Carvalho',
  shortName: 'Carvalho',
  rating: 94,
  position: 'CB',
  nation: 'Portugal',
  nationFlag: '🇵🇹',
  club: 'FC Porto',
  league: 'Liga Portugal',
  rarity: 'market_evolution',
  cardStyle: 'market_evolution',
  program: 'Market Evolution',
  isCustom: true,
  photoUrl: '🧱',
  weakFoot: 3,
  skillMoves: 3,
  workRate: 'M/H',
  price: 55000,
  fullCardImage: '/assets/aistudio/Ricardo_Carvalho_080af17b.png',
  playStylePlus: PLAYSTYLE_PRESETS.anticipate,
  stats: { pac: 77, sho: 55, pas: 70, dri: 76, def: 90, phy: 83 },
};

export const EVO_STAM_BASE_103: SoccerCard = {
  id: 'evo_stam_base_103',
  name: 'Jaap Stam',
  shortName: 'Stam',
  rating: 103,
  position: 'CM',
  nation: 'Netherlands',
  nationFlag: '🇳🇱',
  club: 'Manchester United',
  league: 'Premier League',
  rarity: 'market_evolution',
  cardStyle: 'market_evolution',
  program: 'Market Evolution',
  isCustom: true,
  photoUrl: '⚡',
  weakFoot: 4,
  skillMoves: 3,
  workRate: 'H/H',
  price: 95000,
  fullCardImage: '/assets/aistudio/Stam_ae7aeb60.png',
  playStylePlus: PLAYSTYLE_PRESETS.bruiser,
  stats: { pac: 91, sho: 55, pas: 68, dri: 82, def: 101, phy: 101 },
};

export const MARKET_EVO_BASE_CARDS: SoccerCard[] = [
  EVO_FRANCESCOLI_BASE_95,
  EVO_DI_NATALE_BASE_100,
  EVO_MARQUEZ_BASE_101,
  EVO_CARVALHO_BASE_94,
  EVO_STAM_BASE_103,
];

// =========================================================================
// 5 HIGHEST EVOLVED CARDS (EARNED THROUGH EVOLUTION OBJECTIVES)
// =========================================================================

export const EVO_FRANCESCOLI_MAX_117: SoccerCard = {
  id: 'evo_francescoli_max_117',
  name: 'Enzo Francescoli',
  shortName: 'Francescoli Prime',
  rating: 117,
  position: 'CAM',
  nation: 'Uruguay',
  nationFlag: '🇺🇾',
  club: 'River Plate',
  league: 'Liga Profesional',
  rarity: 'market_evolution',
  cardStyle: 'market_evolution',
  program: 'Market Evolution Apex',
  isCustom: true,
  isSetRewardOnly: true,
  photoUrl: '👑',
  weakFoot: 5,
  skillMoves: 5,
  workRate: 'H/M',
  price: 4500000,
  fullCardImage: '/assets/aistudio/Francescoli__1__0848cfbe.png',
  playStylePlus: PLAYSTYLE_PRESETS.finesse_shot,
  stats: { pac: 149, sho: 154, pas: 143, dri: 167, def: 70, phy: 99 },
};

export const EVO_DI_NATALE_MAX_109: SoccerCard = {
  id: 'evo_di_natale_max_109',
  name: 'Antonio Di Natale',
  shortName: 'Di Natale Prime',
  rating: 109,
  position: 'ST',
  nation: 'Italy',
  nationFlag: '🇮🇹',
  club: 'Udinese',
  league: 'Serie A',
  rarity: 'market_evolution',
  cardStyle: 'market_evolution',
  program: 'Market Evolution Apex',
  isCustom: true,
  isSetRewardOnly: true,
  photoUrl: '🔥',
  weakFoot: 5,
  skillMoves: 5,
  workRate: 'H/M',
  price: 3800000,
  fullCardImage: '/assets/aistudio/Di_Natale__1__3ad7c80d.png',
  playStylePlus: PLAYSTYLE_PRESETS.rapid,
  stats: { pac: 150, sho: 165, pas: 119, dri: 154, def: 77, phy: 117 },
};

export const EVO_MARQUEZ_MAX_115: SoccerCard = {
  id: 'evo_marquez_max_115',
  name: 'Rafael Márquez',
  shortName: 'Márquez Prime',
  rating: 115,
  position: 'CB',
  nation: 'Mexico',
  nationFlag: '🇲🇽',
  club: 'FC Barcelona',
  league: 'La Liga',
  rarity: 'market_evolution',
  cardStyle: 'market_evolution',
  program: 'Market Evolution Apex',
  isCustom: true,
  isSetRewardOnly: true,
  photoUrl: '🛡️',
  weakFoot: 5,
  skillMoves: 4,
  workRate: 'M/H',
  price: 4200000,
  fullCardImage: '/assets/aistudio/M_rquez__1__b29373d6.png',
  playStylePlus: PLAYSTYLE_PRESETS.anticipate,
  stats: { pac: 133, sho: 99, pas: 128, dri: 128, def: 185, phy: 179 },
};

export const EVO_CARVALHO_MAX_115: SoccerCard = {
  id: 'evo_carvalho_max_115',
  name: 'Ricardo Carvalho',
  shortName: 'Carvalho Prime',
  rating: 115,
  position: 'CB',
  nation: 'Portugal',
  nationFlag: '🇵🇹',
  club: 'FC Porto',
  league: 'Liga Portugal',
  rarity: 'market_evolution',
  cardStyle: 'market_evolution',
  program: 'Market Evolution Apex',
  isCustom: true,
  isSetRewardOnly: true,
  photoUrl: '🧱',
  weakFoot: 4,
  skillMoves: 4,
  workRate: 'M/H',
  price: 4100000,
  fullCardImage: '/assets/aistudio/Ricardo_Carvalho__1__62f6d7bd.png',
  playStylePlus: PLAYSTYLE_PRESETS.anticipate,
  stats: { pac: 114, sho: 90, pas: 123, dri: 130, def: 191, phy: 163 },
};

export const EVO_STAM_MAX_118: SoccerCard = {
  id: 'evo_stam_max_118',
  name: 'Jaap Stam',
  shortName: 'Stam Supreme',
  rating: 118,
  position: 'CM',
  nation: 'Netherlands',
  nationFlag: '🇳🇱',
  club: 'Manchester United',
  league: 'Premier League',
  rarity: 'market_evolution',
  cardStyle: 'market_evolution',
  program: 'Market Evolution Legend',
  isCustom: true,
  isSetRewardOnly: true,
  photoUrl: '👑',
  weakFoot: 5,
  skillMoves: 5,
  workRate: 'H/H',
  price: 10000000,
  fullCardImage: '/assets/aistudio/Stam__1__3551a8ee.png',
  playStylePlus: PLAYSTYLE_PRESETS.bruiser,
  stats: { pac: 141, sho: 75, pas: 103, dri: 130, def: 172, phy: 173 },
};

export const MARKET_EVO_MAX_CARDS: SoccerCard[] = [
  EVO_FRANCESCOLI_MAX_117,
  EVO_DI_NATALE_MAX_109,
  EVO_MARQUEZ_MAX_115,
  EVO_CARVALHO_MAX_115,
  EVO_STAM_MAX_118,
];

export const ALL_MARKET_EVO_CARDS: SoccerCard[] = [
  ...MARKET_EVO_BASE_CARDS,
  ...MARKET_EVO_MAX_CARDS,
];

// =========================================================================
// EVOLUTION PAIR DEFINITIONS WITH MULTI-STAGE OBJECTIVES
// =========================================================================

export const MARKET_EVOLUTION_PAIRS: MarketEvolutionCardPair[] = [
  // 1. Francescoli (95 -> 117 CAM)
  {
    id: 'evo-pair-francescoli',
    key: 'francescoli',
    name: 'Enzo Francescoli',
    baseCard: EVO_FRANCESCOLI_BASE_95,
    maxCard: EVO_FRANCESCOLI_MAX_117,
    stages: [
      {
        stageNumber: 1,
        stageName: 'Playmaker Calibration',
        ratingUpgrade: 102,
        statBoosts: { pac: 20, sho: 22, pas: 20, dri: 26, def: 8, phy: 10 },
        objectives: [
          { id: 'fra_1_1', title: 'South American Maestro', description: 'Play 3 matches with Francescoli in squad', targetCount: 3, currentType: 'matches' },
          { id: 'fra_1_2', title: 'Clinical Finishing', description: 'Score 3 goals with Francescoli', targetCount: 3, currentType: 'goals' },
        ],
      },
      {
        stageNumber: 2,
        stageName: 'Libertadores Heroics',
        ratingUpgrade: 110,
        statBoosts: { pac: 22, sho: 24, pas: 22, dri: 28, def: 10, phy: 10 },
        objectives: [
          { id: 'fra_2_1', title: 'Continental Triumph', description: 'Win 3 matches with Francescoli in starting XI', targetCount: 3, currentType: 'wins' },
          { id: 'fra_2_2', title: 'Artistic Goals', description: 'Score 5 goals in match clashes', targetCount: 5, currentType: 'goals' },
        ],
      },
      {
        stageNumber: 3,
        stageName: 'Apex Legend (117 Final)',
        ratingUpgrade: 117,
        statBoosts: { pac: 20, sho: 20, pas: 18, dri: 24, def: 7, phy: 9 },
        objectives: [
          { id: 'fra_3_1', title: 'River Plate Immortality', description: 'Win 4 matches with Francescoli captaining', targetCount: 4, currentType: 'wins' },
          { id: 'fra_3_2', title: 'Masterclass Brace', description: 'Score 7 total goals with Francescoli', targetCount: 7, currentType: 'goals' },
        ],
      },
    ],
  },

  // 2. Di Natale (100 -> 109 ST)
  {
    id: 'evo-pair-di-natale',
    key: 'di_natale',
    name: 'Antonio Di Natale',
    baseCard: EVO_DI_NATALE_BASE_100,
    maxCard: EVO_DI_NATALE_MAX_109,
    stages: [
      {
        stageNumber: 1,
        stageName: 'Friuli Striker Awakening',
        ratingUpgrade: 103,
        statBoosts: { pac: 18, sho: 22, pas: 10, dri: 18, def: 10, phy: 15 },
        objectives: [
          { id: 'din_1_1', title: 'Italian Poacher', description: 'Play 3 matches with Di Natale', targetCount: 3, currentType: 'matches' },
          { id: 'din_1_2', title: 'Top-Corner Finishes', description: 'Score 3 goals with Di Natale', targetCount: 3, currentType: 'goals' },
        ],
      },
      {
        stageNumber: 2,
        stageName: 'Capocannoniere Run',
        ratingUpgrade: 106,
        statBoosts: { pac: 18, sho: 24, pas: 11, dri: 20, def: 10, phy: 16 },
        objectives: [
          { id: 'din_2_1', title: 'Serie A Dominance', description: 'Win 3 matches with Di Natale in squad', targetCount: 3, currentType: 'wins' },
          { id: 'din_2_2', title: 'Lethal Striker', description: 'Score 5 goals with Di Natale', targetCount: 5, currentType: 'goals' },
        ],
      },
      {
        stageNumber: 3,
        stageName: 'Apex Legend (109 Final)',
        ratingUpgrade: 109,
        statBoosts: { pac: 16, sho: 20, pas: 10, dri: 19, def: 9, phy: 15 },
        objectives: [
          { id: 'din_3_1', title: 'Udine Icon', description: 'Win 4 matches with Di Natale', targetCount: 4, currentType: 'wins' },
          { id: 'din_3_2', title: 'Century Goal Milestone', description: 'Score 6 goals with Di Natale', targetCount: 6, currentType: 'goals' },
        ],
      },
    ],
  },

  // 3. Rafael Márquez (101 -> 115 CB)
  {
    id: 'evo-pair-marquez',
    key: 'marquez',
    name: 'Rafael Márquez',
    baseCard: EVO_MARQUEZ_BASE_101,
    maxCard: EVO_MARQUEZ_MAX_115,
    stages: [
      {
        stageNumber: 1,
        stageName: 'El Káiser Leadership',
        ratingUpgrade: 105,
        statBoosts: { pac: 15, sho: 11, pas: 15, dri: 16, def: 28, phy: 27 },
        objectives: [
          { id: 'mar_1_1', title: 'Backline General', description: 'Play 3 matches with Márquez in defense', targetCount: 3, currentType: 'matches' },
          { id: 'mar_1_2', title: 'Impenetrable Wall', description: 'Win 2 matches without conceding', targetCount: 2, currentType: 'clean_sheets' },
        ],
      },
      {
        stageNumber: 2,
        stageName: 'Camp Nou Commander',
        ratingUpgrade: 110,
        statBoosts: { pac: 15, sho: 11, pas: 15, dri: 16, def: 29, phy: 27 },
        objectives: [
          { id: 'mar_2_1', title: 'La Liga Supremacy', description: 'Win 3 matches with Márquez starting', targetCount: 3, currentType: 'wins' },
          { id: 'mar_2_2', title: 'Aerial Lockdown', description: 'Achieve 2 clean sheets in match simulator', targetCount: 2, currentType: 'clean_sheets' },
        ],
      },
      {
        stageNumber: 3,
        stageName: 'Apex Legend (115 Final)',
        ratingUpgrade: 115,
        statBoosts: { pac: 15, sho: 11, pas: 14, dri: 16, def: 28, phy: 27 },
        objectives: [
          { id: 'mar_3_1', title: 'Mexican Heritage Legend', description: 'Win 4 matches with Márquez', targetCount: 4, currentType: 'wins' },
          { id: 'mar_3_2', title: 'Iron Fortress', description: 'Achieve 3 clean sheets with Márquez in XI', targetCount: 3, currentType: 'clean_sheets' },
        ],
      },
    ],
  },

  // 4. Ricardo Carvalho (94 -> 115 CB)
  {
    id: 'evo-pair-carvalho',
    key: 'carvalho',
    name: 'Ricardo Carvalho',
    baseCard: EVO_CARVALHO_BASE_94,
    maxCard: EVO_CARVALHO_MAX_115,
    stages: [
      {
        stageNumber: 1,
        stageName: 'Porto Tactician',
        ratingUpgrade: 101,
        statBoosts: { pac: 13, sho: 11, pas: 18, dri: 18, def: 34, phy: 27 },
        objectives: [
          { id: 'car_1_1', title: 'Tactical Discipline', description: 'Play 3 matches with Carvalho in defense', targetCount: 3, currentType: 'matches' },
          { id: 'car_1_2', title: 'Clean Sheet Master', description: 'Win 2 matches without conceding', targetCount: 2, currentType: 'clean_sheets' },
        ],
      },
      {
        stageNumber: 2,
        stageName: 'Champions League Victor',
        ratingUpgrade: 108,
        statBoosts: { pac: 12, sho: 12, pas: 18, dri: 18, def: 34, phy: 27 },
        objectives: [
          { id: 'car_2_1', title: 'European Dominance', description: 'Win 3 matches with Carvalho in XI', targetCount: 3, currentType: 'wins' },
          { id: 'car_2_2', title: 'Precision Turnover', description: 'Achieve 2 clean sheets in match simulator', targetCount: 2, currentType: 'clean_sheets' },
        ],
      },
      {
        stageNumber: 3,
        stageName: 'Apex Legend (115 Final)',
        ratingUpgrade: 115,
        statBoosts: { pac: 12, sho: 12, pas: 17, dri: 18, def: 33, phy: 26 },
        objectives: [
          { id: 'car_3_1', title: 'Stamford Bridge Sentinel', description: 'Win 4 matches with Carvalho', targetCount: 4, currentType: 'wins' },
          { id: 'car_3_2', title: 'Master Defensive Lock', description: 'Achieve 3 clean sheets with Carvalho starting', targetCount: 3, currentType: 'clean_sheets' },
        ],
      },
    ],
  },

  // 5. Jaap Stam (103 -> 118 CM) - GATED GRAND SET EVOLUTION
  {
    id: 'evo-pair-stam',
    key: 'stam',
    name: 'Jaap Stam',
    baseCard: EVO_STAM_BASE_103,
    maxCard: EVO_STAM_MAX_118,
    isGrandReward: true,
    stages: [
      {
        stageNumber: 1,
        stageName: 'Midfield Juggernaut',
        ratingUpgrade: 108,
        statBoosts: { pac: 16, sho: 7, pas: 12, dri: 16, def: 24, phy: 24 },
        objectives: [
          { id: 'sta_1_1', title: 'Dutch Colossus', description: 'Play 3 matches with Stam in midfield', targetCount: 3, currentType: 'matches' },
          { id: 'sta_1_2', title: 'Dominant Engine', description: 'Score 2 goals and win 2 matches', targetCount: 2, currentType: 'wins' },
        ],
      },
      {
        stageNumber: 2,
        stageName: 'Treble Winner Dominance',
        ratingUpgrade: 113,
        statBoosts: { pac: 17, sho: 7, pas: 12, dri: 16, def: 24, phy: 24 },
        objectives: [
          { id: 'sta_2_1', title: 'Old Trafford Legend', description: 'Win 3 matches with Stam in starting XI', targetCount: 3, currentType: 'wins' },
          { id: 'sta_2_2', title: 'Complete Midfield Presence', description: 'Score 3 goals with Stam', targetCount: 3, currentType: 'goals' },
        ],
      },
      {
        stageNumber: 3,
        stageName: 'Supreme Master (118 Final)',
        ratingUpgrade: 118,
        statBoosts: { pac: 17, sho: 6, pas: 11, dri: 16, def: 23, phy: 24 },
        objectives: [
          { id: 'sta_3_1', title: 'Ultimate Apex CM', description: 'Win 5 matches with Stam', targetCount: 5, currentType: 'wins' },
          { id: 'sta_3_2', title: 'Unstoppable Force', description: 'Score 5 goals with Stam in midfield', targetCount: 5, currentType: 'goals' },
        ],
      },
    ],
  },
];
