import React, { useState, useMemo } from 'react';
import { SoccerCard, CardSetDefinition } from '../types/card';
import {
  AVAILABLE_CARD_SETS,
  HALL_OF_FUT_COLLECTIBLE_CARDS,
  HARRY_KANE_SET_REWARD,
} from '../data/hallOfFutCards';
import {
  SPANISH_HOF_COLLECTIBLE_CARDS,
  XAVI_SET_REWARD,
  DI_STEFANO_SET_REWARD,
} from '../data/hallOfFutSpanishCards';
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
  ArrowRight,
  Coins,
  ShieldCheck,
} from 'lucide-react';

interface SetRewardsHubProps {
  clubCards: SoccerCard[];
  onAddCardsToClub: (cards: SoccerCard[]) => void;
  onAddCoins?: (amount: number) => void;
  onNavigateToStore?: (filter?: string) => void;
  onNavigateToMarket?: () => void;
}

export const SetRewardsHub: React.FC<SetRewardsHubProps> = ({
  clubCards,
  onAddCardsToClub,
  onAddCoins,
  onNavigateToStore,
  onNavigateToMarket,
}) => {
  // Expandable active set state - default to first Spanish tier or Hall of FUT
  const [expandedSetId, setExpandedSetId] = useState<string | null>(AVAILABLE_CARD_SETS[1]?.id || AVAILABLE_CARD_SETS[0]?.id || null);

  // Filter type for album cards
  const [filterType, setFilterType] = useState<'all' | 'owned' | 'missing' | 'base' | 'upgrade'>('all');

  // Claim celebration modal state
  const [celebrationModal, setCelebrationModal] = useState<{
    card: SoccerCard;
    bonusCoins?: number;
    title: string;
  } | null>(null);

  // Persistent claimed sets tracker
  const [claimedSetIds, setClaimedSetIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('apex_fut_claimed_sets_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Calculate owned card identities in the Club (stripping instance suffix)
  const clubCardIdsSet = useMemo(() => {
    const ids = new Set<string>();
    clubCards.forEach((c) => {
      if (!c) return;
      ids.add(c.id);
      const baseId = c.id.replace(/_inst_.*$/, '');
      ids.add(baseId);
    });
    return ids;
  }, [clubCards]);

  // Helper to get album card list for any set
  const getAlbumCardsForSet = (set: CardSetDefinition): SoccerCard[] => {
    if (set.id === 'set-hall-of-fut') {
      return HALL_OF_FUT_COLLECTIBLE_CARDS;
    }
    if (set.id === 'set-spanish-hof-tier-1') {
      return SPANISH_HOF_COLLECTIBLE_CARDS;
    }
    if (set.id === 'set-spanish-hof-tier-2') {
      // 18 collectible players + Xavi 99 CM = 19 cards
      return [...SPANISH_HOF_COLLECTIBLE_CARDS, XAVI_SET_REWARD];
    }
    return SPANISH_HOF_COLLECTIBLE_CARDS;
  };

  // Helper to compute live progress for a specific set
  const calculateProgress = (set: CardSetDefinition) => {
    const isClaimed = claimedSetIds.includes(set.id);
    const albumCards = getAlbumCardsForSet(set);
    const requiredTarget = set.minRequiredCount || set.requiredPlayerIds.length;

    // Count how many unique required cards exist in club
    let uniqueCount = 0;
    const ownedMap = new Set<string>();
    const countsMap: { [cardId: string]: number } = {};

    clubCards.forEach((c) => {
      if (!c) return;
      const baseId = c.id.replace(/_inst_.*$/, '');
      const match = albumCards.find(
        (target) =>
          target.id === c.id ||
          target.id === baseId ||
          (target.program === c.program && target.name.toLowerCase() === c.name.toLowerCase())
      );

      if (match) {
        if (!ownedMap.has(match.id)) {
          ownedMap.add(match.id);
          uniqueCount++;
        }
        countsMap[match.id] = (countsMap[match.id] || 0) + 1;
      }
    });

    // Check prerequisites
    let prerequisiteSatisfied = true;
    let prerequisiteMessage = '';

    if (set.prerequisiteSetId && !claimedSetIds.includes(set.prerequisiteSetId)) {
      prerequisiteSatisfied = false;
      prerequisiteMessage = 'Requires Tier 1 (Xavi 99) to be claimed first';
    }
    if (set.prerequisiteCardId && !clubCardIdsSet.has(set.prerequisiteCardId)) {
      prerequisiteSatisfied = false;
      prerequisiteMessage = 'Requires Xavi 99 CM in your Club collection';
    }

    const isReadyToClaim = prerequisiteSatisfied && uniqueCount >= requiredTarget && !isClaimed;
    const progressPercent = Math.min(100, Math.round((uniqueCount / requiredTarget) * 100));

    return {
      isClaimed,
      uniqueCount,
      requiredTarget,
      isReadyToClaim,
      progressPercent,
      ownedMap,
      countsMap,
      prerequisiteSatisfied,
      prerequisiteMessage,
      albumCards,
    };
  };

  // Handler to toggle expandable set
  const toggleSetExpansion = (setId: string) => {
    sound.playClick();
    setExpandedSetId((prev) => (prev === setId ? null : setId));
  };

  // Claim set reward handler
  const handleClaimReward = (set: CardSetDefinition) => {
    const prog = calculateProgress(set);
    if (!prog.isReadyToClaim) return;

    sound.playLevelUp();
    confetti({
      particleCount: 140,
      spread: 110,
      origin: { y: 0.55 },
    });

    // Add exclusive reward to user's club
    onAddCardsToClub([set.rewardPlayer]);

    // Add bonus coins if defined
    if (set.bonusCoins && onAddCoins) {
      onAddCoins(set.bonusCoins);
      sound.playCoinClink();
    }

    // Persist claimed state
    const updated = [...claimedSetIds, set.id];
    setClaimedSetIds(updated);
    safeSetItem('apex_fut_claimed_sets_v1', JSON.stringify(updated));

    setCelebrationModal({
      card: set.rewardPlayer,
      bonusCoins: set.bonusCoins,
      title: `${set.rewardPlayer.name} ${set.rewardPlayer.rating} ${set.rewardPlayer.position}`,
    });
  };

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
                Progressive Series Live
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Complete themed card sets to unlock untradeable supreme rewards. Complete <strong>Tier 1 (10 cards) for Xavi 99 CM</strong>, then collect all 19 cards for <strong>Di Stéfano 99 ST</strong>!
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
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Grand Master</span>
            <strong className="text-sm font-black text-white">Di Stéfano 99 ST</strong>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Maestro Reward</span>
            <strong className="text-sm font-black text-sky-300">Xavi 99 CM</strong>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* CONNECTED 2-TIER PROGRESSIVE ROADMAP BANNER                      */}
      {/* ================================================================= */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-amber-500/60 bg-gradient-to-r from-[#170a0a] via-slate-950 to-[#170a0a] p-5 shadow-lg">
        <div className="flex items-center justify-between gap-4 mb-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-black text-sm uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Spanish Hall of FUT: Connected 2-Tier Progressive Campaign</span>
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Tier 1 ➔ Tier 2 Chain
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Step 1: Xavi */}
          <div
            onClick={() => setExpandedSetId('set-spanish-hof-tier-1')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              claimedSetIds.includes('set-spanish-hof-tier-1')
                ? 'bg-emerald-950/40 border-emerald-500/60'
                : 'bg-slate-900/70 border-slate-700 hover:border-amber-400'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Tier 1 Milestone
              </span>
              {claimedSetIds.includes('set-spanish-hof-tier-1') ? (
                <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Xavi 99 Claimed</span>
                </span>
              ) : (
                <span className="text-xs font-bold text-amber-400">
                  Collect Any 10 / 18 Players
                </span>
              )}
            </div>
            <h4 className="text-base font-black text-white flex items-center gap-2">
              <span>Xavi Hernández 99 CM</span>
              <span className="text-[10px] bg-red-950 text-red-300 px-2 py-0.5 rounded border border-red-500/40">
                +50,000 Coins
              </span>
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Assemble any 10 unique players from the series to claim the master midfield general.
            </p>
          </div>

          {/* Step 2: Di Stéfano */}
          <div
            onClick={() => setExpandedSetId('set-spanish-hof-tier-2')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              claimedSetIds.includes('set-spanish-hof-tier-2')
                ? 'bg-emerald-950/40 border-emerald-500/60'
                : !claimedSetIds.includes('set-spanish-hof-tier-1')
                ? 'bg-slate-950/80 border-slate-800 opacity-80 hover:opacity-100'
                : 'bg-slate-900/70 border-slate-700 hover:border-amber-400'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40">
                Tier 2 Grand Master
              </span>
              {claimedSetIds.includes('set-spanish-hof-tier-2') ? (
                <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Di Stéfano 99 Claimed</span>
                </span>
              ) : !claimedSetIds.includes('set-spanish-hof-tier-1') ? (
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Locked until Xavi Claimed</span>
                </span>
              ) : (
                <span className="text-xs font-bold text-amber-400">
                  Collect All 18 + Xavi
                </span>
              )}
            </div>
            <h4 className="text-base font-black text-white flex items-center gap-2">
              <span>Alfredo Di Stéfano 99 ST</span>
              <span className="text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40">
                +100,000 Coins
              </span>
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Assemble all 18 Spanish players and incorporate Xavi 99 CM into your Club to crown the supreme legend.
            </p>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* VERTICAL EXPANDABLE LIST OF SET COLLECTIONS                       */}
      {/* ================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-300">
              Set Collections Catalog ({AVAILABLE_CARD_SETS.length})
            </h2>
          </div>
          <span className="text-xs text-slate-400">Click any set to expand details & album</span>
        </div>

        {AVAILABLE_CARD_SETS.map((set) => {
          const isExpanded = expandedSetId === set.id;
          const prog = calculateProgress(set);
          const albumCards = prog.albumCards;

          // Filtered cards for this set's album
          const displayedCards = albumCards.filter((card) => {
            const isOwned = prog.ownedMap.has(card.id);
            if (filterType === 'owned') return isOwned;
            if (filterType === 'missing') return !isOwned;
            if (filterType === 'base') return card.rarity === 'hall_of_fut_base';
            if (filterType === 'upgrade') return card.rarity === 'hall_of_fut_upgrade';
            return true;
          });

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
                      <span className="text-xl font-black text-white leading-none">
                        {set.rewardPlayer.rating}
                      </span>
                      <span className="text-[10px] font-bold text-yellow-200 uppercase">
                        {set.rewardPlayer.position}
                      </span>
                    </div>
                    {prog.isClaimed && (
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
                      {set.bonusCoins && (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
                          <Coins className="w-3 h-3" />
                          <span>+{set.bonusCoins.toLocaleString()}</span>
                        </span>
                      )}
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
                        {prog.uniqueCount} / {prog.requiredTarget} Cards
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                        style={{ width: `${prog.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {prog.isClaimed ? (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Claimed</span>
                      </span>
                    ) : prog.isReadyToClaim ? (
                      <span className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider animate-bounce flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.6)]">
                        <Trophy className="w-3.5 h-3.5" />
                        <span>Ready!</span>
                      </span>
                    ) : !prog.prerequisiteSatisfied ? (
                      <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-500 border border-slate-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>Locked</span>
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
                  {/* Prerequisite warning banner if locked */}
                  {!prog.prerequisiteSatisfied && (
                    <div className="p-4 bg-amber-950/40 border-b border-amber-500/30 flex items-center gap-3 text-amber-300 text-xs">
                      <Lock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span>
                        <strong>Prerequisite Locked:</strong> {prog.prerequisiteMessage}. Complete and claim Tier 1 to unlock this master reward tier!
                      </span>
                    </div>
                  )}

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
                          {set.rewardPlayer.name}{' '}
                          <span className="text-amber-400">
                            {set.rewardPlayer.rating} {set.rewardPlayer.position}
                          </span>
                        </h3>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {set.rewardPlayer.club} · {set.rewardPlayer.league} · {set.description}
                        </p>

                        <div className="grid grid-cols-6 gap-2 text-center pt-1">
                          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                            <span className="text-[10px] text-slate-400 block font-bold">PAC</span>
                            <strong className="text-sm font-black text-white">{set.rewardPlayer.stats.pac}</strong>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-900/80 border border-red-500/50 bg-red-950/30">
                            <span className="text-[10px] text-red-400 block font-bold">SHO</span>
                            <strong className="text-sm font-black text-red-300">{set.rewardPlayer.stats.sho}</strong>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                            <span className="text-[10px] text-slate-400 block font-bold">PAS</span>
                            <strong className="text-sm font-black text-white">{set.rewardPlayer.stats.pas}</strong>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                            <span className="text-[10px] text-slate-400 block font-bold">DRI</span>
                            <strong className="text-sm font-black text-white">{set.rewardPlayer.stats.dri}</strong>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                            <span className="text-[10px] text-slate-400 block font-bold">DEF</span>
                            <strong className="text-sm font-black text-white">{set.rewardPlayer.stats.def}</strong>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                            <span className="text-[10px] text-slate-400 block font-bold">PHY</span>
                            <strong className="text-sm font-black text-white">{set.rewardPlayer.stats.phy}</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Claim Action Button */}
                    <div className="flex flex-col items-center justify-center gap-3">
                      {prog.isClaimed ? (
                        <div className="px-6 py-4 rounded-2xl bg-emerald-950/80 border-2 border-emerald-500 text-emerald-300 font-black text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          <span>Claimed & Deposited into Club!</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleClaimReward(set)}
                          disabled={!prog.isReadyToClaim}
                          className={`px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all flex items-center gap-2.5 ${
                            prog.isReadyToClaim
                              ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 shadow-[0_0_30px_rgba(245,158,11,0.7)] hover:scale-105 active:scale-95 animate-bounce'
                              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-80'
                          }`}
                        >
                          {prog.isReadyToClaim ? (
                            <>
                              <Trophy className="w-5 h-5 text-slate-950" />
                              <span>Claim {set.rewardPlayer.name} {set.rewardPlayer.rating}!</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-4 h-4" />
                              <span>{prog.prerequisiteSatisfied ? `Collect ${prog.requiredTarget} Cards` : 'Prerequisite Required'}</span>
                            </>
                          )}
                        </button>
                      )}

                      {!prog.isClaimed && (
                        <span className="text-xs text-slate-400 text-center">
                          {prog.requiredTarget - prog.uniqueCount > 0 ? (
                            <>
                              Need <strong>{prog.requiredTarget - prog.uniqueCount}</strong> more unique card(s)
                            </>
                          ) : prog.prerequisiteSatisfied ? (
                            <span className="text-emerald-400 font-bold">Requirement met! Ready to claim!</span>
                          ) : (
                            <span className="text-amber-400 font-semibold">{prog.prerequisiteMessage}</span>
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
                        All Cards ({albumCards.length})
                      </button>
                      <button
                        onClick={() => setFilterType('owned')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                          filterType === 'owned'
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        Owned ({prog.uniqueCount})
                      </button>
                      <button
                        onClick={() => setFilterType('missing')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                          filterType === 'missing'
                            ? 'bg-red-500 text-white'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        Missing ({Math.max(0, albumCards.length - prog.uniqueCount)})
                      </button>
                      <button
                        onClick={() => setFilterType('base')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                          filterType === 'base'
                            ? 'bg-slate-300 text-slate-950'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        Grey Base
                      </button>
                      <button
                        onClick={() => setFilterType('upgrade')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                          filterType === 'upgrade'
                            ? 'bg-red-600 text-white'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        Red Upgrade
                      </button>
                    </div>
                  </div>

                  {/* Album Cards Grid */}
                  <div className="p-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {displayedCards.map((card) => {
                        const isOwned = prog.ownedMap.has(card.id);
                        const countOwned = prog.countsMap[card.id] || 0;
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
                                  card.isSetRewardOnly
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                    : isUpgrade
                                    ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                                    : 'bg-slate-700/40 text-slate-300 border border-slate-600'
                                }`}
                              >
                                {card.isSetRewardOnly ? 'Set Reward' : isUpgrade ? 'Upgrade' : 'Base'}
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
      {celebrationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
          <div className="relative max-w-lg w-full rounded-3xl border-2 border-amber-500 bg-gradient-to-b from-slate-950 via-[#1f0b0b] to-slate-950 p-6 text-center space-y-6 shadow-[0_0_60px_rgba(245,158,11,0.6)]">
            <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-500 mx-auto flex items-center justify-center text-4xl shadow-inner">
              👑
            </div>

            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                Milestone Achieved!
              </span>
              <h3 className="text-3xl font-black text-white">
                {celebrationModal.title} Unlocked!
              </h3>
              <p className="text-xs text-slate-300">
                Congratulations! You assembled the required cards into your Club collection. This untradeable master reward has been deposited into your active Club roster!
              </p>
              {celebrationModal.bonusCoins && (
                <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-sm font-black">
                  <Coins className="w-4 h-4" />
                  <span>+{celebrationModal.bonusCoins.toLocaleString()} Bonus Coins Awarded!</span>
                </div>
              )}
            </div>

            <div className="flex justify-center py-2">
              <div className="transform hover:scale-105 transition-transform duration-300">
                <CardItem card={celebrationModal.card} size="md" interactive={true} />
              </div>
            </div>

            <button
              onClick={() => setCelebrationModal(null)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg active:scale-95 transition-all"
            >
              Continue to Club Collection
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
