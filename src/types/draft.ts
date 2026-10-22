import { SoccerCard, Position, Formation, PackDefinition } from './card';

export type DraftSlotType = 'starting' | 'bench' | 'reserve';

export interface DraftSlot {
  id: string;
  label: string;
  type: DraftSlotType;
  position: Position;
  card?: SoccerCard;
  x?: number; // Pitch X coordinate (0-100%)
  y?: number; // Pitch Y coordinate (0-100%)
}

export interface DraftDayCondition {
  id: string;
  title: string;
  description: string;
  rewardCoins: number;
  targetValue: number;
  currentValue: number;
  isMet: boolean;
  category: 'chemistry' | 'rating' | 'league' | 'nation' | 'program';
}

export interface DraftSquadState {
  formation: Formation;
  startingSlots: DraftSlot[]; // 11 slots
  benchSlots: DraftSlot[]; // 7 slots
  reserveSlots: DraftSlot[]; // 5 slots
  rating: number;
  chemistry: number;
  attackRating: number;
  midfieldRating: number;
  defenseRating: number;
  draftedCount: number; // 0 to 23
  dayCondition: DraftDayCondition;
  isCompleted: boolean;
}

export type TournamentRound = 'r16' | 'qf' | 'sf' | 'final';

export interface TournamentOpponent {
  id: string;
  name: string;
  gamerTag: string;
  avatarSeed: string;
  nation: string;
  nationFlag: string;
  badge: string;
  rating: number;
  chemistry: number;
  formationName: string;
  starPlayer: string;
  playStyle: string;
}

export interface MatchCommentaryItem {
  id: string;
  minute: number;
  text: string;
  type: 'goal' | 'save' | 'chance' | 'woodwork' | 'foul' | 'card_yellow' | 'card_red' | 'half_time' | 'full_time';
  team: 'user' | 'opp';
  actor?: string;
}

export interface TournamentMatch {
  id: string;
  round: TournamentRound;
  roundName: string;
  matchIndex: number; // 0-7 for r16, 0-3 for qf, 0-1 for sf, 0 for final
  homeTeam: {
    name: string;
    gamerTag?: string;
    badge: string;
    rating: number;
    isUser: boolean;
  };
  awayTeam: {
    name: string;
    gamerTag?: string;
    badge: string;
    rating: number;
    isUser: boolean;
  };
  homeScore: number;
  awayScore: number;
  winnerTeamName?: string;
  isUserMatch: boolean;
  status: 'upcoming' | 'ready' | 'in_progress' | 'completed';
  commentaryLog: MatchCommentaryItem[];
}

export interface TournamentCup {
  id: string;
  name: string;
  tagline: string;
  difficulty: 'Standard' | 'Elite' | 'World Class';
  icon: string;
  gradient: string;
  championCoins: number;
  championPack: PackDefinition;
}

export interface DraftTournamentRun {
  cupId: string;
  currentRound: TournamentRound;
  matches: TournamentMatch[];
  isEliminated: boolean;
  isChampion: boolean;
  activeMatchId: string | null;
  claimedPrize: boolean;
}
