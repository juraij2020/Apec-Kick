import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { StoredRewardPack, SoccerCard, PackDefinition } from '../types/card';
import { CardItem } from './CardItem';
import { sound } from '../utils/audio';
import { safeSetItem } from '../utils/safeStorage';
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
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';

interface MyPacksHubProps {
  unopenedPacks: StoredRewardPack[];
  allCardsPool: SoccerCard[];
  clubCards?: SoccerCard[];
  onAddCoins?: (amount: number) => void;
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
  clubCards = [],
  onAddCoins,
  onOpenRewardPack,
  onAddCardsToClub,
  onQuickSellCard,
  onNavigateToMiniGames,
  onNavigateToStore,
}) => {
  const [openingPack, setOpeningPack] = useState<StoredRewardPack | null>(null);
  const [isDailyPackActive, setIsDailyPackActive] = useState<boolean>(false);
  const [dailyCoinsAwarded, setDailyCoinsAwarded] = useState<number>(0);
  const [stage, setStage] = useState<OpeningStage>('idle');
  const [pulledCards, setPulledCards] = useState<SoccerCard[]>([]);
  const [newCardsList, setNewCardsList] = useState<SoccerCard[]>([]);
  const [duplicateCardsList, setDuplicateCardsList] = useState<SoccerCard[]>([]);
  const [walkoutCard, setWalkoutCard] = useState<SoccerCard | null>(null);
  const [isAddedToClub, setIsAddedToClub] = useState<boolean>(false);

  // Daily Reset & Rips remaining tracker (50 free rips daily)
  const getTodayKey = (): string => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const [dailyRipsRemaining, setDailyRipsRemaining] = useState<number>(() => {
    try {
      const today = getTodayKey();
      const storedDate = localStorage.getItem('apex_daily_pack_date');
      const storedRips = localStorage.getItem('apex_daily_pack_rips');

      if (storedDate !== today || storedRips === null) {
        // New day or first launch: initialize to 50 rips!
        localStorage.setItem('apex_daily_pack_date', today);
        localStorage.setItem('apex_daily_pack_rips', '50');
        return 50;
      }
      return Math.max(0, parseInt(storedRips, 10));
    } catch {
      return 50;
    }
  });

  // Verify daily reset whenever component is mounted or tab is viewed
  useEffect(() => {
    const today = getTodayKey();
    const storedDate = localStorage.getItem('apex_daily_pack_date');
    if (storedDate !== today) {
      localStorage.setItem('apex_daily_pack_date', today);
      localStorage.setItem('apex_daily_pack_rips', '50');
      setDailyRipsRemaining(50);
    }
  }, []);

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

  // Generate weighted coins: 10 to 1,000 coins (1000 and 500 are super rare!)
  const generateCoinsReward = (): number => {
    const roll = Math.random() * 100;
    if (roll < 1) {
      // 1% chance -> 1,000 Coins (SUPER RARE)
      return 1000;
    } else if (roll < 4) {
      // 3% chance -> 500 Coins (SUPER RARE)
      return 500;
    } else if (roll < 20) {
      // 16% chance -> 200 to 450 Coins
      return Math.floor(Math.random() * 26) * 10 + 200;
    } else if (roll < 65) {
      // 45% chance -> 50 to 190 Coins
      return Math.floor(Math.random() * 15) * 10 + 50;
    } else {
      // 35% chance -> 10 to 40 Coins
      return Math.floor(Math.random() * 4) * 10 + 10;
    }
  };

  // Generate cards from pool based on pack odds & criteria
  const generateCardsFromPack = (pack: PackDefinition): SoccerCard[] => {
    const cards: SoccerCard[] = [];

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

    cards.sort((a, b) => b.rating - a.rating);
    return cards;
  };

  // Segregate pulled cards into new cards vs duplicates based on club cards
  const separateNewAndDuplicates = (cards: SoccerCard[]) => {
    // Collect base IDs or names of players currently in user's club
    const ownedKeys = new Set(
      clubCards.map((c) => {
        // Strip instance suffix to compare base player identity
        return c.id.replace(/_inst_.*$/, '').toLowerCase();
      })
    );

    const newItems: SoccerCard[] = [];
    const duplicates: SoccerCard[] = [];
    const seenInCurrentPull = new Set<string>();

    cards.forEach((card) => {
      const baseKey = card.id.replace(/_inst_.*$/, '').toLowerCase();
      if (ownedKeys.has(baseKey) || seenInCurrentPull.has(baseKey)) {
        duplicates.push(card);
      } else {
        newItems.push(card);
        seenInCurrentPull.add(baseKey);
      }
    });

    setNewCardsList(newItems);
    setDuplicateCardsList(duplicates);
  };

  // Launch standard reward pack opening
  const handleStartOpenPack = (storedPack: StoredRewardPack) => {
    sound.playPackRip();
    setOpeningPack(storedPack);
    setIsDailyPackActive(false);
    setDailyCoinsAwarded(0);
    setIsAddedToClub(false);

    onOpenRewardPack(storedPack.instanceId);

    const generated = generateCardsFromPack(storedPack.packDefinition);
    const safeCards = generated.length > 0 ? generated : [allCardsPool[0]];
    setPulledCards(safeCards);
    separateNewAndDuplicates(safeCards);

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
        }, 1200);

        setTimeout(() => {
          setStage('walkout_club');
          sound.playCardFlip();
        }, 2400);

        setTimeout(() => {
          setStage('walkout_card');
          sound.playWalkoutFanfare();
          triggerConfetti(topCard.rating >= 94 ? 'icon' : 'custom');
        }, 3600);

        setTimeout(() => {
          setStage('cards_grid');
        }, 6200);
      } else {
        setStage('cards_grid');
        triggerConfetti('gold');
      }
    }, 1200);
  };

  // Launch Daily Reward Pack opening (12-15 cards + 10-1000 bonus coins)
  const handleStartOpenDailyPack = () => {
    if (dailyRipsRemaining <= 0) return;

    sound.playPackRip();
    setIsDailyPackActive(true);
    setOpeningPack(null);
    setIsAddedToClub(false);

    // 1. Decrement daily rips and save to localStorage
    const newRips = dailyRipsRemaining - 1;
    setDailyRipsRemaining(newRips);
    safeSetItem('apex_daily_pack_rips', newRips.toString());

    // 2. Generate bonus coins (10 to 1,000, 500 & 1000 super rare!)
    const coinsWon = generateCoinsReward();
    setDailyCoinsAwarded(coinsWon);
    if (onAddCoins) {
      onAddCoins(coinsWon);
    }
    sound.playCoinClink();

    // 3. Generate 12 to 15 cards
    const cardCount = Math.floor(Math.random() * 4) + 12; // 12, 13, 14, or 15 cards
    const candidatePool = allCardsPool.length > 0 ? allCardsPool : [];
    const generated: SoccerCard[] = [];

    // Guarantee at least 1 high-rated walkout player (86+)
    const highTierCandidates = candidatePool.filter((c) => c.rating >= 86 && !c.isSetRewardOnly);
    const topPool = highTierCandidates.length > 0 ? highTierCandidates : candidatePool;
    const walkoutCandidate = topPool[Math.floor(Math.random() * topPool.length)];

    if (walkoutCandidate) {
      generated.push({
        ...walkoutCandidate,
        id: `${walkoutCandidate.id}_inst_${Date.now()}_0`,
      });
    }

    // Fill remaining cards (11 to 14) from general pool excluding exclusive set rewards
    const generalPool = candidatePool.filter((c) => !c.isSetRewardOnly);
    for (let i = 1; i < cardCount; i++) {
      const picked = generalPool[Math.floor(Math.random() * generalPool.length)];
      if (picked) {
        generated.push({
          ...picked,
          id: `${picked.id}_inst_${Date.now()}_${i}`,
        });
      }
    }

    // Sort descending by rating
    generated.sort((a, b) => b.rating - a.rating);
    setPulledCards(generated);
    separateNewAndDuplicates(generated);

    const topCard = generated[0];
    const isWalkout = topCard ? topCard.rating >= 86 : false;

    setStage('tearing');

    setTimeout(() => {
      if (isWalkout) {
        setWalkoutCard(topCard);
        setStage('walkout_nation');
        sound.playCardFlip();

        setTimeout(() => {
          setStage('walkout_pos');
          sound.playCardFlip();
        }, 1100);

        setTimeout(() => {
          setStage('walkout_club');
          sound.playCardFlip();
        }, 2200);

        setTimeout(() => {
          setStage('walkout_card');
          sound.playWalkoutFanfare();
          triggerConfetti(topCard.rating >= 94 ? 'icon' : 'custom');
        }, 3300);

        setTimeout(() => {
          setStage('cards_grid');
        }, 5800);
      } else {
        setStage('cards_grid');
        triggerConfetti('gold');
      }
    }, 1100);
  };

  // Add all new cards to club
  const handleAddAllToClub = () => {
    if (isAddedToClub || pulledCards.length === 0) return;
    onAddCardsToClub(pulledCards);
    setIsAddedToClub(true);
    sound.playCardFlip();
  };

  // Quick sell all duplicates in one click
  const handleQuickSellAllDuplicates = () => {
    if (duplicateCardsList.length === 0) return;
    duplicateCardsList.forEach((dup) => {
      onQuickSellCard(dup);
    });
    setDuplicateCardsList([]);
    setPulledCards((prev) => prev.filter((c) => !duplicateCardsList.some((d) => d.id === c.id)));
    sound.playCoinClink();
  };

  // Finish opening and return to list
  const handleFinishOpening = () => {
    if (!isAddedToClub && pulledCards.length > 0) {
      onAddCardsToClub(pulledCards);
    }
    setStage('idle');
    setOpeningPack(null);
    setIsDailyPackActive(false);
    setPulledCards([]);
    setNewCardsList([]);
    setDuplicateCardsList([]);
    setWalkoutCard(null);
    setIsAddedToClub(false);
    sound.playClick();
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {stage === 'idle' ? (
        <>
          {/* Top Banner: My Packs Vault */}
          <div className="relative rounded-3xl overflow-hidden border border-emerald-500/40 bg-gradient-to-r from-slate-950 via-[#072418] to-slate-950 p-6 shadow-[0_0_35px_rgba(16,185,129,0.2)] flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.5)] flex-shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-emerald-400">
                  <PackageOpen className="w-8 h-8 animate-pulse" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide uppercase">
                    My Packs Vault 🎁
                  </h1>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
                    Free Daily Rips Active
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                  Store earned reward packs and claim your <strong>50 free Daily Reward Pack rips</strong> every single day!
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3 flex-wrap">
              {onNavigateToStore && (
                <button
                  onClick={() => {
                    onNavigateToStore();
                    sound.playClick();
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95"
                >
                  <PackageOpen className="w-4 h-4 text-emerald-400" />
                  <span>Pack Store</span>
                </button>
              )}
              <button
                onClick={() => {
                  onNavigateToMiniGames('high_low');
                  sound.playClick();
                }}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all active:scale-95"
              >
                <Trophy className="w-4 h-4" />
                <span>Play Mini-Games</span>
              </button>
            </div>
          </div>

          {/* ============================================================== */}
          {/* MARQUEE FEATURE: DAILY REWARD PACK (50 FREE RIPS DAILY)        */}
          {/* ============================================================== */}
          <div className="relative rounded-3xl overflow-hidden border-2 border-amber-500/70 bg-gradient-to-b from-[#1c1303] via-slate-950 to-slate-900 p-6 sm:p-8 shadow-[0_0_40px_rgba(245,158,11,0.3)]">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              {/* Left Details */}
              <div className="flex items-center gap-5">
                <div className="w-20 h-24 rounded-2xl bg-gradient-to-b from-amber-400 via-yellow-500 to-amber-700 p-0.5 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.6)] flex-shrink-0 animate-pulse">
                  <div className="w-full h-full bg-slate-950/90 rounded-[14px] flex flex-col items-center justify-center p-2 text-center">
                    <Sparkles className="w-6 h-6 text-yellow-400 mb-1" />
                    <span className="text-[10px] font-black uppercase text-amber-300 leading-tight">DAILY</span>
                    <span className="text-sm font-black text-white font-mono">50 RIPS</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase tracking-wider">
                      ✨ Everyday Refresh
                    </span>
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Resets every day to 50 rips</span>
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">
                    Daily Reward Pack 🎁
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                    Open this pack up to <strong>50 times every day</strong>! Each rip packs <strong>12 to 15 cards</strong> plus bonus coins from <strong>10 to 1,000 coins</strong> (500 & 1,000 coins are super rare!).
                  </p>
                </div>
              </div>

              {/* Right Counter & Rip Button */}
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto justify-end">
                {/* Rips Left Badge */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/40 text-center min-w-[170px] w-full sm:w-auto shadow-inner">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
                    Rips Remaining Today
                  </span>
                  <div className="text-2xl font-black text-amber-400 font-mono flex items-center justify-center gap-1.5">
                    <Flame className="w-5 h-5 text-orange-400 animate-bounce" />
                    <span>{dailyRipsRemaining} / 50</span>
                  </div>
                </div>

                {/* Rip Action Button */}
                <button
                  onClick={handleStartOpenDailyPack}
                  disabled={dailyRipsRemaining <= 0}
                  className={`w-full sm:w-auto px-8 py-5 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-3 transition-all ${
                    dailyRipsRemaining > 0
                      ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 shadow-[0_0_30px_rgba(245,158,11,0.6)] hover:scale-105 active:scale-95'
                      : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-75'
                  }`}
                >
                  <PackageOpen className="w-5 h-5 stroke-[2.5]" />
                  <span>
                    {dailyRipsRemaining > 0 ? `Rip Daily Pack (${dailyRipsRemaining} Left)` : 'Resets Tomorrow'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* USER INVENTORY PACKS (FROM OBJECTIVES, GAMES, SBCS, ETC.)      */}
          {/* ============================================================== */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-300">
                  Stored Reward Packs ({unopenedPacks.length})
                </h3>
              </div>
              <span className="text-xs text-slate-400">Earned from Objectives & Mini-Games</span>
            </div>

            {unopenedPacks.length === 0 ? (
              /* Empty Stored Packs Banner */
              <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-800/60 flex items-center justify-center text-slate-500 mx-auto">
                  <PackageOpen className="w-7 h-7" />
                </div>
                <div className="space-y-1 max-w-md mx-auto">
                  <h4 className="text-base font-black text-white">No Stored Packs Remaining</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    You have ripped all your earned packs. Enjoy your <strong>50 free daily rips</strong> above, or play Mini-Games & complete Daily Objectives to stock up on more!
                  </p>
                </div>
              </div>
            ) : (
              /* Grid of Stored Packs */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {unopenedPacks.map((item) => {
                  const p = item.packDefinition;
                  return (
                    <div
                      key={item.instanceId}
                      className="group relative rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 hover:border-emerald-500/60 p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_0_25px_rgba(16,185,129,0.2)]"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            {p.theme.toUpperCase().replace('_', ' ')}
                          </span>
                          <span className="text-[10px] text-slate-500 font-bold">
                            {item.sourceTitle}
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <h4 className="text-base font-black text-white group-hover:text-emerald-300 transition-colors leading-tight">
                            {p.name}
                          </h4>
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                            {p.tagline}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/60 text-[11px] text-slate-300">
                          <div className="bg-slate-950/60 rounded-xl px-2.5 py-1.5 border border-slate-800/40">
                            <span className="text-[9px] uppercase font-bold text-slate-500 block">Contains</span>
                            <span className="font-bold text-white">{p.cardCount} Players</span>
                          </div>
                          <div className="bg-slate-950/60 rounded-xl px-2.5 py-1.5 border border-slate-800/40">
                            <span className="text-[9px] uppercase font-bold text-slate-500 block">Min Rating</span>
                            <span className="font-bold text-amber-400 font-mono">{p.minRating}+ OVR</span>
                          </div>
                        </div>
                      </div>

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
            )}
          </div>
        </>
      ) : (
        /* ============================================================== */
        /* PACK OPENING ANIMATED VIEW                                      */
        /* ============================================================== */
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative min-h-[520px] flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-transparent to-slate-950 pointer-events-none" />

          {/* STAGE: TEARING */}
          {stage === 'tearing' && (
            <div className="flex flex-col items-center justify-center space-y-6 text-center animate-pulse">
              <div className="w-40 h-56 rounded-3xl bg-slate-950 border-2 border-amber-400 flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.4)]">
                <Sparkles className="w-16 h-16 text-amber-400 animate-spin" />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-widest">
                Tearing Foil Pack...
              </h3>
            </div>
          )}

          {/* STAGE: WALKOUT SPOTLIGHTS */}
          {(stage === 'walkout_nation' || stage === 'walkout_pos' || stage === 'walkout_club' || stage === 'walkout_card') && walkoutCard && (
            <div className="flex flex-col items-center justify-center text-center space-y-6 w-full max-w-xl animate-fade-in">
              <div className="text-xs font-black uppercase tracking-widest text-amber-400 animate-pulse">
                ⭐ WALKOUT CANDIDATE DETECTED ⭐
              </div>

              <div className="grid grid-cols-3 gap-4 w-full">
                <div className="p-4 rounded-2xl bg-slate-950 border border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.3)] scale-105 transition-all duration-500">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Nation</span>
                  <span className="text-2xl block mb-1">{walkoutCard.nationFlag || '🏳️'}</span>
                  <span className="text-xs font-black text-white truncate block">{walkoutCard.nation}</span>
                </div>

                <div
                  className={`p-4 rounded-2xl bg-slate-950 border transition-all duration-500 ${
                    stage === 'walkout_pos' || stage === 'walkout_club' || stage === 'walkout_card'
                      ? 'border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.3)] scale-105'
                      : 'border-slate-800 opacity-40'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Position</span>
                  <span className="text-xl font-black text-amber-400 block mb-1">{walkoutCard.position}</span>
                  <span className="text-xs font-semibold text-slate-400">Tactical</span>
                </div>

                <div
                  className={`p-4 rounded-2xl bg-slate-950 border transition-all duration-500 ${
                    stage === 'walkout_club' || stage === 'walkout_card'
                      ? 'border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.3)] scale-105'
                      : 'border-slate-800 opacity-40'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Club</span>
                  <span className="text-xl block mb-1">🛡️</span>
                  <span className="text-xs font-black text-white truncate block">{walkoutCard.club}</span>
                </div>
              </div>

              {stage === 'walkout_card' && (
                <div className="space-y-4 pt-4 animate-scale-up">
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

          {/* ============================================================== */}
          {/* STAGE: CARDS GRID (RESULTS SCREEN)                              */}
          {/* ============================================================== */}
          {stage === 'cards_grid' && (
            <div className="space-y-8 w-full animate-fade-in">
              {/* Header Title */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-black uppercase">
                  <Check className="w-3.5 h-3.5" />
                  <span>{isDailyPackActive ? 'Daily Reward Pack Ripped!' : 'Pack Opened Successfully'}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white uppercase">
                  {isDailyPackActive ? 'Daily Reward Pack' : openingPack?.packDefinition.name || 'Pack Rewards'}
                </h3>
                <p className="text-xs text-slate-400">
                  {pulledCards.length} Players pulled {isDailyPackActive ? `· ${dailyRipsRemaining} rips left today` : ''}
                </p>
              </div>

              {/* 1. COIN REWARD CARD (AT TOP) */}
              {isDailyPackActive && (
                <div className="max-w-xl mx-auto rounded-3xl p-5 border-2 border-amber-400 bg-gradient-to-r from-amber-500/20 via-yellow-500/30 to-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.4)] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/30 border border-amber-400 flex items-center justify-center text-amber-300 shadow-inner">
                      <Coins className="w-6 h-6 animate-bounce" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                          Bonus Coin Drop
                        </span>
                        {(dailyCoinsAwarded === 1000 || dailyCoinsAwarded === 500) && (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-red-500 text-white animate-pulse">
                            🌟 SUPER RARE!
                          </span>
                        )}
                      </div>
                      <h4 className="text-xl sm:text-2xl font-black text-white">
                        +{dailyCoinsAwarded.toLocaleString()} <span className="text-amber-400">Coins</span>
                      </h4>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-emerald-500/40">
                    + Deposited
                  </span>
                </div>
              )}

              {/* 2. NEW PLAYERS (THAT YOU DIDN'T GET PREVIOUSLY) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-sm font-black uppercase tracking-wider text-emerald-300">
                      New Players Unlocked ({newCardsList.length})
                    </h4>
                  </div>
                  <span className="text-xs text-slate-400">Added directly to your Club collection</span>
                </div>

                {newCardsList.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400">
                    All players pulled in this pack were already owned in your Club.
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-center gap-6">
                    {newCardsList.map((card) => (
                      <div key={card.id} className="flex flex-col items-center space-y-2">
                        <div className="relative">
                          <CardItem card={card} size="md" interactive={false} />
                          <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[9px] uppercase shadow-md">
                            NEW
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            onQuickSellCard(card);
                            setNewCardsList((prev) => prev.filter((c) => c.id !== card.id));
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
                )}
              </div>

              {/* 3. THE BAR ON THAT "ALREADY OWNED" WRITTEN */}
              <div className="relative py-4">
                <div className="w-full h-1 bg-gradient-to-r from-transparent via-amber-500/80 to-transparent" />
                <div className="flex items-center justify-center -mt-3.5">
                  <div className="px-5 py-1.5 rounded-full bg-slate-950 border-2 border-amber-500 text-amber-400 font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.5)]">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>ALREADY OWNED ({duplicateCardsList.length})</span>
                  </div>
                </div>
              </div>

              {/* 4. AFTER THE BAR: THE DUPLICATES YOU OWNED */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2 flex-wrap gap-2">
                  <div className="text-xs text-slate-400">
                    Duplicate player items already in your Club. Quick sell them for extra coins or send to club duplicates.
                  </div>

                  {duplicateCardsList.length > 0 && (
                    <button
                      onClick={handleQuickSellAllDuplicates}
                      className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 text-xs font-black uppercase flex items-center gap-1.5 transition-colors"
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>Quick Sell All Duplicates</span>
                    </button>
                  )}
                </div>

                {duplicateCardsList.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400">
                    No duplicate players in this pack! Every card was brand new.
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-center gap-6">
                    {duplicateCardsList.map((card) => (
                      <div key={card.id} className="flex flex-col items-center space-y-2 opacity-90 hover:opacity-100 transition-opacity">
                        <div className="relative">
                          <CardItem card={card} size="md" interactive={false} />
                          <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-600 text-slate-300 font-bold text-[9px] uppercase shadow-md">
                            DUPLICATE
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            onQuickSellCard(card);
                            setDuplicateCardsList((prev) => prev.filter((c) => c.id !== card.id));
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
                )}
              </div>

              {/* Bottom Actions */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-6 border-t border-slate-800/80">
                {/* Rip Next Daily Pack Button if Daily Pack is active and rips remain */}
                {isDailyPackActive && dailyRipsRemaining > 0 && (
                  <button
                    onClick={handleStartOpenDailyPack}
                    className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.5)] hover:scale-105 active:scale-95 transition-all"
                  >
                    <PackageOpen className="w-4 h-4 stroke-[2.5]" />
                    <span>Rip Next Daily Pack ({dailyRipsRemaining} Left Today)</span>
                  </button>
                )}

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
                  <span>{isAddedToClub ? 'All Sent to Club!' : 'Send All Cards to Club'}</span>
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
