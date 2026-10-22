import React, { useState, useMemo } from 'react';
import { SoccerCard } from '../types/card';
import {
  HAUNTED_HOUSES,
  HALLOWEEN_CANDIES,
  CANDY_LIST,
  HauntedHouse,
  CandyItem,
  checkRecipe,
  SCREAM_RECIPES,
} from '../data/halloweenHouses';
import {
  CRAFTABLE_SCREAM_CARDS,
  DEMBELE_99_SCREAM_REWARD,
} from '../data/halloweenScreamCards';
import { BASE_SOCCER_CARDS } from '../data/defaultCards';
import { CardItem } from './CardItem';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { safeSetItem } from '../utils/safeStorage';
import {
  Flame,
  Sparkles,
  Trophy,
  CheckCircle2,
  Lock,
  Plus,
  Minus,
  RotateCcw,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Zap,
  PackageOpen,
  X,
  HelpCircle,
  Skull,
} from 'lucide-react';

interface HalloweenScreamHubProps {
  clubCards?: SoccerCard[];
  onAddCardsToClub: (cards: SoccerCard[]) => void;
  onAddCoins?: (amount: number) => void;
  onNavigateToSetRewards?: () => void;
}

export const HalloweenScreamHub: React.FC<HalloweenScreamHubProps> = ({
  clubCards = [],
  onAddCardsToClub,
  onAddCoins,
  onNavigateToSetRewards,
}) => {
  // Live candy inventory persisted in localStorage
  const [candyInventory, setCandyInventory] = useState<{ [candyId: string]: number }>(() => {
    try {
      const saved = localStorage.getItem('apex_fut_scream_candies_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    // Initial starter candy treats
    return {
      dark_chocolate_skull: 2,
      pumpkin_pop: 2,
      ghostly_licorice: 2,
      witch_jelly: 2,
      candy_corn_fang: 1,
      gummy_tarantula: 1,
      sour_bat_drop: 1,
      blood_orange_toffee: 1,
      shock_wafer: 1,
      phantom_mints: 1,
    };
  });

  // Discovered recipes tracker
  const [discoveredRecipes, setDiscoveredRecipes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('apex_fut_scream_discovered_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Selected candies in the cauldron (up to 5)
  const [cauldronCandies, setCauldronCandies] = useState<string[]>([]);

  // Door Knock Modal State
  const [knockingHouse, setKnockingHouse] = useState<HauntedHouse | null>(null);
  const [doorResult, setDoorResult] = useState<{
    house: HauntedHouse;
    candy: CandyItem;
    giftCard: SoccerCard;
  } | null>(null);
  const [isKnockingAnim, setIsKnockingAnim] = useState<boolean>(false);

  // Brewing State & Result Modal
  const [isBrewing, setIsBrewing] = useState<boolean>(false);
  const [brewResultModal, setBrewResultModal] = useState<{
    success: boolean;
    card: SoccerCard;
    title: string;
    message: string;
  } | null>(null);

  // Grimoire / Recipe Book Drawer Toggle
  const [showGrimoire, setShowGrimoire] = useState<boolean>(false);

  // Count owned Halloween Scream cards in club (excluding Dembélé 99)
  const ownedScreamCount = useMemo(() => {
    const ownedIds = new Set<string>();
    clubCards.forEach((c) => {
      if (!c) return;
      const baseId = c.id.replace(/_inst_.*$/, '');
      if (CRAFTABLE_SCREAM_CARDS.some((s) => s.id === c.id || s.id === baseId)) {
        ownedIds.add(baseId);
      }
    });
    return ownedIds.size;
  }, [clubCards]);

  const hasDembele99 = useMemo(() => {
    return clubCards.some(
      (c) =>
        c.id === DEMBELE_99_SCREAM_REWARD.id ||
        c.id.replace(/_inst_.*$/, '') === DEMBELE_99_SCREAM_REWARD.id
    );
  }, [clubCards]);

  // Update candy inventory helper
  const updateInventory = (updates: { [candyId: string]: number }) => {
    setCandyInventory((prev) => {
      const next = { ...prev, ...updates };
      safeSetItem('apex_fut_scream_candies_v1', JSON.stringify(next));
      return next;
    });
  };

  // Add 1 candy to cauldron
  const handleAddCandyToCauldron = (candyId: string) => {
    if (cauldronCandies.length >= 5) return;
    const currentStock = candyInventory[candyId] || 0;
    const countInCauldron = cauldronCandies.filter((c) => c === candyId).length;
    if (currentStock - countInCauldron <= 0) return;

    sound.playClick();
    setCauldronCandies((prev) => [...prev, candyId]);
  };

  // Remove 1 candy from cauldron
  const handleRemoveCandyFromCauldron = (index: number) => {
    sound.playClick();
    setCauldronCandies((prev) => prev.filter((_, i) => i !== index));
  };

  // Clear Cauldron
  const handleClearCauldron = () => {
    sound.playClick();
    setCauldronCandies([]);
  };

  // Door Knock Handler
  const handleKnockDoor = (house: HauntedHouse) => {
    sound.playClick();
    setKnockingHouse(house);
    setIsKnockingAnim(true);

    setTimeout(() => {
      sound.playPackRip();
      // Pick random specialty candy from this house
      const randomCandyId =
        house.specialtyCandies[Math.floor(Math.random() * house.specialtyCandies.length)];
      const candy = HALLOWEEN_CANDIES[randomCandyId] || CANDY_LIST[0];

      // Pick random base player gift card from club owners reserve
      const randomBaseCard =
        BASE_SOCCER_CARDS[Math.floor(Math.random() * BASE_SOCCER_CARDS.length)] ||
        BASE_SOCCER_CARDS[0];

      // Add candy to inventory
      updateInventory({
        [candy.id]: (candyInventory[candy.id] || 0) + 1,
      });

      // Add base card gift to user's club
      onAddCardsToClub([randomBaseCard]);

      setIsKnockingAnim(false);
      setDoorResult({
        house,
        candy,
        giftCard: randomBaseCard,
      });
    }, 700);
  };

  // Brew Cauldron (Combine 5 Candies)
  const handleBrewCauldron = () => {
    if (cauldronCandies.length !== 5 || isBrewing) return;

    sound.playPackRip();
    setIsBrewing(true);

    // Deduct candies from inventory
    const newInventory = { ...candyInventory };
    cauldronCandies.forEach((cId) => {
      newInventory[cId] = Math.max(0, (newInventory[cId] || 0) - 1);
    });
    updateInventory(newInventory);

    const recipeCheck = checkRecipe(cauldronCandies);

    setTimeout(() => {
      setIsBrewing(false);
      setCauldronCandies([]);

      if (recipeCheck.isMatch && recipeCheck.matchedCardId) {
        // MATCH! Awared Ultimate Halloween Scream player!
        sound.playLevelUp();
        setTimeout(() => sound.playWalkoutFanfare(), 250);

        confetti({
          particleCount: 220,
          spread: 120,
          origin: { y: 0.55 },
          colors: ['#ea580c', '#a855f7', '#06b6d4', '#facc15', '#ffffff'],
        });

        const screamCard = CRAFTABLE_SCREAM_CARDS.find(
          (c) => c.id === recipeCheck.matchedCardId
        )!;

        // Add crafted card to club
        onAddCardsToClub([screamCard]);
        if (onAddCoins) onAddCoins(10000);

        // Record recipe into discovered recipes
        if (!discoveredRecipes.includes(recipeCheck.recipeKey)) {
          const updated = [...discoveredRecipes, recipeCheck.recipeKey];
          setDiscoveredRecipes(updated);
          safeSetItem('apex_fut_scream_discovered_v1', JSON.stringify(updated));
        }

        setBrewResultModal({
          success: true,
          card: screamCard,
          title: `🎃 Formula Mastered! ${screamCard.name} Unlocked!`,
          message: `Incredible! Your 5-candy concoction brewed a powerful Halloween Scream Superstar! This player card and 10,000 bonus coins have been added to your Club.`,
        });
      } else {
        // INCORRECT COMBINATION -> Award Base Card as explicitly required by user!
        sound.playCardFlip();

        // Pick random base player card
        const baseCard =
          BASE_SOCCER_CARDS[Math.floor(Math.random() * BASE_SOCCER_CARDS.length)] ||
          BASE_SOCCER_CARDS[0];

        onAddCardsToClub([baseCard]);

        setBrewResultModal({
          success: false,
          card: baseCard,
          title: '💨 The Cauldron Fizzled with Gray Smoke!',
          message:
            'This 5-candy blend did not match a secret Scream superstar formula. However, the spooky spirits conjured a Base Player card into your Club! Keep visiting houses and try other candy combinations.',
        });
      }
    }, 1200);
  };

  // Dev Quick Test Supply
  const handleAddDevSupply = () => {
    sound.playClick();
    const boosted: { [key: string]: number } = {};
    CANDY_LIST.forEach((c) => {
      boosted[c.id] = (candyInventory[c.id] || 0) + 3;
    });
    updateInventory(boosted);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* ================================================================= */}
      {/* TOP HERO BANNER: HALLOWEEN SCREAM STREET                          */}
      {/* ================================================================= */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-orange-500/60 bg-gradient-to-r from-slate-950 via-[#230f05] to-[#160624] p-6 sm:p-8 shadow-[0_0_50px_rgba(234,88,12,0.35)]">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/40 flex items-center gap-1.5 shadow-sm">
                <Flame className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
                <span>Ultimate Halloween Scream</span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                6 Haunted Houses
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                5-Candy Cauldron
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Trick-or-Treat Street 🎃
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Knock on the 6 spooky house doors for free treats and base player gifts! Collect candies in your Treat Basket, combine 5 candies in the Cauldron to brew Scream Superstars (incorrect recipes award Base cards), and complete the set for <strong>99 ST Dembélé</strong>!
            </p>

            {/* Live Progress Stats */}
            <div className="pt-2 flex items-center gap-5 sm:gap-8 flex-wrap text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Scream Crafted</span>
                <strong className="text-lg font-black text-orange-400 font-mono">
                  {ownedScreamCount} / 31
                </strong>
              </div>
              <div className="h-8 w-px bg-slate-800 hidden sm:block" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Recipes Discovered</span>
                <strong className="text-lg font-black text-purple-400 font-mono">
                  {discoveredRecipes.length} / 31
                </strong>
              </div>
              <div className="h-8 w-px bg-slate-800 hidden sm:block" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">99 Dembélé Goal</span>
                <strong className={`text-lg font-black font-mono ${hasDembele99 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                  {hasDembele99 ? 'Claimed! 👑' : `${Math.round((ownedScreamCount / 31) * 100)}% Complete`}
                </strong>
              </div>
            </div>
          </div>

          {/* Action Hub Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch gap-2.5 w-full lg:w-auto flex-shrink-0">
            <button
              onClick={() => setShowGrimoire((prev) => !prev)}
              className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-purple-500/40 text-purple-200 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
            >
              <BookOpen className="w-4 h-4 text-purple-400" />
              <span>{showGrimoire ? 'Hide Recipe Book' : 'Spooky Grimoire'}</span>
            </button>

            {onNavigateToSetRewards && (
              <button
                onClick={() => {
                  sound.playClick();
                  onNavigateToSetRewards();
                }}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(234,88,12,0.5)] transition-all active:scale-95"
              >
                <Trophy className="w-4 h-4" />
                <span>View 99 Dembélé Set</span>
              </button>
            )}

            <button
              onClick={handleAddDevSupply}
              className="px-4 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              <span>Dev: +3 All Candies</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* SECTION 1: THE 6 HAUNTED HOUSES (TRICK-OR-TREAT STREET)           */}
      {/* ================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span>Visit the 6 Haunted Houses</span>
              <span className="text-xs font-bold text-orange-400 bg-orange-500/10 px-2.5 py-0.5 rounded-full border border-orange-500/30">
                Free Unlimited Knocks
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Knock on any door to collect signature Halloween candies and receive a free base player card gift from the homeowner!
            </p>
          </div>
        </div>

        {/* 6 Houses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {HAUNTED_HOUSES.map((house) => (
            <div
              key={house.id}
              className={`relative rounded-3xl p-5 border-2 border-slate-800/80 hover:border-orange-500/80 bg-gradient-to-b ${house.bgGradient} flex flex-col justify-between gap-4 shadow-xl transition-all duration-300 group hover:shadow-[0_0_30px_rgba(234,88,12,0.25)]`}
            >
              {/* Top Host Crest */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-950/80 border border-slate-700 flex items-center justify-center text-3xl shadow-inner group-hover:scale-105 transition-transform">
                    {house.hostAvatar}
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-orange-400 tracking-wider block">
                      {house.hostTitle}
                    </span>
                    <h3 className="text-base font-black text-white">{house.hostName}</h3>
                    <p className="text-xs text-slate-400">{house.name}</p>
                  </div>
                </div>

                <div className="text-2xl opacity-75 group-hover:opacity-100 group-hover:scale-110 transition-all">
                  {house.doorEmoji}
                </div>
              </div>

              {/* Specialty Candies Offered */}
              <div className="bg-slate-950/70 rounded-2xl p-3 border border-slate-800/80 space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Signature Treats:
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {house.specialtyCandies.map((cId) => {
                    const candy = HALLOWEEN_CANDIES[cId];
                    if (!candy) return null;
                    return (
                      <span
                        key={cId}
                        className="text-[11px] font-bold text-slate-200 bg-slate-900 px-2 py-1 rounded-xl border border-slate-700/60 flex items-center gap-1.5"
                      >
                        <span>{candy.icon}</span>
                        <span>{candy.name}</span>
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Door Knock Action Button */}
              <button
                onClick={() => handleKnockDoor(house)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Skull className="w-4 h-4" />
                <span>Knock On Door (Trick-or-Treat)</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ================================================================= */}
      {/* SECTION 2: THE 5-CANDY CAULDRON CRAFTING TABLE                    */}
      {/* ================================================================= */}
      <div className="rounded-3xl border-2 border-purple-500/40 bg-gradient-to-b from-slate-950 via-[#180a29] to-slate-950 p-6 sm:p-8 space-y-6 shadow-[0_0_40px_rgba(168,85,247,0.25)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-purple-500/20 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🧙‍♀️</span>
              <h2 className="text-2xl font-black text-white">The Spooky Cauldron</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Combine exactly <strong>5 candies</strong> to attempt a secret Halloween formula. Correct recipes unlock Scream Superstars! If incorrect, you receive a Base Player card.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {cauldronCandies.length > 0 && (
              <button
                onClick={handleClearCauldron}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 hover:text-white"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Cauldron</span>
              </button>
            )}
          </div>
        </div>

        {/* Cauldron Centerpiece & 5 Ingredient Slots */}
        <div className="flex flex-col items-center justify-center space-y-5 py-4">
          {/* 5 Ingredient Slots */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
            {[0, 1, 2, 3, 4].map((slotIndex) => {
              const candyId = cauldronCandies[slotIndex];
              const candy = candyId ? HALLOWEEN_CANDIES[candyId] : null;

              return (
                <div
                  key={slotIndex}
                  onClick={() => candy && handleRemoveCandyFromCauldron(slotIndex)}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer relative group ${
                    candy
                      ? 'border-purple-400 bg-purple-950/80 shadow-[0_0_20px_rgba(168,85,247,0.5)] scale-105'
                      : 'border-dashed border-slate-700 bg-slate-900/50 text-slate-600 hover:border-slate-500'
                  }`}
                >
                  {candy ? (
                    <>
                      <span className="text-2xl sm:text-3xl">{candy.icon}</span>
                      <span className="text-[9px] font-bold text-purple-200 truncate max-w-[90%] text-center mt-1">
                        {candy.name}
                      </span>
                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                        ×
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="text-xs font-bold text-slate-500 font-mono">
                        Slot #{slotIndex + 1}
                      </span>
                      <span className="text-[10px] text-slate-600">Pick Candy</span>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Cauldron Brew Pot graphic & Action */}
          <div className="relative text-center space-y-3 pt-2">
            <div className={`w-28 h-28 mx-auto rounded-full bg-gradient-to-b from-purple-950 to-slate-950 border-4 border-purple-500/60 flex items-center justify-center text-5xl shadow-[0_0_40px_rgba(168,85,247,0.5)] ${isBrewing ? 'animate-bounce' : ''}`}>
              🍲
            </div>

            <button
              onClick={handleBrewCauldron}
              disabled={cauldronCandies.length !== 5 || isBrewing}
              className={`px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-3 transition-all ${
                cauldronCandies.length === 5 && !isBrewing
                  ? 'bg-gradient-to-r from-purple-500 via-fuchsia-500 to-orange-500 text-slate-950 hover:brightness-110 shadow-[0_0_35px_rgba(168,85,247,0.7)] scale-105 active:scale-95 animate-pulse cursor-pointer'
                  : 'bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              <span>
                {isBrewing
                  ? 'Brewing Halloween Potion...'
                  : cauldronCandies.length === 5
                  ? 'Brew Halloween Spell (5 Candies)'
                  : `Add ${5 - cauldronCandies.length} More Candies to Brew`}
              </span>
            </button>
          </div>
        </div>

        {/* Live Treat Basket Inventory Grid */}
        <div className="space-y-3 pt-4 border-t border-purple-500/20">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase text-purple-300 tracking-wider flex items-center gap-2">
              <span>🧺 Your Treat Basket</span>
              <span className="text-xs font-normal text-slate-400">
                (Click + to place into cauldron)
              </span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Total Treats: {Object.values(candyInventory).reduce((a, b) => a + b, 0)}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {CANDY_LIST.map((candy) => {
              const totalStock = candyInventory[candy.id] || 0;
              const usedInCauldron = cauldronCandies.filter((c) => c === candy.id).length;
              const availableStock = Math.max(0, totalStock - usedInCauldron);

              return (
                <div
                  key={candy.id}
                  className={`p-3 rounded-2xl border transition-all flex flex-col justify-between gap-2 ${
                    availableStock > 0
                      ? 'bg-slate-950/80 border-purple-500/40 text-white'
                      : 'bg-slate-950/30 border-slate-800/80 text-slate-600 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-2xl">{candy.icon}</span>
                    <span className={`text-xs font-black font-mono px-2 py-0.5 rounded-full ${availableStock > 0 ? 'bg-purple-900/60 text-purple-200' : 'bg-slate-900 text-slate-600'}`}>
                      x{availableStock}
                    </span>
                  </div>

                  <div>
                    <div className="text-xs font-black truncate">{candy.name}</div>
                    <div className="text-[10px] text-slate-400 line-clamp-1">{candy.description}</div>
                  </div>

                  <button
                    onClick={() => handleAddCandyToCauldron(candy.id)}
                    disabled={availableStock <= 0 || cauldronCandies.length >= 5}
                    className={`w-full py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors ${
                      availableStock > 0 && cauldronCandies.length < 5
                        ? 'bg-purple-600 hover:bg-purple-500 text-white'
                        : 'bg-slate-900 text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* SECTION 3: SPOOKY GRIMOIRE / RECIPE LOG (COLLAPSIBLE)             */}
      {/* ================================================================= */}
      {showGrimoire && (
        <div className="rounded-3xl border-2 border-purple-500/50 bg-slate-950 p-6 space-y-4 shadow-xl animate-fade-in">
          <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-black text-white">Spooky Grimoire • Discovered Recipes</h3>
            </div>
            <span className="text-xs text-purple-300 font-mono font-bold">
              {discoveredRecipes.length} / 31 Formulas Mastered
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Every correct 5-candy brew is inscribed in this tome. If you discover a secret formula, you can re-use it anytime!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
            {Object.entries(SCREAM_RECIPES).map(([key, recipe]) => {
              const isDiscovered = discoveredRecipes.includes(key);
              const card = CRAFTABLE_SCREAM_CARDS.find((c) => c.id === recipe.cardId);

              return (
                <div
                  key={key}
                  className={`p-3 rounded-2xl border text-xs flex items-center gap-3 ${
                    isDiscovered
                      ? 'bg-purple-950/40 border-purple-500/60 text-white'
                      : 'bg-slate-900/40 border-slate-800 text-slate-600'
                  }`}
                >
                  <div className="text-2xl">{isDiscovered ? '📜' : '🔒'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-sm text-purple-300 truncate">
                      {isDiscovered && card ? `${card.rating} ${card.name}` : 'Unknown Secret Formula'}
                    </div>
                    {isDiscovered ? (
                      <div className="flex items-center gap-1 mt-1 flex-wrap">
                        {recipe.candies.map((cId, idx) => (
                          <span key={idx} className="text-xs">
                            {HALLOWEEN_CANDIES[cId]?.icon}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-500">
                        Try 5 different candies in the Cauldron to discover!
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* SECTION 4: 99 DEMBÉLÉ GRAND SET REWARD SHOWCASE                   */}
      {/* ================================================================= */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-yellow-400/60 bg-gradient-to-r from-slate-950 via-[#1e1302] to-slate-950 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_40px_rgba(250,204,21,0.3)]">
        <div className="space-y-3 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 flex items-center gap-1.5">
              👑 The Ultimate Halloween Grand Prize
            </span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-white">
            Ousmane Dembélé 99 ST • Grand Set Reward
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Craft all <strong>31 Halloween Scream players</strong> from the Trick-or-Treat mini-game to unlock the supreme 99 ST Dembélé with 99 Pace, 98 Shooting, and 99 Dribbling + 250,000 Coins in the Set Rewards Hub!
          </p>

          <div className="pt-2 flex items-center gap-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Mini-Game Collection Progress
              </span>
              <strong className="text-yellow-400 text-lg font-black font-mono">
                {ownedScreamCount} / 31 Players ({Math.round((ownedScreamCount / 31) * 100)}%)
              </strong>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 flex-shrink-0">
          <div className="w-36 transform hover:scale-105 transition-transform">
            <CardItem card={DEMBELE_99_SCREAM_REWARD} size="md" interactive={true} />
          </div>

          {onNavigateToSetRewards && (
            <button
              onClick={() => {
                sound.playClick();
                onNavigateToSetRewards();
              }}
              className="px-5 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all active:scale-95"
            >
              <Trophy className="w-4 h-4" />
              <span>Go to Set Rewards</span>
            </button>
          )}
        </div>
      </div>

      {/* ================================================================= */}
      {/* MODAL 1: DOOR KNOCK RESULTS MODAL                                 */}
      {/* ================================================================= */}
      {doorResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
          <div className="relative max-w-md w-full rounded-3xl border-2 border-orange-500 bg-gradient-to-b from-slate-950 via-[#1f0a02] to-slate-950 p-6 text-center space-y-5 shadow-[0_0_60px_rgba(234,88,12,0.6)]">
            <div className="w-20 h-20 rounded-full bg-orange-500/20 border-2 border-orange-500 mx-auto flex items-center justify-center text-4xl shadow-inner">
              {doorResult.house.hostAvatar}
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/30">
                {doorResult.house.name}
              </span>
              <h3 className="text-2xl font-black text-white">
                Trick-or-Treat! 🎃
              </h3>
              <p className="text-xs text-orange-200 italic px-2">
                {doorResult.house.greetingQuote}
              </p>
            </div>

            {/* Treat & Gift Display */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-orange-500/30 space-y-3">
              <div className="flex items-center justify-center gap-2 text-sm font-black text-orange-300">
                <span className="text-2xl">{doorResult.candy.icon}</span>
                <span>+1 {doorResult.candy.name} added to Basket!</span>
              </div>

              <div className="border-t border-slate-800 pt-3">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-2">
                  Bonus Gift: Homeowner's Base Player Card
                </span>
                <div className="flex justify-center">
                  <div className="transform hover:scale-105 transition-transform">
                    <CardItem card={doorResult.giftCard} size="sm" interactive={false} />
                  </div>
                </div>
                <div className="text-xs font-bold text-emerald-400 mt-2 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{doorResult.giftCard.name} ({doorResult.giftCard.rating} OVR) added to Club!</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setDoorResult(null)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all"
            >
              Put in Basket & Keep Trick-or-Treating
            </button>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL 2: BREW RESULT MODAL (SCREAM WIN OR BASE CARD FALLBACK)      */}
      {/* ================================================================= */}
      {brewResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
          <div className={`relative max-w-lg w-full rounded-3xl border-2 p-6 sm:p-8 text-center space-y-5 shadow-2xl ${
            brewResultModal.success
              ? 'border-orange-500 bg-gradient-to-b from-slate-950 via-[#260e05] to-slate-950 shadow-[0_0_70px_rgba(234,88,12,0.7)]'
              : 'border-slate-700 bg-gradient-to-b from-slate-950 via-[#181824] to-slate-950 shadow-[0_0_40px_rgba(100,116,139,0.3)]'
          }`}>
            <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center text-4xl shadow-inner ${
              brewResultModal.success
                ? 'bg-orange-500/20 border-2 border-orange-500'
                : 'bg-slate-800 border border-slate-600'
            }`}>
              {brewResultModal.success ? '🎃' : '💨'}
            </div>

            <div className="space-y-2">
              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                brewResultModal.success
                  ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}>
                {brewResultModal.success ? '⭐ Secret Recipe Unlocked! ⭐' : 'Spell Fizzled • Base Card Concocted'}
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                {brewResultModal.title}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed px-2">
                {brewResultModal.message}
              </p>
            </div>

            {/* Revealed Card Item */}
            <div className="flex justify-center py-2">
              <div className="transform hover:scale-105 transition-transform duration-300">
                <CardItem card={brewResultModal.card} size="md" interactive={true} />
              </div>
            </div>

            <button
              onClick={() => setBrewResultModal(null)}
              className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all ${
                brewResultModal.success
                  ? 'bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 text-slate-950 hover:brightness-110'
                  : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
              }`}
            >
              Continue Playing
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
