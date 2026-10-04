import React, { useState, useMemo } from 'react';
import { SoccerCard, CardSetDefinition } from '../types/card';
import { HALL_OF_FUT_SET_DEFINITION, HALL_OF_FUT_COLLECTIBLE_CARDS, HARRY_KANE_SET_REWARD } from '../data/hallOfFutCards';
import { CardItem } from './CardItem';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { safeSetItem } from '../utils/safeStorage';
import {
  Trophy,
  CheckCircle2,
  Lock,
  PackageOpen,
  ShoppingBag,
  Filter,
  Star,
} from 'lucide-react';

interface SetRewardsHubProps {
  clubCards: SoccerCard[];
  onAddCardsToClub: (cards: SoccerCard[]) => void;
  onNavigateToStore?: (filter?: string) => void;
  onNavigateToMarket?: () => void;
}

export const SetRewardsHub: React.FC<SetRewardsHubProps> = ({
  clubCards,
  onAddCardsToClub,
  onNavigateToStore,
  onNavigateToMarket,
}) => {
  const [activeSet] = useState<CardSetDefinition>(HALL_OF_FUT_SET_DEFINITION);
  const [filterType, setFilterType] = useState<'all' | 'owned' | 'missing' | 'base' | 'upgrade'>('all');
  const [showClaimCelebration, setShowClaimCelebration] = useState<boolean>(false);

  // Claimed sets storage
  const [claimedSetIds, setClaimedSetIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('apex_fut_claimed_sets_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const isClaimed = claimedSetIds.includes(activeSet.id);

  // Compute unique owned players strictly (Duplicates do not count towards the 18!)
  const { ownedCardIds, ownedCountsMap, uniqueCount } = useMemo(() => {
    const ownedIds = new Set<string>();
    const countsMap: { [cardId: string]: number } = {};

    clubCards.forEach((card) => {
      if (!card) return;
      // Match by exact card ID or normalized name for Hall of FUT players
      const matchedHofCard = HALL_OF_FUT_COLLECTIBLE_CARDS.find(
        (hof) => hof.id === card.id || (card.program === 'Hall of FUT' && card.name.toLowerCase() === hof.name.toLowerCase())
      );

      if (matchedHofCard) {
        ownedIds.add(matchedHofCard.id);
        countsMap[matchedHofCard.id] = (countsMap[matchedHofCard.id] || 0) + 1;
      }
    });

    return {
      ownedCardIds: ownedIds,
      ownedCountsMap: countsMap,
      uniqueCount: ownedIds.size,
    };
  }, [clubCards]);

  const totalRequired = activeSet.requiredPlayerIds.length; // 18
  const isComplete = uniqueCount >= totalRequired;
  const progressPercent = Math.min(100, Math.round((uniqueCount / totalRequired) * 100));

  // Handle claiming Harry Kane 99
  const handleClaimReward = () => {
    if (!isComplete || isClaimed) return;

    sound.playLevelUp();
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.55 },
    });

    // Add Harry Kane 99 ST to Club
    onAddCardsToClub([HARRY_KANE_SET_REWARD]);

    // Mark set as claimed
    const updatedClaimed = [...claimedSetIds, activeSet.id];
    setClaimedSetIds(updatedClaimed);
    safeSetItem('apex_fut_claimed_sets_v1', JSON.stringify(updatedClaimed));
    setShowClaimCelebration(true);
  };

  // Filtered card list for album
  const displayedCards = useMemo(() => {
    return HALL_OF_FUT_COLLECTIBLE_CARDS.filter((card) => {
      const isOwned = ownedCardIds.has(card.id);
      if (filterType === 'owned') return isOwned;
      if (filterType === 'missing') return !isOwned;
      if (filterType === 'base') return card.rarity === 'hall_of_fut_base';
      if (filterType === 'upgrade') return card.rarity === 'hall_of_fut_upgrade';
      return true;
    });
  }, [filterType, ownedCardIds]);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Banner: Set Rewards Introduction */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-amber-500/50 bg-gradient-to-r from-slate-950 via-[#1f1505] to-slate-950 p-6 shadow-[0_0_40px_rgba(245,158,11,0.25)] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.6)] flex-shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400">
              <Trophy className="w-8 h-8 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide uppercase">
                Set Rewards 🏆
              </h1>
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2.5 py-0.5 rounded-full">
                Collector Masterclass
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Complete player card sets to unlock untradeable master rewards. Collect all 18 unique Hall of FUT players to unlock the supreme <strong>99 ST Harry Kane</strong>!
            </p>
          </div>
        </div>

        {/* Quick Nav Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          {onNavigateToStore && (
            <button
              onClick={() => {
                onNavigateToStore('Hall of FUT');
                sound.playClick();
              }}
              className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all active:scale-95"
            >
              <PackageOpen className="w-4 h-4" />
              <span>Get Hall of FUT Packs</span>
            </button>
          )}
          {onNavigateToMarket && (
            <button
              onClick={() => {
                onNavigateToMarket();
                sound.playClick();
              }}
              className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95"
            >
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span>Transfer Market</span>
            </button>
          )}
        </div>
      </div>

      {/* Featured Active Set: Hall of FUT Collection */}
      <div className="rounded-3xl border-2 border-slate-800 bg-slate-900/90 overflow-hidden shadow-2xl">
        {/* Set Header Bar */}
        <div className="p-6 bg-gradient-to-b from-slate-800/80 to-slate-900/80 border-b border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40">
                {activeSet.badge}
              </span>
              <span className="text-xs font-bold text-slate-400">
                No Duplicates Allowed · 18 Unique Players Required
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {activeSet.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {activeSet.description}
            </p>
          </div>

          {/* Progress Tracker Card */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-700/80 min-w-[280px] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-400 uppercase">Collection Progress</span>
              <span className="font-black text-amber-400 font-mono text-sm">
                {uniqueCount} / {totalRequired} Unique
              </span>
            </div>

            {/* Visual Bar */}
            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(245,158,11,0.6)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>{totalRequired - uniqueCount > 0 ? `${totalRequired - uniqueCount} players needed` : 'Set Complete!'}</span>
              <span className="font-bold text-white">{progressPercent}%</span>
            </div>
          </div>
        </div>

        {/* Featured Reward Card Stage: Harry Kane 99 ST */}
        <div className="p-6 bg-gradient-to-b from-[#170a0a] via-slate-950 to-slate-900 border-b border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            {/* 3D Card Display */}
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-red-500 to-amber-500 rounded-3xl blur-xl opacity-60 group-hover:opacity-90 transition-opacity animate-pulse" />
              <div className="relative transform hover:scale-105 transition-transform duration-300">
                <CardItem card={HARRY_KANE_SET_REWARD} size="md" interactive={true} />
              </div>
            </div>

            {/* Reward Details & Stats */}
            <div className="space-y-3 max-w-md">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/60 text-red-300 text-xs font-black uppercase tracking-wider">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                <span>Supreme Set Reward (Exclusive)</span>
              </div>
              <h3 className="text-3xl font-black text-white">
                Harry Kane <span className="text-amber-400">99 ST</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                FC Bayern Munich · Bundesliga · 99 SHO & 92 PAS with Finesse Shot+ playstyle. <strong>Strictly unavailable in packs or the transfer market</strong> — can solely be earned through completing this 18-card set.
              </p>

              <div className="grid grid-cols-6 gap-2 text-center pt-1">
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">PAC</span>
                  <strong className="text-sm font-black text-white">71</strong>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/80 border border-red-500/50 bg-red-950/30">
                  <span className="text-[10px] text-red-400 block font-bold">SHO</span>
                  <strong className="text-sm font-black text-red-300">99</strong>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">PAS</span>
                  <strong className="text-sm font-black text-white">92</strong>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">DRI</span>
                  <strong className="text-sm font-black text-white">91</strong>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">DEF</span>
                  <strong className="text-sm font-black text-white">58</strong>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">PHY</span>
                  <strong className="text-sm font-black text-white">92</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Claim Action Button */}
          <div className="flex flex-col items-center justify-center gap-3">
            {isClaimed ? (
              <div className="px-6 py-4 rounded-2xl bg-emerald-950/80 border-2 border-emerald-500 text-emerald-300 font-black text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Claimed & Stored in Club!</span>
              </div>
            ) : (
              <button
                onClick={handleClaimReward}
                disabled={!isComplete}
                className={`px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all flex items-center gap-2.5 ${
                  isComplete
                    ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 shadow-[0_0_30px_rgba(245,158,11,0.7)] hover:scale-105 active:scale-95 animate-bounce'
                    : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-80'
                }`}
              >
                {isComplete ? (
                  <>
                    <Trophy className="w-5 h-5 text-slate-950" />
                    <span>Claim Harry Kane 99 ST!</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Collect All 18 to Unlock</span>
                  </>
                )}
              </button>
            )}

            {!isComplete && (
              <span className="text-xs text-slate-400 text-center">
                Need <strong>{totalRequired - uniqueCount}</strong> more separate players to claim
              </span>
            )}
          </div>
        </div>

        {/* Collector Album Filter Controls */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
              Filter Album:
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                filterType === 'all'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              All Cards (18)
            </button>
            <button
              onClick={() => setFilterType('owned')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                filterType === 'owned'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Owned ({uniqueCount})
            </button>
            <button
              onClick={() => setFilterType('missing')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                filterType === 'missing'
                  ? 'bg-red-500 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Missing ({totalRequired - uniqueCount})
            </button>
            <button
              onClick={() => setFilterType('base')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                filterType === 'base'
                  ? 'bg-slate-300 text-slate-950'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Grey Base (9)
            </button>
            <button
              onClick={() => setFilterType('upgrade')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                filterType === 'upgrade'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Red Upgrade (9)
            </button>
          </div>
        </div>

        {/* 18-Card Collector Album Grid */}
        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {displayedCards.map((card) => {
              const isOwned = ownedCardIds.has(card.id);
              const countOwned = ownedCountsMap[card.id] || 0;
              const isUpgrade = card.rarity === 'hall_of_fut_upgrade';

              return (
                <div
                  key={card.id}
                  className={`relative rounded-2xl p-3 border-2 transition-all flex flex-col justify-between items-center text-center ${
                    isOwned
                      ? 'border-emerald-500/80 bg-slate-900/90 shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:border-emerald-400'
                      : 'border-slate-800 bg-slate-950/80 opacity-60 hover:opacity-90'
                  }`}
                >
                  {/* Status Badge */}
                  <div className="w-full flex items-center justify-between mb-2">
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        isUpgrade
                          ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                          : 'bg-slate-700/40 text-slate-300 border border-slate-600'
                      }`}
                    >
                      {isUpgrade ? 'Upgrade' : 'Base'}
                    </span>

                    {isOwned ? (
                      <span className="flex items-center gap-1 text-[10px] font-black text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>In Club</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                        <Lock className="w-3 h-3" />
                        <span>Locked</span>
                      </span>
                    )}
                  </div>

                  {/* Card Display */}
                  <div className="my-1 transform hover:scale-105 transition-transform">
                    <CardItem card={card} size="sm" interactive={false} />
                  </div>

                  {/* Card Meta & Duplicate Note */}
                  <div className="w-full mt-2 pt-2 border-t border-slate-800/80 text-[11px]">
                    <div className="font-black text-white truncate">{card.shortName || card.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{card.club}</div>
                    {isOwned && countOwned > 1 && (
                      <div className="text-[9px] text-amber-400 font-bold mt-1">
                        {countOwned}x owned (1 counts)
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Celebration Modal when Harry Kane 99 is claimed */}
      {showClaimCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
          <div className="relative max-w-lg w-full rounded-3xl border-2 border-amber-500 bg-gradient-to-b from-slate-950 via-[#1f0b0b] to-slate-950 p-6 text-center space-y-6 shadow-[0_0_60px_rgba(245,158,11,0.6)]">
            <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-500 mx-auto flex items-center justify-center text-4xl shadow-inner">
              👑
            </div>

            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                Set Completed!
              </span>
              <h3 className="text-3xl font-black text-white">
                Harry Kane 99 ST Claimed!
              </h3>
              <p className="text-xs text-slate-300">
                You successfully assembled all 18 separate Hall of FUT players into your Club! The legendary 99 ST Harry Kane has been deposited into your active Club roster.
              </p>
            </div>

            <div className="flex justify-center py-2">
              <div className="transform hover:scale-105 transition-transform duration-300">
                <CardItem card={HARRY_KANE_SET_REWARD} size="md" interactive={true} />
              </div>
            </div>

            <button
              onClick={() => setShowClaimCelebration(false)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg active:scale-95 transition-all"
            >
              Continue to Club
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
