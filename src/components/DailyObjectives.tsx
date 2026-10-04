import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Gift, 
  Coins, 
  Package, 
  Trophy, 
  ArrowRight, 
  Sparkles, 
  Layers, 
  Swords, 
  Flame, 
  Crown,
  Gamepad2,
  Store,
  AlertTriangle,
  Lock,
  Calendar,
  XCircle,
  ShieldAlert
} from 'lucide-react';
import { PackDefinition, SoccerCard } from '../types/card';
import { sound } from '../utils/audio';
import { CardItem } from './CardItem';
import { 
  EXCLUSIVE_OBJECTIVE_PLAYERS, 
  getObjectiveDaySchedule, 
  OBJECTIVE_STORAGE_KEYS,
  getClaimedPlayerIds,
  getMissedPlayerIds
} from '../data/objectivePlayers';

export interface DailyObjectiveItem {
  id: 'open_packs' | 'win_match' | 'submit_sbc' | 'play_minigame' | 'market_trade';
  title: string;
  description: string;
  category: string;
  iconType: 'package' | 'swords' | 'layers' | 'gamepad' | 'market';
  current: number;
  target: number;
  completed: boolean;
  claimed: boolean;
  coinReward: number;
  actionTab: 'packs' | 'clash' | 'sbcs' | 'minigames' | 'market';
  actionLabel: string;
}

export interface DailyObjectivesStateV3 {
  lastUpdatedDate: string;
  tasks: {
    open_packs: { current: number; completed: boolean; claimed: boolean };
    win_match: { current: number; completed: boolean; claimed: boolean };
    submit_sbc: { current: number; completed: boolean; claimed: boolean };
    play_minigame: { current: number; completed: boolean; claimed: boolean };
    market_trade: { current: number; completed: boolean; claimed: boolean };
  };
  groupClaimed: boolean;
}

interface DailyObjectivesProps {
  coins: number;
  onAddCoins: (amount: number) => void;
  onAddUnopenedPack: (
    pack: PackDefinition,
    sourceTitle: string,
    sourceType: 'daily_objective' | 'bonus'
  ) => void;
  onAddCardsToClub: (cards: SoccerCard[]) => void;
  dailyBonusPack: PackDefinition;
  onNavigateToTab: (tab: any) => void;
  // Live stats tracked in App
  packsOpenedToday: number;
  matchesWonToday: number;
  sbcsSubmittedToday: number;
  miniGamesPlayedToday: number;
  marketTradesToday: number;
  clubCards: SoccerCard[];
  onAddEvoPoints?: (points: number) => void;
}

export const DailyObjectives: React.FC<DailyObjectivesProps> = ({
  coins,
  onAddCoins,
  onAddUnopenedPack,
  onAddCardsToClub,
  dailyBonusPack,
  onNavigateToTab,
  packsOpenedToday,
  matchesWonToday,
  sbcsSubmittedToday,
  miniGamesPlayedToday,
  marketTradesToday,
  clubCards,
  onAddEvoPoints,
}) => {
  const getTodayDateStr = () => new Date().toISOString().split('T')[0];
  const todayStr = getTodayDateStr();

  // Day Schedule & Reward computation
  const daySchedule = useMemo(() => getObjectiveDaySchedule(todayStr), [todayStr]);
  const isPlayerDay = daySchedule.rewardType === 'player';
  const todayPlayerReward = daySchedule.playerReward;

  // Track claimed & missed players
  const [claimedPlayerIds, setClaimedPlayerIds] = useState<string[]>(() => getClaimedPlayerIds());
  const [missedPlayerIds, setMissedPlayerIds] = useState<string[]>(() => getMissedPlayerIds());

  // Daily state management
  const [state, setState] = useState<DailyObjectivesStateV3>(() => {
    try {
      const saved = localStorage.getItem(OBJECTIVE_STORAGE_KEYS.OBJECTIVE_STATE);
      if (saved) {
        const parsed: DailyObjectivesStateV3 = JSON.parse(saved);
        if (parsed.lastUpdatedDate === todayStr && parsed.tasks.play_minigame && parsed.tasks.market_trade) {
          return parsed;
        } else if (parsed.lastUpdatedDate !== todayStr) {
          // A previous day has elapsed! Check if yesterday's player was missed:
          const prevSchedule = getObjectiveDaySchedule(parsed.lastUpdatedDate);
          if (prevSchedule.rewardType === 'player' && prevSchedule.playerReward) {
            const pid = prevSchedule.playerReward.id;
            const currentClaimed = getClaimedPlayerIds();
            if (!parsed.groupClaimed && !currentClaimed.includes(pid)) {
              // Mark player as missed forever!
              const currentMissed = getMissedPlayerIds();
              if (!currentMissed.includes(pid)) {
                const nextMissed = [...currentMissed, pid];
                try {
                  localStorage.setItem(OBJECTIVE_STORAGE_KEYS.MISSED_PLAYERS, JSON.stringify(nextMissed));
                } catch (_) {}
              }
            }
          }
        }
      }
    } catch (_) {}

    // Initialize fresh 5 tasks for today
    return {
      lastUpdatedDate: todayStr,
      tasks: {
        open_packs: { current: packsOpenedToday || 0, completed: (packsOpenedToday || 0) >= 3, claimed: false },
        win_match: { current: matchesWonToday || 0, completed: (matchesWonToday || 0) >= 1, claimed: false },
        submit_sbc: { current: sbcsSubmittedToday || 0, completed: (sbcsSubmittedToday || 0) >= 1, claimed: false },
        play_minigame: { current: miniGamesPlayedToday || 0, completed: (miniGamesPlayedToday || 0) >= 2, claimed: false },
        market_trade: { current: marketTradesToday || 0, completed: (marketTradesToday || 0) >= 1, claimed: false },
      },
      groupClaimed: false,
    };
  });

  // Countdown timer until midnight UTC
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setUTCHours(24, 0, 0, 0);
      const diff = Math.max(0, tomorrow.getTime() - now.getTime());

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, '0')}h ${mins
          .toString()
          .padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync external counters with state
  useEffect(() => {
    setState((prev) => {
      const openPacksCount = Math.max(prev.tasks.open_packs.current, packsOpenedToday);
      const winMatchCount = Math.max(prev.tasks.win_match.current, matchesWonToday);
      const sbcCount = Math.max(prev.tasks.submit_sbc.current, sbcsSubmittedToday);
      const minigameCount = Math.max(prev.tasks.play_minigame?.current || 0, miniGamesPlayedToday);
      const marketCount = Math.max(prev.tasks.market_trade?.current || 0, marketTradesToday);

      const next: DailyObjectivesStateV3 = {
        ...prev,
        lastUpdatedDate: todayStr,
        tasks: {
          open_packs: {
            ...prev.tasks.open_packs,
            current: openPacksCount,
            completed: openPacksCount >= 3,
          },
          win_match: {
            ...prev.tasks.win_match,
            current: winMatchCount,
            completed: winMatchCount >= 1,
          },
          submit_sbc: {
            ...prev.tasks.submit_sbc,
            current: sbcCount,
            completed: sbcCount >= 1,
          },
          play_minigame: {
            ...prev.tasks.play_minigame,
            current: minigameCount,
            completed: minigameCount >= 2,
          },
          market_trade: {
            ...prev.tasks.market_trade,
            current: marketCount,
            completed: marketCount >= 1,
          },
        },
      };

      try {
        localStorage.setItem(OBJECTIVE_STORAGE_KEYS.OBJECTIVE_STATE, JSON.stringify(next));
      } catch (_) {}

      return next;
    });
  }, [packsOpenedToday, matchesWonToday, sbcsSubmittedToday, miniGamesPlayedToday, marketTradesToday, todayStr]);

  // List of 5 daily objectives
  const tasksList: DailyObjectiveItem[] = [
    {
      id: 'open_packs',
      title: 'Pack Hunter',
      description: 'Rip open any 3 packs from the Pack Store or your My Packs vault.',
      category: 'Store & Packs',
      iconType: 'package',
      current: Math.min(3, state.tasks.open_packs.current),
      target: 3,
      completed: state.tasks.open_packs.completed,
      claimed: state.tasks.open_packs.claimed,
      coinReward: 500,
      actionTab: 'packs',
      actionLabel: 'Open Packs',
    },
    {
      id: 'win_match',
      title: 'Pitch Victor',
      description: 'Clinch 1 victory in Squad Clash simulation against top tier opponents.',
      category: 'Competitions',
      iconType: 'swords',
      current: Math.min(1, state.tasks.win_match.current),
      target: 1,
      completed: state.tasks.win_match.completed,
      claimed: state.tasks.win_match.claimed,
      coinReward: 500,
      actionTab: 'clash',
      actionLabel: 'Play Clash',
    },
    {
      id: 'submit_sbc',
      title: 'Squad Strategist',
      description: 'Assemble and submit any 1 Squad Building Challenge in SBC Challenges.',
      category: 'Club Management',
      iconType: 'layers',
      current: Math.min(1, state.tasks.submit_sbc.current),
      target: 1,
      completed: state.tasks.submit_sbc.completed,
      claimed: state.tasks.submit_sbc.claimed,
      coinReward: 500,
      actionTab: 'sbcs',
      actionLabel: 'Go to SBCs',
    },
    {
      id: 'play_minigame',
      title: 'Arcade Ace',
      description: 'Play 2 rounds in Mini-Games (Higher or Lower stat duel or Guess Who).',
      category: 'Mini-Games',
      iconType: 'gamepad',
      current: Math.min(2, state.tasks.play_minigame.current),
      target: 2,
      completed: state.tasks.play_minigame.completed,
      claimed: state.tasks.play_minigame.claimed,
      coinReward: 500,
      actionTab: 'minigames',
      actionLabel: 'Play Games',
    },
    {
      id: 'market_trade',
      title: 'Transfer Scout',
      description: 'Engage with the market: buy, sell, or quick-sell any player card today.',
      category: 'Transfer Market',
      iconType: 'market',
      current: Math.min(1, state.tasks.market_trade.current),
      target: 1,
      completed: state.tasks.market_trade.completed,
      claimed: state.tasks.market_trade.claimed,
      coinReward: 500,
      actionTab: 'market',
      actionLabel: 'View Market',
    },
  ];

  const completedCount = tasksList.filter((t) => t.completed).length;
  const allTasksCompleted = completedCount === 5;
  const [showCelebration, setShowCelebration] = useState(false);

  // Claim individual task
  const handleClaimTask = (taskId: 'open_packs' | 'win_match' | 'submit_sbc' | 'play_minigame' | 'market_trade', reward: number) => {
    sound.playGoalCheer();
    onAddCoins(reward);
    if (onAddEvoPoints) {
      onAddEvoPoints(100);
    }

    setState((prev) => {
      const updated: DailyObjectivesStateV3 = {
        ...prev,
        tasks: {
          ...prev.tasks,
          [taskId]: {
            ...prev.tasks[taskId],
            claimed: true,
          },
        },
      };
      try {
        localStorage.setItem(OBJECTIVE_STORAGE_KEYS.OBJECTIVE_STATE, JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
  };

  // Claim group reward: 2,500 coins + (Pack OR Exclusive Player)
  const handleClaimGroup = () => {
    if (!allTasksCompleted || state.groupClaimed) return;

    sound.playWalkoutFanfare();
    onAddCoins(2500);
    if (onAddEvoPoints) {
      onAddEvoPoints(300);
    }

    if (isPlayerDay && todayPlayerReward) {
      // Award the exclusive card to club
      onAddCardsToClub([todayPlayerReward]);

      // Record player as claimed forever
      const updatedClaimed = [...claimedPlayerIds, todayPlayerReward.id];
      setClaimedPlayerIds(updatedClaimed);
      try {
        localStorage.setItem(OBJECTIVE_STORAGE_KEYS.CLAIMED_PLAYERS, JSON.stringify(updatedClaimed));
      } catch (_) {}
    } else {
      // Award the daily bonus pack to vault
      onAddUnopenedPack(dailyBonusPack, 'Daily Objectives 5/5 Milestone', 'daily_objective');
    }

    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 6000);

    setState((prev) => {
      const updated: DailyObjectivesStateV3 = {
        ...prev,
        groupClaimed: true,
      };
      try {
        localStorage.setItem(OBJECTIVE_STORAGE_KEYS.OBJECTIVE_STATE, JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
  };

  // Helper icons
  const renderTaskIcon = (type: string) => {
    switch (type) {
      case 'package': return <Package className="w-5 h-5" />;
      case 'swords': return <Swords className="w-5 h-5" />;
      case 'layers': return <Layers className="w-5 h-5" />;
      case 'gamepad': return <Gamepad2 className="w-5 h-5" />;
      case 'market': return <Store className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Hero Showcase Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/80 to-slate-950 border border-indigo-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>5 Daily Objectives · Resets Every 24 Hours</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Daily Objectives</span>
              <span className="text-amber-400 text-2xl sm:text-3xl">🎯</span>
            </h1>
            <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
              Complete today's <strong>5 dynamic tasks</strong> to earn coin bonuses and claim the grand milestone:{' '}
              {isPlayerDay && todayPlayerReward ? (
                <strong className="text-amber-300 font-bold">
                  2,500 Coins + Exclusive {todayPlayerReward.name} ({todayPlayerReward.rating} OVR)!
                </strong>
              ) : (
                <strong className="text-cyan-300 font-bold">
                  2,500 Coins + Daily Bonus Pack!
                </strong>
              )}
            </p>
          </div>

          {/* Reset Countdown Timer Badge */}
          <div className="flex flex-col items-start md:items-end gap-2 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl backdrop-blur-md flex-shrink-0">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Next Daily Reset In</span>
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-cyan-300 tracking-wider">
              {timeLeft || '23h 59m'}
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              {completedCount} of 5 Tasks Completed
            </div>
          </div>
        </div>

        {/* Milestone Progress Bar */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Milestone Progress: {completedCount} / 5</span>
            </span>
            <span className={allTasksCompleted ? 'text-emerald-400 font-black' : 'text-amber-400'}>
              {allTasksCompleted ? 'All 5 Tasks Finished · Ready to Claim!' : `${5 - completedCount} tasks remaining today`}
            </span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-amber-400 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]"
              style={{ width: `${(completedCount / 5) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid: 5 Objectives List + Grand Group Reward Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Objectives Task List (2 cols on lg) */}
        <div className="lg:col-span-2 space-y-3.5">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Today's 5 Objectives</span>
            </h2>
            <div className="text-xs text-slate-400 font-mono">
              Valid until 00:00 UTC
            </div>
          </div>

          {tasksList.map((task) => {
            const pct = Math.min(100, Math.round((task.current / task.target) * 100));

            return (
              <div 
                key={task.id}
                className={`relative overflow-hidden rounded-2xl border transition-all p-4 backdrop-blur-md ${
                  task.completed
                    ? 'bg-slate-900/90 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {/* Left: Icon & Info */}
                  <div className="flex items-start gap-3.5">
                    <div className={`p-2.5 rounded-xl border flex-shrink-0 ${
                      task.completed 
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}>
                      {renderTaskIcon(task.iconType)}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                          {task.category}
                        </span>
                        {task.completed && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Done</span>
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                        {task.title}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed max-w-md">
                        {task.description}
                      </p>
                    </div>
                  </div>

                  {/* Right: Actions & Claim */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                    {/* Reward preview */}
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30">
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                      <span>+{task.coinReward.toLocaleString()}</span>
                    </div>

                    {/* Action buttons */}
                    {task.completed ? (
                      task.claimed ? (
                        <span className="text-xs font-semibold text-slate-500 px-3 py-1">
                          Claimed ✓
                        </span>
                      ) : (
                        <button
                          onClick={() => handleClaimTask(task.id, task.coinReward)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-transform active:scale-95"
                        >
                          <Gift className="w-3.5 h-3.5" />
                          <span>Claim +{task.coinReward}</span>
                        </button>
                      )
                    ) : (
                      <button
                        onClick={() => {
                          sound.playClick();
                          onNavigateToTab(task.actionTab);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-xl border border-slate-700 transition-colors"
                      >
                        <span>{task.actionLabel}</span>
                        <ArrowRight className="w-3 h-3 text-cyan-400" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Task Progress Tracker */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center gap-3">
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        task.completed ? 'bg-emerald-400' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400 flex-shrink-0">
                    {task.current} / {task.target}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Grand Milestone Group Reward Card (1 col on lg) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Gift className="w-4 h-4 text-amber-400" />
              <span>Group Reward</span>
            </h2>
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
              isPlayerDay 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
            }`}>
              {isPlayerDay ? '⭐ Exclusive Player Day' : '🎁 Bonus Pack Day'}
            </span>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 via-indigo-950/70 to-slate-950 border border-amber-500/40 p-5 shadow-2xl flex flex-col justify-between min-h-[460px]">
            {/* Ambient gold glow */}
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-44 h-44 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

            {/* Header info */}
            <div>
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-black uppercase tracking-wider">
                <Crown className="w-3 h-3 text-amber-400" />
                <span>Complete All 5 Tasks</span>
              </div>
              <h3 className="text-xl font-black text-white mt-2">
                {isPlayerDay && todayPlayerReward ? todayPlayerReward.name : 'Daily Milestone Bonus'}
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {isPlayerDay && todayPlayerReward ? (
                  <span>
                    Exclusive <strong>{todayPlayerReward.rating} OVR {todayPlayerReward.position}</strong> card. 
                    <span className="text-rose-400 font-semibold block mt-0.5">
                      ⚠️ Never found in packs! Missed forever if not completed today.
                    </span>
                  </span>
                ) : (
                  <span>
                    Guaranteed 83+ player pack + 2,500 coins. (Tomorrow will feature an exclusive player card!)
                  </span>
                )}
              </p>
            </div>

            {/* Visual: Exclusive Card or Pack Art */}
            <div className="my-auto text-center py-2 flex flex-col items-center justify-center">
              {isPlayerDay && todayPlayerReward ? (
                <div className="transform scale-95 transition-transform hover:scale-100">
                  <CardItem card={todayPlayerReward} size="md" interactive={false} />
                  <div className="mt-2 text-xs font-black text-amber-300">
                    {todayPlayerReward.club} · {todayPlayerReward.nation}
                  </div>
                </div>
              ) : (
                <div className="relative inline-block mx-auto mb-2 group">
                  <div className="w-28 h-36 mx-auto rounded-xl border border-amber-500/50 overflow-hidden shadow-2xl bg-slate-950">
                    <img
                      src={dailyBonusPack.imageAsset}
                      alt={dailyBonusPack.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-yellow-300 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-md">
                    83+ OVR
                  </span>
                  <div className="mt-2 text-xs font-bold text-slate-300">
                    {dailyBonusPack.name}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-300 mt-2">
                <span className="flex items-center gap-1 text-amber-400">
                  <Coins className="w-3.5 h-3.5" />
                  <span>+2,500 Coins</span>
                </span>
                <span>·</span>
                <span className={isPlayerDay ? 'text-amber-300 font-bold' : 'text-cyan-300'}>
                  {isPlayerDay ? '1x Exclusive Player' : '1x Bonus Pack'}
                </span>
              </div>
            </div>

            {/* Claim Group Button */}
            <div className="pt-2">
              {state.groupClaimed ? (
                <div className="w-full py-3 bg-slate-800/90 border border-emerald-500/40 rounded-xl text-center text-xs font-bold text-emerald-400 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Completed & Claimed Today ✓</span>
                </div>
              ) : allTasksCompleted ? (
                <button
                  onClick={handleClaimGroup}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm rounded-xl shadow-[0_0_20px_rgba(251,191,36,0.6)] transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 animate-bounce"
                >
                  <Gift className="w-4 h-4 text-slate-950" />
                  <span>
                    Claim 2,500 Coins & {isPlayerDay && todayPlayerReward ? todayPlayerReward.name : 'Pack'}!
                  </span>
                </button>
              ) : (
                <div className="w-full py-3 bg-slate-900/90 border border-slate-800 rounded-xl text-center text-xs font-semibold text-slate-500 flex items-center justify-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Complete {5 - completedCount} more tasks to unlock</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Schedule & Exclusivity Notice Strip */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-amber-400 flex-shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white">Daily Rotation Policy & Player Exclusivity</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Objective reward players are permanently retired if not claimed before the daily timer ends. They never appear in store packs or transfer market packs.
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 text-[11px] font-mono">
          <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-1 rounded-lg">
            Claimed: {claimedPlayerIds.length}
          </span>
          <span className="text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-1 rounded-lg">
            Missed: {missedPlayerIds.length}
          </span>
        </div>
      </div>

      {/* Celebration Popup Toast */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
          <div className="bg-slate-950/95 border-2 border-amber-400 rounded-3xl p-8 max-w-md w-full text-center shadow-[0_0_50px_rgba(245,158,11,0.6)] animate-in fade-in zoom-in duration-300 pointer-events-auto backdrop-blur-xl">
            <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-yellow-300 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-lg mb-4">
              🎉
            </div>
            <h3 className="text-2xl font-black text-white">
              Daily Milestone Unlocked!
            </h3>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              <strong className="text-amber-400 font-bold">+2,500 Coins</strong> added to your balance!
              {isPlayerDay && todayPlayerReward ? (
                <>
                  <br />
                  Your exclusive <strong className="text-amber-300 font-bold">{todayPlayerReward.name} ({todayPlayerReward.rating} OVR)</strong> has been added directly to your My Club collection!
                </>
              ) : (
                <>
                  <br />
                  Your <strong className="text-cyan-300 font-bold">Daily Bonus Pack</strong> has been delivered to your My Packs vault!
                </>
              )}
            </p>
            <button
              onClick={() => {
                setShowCelebration(false);
                if (isPlayerDay) {
                  onNavigateToTab('club');
                } else {
                  onNavigateToTab('mypacks');
                }
              }}
              className="mt-6 w-full py-3 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-sm rounded-xl shadow-lg transition-transform active:scale-95"
            >
              {isPlayerDay ? 'View in My Club' : 'Open Daily Bonus Pack'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
