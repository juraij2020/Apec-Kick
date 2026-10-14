import { SoccerCard, PackDefinition } from './card';

export interface RaffleWinnerEntry {
  place: 1 | 2 | 3;
  winnerName: string;
  isUser: boolean;
  ticketCount: number;
  totalDrawTickets: number;
  winningOddsPct: number;
  prizeTitle: string;
  prizeSubtitle: string;
  prizeCard?: SoccerCard;
  prizePack?: PackDefinition;
  claimed?: boolean;
}

export interface DailyDrawRecord {
  drawId: string;
  drawDateStr: string; // e.g. "Oct 10, 2026"
  timestamp: number;
  monthKey: string;
  monthName: string;
  featuredCard: SoccerCard;
  totalTicketsInDraw: number;
  userTicketsInDraw: number;
  winners: RaffleWinnerEntry[];
}

export interface RaffleState {
  currentMonthKey: string;
  todayDrawDateKey: string; // e.g. "2026-10-10"
  userTicketsToday: number;
  communityTicketsToday: number;
  lastDrawDateKey: string;
  latestDrawResult: DailyDrawRecord | null;
  drawHistory: DailyDrawRecord[];
  pendingUserPrize: RaffleWinnerEntry | null;
}
