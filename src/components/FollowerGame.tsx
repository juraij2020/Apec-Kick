import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { SoccerCard } from '../types/card';
import {
  FOLLOWER_CHALLENGE_CARDS,
  FOLLOWER_HERO_CARDS,
  FOLLOWER_ICON_CARDS,
  OLISE_99_SET_REWARD,
  CARRICK_99_SET_REWARD,
  BALE_99_SET_REWARD,
  FOLLOWER_COOLDOWN_MS,
  FollowerCooldownState,
  FollowerSeriesProgress,
  getNextRandomUnownedPlayer,
  generateMysteryFollowerSvg,
} from '../data/followerCards';
import { CardItem } from './CardItem';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { safeGetItem, safeSetItem } from '../utils/safeStorage';
import {
  Instagram,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Trophy,
  ChevronRight,
  Flame,
  Crown,
  FastForward,
  HelpCircle,
  Lock,
  Star,
} from 'lucide-react';

interface FollowerGameProps {
  clubCards: SoccerCard[];
  onAddCardsToClub: (cards: SoccerCard[]) => void;
  onNavigateToSetRewards?: () => void;
  onMiniGamePlayed?: () => void;
}

const STORAGE_KEY = 'apex_fut_follower_cooldowns_v2';

export const FollowerGame: React.FC<FollowerGameProps> = ({
  clubCards,
  onAddCardsToClub,
  onNavigateToSetRewards,
  onMiniGamePlayed,
}) => {
  // Current live timestamp
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // Category tab: 'modern', 'heroes', or 'icons'
  const [activeCategory, setActiveCategory] = useState<'modern' | 'heroes' | 'icons'>('modern');

  // Load persistent progress state for all 3 categories
  const [cooldownState, setCooldownState] = useState<FollowerCooldownState>(() => {
    let parsed: any = null;
    try {
      const saved = safeGetItem(STORAGE_KEY);
      if (saved) parsed = JSON.parse(saved);
    } catch {
      // fallback
    }

    const initialModern = getNextRandomUnownedPlayer(FOLLOWER_CHALLENGE_CARDS, clubCards, null);
    const initialHeroes = getNextRandomUnownedPlayer(FOLLOWER_HERO_CARDS, clubCards, null);
    const initialIcons = getNextRandomUnownedPlayer(FOLLOWER_ICON_CARDS, clubCards, null);

    return {
      modern: parsed?.modern || {
        activePlayerId: initialModern ? initialModern.id : FOLLOWER_CHALLENGE_CARDS[0].id,
        cooldownUntil: null,
        lastClaimedAt: null,
      },
      heroes: parsed?.heroes || {
        activePlayerId: initialHeroes ? initialHeroes.id : FOLLOWER_HERO_CARDS[0].id,
        cooldownUntil: null,
        lastClaimedAt: null,
      },
      icons: parsed?.icons || {
        activePlayerId: initialIcons ? initialIcons.id : FOLLOWER_ICON_CARDS[0].id,
        cooldownUntil: null,
        lastClaimedAt: null,
      },
    };
  });

  // Save to safeStorage whenever cooldownState changes
  const saveState = useCallback((newState: FollowerCooldownState) => {
    setCooldownState(newState);
    safeSetItem(STORAGE_KEY, JSON.stringify(newState));
  }, []);

  // Verification flow state
  const [verifyingPlayerId, setVerifyingPlayerId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(5);
  const [verifySuccessPlayer, setVerifySuccessPlayer] = useState<SoccerCard | null>(null);

  // Helper to test if a card is owned in user's club
  const isCardOwned = useCallback(
    (cardId: string) => {
      return clubCards.some((c) => c.id === cardId);
    },
    [clubCards]
  );

  // Metrics
  const ownedModernCount = useMemo(() => {
    return FOLLOWER_CHALLENGE_CARDS.filter((c) => isCardOwned(c.id)).length;
  }, [clubCards, isCardOwned]);

  const ownedHeroCount = useMemo(() => {
    return FOLLOWER_HERO_CARDS.filter((c) => isCardOwned(c.id)).length;
  }, [clubCards, isCardOwned]);

  const ownedIconCount = useMemo(() => {
    return FOLLOWER_ICON_CARDS.filter((c) => isCardOwned(c.id)).length;
  }, [clubCards, isCardOwned]);

  const totalOwnedCount = ownedModernCount + ownedHeroCount + ownedIconCount;

  // Active category series metadata
  const currentSeriesCards =
    activeCategory === 'modern'
      ? FOLLOWER_CHALLENGE_CARDS
      : activeCategory === 'heroes'
      ? FOLLOWER_HERO_CARDS
      : FOLLOWER_ICON_CARDS;

  const currentCategoryProgress: FollowerSeriesProgress =
    cooldownState[activeCategory] || {
      activePlayerId: currentSeriesCards[0]?.id || null,
      cooldownUntil: null,
      lastClaimedAt: null,
    };

  const isAllCategoryOwned =
    activeCategory === 'modern'
      ? ownedModernCount >= 8
      : activeCategory === 'heroes'
      ? ownedHeroCount >= 8
      : ownedIconCount >= 8;

  // Check if cooldown is currently active
  const isCooldownActive = Boolean(
    currentCategoryProgress.cooldownUntil && currentTime < currentCategoryProgress.cooldownUntil
  );

  // Check if cooldown has just expired and a new random player should be unveiled
  useEffect(() => {
    let stateChanged = false;
    const nextState: FollowerCooldownState = {
      ...cooldownState,
      icons: cooldownState.icons || {
        activePlayerId: FOLLOWER_ICON_CARDS[0].id,
        cooldownUntil: null,
        lastClaimedAt: null,
      },
    };

    // Check Modern
    if (
      nextState.modern.cooldownUntil &&
      currentTime >= nextState.modern.cooldownUntil &&
      ownedModernCount < 8
    ) {
      const nextModernCard = getNextRandomUnownedPlayer(
        FOLLOWER_CHALLENGE_CARDS,
        clubCards,
        nextState.modern.activePlayerId
      );
      nextState.modern = {
        activePlayerId: nextModernCard ? nextModernCard.id : null,
        cooldownUntil: null,
        lastClaimedAt: nextState.modern.lastClaimedAt,
      };
      stateChanged = true;
      sound.playLevelUp();
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }

    // Check Heroes
    if (
      nextState.heroes.cooldownUntil &&
      currentTime >= nextState.heroes.cooldownUntil &&
      ownedHeroCount < 8
    ) {
      const nextHeroCard = getNextRandomUnownedPlayer(
        FOLLOWER_HERO_CARDS,
        clubCards,
        nextState.heroes.activePlayerId
      );
      nextState.heroes = {
        activePlayerId: nextHeroCard ? nextHeroCard.id : null,
        cooldownUntil: null,
        lastClaimedAt: nextState.heroes.lastClaimedAt,
      };
      stateChanged = true;
      sound.playLevelUp();
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }

    // Check Icons
    if (
      nextState.icons.cooldownUntil &&
      currentTime >= nextState.icons.cooldownUntil &&
      ownedIconCount < 8
    ) {
      const nextIconCard = getNextRandomUnownedPlayer(
        FOLLOWER_ICON_CARDS,
        clubCards,
        nextState.icons.activePlayerId
      );
      nextState.icons = {
        activePlayerId: nextIconCard ? nextIconCard.id : null,
        cooldownUntil: null,
        lastClaimedAt: nextState.icons.lastClaimedAt,
      };
      stateChanged = true;
      sound.playLevelUp();
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }

    // Auto-fix if active player is already owned and not in cooldown
    if (
      !nextState.modern.cooldownUntil &&
      nextState.modern.activePlayerId &&
      isCardOwned(nextState.modern.activePlayerId) &&
      ownedModernCount < 8
    ) {
      const nextModernCard = getNextRandomUnownedPlayer(
        FOLLOWER_CHALLENGE_CARDS,
        clubCards,
        nextState.modern.activePlayerId
      );
      if (nextModernCard) {
        nextState.modern.activePlayerId = nextModernCard.id;
        stateChanged = true;
      }
    }

    if (
      !nextState.heroes.cooldownUntil &&
      nextState.heroes.activePlayerId &&
      isCardOwned(nextState.heroes.activePlayerId) &&
      ownedHeroCount < 8
    ) {
      const nextHeroCard = getNextRandomUnownedPlayer(
        FOLLOWER_HERO_CARDS,
        clubCards,
        nextState.heroes.activePlayerId
      );
      if (nextHeroCard) {
        nextState.heroes.activePlayerId = nextHeroCard.id;
        stateChanged = true;
      }
    }

    if (
      !nextState.icons.cooldownUntil &&
      nextState.icons.activePlayerId &&
      isCardOwned(nextState.icons.activePlayerId) &&
      ownedIconCount < 8
    ) {
      const nextIconCard = getNextRandomUnownedPlayer(
        FOLLOWER_ICON_CARDS,
        clubCards,
        nextState.icons.activePlayerId
      );
      if (nextIconCard) {
        nextState.icons.activePlayerId = nextIconCard.id;
        stateChanged = true;
      }
    }

    if (stateChanged) {
      saveState(nextState);
    }
  }, [
    currentTime,
    cooldownState,
    clubCards,
    ownedModernCount,
    ownedHeroCount,
    ownedIconCount,
    isCardOwned,
    saveState,
  ]);

  // Live timer interval (every second)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Time remaining until cooldown finishes
  const timeRemaining = useMemo(() => {
    if (!currentCategoryProgress.cooldownUntil) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    const diff = Math.max(0, currentCategoryProgress.cooldownUntil - currentTime);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  }, [currentCategoryProgress.cooldownUntil, currentTime]);

  // Current active player to display/follow (or null if on cooldown)
  const activePlayerCard: SoccerCard | null = useMemo(() => {
    if (isCooldownActive) return null;
    const cardId = currentCategoryProgress.activePlayerId;
    if (!cardId) return null;
    return currentSeriesCards.find((c) => c.id === cardId) || currentSeriesCards[0];
  }, [isCooldownActive, currentCategoryProgress.activePlayerId, currentSeriesCards]);

  // Verification countdown runner
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (verifyingPlayerId && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (verifyingPlayerId && countdown === 0) {
      // Verification complete!
      const playerToAward = currentSeriesCards.find((c) => c.id === verifyingPlayerId);
      if (playerToAward && !isCardOwned(playerToAward.id)) {
        onAddCardsToClub([playerToAward]);
        if (onMiniGamePlayed) onMiniGamePlayed();
        setVerifySuccessPlayer(playerToAward);
        sound.playCoinClink();

        confetti({
          particleCount: 130,
          spread: 85,
          origin: { y: 0.6 },
          colors: ['#ffd700', '#00f5d4', '#ef4444', '#f59e0b', '#3b82f6'],
        });

        // Trigger the 3-day cooldown immediately!
        const now = Date.now();
        const nextState: FollowerCooldownState = {
          ...cooldownState,
          [activeCategory]: {
            activePlayerId: null,
            cooldownUntil: now + FOLLOWER_COOLDOWN_MS,
            lastClaimedAt: now,
          },
        };
        saveState(nextState);
      }
      setVerifyingPlayerId(null);
    }
    return () => clearInterval(timer);
  }, [
    verifyingPlayerId,
    countdown,
    currentSeriesCards,
    isCardOwned,
    onAddCardsToClub,
    onMiniGamePlayed,
    activeCategory,
    cooldownState,
    saveState,
  ]);

  // Initiate Follow & Verify action
  const handleFollowAndClaim = (player: SoccerCard) => {
    sound.playClick();
    if (isCardOwned(player.id) || isCooldownActive) return;

    // Open official Instagram in new tab
    if (player.instagramUrl) {
      window.open(player.instagramUrl, '_blank', 'noopener,noreferrer');
    }

    // Start 5-second verification countdown
    setVerifyingPlayerId(player.id);
    setCountdown(5);
  };

  // Instant Skip/Fast-Forward 3 Days (For testing and rapid evaluation)
  const handleFastForwardCooldown = () => {
    sound.playClick();
    const nextCard = getNextRandomUnownedPlayer(
      currentSeriesCards,
      clubCards,
      currentCategoryProgress.activePlayerId
    );

    const nextState: FollowerCooldownState = {
      ...cooldownState,
      [activeCategory]: {
        activePlayerId: nextCard ? nextCard.id : null,
        cooldownUntil: null,
        lastClaimedAt: currentCategoryProgress.lastClaimedAt,
      },
    };

    saveState(nextState);
    sound.playLevelUp();
    confetti({ particleCount: 85, spread: 70, origin: { y: 0.6 } });
  };

  const getCategoryTitle = () => {
    if (activeCategory === 'modern') return 'Modern Stars';
    if (activeCategory === 'heroes') return 'Hero Legends';
    return 'Icon Legends';
  };

  const getCategoryRewardName = () => {
    if (activeCategory === 'modern') return '99 Michael Olise';
    if (activeCategory === 'heroes') return '99 Michael Carrick';
    return '99 Gareth Bale';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Master Set Teasers (99 Olise, 99 Carrick, 99 Bale) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-950/85 via-slate-900 to-amber-950/80 border-2 border-red-500/40 p-5 sm:p-6 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-500 p-0.5 shadow-lg flex-shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Instagram className="w-7 h-7 text-pink-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/40 rounded-full">
                  Sequential 3-Day Challenge
                </span>
                <span className="text-xs font-semibold text-emerald-400">
                  {totalOwnedCount} / 24 Collected Total
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white mt-1 flex items-center gap-2">
                Follower Cards Challenge
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h2>
              <p className="text-xs text-slate-300 max-w-xl">
                Follow one player on Instagram to claim their card, then a <strong>3-day cooldown</strong> begins. Once the timer reaches zero, a <strong>new random unowned player</strong> appears to follow!
              </p>
            </div>
          </div>

          {/* Quick Jump Buttons to Set Rewards */}
          {onNavigateToSetRewards && (
            <div className="flex flex-wrap gap-2 flex-shrink-0">
              <button
                onClick={() => {
                  sound.playClick();
                  onNavigateToSetRewards();
                }}
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-black text-xs rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-300" />
                <span>99 Olise ({ownedModernCount}/8)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onNavigateToSetRewards();
                }}
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>99 Carrick ({ownedHeroCount}/8)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onNavigateToSetRewards();
                }}
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 hover:brightness-110 text-slate-950 font-black text-xs rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                <Star className="w-3.5 h-3.5 text-amber-800 fill-amber-800" />
                <span>99 Bale ({ownedIconCount}/8)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Category Toggle Tabs (Separate 3-Day Cooldowns: Modern, Heroes, Icons) */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 border-b border-slate-800 pb-2">
        <button
          onClick={() => {
            sound.playClick();
            setActiveCategory('modern');
          }}
          className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
            activeCategory === 'modern'
              ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] scale-105'
              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <span>⚡ Modern Stars</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-950/60 text-[10px] font-mono">
            {ownedModernCount}/8
          </span>
          {cooldownState.modern.cooldownUntil && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          )}
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveCategory('heroes');
          }}
          className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
            activeCategory === 'heroes'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black shadow-[0_0_20px_rgba(245,158,11,0.5)] scale-105'
              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Crown className="w-4 h-4" />
          <span>👑 Hero Legends</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-950/60 text-[10px] font-mono">
            {ownedHeroCount}/8
          </span>
          {cooldownState.heroes.cooldownUntil && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          )}
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveCategory('icons');
          }}
          className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
            activeCategory === 'icons'
              ? 'bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 text-slate-950 font-black shadow-[0_0_20px_rgba(250,204,21,0.6)] scale-105'
              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Star className="w-4 h-4 fill-amber-700 text-amber-700" />
          <span>⭐ Icon Legends</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-950/60 text-[10px] font-mono text-white">
            {ownedIconCount}/8
          </span>
          {cooldownState.icons?.cooldownUntil && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          )}
        </button>
      </div>

      {/* Main Stage: Active Card OR Shrouded 3-Day Countdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Interactive Card Spotlight / Mystery Shroud */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center bg-slate-900/60 border border-slate-800 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            {isAllCategoryOwned ? (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-[11px] font-black uppercase tracking-wider">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Set Complete
              </span>
            ) : isCooldownActive ? (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-[11px] font-black uppercase tracking-wider animate-pulse">
                <Clock className="w-3 h-3 text-amber-400" />
                3-Day Cooldown Active
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-[11px] font-black uppercase tracking-wider animate-pulse">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                New Icon Popped Up!
              </span>
            )}
          </div>

          {/* Card Presentation */}
          <div className="w-64 sm:w-72 mt-4 transform hover:scale-105 transition-transform duration-300">
            {isAllCategoryOwned ? (
              /* All 8 claimed banner */
              <div className="w-full h-96 rounded-3xl bg-slate-950 border-2 border-emerald-500/60 flex flex-col items-center justify-center p-6 text-center shadow-2xl">
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <h4 className="text-lg font-black text-white">All 8 Cards Claimed!</h4>
                <p className="text-xs text-slate-300 mt-2">
                  Head over to Set Rewards to complete the final follow step for{' '}
                  <strong className="text-amber-300">{getCategoryRewardName()}</strong>!
                </p>
              </div>
            ) : isCooldownActive ? (
              /* Mystery Shrouded Card */
              <div className="relative group">
                <img
                  src={generateMysteryFollowerSvg(activeCategory)}
                  alt="Mystery Player"
                  className="w-full h-auto object-contain filter drop-shadow-2xl"
                />
              </div>
            ) : activePlayerCard ? (
              /* Revealed Active Card */
              <CardItem card={activePlayerCard} size="lg" interactive={false} />
            ) : (
              <div className="w-full h-96 rounded-3xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                <HelpCircle className="w-12 h-12 text-slate-600 animate-pulse" />
              </div>
            )}
          </div>

          <p className="text-[11px] text-slate-400 mt-4 text-center font-medium">
            {isAllCategoryOwned
              ? 'Collection completed for this category!'
              : isCooldownActive
              ? 'Holographic mystery shroud active • Unveils automatically in 3 days'
              : 'Follow on Instagram to claim, then the next random card prepares!'}
          </p>
        </div>

        {/* Right Col: Cooldown Timer & Action Terminal */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8">
          <div>
            {/* 3-Day Countdown Terminal */}
            <div className="bg-slate-950/80 border border-red-500/30 rounded-2xl p-5 mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-red-400 animate-spin" />
                  {isCooldownActive
                    ? '3-Day Cooldown Remaining:'
                    : isAllCategoryOwned
                    ? 'Series Complete'
                    : 'Active Player Available Now:'}
                </span>

                {/* Developer Fast-Forward Skip Tool */}
                {isCooldownActive && (
                  <button
                    onClick={handleFastForwardCooldown}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-[10px] font-bold transition-all hover:scale-105 active:scale-95"
                    title="Instantly finishes 3-day timer to test the random player reveal"
                  >
                    <FastForward className="w-3 h-3" />
                    <span>Skip 3 Days (Test)</span>
                  </button>
                )}
              </div>

              {/* 4-Box Countdown */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-slate-900 border border-slate-800 rounded-xl py-2.5">
                  <div className="text-xl sm:text-3xl font-black text-white font-mono">
                    {timeRemaining.days}
                  </div>
                  <div className="text-[9px] uppercase font-bold text-slate-400">Days</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl py-2.5">
                  <div className="text-xl sm:text-3xl font-black text-white font-mono">
                    {timeRemaining.hours}
                  </div>
                  <div className="text-[9px] uppercase font-bold text-slate-400">Hours</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl py-2.5">
                  <div className="text-xl sm:text-3xl font-black text-white font-mono">
                    {timeRemaining.minutes}
                  </div>
                  <div className="text-[9px] uppercase font-bold text-slate-400">Mins</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl py-2.5">
                  <div className="text-xl sm:text-3xl font-black text-white font-mono">
                    {timeRemaining.seconds}
                  </div>
                  <div className="text-[9px] uppercase font-bold text-slate-400">Secs</div>
                </div>
              </div>
            </div>

            {/* Info Details Section */}
            {isAllCategoryOwned ? (
              <div className="p-5 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl space-y-3">
                <div className="flex items-center gap-3">
                  <Trophy className="w-8 h-8 text-amber-400" />
                  <div>
                    <h4 className="text-base font-black text-white">Set Complete!</h4>
                    <p className="text-xs text-slate-300">
                      You have unlocked all 8 {getCategoryTitle()}!
                    </p>
                  </div>
                </div>
                {onNavigateToSetRewards && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      onNavigateToSetRewards();
                    }}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all"
                  >
                    Go Claim {getCategoryRewardName()} in Set Rewards
                  </button>
                )}
              </div>
            ) : isCooldownActive ? (
              <div className="space-y-3 p-4 bg-slate-950/60 border border-slate-800 rounded-2xl">
                <div className="flex items-center gap-2.5 text-amber-400">
                  <Lock className="w-5 h-5 flex-shrink-0" />
                  <h3 className="text-base font-black text-white">Cooldown in Progress</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  You successfully claimed a player! In accordance with the 3-day challenge rules, you must wait <strong>72 hours</strong>. When the timer expires, a <strong>new random unowned player</strong> from the{' '}
                  {getCategoryTitle()} set will pop up right here!
                </p>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>Cards remaining to unveil:</span>
                  <strong className="text-amber-400 font-mono">
                    {8 -
                      (activeCategory === 'modern'
                        ? ownedModernCount
                        : activeCategory === 'heroes'
                        ? ownedHeroCount
                        : ownedIconCount)}{' '}
                    Unowned Cards
                  </strong>
                </div>
              </div>
            ) : activePlayerCard ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{activePlayerCard.nationFlag}</span>
                  <div>
                    <h3 className="text-2xl font-black text-white flex items-center gap-2">
                      {activePlayerCard.name}
                      {activeCategory === 'heroes' && <Crown className="w-4 h-4 text-amber-400 inline" />}
                      {activeCategory === 'icons' && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 inline" />}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {activePlayerCard.club} • {activePlayerCard.league} • {activePlayerCard.position}
                    </p>
                  </div>
                </div>

                {/* Instagram Handle Pill */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-500/30 rounded-xl text-pink-300 text-xs font-mono font-bold">
                  <Instagram className="w-4 h-4 text-pink-400" />
                  <span>@{activePlayerCard.instagramHandle}</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed pt-2">
                  Click the button below to follow {activePlayerCard.shortName} on Instagram. Once verified, this card is deposited into your Club, and a <strong>3-day cooldown</strong> begins before the next random player pops up!
                </p>
              </div>
            ) : null}
          </div>

          {/* Action Button & Verification HUD */}
          <div className="pt-6 border-t border-slate-800/80 mt-6 space-y-3">
            {isAllCategoryOwned ? null : isCooldownActive ? (
              <button
                disabled
                className="w-full py-4 px-6 bg-slate-800 text-slate-400 font-bold text-xs uppercase tracking-wider rounded-2xl cursor-not-allowed border border-slate-700/60 flex items-center justify-center gap-2"
              >
                <Clock className="w-4 h-4" />
                <span>Next Random Player in {timeRemaining.days}d {timeRemaining.hours}h {timeRemaining.minutes}m</span>
              </button>
            ) : verifyingPlayerId === activePlayerCard?.id ? (
              <div className="p-4 bg-slate-900 border-2 border-amber-500/50 rounded-2xl space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between text-xs font-black text-white">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                    <span>Verifying Instagram Follow on @{activePlayerCard?.instagramHandle}...</span>
                  </span>
                  <span className="font-mono text-amber-400">{countdown}s remaining</span>
                </div>

                <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-amber-400 via-rose-500 to-pink-500 h-full transition-all duration-1000 ease-linear"
                    style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-400 italic text-center">
                  Please confirm you followed @{activePlayerCard?.instagramHandle} in the opened window.
                </p>
              </div>
            ) : activePlayerCard ? (
              <button
                onClick={() => handleFollowAndClaim(activePlayerCard)}
                className="w-full py-4 px-6 bg-gradient-to-r from-pink-600 via-rose-500 to-red-600 hover:from-pink-500 hover:to-red-500 text-white font-black text-sm rounded-2xl shadow-[0_0_25px_rgba(236,72,153,0.35)] hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                <Instagram className="w-5 h-5 text-white" />
                <span>Follow @{activePlayerCard.instagramHandle} &amp; Claim Card</span>
                <ExternalLink className="w-4 h-4 opacity-75" />
              </button>
            ) : null}

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Safe 72h Cooldown Timer
              </span>
              <span className="text-slate-400 font-mono">
                {activeCategory === 'modern'
                  ? ownedModernCount
                  : activeCategory === 'heroes'
                  ? ownedHeroCount
                  : ownedIconCount}{' '}
                of 8 Unlocked in Series
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Series Album / Collection Progress (All 8 Cards) */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              {getCategoryTitle()} Collection
              <Flame className="w-4 h-4 text-orange-400" />
            </h3>
            <p className="text-xs text-slate-400">
              Claim cards to fill your album. Follow one, wait 3 days, and the next unowned card unlocks!
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-300">
            {activeCategory === 'modern'
              ? ownedModernCount
              : activeCategory === 'heroes'
              ? ownedHeroCount
              : ownedIconCount}{' '}
            / 8 Collected
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {currentSeriesCards.map((player, idx) => {
            const isOwned = isCardOwned(player.id);
            const isActive = activePlayerCard?.id === player.id;

            return (
              <div
                key={player.id}
                className={`relative flex flex-col items-center p-3 rounded-2xl border transition-all text-left ${
                  isActive
                    ? 'bg-red-950/60 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)] scale-[1.03]'
                    : isOwned
                    ? 'bg-slate-900/80 border-emerald-500/40'
                    : 'bg-slate-950/70 border-slate-800 opacity-60'
                }`}
              >
                {/* Badges */}
                <div className="w-full flex items-center justify-between text-[10px] mb-2 font-mono">
                  <span className="font-bold text-slate-400">#{idx + 1}</span>
                  {isOwned ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      OWNED
                    </span>
                  ) : isActive ? (
                    <span className="text-amber-400 font-bold animate-pulse">ACTIVE</span>
                  ) : (
                    <span className="text-slate-500 font-bold">LOCKED</span>
                  )}
                </div>

                {/* Mini Card Preview */}
                <div className="w-16 h-22 relative mb-2">
                  <img
                    src={player.fullCardImage}
                    alt={player.shortName}
                    className="w-full h-full object-contain filter drop-shadow-md"
                  />
                </div>

                <div className="w-full text-center">
                  <div className="text-xs font-black text-white truncate">{player.shortName}</div>
                  <div className="text-[10px] text-slate-400 font-mono font-bold">
                    {player.rating} {player.position}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Success Modal / Banner when card is claimed */}
      {verifySuccessPlayer && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-emerald-500 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-[0_0_50px_rgba(16,185,129,0.3)] animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/40">
                Follow Verified!
              </span>
              <h3 className="text-xl font-black text-white mt-2">
                {verifySuccessPlayer.name} Added to Club!
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Thank you for following @{verifySuccessPlayer.instagramHandle}. Card is now active in your collection.
              </p>
            </div>

            <div className="w-48 mx-auto py-2">
              <CardItem card={verifySuccessPlayer} size="md" interactive={false} />
            </div>

            <div className="p-3 bg-slate-950 border border-amber-500/40 rounded-xl text-xs text-amber-300 flex items-center gap-2">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span>3-day cooldown started! Next random player unlocks in 72 hours.</span>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                setVerifySuccessPlayer(null);
              }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg transition-all"
            >
              Continue Playing
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
