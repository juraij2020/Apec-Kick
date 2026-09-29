/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { SoccerCard, SBCChallenge, PackDefinition } from './types/card';
import { INITIAL_CUSTOM_CARDS, BASE_SOCCER_CARDS, HANEEN_MUSTAFA_CARD } from './data/defaultCards';
import { INITIAL_SBCS } from './data/sbcs';
import { PACKS } from './data/packs';
import { calculateSquadChemistry } from './utils/chemistry';
import { FORMATIONS } from './data/formations';
import { sound } from './utils/audio';

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
import { StoredRewardPack } from './types/card';
import { INITIAL_REWARD_PACKS } from './data/rewardPacks';

import { Volume2, VolumeX, Coins, Sparkles, PlusCircle, Crown, Globe, Store, Gamepad2, PackageOpen } from 'lucide-react';
import { safeSetItem, safeGetItem, sanitizeCardsListForStorage } from './utils/safeStorage';

type NavTab = 'intl' | 'hof' | 'market' | 'minigames' | 'packs' | 'creator' | 'squad' | 'sbcs' | 'clash' | 'mypacks' | 'club' | 'futmas';

const STORAGE_KEYS = {
  COINS: 'apex_fut_coins_v2',
  USER_CARDS: 'apex_fut_user_cards_v2',
  CLUB_CARDS: 'apex_fut_club_cards_v2',
  SQUAD_SLOTS: 'apex_fut_squad_slots_v2',
  FORMATION: 'apex_fut_formation_v1',
  SBCS: 'apex_fut_sbcs_v2',
  AUDIO: 'apex_fut_audio_v1',
  CUSTOM_PACKS: 'apex_fut_custom_packs_v1',
  UNOPENED_PACKS: 'apex_fut_my_unopened_packs_v1',
};

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('intl');

  // Coins State (starts with 50,000 so user can test Hall of Fame packs immediately)
  const [coins, setCoins] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COINS);
    return saved !== null ? parseInt(saved, 10) : 50000;
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

  // Persist State safely with quota management
  useEffect(() => {
    safeSetItem(STORAGE_KEYS.COINS, coins.toString());
  }, [coins]);

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

  // Combined card pool for packs (Standard cards + All user-created custom cards, deduplicated)
  const allCardsPool = useMemo(() => {
    const cardMap = new Map<string, SoccerCard>();
    BASE_SOCCER_CARDS.forEach((c) => cardMap.set(c.id, c));
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
    sourceType: 'high_low' | 'guess_who' | 'daily_objective' | 'bonus' | 'sbc'
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
    setUnopenedPacks((prev) => {
      const updated = prev.filter((p) => p.instanceId !== instanceId);
      safeSetItem(STORAGE_KEYS.UNOPENED_PACKS, JSON.stringify(updated));
      return updated;
    });
  };

  // Free coin grant if user is out of funds
  const handleClaimDailyGift = () => {
    setCoins((prev) => prev + 10000);
    sound.playGoalCheer();
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-black">
      {/* Strict Top Bar Contract: 3 zones */}
      <header className="sticky top-0 z-40 bg-[#090d16]/95 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Zone 1: Single text wordmark */}
          <div
            onClick={() => { setCurrentTab('packs'); sound.playClick(); }}
            className="cursor-pointer text-lg font-black tracking-tight text-white hover:text-emerald-400 transition-colors flex items-center gap-2"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span>APEX KICK</span>
          </div>

          {/* Zone 2: 4-6 text navigation links */}
          <nav className="hidden md:flex items-center gap-5 text-sm font-semibold text-slate-400">
            <button
              onClick={() => { setCurrentTab('intl'); sound.playClick(); }}
              className={`hover:text-amber-300 transition-colors relative pb-0.5 flex items-center gap-1.5 ${
                currentTab === 'intl' ? 'text-amber-400 border-b-2 border-amber-400 font-bold' : 'text-amber-300/90'
              }`}
            >
              <span>🌍</span>
              <span>Intl Moments</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1 py-0.2 rounded font-mono font-bold">24</span>
            </button>
            <button
              onClick={() => { setCurrentTab('hof'); sound.playClick(); }}
              className={`hover:text-amber-300 transition-colors relative pb-0.5 flex items-center gap-1.5 ${
                currentTab === 'hof' ? 'text-amber-300 border-b-2 border-amber-400 font-bold' : 'text-amber-400/80'
              }`}
            >
              <Crown className="w-4 h-4 text-amber-400" />
              <span>Hall of Fame</span>
            </button>
            <button
              onClick={() => { setCurrentTab('market'); sound.playClick(); }}
              className={`hover:text-emerald-300 transition-colors relative pb-0.5 flex items-center gap-1.5 ${
                currentTab === 'market' ? 'text-emerald-400 border-b-2 border-emerald-400 font-bold' : 'text-emerald-400/90'
              }`}
            >
              <Store className="w-4 h-4 text-emerald-400" />
              <span>Transfer Market</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1 py-0.2 rounded font-mono font-bold">HOT</span>
            </button>
            <button
              onClick={() => { setCurrentTab('minigames'); sound.playClick(); }}
              className={`hover:text-amber-300 transition-colors relative pb-0.5 flex items-center gap-1.5 ${
                currentTab === 'minigames' ? 'text-amber-300 border-b-2 border-amber-400 font-bold' : 'text-amber-400/80'
              }`}
            >
              <Gamepad2 className="w-4 h-4 text-amber-400" />
              <span>Mini-Games</span>
            </button>
            <button
              onClick={() => { setCurrentTab('packs'); sound.playClick(); }}
              className={`hover:text-white transition-colors relative pb-0.5 ${
                currentTab === 'packs' ? 'text-white border-b-2 border-emerald-400 font-bold' : ''
              }`}
            >
              Open Packs
            </button>
            <button
              onClick={() => { setCurrentTab('squad'); sound.playClick(); }}
              className={`hover:text-white transition-colors relative pb-0.5 ${
                currentTab === 'squad' ? 'text-white border-b-2 border-emerald-400 font-bold' : ''
              }`}
            >
              Squad Builder
            </button>
            <button
              onClick={() => { setCurrentTab('sbcs'); sound.playClick(); }}
              className={`hover:text-white transition-colors relative pb-0.5 ${
                currentTab === 'sbcs' ? 'text-white border-b-2 border-emerald-400 font-bold' : ''
              }`}
            >
              SBC Challenges
            </button>
            <button
              onClick={() => { setCurrentTab('clash'); sound.playClick(); }}
              className={`hover:text-white transition-colors relative pb-0.5 ${
                currentTab === 'clash' ? 'text-white border-b-2 border-emerald-400 font-bold' : ''
              }`}
            >
              Match Clash
            </button>
            <button
              onClick={() => { setCurrentTab('creator'); sound.playClick(); }}
              className={`hover:text-white transition-colors relative pb-0.5 ${
                currentTab === 'creator' ? 'text-white border-b-2 border-emerald-400 font-bold' : ''
              }`}
            >
              Card Creator
            </button>
            <button
              onClick={() => { setCurrentTab('mypacks'); sound.playClick(); }}
              className={`hover:text-emerald-300 transition-colors relative pb-0.5 flex items-center gap-1.5 ${
                currentTab === 'mypacks' ? 'text-emerald-300 border-b-2 border-emerald-400 font-bold' : 'text-slate-300'
              }`}
            >
              <PackageOpen className="w-4 h-4 text-emerald-400" />
              <span>My Packs</span>
              {unopenedPacks.length > 0 && (
                <span className="text-[10px] bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded-full font-mono font-black animate-pulse">
                  {unopenedPacks.length}
                </span>
              )}
            </button>
            <button
              onClick={() => { setCurrentTab('club'); sound.playClick(); }}
              className={`hover:text-white transition-colors relative pb-0.5 ${
                currentTab === 'club' ? 'text-white border-b-2 border-emerald-400 font-bold' : ''
              }`}
            >
              My Club
            </button>
            <button
              onClick={() => { setCurrentTab('futmas'); sound.playClick(); }}
              className={`hover:text-cyan-300 transition-colors relative pb-0.5 flex items-center gap-1 text-xs opacity-75 ${
                currentTab === 'futmas' ? 'text-cyan-300 border-b-2 border-cyan-400 font-bold opacity-100' : 'text-rose-300'
              }`}
            >
              <span>❄️</span>
              <span>Futmas</span>
            </button>
          </nav>

          {/* Zone 3: 1-2 primary actions */}
          <div className="flex items-center gap-3">
            {/* Coins indicator & Quick Grant Button */}
            <button
              onClick={handleClaimDailyGift}
              title="Click to claim +10,000 Free Coins!"
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-amber-500/40 rounded-xl text-amber-300 transition-colors shadow-sm"
            >
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-black tabular-nums">{coins.toLocaleString()}</span>
              <PlusCircle className="w-3.5 h-3.5 text-amber-400 opacity-60" />
            </button>

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

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-between overflow-x-auto pt-3 mt-2 border-t border-slate-800/60 gap-4 text-xs font-semibold text-slate-400 scrollbar-none">
          <button
            onClick={() => { setCurrentTab('intl'); sound.playClick(); }}
            className={`whitespace-nowrap pb-1 flex items-center gap-1 ${currentTab === 'intl' ? 'text-amber-400 font-bold border-b border-amber-400' : 'text-amber-300/80'}`}
          >
            <span>🌍</span>
            <span>Intl Moments</span>
          </button>
          <button
            onClick={() => { setCurrentTab('hof'); sound.playClick(); }}
            className={`whitespace-nowrap pb-1 flex items-center gap-1 ${currentTab === 'hof' ? 'text-amber-300 font-bold' : 'text-amber-400/80'}`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>HOF</span>
          </button>
          <button
            onClick={() => { setCurrentTab('market'); sound.playClick(); }}
            className={`whitespace-nowrap pb-1 flex items-center gap-1 ${currentTab === 'market' ? 'text-emerald-400 font-bold border-b border-emerald-400' : 'text-emerald-400/80'}`}
          >
            <Store className="w-3.5 h-3.5 text-emerald-400" />
            <span>Market</span>
          </button>
          <button
            onClick={() => { setCurrentTab('minigames'); sound.playClick(); }}
            className={`whitespace-nowrap pb-1 flex items-center gap-1 ${currentTab === 'minigames' ? 'text-amber-300 font-bold' : 'text-amber-400/80'}`}
          >
            <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Games</span>
          </button>
          <button
            onClick={() => { setCurrentTab('packs'); sound.playClick(); }}
            className={`whitespace-nowrap pb-1 ${currentTab === 'packs' ? 'text-emerald-400 font-bold' : ''}`}
          >
            Packs
          </button>
          <button
            onClick={() => { setCurrentTab('squad'); sound.playClick(); }}
            className={`whitespace-nowrap pb-1 ${currentTab === 'squad' ? 'text-emerald-400 font-bold' : ''}`}
          >
            Squad
          </button>
          <button
            onClick={() => { setCurrentTab('sbcs'); sound.playClick(); }}
            className={`whitespace-nowrap pb-1 ${currentTab === 'sbcs' ? 'text-emerald-400 font-bold' : ''}`}
          >
            SBCs
          </button>
          <button
            onClick={() => { setCurrentTab('clash'); sound.playClick(); }}
            className={`whitespace-nowrap pb-1 ${currentTab === 'clash' ? 'text-emerald-400 font-bold' : ''}`}
          >
            Clash
          </button>
          <button
            onClick={() => { setCurrentTab('creator'); sound.playClick(); }}
            className={`whitespace-nowrap pb-1 ${currentTab === 'creator' ? 'text-emerald-400 font-bold' : ''}`}
          >
            Creator
          </button>
          <button
            onClick={() => { setCurrentTab('mypacks'); sound.playClick(); }}
            className={`whitespace-nowrap pb-1 flex items-center gap-1 ${
              currentTab === 'mypacks' ? 'text-emerald-400 font-bold border-b border-emerald-400' : 'text-emerald-300/80'
            }`}
          >
            <PackageOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>Packs ({unopenedPacks.length})</span>
          </button>
          <button
            onClick={() => { setCurrentTab('club'); sound.playClick(); }}
            className={`whitespace-nowrap pb-1 ${currentTab === 'club' ? 'text-emerald-400 font-bold' : ''}`}
          >
            Club ({clubCards.length})
          </button>
        </div>
      </header>

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
          />
        )}

        {currentTab === 'minigames' && (
          <MiniGamesHub
            coins={coins}
            allCardsPool={allCardsPool}
            onAddCoins={handleAddCoins}
            onAddCardsToClub={handleAddCardsToClub}
            onAddUnopenedPack={handleAddUnopenedPack}
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
            onAddCardsToClub={handleAddCardsToClub}
            onQuickSellCard={handleQuickSellCard}
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
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 px-4 text-center text-xs text-slate-500">
        <p>Apex Kick FUT Studio · Custom Soccer Card Pack Openings, SBCs & Tactical Dream Squads</p>
      </footer>
    </div>
  );
}
