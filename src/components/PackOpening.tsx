import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { PackDefinition, SoccerCard, PackTheme } from '../types/card';
import { CardItem } from './CardItem';
import { PACKS } from '../data/packs';
import { sound } from '../utils/audio';
import {
  Sparkles,
  Coins,
  Zap,
  ArrowRight,
  Check,
  Plus,
  Trash2,
  X,
  Filter,
  PackagePlus,
  Shield,
  Layers,
  Crown,
  Trophy,
} from 'lucide-react';

import goldPackImg from '../assets/images/pack_gold_foil_1790566377916.jpg';
import iconPackImg from '../assets/images/pack_icon_cosmic_1790566397330.jpg';

interface PackOpeningProps {
  coins: number;
  allCardsPool: SoccerCard[]; // includes base + user-created cards
  userCreatedCards: SoccerCard[];
  customPacks?: PackDefinition[];
  onCreatePack?: (newPack: PackDefinition) => void;
  onDeletePack?: (packId: string) => void;
  onDeductCoins: (amount: number) => boolean;
  onAddCardsToClub: (cards: SoccerCard[]) => void;
  onQuickSellCard: (card: SoccerCard) => void;
  onOpenCardCreator: () => void;
}

type OpeningStage =
  | 'idle'
  | 'tearing'
  | 'walkout_nation'
  | 'walkout_pos'
  | 'walkout_club'
  | 'walkout_card'
  | 'cards_grid';

export const PackOpening: React.FC<PackOpeningProps> = ({
  coins,
  allCardsPool,
  userCreatedCards,
  customPacks = [],
  onCreatePack,
  onDeletePack,
  onDeductCoins,
  onAddCardsToClub,
  onQuickSellCard,
  onOpenCardCreator,
}) => {
  const allAvailablePacks = [...PACKS, ...customPacks];

  const [selectedPack, setSelectedPack] = useState<PackDefinition>(allAvailablePacks[0] || PACKS[0]);
  const [stage, setStage] = useState<OpeningStage>('idle');
  const [pulledCards, setPulledCards] = useState<SoccerCard[]>([]);
  const [walkoutCard, setWalkoutCard] = useState<SoccerCard | null>(null);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Street Kings' | 'International Moments' | 'Hall of Fame' | 'Futmas' | 'Program One' | 'Base Cards' | 'Custom Packs'>('All');

  // Pack Creation Modal State
  const [showCreatePackModal, setShowCreatePackModal] = useState<boolean>(false);
  const [newPackName, setNewPackName] = useState<string>('Program One Special');
  const [newPackTagline, setNewPackTagline] = useState<string>('Exclusive pack featuring your favorite player cards');
  const [newPackCost, setNewPackCost] = useState<number>(3500);
  const [newPackCardCount, setNewPackCardCount] = useState<number>(4);
  const [newPackMinRating, setNewPackMinRating] = useState<number>(75);
  const [newPackProgram, setNewPackProgram] = useState<'Street Kings' | 'International Moments' | 'Hall of Fame' | 'Program One' | 'Base Cards' | 'Futmas' | 'All'>('Street Kings');
  const [newPackTheme, setNewPackTheme] = useState<PackTheme>('street_kings');
  const [newPackGuaranteedWalkout, setNewPackGuaranteedWalkout] = useState<boolean>(true);

  // Trigger confetti burst
  const triggerConfetti = (colorTier: 'gold' | 'custom' | 'icon') => {
    const colors =
      colorTier === 'custom'
        ? ['#10b981', '#06b6d4', '#ec4899', '#f59e0b']
        : colorTier === 'icon'
        ? ['#f59e0b', '#d946ef', '#ffffff', '#38bdf8']
        : ['#fbbf24', '#f59e0b', '#d97706', '#ffffff'];

    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
      colors,
    });
    setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 60,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });
    }, 250);
  };

  // Generate cards from pool based on pack odds & program filter
  const generatePackCards = (pack: PackDefinition): SoccerCard[] => {
    const cards: SoccerCard[] = [];

    // Filter candidate pool by program if specified
    let candidatePool: SoccerCard[] = [];
    if (pack.programFilter === 'Street Kings' || pack.theme === 'street_kings') {
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
    } else if (pack.programFilter === 'Program One') {
      candidatePool = allCardsPool.filter(
        (c) => c.program === 'Program One' || c.rarity === 'program_one' || c.program === 'Hall of Fame'
      );
    } else if (pack.programFilter === 'Base Cards') {
      candidatePool = allCardsPool.filter(
        (c) => c.program === 'Base Cards' || c.rarity === 'base' || !c.isCustom
      );
    } else {
      candidatePool = [...allCardsPool];
    }

    if (candidatePool.length === 0) {
      candidatePool = [...allCardsPool];
    }

    // Min rating filtered candidates
    const minRatingCandidates = candidatePool.filter((c) => c.rating >= pack.minRating);
    const validPool = minRatingCandidates.length > 0 ? minRatingCandidates : candidatePool;

    for (let i = 0; i < pack.cardCount; i++) {
      // Guaranteed walkout on first card if enabled
      let picked: SoccerCard;
      if (i === 0 && (pack.guaranteedWalkout || (pack.guaranteedRating && pack.guaranteedRating >= 78))) {
        const threshold = pack.guaranteedRating || 78;
        const topCandidates = validPool.filter((c) => c.rating >= threshold);
        const poolToUse = topCandidates.length > 0 ? topCandidates : validPool;
        picked = poolToUse[Math.floor(Math.random() * poolToUse.length)];
      } else {
        picked = validPool[Math.floor(Math.random() * validPool.length)];
      }

      // Clone card with unique session instance id
      cards.push({
        ...picked,
        id: `${picked.id}_inst_${Date.now()}_${i}`,
      });
    }

    // Sort by rating descending so top card is first
    cards.sort((a, b) => b.rating - a.rating);
    return cards;
  };

  const handleOpenPack = (pack: PackDefinition) => {
    if (coins < pack.cost) {
      sound.playClick();
      return;
    }

    if (!onDeductCoins(pack.cost)) return;

    setSelectedPack(pack);
    const newCards = generatePackCards(pack);
    setPulledCards(newCards);

    const topCard = newCards[0];
    const isWalkout =
      pack.guaranteedWalkout ||
      topCard.rating >= 78 ||
      topCard.program === 'Program One' ||
      topCard.rarity === 'program_one';

    setStage('tearing');
    sound.playPackRip();

    setTimeout(() => {
      if (isWalkout) {
        setWalkoutCard(topCard);
        setStage('walkout_nation');
        sound.playSuspenseReveal();

        setTimeout(() => {
          setStage('walkout_pos');
          sound.playSuspenseReveal();

          setTimeout(() => {
            setStage('walkout_club');
            sound.playSuspenseReveal();

            setTimeout(() => {
              setStage('walkout_card');
              sound.playWalkoutFanfare();
              triggerConfetti(
                topCard.isCustom || topCard.program === 'Program One'
                  ? 'custom'
                  : topCard.rarity === 'icon'
                  ? 'icon'
                  : 'gold'
              );
            }, 1200);
          }, 1100);
        }, 1100);
      } else {
        // Direct reveal
        setStage('cards_grid');
        sound.playCardFlip();
      }
    }, 1200);
  };

  const handleFinishWalkout = () => {
    sound.playCardFlip();
    setStage('cards_grid');
  };

  const handleKeepAll = () => {
    onAddCardsToClub(pulledCards);
    sound.playPackRip();
    setStage('idle');
  };

  const handleQuickSellCard = (card: SoccerCard) => {
    onQuickSellCard(card);
    setPulledCards((prev) => prev.filter((c) => c.id !== card.id));
    sound.playCoins();
  };

  const handleCreateCustomPackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onCreatePack) return;

    const newPack: PackDefinition = {
      id: `custom-pack-${Date.now()}`,
      name: newPackName.trim() || 'Custom Pack',
      tagline: newPackTagline.trim() || 'Custom curated player pack',
      cost: Number(newPackCost) || 1000,
      cardCount: Number(newPackCardCount) || 3,
      minRating: Number(newPackMinRating) || 70,
      programFilter: newPackProgram,
      theme: newPackTheme,
      guaranteedWalkout: newPackGuaranteedWalkout,
      imageAsset: newPackTheme === 'gold' ? goldPackImg : iconPackImg,
      isUserPack: true,
    };

    onCreatePack(newPack);
    setShowCreatePackModal(false);
    sound.playCardFlip();
  };

  // Filter packs according to selected category
  const filteredPacks = allAvailablePacks.filter((p) => {
    if (activeFilter === 'Street Kings') {
      return p.programFilter === 'Street Kings' || p.theme === 'street_kings';
    }
    if (activeFilter === 'International Moments') {
      return p.programFilter?.includes('International Moments') || ['intl_moments', 'argentina', 'brazil', 'belgium'].includes(p.theme);
    }
    if (activeFilter === 'Hall of Fame') return p.programFilter === 'Hall of Fame' || p.theme === 'hof_gold' || p.id.includes('hof');
    if (activeFilter === 'Futmas') return p.programFilter === 'Futmas' || p.theme === 'frost';
    if (activeFilter === 'Program One') return p.programFilter === 'Program One' || p.programFilter === 'Hall of Fame';
    if (activeFilter === 'Base Cards') return p.programFilter === 'Base Cards';
    if (activeFilter === 'Custom Packs') return p.isUserPack === true;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* STAGE: IDLE - PACK STORE */}
      {stage === 'idle' && (
        <div className="space-y-6">
          {/* Header & Quick Action Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-3xl border border-slate-800/80">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Pack Store
                </span>
                <span className="text-xs text-slate-400">
                  Total Players in Pool: <strong className="text-white">{allCardsPool.length}</strong>
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1.5 tracking-tight flex items-center gap-2">
                Open Soccer Booster Packs
                <Crown className="w-6 h-6 text-amber-400" />
              </h2>
              <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                Open national <span className="text-amber-400 font-semibold">International Moments</span> tournament packs, prestigious <span className="text-yellow-400 font-semibold">Hall of Fame</span> vaults, holiday <span className="text-rose-400 font-semibold">Futmas</span> items, or craft your own personalized packs.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  setShowCreatePackModal(true);
                  sound.playClick();
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
              >
                <PackagePlus className="w-4 h-4" />
                <span>+ Create Custom Pack</span>
              </button>

              <button
                onClick={onOpenCardCreator}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl border border-slate-700 flex items-center gap-2 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Card Studio</span>
              </button>
            </div>
          </div>

          {/* Street Kings Event Hero Showcase Banner */}
          <div className="relative rounded-3xl overflow-hidden border-2 border-cyan-400/80 bg-gradient-to-r from-slate-950 via-[#071324] to-slate-950 p-6 shadow-[0_0_35px_rgba(6,182,212,0.35)] flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 text-xs font-black uppercase tracking-wider">
                <span>⚡</span>
                <span>Street Kings Event Live</span>
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-ping" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
                Haneen Mustafa <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-yellow-300 to-pink-500">92 CM Masterclass</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                The pride of <strong>THARAVAADEES</strong> in the <strong>TKM League</strong> headlines the Street Kings promo! Featuring 96 Passing, 95 Dribbling, Incisive Pass+ and live odds across packs, market & dedicated SBCs.
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
                <span className="text-[11px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded">
                  🇮🇳 India
                </span>
                <span className="text-[11px] font-mono bg-slate-900 text-yellow-300 border border-yellow-500/40 px-2 py-0.5 rounded">
                  Club: THARAVAADEES
                </span>
                <span className="text-[11px] font-mono bg-slate-900 text-pink-300 border border-pink-500/40 px-2 py-0.5 rounded">
                  League: TKM
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const vaultPack = PACKS.find((p) => p.id === 'pack-street-kings-vault');
                  if (vaultPack) handleOpenPack(vaultPack);
                }}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-pink-500 to-amber-400 hover:from-cyan-400 hover:to-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                <span>Open Street Kings Vault</span>
              </button>
            </div>
          </div>

          {/* Filter Categories */}
          <div className="flex flex-wrap items-center gap-2">
            {(['All', 'Street Kings', 'International Moments', 'Hall of Fame', 'Futmas', 'Program One', 'Base Cards', 'Custom Packs'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveFilter(cat);
                  sound.playClick();
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeFilter === cat
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat === 'Street Kings' && <span className="text-cyan-400">⚡</span>}
                {cat === 'International Moments' && <span>🌍</span>}
                {cat === 'Futmas' && <span className="text-cyan-400">❄️</span>}
                {cat === 'Hall of Fame' && <span className="text-yellow-400">👑</span>}
                {cat === 'Program One' && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                {cat === 'Base Cards' && <span className="w-2 h-2 rounded-full bg-sky-400" />}
                {cat === 'Custom Packs' && <PackagePlus className="w-3.5 h-3.5" />}
                <span>{cat}</span>
              </button>
            ))}
          </div>

          {/* Packs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredPacks.map((pack) => {
              const canAfford = coins >= pack.cost;
              const isIntl = pack.programFilter?.includes('International Moments') || ['intl_moments', 'argentina', 'brazil', 'belgium'].includes(pack.theme);
              const isProgramOne = pack.programFilter === 'Program One';
              const isBase = pack.programFilter === 'Base Cards';

              return (
                <div
                  key={pack.id}
                  className={`group relative rounded-3xl p-5 border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xl ${
                    pack.theme === 'street_kings'
                      ? 'bg-gradient-to-b from-cyan-950/70 via-slate-900 to-black border-cyan-400/70 hover:border-pink-500 shadow-cyan-950/40'
                      : pack.theme === 'argentina'
                      ? 'bg-gradient-to-b from-sky-950/70 via-slate-900 to-black border-sky-400/60 hover:border-sky-300 shadow-sky-950/30'
                      : pack.theme === 'brazil'
                      ? 'bg-gradient-to-b from-emerald-950/70 via-slate-900 to-black border-emerald-400/60 hover:border-emerald-300 shadow-emerald-950/30'
                      : pack.theme === 'belgium'
                      ? 'bg-gradient-to-b from-red-950/70 via-slate-900 to-black border-rose-500/60 hover:border-rose-400 shadow-rose-950/30'
                      : pack.theme === 'intl_moments'
                      ? 'bg-gradient-to-b from-amber-950/60 via-slate-900 to-black border-amber-400/60 hover:border-amber-300 shadow-amber-950/30'
                      : pack.theme === 'black'
                      ? 'bg-gradient-to-b from-zinc-900 to-black border-amber-500/40 hover:border-amber-400 shadow-amber-950/20'
                      : pack.theme === 'ruby'
                      ? 'bg-gradient-to-b from-rose-950/60 via-zinc-900 to-black border-rose-500/40 hover:border-rose-400 shadow-rose-950/20'
                      : pack.theme === 'prismatic'
                      ? 'bg-gradient-to-b from-indigo-950/60 via-zinc-900 to-black border-indigo-500/40 hover:border-indigo-400 shadow-indigo-950/20'
                      : 'bg-gradient-to-b from-slate-900 to-slate-950 border-slate-800 hover:border-amber-400/50 shadow-slate-950/40'
                  }`}
                >
                  {/* Delete button for user-created custom packs */}
                  {pack.isUserPack && onDeletePack && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePack(pack.id);
                        sound.playClick();
                      }}
                      title="Delete pack"
                      className="absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-500/30 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Pack Graphic Visual */}
                  <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-slate-950 mb-4 border border-slate-800/80">
                    <img
                      src={pack.imageAsset || (pack.theme === 'gold' ? goldPackImg : iconPackImg)}
                      alt={pack.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                    {/* Pack Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      <span className="px-2 py-0.5 text-[10px] font-black rounded bg-black/80 text-amber-300 border border-amber-500/30 backdrop-blur-sm">
                        {pack.cardCount} Players
                      </span>
                      {isIntl && (
                        <span className="px-2 py-0.5 text-[10px] font-black rounded bg-amber-950/90 text-amber-300 border border-amber-400/60 backdrop-blur-sm flex items-center gap-1 shadow-[0_0_12px_rgba(251,191,36,0.35)]">
                          <span>🌍</span> International Moments
                        </span>
                      )}
                      {isProgramOne && (
                        <span className="px-2 py-0.5 text-[10px] font-black rounded bg-zinc-900/90 text-yellow-400 border border-yellow-500/50 backdrop-blur-sm flex items-center gap-1 shadow-[0_0_10px_rgba(234,179,8,0.3)]">
                          <Sparkles className="w-3 h-3 text-yellow-400" /> Program One
                        </span>
                      )}
                      {isBase && (
                        <span className="px-2 py-0.5 text-[10px] font-black rounded bg-sky-950/90 text-sky-300 border border-sky-500/40 backdrop-blur-sm flex items-center gap-1">
                          <Shield className="w-3 h-3" /> Base Cards
                        </span>
                      )}
                      {pack.isUserPack && (
                        <span className="px-2 py-0.5 text-[10px] font-black rounded bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 backdrop-blur-sm">
                          Custom Pack
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pack Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-lg font-black text-white group-hover:text-amber-300 transition-colors">
                        {pack.name}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 min-h-[36px] line-clamp-2">
                        {pack.tagline}
                      </p>
                    </div>

                    <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2.5">
                      <span>Min. Rating:</span>
                      <strong className="text-amber-300 font-bold">{pack.minRating}+</strong>
                    </div>

                    {/* Footer & Open Action */}
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block font-semibold">Cost</span>
                        <div className="flex items-center gap-1 text-amber-400 font-extrabold text-base tabular-nums">
                          <Coins className="w-4 h-4" />
                          <span>{pack.cost.toLocaleString()}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenPack(pack)}
                        disabled={!canAfford}
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md ${
                          canAfford
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 hover:scale-105 active:scale-95 shadow-amber-900/30'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>{canAfford ? 'Open' : 'Need Coins'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CREATE CUSTOM PACK MODAL */}
      {showCreatePackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <PackagePlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Create Custom Booster Pack</h3>
                  <p className="text-xs text-slate-400">Design your own pack name, odds, and player series</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreatePackModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomPackSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase block mb-1.5">
                  Pack Name
                </label>
                <input
                  type="text"
                  required
                  value={newPackName}
                  onChange={(e) => setNewPackName(e.target.value)}
                  placeholder="e.g. Program One Champions Pack"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 uppercase block mb-1.5">
                  Description / Tagline
                </label>
                <input
                  type="text"
                  value={newPackTagline}
                  onChange={(e) => setNewPackTagline(e.target.value)}
                  placeholder="e.g. Guaranteed 78+ Program One players"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase block mb-1.5">
                    Cards Program Pool
                  </label>
                  <select
                    value={newPackProgram}
                    onChange={(e) => setNewPackProgram(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 font-medium"
                  >
                    <option value="Program One">Program One Cards (Black TOTW)</option>
                    <option value="Base Cards">Base Cards (Standard Gold)</option>
                    <option value="All">All Cards (Mixed Pool)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase block mb-1.5">
                    Pack Packaging Theme
                  </label>
                  <select
                    value={newPackTheme}
                    onChange={(e) => setNewPackTheme(e.target.value as PackTheme)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 font-medium"
                  >
                    <option value="black">Black Onyx & Gold (TOTW)</option>
                    <option value="ruby">Crimson Ruby</option>
                    <option value="prismatic">Prismatic Cosmic</option>
                    <option value="gold">Classic Gold Foil</option>
                    <option value="emerald">Emerald Legends</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1">
                    Cost (Coins)
                  </label>
                  <input
                    type="number"
                    min="500"
                    step="500"
                    value={newPackCost}
                    onChange={(e) => setNewPackCost(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-amber-400 font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1">
                    Card Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newPackCardCount}
                    onChange={(e) => setNewPackCardCount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1">
                    Min. Rating
                  </label>
                  <input
                    type="number"
                    min="60"
                    max="92"
                    value={newPackMinRating}
                    onChange={(e) => setNewPackMinRating(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                  <input
                    type="checkbox"
                    checked={newPackGuaranteedWalkout}
                    onChange={(e) => setNewPackGuaranteedWalkout(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-400 w-4 h-4"
                  />
                  <span>Guaranteed Walkout Reveal Ceremony</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreatePackModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-transform hover:scale-105"
                >
                  Create & Add to Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STAGE: TEARING ANIMATION */}
      {stage === 'tearing' && (
        <div className="h-[520px] flex flex-col items-center justify-center space-y-6">
          <div className="relative animate-pack-shake">
            <div className="w-64 h-96 rounded-2xl overflow-hidden border-4 border-amber-400 shadow-[0_0_50px_rgba(251,191,36,0.6)]">
              <img
                src={selectedPack.imageAsset || goldPackImg}
                alt="Opening pack"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Burst ray glow */}
            <div className="absolute inset-0 bg-white/40 blur-xl animate-pulse rounded-full pointer-events-none" />
          </div>
          <p className="text-xl font-black text-amber-300 uppercase tracking-widest animate-pulse">
            Tearing Pack Foil...
          </p>
        </div>
      )}

      {/* STAGE: WALKOUT SEQUENCE */}
      {(stage === 'walkout_nation' ||
        stage === 'walkout_pos' ||
        stage === 'walkout_club' ||
        stage === 'walkout_card') &&
        walkoutCard && (
          <div className="relative min-h-[580px] bg-gradient-to-b from-slate-950 via-[#060c18] to-slate-950 rounded-3xl border border-amber-500/30 p-8 flex flex-col items-center justify-center overflow-hidden shadow-2xl">
            {/* Background Ambient Stadium Lights */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent pointer-events-none" />
            <div className="absolute -top-24 w-96 h-96 bg-amber-400/20 blur-3xl rounded-full pointer-events-none animate-flare" />

            {/* Street Kings, International Moments, Hall of Fame, Futmas & Program One Walkout Announcement */}
            {(walkoutCard.program === 'Street Kings' || walkoutCard.rarity === 'street_kings') ? (
              <div className="mb-6 px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-950 via-slate-900 to-pink-950 border-2 border-cyan-400 text-cyan-200 text-xs sm:text-sm font-black tracking-widest uppercase flex items-center gap-2.5 shadow-[0_0_40px_rgba(6,182,212,0.8)] animate-pulse">
                <Zap className="w-5 h-5 text-yellow-400 animate-bounce" />
                <span>⚡ STREET KINGS MASTERCLASS WALKOUT! ⚡</span>
              </div>
            ) : (walkoutCard.program === 'International Moments' || walkoutCard.rarity === 'international_moments') ? (
              <div className="mb-6 px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-2 border-amber-400 text-yellow-300 text-xs sm:text-sm font-black tracking-widest uppercase flex items-center gap-2.5 shadow-[0_0_40px_rgba(251,191,36,0.8)] animate-pulse">
                <Trophy className="w-5 h-5 text-amber-400 animate-bounce" />
                <span>🌍 INTERNATIONAL MOMENTS LEGEND WALKOUT! 🌍</span>
              </div>
            ) : (walkoutCard.program === 'Hall of Fame' || walkoutCard.rarity === 'hall_of_fame') ? (
              <div className="mb-6 px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-950 via-[#1c1917] to-amber-950 border-2 border-amber-400 text-yellow-300 text-xs sm:text-sm font-black tracking-widest uppercase flex items-center gap-2.5 shadow-[0_0_35px_rgba(234,179,8,0.7)] animate-pulse">
                <Crown className="w-5 h-5 text-amber-400 animate-bounce" />
                <span>👑 HALL OF FAME ENSHRINEMENT WALKOUT! 👑</span>
              </div>
            ) : (walkoutCard.program === 'Futmas' || walkoutCard.rarity === 'futmas') ? (
              <div className="mb-6 px-5 py-2 rounded-full bg-gradient-to-r from-red-950 via-rose-900 to-red-950 border border-cyan-300 text-cyan-200 text-xs font-black tracking-widest uppercase flex items-center gap-2 shadow-[0_0_30px_rgba(6,182,212,0.6)] animate-pulse">
                <Sparkles className="w-4 h-4 animate-spin text-cyan-300" />
                <span>❄️ FUTMAS FESTIVE WALKOUT! ❄️</span>
              </div>
            ) : (walkoutCard.program === 'Program One' || walkoutCard.rarity === 'program_one') ? (
              <div className="mb-6 px-5 py-2 rounded-full bg-zinc-900 border border-amber-400 text-yellow-300 text-xs font-black tracking-widest uppercase flex items-center gap-2 shadow-[0_0_25px_rgba(234,179,8,0.5)]">
                <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
                <span>PROGRAM ONE TOTW WALKOUT!</span>
              </div>
            ) : null}

            {/* Reveal Steps */}
            <div className="w-full max-w-md flex flex-col items-center space-y-6">
              {/* Step 1: Nationality */}
              <div
                className={`transition-all duration-700 transform flex flex-col items-center ${
                  stage === 'walkout_nation' ? 'scale-125 opacity-100' : 'scale-100 opacity-90'
                }`}
              >
                <span className="text-6xl drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]">
                  {walkoutCard.nationFlag || '🌐'}
                </span>
                <span className="text-sm font-bold text-amber-300 tracking-wider mt-1 uppercase">
                  {walkoutCard.nation}
                </span>
              </div>

              {/* Step 2: Position */}
              {(stage === 'walkout_pos' || stage === 'walkout_club' || stage === 'walkout_card') && (
                <div className="text-center animate-bounce">
                  <span className="text-5xl font-black text-white tracking-widest drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]">
                    {walkoutCard.position}
                  </span>
                  <span className="block text-xs font-semibold text-slate-400 uppercase mt-0.5">
                    Position Confirmed
                  </span>
                </div>
              )}

              {/* Step 3: Club */}
              {(stage === 'walkout_club' || stage === 'walkout_card') && (
                <div className="text-center animate-pulse">
                  <span className="text-2xl font-black text-amber-400 uppercase tracking-wide">
                    {walkoutCard.club}
                  </span>
                  <span className="block text-xs text-slate-400">{walkoutCard.league}</span>
                </div>
              )}

              {/* Step 4: Card Walks Out onto Podium */}
              {stage === 'walkout_card' && (
                <div className="flex flex-col items-center space-y-6 mt-2 animate-fade-in">
                  <div className="relative">
                    {/* Glowing Podium */}
                    <div className="absolute -bottom-6 inset-x-0 h-12 bg-amber-400/30 blur-xl rounded-full pointer-events-none" />
                    <CardItem card={walkoutCard} size="walkout" interactive={true} />
                  </div>

                  <button
                    onClick={handleFinishWalkout}
                    className="px-8 py-3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black rounded-xl shadow-xl flex items-center gap-2 text-sm uppercase tracking-wider transform hover:scale-105 active:scale-95 transition-all"
                  >
                    <span>Reveal All Pack Cards</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      {/* STAGE: CARDS GRID (PACK CONTENTS SUMMARY) */}
      {stage === 'cards_grid' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <span className="text-xs text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Pack Opened: {selectedPack.name}
              </span>
              <h3 className="text-2xl font-black text-white mt-1">
                You Pulled {pulledCards.length} Players!
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleKeepAll}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center gap-2 transition-all hover:scale-105"
              >
                <Check className="w-4 h-4" />
                <span>Send All to Club</span>
              </button>

              <button
                onClick={() => setStage('idle')}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-xl border border-slate-700 transition-colors"
              >
                Back to Store
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="flex flex-wrap items-center justify-center gap-6">
            {pulledCards.map((card, idx) => (
              <div key={`${card.id}_${idx}`} className="flex flex-col items-center">
                <CardItem
                  card={card}
                  size="md"
                  interactive={true}
                  showQuickSell={true}
                  onQuickSell={() => handleQuickSellCard(card)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
