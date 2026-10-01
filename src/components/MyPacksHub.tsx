import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { StoredRewardPack, SoccerCard, PackDefinition } from '../types/card';
import { CardItem } from './CardItem';
import { sound } from '../utils/audio';
import {
  PackageOpen,
  Sparkles,
  Trophy,
  Flame,
  HelpCircle,
  ArrowRight,
  Check,
  Coins,
  Shield,
  Zap,
  RotateCcw,
  Gift,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface MyPacksHubProps {
  unopenedPacks: StoredRewardPack[];
  allCardsPool: SoccerCard[];
  onOpenRewardPack: (instanceId: string) => void;
  onAddCardsToClub: (cards: SoccerCard[]) => void;
  onQuickSellCard: (card: SoccerCard) => void;
  onNavigateToMiniGames: (game?: 'high_low' | 'guess_who') => void;
  onNavigateToStore?: () => void;
}

type OpeningStage =
  | 'idle'
  | 'tearing'
  | 'walkout_nation'
  | 'walkout_pos'
  | 'walkout_club'
  | 'walkout_card'
  | 'cards_grid';

export const MyPacksHub: React.FC<MyPacksHubProps> = ({
  unopenedPacks,
  allCardsPool,
  onOpenRewardPack,
  onAddCardsToClub,
  onQuickSellCard,
  onNavigateToMiniGames,
  onNavigateToStore,
}) => {
  const [openingPack, setOpeningPack] = useState<StoredRewardPack | null>(null);
  const [stage, setStage] = useState<OpeningStage>('idle');
  const [pulledCards, setPulledCards] = useState<SoccerCard[]>([]);
  const [walkoutCard, setWalkoutCard] = useState<SoccerCard | null>(null);
  const [isAddedToClub, setIsAddedToClub] = useState<boolean>(false);

  // Trigger celebration confetti
  const triggerConfetti = (tier: 'gold' | 'custom' | 'icon') => {
    const colors =
      tier === 'icon'
        ? ['#f59e0b', '#d946ef', '#ffffff', '#38bdf8']
        : tier === 'custom'
        ? ['#10b981', '#06b6d4', '#6366f1', '#f59e0b']
        : ['#fbbf24', '#f59e0b', '#d97706', '#ffffff'];

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors,
    });
    setTimeout(() => {
      confetti({
        particleCount: 70,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 70,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });
    }, 250);
  };

  // Generate cards from pool based on pack odds & criteria
  const generateCardsFromPack = (pack: PackDefinition): SoccerCard[] => {
    const cards: SoccerCard[] = [];

    // Fallback card if pool is empty
    const fallbackCard: SoccerCard = allCardsPool[0] || {
      id: 'default_summer_mbappe',
      name: 'Kylian Mbappé',
      shortName: 'Mbappé',
      rating: 92,
      position: 'ST',
      nation: 'France',
      nationFlag: '🇫🇷',
      club: 'Real Madrid',
      league: 'La Liga',
      rarity: 'summer_transfers',
      cardStyle: 'summer_basic',
      program: 'Summer Transfers',
      stats: { pac: 97, sho: 90, pas: 82, dri: 93, def: 36, phy: 78 },
      price: 350000,
    };

    // Filter candidate pool by program if specified
    let candidatePool: SoccerCard[] = [];
    if (pack.programFilter === 'Summer Transfers' || pack.theme === 'summer_pack') {
      const summerPool = allCardsPool.filter(
        (c) => c.program === 'Summer Transfers' || c.rarity === 'summer_transfers' || c.cardStyle === 'summer_basic'
      );
      candidatePool = summerPool.length > 0 ? summerPool : allCardsPool;
    } else if (pack.programFilter === 'Street Kings' || pack.theme === 'street_kings') {
      const skPool = allCardsPool.filter(
        (c) => c.program === 'Street Kings' || c.rarity === 'street_kings'
      );
      candidatePool = skPool.length > 0 ? skPool : allCardsPool;
    } else if (pack.programFilter?.startsWith('International Moments') || ['intl_moments', 'argentina', 'brazil', 'belgium'].includes(pack.theme)) {
      let intlPool = allCardsPool.filter(
        (c) => c.program === 'International Moments' || c.rarity === 'international_moments'
      );
      if (pack.programFilter === 'International Moments:Argentina' || pack.theme === 'argentina') {
        intlPool = intlPool.filter((c) => c.nation === 'Argentina');
      } else if (pack.programFilter === 'International Moments:Brazil' || pack.theme === 'brazil') {
        intlPool = intlPool.filter((c) => c.nation === 'Brazil');
      } else if (pack.programFilter === 'International Moments:Belgium' || pack.theme === 'belgium') {
        intlPool = intlPool.filter((c) => c.nation === 'Belgium');
      }
      candidatePool = intlPool.length > 0 ? intlPool : allCardsPool;
    } else if (pack.programFilter === 'Hall of Fame' || pack.theme === 'hof_gold') {
      candidatePool = allCardsPool.filter(
        (c) => c.program === 'Hall of Fame' || c.rarity === 'hall_of_fame' || c.program === 'Program One' || c.rarity === 'program_one'
      );
    } else if (pack.programFilter === 'Futmas') {
      candidatePool = allCardsPool.filter(
        (c) => c.program === 'Futmas' || c.rarity === 'futmas'
      );
    } else {
      candidatePool = [...allCardsPool];
    }

    if (candidatePool.length === 0) {
      candidatePool = allCardsPool.length > 0 ? [...allCardsPool] : [fallbackCard];
    }

    // Min rating filtered candidates
    const minRatingCandidates = candidatePool.filter((c) => c.rating >= pack.minRating);
    const validPool = minRatingCandidates.length > 0 ? minRatingCandidates : candidatePool;

    for (let i = 0; i < pack.cardCount; i++) {
      let picked: SoccerCard;
      if (i === 0 && (pack.guaranteedWalkout || (pack.guaranteedRating && pack.guaranteedRating >= 78))) {
        const threshold = pack.guaranteedRating || 78;
        const topCandidates = validPool.filter((c) => c.rating >= threshold);
        const poolToUse = topCandidates.length > 0 ? topCandidates : validPool;
        picked = poolToUse[Math.floor(Math.random() * poolToUse.length)] || fallbackCard;
      } else {
        picked = validPool[Math.floor(Math.random() * validPool.length)] || fallbackCard;
      }

      cards.push({
        ...picked,
        id: `${picked.id}_inst_${Date.now()}_${i}`,
      });
    }

    // Sort descending by rating
    cards.sort((a, b) => b.rating - a.rating);
    return cards;
  };

  // Launch pack opening sequence
  const handleStartOpenPack = (storedPack: StoredRewardPack) => {
    sound.playPackRip();
    setOpeningPack(storedPack);
    setIsAddedToClub(false);

    // Consume from storage
    onOpenRewardPack(storedPack.instanceId);

    const generated = generateCardsFromPack(storedPack.packDefinition);
    const safeCards = generated.length > 0 ? generated : [allCardsPool[0]];
    setPulledCards(safeCards);

    const topCard = safeCards[0];
    const isWalkout = topCard ? (topCard.rating >= 85 || !!storedPack.packDefinition.guaranteedWalkout) : false;

    setStage('tearing');

    setTimeout(() => {
      if (isWalkout) {
        setWalkoutCard(topCard);
        setStage('walkout_nation');
        sound.playCardFlip();

        setTimeout(() => {
          setStage('walkout_pos');
          sound.playCardFlip();

          setTimeout(() => {
            setStage('walkout_club');
            sound.playCardFlip();

            setTimeout(() => {
              setStage('walkout_card');
              sound.playGoalCheer();
              const tier = topCard.program === 'Hall of Fame' ? 'icon' : topCard.isCustom ? 'custom' : 'gold';
              triggerConfetti(tier);

              setTimeout(() => {
                setStage('cards_grid');
              }, 2500);
            }, 1200);
          }, 1000);
        }, 1000);
      } else {
        setStage('cards_grid');
        sound.playCardFlip();
      }
    }, 700);
  };

  // Add all cards to club
  const handleAddAllToClub = () => {
    if (pulledCards.length === 0 || isAddedToClub) return;
    onAddCardsToClub(pulledCards);
    sound.playGoalCheer();
    setIsAddedToClub(true);
  };

  // Close reveal modal and return to vault
  const handleFinishOpening = () => {
    if (!isAddedToClub && pulledCards.length > 0) {
      onAddCardsToClub(pulledCards);
    }
    sound.playClick();
    setStage('idle');
    setOpeningPack(null);
    setPulledCards([]);
    setWalkoutCard(null);
    setIsAddedToClub(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-gradient-to-r from-slate-950 via-[#0a1120] to-[#121626] p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 text-xs font-black tracking-wide uppercase">
              <PackageOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>Unopened Rewards Vault · Claimed & Free Packs</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase">
              My <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">Packs</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              All reward packs you earn for free from Higher or Lower streak ladders, Guess Who mystery player quiz, Daily Objectives, and bonus gifts are stored here. Rip them open whenever you are ready!
            </p>
          </div>

          {/* Quick HUD Counters */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl px-5 py-3.5 flex items-center gap-4 shadow-inner">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
                <PackageOpen className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Unopened Packs</span>
                <span className="text-xl font-black text-emerald-300 tabular-nums">{unopenedPacks.length} Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {stage === 'idle' ? (
        <>
          {unopenedPacks.length === 0 ? (
            /* Empty State */
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-10 sm:p-16 text-center shadow-xl space-y-6">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-slate-950 border border-slate-800 flex items-center justify-center shadow-inner text-slate-500">
                <PackageOpen className="w-10 h-10 text-slate-600" />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-xl font-black text-white uppercase tracking-wider">
                  No Unopened Packs in Vault
                </h3>
                <p className="text-xs text-slate-400">
                  You have ripped all your reward packs! Test your soccer skills in Higher or Lower and Guess Who to unlock exclusive streak ladder and mystery packs for free.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <button
                  onClick={() => onNavigateToMiniGames('high_low')}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
                >
                  <Flame className="w-4 h-4 text-slate-950" />
                  <span>Play Higher or Lower Ladder</span>
                </button>

                <button
                  onClick={() => onNavigateToMiniGames('guess_who')}
                  className="px-5 py-3 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-purple-500/40 text-purple-300 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors"
                >
                  <HelpCircle className="w-4 h-4 text-purple-400" />
                  <span>Play Guess Who</span>
                </button>

                {onNavigateToStore && (
                  <button
                    onClick={onNavigateToStore}
                    className="px-5 py-3 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors"
                  >
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span>Pack Store</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Unopened Packs Grid */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <span>Available Packs ({unopenedPacks.length})</span>
                  <span>·</span>
                  <span className="text-emerald-400">Stored Safe in Club</span>
                </div>

                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Select any pack to open with full walkout animation</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {unopenedPacks.map((item, idx) => {
                  const p = item.packDefinition;
                  return (
                    <div
                      key={item.instanceId || `pack-${idx}`}
                      className="group relative bg-gradient-to-b from-slate-900/90 to-slate-950/95 border border-slate-800 hover:border-emerald-500/50 rounded-3xl p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1 overflow-hidden"
                    >
                      {/* Ambient Glow */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/15 transition-all" />

                      <div className="space-y-4">
                        {/* Source Tag Header */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-[10px] font-bold text-emerald-400 uppercase tracking-wide truncate max-w-[190px]">
                            {item.sourceTitle || 'Free Reward'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            #{idx + 1}
                          </span>
                        </div>

                        {/* Pack Foil Graphic Showcase */}
                        <div className="relative aspect-[3/4] max-h-52 w-full rounded-2xl overflow-hidden bg-slate-950/80 border border-slate-800/80 flex items-center justify-center p-3 shadow-inner group-hover:border-emerald-500/30 transition-colors">
                          {p.imageAsset ? (
                            <img
                              src={p.imageAsset}
                              alt={p.name}
                              className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)] group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-center p-4">
                              <PackageOpen className="w-12 h-12 text-emerald-400 mb-2" />
                              <span className="text-xs font-black uppercase text-white">{p.name}</span>
                            </div>
                          )}

                          {/* Guaranteed Walkout badge */}
                          {p.guaranteedWalkout && (
                            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-amber-500/90 text-slate-950 text-[9px] font-black uppercase tracking-wider shadow-md">
                              Walkout!
                            </div>
                          )}

                          {p.guaranteedRating && !p.guaranteedWalkout && (
                            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-slate-900/90 border border-amber-500/50 text-amber-300 text-[9px] font-black uppercase tracking-wider shadow-md">
                              {p.guaranteedRating}+ OVR
                            </div>
                          )}
                        </div>

                        {/* Pack Title & Meta */}
                        <div className="space-y-1.5">
                          <h4 className="text-base font-black text-white group-hover:text-emerald-300 transition-colors leading-tight">
                            {p.name}
                          </h4>
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                            {p.tagline}
                          </p>
                        </div>

                        {/* Specs Strip */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/60 text-[11px] text-slate-300">
                          <div className="bg-slate-950/60 rounded-xl px-2.5 py-1.5 border border-slate-800/40">
                            <span className="text-[9px] uppercase font-bold text-slate-500 block">Contains</span>
                            <span className="font-bold text-white">{p.cardCount} Player Items</span>
                          </div>
                          <div className="bg-slate-950/60 rounded-xl px-2.5 py-1.5 border border-slate-800/40">
                            <span className="text-[9px] uppercase font-bold text-slate-500 block">Min Rating</span>
                            <span className="font-bold text-amber-400 font-mono">{p.minRating}+ OVR</span>
                          </div>
                        </div>
                      </div>

                      {/* Open Action Button */}
                      <button
                        onClick={() => handleStartOpenPack(item)}
                        className="mt-5 w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <PackageOpen className="w-4 h-4 stroke-[2.5]" />
                        <span>Open Pack</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      ) : (
        /* Pack Opening Animated View */
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative min-h-[520px] flex flex-col items-center justify-center overflow-hidden">
          {/* Ambient Spotlight */}
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-slate-950 pointer-events-none" />

          {/* STAGE: TEARING */}
          {stage === 'tearing' && (
            <div className="flex flex-col items-center justify-center space-y-6 text-center animate-pulse">
              <div className="w-40 h-56 rounded-3xl bg-slate-950 border-2 border-emerald-400 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.4)]">
                <Sparkles className="w-16 h-16 text-emerald-400 animate-spin" />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-widest">
                Tearing Foil...
              </h3>
            </div>
          )}

          {/* STAGE: WALKOUT SPOTLIGHTS */}
          {(stage === 'walkout_nation' || stage === 'walkout_pos' || stage === 'walkout_club' || stage === 'walkout_card') && walkoutCard && (
            <div className="flex flex-col items-center justify-center text-center space-y-6 w-full max-w-xl animate-fadeIn">
              <div className="text-xs font-black uppercase tracking-widest text-amber-400 animate-pulse">
                ⭐ WALKOUT CANDIDATE DETECTED ⭐
              </div>

              {/* Spotlight Boxes */}
              <div className="grid grid-cols-3 gap-4 w-full">
                {/* 1. Nation */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.3)] scale-105 transition-all duration-500">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Nation</span>
                  <span className="text-2xl block mb-1">{walkoutCard.nationFlag || '🏳️'}</span>
                  <span className="text-xs font-black text-white truncate block">{walkoutCard.nation}</span>
                </div>

                {/* 2. Position */}
                <div className={`p-4 rounded-2xl bg-slate-950 border transition-all duration-500 ${
                  stage === 'walkout_pos' || stage === 'walkout_club' || stage === 'walkout_card'
                    ? 'border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.3)] scale-105'
                    : 'border-slate-800 opacity-40'
                }`}>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Position</span>
                  <span className="text-xl font-black text-amber-400 block mb-1">{walkoutCard.position}</span>
                  <span className="text-xs font-semibold text-slate-400">Tactical</span>
                </div>

                {/* 3. Club */}
                <div className={`p-4 rounded-2xl bg-slate-950 border transition-all duration-500 ${
                  stage === 'walkout_club' || stage === 'walkout_card'
                    ? 'border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.3)] scale-105'
                    : 'border-slate-800 opacity-40'
                }`}>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Club</span>
                  <span className="text-xl block mb-1">🛡️</span>
                  <span className="text-xs font-black text-white truncate block">{walkoutCard.club}</span>
                </div>
              </div>

              {/* Reveal Card Banner */}
              {stage === 'walkout_card' && (
                <div className="space-y-4 pt-4 animate-scaleUp">
                  <div className="relative group">
                    <CardItem card={walkoutCard} size="lg" interactive={false} />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider">
                    {walkoutCard.name} · <span className="text-amber-400 font-mono">{walkoutCard.rating} OVR</span>
                  </h2>
                </div>
              )}
            </div>
          )}

          {/* STAGE: CARDS SUMMARY GRID */}
          {stage === 'cards_grid' && (
            <div className="space-y-8 w-full animate-fadeIn">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-black uppercase">
                  <Check className="w-3.5 h-3.5" />
                  <span>Pack Opened Successfully</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white uppercase">
                  {openingPack?.packDefinition.name || 'Pack Rewards'}
                </h3>
                <p className="text-xs text-slate-400">
                  {pulledCards.length} Players pulled from this reward pack
                </p>
              </div>

              {/* Cards Grid */}
              <div className="flex flex-wrap items-center justify-center gap-6">
                {pulledCards.map((card) => (
                  <div key={card.id} className="flex flex-col items-center space-y-2">
                    <CardItem card={card} size="md" interactive={false} />
                    <button
                      onClick={() => {
                        onQuickSellCard(card);
                        setPulledCards((prev) => prev.filter((c) => c.id !== card.id));
                        sound.playCoinClink();
                      }}
                      className="px-3 py-1 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold text-amber-300 flex items-center gap-1 transition-colors"
                    >
                      <Coins className="w-3 h-3 text-amber-400" />
                      <span>Sell {card.price?.toLocaleString() || 600}</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Bottom Actions */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-6 border-t border-slate-800/80">
                <button
                  onClick={handleAddAllToClub}
                  disabled={isAddedToClub || pulledCards.length === 0}
                  className={`px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all ${
                    isAddedToClub
                      ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 hover:scale-105'
                  }`}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{isAddedToClub ? 'All Added to Club Collection!' : 'Send All to Club Collection'}</span>
                </button>

                <button
                  onClick={handleFinishOpening}
                  className="px-6 py-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors"
                >
                  <span>Return to My Packs Vault</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
