import React, { useState, useEffect, useMemo } from 'react';
import { SoccerCard, PackDefinition } from '../types/card';
import { CardItem } from './CardItem';
import { PackDuoGame } from './PackDuoGame';
import { sound } from '../utils/audio';
import { HL_REWARD_LADDER, getGuessWhoTierReward } from '../data/rewardPacks';
import {
  Gamepad2,
  TrendingUp,
  HelpCircle,
  Trophy,
  Flame,
  RotateCcw,
  Sparkles,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  XCircle,
  Search,
  Check,
  Coins,
  Shield,
  Zap,
  Award,
  PackageOpen,
  Eye,
  Info,
  ChevronRight,
  ExternalLink,
  Swords,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { safeSetItem } from '../utils/safeStorage';

interface MiniGamesHubProps {
  coins: number;
  allCardsPool: SoccerCard[];
  onAddCoins: (amount: number) => void;
  onAddCardsToClub: (cards: SoccerCard[]) => void;
  onAddUnopenedPack: (pack: PackDefinition, sourceTitle: string, sourceType: 'high_low' | 'guess_who' | 'daily_objective' | 'bonus' | 'sbc' | 'pack_duo') => void;
  onNavigateToMyPacks?: () => void;
  onMiniGamePlayed?: () => void;
}

type MiniGameMode = 'high_low' | 'guess_who' | 'pack_duo';
type HighLowStat = 'rating' | 'pac' | 'sho' | 'pas' | 'dri';

export const MiniGamesHub: React.FC<MiniGamesHubProps> = ({
  coins,
  allCardsPool,
  onAddCoins,
  onAddCardsToClub,
  onAddUnopenedPack,
  onNavigateToMyPacks,
  onMiniGamePlayed,
}) => {
  const [activeGame, setActiveGame] = useState<MiniGameMode>('high_low');

  // Pool of high quality cards (filtering out any malformed data)
  const playablePool = useMemo(() => {
    return allCardsPool.filter((c) => c && c.rating && c.name && c.stats);
  }, [allCardsPool]);

  // =========================================================================
  // GAME 1: HIGHER OR LOWER STATE & LOGIC
  // =========================================================================
  const [hlCurrentCard, setHlCurrentCard] = useState<SoccerCard | null>(null);
  const [hlNextCard, setHlNextCard] = useState<SoccerCard | null>(null);
  const [hlStat, setHlStat] = useState<HighLowStat>('rating');
  const [hlStreak, setHlStreak] = useState<number>(0);
  const [hlBestStreak, setHlBestStreak] = useState<number>(() => {
    return Number(localStorage.getItem('apex_fut_hl_best_streak') || 0);
  });
  const [hlRevealed, setHlRevealed] = useState<boolean>(false);
  const [hlRoundResult, setHlRoundResult] = useState<'win' | 'lose' | null>(null);
  const [hlRewardMessage, setHlRewardMessage] = useState<string | null>(null);
  const [hlClaimedMilestones, setHlClaimedMilestones] = useState<number[]>([]);
  const [hlLadderCelebration, setHlLadderCelebration] = useState<{
    tier: (typeof HL_REWARD_LADDER)[0];
  } | null>(null);

  // Initialize High Low Round
  const initHighLowRound = (firstCard?: SoccerCard) => {
    if (playablePool.length < 2) return;
    const left = firstCard || playablePool[Math.floor(Math.random() * playablePool.length)];
    let right = playablePool[Math.floor(Math.random() * playablePool.length)];
    while (right.id === left.id) {
      right = playablePool[Math.floor(Math.random() * playablePool.length)];
    }
    setHlCurrentCard(left);
    setHlNextCard(right);
    setHlRevealed(false);
    setHlRoundResult(null);
    setHlRewardMessage(null);
  };

  useEffect(() => {
    if (!hlCurrentCard && playablePool.length >= 2) {
      initHighLowRound();
    }
  }, [playablePool]);

  // Get stat value helper
  const getCardStatValue = (card: SoccerCard, statKey: HighLowStat): number => {
    if (statKey === 'rating') return card.rating;
    return card.stats[statKey] || 0;
  };

  const statLabels: Record<HighLowStat, string> = {
    rating: 'Overall Rating (OVR)',
    pac: 'Pace (PAC)',
    sho: 'Shooting (SHO)',
    pas: 'Passing (PAS)',
    dri: 'Dribbling (DRI)',
  };

  // High Low Guess
  const handleHighLowGuess = (guess: 'higher' | 'lower') => {
    if (!hlCurrentCard || !hlNextCard || hlRevealed) return;

    onMiniGamePlayed?.();
    setHlRevealed(true);
    const leftVal = getCardStatValue(hlCurrentCard, hlStat);
    const rightVal = getCardStatValue(hlNextCard, hlStat);

    const isCorrect =
      (guess === 'higher' && rightVal >= leftVal) ||
      (guess === 'lower' && rightVal <= leftVal);

    if (isCorrect) {
      sound.playGoalCheer();
      const newStreak = hlStreak + 1;
      setHlStreak(newStreak);

      if (newStreak > hlBestStreak) {
        setHlBestStreak(newStreak);
        safeSetItem('apex_fut_hl_best_streak', newStreak.toString());
      }

      // Base round win coins
      let earnedCoins = 350;
      let bonusMsg = '+350 Coins';

      // Check Reward Ladder Milestone
      const reachedTier = HL_REWARD_LADDER.find(
        (t) => t.streak === newStreak && !hlClaimedMilestones.includes(t.streak)
      );

      if (reachedTier) {
        // Milestone reached!
        earnedCoins += reachedTier.coins;
        bonusMsg = `🎉 ${reachedTier.streak}x STREAK UNLOCKED! +${reachedTier.coins.toLocaleString()} Coins & ${reachedTier.pack.name} added to My Packs!`;

        // Claim milestone
        setHlClaimedMilestones((prev) => [...prev, reachedTier.streak]);
        setHlLadderCelebration({ tier: reachedTier });

        // Deliver reward pack to My Packs
        onAddUnopenedPack(
          reachedTier.pack,
          `Higher or Lower ${reachedTier.streak}x Streak`,
          'high_low'
        );

        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#10b981', '#fbbf24', '#f59e0b', '#ffffff'],
        });
      }

      onAddCoins(earnedCoins);
      setHlRoundResult('win');
      setHlRewardMessage(bonusMsg);
    } else {
      sound.playPackRip(); // buzzer sound
      setHlRoundResult('lose');
      setHlRewardMessage(`Incorrect! ${hlNextCard.name} has ${rightVal} ${hlStat.toUpperCase()}`);
    }
  };

  // Continue to next card in streak
  const handleHighLowContinue = () => {
    sound.playClick();
    setHlLadderCelebration(null);
    if (hlNextCard) {
      initHighLowRound(hlNextCard);
    } else {
      initHighLowRound();
    }
  };

  // Restart High Low
  const handleHighLowRestart = () => {
    sound.playClick();
    setHlStreak(0);
    setHlClaimedMilestones([]);
    setHlLadderCelebration(null);
    initHighLowRound();
  };

  // =========================================================================
  // GAME 2: GUESS WHO (SOCCER MYSTERY PLAYER)
  // =========================================================================
  const [gwTargetCard, setGwTargetCard] = useState<SoccerCard | null>(null);
  const [gwSearchQuery, setGwSearchQuery] = useState('');
  const [gwGuesses, setGwGuesses] = useState<SoccerCard[]>([]);
  const [gwGameOver, setGwGameOver] = useState<boolean>(false);
  const [gwWon, setGwWon] = useState<boolean>(false);
  const [gwRewardClaimed, setGwRewardClaimed] = useState<boolean>(false);
  const [gwTierResult, setGwTierResult] = useState<{
    tierName: string;
    coins: number;
    pack: PackDefinition;
  } | null>(null);

  // Initialize Guess Who Player
  const initGuessWhoRound = () => {
    if (playablePool.length === 0) return;
    // Pick an iconic/well-known player with rating >= 84
    const starsPool = playablePool.filter((c) => c.rating >= 84);
    const chosen =
      starsPool.length > 0
        ? starsPool[Math.floor(Math.random() * starsPool.length)]
        : playablePool[Math.floor(Math.random() * playablePool.length)];

    setGwTargetCard(chosen);
    setGwGuesses([]);
    setGwSearchQuery('');
    setGwGameOver(false);
    setGwWon(false);
    setGwRewardClaimed(false);
    setGwTierResult(null);
  };

  useEffect(() => {
    if (!gwTargetCard && playablePool.length > 0) {
      initGuessWhoRound();
    }
  }, [playablePool]);

  // Autocomplete search suggestions
  const gwSuggestions = useMemo(() => {
    if (!gwSearchQuery.trim()) return [];
    const q = gwSearchQuery.toLowerCase();
    const alreadyGuessed = new Set(gwGuesses.map((g) => g.id));
    return playablePool
      .filter(
        (c) =>
          !alreadyGuessed.has(c.id) &&
          (c.name.toLowerCase().includes(q) || c.club.toLowerCase().includes(q))
      )
      .slice(0, 6);
  }, [gwSearchQuery, playablePool, gwGuesses]);

  // Submit Guess
  const handleMakeGuess = (guessedCard: SoccerCard) => {
    if (gwGameOver || !gwTargetCard) return;

    onMiniGamePlayed?.();
    sound.playCardFlip();
    const newGuesses = [guessedCard, ...gwGuesses];
    setGwGuesses(newGuesses);
    setGwSearchQuery('');

    // Check Win
    if (
      guessedCard.id === gwTargetCard.id ||
      guessedCard.name.toLowerCase() === gwTargetCard.name.toLowerCase()
    ) {
      sound.playGoalCheer();
      confetti({ particleCount: 140, spread: 85, origin: { y: 0.5 } });
      setGwWon(true);
      setGwGameOver(true);

      if (!gwRewardClaimed) {
        // Calculate Tiered Reward based on how few guesses/clues were needed
        const tier = getGuessWhoTierReward(newGuesses.length);
        setGwTierResult(tier);

        // Award Coins
        onAddCoins(tier.coins);

        // Award Tiered Pack to My Packs
        onAddUnopenedPack(tier.pack, `Guess Who: ${tier.tierName}`, 'guess_who');

        setGwRewardClaimed(true);
      }
    } else if (newGuesses.length >= 5) {
      // Game Over: Out of guesses
      sound.playPackRip();
      setGwWon(false);
      setGwGameOver(true);
    }
  };

  // Helper for position group matching
  const getPositionGroup = (pos: string): string => {
    if (['ST', 'CF', 'LW', 'RW'].includes(pos)) return 'FWD';
    if (['CAM', 'CM', 'CDM', 'LM', 'RM'].includes(pos)) return 'MID';
    if (['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(pos)) return 'DEF';
    return 'GK';
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-gradient-to-r from-slate-950 via-[#0a1120] to-[#120e24] p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-400/40 text-purple-300 text-xs font-black tracking-wide uppercase">
              <Gamepad2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Apex Arcade · Free Reward Packs & Coin Challenges</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase">
              Mini <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">Games</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Climb the Higher or Lower Reward Ladder to unlock free Gold, Walkout, and Mythic packs. Crack the Guess Who mystery player quiz with fewer clues to earn tiered packs in My Packs!
            </p>
          </div>

          {/* Quick HUD Counters */}
          <div className="flex items-center gap-3">
            {onNavigateToMyPacks && (
              <button
                onClick={onNavigateToMyPacks}
                className="px-4 py-2.5 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 text-xs font-black uppercase flex items-center gap-2 transition-all hover:scale-105"
              >
                <PackageOpen className="w-4 h-4 text-emerald-400" />
                <span>Open My Packs</span>
              </button>
            )}

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-inner">
              <Coins className="w-5 h-5 text-amber-400" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Bankroll</span>
                <span className="text-base font-black text-amber-300 tabular-nums">
                  {coins.toLocaleString()} Coins
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="relative z-10 flex flex-wrap items-center gap-3 pt-6 mt-6 border-t border-slate-800/80">
          <button
            onClick={() => {
              setActiveGame('high_low');
              sound.playClick();
            }}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
              activeGame === 'high_low'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg scale-105'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Higher or Lower</span>
            {hlStreak > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-slate-950/80 text-emerald-300 text-[10px] font-mono">
                {hlStreak}x
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveGame('guess_who');
              sound.playClick();
            }}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
              activeGame === 'guess_who'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg scale-105'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Guess Who</span>
          </button>

          <button
            onClick={() => {
              setActiveGame('pack_duo');
              sound.playClick();
            }}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${
              activeGame === 'pack_duo'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-lg scale-105'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Swords className="w-4 h-4" />
            <span>⚔️ Pack Duo (50-Pack Showdown)</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* GAME 1: HIGHER OR LOWER WITH SHROUDED CARD, MULTI-STAT CLUES & REWARD LADDER */}
      {/* ========================================================================= */}
      {activeGame === 'high_low' && (
        <div className="space-y-6">
          {/* Top Bar Controls & Streak */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-black text-sm">
                <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>Streak: {hlStreak}</span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-xs font-semibold">
                <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                <span>Best: {hlBestStreak}</span>
              </div>
            </div>

            {/* Stat selector dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold uppercase">Attribute:</span>
              <select
                value={hlStat}
                disabled={hlStreak > 0 && !hlRevealed}
                onChange={(e) => {
                  setHlStat(e.target.value as HighLowStat);
                  sound.playClick();
                }}
                className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="rating">Overall Rating (OVR)</option>
                <option value="pac">Pace (PAC)</option>
                <option value="sho">Shooting (SHO)</option>
                <option value="pas">Passing (PAS)</option>
                <option value="dri">Dribbling (DRI)</option>
              </select>
            </div>
          </div>

          {/* REWARD LADDER PROGRESSION TRACK */}
          <div className="bg-gradient-to-r from-slate-950 via-[#0a1120] to-slate-950 border border-slate-800/90 rounded-3xl p-5 shadow-xl space-y-3 overflow-hidden relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-black uppercase text-white tracking-wider">
                  Higher or Lower Streak Reward Ladder
                </h4>
              </div>
              <span className="text-[11px] text-slate-400">
                Packs automatically transfer to <strong className="text-emerald-400">My Packs</strong>
              </span>
            </div>

            {/* Visual Ladder Track */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
              {HL_REWARD_LADDER.map((tier) => {
                const isClaimed = hlClaimedMilestones.includes(tier.streak);
                const isCurrentNext = !isClaimed && hlStreak < tier.streak;
                const progressPercent = Math.min(100, Math.round((hlStreak / tier.streak) * 100));

                return (
                  <div
                    key={tier.streak}
                    className={`relative p-3 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                      isClaimed
                        ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                        : hlStreak >= tier.streak
                        ? 'bg-amber-950/40 border-amber-500/80 animate-pulse'
                        : 'bg-slate-950/80 border-slate-800/80 opacity-80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            isClaimed
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-slate-800 text-amber-300'
                          }`}
                        >
                          {tier.streak}x Streak
                        </span>
                        {isClaimed ? (
                          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Claimed
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-400">
                            {hlStreak}/{tier.streak}
                          </span>
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-xs font-black text-white block truncate">
                          {tier.pack.name}
                        </span>
                        <span className="text-[10px] text-amber-300 font-mono font-bold block">
                          +{tier.coins.toLocaleString()} Coins
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar inside Node */}
                    <div className="mt-3 pt-2 border-t border-slate-800/60">
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            isClaimed
                              ? 'bg-emerald-400'
                              : 'bg-gradient-to-r from-amber-500 to-amber-300'
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Celebratory Ladder Milestone Notification Banner */}
          {hlLadderCelebration && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/90 to-amber-950/90 border border-emerald-500/60 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
                  <PackageOpen className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase">
                    Reward Ladder Milestone Reached! ({hlLadderCelebration.tier.streak}x Streak)
                  </h4>
                  <p className="text-xs text-emerald-200">
                    Claimed <strong className="text-amber-300">+{hlLadderCelebration.tier.coins.toLocaleString()} Coins</strong> and deposited <strong className="text-white">{hlLadderCelebration.tier.pack.name}</strong> directly into <strong>My Packs</strong>!
                  </p>
                </div>
              </div>

              {onNavigateToMyPacks && (
                <button
                  onClick={onNavigateToMyPacks}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-transform hover:scale-105 flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span>Open in My Packs</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Arena Display: Left Card vs Right Mystery Shrouded Card */}
          {hlCurrentCard && hlNextCard && (
            <div className="relative bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col items-center">
              <div className="text-center mb-6 max-w-xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-black uppercase mb-2">
                  <Eye className="w-3 h-3 text-amber-400" />
                  <span>Deduce from clues & stats</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider">
                  Will the mystery player have a{' '}
                  <span className="text-emerald-400">HIGHER</span> or{' '}
                  <span className="text-rose-400">LOWER</span>{' '}
                  <span className="underline decoration-amber-400 text-amber-300">
                    {statLabels[hlStat]}
                  </span>?
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Inspect the nation, club, position, and face stats clues to make your deduction!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 items-start justify-items-center w-full max-w-4xl">
                {/* Left Card: Known Anchor Player */}
                <div className="flex flex-col items-center space-y-4 w-full max-w-[280px]">
                  <div className="relative group">
                    <CardItem card={hlCurrentCard} size="lg" interactive={false} />
                  </div>

                  <div className="text-center bg-slate-950 border border-slate-800 rounded-2xl px-6 py-3 shadow-lg w-full">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block truncate">
                      {hlCurrentCard.name}
                    </span>
                    <span className="text-2xl font-black text-amber-400 font-mono">
                      {getCardStatValue(hlCurrentCard, hlStat)}{' '}
                      <span className="text-xs uppercase text-slate-500 font-normal">
                        {hlStat.toUpperCase()}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Right Card: Shrouded Mystery Opponent */}
                <div className="flex flex-col items-center space-y-4 w-full max-w-[280px]">
                  {!hlRevealed ? (
                    /* SHROUDED CARD PRESENTATION */
                    <div className="relative w-64 aspect-[3/4.2] rounded-3xl bg-gradient-to-b from-slate-900 via-[#0e1628] to-slate-950 border-2 border-amber-500/50 shadow-2xl p-4 flex flex-col justify-between overflow-hidden group">
                      {/* Ambient scanning glow */}
                      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-amber-500/5 pointer-events-none animate-pulse" />

                      {/* Card Top: Hidden Rating or Target Stat */}
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 z-10">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xl font-black text-amber-400 font-mono">
                            {hlStat === 'rating' ? '???' : hlNextCard.rating}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            {hlStat === 'rating' ? 'OVR' : 'OVR'}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-500/40">
                          {hlNextCard.position}
                        </span>
                      </div>

                      {/* Mystery Silhouette Avatar */}
                      <div className="relative flex flex-col items-center justify-center my-auto py-2 z-10">
                        <div className="w-24 h-24 rounded-full bg-slate-950/90 border-2 border-amber-400/40 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                          <div className="text-4xl filter drop-shadow">👤</div>
                        </div>
                        <span className="mt-2 text-xs font-black uppercase text-amber-300 tracking-wider text-center">
                          Hidden Identity
                        </span>
                      </div>

                      {/* SOCCER CLUES PANEL */}
                      <div className="bg-slate-950/90 border border-slate-800/80 rounded-2xl p-2.5 space-y-2 z-10 text-[11px]">
                        {/* Clue 1: Nation & Flag */}
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 text-[10px] font-bold uppercase">Nation</span>
                          <div className="flex items-center gap-1 font-bold text-white">
                            <span>{hlNextCard.nationFlag}</span>
                            <span className="truncate max-w-[120px]">{hlNextCard.nation}</span>
                          </div>
                        </div>

                        {/* Clue 2: Club & League */}
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 text-[10px] font-bold uppercase">Club</span>
                          <span className="font-bold text-slate-200 truncate max-w-[130px]">
                            {hlNextCard.club}
                          </span>
                        </div>

                        {/* Clue 3: Face Stats Clues */}
                        <div className="pt-1.5 border-t border-slate-800/80 grid grid-cols-3 gap-1 text-center font-mono">
                          {/* PAC */}
                          <div className={`p-1 rounded-lg ${hlStat === 'pac' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold' : 'bg-slate-900 text-slate-300'}`}>
                            <span className="text-[9px] block text-slate-500 font-sans">PAC</span>
                            <span>{hlStat === 'pac' ? '???' : hlNextCard.stats.pac}</span>
                          </div>

                          {/* SHO */}
                          <div className={`p-1 rounded-lg ${hlStat === 'sho' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold' : 'bg-slate-900 text-slate-300'}`}>
                            <span className="text-[9px] block text-slate-500 font-sans">SHO</span>
                            <span>{hlStat === 'sho' ? '???' : hlNextCard.stats.sho}</span>
                          </div>

                          {/* PAS */}
                          <div className={`p-1 rounded-lg ${hlStat === 'pas' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold' : 'bg-slate-900 text-slate-300'}`}>
                            <span className="text-[9px] block text-slate-500 font-sans">PAS</span>
                            <span>{hlStat === 'pas' ? '???' : hlNextCard.stats.pas}</span>
                          </div>

                          {/* DRI */}
                          <div className={`p-1 rounded-lg ${hlStat === 'dri' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold' : 'bg-slate-900 text-slate-300'}`}>
                            <span className="text-[9px] block text-slate-500 font-sans">DRI</span>
                            <span>{hlStat === 'dri' ? '???' : hlNextCard.stats.dri}</span>
                          </div>

                          {/* DEF */}
                          <div className="p-1 rounded-lg bg-slate-900 text-slate-300">
                            <span className="text-[9px] block text-slate-500 font-sans">DEF</span>
                            <span>{hlNextCard.stats.def}</span>
                          </div>

                          {/* PHY */}
                          <div className="p-1 rounded-lg bg-slate-900 text-slate-300">
                            <span className="text-[9px] block text-slate-500 font-sans">PHY</span>
                            <span>{hlNextCard.stats.phy}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* REVEALED CARD PRESENTATION */
                    <div className="relative group animate-scaleUp">
                      <CardItem card={hlNextCard} size="lg" interactive={false} />
                    </div>
                  )}

                  {/* Value / Question Box */}
                  <div className="text-center bg-slate-950 border border-slate-800 rounded-2xl px-6 py-3 shadow-lg w-full">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block truncate">
                      {hlRevealed ? hlNextCard.name : 'Mystery Opponent'}
                    </span>
                    <span className="text-2xl font-black font-mono">
                      {hlRevealed ? (
                        <span
                          className={
                            hlRoundResult === 'win' ? 'text-emerald-400' : 'text-rose-400'
                          }
                        >
                          {getCardStatValue(hlNextCard, hlStat)}{' '}
                          <span className="text-xs uppercase text-slate-500 font-normal">
                            {hlStat.toUpperCase()}
                          </span>
                        </span>
                      ) : (
                        <span className="text-amber-400 animate-pulse">???</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons or Round Outcome */}
              <div className="mt-8 w-full max-w-md">
                {!hlRevealed ? (
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleHighLowGuess('higher')}
                      className="py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-transform hover:scale-105"
                    >
                      <ArrowUp className="w-5 h-5 stroke-[3]" />
                      <span>Higher</span>
                    </button>

                    <button
                      onClick={() => handleHighLowGuess('lower')}
                      className="py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 transition-transform hover:scale-105"
                    >
                      <ArrowDown className="w-5 h-5 stroke-[3]" />
                      <span>Lower</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 animate-fadeIn">
                    <div
                      className={`p-4 rounded-2xl text-center border font-bold text-sm ${
                        hlRoundResult === 'win'
                          ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200'
                          : 'bg-rose-950/80 border-rose-500/60 text-rose-200'
                      }`}
                    >
                      <div className="text-base font-black flex items-center justify-center gap-2">
                        {hlRoundResult === 'win' ? (
                          <>
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            <span>Correct Deduction!</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-5 h-5 text-rose-400" />
                            <span>Streak Broken!</span>
                          </>
                        )}
                      </div>
                      <p className="text-xs mt-1 font-mono">{hlRewardMessage}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      {hlRoundResult === 'win' ? (
                        <button
                          onClick={handleHighLowContinue}
                          className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-transform hover:scale-105 flex items-center justify-center gap-2"
                        >
                          <TrendingUp className="w-4 h-4" />
                          <span>Continue Streak ({hlStreak})</span>
                        </button>
                      ) : (
                        <button
                          onClick={handleHighLowRestart}
                          className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span>Restart Ladder Run</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* GAME 2: GUESS WHO (SOCCER MYSTERY PLAYER) WITH TIERED REWARD PACKS */}
      {/* ========================================================================= */}
      {activeGame === 'guess_who' && gwTargetCard && (
        <div className="space-y-6">
          {/* Top Instructions & Lives Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-white uppercase flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-purple-400" />
                <span>Soccer Mystery Player Quiz</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Identify the mystery superstar in 5 attempts. Solve with fewer clues to earn rarer walkout packs in <strong>My Packs</strong>!
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-bold uppercase">Attempts Left:</span>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((idx) => (
                  <div
                    key={idx}
                    className={`w-3.5 h-3.5 rounded-full transition-all ${
                      idx <= 5 - gwGuesses.length
                        ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]'
                        : 'bg-slate-800'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Tiered Pack Rewards Rules Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-purple-400 block">1 Clue (Mastermind)</span>
              <span className="text-xs font-black text-white block mt-0.5">85+ Walkout Pack</span>
              <span className="text-[10px] text-amber-300 font-mono">+6,000 Coins</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-teal-400 block">2 Clues (Detective)</span>
              <span className="text-xs font-black text-white block mt-0.5">82+ Jumbo Pack</span>
              <span className="text-[10px] text-amber-300 font-mono">+4,000 Coins</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-amber-400 block">3 Clues (Tactician)</span>
              <span className="text-xs font-black text-white block mt-0.5">78+ Gold Pack</span>
              <span className="text-[10px] text-amber-300 font-mono">+2,500 Coins</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">4-5 Clues (Solver)</span>
              <span className="text-xs font-black text-white block mt-0.5">Challenger Pack</span>
              <span className="text-[10px] text-amber-300 font-mono">+1,500 Coins</span>
            </div>
          </div>

          {/* Search Input Bar (if active) */}
          {!gwGameOver && (
            <div className="relative max-w-xl mx-auto">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={gwSearchQuery}
                  onChange={(e) => setGwSearchQuery(e.target.value)}
                  placeholder="Type player name to guess (e.g. Messi, Mbappe, Maradona, Haaland)..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 shadow-xl"
                />
              </div>

              {/* Suggestions Dropdown */}
              {gwSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-30 divide-y divide-slate-800">
                  {gwSuggestions.map((candidate) => (
                    <button
                      key={candidate.id}
                      onClick={() => handleMakeGuess(candidate)}
                      className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{candidate.nationFlag}</span>
                        <div>
                          <span className="text-xs font-bold text-white block">{candidate.name}</span>
                          <span className="text-[10px] text-slate-400">
                            {candidate.position} · {candidate.club}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-black text-amber-400">
                        {candidate.rating} OVR
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Game Outcome Hero (if won or lost) */}
          {gwGameOver && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-2xl animate-fadeIn">
              <div className="max-w-md mx-auto space-y-3">
                {gwWon && gwTierResult ? (
                  <>
                    <div className="inline-flex p-3 rounded-full bg-emerald-500/20 text-emerald-400 mb-1">
                      <Trophy className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase">
                      Solved! Rank: {gwTierResult.tierName}!
                    </h2>
                    <p className="text-xs text-emerald-300 font-mono font-bold">
                      +{gwTierResult.coins.toLocaleString()} Coins Claimed!
                    </p>

                    {/* Reward Pack Highlight */}
                    <div className="p-3 rounded-2xl bg-slate-950 border border-purple-500/40 flex items-center justify-between gap-3 text-left">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
                          <PackageOpen className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-purple-400 uppercase block">
                            Bonus Pack Transferred to My Packs
                          </span>
                          <span className="text-xs font-black text-white">
                            {gwTierResult.pack.name}
                          </span>
                        </div>
                      </div>

                      {onNavigateToMyPacks && (
                        <button
                          onClick={onNavigateToMyPacks}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] uppercase rounded-xl transition-colors whitespace-nowrap"
                        >
                          Rip Now
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="inline-flex p-3 rounded-full bg-rose-500/20 text-rose-400 mb-1">
                      <XCircle className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase">Out of Guesses!</h2>
                    <p className="text-xs text-slate-400">
                      The mystery player was <strong className="text-white">{gwTargetCard.name}</strong>.
                    </p>
                  </>
                )}

                {/* Reveal Card Preview */}
                <div className="my-4 flex justify-center">
                  <CardItem card={gwTargetCard} size="md" interactive={true} />
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={initGuessWhoRound}
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-transform hover:scale-105"
                  >
                    Play Next Mystery Player
                  </button>

                  {onNavigateToMyPacks && gwWon && (
                    <button
                      onClick={onNavigateToMyPacks}
                      className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-transform hover:scale-105 flex items-center gap-1.5"
                    >
                      <PackageOpen className="w-4 h-4" />
                      <span>Go to My Packs</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Guess Feedback Rows (Wordle / Poeltl Style) */}
          {gwGuesses.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs uppercase font-black text-slate-400 tracking-wider">
                Guess Attempts Breakdown ({gwGuesses.length}/5)
              </h4>

              <div className="space-y-2">
                {gwGuesses.map((guess, idx) => {
                  const isNationMatch = guess.nation === gwTargetCard.nation;
                  const isPosMatch = guess.position === gwTargetCard.position;
                  const isPosGroupMatch =
                    !isPosMatch &&
                    getPositionGroup(guess.position) === getPositionGroup(gwTargetCard.position);
                  const isClubMatch = guess.club === gwTargetCard.club;
                  const isLeagueMatch = guess.league === gwTargetCard.league;
                  const ratingDiff = guess.rating - gwTargetCard.rating;

                  return (
                    <div
                      key={`${guess.id}_${idx}`}
                      className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-[160px]">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-mono">
                          {gwGuesses.length - idx}
                        </span>
                        <div>
                          <span className="font-bold text-white block">{guess.name}</span>
                          <span className="text-[10px] text-slate-500">
                            {guess.program || 'Standard'}
                          </span>
                        </div>
                      </div>

                      {/* Attribute Badges */}
                      <div className="grid grid-cols-4 gap-2 w-full md:w-auto md:flex-1 justify-items-center">
                        {/* Nation */}
                        <div
                          className={`w-full py-1.5 px-2 rounded-xl text-center border font-bold text-[11px] truncate ${
                            isNationMatch
                              ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}
                        >
                          <span className="mr-1">{guess.nationFlag}</span>
                          <span>{guess.nation}</span>
                        </div>

                        {/* Position */}
                        <div
                          className={`w-full py-1.5 px-2 rounded-xl text-center border font-bold text-[11px] truncate ${
                            isPosMatch
                              ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
                              : isPosGroupMatch
                              ? 'bg-amber-950/80 border-amber-500/60 text-amber-300'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}
                        >
                          <span>{guess.position}</span>
                        </div>

                        {/* Club */}
                        <div
                          className={`w-full py-1.5 px-2 rounded-xl text-center border font-bold text-[11px] truncate ${
                            isClubMatch
                              ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
                              : isLeagueMatch
                              ? 'bg-amber-950/80 border-amber-500/60 text-amber-300'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}
                        >
                          <span>{guess.club}</span>
                        </div>

                        {/* Rating with clue indicator */}
                        <div
                          className={`w-full py-1.5 px-2 rounded-xl text-center border font-mono font-bold text-[11px] flex items-center justify-center gap-1 ${
                            ratingDiff === 0
                              ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}
                        >
                          <span>{guess.rating} OVR</span>
                          {ratingDiff > 0 && <span className="text-amber-400 font-sans text-xs">⬇️</span>}
                          {ratingDiff < 0 && <span className="text-amber-400 font-sans text-xs">⬆️</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* GAME 3: PACK DUO 50-PACK SPEED DRAFT, 5 CHECKLISTS & SHOWDOWN */}
      {/* ========================================================================= */}
      {activeGame === 'pack_duo' && (
        <PackDuoGame
          allCardsPool={allCardsPool}
          onAddUnopenedPack={onAddUnopenedPack}
          onNavigateToMyPacks={onNavigateToMyPacks}
        />
      )}
    </div>
  );
};
