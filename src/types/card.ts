export type Position = 
  | 'GK' 
  | 'LB' | 'CB' | 'RB' | 'LWB' | 'RWB'
  | 'CDM' | 'CM' | 'CAM' | 'LM' | 'RM'
  | 'LW' | 'RW' | 'CF' | 'ST';

export type CardRarity = 
  | 'street_kings'
  | 'international_moments'
  | 'hall_of_fame'
  | 'program_one'
  | 'base'
  | 'futmas'
  | 'gold_rare'
  | 'gold_common'
  | 'icon'
  | 'totw'
  | 'tots'
  | 'custom'
  | 'objective_exclusive'
  | 'summer_transfers';

export type CardStyle =
  | 'street_kings_urban'
  | 'intl_moments_gold'
  | 'hof_gold_obsidian'
  | 'totw_black'
  | 'classic_gold'
  | 'futmas_crimson'
  | 'icon_white_gold'
  | 'tots_electric_blue'
  | 'future_stars_magenta'
  | 'custom_neon'
  | 'emerald_legend'
  | 'objective_obsidian_gold'
  | 'summer_basic';

export type PackTheme = 
  | 'street_kings'
  | 'intl_moments'
  | 'argentina'
  | 'brazil'
  | 'belgium'
  | 'hof_gold'
  | 'gold' 
  | 'black' 
  | 'ruby' 
  | 'frost'
  | 'prismatic' 
  | 'emerald' 
  | 'custom' 
  | 'mega' 
  | 'icon'
  | 'summer_pack';

export type PlayStylePlusType = 
  | 'quick_step'     // +12 Pace burst & breakaway finishing
  | 'finesse_shot'   // +15 Curve & outside-the-box conversion
  | 'anticipate'     // +15 Standing tackle & turnover rate
  | 'bruiser'        // +12 Physical strength & shoulder challenge success
  | 'whipped_pass'   // +14 Cross accuracy & set-piece assists
  | 'dead_ball'      // +20 Free kick & corner kick accuracy
  | 'rapid'          // +10 Sprint dribble control without ball loss
  | 'cat_reflexes'   // +15 GK diving & close-range reaction saves
  | 'relentless'     // 0 stamina decay & clutch boost
  | 'technical'      // Controlled sprint acceleration & razor close dribbling
  | 'trickster'      // Unique flair animations & evasive agility
  | 'incisive_pass'  // Laser through-balls dissecting defensive lines
  | 'long_ball_pass' // Pinpoint precision lofted distribution
  | 'press_proven'   // Iron ball retention under fierce physical pressing
  | 'power_header'   // Bullet trajectory on aerial set-piece strikes
  | 'acrobatic'      // Volley conversion from difficult airborne angles
  | 'poacher';       // Instant first-time finishing inside penalty box

export interface PlayStylePlusBadge {
  id: PlayStylePlusType;
  name: string;
  shortDesc: string;
  iconSymbol: string;
  statBoost: {
    attribute: 'pac' | 'sho' | 'pas' | 'dri' | 'def' | 'phy';
    bonus: number;
  };
  isPlus?: boolean;
}

export interface CardStats {
  pac: number; // Pace or DIV (Diving)
  sho: number; // Shooting or HAN (Handling)
  pas: number; // Passing or KIC (Kicking)
  dri: number; // Dribbling or REF (Reflexes)
  def: number; // Defense or SPE (Speed)
  phy: number; // Physical or POS (Positioning)
}

export interface SoccerCard {
  id: string;
  name: string;
  shortName?: string;
  rating: number;
  position: Position;
  nation: string;
  nationFlag: string;
  club: string;
  league: string;
  rarity: CardRarity;
  cardStyle: CardStyle;
  photoUrl?: string;
  fullCardImage?: string; // Pre-rendered full card image URL / data URL / SVG
  program?: string; // e.g. "International Moments", "Hall of Fame", "Program One", "Base Cards", etc.
  playStylePlus?: PlayStylePlusBadge;
  playStyles?: PlayStylePlusBadge[]; // Stacked PlayStyle badges for International Moments cards
  federationCrest?: string; // e.g. "CBF", "AFA", "RBFA"
  tournamentEmblem?: string; // e.g. "IFL Cup", "🏆"
  momentTitle?: string; // Specific tournament moment
  momentDescription?: string; // Lore / trivia about the moment
  hofInductionYear?: number;
  hofLegacyQuote?: string;
  isCustom?: boolean;
  creatorTag?: string;
  stats: CardStats;
  weakFoot?: number;
  skillMoves?: number;
  workRate?: string;
  price: number; // Quick sell value
}

export interface PackDefinition {
  id: string;
  name: string;
  tagline: string;
  cost: number;
  cardCount: number;
  minRating: number;
  programFilter?: 'All' | 'International Moments' | 'Hall of Fame' | 'Program One' | 'Base Cards' | 'Futmas' | string;
  guaranteedRating?: number;
  guaranteedWalkout?: boolean;
  theme: PackTheme;
  imageAsset?: string;
  customCardChance?: number;
  customChance?: number; // alias for backwards/syntax compatibility
  isUserPack?: boolean;
  isUnlimited?: boolean;
  summerCardChance?: number;
}

export interface SBCRequirement {
  id: string;
  description: string;
  check: (squadCards: SoccerCard[]) => boolean;
  progress: (squadCards: SoccerCard[]) => { current: number; target: number; met: boolean };
}

export interface SBCChallenge {
  id: string;
  title: string;
  category: 'Summer Transfers' | 'Street Kings' | 'International Moments' | 'Hall of Fame' | 'Hall of Fame Special' | 'Program One' | 'Futmas Special' | 'Base Challenges' | 'Creator Special' | 'Icons & Legends' | 'Starter' | 'Advanced';
  description: string;
  slots: { position: Position; label: string }[];
  rewardPackId: string;
  rewardPackName: string;
  rewardCoins: number;
  completed: boolean;
  requirements: SBCRequirement[];
}

export interface FormationSlot {
  id: string;
  position: Position;
  x: number; // percentage on pitch (0-100)
  y: number; // percentage on pitch (0-100)
  cardId?: string;
}

export interface Formation {
  id: string;
  name: string;
  slots: FormationSlot[];
}

export interface MatchSimulationLog {
  minute: number;
  text: string;
  type: 'goal' | 'save' | 'chance' | 'foul' | 'whistle';
  team: 'user' | 'opponent';
  score: [number, number];
}

export interface TransferListing {
  id: string;
  card: SoccerCard;
  sellerName: string;
  isUserListing: boolean;
  startBid: number;
  currentBid: number;
  buyNowPrice: number;
  bidsCount: number;
  expiresAt: number; // timestamp in ms
  status: 'active' | 'sold' | 'expired';
  buyerName?: string;
  userHasBid?: boolean;
  trend?: 'up' | 'down' | 'hot' | 'stable';
  trendPercent?: number;
}

export interface TransferFilter {
  query: string;
  position: 'ALL' | 'FWD' | 'MID' | 'DEF' | 'GK' | string;
  program: string;
  nation?: string;
  rarity?: string;
  playStyle?: string;
  instantBuyOnly?: boolean;
  minRating: number;
  maxRating: number;
  minPrice: number;
  maxPrice: number;
  sortBy: 'price_asc' | 'price_desc' | 'rating_desc' | 'rating_asc' | 'expires_soon';
}

export interface StoredRewardPack {
  instanceId: string;
  packDefinition: PackDefinition;
  earnedAt: number;
  sourceTitle: string;
  sourceType: 'high_low' | 'guess_who' | 'daily_objective' | 'bonus' | 'sbc';
}

export interface RewardLadderTier {
  streak: number;
  coins: number;
  pack: PackDefinition;
  title: string;
  description: string;
}


