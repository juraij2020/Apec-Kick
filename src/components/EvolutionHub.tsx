import React, { useState } from 'react';
import { SoccerCard, CardStats } from '../types/card';
import {
  SAKA_EVOLUTION_STAGES,
  EvolutionStage,
  buildEvolvedSakaCard,
} from '../data/evolutionSaka';
import { CardItem } from './CardItem';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  Dna,
  Zap,
  Sparkles,
  Trophy,
  CheckCircle2,
  Lock,
  ArrowRight,
  TrendingUp,
  Target,
  Gamepad2,
  Swords,
  PackageOpen,
  Award,
  ChevronRight,
  Flame,
} from 'lucide-react';

interface EvolutionHubProps {
  evoPoints: number;
  onDeductEvoPoints: (amount: number) => boolean;
  onAddEvoPoints: (amount: number) => void;
  currentStageIndex: number;
  currentStats: CardStats;
  onUpdateStatsAndStage: (newStats: CardStats, newStageIndex: number) => void;
  clubCards: SoccerCard[];
  onNavigateToTab: (tab: any) => void;
}

const STAT_KEYS: (keyof CardStats)[] = ['pac', 'sho', 'pas', 'dri', 'def', 'phy'];
const STAT_LABELS: Record<keyof CardStats, string> = {
  pac: 'Pace',
  sho: 'Shooting',
  pas: 'Passing',
  dri: 'Dribbling',
  def: 'Defending',
  phy: 'Physicality',
};

export const EvolutionHub: React.FC<EvolutionHubProps> = ({
  evoPoints,
  onDeductEvoPoints,
  currentStageIndex,
  currentStats,
  onUpdateStatsAndStage,
  onNavigateToTab,
}) => {
  const [justUpgradedStat, setJustUpgradedStat] = useState<string | null>(null);
  const [evolutionModal, setEvolutionModal] = useState<EvolutionStage | null>(null);

  const currentStage = SAKA_EVOLUTION_STAGES[currentStageIndex] || SAKA_EVOLUTION_STAGES[0];
  const isFinalStage = currentStageIndex >= SAKA_EVOLUTION_STAGES.length - 1;
  const nextStage = !isFinalStage ? SAKA_EVOLUTION_STAGES[currentStageIndex + 1] : null;

  // Build active live card
  const activeSakaCard = buildEvolvedSakaCard(currentStageIndex, currentStats);

  // Check which attributes can still be upgraded to reach next stage target
  const eligibleStatsToUpgrade: (keyof CardStats)[] = [];
  if (nextStage) {
    STAT_KEYS.forEach((key) => {
      if (currentStats[key] < nextStage.targetStats[key]) {
        eligibleStatsToUpgrade.push(key);
      }
    });
  }

  // Calculate overall progress towards next stage
  const totalStatsNeeded = nextStage
    ? STAT_KEYS.reduce((acc, key) => acc + Math.max(0, nextStage.targetStats[key] - currentStage.targetStats[key]), 0)
    : 1;

  const totalStatsEarned = nextStage
    ? STAT_KEYS.reduce((acc, key) => acc + Math.max(0, currentStats[key] - currentStage.targetStats[key]), 0)
    : 1;

  const progressPercent = nextStage
    ? Math.min(100, Math.round((totalStatsEarned / Math.max(1, totalStatsNeeded)) * 100))
    : 100;

  // Trigger celebration when an evolution stage completes
  const triggerEvolutionCelebration = (evolvedStage: EvolutionStage) => {
    sound.playLevelUp();
    setTimeout(() => sound.playWalkoutFanfare(), 300);

    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.55 },
      colors: ['#10b981', '#34d399', '#fbbf24', '#ffffff'],
    });

    setEvolutionModal(evolvedStage);
  };

  // Perform single random attribute roll (+1 stat for 10 Evo Points)
  const handleTrainRandomStat = () => {
    if (isFinalStage || !nextStage) return;
    if (eligibleStatsToUpgrade.length === 0) return;

    if (!onDeductEvoPoints(10)) {
      return;
    }

    // Pick random attribute that still needs upgrade
    const randomIndex = Math.floor(Math.random() * eligibleStatsToUpgrade.length);
    const chosenKey = eligibleStatsToUpgrade[randomIndex];

    const updatedStats: CardStats = {
      ...currentStats,
      [chosenKey]: currentStats[chosenKey] + 1,
    };

    setJustUpgradedStat(chosenKey);
    sound.playCardFlip();
    setTimeout(() => setJustUpgradedStat(null), 1500);

    // Check if this upgrade completed all stats for next stage
    const stillNeedsUpgrade = STAT_KEYS.some((key) => updatedStats[key] < nextStage.targetStats[key]);

    if (!stillNeedsUpgrade) {
      // Evolve to next stage!
      const nextIndex = currentStageIndex + 1;
      const evolvedStats = { ...nextStage.targetStats };
      onUpdateStatsAndStage(evolvedStats, nextIndex);
      triggerEvolutionCelebration(nextStage);
    } else {
      onUpdateStatsAndStage(updatedStats, currentStageIndex);
    }
  };

  // Train x5 rolls (50 Evo Points)
  const handleTrainFiveTimes = () => {
    if (isFinalStage || !nextStage) return;

    let pointsAvailable = evoPoints;
    let tempStats = { ...currentStats };
    let tempStage = currentStageIndex;
    let rollsDone = 0;

    while (rollsDone < 5 && pointsAvailable >= 10 && tempStage < SAKA_EVOLUTION_STAGES.length - 1) {
      const activeNext = SAKA_EVOLUTION_STAGES[tempStage + 1];
      const eligible = STAT_KEYS.filter((k) => tempStats[k] < activeNext.targetStats[k]);
      if (eligible.length === 0) {
        tempStage += 1;
        tempStats = { ...activeNext.targetStats };
        continue;
      }

      if (!onDeductEvoPoints(10)) break;
      pointsAvailable -= 10;
      rollsDone++;

      const chosenKey = eligible[Math.floor(Math.random() * eligible.length)];
      tempStats[chosenKey] += 1;

      // Check if evolved
      const finished = STAT_KEYS.every((k) => tempStats[k] >= activeNext.targetStats[k]);
      if (finished) {
        tempStage += 1;
        tempStats = { ...activeNext.targetStats };
        triggerEvolutionCelebration(activeNext);
        break;
      }
    }

    if (rollsDone > 0) {
      sound.playCoinClink();
      onUpdateStatsAndStage(tempStats, tempStage);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Banner: Evolutions DNA Station */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-emerald-500/50 bg-gradient-to-r from-slate-950 via-[#03241b] to-slate-950 p-6 shadow-[0_0_40px_rgba(16,185,129,0.25)] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-300 p-0.5 flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.6)] flex-shrink-0 animate-pulse">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-emerald-400">
              <Dna className="w-8 h-8" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide uppercase">
                Card Evolutions 🧬
              </h1>
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
                Saka 75 ➔ 98 Apex Active
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Spend Evolution Points to train stats. When all 6 attributes match the target, your card <strong>automatically evolves to the next OVR tier</strong>!
            </p>
          </div>
        </div>

        {/* Live Evo Points Wallet */}
        <div className="flex items-center gap-4 bg-slate-950/90 border-2 border-emerald-500/50 p-4 rounded-2xl shadow-inner">
          <div className="text-right">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Evolution Points
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono flex items-center gap-1.5 justify-end">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span>{evoPoints.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* ACTIVE CARD TRAINING ARENA                                        */}
      {/* ================================================================= */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Active Live Saka Card Display (4 cols) */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center space-y-4 text-center">
            <div className="relative group">
              <div className="absolute -inset-3 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-3xl blur-xl opacity-50 group-hover:opacity-80 transition-opacity animate-pulse" />
              <div className="relative transform hover:scale-105 transition-transform duration-300">
                <CardItem card={activeSakaCard} size="lg" interactive={true} />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                {currentStage.stageBadge}
              </span>
              <h2 className="text-xl font-black text-white">
                {currentStage.stageName}
              </h2>
              <p className="text-xs text-slate-400 max-w-xs line-clamp-2">
                {currentStage.lore}
              </p>
            </div>
          </div>

          {/* Right: Evolution Stat Radar & Controls (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Header Stage Transition Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Current Target
                </span>
                <div className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <span>{currentStage.rating} {currentStage.position}</span>
                  {!isFinalStage && nextStage && (
                    <>
                      <ArrowRight className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">{nextStage.rating} {nextStage.position}</span>
                    </>
                  )}
                  {isFinalStage && (
                    <span className="text-xs bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded">
                      👑 MAX LEVEL
                    </span>
                  )}
                </div>
              </div>

              {!isFinalStage && nextStage && (
                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-semibold">Tier Completion</span>
                  <span className="text-sm font-black text-emerald-400 font-mono">
                    {progressPercent}% Complete
                  </span>
                </div>
              )}
            </div>

            {/* Overall Stage Progress Bar */}
            {!isFinalStage && (
              <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            )}

            {/* 6 Individual Stat Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {STAT_KEYS.map((key) => {
                const currentVal = currentStats[key];
                const targetVal = nextStage ? nextStage.targetStats[key] : currentVal;
                const isMaxForTier = nextStage ? currentVal >= targetVal : true;
                const isJustUpgraded = justUpgradedStat === key;

                return (
                  <div
                    key={key}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isJustUpgraded
                        ? 'bg-emerald-950/80 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-102'
                        : isMaxForTier
                        ? 'bg-slate-950/60 border-emerald-500/40'
                        : 'bg-slate-950/80 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-white uppercase">{STAT_LABELS[key]}</span>
                        {isJustUpgraded && (
                          <span className="text-[10px] font-black text-emerald-400 animate-bounce">
                            +1 UPGRADED!
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 font-mono">
                        <span className="text-sm font-black text-white">{currentVal}</span>
                        {!isFinalStage && nextStage && (
                          <span className="text-xs text-slate-500">/ {targetVal}</span>
                        )}
                        {isMaxForTier && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 ml-1">
                            READY
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isMaxForTier
                            ? 'bg-emerald-400'
                            : isJustUpgraded
                            ? 'bg-yellow-400'
                            : 'bg-slate-600'
                        }`}
                        style={{
                          width: `${Math.min(100, (currentVal / (nextStage ? nextStage.targetStats[key] : 100)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Training Action Buttons */}
            {!isFinalStage ? (
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={handleTrainRandomStat}
                  disabled={evoPoints < 10 || eligibleStatsToUpgrade.length === 0}
                  className={`w-full sm:flex-1 py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all ${
                    evoPoints >= 10 && eligibleStatsToUpgrade.length > 0
                      ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 text-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:scale-102 active:scale-98'
                      : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-75'
                  }`}
                >
                  <Zap className="w-4 h-4 stroke-[3]" />
                  <span>Train Random Stat (10 Evo Points)</span>
                </button>

                <button
                  onClick={handleTrainFiveTimes}
                  disabled={evoPoints < 50 || eligibleStatsToUpgrade.length === 0}
                  className={`w-full sm:w-auto py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 border transition-all ${
                    evoPoints >= 50 && eligibleStatsToUpgrade.length > 0
                      ? 'bg-slate-950 hover:bg-slate-800 border-emerald-500/60 text-emerald-300 active:scale-95'
                      : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span>Train x5 (50 Pts)</span>
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-500/20 border-2 border-amber-400 text-amber-300 font-black text-center text-sm flex items-center justify-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>Supreme Evolution Achieved: 98 RW Bukayo Saka is at Maximum Potential!</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 14-STAGE EVOLUTION PROGRESSION ROADMAP                            */}
      {/* ================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-300">
              14-Stage Evolution Path (75 ➔ 98 OVR)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {currentStageIndex + 1} of 14 Completed
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {SAKA_EVOLUTION_STAGES.map((stg) => {
            const isCompleted = currentStageIndex > stg.stageIndex;
            const isCurrent = currentStageIndex === stg.stageIndex;
            const isLocked = currentStageIndex < stg.stageIndex;

            return (
              <div
                key={stg.stageIndex}
                className={`p-3 rounded-2xl border transition-all flex flex-col items-center justify-between text-center min-h-[110px] ${
                  isCurrent
                    ? 'bg-emerald-950/80 border-2 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-105'
                    : isCompleted
                    ? 'bg-slate-900/90 border-emerald-500/40 text-slate-300'
                    : 'bg-slate-950/60 border-slate-800 opacity-60'
                }`}
              >
                <div className="w-full flex items-center justify-between">
                  <span className="text-[9px] font-bold text-slate-500">
                    S{stg.stageIndex + 1}
                  </span>
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : isCurrent ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  ) : (
                    <Lock className="w-3 h-3 text-slate-600" />
                  )}
                </div>

                <div className="my-1">
                  <span
                    className={`text-2xl font-black block font-mono ${
                      isCurrent
                        ? 'text-emerald-300'
                        : isCompleted
                        ? 'text-white'
                        : 'text-slate-500'
                    }`}
                  >
                    {stg.rating}
                  </span>
                  <span className="text-[10px] font-black uppercase text-amber-400">
                    {stg.position}
                  </span>
                </div>

                <span className="text-[9px] text-slate-400 truncate w-full">
                  {stg.stageName}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================================================================= */}
      {/* HOW TO EARN EVOLUTION POINTS GUIDE                               */}
      {/* ================================================================= */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h4 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span>How to Earn Evolution Points</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div
            onClick={() => onNavigateToTab('objectives')}
            className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-400 cursor-pointer transition-all space-y-1"
          >
            <div className="flex items-center justify-between">
              <Target className="w-5 h-5 text-amber-400" />
              <span className="font-mono font-black text-emerald-400">+100 Pts</span>
            </div>
            <strong className="text-white block pt-1">Daily Objectives</strong>
            <p className="text-slate-400 text-[11px]">
              Complete daily tasks to claim 100 Evo Points per mission.
            </p>
          </div>

          <div
            onClick={() => onNavigateToTab('clash')}
            className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-emerald-400 cursor-pointer transition-all space-y-1"
          >
            <div className="flex items-center justify-between">
              <Swords className="w-5 h-5 text-emerald-400" />
              <span className="font-mono font-black text-emerald-400">+35 Pts</span>
            </div>
            <strong className="text-white block pt-1">Match Simulator / Clash</strong>
            <p className="text-slate-400 text-[11px]">
              Win simulated matches with your squad for 35 Evo Points per victory.
            </p>
          </div>

          <div
            onClick={() => onNavigateToTab('minigames')}
            className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-sky-400 cursor-pointer transition-all space-y-1"
          >
            <div className="flex items-center justify-between">
              <Gamepad2 className="w-5 h-5 text-sky-400" />
              <span className="font-mono font-black text-emerald-400">+25 Pts</span>
            </div>
            <strong className="text-white block pt-1">Mini-Games Arcade</strong>
            <p className="text-slate-400 text-[11px]">
              Win High-Low, Guess Who, or Pack Duo challenges for 25 Evo Points.
            </p>
          </div>

          <div
            onClick={() => onNavigateToTab('mypacks')}
            className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-purple-400 cursor-pointer transition-all space-y-1"
          >
            <div className="flex items-center justify-between">
              <PackageOpen className="w-5 h-5 text-purple-400" />
              <span className="font-mono font-black text-emerald-400">+5 Pts</span>
            </div>
            <strong className="text-white block pt-1">Pack Openings</strong>
            <p className="text-slate-400 text-[11px]">
              Rip Daily Reward Packs or Store packs for 5 Evo Points per pack.
            </p>
          </div>
        </div>
      </div>

      {/* Evolution Stage Up Celebration Modal */}
      {evolutionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
          <div className="relative max-w-lg w-full rounded-3xl border-2 border-emerald-400 bg-gradient-to-b from-slate-950 via-[#03241b] to-slate-950 p-6 text-center space-y-6 shadow-[0_0_60px_rgba(16,185,129,0.7)]">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 mx-auto flex items-center justify-center text-4xl shadow-inner">
              🧬
            </div>

            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                Stage Complete!
              </span>
              <h3 className="text-3xl font-black text-white">
                Evolved to {evolutionModal.rating} {evolutionModal.position}!
              </h3>
              <p className="text-xs text-slate-300">
                {evolutionModal.lore}
              </p>
            </div>

            <div className="flex justify-center py-2">
              <div className="transform hover:scale-105 transition-transform duration-300">
                <CardItem
                  card={buildEvolvedSakaCard(evolutionModal.stageIndex, evolutionModal.targetStats)}
                  size="md"
                  interactive={true}
                />
              </div>
            </div>

            <button
              onClick={() => setEvolutionModal(null)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg active:scale-95 transition-all"
            >
              Continue Training
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
