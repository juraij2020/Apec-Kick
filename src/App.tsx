/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { SoccerCard, SBCChallenge, PackDefinition } from './types/card';
import { INITIAL_CUSTOM_CARDS, BASE_SOCCER_CARDS, HANEEN_MUSTAFA_CARD, HALL_OF_FAME_CARDS, FUTMAS_CARDS } from './data/defaultCards';
import { STREET_KINGS_CARDS } from './data/streetKings';
import { SUMMER_BASIC_CARDS, SUMMER_PREMIUM_CARDS } from './data/summerCards';
import { THROWBACK_CARDS } from './data/throwbackCards';
import { INTERNATIONAL_MOMENTS_CARDS } from './data/internationalMoments';
import { INITIAL_SBCS } from './data/sbcs';
import { PACKS } from './data/packs';
import { calculateSquadChemistry } from './utils/chemistry';
import { FORMATIONS } from './data/formations';
import { sound } from './utils/audio';
import { HALL_OF_FUT_COLLECTIBLE_CARDS } from './data/hallOfFutCards';
import { SPANISH_HOF_COLLECTIBLE_CARDS } from './data/hallOfFutSpanishCards';
import { ALL_SIGNATURE_CARDS } from './data/signatureCards';
import { ALL_GERMANY_CARDS } from './data/nationsGermany';

import { PackOpening } from './components/PackOpening';
import { CardCreator } from './components/CardCreator';
import { SBCView } from './components/SBCView';
import { SquadBuilder } from './components/SquadBuilder';
import { MatchSimulator } from './components/MatchSimulator';
import { ClubGallery } from './components/ClubGallery';
import { FutmasHub } from './components/FutmasHub';
import { HallOfFameHub } from './components/HallOfFameHub';
import { InternationalMomentsHub } from './components/InternationalMomentsHub';
import { TransferMarket } from './components/TransferMarket';
import { MiniGamesHub } from './components/MiniGamesHub';
import { MyPacksHub } from './components/MyPacksHub';
import { DailyObjectives } from './components/DailyObjectives';
import { SetRewardsHub } from './components/SetRewardsHub';
import { EvolutionHub } from './components/EvolutionHub';
import { GoogleAuthButton } from './components/GoogleAuthButton';
import { StoredRewardPack, CardStats } from './types/card';
import { INITIAL_REWARD_PACKS } from './data/rewardPacks';
import { buildEvolvedSakaCard } from './data/evolutionSaka';

import { 
  Volume2, 
  VolumeX, 
  Coins, 
  Sparkles, 
  Crown, 
  Globe, 
  Store, 
  Gamepad2, 
  PackageOpen, 
  Target, 
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Shield,
  Users,
  Layers,
  Swords,
  Package,
  Trophy,
  Dna
} from 'lucide-react';
import { safeSetItem, safeGetItem, sanitizeCardsListForStorage } from './utils/safeStorage';

type NavTab = 'intl' | 'hof' | 'evolution' | 'market' | 'minigames' | 'packs' | 'creator' | 'squad' | 'sbcs' | 'clash' | 'mypacks' | 'club' | 'futmas' | 'objectives' | 'set_rewards';

const STORAGE_KEYS = {
  COINS: 'apex_fut_coins_v2',
  EVO_POINTS: 'apex_fut_evo_points_v1',
  SAKA_STAGE: 'apex_fut_saka_stage_v1',
  SAKA_STATS: 'apex_fut_saka_stats_v1',
  USER_CARDS: 'apex_fut_user_cards_v2',
  CLUB_CARDS: 'apex_fut_club_cards_v2',
  SQUAD_SLOTS: 'apex_fut_squad_slots_v2',
  FORMATION: 'apex_fut_formation_v1',
  SBCS: 'apex_fut_sbcs_v2',
  AUDIO: 'apex_fut_audio_v1',
  CUSTOM_PACKS: 'apex_fut_custom_packs_v1',
  UNOPENED_PACKS: 'apex_fut_my_unopened_packs_v1',
  DAILY_STATS: 'apex_fut_daily_stats_v1',
};

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('objectives');

  // Coins State (starts with 50,000 so user can test Hall of Fame packs immediately)
  const [coins, setCoins] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COINS);
    return saved !== null ? parseInt(saved, 10) : 50000;
  });

  // Evolution Points State (starts with 100 starter points to test upgrades immediately)
  const [evoPoints, setEvoPoints] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EVO_POINTS);
    return saved !== null ? parseInt(saved, 10) : 100;
  });

  // Saka Evolution Stage Index (starts at 0 = 75 OVR LB)
  const [sakaStageIndex, setSakaStageIndex] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SAKA_STAGE);
    return saved !== null ? parseInt(saved, 10) : 0;
  });

  // Saka Live Attributes
  const [sakaStats, setSakaStats] = useState<CardStats>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SAKA_STATS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (_) {}
    }
    return { pac: 75, sho: 75, pas: 73, dri: 75, def: 64, phy: 63 };
  });

  const [hasClaimedGift, setHasClaimedGift] = useState<boolean>(() => {
    return localStorage.getItem('apex_fut_futmas_gift_v1') === 'true';
  });

  // User-Created & Program One Cards
  const [userCreatedCards, setUserCreatedCards] = useState<SoccerCard[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER_CARDS);
    if (saved) {
      try {
        const parsed: SoccerCard[] = JSON.parse(saved);
        const existingIds = new Set(parsed.map(c => c.id));
        const missing = INITIAL_CUSTOM_CARDS.filter(c => !existingIds.has(c.id));
        return [...parsed, ...missing];
      } catch (e) {
        return INITIAL_CUSTOM_CARDS;
      }
    }
    return INITIAL_CUSTOM_CARDS;
  });

  // User Club Collection (Inventory)
  const [clubCards, setClubCards] = useState<SoccerCard[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CLUB_CARDS);
    if (saved) {
      try {
        const parsed: SoccerCard[] = JSON.parse(saved);
        const existingIds = new Set(parsed.map(c => c.id));
        const missing = INITIAL_CUSTOM_CARDS.slice(0, 20).filter(c => !existingIds.has(c.id));
        return [...parsed, ...missing];
      } catch (e) {
        return [...INITIAL_CUSTOM_CARDS.slice(0, 20), ...BASE_SOCCER_CARDS.slice(0, 10)];
      }
    }
    return [...INITIAL_CUSTOM_CARDS.slice(0, 20), ...BASE_SOCCER_CARDS.slice(0, 10)];
  });

  // Custom User-Created Packs
  const [customPacks, setCustomPacks] = useState<PackDefinition[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_PACKS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Unopened Reward Packs (stored in My Packs)
  const [unopenedPacks, setUnopenedPacks] = useState<StoredRewardPack[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.UNOPENED_PACKS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_REWARD_PACKS;
      }
    }
    return INITIAL_REWARD_PACKS;
  });

  // Active Squad Slots (starts with high-synergy squad from uploaded Program One & Base roster)
  const [activeSquadSlots, setActiveSquadSlots] = useState<{ [slotId: string]: string | undefined }>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SQUAD_SLOTS);
    if (saved) return JSON.parse(saved);
    return {
      st: 'prog1-addai',
      cam: 'prog1-angulo',
      cb1: 'prog1-blokzijl',
      lw: 'prog1-anello',
      rw: 'prog1-alfonso',
      cm1: 'base-debruyne',
      cm2: 'prog1-aremu',
      cb2: 'base-van-dijk',
      lb: 'prog1-al-harbi',
      rb: 'prog1-costly',
      gk: 'prog1-wiegele',
    };
  });

  const [formationId, setFormationId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.FORMATION) || '4-3-3';
  });

  // SBCs State
  const [challenges, setChallenges] = useState<SBCChallenge[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SBCS);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Re-hydrate requirements functions from INITIAL_SBCS
      return INITIAL_SBCS.map((initSbc) => {
        const found = parsed.find((p: { id: string }) => p.id === initSbc.id);
        return found ? { ...initSbc, completed: found.completed } : initSbc;
      });
    }
    return INITIAL_SBCS;
  });

  const [audioEnabled, setAudioEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUDIO);
    return saved !== null ? saved === 'true' : true;
  });

  const getTodayDateStr = () => new Date().toISOString().split('T')[0];

  // Daily Objectives Dynamic Tracking for 5 tasks
  const [dailyStats, setDailyStats] = useState<{
    date: string;
    packsOpened: number;
    matchesWon: number;
    sbcsSubmitted: number;
    miniGamesPlayed: number;
    marketTrades: number;
  }>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DAILY_STATS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.date === getTodayDateStr()) {
          return {
            date: getTodayDateStr(),
            packsOpened: parsed.packsOpened || 0,
            matchesWon: parsed.matchesWon || 0,
            sbcsSubmitted: parsed.sbcsSubmitted || 0,
            miniGamesPlayed: parsed.miniGamesPlayed || 0,
            marketTrades: parsed.marketTrades || 0,
          };
        }
      }
    } catch (_) {}
    return {
      date: getTodayDateStr(),
      packsOpened: 0,
      matchesWon: 0,
      sbcsSubmitted: 0,
      miniGamesPlayed: 0,
      marketTrades: 0,
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DAILY_STATS, JSON.stringify(dailyStats));
    } catch (_) {}
  }, [dailyStats]);

  const handleIncrementPacksOpened = () => {
    setEvoPoints((prev) => prev + 5);
    setDailyStats((prev) => ({
      ...prev,
      date: getTodayDateStr(),
      packsOpened: prev.packsOpened + 1,
    }));
  };

  const handleIncrementMatchesWon = () => {
    setEvoPoints((prev) => prev + 35);
    setDailyStats((prev) => ({
      ...prev,
      date: getTodayDateStr(),
      matchesWon: prev.matchesWon + 1,
    }));
  };

  const handleIncrementSBCsSubmitted = () => {
    setEvoPoints((prev) => prev + 20);
    setDailyStats((prev) => ({
      ...prev,
      date: getTodayDateStr(),
      sbcsSubmitted: prev.sbcsSubmitted + 1,
    }));
  };

  const handleIncrementMiniGamesPlayed = () => {
    setEvoPoints((prev) => prev + 25);
    setDailyStats((prev) => ({
      ...prev,
      date: getTodayDateStr(),
      miniGamesPlayed: prev.miniGamesPlayed + 1,
    }));
  };

  const handleIncrementMarketTrades = () => {
    setDailyStats((prev) => ({
      ...prev,
      date: getTodayDateStr(),
      marketTrades: prev.marketTrades + 1,
    }));
  };

  // Persist State safely with quota management
  useEffect(() => {
    safeSetItem(STORAGE_KEYS.COINS, coins.toString());
  }, [coins]);

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.EVO_POINTS, evoPoints.toString());
  }, [evoPoints]);

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.SAKA_STAGE, sakaStageIndex.toString());
  }, [sakaStageIndex]);

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.SAKA_STATS, JSON.stringify(sakaStats));
  }, [sakaStats]);

  // Synchronize evolved Saka into clubCards collection
  useEffect(() => {
    const activeEvoCard = buildEvolvedSakaCard(sakaStageIndex, sakaStats);
    setClubCards((prev) => {
      const idx = prev.findIndex((c) => c.id === 'evo-saka-active');
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = activeEvoCard;
        return next;
      }
      return [activeEvoCard, ...prev];
    });
  }, [sakaStageIndex, sakaStats]);

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.USER_CARDS, JSON.stringify(sanitizeCardsListForStorage(userCreatedCards)));
  }, [userCreatedCards]);

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.CLUB_CARDS, JSON.stringify(sanitizeCardsListForStorage(clubCards)));
  }, [clubCards]);

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.SQUAD_SLOTS, JSON.stringify(activeSquadSlots));
  }, [activeSquadSlots]);

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.FORMATION, formationId);
  }, [formationId]);

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.SBCS, JSON.stringify(challenges.map(c => ({ id: c.id, completed: c.completed }))));
  }, [challenges]);

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.CUSTOM_PACKS, JSON.stringify(customPacks));
  }, [customPacks]);

  useEffect(() => {
    sound.enabled = audioEnabled;
    safeSetItem(STORAGE_KEYS.AUDIO, audioEnabled ? 'true' : 'false');
  }, [audioEnabled]);

  // Combined card pool for packs, market & squads (Standard cards + Street Kings + Summer Transfers + Intl Moments + HOF + Futmas + User cards)
  const allCardsPool = useMemo(() => {
    const cardMap = new Map<string, SoccerCard>();
    BASE_SOCCER_CARDS.forEach((c) => cardMap.set(c.id, c));
    INITIAL_CUSTOM_CARDS.forEach((c) => cardMap.set(c.id, c));
    STREET_KINGS_CARDS.forEach((c) => cardMap.set(c.id, c));
    SUMMER_BASIC_CARDS.forEach((c) => cardMap.set(c.id, c));
    SUMMER_PREMIUM_CARDS.forEach((c) => cardMap.set(c.id, c));
    THROWBACK_CARDS.forEach((c) => cardMap.set(c.id, c));
    INTERNATIONAL_MOMENTS_CARDS.forEach((c) => cardMap.set(c.id, c));
    HALL_OF_FAME_CARDS.forEach((c) => cardMap.set(c.id, c));
    HALL_OF_FUT_COLLECTIBLE_CARDS.forEach((c) => cardMap.set(c.id, c));
    SPANISH_HOF_COLLECTIBLE_CARDS.forEach((c) => cardMap.set(c.id, c));
    ALL_SIGNATURE_CARDS.forEach((c) => cardMap.set(c.id, c));
    ALL_GERMANY_CARDS.forEach((c) => cardMap.set(c.id, c));
    FUTMAS_CARDS.forEach((c) => cardMap.set(c.id, c));
    userCreatedCards.forEach((c) => cardMap.set(c.id, c));
    return Array.from(cardMap.values());
  }, [userCreatedCards]);

  // Map of club cards for chemistry & squads
  const clubCardMap = new Map<string, SoccerCard>();
  clubCards.forEach((c) => clubCardMap.set(c.id, c));

  const currentFormation = FORMATIONS.find((f) => f.id === formationId) || FORMATIONS[0];
  const squadStats = calculateSquadChemistry(currentFormation, activeSquadSlots, clubCardMap);

  // Cards on active pitch
  const userPitchCards = Object.values(activeSquadSlots)
    .filter((id): id is string => id !== undefined)
    .map((id) => clubCardMap.get(id))
    .filter((c): c is SoccerCard => c !== undefined);

  // Coin handlers
  const handleDeductCoins = (amount: number): boolean => {
    if (coins < amount) return false;
    setCoins((prev) => prev - amount);
    return true;
  };

  const handleAddCoins = (amount: number) => {
    setCoins((prev) => prev + amount);
  };

  const handleAddCardsToClub = (newCards: SoccerCard[]) => {
    setClubCards((prev) => [...newCards, ...prev]);
  };

  const handleDeductEvoPoints = (amount: number): boolean => {
    if (evoPoints < amount) return false;
    setEvoPoints((prev) => prev - amount);
    return true;
  };

  const handleAddEvoPoints = (amount: number) => {
    setEvoPoints((prev) => prev + amount);
  };

  const handleUpdateSakaStatsAndStage = (newStats: CardStats, newStageIndex: number) => {
    setSakaStats(newStats);
    setSakaStageIndex(newStageIndex);
  };

  const handleRemoveCardFromClub = (cardId: string) => {
    setClubCards((prev) => prev.filter((c) => c.id !== cardId));
    setActiveSquadSlots((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((slotId) => {
        if (next[slotId] === cardId) {
          delete next[slotId];
        }
      });
      return next;
    });
  };

  const handleQuickSellCard = (card: SoccerCard) => {
    handleIncrementMarketTrades();
    setCoins((prev) => prev + card.price);
    setClubCards((prev) => prev.filter((c) => c.id !== card.id));
    // If card was in squad, clear that slot
    setActiveSquadSlots((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((slotId) => {
        if (next[slotId] === card.id) {
          delete next[slotId];
        }
      });
      return next;
    });
  };

  // Custom Card handlers
  const handleSaveCustomCard = (newCard: SoccerCard) => {
    setUserCreatedCards((prev) => {
      const existing = prev.findIndex((c) => c.id === newCard.id);
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = newCard;
        return next;
      }
      return [newCard, ...prev];
    });

    // Also add to club inventory so player owns a copy immediately!
    setClubCards((prev) => {
      const existing = prev.findIndex((c) => c.id === newCard.id);
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = newCard;
        return next;
      }
      return [newCard, ...prev];
    });
  };

  const handleDeleteCustomCard = (cardId: string) => {
    setUserCreatedCards((prev) => prev.filter((c) => c.id !== cardId));
    setClubCards((prev) => prev.filter((c) => c.id !== cardId));
    setActiveSquadSlots((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        if (next[k] === cardId) delete next[k];
      });
      return next;
    });
  };

  const handleCreatePack = (newPack: PackDefinition) => {
    setCustomPacks((prev) => [newPack, ...prev]);
  };

  const handleDeletePack = (packId: string) => {
    setCustomPacks((prev) => prev.filter((p) => p.id !== packId));
  };

  // SBC completion
  const handleCompleteSBC = (
    sbcId: string,
    submittedCardIds: string[],
    rewardCoins: number,
    rewardPackId: string
  ) => {
    const submittedSet = new Set(submittedCardIds);
    // Remove burned cards from club
    setClubCards((prev) => prev.filter((c) => !submittedSet.has(c.id)));
    // Remove burned cards from squad slots
    setActiveSquadSlots((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((slotId) => {
        if (next[slotId] && submittedSet.has(next[slotId]!)) {
          delete next[slotId];
        }
      });
      return next;
    });

    // Increment Daily Objectives count
    handleIncrementSBCsSubmitted();

    // Add reward coins
    setCoins((prev) => prev + rewardCoins);

    // If reward pack exists in PACKS, award it directly to My Packs vault!
    const matchingPack = PACKS.find((p) => p.id === rewardPackId);
    if (matchingPack) {
      handleAddUnopenedPack(matchingPack, `SBC: ${sbcId}`, 'sbc');
    }

    // If completing Haneen Mustafa SBC, grant untradeable 92 Haneen Mustafa into user's club!
    if (sbcId === 'sbc-street-kings-haneen') {
      const haneenReward: SoccerCard = {
        ...HANEEN_MUSTAFA_CARD,
        id: `sk_haneen_sbc_reward_${Date.now()}`,
      };
      setClubCards((prev) => [haneenReward, ...prev]);
    }

    // Mark challenge completed
    setChallenges((prev) =>
      prev.map((c) => (c.id === sbcId ? { ...c, completed: true } : c))
    );
  };

  // Award match simulator prize
  const handleAwardMatchPrize = (coinsEarned: number, bonusPackName?: string) => {
    handleIncrementMatchesWon();
    setCoins((prev) => prev + coinsEarned);
    if (bonusPackName) {
      // Find matching pack or drop a bonus card
      const pack = PACKS.find((p) => p.name === bonusPackName) || PACKS[0];
      // Generate 2 bonus cards for club
      const bonusCards: SoccerCard[] = [
        allCardsPool[Math.floor(Math.random() * allCardsPool.length)],
        allCardsPool[Math.floor(Math.random() * allCardsPool.length)],
      ].map((c, i) => ({
        ...c,
        id: `${c.id}_match_reward_${Date.now()}_${i}`,
      }));
      setClubCards((prev) => [...bonusCards, ...prev]);
    }
  };

  // Add reward pack to My Packs
  const handleAddUnopenedPack = (
    pack: PackDefinition,
    sourceTitle: string,
    sourceType: 'high_low' | 'guess_who' | 'daily_objective' | 'bonus' | 'sbc' | 'pack_duo'
  ) => {
    const newStoredPack: StoredRewardPack = {
      instanceId: `pack_reward_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      packDefinition: pack,
      earnedAt: Date.now(),
      sourceTitle,
      sourceType,
    };
    setUnopenedPacks((prev) => {
      const updated = [newStoredPack, ...prev];
      safeSetItem(STORAGE_KEYS.UNOPENED_PACKS, JSON.stringify(updated));
      return updated;
    });
  };

  // Open / consume pack from My Packs vault
  const handleOpenRewardPack = (instanceId: string) => {
    handleIncrementPacksOpened();
    setUnopenedPacks((prev) => {
      const updated = prev.filter((p) => p.instanceId !== instanceId);
      safeSetItem(STORAGE_KEYS.UNOPENED_PACKS, JSON.stringify(updated));
      return updated;
    });
  };

  const desktopNavRef = useRef<HTMLDivElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);

  const handleScrollNav = (direction: 'left' | 'right') => {
    sound.playClick();
    if (desktopNavRef.current) {
      desktopNavRef.current.scrollBy({
        left: direction === 'left' ? -260 : 260,
        behavior: 'smooth',
      });
    }
  };

  const handleScrollMobileNav = (direction: 'left' | 'right') => {
    sound.playClick();
    if (mobileNavRef.current) {
      mobileNavRef.current.scrollBy({
        left: direction === 'left' ? -180 : 180,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-black">
      {/* Strict Top Bar Contract: 3 zones */}
      <header className="sticky top-0 z-40 bg-[#090d16]/95 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Zone 1: Single text wordmark */}
          <div
            onClick={() => { setCurrentTab('packs'); sound.playClick(); }}
            className="cursor-pointer text-lg font-black tracking-tight text-white hover:text-emerald-400 transition-colors flex items-center gap-2 flex-shrink-0"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="hidden sm:inline">APEX KICK</span>
            <span className="sm:hidden font-mono font-black">APEX</span>
          </div>

          {/* Zone 2: Rolling Navigation Carousel with Left/Right Roll Chevrons */}
          <div className="hidden md:flex items-center relative flex-1 min-w-0 mx-2 max-w-4xl">
            {/* Roll Left Arrow */}
            <button
              onClick={() => handleScrollNav('left')}
              className="p-1.5 rounded-lg bg-slate-900/95 hover:bg-slate-800 text-slate-400 hover:text-amber-300 border border-slate-700/70 shadow-lg flex-shrink-0 z-20 transition-all hover:scale-105 active:scale-95"
              title="Roll tabs left"
              aria-label="Scroll navigation left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Left Edge Gradient Fade */}
            <div className="absolute left-8 top-0 bottom-0 w-6 bg-gradient-to-r from-[#090d16] to-transparent pointer-events-none z-10" />

            {/* Scrollable Rolling Track */}
            <nav
              ref={desktopNavRef}
              className="flex items-center gap-2 overflow-x-auto scroll-smooth py-1 scrollbar-none px-4 mx-1 flex-1"
            >
              {/* Daily Objectives */}
              <button
                onClick={() => { setCurrentTab('objectives'); sound.playClick(); }}
                className={`flex items-center gap-1.5 flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  currentTab === 'objectives'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                    : 'bg-slate-900/80 text-amber-400/90 border-slate-800 hover:border-amber-500/40 hover:text-amber-300'
                }`}
              >
                <Target className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Objectives</span>
                <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full uppercase">
                  Daily
                </span>
              </button>

              {/* Set Rewards Tab */}
              <button
                onClick={() => { setCurrentTab('set_rewards'); sound.playClick(); }}
                className={`flex items-center gap-1.5 flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all border ${
                  currentTab === 'set_rewards'
                    ? 'bg-amber-500/25 text-amber-200 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                    : 'bg-gradient-to-r from-red-500/10 to-amber-500/10 text-amber-300 border-amber-500/40 hover:border-amber-400 hover:bg-amber-500/20'
                }`}
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Set Rewards</span>
                <span className="text-[9px] bg-gradient-to-r from-red-500 to-amber-500 text-white font-black px-1.5 py-0.2 rounded-full uppercase">
                  Kane 99
                </span>
              </button>

              {/* Card Evolutions Tab */}
              <button
                onClick={() => { setCurrentTab('evolution'); sound.playClick(); }}
                className={`flex items-center gap-1.5 flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all border ${
                  currentTab === 'evolution'
                    ? 'bg-emerald-500/25 text-emerald-200 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.35)]'
                    : 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-300 border-emerald-500/40 hover:border-emerald-400 hover:bg-emerald-500/20'
                }`}
              >
                <Dna className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>Evolutions</span>
                <span className="text-[9px] bg-emerald-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full uppercase">
                  Saka 98
                </span>
              </button>

              {/* Open Packs */}
              <button
                onClick={() => { setCurrentTab('packs'); sound.playClick(); }}
                className={`flex items-center gap-1.5 flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  currentTab === 'packs'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                    : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                <Package className="w-3.5 h-3.5 text-cyan-400" />
                <span>Open Packs</span>
              </button>

              {/* My Packs Vault */}
              <button
                onClick={() => { setCurrentTab('mypacks'); sound.playClick(); }}
                className={`flex items-center gap-1.5 flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  currentTab === 'mypacks'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                    : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-emerald-300'
                }`}
              >
                <PackageOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span>My Packs</span>
                {unopenedPacks.length > 0 && (
                  <span className="text-[10px] bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded-full font-mono font-black animate-pulse">
                    {unopenedPacks.length}
                  </span>
                )}
              </button>

              {/* Mini-Games (High contrast and easy to see!) */}
              <button
                onClick={() => { setCurrentTab('minigames'); sound.playClick(); }}
                className={`flex items-center gap-1.5 flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all border ${
                  currentTab === 'minigames'
                    ? 'bg-amber-500/25 text-amber-200 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                    : 'bg-gradient-to-r from-amber-500/10 to-amber-600/10 text-amber-300 border-amber-500/40 hover:border-amber-400 hover:bg-amber-500/20'
                }`}
              >
                <Gamepad2 className="w-4 h-4 text-amber-400" />
                <span>Mini Games</span>
                <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded font-mono">
                  HOT
                </span>
              </button>

              {/* My Club (High contrast and easy to see!) */}
              <button
                onClick={() => { setCurrentTab('club'); sound.playClick(); }}
                className={`flex items-center gap-1.5 flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all border ${
                  currentTab === 'club'
                    ? 'bg-emerald-500/25 text-emerald-200 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.35)]'
                    : 'bg-gradient-to-r from-emerald-500/10 to-teal-600/10 text-emerald-300 border-emerald-500/40 hover:border-emerald-400 hover:bg-emerald-500/20'
                }`}
              >
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>My Club</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded-full font-mono font-bold border border-emerald-500/40">
                  {clubCards.length}
                </span>
              </button>

              {/* Intl Moments */}
              <button
                onClick={() => { setCurrentTab('intl'); sound.playClick(); }}
                className={`flex items-center gap-1.5 flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  currentTab === 'intl'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                    : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-amber-300'
                }`}
              >
                <span>🌍</span>
                <span>Intl Moments</span>
                <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1 rounded font-mono font-bold">
                  24
                </span>
              </button>

              {/* Hall of Fame */}
              <button
                onClick={() => { setCurrentTab('hof'); sound.playClick(); }}
                className={`flex items-center gap-1.5 flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  currentTab === 'hof'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                    : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-amber-400'
                }`}
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>Hall of Fame</span>
              </button>

              {/* Transfer Market */}
              <button
                onClick={() => { setCurrentTab('market'); sound.playClick(); }}
                className={`flex items-center gap-1.5 flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  currentTab === 'market'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                    : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-emerald-400'
                }`}
              >
                <Store className="w-3.5 h-3.5 text-emerald-400" />
                <span>Market</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1 rounded font-mono font-bold">
                  HOT
                </span>
              </button>

              {/* Squad Builder */}
              <button
                onClick={() => { setCurrentTab('squad'); sound.playClick(); }}
                className={`flex items-center gap-1.5 flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  currentTab === 'squad'
                    ? 'bg-blue-500/20 text-blue-300 border-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.25)]'
                    : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span>Squad</span>
              </button>

              {/* SBCs */}
              <button
                onClick={() => { setCurrentTab('sbcs'); sound.playClick(); }}
                className={`flex items-center gap-1.5 flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  currentTab === 'sbcs'
                    ? 'bg-purple-500/20 text-purple-300 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                    : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span>SBCs</span>
              </button>

              {/* Clash */}
              <button
                onClick={() => { setCurrentTab('clash'); sound.playClick(); }}
                className={`flex items-center gap-1.5 flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  currentTab === 'clash'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.25)]'
                    : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                <Swords className="w-3.5 h-3.5 text-rose-400" />
                <span>Clash</span>
              </button>

              {/* Card Creator */}
              <button
                onClick={() => { setCurrentTab('creator'); sound.playClick(); }}
                className={`flex items-center gap-1.5 flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  currentTab === 'creator'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                    : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                <span>Creator</span>
              </button>

              {/* Futmas */}
              <button
                onClick={() => { setCurrentTab('futmas'); sound.playClick(); }}
                className={`flex items-center gap-1.5 flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  currentTab === 'futmas'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                    : 'bg-slate-900/80 text-rose-300/80 border-slate-800 hover:border-slate-700 hover:text-cyan-300'
                }`}
              >
                <span>❄️</span>
                <span>Futmas</span>
              </button>
            </nav>

            {/* Right Edge Gradient Fade */}
            <div className="absolute right-8 top-0 bottom-0 w-6 bg-gradient-to-l from-[#090d16] to-transparent pointer-events-none z-10" />

            {/* Roll Right Arrow */}
            <button
              onClick={() => handleScrollNav('right')}
              className="p-1.5 rounded-lg bg-slate-900/95 hover:bg-slate-800 text-slate-400 hover:text-amber-300 border border-slate-700/70 shadow-lg flex-shrink-0 z-20 transition-all hover:scale-105 active:scale-95"
              title="Roll tabs right"
              aria-label="Scroll navigation right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Zone 3: Google Login, Coins balance & Audio toggle */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
            {/* Google Account Authentication */}
            <GoogleAuthButton
              coins={coins}
              clubCards={clubCards}
              onAddCoins={handleAddCoins}
            />

            {/* Evolution Points Indicator */}
            <button
              onClick={() => { setCurrentTab('evolution'); sound.playClick(); }}
              title="Evolution Points - Earned via matches, objectives, mini-games & packs! Click to open Evolutions"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 rounded-xl text-emerald-300 shadow-sm select-none transition-all active:scale-95"
            >
              <Dna className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 animate-pulse" />
              <span className="text-xs font-black tabular-nums tracking-wide">{evoPoints.toLocaleString()}</span>
            </button>

            {/* Coins Balance Indicator (Display-only · Earned only via matches, SBCs, objectives & mini-games) */}
            <div
              title="Earn coins by winning matches, completing SBCs, and Daily Objectives!"
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/90 border border-amber-500/40 rounded-xl text-amber-300 shadow-sm select-none"
            >
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-black tabular-nums tracking-wide">{coins.toLocaleString()}</span>
            </div>

            {/* Audio Toggle */}
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl transition-colors"
              title={audioEnabled ? 'Mute sound effects' : 'Enable sound effects'}
            >
              {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar with Rolling Carousel */}
        <div className="md:hidden flex items-center relative pt-2.5 mt-2 border-t border-slate-800/60 gap-1.5">
          <button
            onClick={() => handleScrollMobileNav('left')}
            className="p-1 rounded-md bg-slate-900 text-slate-400 hover:text-white border border-slate-800 flex-shrink-0 z-10"
            aria-label="Scroll mobile tabs left"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <div
            ref={mobileNavRef}
            className="flex items-center overflow-x-auto scroll-smooth gap-2 text-xs font-semibold text-slate-400 scrollbar-none flex-1 py-1 px-1"
          >
            <button
              onClick={() => { setCurrentTab('objectives'); sound.playClick(); }}
              className={`whitespace-nowrap px-2.5 py-1 rounded-lg flex items-center gap-1.5 flex-shrink-0 border ${
                currentTab === 'objectives' 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400 font-bold' 
                  : 'bg-slate-900/60 border-slate-800 text-amber-400'
              }`}
            >
              <Target className="w-3.5 h-3.5 text-amber-400" />
              <span>Objectives</span>
            </button>

            <button
              onClick={() => { setCurrentTab('set_rewards'); sound.playClick(); }}
              className={`whitespace-nowrap px-2.5 py-1 rounded-lg flex items-center gap-1.5 flex-shrink-0 border ${
                currentTab === 'set_rewards' 
                  ? 'bg-amber-500/25 text-amber-200 border-amber-400 font-bold shadow-[0_0_10px_rgba(245,158,11,0.3)]' 
                  : 'bg-slate-900/60 border-amber-500/40 text-amber-300 font-bold'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Set Rewards</span>
            </button>

            <button
              onClick={() => { setCurrentTab('evolution'); sound.playClick(); }}
              className={`whitespace-nowrap px-2.5 py-1 rounded-lg flex items-center gap-1.5 flex-shrink-0 border ${
                currentTab === 'evolution' 
                  ? 'bg-emerald-500/25 text-emerald-200 border-emerald-400 font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
                  : 'bg-slate-900/60 border-emerald-500/40 text-emerald-300 font-bold'
              }`}
            >
              <Dna className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Evolutions</span>
            </button>

            <button
              onClick={() => { setCurrentTab('minigames'); sound.playClick(); }}
              className={`whitespace-nowrap px-2.5 py-1 rounded-lg flex items-center gap-1 flex-shrink-0 border ${
                currentTab === 'minigames' 
                  ? 'bg-amber-500/25 text-amber-200 border-amber-400 font-bold shadow-[0_0_10px_rgba(245,158,11,0.3)]' 
                  : 'bg-slate-900/60 border-amber-500/40 text-amber-300 font-bold'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Mini Games</span>
            </button>

            <button
              onClick={() => { setCurrentTab('club'); sound.playClick(); }}
              className={`whitespace-nowrap px-2.5 py-1 rounded-lg flex items-center gap-1 flex-shrink-0 border ${
                currentTab === 'club' 
                  ? 'bg-emerald-500/25 text-emerald-200 border-emerald-400 font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
                  : 'bg-slate-900/60 border-emerald-500/40 text-emerald-300 font-bold'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>My Club ({clubCards.length})</span>
            </button>

            <button
              onClick={() => { setCurrentTab('packs'); sound.playClick(); }}
              className={`whitespace-nowrap px-2.5 py-1 rounded-lg flex-shrink-0 border ${
                currentTab === 'packs' 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 font-bold' 
                  : 'bg-slate-900/60 border-slate-800 text-slate-300'
              }`}
            >
              Packs
            </button>

            <button
              onClick={() => { setCurrentTab('mypacks'); sound.playClick(); }}
              className={`whitespace-nowrap px-2.5 py-1 rounded-lg flex items-center gap-1 flex-shrink-0 border ${
                currentTab === 'mypacks' 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 font-bold' 
                  : 'bg-slate-900/60 border-slate-800 text-emerald-300/80'
              }`}
            >
              <PackageOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>My Packs ({unopenedPacks.length})</span>
            </button>

            <button
              onClick={() => { setCurrentTab('intl'); sound.playClick(); }}
              className={`whitespace-nowrap px-2.5 py-1 rounded-lg flex items-center gap-1 flex-shrink-0 border ${
                currentTab === 'intl' 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400 font-bold' 
                  : 'bg-slate-900/60 border-slate-800 text-amber-300/80'
              }`}
            >
              <span>🌍</span>
              <span>Intl</span>
            </button>

            <button
              onClick={() => { setCurrentTab('hof'); sound.playClick(); }}
              className={`whitespace-nowrap px-2.5 py-1 rounded-lg flex items-center gap-1 flex-shrink-0 border ${
                currentTab === 'hof' 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400 font-bold' 
                  : 'bg-slate-900/60 border-slate-800 text-amber-400/80'
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>HOF</span>
            </button>

            <button
              onClick={() => { setCurrentTab('market'); sound.playClick(); }}
              className={`whitespace-nowrap px-2.5 py-1 rounded-lg flex items-center gap-1 flex-shrink-0 border ${
                currentTab === 'market' 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 font-bold' 
                  : 'bg-slate-900/60 border-slate-800 text-emerald-400/80'
              }`}
            >
              <Store className="w-3.5 h-3.5 text-emerald-400" />
              <span>Market</span>
            </button>

            <button
              onClick={() => { setCurrentTab('squad'); sound.playClick(); }}
              className={`whitespace-nowrap px-2.5 py-1 rounded-lg flex-shrink-0 border ${
                currentTab === 'squad' 
                  ? 'bg-blue-500/20 text-blue-300 border-blue-400 font-bold' 
                  : 'bg-slate-900/60 border-slate-800 text-slate-300'
              }`}
            >
              Squad
            </button>

            <button
              onClick={() => { setCurrentTab('sbcs'); sound.playClick(); }}
              className={`whitespace-nowrap px-2.5 py-1 rounded-lg flex-shrink-0 border ${
                currentTab === 'sbcs' 
                  ? 'bg-purple-500/20 text-purple-300 border-purple-400 font-bold' 
                  : 'bg-slate-900/60 border-slate-800 text-slate-300'
              }`}
            >
              SBCs
            </button>

            <button
              onClick={() => { setCurrentTab('clash'); sound.playClick(); }}
              className={`whitespace-nowrap px-2.5 py-1 rounded-lg flex-shrink-0 border ${
                currentTab === 'clash' 
                  ? 'bg-rose-500/20 text-rose-300 border-rose-400 font-bold' 
                  : 'bg-slate-900/60 border-slate-800 text-slate-300'
              }`}
            >
              Clash
            </button>

            <button
              onClick={() => { setCurrentTab('creator'); sound.playClick(); }}
              className={`whitespace-nowrap px-2.5 py-1 rounded-lg flex-shrink-0 border ${
                currentTab === 'creator' 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400 font-bold' 
                  : 'bg-slate-900/60 border-slate-800 text-slate-300'
              }`}
            >
              Creator
            </button>
          </div>

          <button
            onClick={() => handleScrollMobileNav('right')}
            className="p-1 rounded-md bg-slate-900 text-slate-400 hover:text-white border border-slate-800 flex-shrink-0 z-10"
            aria-label="Scroll mobile tabs right"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Global Interactive Announcement Ticker when not in Objectives */}
      {currentTab !== 'objectives' && (
        <div className="bg-gradient-to-r from-amber-500/20 via-indigo-950/60 to-amber-500/20 border-b border-amber-500/30 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-300 font-semibold truncate">
              <span className="flex h-2 w-2 relative flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="truncate">
                🎯 <strong>Daily Objectives Active:</strong> Complete 3 dynamic tasks to receive <strong>+2,500 Coins & Daily Bonus Pack!</strong>
              </span>
            </div>
            <button
              onClick={() => { setCurrentTab('objectives'); sound.playClick(); }}
              className="flex-shrink-0 px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-lg text-xs transition-transform active:scale-95 flex items-center gap-1 shadow-sm"
            >
              <span>View Objectives</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6">
        {currentTab === 'intl' && (
          <InternationalMomentsHub
            cards={allCardsPool}
            onNavigateToPacks={(filter) => {
              setCurrentTab('packs');
              sound.playClick();
            }}
            onNavigateToSBCs={(category) => {
              setCurrentTab('sbcs');
              sound.playClick();
            }}
            onNavigateToClash={() => {
              setCurrentTab('clash');
              sound.playClick();
            }}
            onAddCardToSquad={(card) => {
              handleAddCardsToClub([card]);
              setCurrentTab('squad');
              sound.playClick();
            }}
          />
        )}

        {currentTab === 'hof' && (
          <HallOfFameHub
            onNavigateToPacks={() => {
              setCurrentTab('packs');
              sound.playClick();
            }}
            onNavigateToSBCs={() => {
              setCurrentTab('sbcs');
              sound.playClick();
            }}
            onNavigateToClash={() => {
              setCurrentTab('clash');
              sound.playClick();
            }}
          />
        )}

        {currentTab === 'futmas' && (
          <FutmasHub
            coins={coins}
            clubCards={clubCards}
            onOpenPackStore={(cat) => {
              setCurrentTab('packs');
              sound.playClick();
            }}
            onOpenSBCs={(cat) => {
              setCurrentTab('sbcs');
              sound.playClick();
            }}
            onClaimHolidayGift={(giftCoins, giftPackName) => {
              setCoins((prev) => {
                const updated = prev + giftCoins;
                safeSetItem(STORAGE_KEYS.COINS, updated.toString());
                return updated;
              });
              setHasClaimedGift(true);
              safeSetItem('apex_fut_futmas_gift_v1', 'true');
              const futmasPool = allCardsPool.filter(c => c.program === 'Futmas' || c.rarity === 'futmas');
              const randomThree = [...futmasPool].sort(() => 0.5 - Math.random()).slice(0, 3);
              if (randomThree.length > 0) {
                handleAddCardsToClub(randomThree);
              }
            }}
            hasClaimedGift={hasClaimedGift}
          />
        )}

        {currentTab === 'market' && (
          <TransferMarket
            coins={coins}
            clubCards={clubCards}
            onDeductCoins={handleDeductCoins}
            onAddCoins={handleAddCoins}
            onAddCardsToClub={handleAddCardsToClub}
            onRemoveCardFromClub={handleRemoveCardFromClub}
            allCardsPool={allCardsPool}
            onNavigateToMiniGames={() => {
              setCurrentTab('minigames');
              sound.playClick();
            }}
            onNavigateToMatchSimulator={() => {
              setCurrentTab('clash');
              sound.playClick();
            }}
            onNavigateToObjectives={() => {
              setCurrentTab('objectives');
              sound.playClick();
            }}
          />
        )}

        {currentTab === 'set_rewards' && (
          <SetRewardsHub
            clubCards={clubCards}
            onAddCardsToClub={handleAddCardsToClub}
            onAddCoins={handleAddCoins}
            onNavigateToStore={(_filter?: string) => {
              setCurrentTab('packs');
              sound.playClick();
            }}
            onNavigateToMarket={() => {
              setCurrentTab('market');
              sound.playClick();
            }}
          />
        )}

        {currentTab === 'evolution' && (
          <EvolutionHub
            evoPoints={evoPoints}
            onDeductEvoPoints={handleDeductEvoPoints}
            onAddEvoPoints={handleAddEvoPoints}
            currentStageIndex={sakaStageIndex}
            currentStats={sakaStats}
            onUpdateStatsAndStage={handleUpdateSakaStatsAndStage}
            clubCards={clubCards}
            onNavigateToTab={(tab) => {
              setCurrentTab(tab);
              sound.playClick();
            }}
          />
        )}

        {currentTab === 'minigames' && (
          <MiniGamesHub
            coins={coins}
            clubCards={clubCards}
            allCardsPool={allCardsPool}
            onAddCoins={handleAddCoins}
            onAddCardsToClub={handleAddCardsToClub}
            onAddUnopenedPack={handleAddUnopenedPack}
            onMiniGamePlayed={handleIncrementMiniGamesPlayed}
            onNavigateToMyPacks={() => {
              setCurrentTab('mypacks');
              sound.playClick();
            }}
          />
        )}

        {currentTab === 'mypacks' && (
          <MyPacksHub
            unopenedPacks={unopenedPacks}
            allCardsPool={allCardsPool}
            clubCards={clubCards}
            onAddCoins={handleAddCoins}
            onOpenRewardPack={handleOpenRewardPack}
            onAddCardsToClub={handleAddCardsToClub}
            onQuickSellCard={handleQuickSellCard}
            onNavigateToMiniGames={(game) => {
              setCurrentTab('minigames');
              sound.playClick();
            }}
            onNavigateToStore={() => {
              setCurrentTab('packs');
              sound.playClick();
            }}
          />
        )}

        {currentTab === 'packs' && (
          <PackOpening
            coins={coins}
            allCardsPool={allCardsPool}
            userCreatedCards={userCreatedCards}
            customPacks={customPacks}
            onCreatePack={handleCreatePack}
            onDeletePack={handleDeletePack}
            onDeductCoins={handleDeductCoins}
            onAddCoins={handleAddCoins}
            onAddCardsToClub={handleAddCardsToClub}
            onQuickSellCard={handleQuickSellCard}
            onPackOpened={handleIncrementPacksOpened}
            onOpenCardCreator={() => {
              setCurrentTab('creator');
              sound.playClick();
            }}
          />
        )}

        {currentTab === 'creator' && (
          <CardCreator
            userCreatedCards={userCreatedCards}
            onSaveCard={handleSaveCustomCard}
            onDeleteCard={handleDeleteCustomCard}
          />
        )}

        {currentTab === 'squad' && (
          <SquadBuilder
            clubCards={clubCards}
            formationId={formationId}
            onChangeFormation={setFormationId}
            activeSquadSlots={activeSquadSlots}
            onUpdateSquadSlots={setActiveSquadSlots}
            onNavigateToMatch={() => {
              setCurrentTab('clash');
              sound.playClick();
            }}
          />
        )}

        {currentTab === 'sbcs' && (
          <SBCView
            challenges={challenges}
            clubCards={clubCards}
            onCompleteSBC={handleCompleteSBC}
            onOpenPackNow={() => {
              setCurrentTab('packs');
              sound.playClick();
            }}
          />
        )}

        {currentTab === 'clash' && (
          <MatchSimulator
            userSquadCards={userPitchCards}
            userSquadRating={squadStats.averageRating}
            userSquadChemistry={squadStats.totalChemistry}
            onAwardMatchPrize={handleAwardMatchPrize}
            onNavigateToSquadBuilder={() => {
              setCurrentTab('squad');
              sound.playClick();
            }}
          />
        )}

        {currentTab === 'club' && (
          <ClubGallery
            clubCards={clubCards}
            onQuickSellCard={handleQuickSellCard}
            onOpenCardCreator={() => {
              setCurrentTab('creator');
              sound.playClick();
            }}
          />
        )}

        {currentTab === 'objectives' && (
          <DailyObjectives
            coins={coins}
            onAddCoins={handleAddCoins}
            onAddUnopenedPack={handleAddUnopenedPack}
            onAddCardsToClub={handleAddCardsToClub}
            dailyBonusPack={PACKS.find((p) => p.id === 'pack-daily-bonus') || PACKS[0]}
            onNavigateToTab={(tab) => {
              setCurrentTab(tab);
              sound.playClick();
            }}
            packsOpenedToday={dailyStats.packsOpened}
            matchesWonToday={dailyStats.matchesWon}
            sbcsSubmittedToday={dailyStats.sbcsSubmitted}
            miniGamesPlayedToday={dailyStats.miniGamesPlayed}
            marketTradesToday={dailyStats.marketTrades}
            clubCards={clubCards}
            onAddEvoPoints={handleAddEvoPoints}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 px-4 text-center text-xs text-slate-500">
        <p>Apex Kick FUT Studio · Custom Soccer Card Pack Openings, SBCs & Tactical Dream Squads</p>
      </footer>
    </div>
  );
}
