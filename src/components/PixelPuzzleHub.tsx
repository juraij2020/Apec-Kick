import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { SoccerCard } from '../types/card';
import {
  PIXEL_PUZZLE_CARDS,
  YEREMY_PINO_108_SET_REWARD,
} from '../data/pixelCards';
import { CardItem } from './CardItem';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { safeSetItem } from '../utils/safeStorage';
import {
  Gamepad2,
  Trophy,
  CheckCircle2,
  Sparkles,
  Shuffle,
  Eye,
  EyeOff,
  Coins,
  Crown,
  Award,
  Zap,
  ArrowRight,
  RotateCcw,
  Layers,
  ChevronRight,
  ShieldCheck,
  Check,
  Star,
  Sliders,
} from 'lucide-react';

interface PixelPuzzleHubProps {
  clubCards?: SoccerCard[];
  onAddCardsToClub: (cards: SoccerCard[]) => void;
  onAddCoins?: (amount: number) => void;
  onNavigateToSetRewards?: () => void;
  onMiniGamePlayed?: () => void;
}

export interface JigsawGridConfig {
  pieces: number;
  cols: number;
  rows: number;
  difficultyLabel: string;
}

/**
 * Calculates exact jigsaw piece count and aspect-ratio matching grid
 * directly proportional to card rating:
 * - 100 OVR (Pedri): 100 pieces (10x10 grid)
 * - 102 OVR (Nico Paz, Cubarsí, Palmer): 102 pieces (6x17 grid)
 * - 104 OVR (Porro, João Pedro): 104 pieces (8x13 grid)
 * - 105 OVR (Pickford, Gonçalves, Neto): 105 pieces (7x15 grid)
 */
export function getJigsawConfig(rating: number): JigsawGridConfig {
  if (rating === 100) {
    return { pieces: 100, cols: 10, rows: 10, difficultyLabel: '100 Pieces (10×10 Grid)' };
  }
  if (rating === 102) {
    return { pieces: 102, cols: 6, rows: 17, difficultyLabel: '102 Pieces (6×17 Grid)' };
  }
  if (rating === 104) {
    return { pieces: 104, cols: 8, rows: 13, difficultyLabel: '104 Pieces (8×13 Grid)' };
  }
  if (rating === 105) {
    return { pieces: 105, cols: 7, rows: 15, difficultyLabel: '105 Pieces (7×15 Grid)' };
  }
  // Generic fallback if rating varies
  const cols = 10;
  const rows = Math.ceil(rating / 10);
  return { pieces: rating, cols, rows, difficultyLabel: `${rating} Pieces (${cols}×${rows} Grid)` };
}

export const PixelPuzzleHub: React.FC<PixelPuzzleHubProps> = ({
  clubCards = [],
  onAddCardsToClub,
  onAddCoins,
  onNavigateToSetRewards,
  onMiniGamePlayed,
}) => {
  // Selected player puzzle to solve (defaults to first unsolved player or index 0)
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(
    PIXEL_PUZZLE_CARDS[0].id
  );

  // Completed puzzles set stored in localStorage
  const [completedPuzzles, setCompletedPuzzles] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('apex_fut_pixel_puzzles_completed_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Claimed Yeremy Pino set reward tracker
  const [claimedYeremyPino, setClaimedYeremyPino] = useState<boolean>(() => {
    try {
      return localStorage.getItem('apex_fut_claimed_yeremy_pino_108') === 'true';
    } catch {
      return false;
    }
  });

  // Current active player card
  const activeCard = useMemo(() => {
    return (
      PIXEL_PUZZLE_CARDS.find((c) => c.id === selectedPlayerId) ||
      PIXEL_PUZZLE_CARDS[0]
    );
  }, [selectedPlayerId]);

  // Current jigsaw dimensions based on player rating
  const gridConfig = useMemo(() => {
    return getJigsawConfig(activeCard.rating);
  }, [activeCard.rating]);

  // Puzzle board state: array of piece indices representing original positions
  const [boardTiles, setBoardTiles] = useState<number[]>([]);
  const [selectedTileIndex, setSelectedTileIndex] = useState<number | null>(null);
  const [moveCount, setMoveCount] = useState<number>(0);
  const [isSolvedCurrent, setIsSolvedCurrent] = useState<boolean>(false);

  // Blurred Reference Preview Mode: 'blurred' (default as requested), 'soft', or 'clear'
  const [previewBlurMode, setPreviewBlurMode] = useState<'blurred' | 'soft' | 'clear'>('blurred');

  // Victory celebration modal
  const [celebrationCard, setCelebrationCard] = useState<{
    card: SoccerCard;
    bonusCoins: number;
    title: string;
    isGrandReward?: boolean;
  } | null>(null);

  // Count of tiles currently in their exact solved positions
  const correctTilesCount = useMemo(() => {
    if (!boardTiles || boardTiles.length === 0) return 0;
    return boardTiles.filter((val, idx) => val === idx).length;
  }, [boardTiles]);

  // Shuffle the tiles (ensures not all in solved order)
  const shuffleTiles = useCallback(() => {
    sound.playCardFlip();
    const count = gridConfig.pieces;
    const baseArray = Array.from({ length: count }, (_, i) => i);

    let shuffled: number[];
    do {
      shuffled = [...baseArray].sort(() => Math.random() - 0.5);
    } while (shuffled.every((val, idx) => val === idx));

    setBoardTiles(shuffled);
    setSelectedTileIndex(null);
    setMoveCount(0);
    setIsSolvedCurrent(false);
  }, [gridConfig.pieces]);

  // When active player changes, prepare board
  useEffect(() => {
    const isAlreadyCompleted = completedPuzzles.includes(activeCard.id);
    if (isAlreadyCompleted) {
      const solvedArray = Array.from({ length: gridConfig.pieces }, (_, i) => i);
      setBoardTiles(solvedArray);
      setIsSolvedCurrent(true);
      setSelectedTileIndex(null);
    } else {
      shuffleTiles();
    }
  }, [activeCard.id, gridConfig.pieces, completedPuzzles, shuffleTiles]);

  // Handle tile click (swap mechanic)
  const handleTileClick = (index: number) => {
    if (isSolvedCurrent) return;

    sound.playClick();

    if (selectedTileIndex === null) {
      setSelectedTileIndex(index);
    } else if (selectedTileIndex === index) {
      // Deselect if clicking the same tile
      setSelectedTileIndex(null);
    } else {
      // Swap tiles on the board
      const nextTiles = [...boardTiles];
      const temp = nextTiles[selectedTileIndex];
      nextTiles[selectedTileIndex] = nextTiles[index];
      nextTiles[index] = temp;

      setBoardTiles(nextTiles);
      setSelectedTileIndex(null);
      setMoveCount((prev) => prev + 1);

      // Check if solved!
      const solved = nextTiles.every((val, idx) => val === idx);
      if (solved) {
        handlePuzzleSolved(activeCard);
      }
    }
  };

  // Puzzle solved handler
  const handlePuzzleSolved = (card: SoccerCard) => {
    setIsSolvedCurrent(true);
    sound.playLevelUp();
    setTimeout(() => sound.playWalkoutFanfare(), 300);

    confetti({
      particleCount: 180,
      spread: 120,
      origin: { y: 0.6 },
      colors: ['#10b981', '#06b6d4', '#facc15', '#a855f7'],
    });

    const isFirstTime = !completedPuzzles.includes(card.id);
    if (isFirstTime) {
      const updated = [...completedPuzzles, card.id];
      setCompletedPuzzles(updated);
      safeSetItem('apex_fut_pixel_puzzles_completed_v1', JSON.stringify(updated));

      // Award card to user's Club
      onAddCardsToClub([card]);

      // Award bonus coins
      const bonus = 25000;
      if (onAddCoins) onAddCoins(bonus);

      if (onMiniGamePlayed) onMiniGamePlayed();

      setCelebrationCard({
        card,
        bonusCoins: bonus,
        title: `Jigsaw Solved: ${card.name} ${card.rating} ${card.position}!`,
      });
    } else {
      // Re-solved
      setCelebrationCard({
        card,
        bonusCoins: 5000,
        title: `Jigsaw Re-Solved: ${card.name}!`,
      });
      if (onAddCoins) onAddCoins(5000);
    }
  };

  // Quick-solve active puzzle (for convenience / testing)
  const handleQuickSolveActive = () => {
    const solvedArray = Array.from({ length: gridConfig.pieces }, (_, i) => i);
    setBoardTiles(solvedArray);
    setSelectedTileIndex(null);
    handlePuzzleSolved(activeCard);
  };

  // Quick-solve all 9 puzzles (dev helper)
  const handleSolveAllPuzzles = () => {
    sound.playLevelUp();
    setTimeout(() => sound.playWalkoutFanfare(), 300);

    const allIds = PIXEL_PUZZLE_CARDS.map((c) => c.id);
    setCompletedPuzzles(allIds);
    safeSetItem('apex_fut_pixel_puzzles_completed_v1', JSON.stringify(allIds));

    // Award all 9 cards
    onAddCardsToClub(PIXEL_PUZZLE_CARDS);
    if (onAddCoins) onAddCoins(100000);

    const solvedArray = Array.from({ length: gridConfig.pieces }, (_, i) => i);
    setBoardTiles(solvedArray);
    setIsSolvedCurrent(true);

    confetti({
      particleCount: 220,
      spread: 130,
      origin: { y: 0.5 },
      colors: ['#10b981', '#38bdf8', '#facc15', '#ec4899', '#ffffff'],
    });

    setCelebrationCard({
      card: activeCard,
      bonusCoins: 100000,
      title: '⚡ All 9 Jigsaw Puzzles Completed & Added to Club!',
    });
  };

  // Claim Grand Set Reward Yeremy Pino 108 LW
  const handleClaimYeremyPino = () => {
    if (claimedYeremyPino || completedPuzzles.length < 9) return;

    sound.playLevelUp();
    setTimeout(() => sound.playWalkoutFanfare(), 300);

    confetti({
      particleCount: 300,
      spread: 140,
      origin: { y: 0.5 },
      colors: ['#10b981', '#facc15', '#38bdf8', '#ec4899', '#ffffff'],
    });

    onAddCardsToClub([YEREMY_PINO_108_SET_REWARD]);
    if (onAddCoins) onAddCoins(300000);

    setClaimedYeremyPino(true);
    safeSetItem('apex_fut_claimed_yeremy_pino_108', 'true');

    setCelebrationCard({
      card: YEREMY_PINO_108_SET_REWARD,
      bonusCoins: 300000,
      title: '👑 GRAND SET REWARD: 108 YEREMY PINO UNLOCKED!',
      isGrandReward: true,
    });
  };

  const solvedCount = completedPuzzles.length;
  const progressPercent = Math.min(100, Math.round((solvedCount / 9) * 100));
  const canClaimYeremyPino = solvedCount >= 9 && !claimedYeremyPino;

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* ========================================================================= */}
      {/* RETRO PIXEL HERO HEADER & STATS                                          */}
      {/* ========================================================================= */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-emerald-500/50 bg-gradient-to-r from-slate-950 via-[#061811] to-slate-950 p-6 sm:p-8 shadow-[0_0_50px_rgba(16,185,129,0.25)]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 flex items-center gap-1.5 font-mono shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Rating-Scaled Jigsaw Puzzle</span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-mono">
                100 to 105 Pieces · Blurred Reference Challenge
              </span>
              {claimedYeremyPino && (
                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/50 flex items-center gap-1 font-mono">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>108 Pino Claimed!</span>
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase">
              Pixel Jigsaw <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">Puzzle Arcade</span> 🧩
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Solve the rating-scaled jigsaw puzzle for each card! Cards have exact piece counts matching their rating (<strong className="text-emerald-400">Pedri 100 has 100 pieces</strong>, up to <strong className="text-cyan-300">105 pieces for 105-rated cards</strong>). Solve all 9 player puzzles to unlock <strong className="text-amber-400">108 OVR LW Yeremy Pino</strong> + 300,000 Coins!
            </p>

            {/* Quick Stats Progress Bar */}
            <div className="pt-2 space-y-2">
              <div className="flex justify-between items-center text-xs font-mono font-bold">
                <span className="text-slate-400 flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Puzzle Collection Progress</span>
                </span>
                <span className="text-emerald-400">
                  {solvedCount} / 9 Completed ({progressPercent}%)
                </span>
              </div>
              <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden border border-emerald-500/30 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-700 shadow-[0_0_15px_rgba(16,185,129,0.8)]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Grand Set Reward Teaser Card Widget */}
          <div className="w-full lg:w-auto flex-shrink-0 flex flex-col items-center p-4 rounded-2xl bg-slate-900/90 border-2 border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.25)]">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-black uppercase text-amber-300 tracking-wider">
                Grand Set Reward
              </span>
            </div>

            <div className="relative group cursor-pointer" onClick={() => {
              if (canClaimYeremyPino) handleClaimYeremyPino();
            }}>
              <CardItem card={YEREMY_PINO_108_SET_REWARD} size="sm" interactive={false} />
              {claimedYeremyPino ? (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs rounded-xl flex flex-col items-center justify-center p-2 text-center border border-amber-500/50">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-1" />
                  <span className="text-[11px] font-black text-white uppercase">Claimed!</span>
                </div>
              ) : solvedCount < 9 ? (
                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs rounded-xl flex flex-col items-center justify-center p-2 text-center border border-slate-700">
                  <span className="text-[10px] font-mono font-bold text-amber-400">
                    {solvedCount}/9 Puzzles
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase font-black mt-0.5">
                    To Unlock 108 Pino
                  </span>
                </div>
              ) : null}
            </div>

            <div className="mt-3 w-full">
              {claimedYeremyPino ? (
                <div className="text-center py-1.5 px-3 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>108 Pino In Club</span>
                </div>
              ) : canClaimYeremyPino ? (
                <button
                  onClick={handleClaimYeremyPino}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-[11px] uppercase tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.8)] animate-pulse hover:scale-105 transition-all"
                >
                  👑 Claim 108 Yeremy Pino!
                </button>
              ) : (
                <div className="text-center py-1.5 px-3 rounded-xl bg-slate-950 text-slate-400 border border-slate-800 text-[10px] font-mono font-bold">
                  Solve 9/9 ({9 - solvedCount} remaining)
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Global Dev Actions */}
        <div className="relative z-10 flex flex-wrap items-center gap-3 pt-4 mt-6 border-t border-emerald-950/60 text-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">⚡ Quick Dev Helpers:</span>
          <button
            onClick={handleQuickSolveActive}
            className="px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 text-[11px] font-mono font-bold transition-all hover:scale-105"
          >
            ⚡ Solve Current Jigsaw ({activeCard.name} · {gridConfig.pieces} pcs)
          </button>
          <button
            onClick={handleSolveAllPuzzles}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600/30 to-cyan-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-500/50 text-[11px] font-mono font-bold transition-all hover:scale-105"
          >
            ⚡ Solve All 9 Puzzles (Unlock 108 Pino Set)
          </button>
          {onNavigateToSetRewards && (
            <button
              onClick={() => {
                onNavigateToSetRewards();
                sound.playClick();
              }}
              className="ml-auto px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all"
            >
              <span>View Set Rewards Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 9 PLAYER PUZZLE SELECTOR CAROUSEL                                        */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-black uppercase text-white tracking-wider flex items-center gap-2">
            <span className="text-emerald-400">#</span> Select Player Jigsaw to Solve
          </h2>
          <span className="text-xs font-mono text-slate-400">
            Higher rating = more pieces &amp; harder jigsaw!
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2.5">
          {PIXEL_PUZZLE_CARDS.map((player, idx) => {
            const isCompleted = completedPuzzles.includes(player.id);
            const isSelected = selectedPlayerId === player.id;
            const pConfig = getJigsawConfig(player.rating);

            return (
              <button
                key={player.id}
                onClick={() => {
                  setSelectedPlayerId(player.id);
                  sound.playClick();
                }}
                className={`relative flex flex-col items-center p-2 rounded-2xl transition-all border text-left ${
                  isSelected
                    ? 'bg-emerald-500/20 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-105 z-10'
                    : isCompleted
                    ? 'bg-slate-900/80 border-emerald-500/40 hover:border-emerald-400'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Completed Badge */}
                {isCompleted && (
                  <div className="absolute top-1 right-1 z-20 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-md">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}

                {/* Rating & Pieces tag */}
                <div className="absolute top-1 left-1.5 z-20 text-[9px] font-mono font-black text-slate-300 bg-slate-950/80 px-1 rounded border border-slate-700">
                  {pConfig.pieces} pcs
                </div>

                {/* Card Thumbnail */}
                <div className="w-16 h-22 sm:w-18 sm:h-24 my-1 overflow-hidden rounded-lg flex items-center justify-center">
                  <img
                    src={player.fullCardImage}
                    alt={player.name}
                    className="w-full h-full object-contain filter drop-shadow-md"
                    loading="lazy"
                  />
                </div>

                {/* Player details */}
                <div className="w-full text-center mt-1">
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-[11px] font-black text-emerald-400 font-mono">
                      {player.rating}
                    </span>
                    <span className="text-[10px] font-bold text-slate-300">
                      {player.position}
                    </span>
                  </div>
                  <div className="text-[11px] font-black text-white truncate max-w-full">
                    {player.name}
                  </div>
                </div>

                {/* Status bar */}
                <div className="mt-1.5 w-full">
                  {isCompleted ? (
                    <span className="block text-center text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/60 rounded py-0.5 border border-emerald-800/40">
                      SOLVED ✓
                    </span>
                  ) : (
                    <span className="block text-center text-[9px] font-mono font-bold text-slate-400 bg-slate-950 rounded py-0.5 border border-slate-800">
                      {pConfig.pieces} PCS
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ACTIVE PIXEL JIGSAW PUZZLE BOARD & CONTROLS                              */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Blurred Reference Preview & Player Showcase */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-3xl p-6 bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-black uppercase text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/50">
                {gridConfig.difficultyLabel}
              </span>
              {completedPuzzles.includes(activeCard.id) && (
                <span className="text-[10px] font-mono font-black uppercase text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/40 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Card In Club</span>
                </span>
              )}
            </div>

            <div>
              <h3 className="text-2xl font-black text-white">
                {activeCard.name}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                <span className="font-mono text-emerald-400 font-bold text-sm">
                  {activeCard.rating} OVR
                </span>
                <span>•</span>
                <span className="font-bold text-white">{activeCard.position}</span>
                <span>•</span>
                <span>{activeCard.nationFlag} {activeCard.nation}</span>
                <span>•</span>
                <span>{activeCard.club}</span>
              </div>
            </div>

            {/* Target Card Art Reference with Blurred Challenge */}
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950/90 border border-slate-800 relative overflow-hidden">
              <div className="w-full flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-mono text-slate-400 font-bold flex items-center gap-1.5">
                  <span>🎯 Blurred Reference</span>
                </span>
                {/* Clarity toggle */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPreviewBlurMode(previewBlurMode === 'blurred' ? 'clear' : 'blurred')}
                    className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold transition-all ${
                      previewBlurMode === 'blurred'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                    title="Toggle reference preview blur"
                  >
                    {previewBlurMode === 'blurred' ? 'Blurred (Active)' : 'Clear (Peek)'}
                  </button>
                </div>
              </div>

              {/* The reference preview graphic with intentional mystery blur */}
              <div className="relative w-44 h-60 flex items-center justify-center">
                <img
                  src={activeCard.fullCardImage}
                  alt={activeCard.name}
                  className={`w-full h-full object-contain transition-all duration-300 ${
                    previewBlurMode === 'blurred'
                      ? 'filter blur-[3.5px] scale-98 opacity-85'
                      : previewBlurMode === 'soft'
                      ? 'filter blur-[1.5px] opacity-90'
                      : 'filter-none opacity-100'
                  }`}
                />
                {previewBlurMode === 'blurred' && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="px-2 py-1 rounded bg-slate-950/70 text-[9px] font-mono text-slate-300 border border-slate-700/80 backdrop-blur-xs">
                      Fogged Blueprint
                    </span>
                  </div>
                )}
              </div>

              <span className="text-[10px] text-slate-400 text-center mt-2 font-mono">
                {previewBlurMode === 'blurred'
                  ? '🔍 Blurred reference for high-difficulty challenge'
                  : '👁️ Temporary clear peek active'}
              </span>
            </div>

            {/* Jigsaw Progression Counter */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Pieces Correctly Placed:</span>
                <span className={`font-black ${correctTilesCount === gridConfig.pieces ? 'text-emerald-400' : 'text-cyan-400'}`}>
                  {correctTilesCount} / {gridConfig.pieces}
                </span>
              </div>
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-300"
                  style={{ width: `${(correctTilesCount / gridConfig.pieces) * 100}%` }}
                />
              </div>
            </div>

            {/* Instructions */}
            <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-900/50 text-xs text-slate-300 space-y-1.5">
              <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                <span>How to Solve:</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-300">
                1. Click any jigsaw piece on the board to select it.<br />
                2. Click a second piece to swap their positions directly on the board.<br />
                3. Align all <strong className="text-emerald-400">{gridConfig.pieces} pieces</strong> to unlock {activeCard.name}!
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: The Rating-Scaled Jigsaw Interactive Grid */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-3xl p-6 sm:p-8 bg-slate-900/80 border-2 border-emerald-500/40 shadow-2xl flex flex-col items-center">
            {/* Top Toolbar */}
            <div className="w-full flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
                  <span className="text-slate-500">Swaps: </span>
                  <span className="text-white font-black">{moveCount}</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
                  <span className="text-slate-500">In Place: </span>
                  <span className="text-emerald-400 font-black">
                    {correctTilesCount} / {gridConfig.pieces}
                  </span>
                </div>
                {isSolvedCurrent ? (
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 text-xs font-mono font-bold flex items-center gap-1.5 animate-pulse">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>JIGSAW SOLVED!</span>
                  </span>
                ) : (
                  <span className="px-3 py-1.5 rounded-xl bg-slate-950 text-slate-400 border border-slate-800 text-xs font-mono">
                    {selectedTileIndex !== null ? '✨ Select 2nd piece to swap' : '👆 Tap piece to swap'}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={shuffleTiles}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold font-mono flex items-center gap-1.5 transition-all"
                  title="Scramble jigsaw pieces"
                >
                  <Shuffle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Shuffle</span>
                </button>

                <button
                  onClick={handleQuickSolveActive}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 text-xs font-black font-mono flex items-center gap-1.5 transition-all hover:scale-105"
                  title="Quick Auto-Complete"
                >
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Auto Solve</span>
                </button>
              </div>
            </div>

            {/* The Rating-Scaled Jigsaw Board Frame */}
            <div className="relative w-full max-w-[460px] aspect-[644/900] bg-slate-950 rounded-2xl overflow-hidden border-4 border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.85)] p-1.5">
              {/* Dynamic Jigsaw Grid of Pieces */}
              <div
                className="relative z-10 w-full h-full"
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${gridConfig.cols}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${gridConfig.rows}, minmax(0, 1fr))`,
                  gap: '1px',
                }}
              >
                {boardTiles.map((tileOrigPos, currentIdx) => {
                  const isSelected = selectedTileIndex === currentIdx;
                  const isCorrect = tileOrigPos === currentIdx;

                  // Compute background position for this piece's original target slot
                  const origCol = tileOrigPos % gridConfig.cols;
                  const origRow = Math.floor(tileOrigPos / gridConfig.cols);
                  const posX = gridConfig.cols > 1 ? (origCol / (gridConfig.cols - 1)) * 100 : 0;
                  const posY = gridConfig.rows > 1 ? (origRow / (gridConfig.rows - 1)) * 100 : 0;

                  return (
                    <button
                      key={currentIdx}
                      onClick={() => handleTileClick(currentIdx)}
                      disabled={isSolvedCurrent}
                      className={`relative w-full h-full cursor-pointer transition-all duration-150 select-none overflow-hidden ${
                        isSelected
                          ? 'border-2 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.9)] scale-95 z-30 ring-2 ring-emerald-300 rounded-xs'
                          : isCorrect
                          ? 'border-[0.5px] border-emerald-500/50 hover:border-emerald-300'
                          : 'border-[0.5px] border-slate-800/80 hover:border-slate-400/80 hover:scale-102 z-10'
                      }`}
                      style={{
                        backgroundImage: `url(${activeCard.fullCardImage})`,
                        backgroundSize: `${gridConfig.cols * 100}% ${gridConfig.rows * 100}%`,
                        backgroundPosition: `${posX}% ${posY}%`,
                        backgroundRepeat: 'no-repeat',
                      }}
                      title={`Piece #${tileOrigPos + 1} (${isCorrect ? 'Correct Slot' : 'Slot ' + (currentIdx + 1)})`}
                    >
                      {/* Selected Pulse Indicator */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-emerald-500/30 border border-emerald-300 animate-pulse flex items-center justify-center">
                          <span className="text-[8px] font-black uppercase text-emerald-300 font-mono bg-slate-950/90 px-1 rounded">
                            #{tileOrigPos + 1}
                          </span>
                        </div>
                      )}

                      {/* Correct Position Micro Marker */}
                      {isCorrect && !isSelected && (
                        <div className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500/80 rounded-tl-sm pointer-events-none" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Status / Congratulatory banner */}
            <div className="w-full mt-6">
              {isSolvedCurrent ? (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 border-2 border-emerald-500/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                  <div className="space-y-1">
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-emerald-300 font-black text-sm uppercase">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>{activeCard.name} ({gridConfig.pieces} pcs) Solved!</span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Card is in your Club! Solve the remaining jigsaw puzzles to claim <strong className="text-amber-400">108 Yeremy Pino</strong>.
                    </p>
                  </div>

                  {/* Next Unsolved Puzzle Button */}
                  {completedPuzzles.length < 9 && (
                    <button
                      onClick={() => {
                        const nextUnsolved = PIXEL_PUZZLE_CARDS.find(
                          (c) => !completedPuzzles.includes(c.id)
                        );
                        if (nextUnsolved) {
                          setSelectedPlayerId(nextUnsolved.id);
                          sound.playClick();
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.5)] hover:scale-105 transition-all flex items-center gap-1.5"
                    >
                      <span>Next Puzzle</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center text-xs text-slate-400 font-mono">
                  Tip: Green micro-dots in piece corners indicate pieces that are currently in their correct position!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 10-CARD PROGRESS & YEREMY PINO CLAIM BANNER                              */}
      {/* ========================================================================= */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-amber-500/60 bg-gradient-to-r from-slate-950 via-[#1f1505] to-slate-950 p-6 sm:p-8 shadow-[0_0_50px_rgba(245,158,11,0.25)]">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2">
              <Crown className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-black uppercase text-amber-300 tracking-widest font-mono">
                Pixel Set Completion Reward
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white uppercase">
              108 OVR LW Yeremy Pino <span className="text-amber-400">+ 300,000 Coins</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Complete each of the 9 player jigsaws (from 100 to 105 pieces) to unlock the grand reward in Set Rewards. Once all 9 are assembled, claim your 108 LW Yeremy Pino instantly!
            </p>
          </div>

          <div className="flex items-center gap-4">
            {claimedYeremyPino ? (
              <div className="px-6 py-3 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 font-black text-sm uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Set Reward Claimed!</span>
              </div>
            ) : canClaimYeremyPino ? (
              <button
                onClick={handleClaimYeremyPino}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(245,158,11,0.9)] hover:scale-105 transition-all animate-pulse"
              >
                👑 Claim 108 Yeremy Pino Set Reward!
              </button>
            ) : (
              <div className="px-6 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs font-mono font-bold text-center">
                <span>🔒 Locked ({solvedCount}/9 Jigsaws Solved)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CELEBRATION WALKOUT MODAL                                                 */}
      {/* ========================================================================= */}
      {celebrationCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-emerald-500/70 shadow-[0_0_80px_rgba(16,185,129,0.4)] text-center space-y-6">
            <div className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800 font-mono inline-block">
                {celebrationCard.isGrandReward ? '👑 GRAND SET REWARD' : '🎉 PIXEL CARD UNLOCKED!'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase">
                {celebrationCard.title}
              </h2>
            </div>

            {/* Walkout Card Display */}
            <div className="flex justify-center py-2">
              <CardItem card={celebrationCard.card} size="walkout" interactive={true} />
            </div>

            {/* Reward coins & club notice */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/30 flex items-center justify-center gap-6">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase">
                <ShieldCheck className="w-4 h-4" />
                <span>Added To Club</span>
              </div>
              <div className="h-4 w-px bg-slate-800" />
              <div className="flex items-center gap-2 text-amber-400 font-black font-mono text-sm">
                <Coins className="w-4 h-4" />
                <span>+{celebrationCard.bonusCoins.toLocaleString()} Coins</span>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => {
                setCelebrationCard(null);
                sound.playClick();
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.7)] hover:scale-[1.02] transition-all"
            >
              Continue Playing
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
