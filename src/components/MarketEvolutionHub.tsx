import React, { useState, useEffect, useMemo } from 'react';
import { SoccerCard } from '../types/card';
import {
  MARKET_EVOLUTION_PAIRS,
  MarketEvolutionCardPair,
  MarketEvolutionStage,
  EVO_STAM_MAX_118,
  EVO_STAM_BASE_103,
} from '../data/marketEvolutionCards';
import { CardItem } from './CardItem';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { safeSetItem } from '../utils/safeStorage';
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
  Award,
  ChevronRight,
  Flame,
  Store,
  Coins,
  Crown,
  Check,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

interface MarketEvolutionHubProps {
  clubCards: SoccerCard[];
  onAddCardsToClub?: (cards: SoccerCard[]) => void;
  onAddCoins?: (amount: number) => void;
  onNavigateToTab: (tab: any) => void;
}

// Progress record stored in localStorage
interface PlayerEvoProgress {
  currentStage: number; // 1, 2, 3, or 4 (4 = Max Evolved)
  objectiveCounts: { [objId: string]: number };
  isCompleted: boolean;
}

const STORAGE_EVO_KEY = 'apex_fut_market_evo_progress_v2';

export const MarketEvolutionHub: React.FC<MarketEvolutionHubProps> = ({
  clubCards = [],
  onAddCardsToClub,
  onAddCoins,
  onNavigateToTab,
}) => {
  // Selected player pair (defaults to first pair: Francescoli)
  const [selectedKey, setSelectedKey] = useState<string>('francescoli');

  // Evolution progress per player stored in localStorage
  const [progressState, setProgressState] = useState<{ [key: string]: PlayerEvoProgress }>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_EVO_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Modal celebration for completed evolution
  const [evolutionCelebration, setEvolutionCelebration] = useState<{
    card: SoccerCard;
    title: string;
    isGrandReward?: boolean;
    coinsAwarded: number;
  } | null>(null);

  // Helper to get progress for a specific card key
  const getProgress = (key: string): PlayerEvoProgress => {
    return (
      progressState[key] || {
        currentStage: 1,
        objectiveCounts: {},
        isCompleted: false,
      }
    );
  };

  // Check which players' base cards exist in user's club
  const ownedBaseCardMap = useMemo(() => {
    const map = new Map<string, boolean>();
    MARKET_EVOLUTION_PAIRS.forEach((pair) => {
      const hasBase = clubCards.some(
        (c) =>
          c.id === pair.baseCard.id ||
          c.id.replace(/_inst_.*$/, '') === pair.baseCard.id ||
          (c.name.toLowerCase() === pair.baseCard.name.toLowerCase() && c.rating === pair.baseCard.rating)
      );
      map.set(pair.key, hasBase);
    });
    return map;
  }, [clubCards]);

  // Check which players' max cards exist in user's club or marked complete
  const isMaxEvolved = (key: string): boolean => {
    const prog = getProgress(key);
    if (prog.isCompleted) return true;
    const pair = MARKET_EVOLUTION_PAIRS.find((p) => p.key === key);
    if (!pair) return false;
    return clubCards.some(
      (c) =>
        c.id === pair.maxCard.id ||
        c.id.replace(/_inst_.*$/, '') === pair.maxCard.id ||
        (c.name.toLowerCase() === pair.maxCard.name.toLowerCase() && c.rating === pair.maxCard.rating)
    );
  };

  // Check if all 4 prerequisite base cards (Francescoli, Di Natale, Márquez, Carvalho) are fully evolved
  const fourPrerequisitesComplete = useMemo(() => {
    const prereqKeys = ['francescoli', 'di_natale', 'marquez', 'carvalho'];
    return prereqKeys.every((k) => isMaxEvolved(k));
  }, [progressState, clubCards]);

  // Count of evolved cards out of 4
  const completedPrereqCount = useMemo(() => {
    const prereqKeys = ['francescoli', 'di_natale', 'marquez', 'carvalho'];
    return prereqKeys.filter((k) => isMaxEvolved(k)).length;
  }, [progressState, clubCards]);

  const isStamMaxCompleted = isMaxEvolved('stam');

  // Current active pair
  const activePair = useMemo(() => {
    return MARKET_EVOLUTION_PAIRS.find((p) => p.key === selectedKey) || MARKET_EVOLUTION_PAIRS[0];
  }, [selectedKey]);

  const activeProgress = getProgress(activePair.key);
  const currentStageIndex = Math.min(activeProgress.currentStage - 1, activePair.stages.length - 1);
  const currentStage = activePair.stages[currentStageIndex];
  const isCurrentCardCompleted = activeProgress.isCompleted || isMaxEvolved(activePair.key);

  const isCurrentStamLocked = activePair.key === 'stam' && !fourPrerequisitesComplete;

  // Check if user owns base card for active pair
  const isCurrentBaseOwned = ownedBaseCardMap.get(activePair.key) || isCurrentCardCompleted;

  // Persist updated progress
  const updateProgress = (key: string, newProg: PlayerEvoProgress) => {
    const updated = { ...progressState, [key]: newProg };
    setProgressState(updated);
    safeSetItem(STORAGE_EVO_KEY, JSON.stringify(updated));
  };

  // Trigger celebration modal and award evolved card
  const handleCompleteFinalEvolution = (pair: MarketEvolutionCardPair) => {
    sound.playLevelUp();
    setTimeout(() => sound.playWalkoutFanfare(), 300);

    confetti({
      particleCount: 220,
      spread: 120,
      origin: { y: 0.55 },
      colors: ['#06b6d4', '#10b981', '#facc15', '#ec4899', '#ffffff'],
    });

    const isStam = pair.key === 'stam';
    const bonus = isStam ? 250000 : 50000;

    // Add max card to user's club
    if (onAddCardsToClub) {
      onAddCardsToClub([pair.maxCard]);
    }

    if (onAddCoins) {
      onAddCoins(bonus);
    }

    const updatedProg: PlayerEvoProgress = {
      currentStage: 4,
      objectiveCounts: {},
      isCompleted: true,
    };
    updateProgress(pair.key, updatedProg);

    setEvolutionCelebration({
      card: pair.maxCard,
      title: `${pair.name} Evolved to ${pair.maxCard.rating} OVR!`,
      isGrandReward: isStam,
      coinsAwarded: bonus,
    });
  };

  // Simulate a match to advance objectives (+1 match, +1 goal, +1 win)
  const handleSimulateMatch = () => {
    if (isCurrentCardCompleted || isCurrentStamLocked) return;

    sound.playGoalCheer();
    const prog = getProgress(activePair.key);
    const updatedCounts = { ...prog.objectiveCounts };

    currentStage.objectives.forEach((obj) => {
      const current = updatedCounts[obj.id] || 0;
      updatedCounts[obj.id] = Math.min(obj.targetCount, current + 1);
    });

    // Check if stage objectives all met
    const allStageObjectivesMet = currentStage.objectives.every(
      (obj) => (updatedCounts[obj.id] || 0) >= obj.targetCount
    );

    if (allStageObjectivesMet) {
      if (prog.currentStage >= activePair.stages.length) {
        // Final stage complete!
        handleCompleteFinalEvolution(activePair);
      } else {
        // Advance to next stage!
        sound.playLevelUp();
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
        const nextProg: PlayerEvoProgress = {
          currentStage: prog.currentStage + 1,
          objectiveCounts: {},
          isCompleted: false,
        };
        updateProgress(activePair.key, nextProg);
      }
    } else {
      updateProgress(activePair.key, {
        ...prog,
        objectiveCounts: updatedCounts,
      });
    }
  };

  // Instant complete current stage
  const handleInstantCompleteStage = () => {
    if (isCurrentCardCompleted || isCurrentStamLocked) return;

    const prog = getProgress(activePair.key);
    if (prog.currentStage >= activePair.stages.length) {
      handleCompleteFinalEvolution(activePair);
    } else {
      sound.playLevelUp();
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      const nextProg: PlayerEvoProgress = {
        currentStage: prog.currentStage + 1,
        objectiveCounts: {},
        isCompleted: false,
      };
      updateProgress(activePair.key, nextProg);
    }
  };

  // Instant max evolution dev helper
  const handleInstantMaxEvolution = (pair: MarketEvolutionCardPair) => {
    handleCompleteFinalEvolution(pair);
  };

  // Instant complete all 4 prerequisites dev helper
  const handleInstantCompleteAllPrereqs = () => {
    sound.playLevelUp();
    confetti({ particleCount: 180, spread: 110, origin: { y: 0.5 } });

    const newProgState = { ...progressState };
    const evolvedCards: SoccerCard[] = [];

    MARKET_EVOLUTION_PAIRS.filter((p) => p.key !== 'stam').forEach((p) => {
      newProgState[p.key] = {
        currentStage: 4,
        objectiveCounts: {},
        isCompleted: true,
      };
      evolvedCards.push(p.maxCard);
    });

    setProgressState(newProgState);
    safeSetItem(STORAGE_EVO_KEY, JSON.stringify(newProgState));

    if (onAddCardsToClub) {
      onAddCardsToClub(evolvedCards);
    }
    if (onAddCoins) {
      onAddCoins(100000);
    }

    setEvolutionCelebration({
      card: MARKET_EVOLUTION_PAIRS[0].maxCard,
      title: '⚡ All 4 Base Cards Fully Evolved! Stam 118 Unlocked!',
      coinsAwarded: 100000,
    });
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-cyan-500/50 bg-gradient-to-r from-slate-950 via-[#071924] to-slate-950 p-6 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.25)]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 flex items-center gap-1.5 font-mono shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                <Dna className="w-3.5 h-3.5 text-cyan-400" />
                <span>Market Evolution Legends</span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 font-mono">
                Market Base Cards · Objective Upgrades
              </span>
              {isStamMaxCompleted && (
                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/50 flex items-center gap-1 font-mono">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>118 Stam Claimed!</span>
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase">
              Market Evolution <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">Legends</span> 🧬
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Buy low-version base cards exclusively on the <strong className="text-cyan-400">Transfer Market</strong> (Francescoli 95, Di Natale 100, Márquez 101, Carvalho 94, Stam 103). Complete multi-stage gameplay objectives to evolve them to their maximum ratings! Fully evolving all 4 players unlocks <strong className="text-amber-400">118 CM Jaap Stam</strong>!
            </p>

            {/* Prerequisite Evolution Tracker */}
            <div className="pt-2 space-y-2">
              <div className="flex justify-between items-center text-xs font-mono font-bold">
                <span className="text-slate-400 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Prerequisites to Unlock 118 Stam</span>
                </span>
                <span className={fourPrerequisitesComplete ? 'text-emerald-400' : 'text-cyan-400'}>
                  {completedPrereqCount} / 4 Base Cards Fully Evolved
                </span>
              </div>
              <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden border border-cyan-500/30 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 rounded-full transition-all duration-700 shadow-[0_0_15px_rgba(6,182,212,0.8)]"
                  style={{ width: `${(completedPrereqCount / 4) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Grand Set Reward Teaser Widget: 118 Stam */}
          <div className="w-full lg:w-auto flex-shrink-0 flex flex-col items-center p-4 rounded-2xl bg-slate-900/90 border-2 border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.25)]">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-black uppercase text-amber-300 tracking-wider">
                Supreme Master Reward
              </span>
            </div>

            <div
              className="relative group cursor-pointer"
              onClick={() => {
                setSelectedKey('stam');
                sound.playClick();
              }}
            >
              <CardItem card={EVO_STAM_MAX_118} size="sm" interactive={false} />
              {!fourPrerequisitesComplete ? (
                <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs rounded-xl flex flex-col items-center justify-center p-2 text-center border border-slate-700">
                  <Lock className="w-7 h-7 text-amber-400 mb-1" />
                  <span className="text-[10px] font-mono font-bold text-amber-300">
                    {completedPrereqCount}/4 Evolved
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase font-black mt-0.5">
                    Locked Preview
                  </span>
                </div>
              ) : isStamMaxCompleted ? (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs rounded-xl flex flex-col items-center justify-center p-2 text-center border border-amber-500/50">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-1" />
                  <span className="text-[11px] font-black text-white uppercase">118 Evolved!</span>
                </div>
              ) : null}
            </div>

            <div className="mt-3 w-full">
              {isStamMaxCompleted ? (
                <div className="text-center py-1.5 px-3 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>118 Stam in Club</span>
                </div>
              ) : fourPrerequisitesComplete ? (
                <button
                  onClick={() => {
                    setSelectedKey('stam');
                    sound.playClick();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-[11px] uppercase tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.8)] animate-pulse hover:scale-105 transition-all"
                >
                  👑 Evolve Stam to 118!
                </button>
              ) : (
                <div className="text-center py-1.5 px-3 rounded-xl bg-slate-950 text-slate-400 border border-slate-800 text-[10px] font-mono font-bold">
                  Evolve 4/4 to Unlock Stam
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Global Action Toolbar */}
        <div className="relative z-10 flex flex-wrap items-center gap-3 pt-4 mt-6 border-t border-cyan-950/60 text-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">⚡ Quick Dev Helpers:</span>
          <button
            onClick={() => handleInstantMaxEvolution(activePair)}
            className="px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 text-[11px] font-mono font-bold transition-all hover:scale-105"
          >
            ⚡ Max Evolve Active ({activePair.name})
          </button>
          <button
            onClick={handleInstantCompleteAllPrereqs}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600/30 to-emerald-600/30 hover:bg-cyan-600/50 text-cyan-200 border border-cyan-500/50 text-[11px] font-mono font-bold transition-all hover:scale-105"
          >
            ⚡ Evolve All 4 Prereqs (Unlock Stam)
          </button>
          <button
            onClick={() => {
              onNavigateToTab('market');
              sound.playClick();
            }}
            className="ml-auto px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Buy Base Cards on Market</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 5 Cards Selection Carousel */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-black uppercase text-white tracking-wider flex items-center gap-2">
            <span className="text-cyan-400">#</span> Select Player Evolution
          </h2>
          <span className="text-xs font-mono text-slate-400">
            Buy base card on Market → Complete objectives to evolve
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {MARKET_EVOLUTION_PAIRS.map((pair, idx) => {
            const isSelected = selectedKey === pair.key;
            const completed = isMaxEvolved(pair.key);
            const isBaseOwned = ownedBaseCardMap.get(pair.key) || completed;
            const isLockedStam = pair.key === 'stam' && !fourPrerequisitesComplete;

            return (
              <button
                key={pair.key}
                onClick={() => {
                  setSelectedKey(pair.key);
                  sound.playClick();
                }}
                className={`relative flex flex-col items-center p-3 rounded-2xl transition-all border text-left ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.5)] scale-102 z-10'
                    : completed
                    ? 'bg-slate-900/80 border-emerald-500/40 hover:border-emerald-400'
                    : isLockedStam
                    ? 'bg-slate-950/70 border-slate-800 opacity-75'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Completed / Lock Badge */}
                {completed ? (
                  <div className="absolute top-2 right-2 z-20 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-md">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                ) : isLockedStam ? (
                  <div className="absolute top-2 right-2 z-20 w-5 h-5 rounded-full bg-slate-800 text-amber-400 border border-amber-500/50 flex items-center justify-center shadow-md">
                    <Lock className="w-3 h-3" />
                  </div>
                ) : null}

                {/* Rating badge */}
                <div className="absolute top-2 left-2 z-20 text-[9px] font-mono font-bold text-slate-400">
                  #{idx + 1}
                </div>

                {/* Card Thumbnail */}
                <div className="w-20 h-28 my-1 overflow-hidden rounded-lg flex items-center justify-center">
                  <img
                    src={completed ? pair.maxCard.fullCardImage : pair.baseCard.fullCardImage}
                    alt={pair.name}
                    className="w-full h-full object-contain filter drop-shadow-md"
                  />
                </div>

                {/* Player details */}
                <div className="w-full text-center mt-1">
                  <div className="flex items-center justify-center gap-1 font-mono text-xs">
                    <span className="text-slate-400 font-bold">{pair.baseCard.rating}</span>
                    <span className="text-cyan-400">→</span>
                    <span className="text-amber-400 font-black">{pair.maxCard.rating}</span>
                    <span className="text-[10px] text-slate-400 font-bold ml-1">{pair.baseCard.position}</span>
                  </div>
                  <div className="text-xs font-black text-white truncate max-w-full mt-0.5">
                    {pair.name}
                  </div>
                </div>

                {/* Ownership / status bar */}
                <div className="mt-2 w-full">
                  {completed ? (
                    <span className="block text-center text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/60 rounded py-0.5 border border-emerald-800/40">
                      MAX EVOLVED ✓
                    </span>
                  ) : isLockedStam ? (
                    <span className="block text-center text-[9px] font-mono font-bold text-amber-400 bg-amber-950/60 rounded py-0.5 border border-amber-800/40">
                      LOCKED (4 REQ)
                    </span>
                  ) : isBaseOwned ? (
                    <span className="block text-center text-[9px] font-mono font-bold text-cyan-300 bg-cyan-950/60 rounded py-0.5 border border-cyan-800/40">
                      STAGE {getProgress(pair.key).currentStage}/3
                    </span>
                  ) : (
                    <span className="block text-center text-[9px] font-mono font-bold text-amber-400 bg-slate-950 rounded py-0.5 border border-slate-800">
                      NOT IN CLUB
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Active Evolution Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Before & After Card Evolution Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl p-6 bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-black uppercase text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-full border border-cyan-800/50">
                {activePair.name} Evolution
              </span>
              {isCurrentCardCompleted ? (
                <span className="text-[10px] font-mono font-black uppercase text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/40 flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Max Form Complete</span>
                </span>
              ) : isCurrentBaseOwned ? (
                <span className="text-[10px] font-mono font-black uppercase text-cyan-300 bg-cyan-500/20 px-2.5 py-1 rounded-full border border-cyan-500/40 flex items-center gap-1 font-mono">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Base in Club</span>
                </span>
              ) : (
                <span className="text-[10px] font-mono font-black uppercase text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-full border border-amber-500/40 font-mono">
                  Market Purchase Needed
                </span>
              )}
            </div>

            {/* Side by side cards preview */}
            <div className="flex items-center justify-around gap-2 p-4 rounded-2xl bg-slate-950/90 border border-slate-800">
              <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase font-mono text-slate-400 mb-1 font-bold">
                  Base Card ({activePair.baseCard.rating})
                </span>
                <CardItem card={activePair.baseCard} size="sm" interactive={false} />
              </div>

              <div className="flex flex-col items-center text-cyan-400">
                <Dna className="w-6 h-6 animate-pulse mb-1" />
                <ArrowRight className="w-5 h-5 stroke-[3]" />
                <span className="text-[9px] font-mono font-bold mt-1 text-emerald-400">
                  +{activePair.maxCard.rating - activePair.baseCard.rating} OVR
                </span>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase font-mono text-amber-400 mb-1 font-bold">
                  Max Card ({activePair.maxCard.rating})
                </span>
                <CardItem card={activePair.maxCard} size="sm" interactive={false} />
              </div>
            </div>

            {/* Base Card Ownership Status & Market Link */}
            {!isCurrentBaseOwned && !isCurrentCardCompleted && (
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase">
                  <Store className="w-4 h-4" />
                  <span>Base Card Required</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  You need to purchase <strong className="text-white">{activePair.name} ({activePair.baseCard.rating} {activePair.baseCard.position})</strong> from the Transfer Market before you can upgrade his stats in Evolution!
                </p>
                <button
                  onClick={() => {
                    onNavigateToTab('market');
                    sound.playClick();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:scale-102 transition-all"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Go to Market to Buy {activePair.name}</span>
                </button>
              </div>
            )}

            {/* Gated Stam Lock Banner */}
            {isCurrentStamLocked && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/50 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase">
                  <Lock className="w-4 h-4" />
                  <span>Stam Master Evolution Locked</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  To evolve Jaap Stam into his legendary <strong className="text-amber-400">118 OVR CM</strong> form, you must first complete all 4 base card evolutions:
                </p>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1">
                  {MARKET_EVOLUTION_PAIRS.filter((p) => p.key !== 'stam').map((p) => {
                    const done = isMaxEvolved(p.key);
                    return (
                      <div
                        key={p.key}
                        className={`p-1.5 rounded-lg border flex items-center justify-between ${
                          done ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        <span className="truncate">{p.name}</span>
                        <span>{done ? '✓' : '✗'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Multi-Stage Objectives & Progression Actions */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl p-6 sm:p-8 bg-slate-900/80 border-2 border-cyan-500/40 shadow-2xl space-y-6">
            {/* Stage Selector Tabs */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">
                  Evolution Pathway
                </span>
                <h3 className="text-xl font-black text-white uppercase">
                  {isCurrentCardCompleted
                    ? '🎉 Evolution Fully Completed!'
                    : `Stage ${currentStage.stageNumber} of 3: ${currentStage.stageName}`}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">
                  Target Rating
                </span>
                <span className="text-base font-black font-mono text-amber-400">
                  {isCurrentCardCompleted ? activePair.maxCard.rating : currentStage.ratingUpgrade} OVR
                </span>
              </div>
            </div>

            {/* If card is fully completed */}
            {isCurrentCardCompleted ? (
              <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 border-2 border-emerald-500/50 space-y-3 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 text-emerald-300 font-black text-base uppercase">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  <span>{activePair.name} ({activePair.maxCard.rating} OVR) in Club!</span>
                </div>
                <p className="text-xs text-slate-300">
                  This superstar has reached his maximum potential! Use him in Match Simulator and Squad Builder.
                </p>
                {activePair.key !== 'stam' && !isStamMaxCompleted && (
                  <button
                    onClick={() => {
                      setSelectedKey('stam');
                      sound.playClick();
                    }}
                    className="mt-2 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md hover:scale-105 transition-all flex items-center gap-1.5"
                  >
                    <span>Check 118 Stam Progress</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : isCurrentStamLocked ? (
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
                <Lock className="w-10 h-10 text-amber-400 mx-auto" />
                <h4 className="text-lg font-black text-white uppercase">
                  Complete the 4 Base Evolutions First!
                </h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Jaap Stam&apos;s 118 CM Master Evolution is gated. Once you evolve Francescoli (117), Di Natale (109), Márquez (115), and Carvalho (115), this evolution studio will unlock automatically.
                </p>
                <div className="pt-2">
                  <button
                    onClick={handleInstantCompleteAllPrereqs}
                    className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold transition-all"
                  >
                    ⚡ Dev: Instant Evolve All 4 Prereqs
                  </button>
                </div>
              </div>
            ) : (
              /* Active Stage Objectives List */
              <div className="space-y-4">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Target className="w-4 h-4 text-cyan-400" />
                    <span>Stage {currentStage.stageNumber} Objectives:</span>
                  </h4>

                  {currentStage.objectives.map((obj) => {
                    const currentCount = activeProgress.objectiveCounts[obj.id] || 0;
                    const isDone = currentCount >= obj.targetCount;
                    const pct = Math.min(100, Math.round((currentCount / obj.targetCount) * 100));

                    return (
                      <div
                        key={obj.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          isDone
                            ? 'bg-emerald-950/40 border-emerald-500/50'
                            : 'bg-slate-950/80 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {isDone ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border-2 border-slate-600" />
                            )}
                            <span className="text-xs font-bold text-white">{obj.title}</span>
                          </div>
                          <span className="text-xs font-mono font-bold text-slate-300">
                            {currentCount} / {obj.targetCount}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mb-2">{obj.description}</p>
                        <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Evolution Gameplay Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={handleSimulateMatch}
                    className="w-full sm:w-auto flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:scale-[1.02] transition-all"
                  >
                    <Swords className="w-4 h-4" />
                    <span>Play Match Simulation (+1 Progress)</span>
                  </button>

                  <button
                    onClick={handleInstantCompleteStage}
                    className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-slate-950 hover:bg-slate-850 text-cyan-300 border border-cyan-500/40 font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all hover:scale-102"
                  >
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Complete Stage {currentStage.stageNumber}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Celebration Modal */}
      {evolutionCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-cyan-500/70 shadow-[0_0_80px_rgba(6,182,212,0.4)] text-center space-y-6">
            <div className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-cyan-400 bg-cyan-950/80 px-3 py-1 rounded-full border border-cyan-800 font-mono inline-block">
                {evolutionCelebration.isGrandReward ? '👑 SUPREME SET MASTER' : '🎉 EVOLUTION COMPLETE!'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase">
                {evolutionCelebration.title}
              </h2>
            </div>

            {/* Walkout Card Display */}
            <div className="flex justify-center py-2">
              <CardItem card={evolutionCelebration.card} size="walkout" interactive={true} />
            </div>

            {/* Rewards Notice */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/30 flex items-center justify-center gap-6">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase">
                <ShieldCheck className="w-4 h-4" />
                <span>Added To Club</span>
              </div>
              <div className="h-4 w-px bg-slate-800" />
              <div className="flex items-center gap-2 text-amber-400 font-black font-mono text-sm">
                <Coins className="w-4 h-4" />
                <span>+{evolutionCelebration.coinsAwarded.toLocaleString()} Coins</span>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => {
                setEvolutionCelebration(null);
                sound.playClick();
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.7)] hover:scale-[1.02] transition-all"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
