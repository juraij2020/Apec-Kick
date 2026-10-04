import React, { useState, useMemo } from 'react';
import { SoccerCard, CardSetDefinition } from '../types/card';
import {
  AVAILABLE_CARD_SETS,
  HALL_OF_FUT_COLLECTIBLE_CARDS,
  HARRY_KANE_SET_REWARD,
} from '../data/hallOfFutCards';
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
  ChevronDown,
  ChevronUp,
  Sparkles,
  Layers,
  Award,
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
  // Expandable active set state - default to first set (Hall of FUT)
  const [expandedSetId, setExpandedSetId] = useState<string | null>(AVAILABLE_CARD_SETS[0]?.id || null);

  // Filter type for album cards
  const [filterType, setFilterType] = useState<'all' | 'owned' | 'missing' | 'base' | 'upgrade'>('all');

  // Claim celebration modal
  const [celebrationReward, setCelebrationReward] = useState<SoccerCard | null>(null);

  // Persistent claimed sets tracker
  const [claimedSetIds, setClaimedSetIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('apex_fut_claimed_sets_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Calculate owned players map for Hall of FUT collection
  const { ownedCardIds, ownedCountsMap, uniqueCount } = useMemo(() => {
    const ownedIds = new Set<string>();
    const countsMap: { [cardId: string]: number } = {};

    clubCards.forEach((card) => {
      if (!card) return;
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

  // Handler to toggle an expandable set
  const toggleSetExpansion = (setId: string) => {
    sound.playClick();
    setExpandedSetId((prev) => (prev === setId ? null : setId));
  };

  // Claim set reward handler
  const handleClaimReward = (set: CardSetDefinition) => {
    const isClaimed = claimedSetIds.includes(set.id);
    if (uniqueCount < set.requiredPlayerIds.length || isClaimed) return;

    sound.playLevelUp();
    confetti({
      particleCount: 130,
      spread: 100,
      origin: { y: 0.55 },
    });

    // Add exclusive reward to user's club
    onAddCardsToClub([set.rewardPlayer]);

    // Update claimed sets
    const updated = [...claimedSetIds, set.id];
    setClaimedSetIds(updated);
    safeSetItem('apex_fut_claimed_sets_v1', JSON.stringify(updated));
    setCelebrationReward(set.rewardPlayer);
  };

  // Filtered cards for Hall of FUT album
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
                Collector Hub
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Complete themed player card sets in your Club to unlock untradeable supreme rewards. Expand any set below to track required unique cards and claim your reward!
            </p>
          </div>
        </div>

        {/* Global Hub Action Buttons */}
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

      {/* Hub Status Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Available Sets</span>
            <strong className="text-lg font-black text-white">{AVAILABLE_CARD_SETS.length} Active</strong>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Sets Completed</span>
            <strong className="text-lg font-black text-emerald-400">
              {claimedSetIds.length} / {AVAILABLE_CARD_SETS.length}
            </strong>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center text-yellow-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Apex Reward</span>
            <strong className="text-lg font-black text-white">Harry Kane 99</strong>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Duplicate Rule</span>
            <strong className="text-sm font-black text-sky-300">18 Unique Required</strong>
          </div>
        </div>
      </div>

      {/* Vertical Expandable List of Set Collections */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-300">
              Set Collections Catalog
            </h2>
          </div>
          <span className="text-xs text-slate-400">Click any set to expand details & album</span>
        </div>

        {AVAILABLE_CARD_SETS.map((set) => {
          const isExpanded = expandedSetId === set.id;
          const isClaimed = claimedSetIds.includes(set.id);
          const totalRequired = set.requiredPlayerIds.length;
          const currentUnique = uniqueCount; // extensible for future sets
          const isReadyToClaim = currentUnique >= totalRequired && !isClaimed;
          const progressPercent = Math.min(100, Math.round((currentUnique / totalRequired) * 100));

          return (
            <div
              key={set.id}
              className={`rounded-3xl border-2 transition-all overflow-hidden ${
                isExpanded
                  ? 'border-amber-500/80 bg-slate-900/95 shadow-[0_0_35px_rgba(245,158,11,0.2)]'
                  : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
              }`}
            >
              {/* Expandable Set Header (Summary Card) */}
              <div
                onClick={() => toggleSetExpansion(set.id)}
                className="p-5 sm:p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 select-none hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Reward Thumbnail & Rating Badge */}
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-16 rounded-xl bg-gradient-to-b from-red-600 to-amber-600 p-0.5 flex flex-col items-center justify-center shadow-lg">
                      <span className="text-[10px] font-black text-yellow-200">REWARD</span>
                      <span className="text-xl font-black text-white leading-none">99</span>
                      <span className="text-[10px] font-bold text-yellow-200 uppercase">ST</span>
                    </div>
                    {isClaimed && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow">
                        <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40">
                        {set.badge}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        {set.program}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-white group-hover:text-amber-400 transition-colors">
                      {set.title}
                    </h3>
                    <p className="text-xs text-slate-300 line-clamp-1 max-w-xl">
                      {set.subtitle}
                    </p>
                  </div>
                </div>

                {/* Progress bar + State + Chevron */}
                <div className="flex items-center gap-4 self-end md:self-center w-full md:w-auto justify-between md:justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                  <div className="min-w-[170px] space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400 font-bold">Progress</span>
                      <span className="font-black text-amber-400 font-mono text-xs">
                        {currentUnique} / {totalRequired} Unique
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isClaimed ? (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Claimed</span>
                      </span>
                    ) : isReadyToClaim ? (
                      <span className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider animate-bounce flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.6)]">
                        <Trophy className="w-3.5 h-3.5" />
                        <span>Ready!</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 border border-slate-700 text-xs font-bold uppercase tracking-wider">
                        In Progress
                      </span>
                    )}
                  </div>

                  {/* Chevron Button */}
                  <button
                    aria-label={isExpanded ? 'Collapse Set' : 'Expand Set'}
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-amber-400" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Expanded Set Content */}
              {isExpanded && (
                <div className="border-t border-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Featured Reward Spotlight Stage */}
                  <div className="p-6 bg-gradient-to-b from-[#170a0a] via-slate-950 to-slate-900 border-b border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                      {/* 3D Card Display */}
                      <div className="relative group">
                        <div className="absolute -inset-2 bg-gradient-to-r from-red-500 to-amber-500 rounded-3xl blur-xl opacity-60 group-hover:opacity-90 transition-opacity animate-pulse" />
                        <div className="relative transform hover:scale-105 transition-transform duration-300">
                          <CardItem card={set.rewardPlayer} size="md" interactive={true} />
                        </div>
                      </div>

                      {/* Reward Details & Stats */}
                      <div className="space-y-3 max-w-md">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/60 text-red-300 text-xs font-black uppercase tracking-wider">
                          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                          <span>Supreme Set Reward (Exclusive)</span>
                        </div>
                        <h3 className="text-3xl font-black text-white">
                          {set.rewardPlayer.name} <span className="text-amber-400">{set.rewardPlayer.rating} {set.rewardPlayer.position}</span>
                        </h3>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {set.rewardPlayer.club} · {set.rewardPlayer.league} · 99 SHO & 92 PAS with Finesse Shot+ playstyle. <strong>Strictly unavailable in packs or the transfer market</strong> — can solely be earned through completing this 18-card set.
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
                          onClick={() => handleClaimReward(set)}
                          disabled={!isReadyToClaim}
                          className={`px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all flex items-center gap-2.5 ${
                            isReadyToClaim
                              ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 shadow-[0_0_30px_rgba(245,158,11,0.7)] hover:scale-105 active:scale-95 animate-bounce'
                              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-80'
                          }`}
                        >
                          {isReadyToClaim ? (
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

                      {!isClaimed && (
                        <span className="text-xs text-slate-400 text-center">
                          {totalRequired - currentUnique > 0 ? (
                            <>
                              Need <strong>{totalRequired - currentUnique}</strong> more separate players to claim
                            </>
                          ) : (
                            <span className="text-emerald-400 font-bold">All 18 separate players collected!</span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Album Filter Controls */}
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
                        Owned ({currentUnique})
                      </button>
                      <button
                        onClick={() => setFilterType('missing')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                          filterType === 'missing'
                            ? 'bg-red-500 text-white'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        Missing ({totalRequired - currentUnique})
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

                            {/* Card Item */}
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
              )}
            </div>
          );
        })}
      </div>

      {/* Claim Celebration Modal */}
      {celebrationReward && (
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
                {celebrationReward.name} {celebrationReward.rating} {celebrationReward.position} Claimed!
              </h3>
              <p className="text-xs text-slate-300">
                You successfully assembled all required separate players into your Club! The untradeable master reward has been deposited into your active Club roster.
              </p>
            </div>

            <div className="flex justify-center py-2">
              <div className="transform hover:scale-105 transition-transform duration-300">
                <CardItem card={celebrationReward} size="md" interactive={true} />
              </div>
            </div>

            <button
              onClick={() => setCelebrationReward(null)}
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
