import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Gift, 
  Coins, 
  Package, 
  Trophy, 
  ArrowRight, 
  Sparkles, 
  RotateCcw,
  Layers,
  Swords,
  Flame,
  Crown
} from 'lucide-react';
import { PackDefinition } from '../types/card';
import { sound } from '../utils/audio';

export interface DailyObjectiveItem {
  id: 'open_packs' | 'win_match' | 'submit_sbc';
  title: string;
  description: string;
  category: string;
  iconName: 'package' | 'swords' | 'layers';
  current: number;
  target: number;
  completed: boolean;
  claimed: boolean;
  coinReward: number;
  actionTab: 'packs' | 'clash' | 'sbcs' | 'minigames';
  actionLabel: string;
}

export interface DailyObjectivesState {
  lastUpdatedDate: string;
  tasks: {
    open_packs: { current: number; completed: boolean; claimed: boolean };
    win_match: { current: number; completed: boolean; claimed: boolean };
    submit_sbc: { current: number; completed: boolean; claimed: boolean };
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
  dailyBonusPack: PackDefinition;
  onNavigateToTab: (tab: any) => void;
  // Live stats from App
  packsOpenedToday: number;
  matchesWonToday: number;
  sbcsSubmittedToday: number;
  onResetObjectives?: () => void;
}

const STORAGE_KEY = 'apex_fut_daily_objectives_v2';

export const DailyObjectives: React.FC<DailyObjectivesProps> = ({
  onAddCoins,
  onAddUnopenedPack,
  dailyBonusPack,
  onNavigateToTab,
  packsOpenedToday,
  matchesWonToday,
  sbcsSubmittedToday,
  onResetObjectives,
}) => {
  const getTodayDateStr = () => new Date().toISOString().split('T')[0];

  const [state, setState] = useState<DailyObjectivesState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.lastUpdatedDate === getTodayDateStr()) {
          return parsed;
        }
      }
    } catch (_) {}

    return {
      lastUpdatedDate: getTodayDateStr(),
      tasks: {
        open_packs: { current: packsOpenedToday || 0, completed: (packsOpenedToday || 0) >= 3, claimed: false },
        win_match: { current: matchesWonToday || 0, completed: (matchesWonToday || 0) >= 1, claimed: false },
        submit_sbc: { current: sbcsSubmittedToday || 0, completed: (sbcsSubmittedToday || 0) >= 1, claimed: false },
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

      const next = {
        ...prev,
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
        },
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (_) {}

      return next;
    });
  }, [packsOpenedToday, matchesWonToday, sbcsSubmittedToday]);

  const tasksList: DailyObjectiveItem[] = [
    {
      id: 'open_packs',
      title: 'Pack Hunter',
      description: 'Rip open any 3 packs from the Store or your My Packs vault.',
      category: 'Store & Packs',
      iconName: 'package',
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
      description: 'Clinch 1 victory in Squad Clash simulation or Higher/Lower mini-games.',
      category: 'Competitions',
      iconName: 'swords',
      current: Math.min(1, state.tasks.win_match.current),
      target: 1,
      completed: state.tasks.win_match.completed,
      claimed: state.tasks.win_match.claimed,
      coinReward: 500,
      actionTab: 'clash',
      actionLabel: 'Play Match',
    },
    {
      id: 'submit_sbc',
      title: 'Squad Strategist',
      description: 'Assemble and submit any 1 Squad Building Challenge (e.g. Street Kings Haneen).',
      category: 'Club Management',
      iconName: 'layers',
      current: Math.min(1, state.tasks.submit_sbc.current),
      target: 1,
      completed: state.tasks.submit_sbc.completed,
      claimed: state.tasks.submit_sbc.claimed,
      coinReward: 500,
      actionTab: 'sbcs',
      actionLabel: 'Go to SBCs',
    },
  ];

  const completedCount = tasksList.filter((t) => t.completed).length;
  const allTasksCompleted = completedCount === 3;
  const [showCelebration, setShowCelebration] = useState(false);

  // Claim individual task
  const handleClaimTask = (taskId: 'open_packs' | 'win_match' | 'submit_sbc', reward: number) => {
    sound.playGoalCheer();
    onAddCoins(reward);

    setState((prev) => {
      const updated = {
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
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
  };

  // Claim group reward: 2,500 coins + Daily Bonus Pack
  const handleClaimGroup = () => {
    if (!allTasksCompleted || state.groupClaimed) return;

    sound.playWalkoutFanfare();
    onAddCoins(2500);
    onAddUnopenedPack(dailyBonusPack, 'Daily Objectives Milestone', 'daily_objective');

    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 5000);

    setState((prev) => {
      const updated = {
        ...prev,
        groupClaimed: true,
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
  };

  // Test simulation helper to reset or complete
  const handleManualReset = () => {
    sound.playClick();
    const fresh: DailyObjectivesState = {
      lastUpdatedDate: getTodayDateStr(),
      tasks: {
        open_packs: { current: 0, completed: false, claimed: false },
        win_match: { current: 0, completed: false, claimed: false },
        submit_sbc: { current: 0, completed: false, claimed: false },
      },
      groupClaimed: false,
    };
    setState(fresh);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    } catch (_) {}
    if (onResetObjectives) {
      onResetObjectives();
    }
  };

  const handleSimulateComplete = () => {
    sound.playClick();
    setState((prev) => {
      const completed: DailyObjectivesState = {
        ...prev,
        tasks: {
          open_packs: { current: 3, completed: true, claimed: prev.tasks.open_packs.claimed },
          win_match: { current: 1, completed: true, claimed: prev.tasks.win_match.claimed },
          submit_sbc: { current: 1, completed: true, claimed: prev.tasks.submit_sbc.claimed },
        },
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
      } catch (_) {}
      return completed;
    });
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
              <span>Daily Season 1 · Live Today</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Daily Objectives</span>
              <span className="text-amber-400 text-2xl sm:text-3xl">⚡</span>
            </h1>
            <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
              Complete today's 3 tasks to earn quick coin boosts and unlock the grand <strong className="text-amber-300 font-bold">2,500 Coins + Daily Bonus Pack</strong> reward!
            </p>
          </div>

          {/* Reset Countdown Timer Badge */}
          <div className="flex flex-col items-start md:items-end gap-2 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Next Reset In</span>
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-cyan-300 tracking-wider">
              {timeLeft || '23h 59m'}
            </div>
            <div className="text-[11px] text-slate-500">
              {completedCount} of 3 Objectives Completed
            </div>
          </div>
        </div>

        {/* Milestone Progress Bar */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Milestone Progress: {completedCount} / 3</span>
            </span>
            <span className="text-amber-400">
              {allTasksCompleted ? 'Group Reward Unlocked!' : `${3 - completedCount} remaining`}
            </span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-amber-400 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]"
              style={{ width: `${(completedCount / 3) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Objectives List + Grand Group Reward Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Objectives Task List (2 cols on lg) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Active Tasks</span>
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSimulateComplete}
                title="Quick-test by marking all tasks complete"
                className="text-[11px] text-slate-400 hover:text-cyan-300 bg-slate-900 border border-slate-800 hover:border-cyan-500/40 px-2.5 py-1 rounded-lg transition-colors"
              >
                Simulate Done
              </button>
              <button
                onClick={handleManualReset}
                title="Reset progress to 0"
                className="text-[11px] text-slate-400 hover:text-rose-300 bg-slate-900 border border-slate-800 hover:border-rose-500/40 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {tasksList.map((task) => {
            const pct = Math.min(100, Math.round((task.current / task.target) * 100));

            return (
              <div 
                key={task.id}
                className={`relative overflow-hidden rounded-2xl border transition-all p-5 backdrop-blur-md ${
                  task.completed
                    ? 'bg-slate-900/90 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {/* Left: Icon & Info */}
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl border flex-shrink-0 ${
                      task.completed 
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}>
                      {task.iconName === 'package' && <Package className="w-6 h-6" />}
                      {task.iconName === 'swords' && <Swords className="w-6 h-6" />}
                      {task.iconName === 'layers' && <Layers className="w-6 h-6" />}
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
                      <h3 className="text-base font-bold text-white tracking-wide">
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
                        <span className="text-xs font-semibold text-slate-500 px-3 py-1.5">
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
                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center gap-3">
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        task.completed 
                          ? 'bg-emerald-400' 
                          : 'bg-cyan-500'
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

        {/* Grand Milestone Card (1 col on lg) */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 pb-1">
            <Gift className="w-4 h-4 text-amber-400" />
            <span>Group Reward</span>
          </h2>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 via-indigo-950/60 to-slate-950 border border-amber-500/40 p-6 shadow-2xl flex flex-col justify-between h-[420px]">
            {/* Ambient gold glow */}
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

            {/* Header info */}
            <div>
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-black uppercase tracking-wider">
                <Crown className="w-3 h-3 text-amber-400" />
                <span>Complete All 3 Tasks</span>
              </div>
              <h3 className="text-xl font-black text-white mt-3">
                Daily Completion Bonus
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Finish every objective today to unlock the ultimate daily booster package.
              </p>
            </div>

            {/* Pack Art Visual & Rewards breakdown */}
            <div className="my-auto text-center py-4">
              <div className="relative inline-block mx-auto mb-3 group">
                <div className="w-28 h-36 mx-auto rounded-xl border border-amber-500/50 overflow-hidden shadow-2xl transform group-hover:scale-105 transition-transform bg-slate-950">
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
              </div>

              <div className="space-y-1.5">
                <div className="text-sm font-black text-amber-300">
                  {dailyBonusPack.name}
                </div>
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-300">
                  <span className="flex items-center gap-1 text-amber-400">
                    <Coins className="w-3.5 h-3.5" />
                    <span>+2,500 Coins</span>
                  </span>
                  <span>·</span>
                  <span className="text-cyan-300">1x Vault Pack</span>
                </div>
              </div>
            </div>

            {/* Claim Group Button */}
            <div>
              {state.groupClaimed ? (
                <div className="w-full py-3 bg-slate-800/80 border border-slate-700/60 rounded-xl text-center text-xs font-bold text-slate-400">
                  Completed & Claimed Today ✓
                </div>
              ) : allTasksCompleted ? (
                <button
                  onClick={handleClaimGroup}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm rounded-xl shadow-[0_0_20px_rgba(251,191,36,0.6)] transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 animate-bounce"
                >
                  <Gift className="w-4 h-4 text-slate-950" />
                  <span>Claim 2,500 Coins & Pack!</span>
                </button>
              ) : (
                <div className="w-full py-3 bg-slate-900 border border-slate-800 rounded-xl text-center text-xs font-semibold text-slate-500">
                  Complete {3 - completedCount} more to unlock
                </div>
              )}
            </div>
          </div>
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
              Daily Bonus Claimed!
            </h3>
            <p className="text-sm text-slate-300 mt-2">
              <strong className="text-amber-400 font-bold">+2,500 Coins</strong> added to your balance, and your <strong className="text-cyan-300 font-bold">Daily Bonus Pack</strong> has been delivered to your My Packs vault!
            </p>
            <button
              onClick={() => {
                setShowCelebration(false);
                onNavigateToTab('mypacks');
              }}
              className="mt-6 w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-black text-sm rounded-xl shadow-lg transition-transform active:scale-95"
            >
              Open Daily Bonus Pack Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
