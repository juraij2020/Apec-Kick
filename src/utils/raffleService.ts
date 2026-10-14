import { RaffleState, DailyDrawRecord, RaffleWinnerEntry } from '../types/raffle';
import {
  MONTHLY_RAFFLE_PLAYERS,
  getRafflePlayerForMonth,
  getCurrentCalendarMonthKey,
} from '../data/raffleCards';
import { RAFFLE_JUMBO_RARE_PACK, RAFFLE_MEGA_PACK } from '../data/packs';

export const RAFFLE_STORAGE_KEY = 'apex_fut_raffle_state_v1';

const BOT_NAMES = [
  'ApexLegend99',
  'CR7_ElBicho',
  'MessiMagic10',
  'HaalandViking',
  'SambaKing_9',
  'GullitGang88',
  'FUT_Sniper_UK',
  'GoldenBoot_BR',
  'UltimateTactician',
  'Madridista7',
  'KloppHeavyMetal',
  'TikiTakaMaster',
  'Chicharito_Fan',
  'SuperSub_93',
  'FUT_PackOpener',
];

/**
 * Returns UTC YYYY-MM-DD string
 */
export function getUtcDateKey(date = new Date()): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Returns next midnight UTC timestamp
 */
export function getNextUtcMidnightTimestamp(now = new Date()): number {
  return Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0,
    0,
    0,
    0
  );
}

/**
 * Formats time remaining in HH:MM:SS
 */
export function formatMsToCountdown(ms: number): {
  hours: string;
  minutes: string;
  seconds: string;
  totalSeconds: number;
} {
  const safeMs = Math.max(0, ms);
  const totalSeconds = Math.floor(safeMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
    totalSeconds,
  };
}

/**
 * Generates initial simulated winners record for yesterday so the "announced next day" section
 * is immediately populated with realistic history.
 */
function createInitialPreviousDraw(): DailyDrawRecord {
  const yesterday = new Date(Date.now() - 86400000);
  const activeMonthKey = getCurrentCalendarMonthKey(yesterday);
  const monthConfig = getRafflePlayerForMonth(activeMonthKey);
  const totalDrawTickets = 14280;

  const winners: RaffleWinnerEntry[] = [
    {
      place: 1,
      winnerName: 'ApexLegend99',
      isUser: false,
      ticketCount: 1250,
      totalDrawTickets,
      winningOddsPct: 8.75,
      prizeTitle: `${monthConfig.card.name} (${monthConfig.card.rating} OVR)`,
      prizeSubtitle: `Official ${monthConfig.monthName} Daily Raffle Card Added to Club`,
      prizeCard: monthConfig.card,
      claimed: true,
    },
    {
      place: 2,
      winnerName: 'SambaKing_9',
      isUser: false,
      ticketCount: 450,
      totalDrawTickets,
      winningOddsPct: 3.15,
      prizeTitle: 'Jumbo Rare Players Pack',
      prizeSubtitle: '8 Rare & Special Players with Guaranteed 84+ Walkout',
      prizePack: RAFFLE_JUMBO_RARE_PACK,
      claimed: true,
    },
    {
      place: 3,
      winnerName: 'FUT_Sniper_UK',
      isUser: false,
      ticketCount: 85,
      totalDrawTickets,
      winningOddsPct: 0.59,
      prizeTitle: 'Mega Pack',
      prizeSubtitle: '6 High-Rating Players with Guaranteed 80+ Player Item',
      prizePack: RAFFLE_MEGA_PACK,
      claimed: true,
    },
  ];

  return {
    drawId: `draw_init_${yesterday.getTime()}`,
    drawDateStr: yesterday.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    }),
    timestamp: yesterday.getTime(),
    monthKey: activeMonthKey,
    monthName: monthConfig.monthName,
    featuredCard: monthConfig.card,
    totalTicketsInDraw: totalDrawTickets,
    userTicketsInDraw: 0,
    winners,
  };
}

/**
 * Loads or creates default Raffle State
 */
export function loadRaffleState(): RaffleState {
  const todayKey = getUtcDateKey();
  const currentMonthKey = getCurrentCalendarMonthKey();
  try {
    const raw = localStorage.getItem(RAFFLE_STORAGE_KEY);
    if (raw) {
      const parsed: RaffleState = JSON.parse(raw);
      // Ensure currentMonthKey tracks current real-world calendar
      const updatedMonthKey = currentMonthKey;
      // If day has changed, we keep history and set today to fresh count
      if (parsed.todayDrawDateKey !== todayKey) {
        return {
          ...parsed,
          currentMonthKey: updatedMonthKey,
          todayDrawDateKey: todayKey,
          userTicketsToday: 0,
          communityTicketsToday: Math.floor(Math.random() * 3000) + 2500,
        };
      }
      return {
        ...parsed,
        currentMonthKey: updatedMonthKey,
      };
    }
  } catch (err) {
    console.warn('Failed to load raffle state:', err);
  }

  const initialDraw = createInitialPreviousDraw();
  return {
    currentMonthKey,
    todayDrawDateKey: todayKey,
    userTicketsToday: 0,
    communityTicketsToday: 3840,
    lastDrawDateKey: getUtcDateKey(new Date(Date.now() - 86400000)),
    latestDrawResult: initialDraw,
    drawHistory: [initialDraw],
    pendingUserPrize: null,
  };
}

export function saveRaffleState(state: RaffleState): void {
  try {
    localStorage.setItem(RAFFLE_STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('Failed to save raffle state:', err);
  }
}

/**
 * Executes a daily raffle draw using fair weighted probability.
 * Supports user winning if their tickets hit, or a simulated community player.
 */
export function executeDailyDraw(
  currentState: RaffleState,
  forceUserWin = false,
  targetMonthKey?: string
): { newState: RaffleState; drawResult: DailyDrawRecord; userPrize: RaffleWinnerEntry | null } {
  const monthKey = targetMonthKey || getCurrentCalendarMonthKey();
  const monthConfig = getRafflePlayerForMonth(monthKey);
  const userTickets = currentState.userTicketsToday;
  
  // Create simulated entries pool
  // Each simulated entrant has tickets (some have 5, some 100, some 1000)
  interface Entrant {
    name: string;
    isUser: boolean;
    tickets: number;
  }

  const entrants: Entrant[] = [];

  if (userTickets > 0) {
    entrants.push({
      name: 'You (Club Owner)',
      isUser: true,
      tickets: userTickets,
    });
  }

  // Shuffle bot names and give random ticket counts
  const shuffledBots = [...BOT_NAMES].sort(() => 0.5 - Math.random()).slice(0, 8);
  for (const bot of shuffledBots) {
    const randomBotTickets = Math.floor(Math.random() * 450) + 15;
    entrants.push({
      name: bot,
      isUser: false,
      tickets: randomBotTickets,
    });
  }

  // Calculate total tickets
  const totalTickets = entrants.reduce((sum, e) => sum + e.tickets, 0) + (currentState.communityTicketsToday || 500);

  // Helper for weighted drawing
  const selectWeightedWinner = (availableEntrants: Entrant[]): Entrant => {
    if (availableEntrants.length === 0) {
      return { name: 'LuckyParticipant_7', isUser: false, tickets: 25 };
    }
    const currentTotal = availableEntrants.reduce((sum, e) => sum + e.tickets, 0);
    const rand = Math.random() * currentTotal;
    let accumulated = 0;
    for (const ent of availableEntrants) {
      accumulated += ent.tickets;
      if (rand <= accumulated) {
        return ent;
      }
    }
    return availableEntrants[0];
  };

  const pool = [...entrants];
  let firstWinner: Entrant;
  let secondWinner: Entrant;
  let thirdWinner: Entrant;

  if (forceUserWin && userTickets > 0) {
    // Force user as 1st place for test demo if requested
    firstWinner = pool.find((e) => e.isUser) || pool[0];
    const rem1 = pool.filter((e) => e !== firstWinner);
    secondWinner = selectWeightedWinner(rem1);
    const rem2 = rem1.filter((e) => e !== secondWinner);
    thirdWinner = selectWeightedWinner(rem2);
  } else {
    firstWinner = selectWeightedWinner(pool);
    const rem1 = pool.filter((e) => e !== firstWinner);
    secondWinner = selectWeightedWinner(rem1);
    const rem2 = rem1.filter((e) => e !== secondWinner);
    thirdWinner = selectWeightedWinner(rem2);
  }

  // Format winners
  const winners: RaffleWinnerEntry[] = [
    {
      place: 1,
      winnerName: firstWinner.name,
      isUser: firstWinner.isUser,
      ticketCount: firstWinner.tickets,
      totalDrawTickets: totalTickets,
      winningOddsPct: Number(((firstWinner.tickets / totalTickets) * 100).toFixed(2)),
      prizeTitle: `${monthConfig.card.name} (${monthConfig.card.rating} OVR)`,
      prizeSubtitle: `Official ${monthConfig.monthName} Daily Raffle Card Added to Club`,
      prizeCard: monthConfig.card,
      claimed: false,
    },
    {
      place: 2,
      winnerName: secondWinner.name,
      isUser: secondWinner.isUser,
      ticketCount: secondWinner.tickets,
      totalDrawTickets: totalTickets,
      winningOddsPct: Number(((secondWinner.tickets / totalTickets) * 100).toFixed(2)),
      prizeTitle: 'Jumbo Rare Players Pack',
      prizeSubtitle: '8 Rare & Special Players with Guaranteed 84+ Walkout',
      prizePack: RAFFLE_JUMBO_RARE_PACK,
      claimed: false,
    },
    {
      place: 3,
      winnerName: thirdWinner.name,
      isUser: thirdWinner.isUser,
      ticketCount: thirdWinner.tickets,
      totalDrawTickets: totalTickets,
      winningOddsPct: Number(((thirdWinner.tickets / totalTickets) * 100).toFixed(2)),
      prizeTitle: 'Mega Pack',
      prizeSubtitle: '6 High-Caliber Players with Guaranteed 80+ Player Item',
      prizePack: RAFFLE_MEGA_PACK,
      claimed: false,
    },
  ];

  const drawNow = new Date();
  const drawRecord: DailyDrawRecord = {
    drawId: `draw_${drawNow.getTime()}`,
    drawDateStr: drawNow.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    }),
    timestamp: drawNow.getTime(),
    monthKey,
    monthName: monthConfig.monthName,
    featuredCard: monthConfig.card,
    totalTicketsInDraw: totalTickets,
    userTicketsInDraw: userTickets,
    winners,
  };

  // Check if user won any prize
  const userWonEntry = winners.find((w) => w.isUser) || null;

  const nextDayKey = getUtcDateKey(drawNow);
  const updatedHistory = [drawRecord, ...(currentState.drawHistory || [])].slice(0, 15);

  const newState: RaffleState = {
    ...currentState,
    todayDrawDateKey: nextDayKey,
    userTicketsToday: 0, // Reset today's ticket count for the next day
    communityTicketsToday: Math.floor(Math.random() * 2000) + 1200,
    lastDrawDateKey: nextDayKey,
    latestDrawResult: drawRecord,
    drawHistory: updatedHistory,
    pendingUserPrize: userWonEntry,
  };

  saveRaffleState(newState);

  return {
    newState,
    drawResult: drawRecord,
    userPrize: userWonEntry,
  };
}
