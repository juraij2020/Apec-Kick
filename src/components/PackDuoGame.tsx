import React, { useState, useEffect, useMemo, useRef } from 'react';
import { SoccerCard, PackDefinition, PackDuoChecklist, PackDuoOpponent, PackDuoCategoryScore, Position } from '../types/card';
import { DUO_SHOP_PACKS, DuoShopItem } from '../data/rewardPacks';
import { CardItem } from './CardItem';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { safeSetItem } from '../utils/safeStorage';
import {
  Swords,
  Bot,
  Users,
  Sparkles,
  CheckCircle2,
  XCircle,
  PackageOpen,
  Trophy,
  RotateCcw,
  Zap,
  ShoppingBag,
  Shield,
  Layers,
  Flag,
  Globe,
  Award,
  ChevronRight,
  ArrowRight,
  Flame,
  Check,
  Coins,
  RefreshCw,
} from 'lucide-react';

interface PackDuoGameProps {
  allCardsPool: SoccerCard[];
  onAddUnopenedPack: (pack: PackDefinition, sourceTitle: string, sourceType: 'high_low' | 'guess_who' | 'daily_objective' | 'bonus' | 'sbc' | 'pack_duo') => void;
  onNavigateToMyPacks?: () => void;
}

type DuoPhase = 'lobby' | 'matchmaking' | 'opening' | 'squad' | 'showdown';

const OPPONENT_PERSONAS: PackDuoOpponent[] = [
  { id: 'ai-1', name: 'Tactical_AI_99', avatar: '🤖', type: 'ai', skillRating: 1820, country: 'Germany', tag: 'Apex Bot' },
  { id: 'ai-2', name: 'Guardiola_Sim', avatar: '🧠', type: 'ai', skillRating: 1910, country: 'Spain', tag: 'Mastermind AI' },
  { id: 'ai-3', name: 'Klopp_Gegenpress', avatar: '⚡', type: 'ai', skillRating: 1850, country: 'England', tag: 'High Intensity' },
  { id: 'usr-1', name: '@SambaKing_BR', avatar: '🇧🇷', type: 'online', skillRating: 1875, country: 'Brazil', tag: 'Online Rival' },
  { id: 'usr-2', name: '@Madridista_Prime', avatar: '🇪🇸', type: 'online', skillRating: 1940, country: 'Spain', tag: 'Online Rival' },
  { id: 'usr-3', name: '@FutKing_London', avatar: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', type: 'online', skillRating: 1830, country: 'England', tag: 'Online Rival' },
  { id: 'usr-4', name: '@Azzurri_Legend', avatar: '🇮🇹', type: 'online', skillRating: 1890, country: 'Italy', tag: 'Online Rival' },
  { id: 'usr-5', name: '@Parisian_Skillz', avatar: '🇫🇷', type: 'online', skillRating: 1915, country: 'France', tag: 'Online Rival' },
];

const TARGET_CLUBS = ['Real Madrid', 'FC Barcelona', 'Manchester City', 'Bayern Munich', 'Liverpool', 'Paris Saint-Germain', 'Chelsea', 'Juventus', 'Arsenal'];
const TARGET_LEAGUES = ['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1'];
const TARGET_NATIONS = ['France', 'Brazil', 'Argentina', 'England', 'Spain', 'Germany', 'Portugal', 'Netherlands'];

function generateRandomChecklists(): PackDuoChecklist[] {
  const club = TARGET_CLUBS[Math.floor(Math.random() * TARGET_CLUBS.length)];
  const league = TARGET_LEAGUES[Math.floor(Math.random() * TARGET_LEAGUES.length)];
  const nation = TARGET_NATIONS[Math.floor(Math.random() * TARGET_NATIONS.length)];

  return [
    {
      id: 'c1',
      title: `${club} 87+ Star`,
      description: `Pull an 87+ rated player from ${club}`,
      type: 'club',
      targetValue: club,
      minRating: 87,
      completed: false,
    },
    {
      id: 'c2',
      title: `${league} 88+ Anchor`,
      description: `Pull an 88+ rated player from ${league}`,
      type: 'league',
      targetValue: league,
      minRating: 88,
      completed: false,
    },
    {
      id: 'c3',
      title: `Special Promo 86+`,
      description: `Pull an 86+ Throwback, Summer Transfers, or Street Kings item`,
      type: 'program',
      targetValue: 'promo',
      minRating: 86,
      completed: false,
    },
    {
      id: 'c4',
      title: `${nation} 86+ Talent`,
      description: `Pull an 86+ rated player from ${nation}`,
      type: 'nation',
      targetValue: nation,
      minRating: 86,
      completed: false,
    },
    {
      id: 'c5',
      title: `Apex Walkout 92+`,
      description: `Pull any 92+ Apex Legend, Icon, or Walkout masterclass`,
      type: 'apex',
      targetValue: 'apex',
      minRating: 92,
      completed: false,
    },
  ];
}

const FORMATION_SLOTS: { id: string; pos: Position; label: string }[] = [
  { id: 'slot_gk', pos: 'GK', label: 'GK' },
  { id: 'slot_lb', pos: 'LB', label: 'LB' },
  { id: 'slot_cb1', pos: 'CB', label: 'CB' },
  { id: 'slot_cb2', pos: 'CB', label: 'CB' },
  { id: 'slot_rb', pos: 'RB', label: 'RB' },
  { id: 'slot_cm1', pos: 'CM', label: 'CM' },
  { id: 'slot_cdm', pos: 'CDM', label: 'CDM' },
  { id: 'slot_cm2', pos: 'CM', label: 'CM' },
  { id: 'slot_lw', pos: 'LW', label: 'LW' },
  { id: 'slot_st', pos: 'ST', label: 'ST' },
  { id: 'slot_rw', pos: 'RW', label: 'RW' },
];

export const PackDuoGame: React.FC<PackDuoGameProps> = ({
  allCardsPool,
  onAddUnopenedPack,
  onNavigateToMyPacks,
}) => {
  // Duo Points State
  const [duoPoints, setDuoPoints] = useState<number>(() => {
    const saved = localStorage.getItem('apex_fut_duo_points_v1');
    return saved !== null ? parseInt(saved, 10) : 150;
  });

  const [activeSubTab, setActiveSubTab] = useState<'game' | 'shop'>('game');
  const [phase, setPhase] = useState<DuoPhase>('lobby');
  const [selectedOpponent, setSelectedOpponent] = useState<PackDuoOpponent | null>(null);

  // Match State
  const [packsRemaining, setPacksRemaining] = useState<number>(50);
  const [pulledCards, setPulledCards] = useState<SoccerCard[]>([]);
  const [recentPulls, setRecentPulls] = useState<SoccerCard[]>([]);
  const [checklists, setChecklists] = useState<PackDuoChecklist[]>([]);
  
  // Opponent Simulation State
  const [oppChecklistsCompleted, setOppChecklistsCompleted] = useState<number>(0);
  const [oppPacksRemaining, setOppPacksRemaining] = useState<number>(50);
  const [oppPulledCards, setOppPulledCards] = useState<SoccerCard[]>([]);

  // Squad State
  const [draftSquad, setDraftSquad] = useState<{ [slotId: string]: SoccerCard | null }>({});
  const [oppDraftSquad, setOppDraftSquad] = useState<{ [slotId: string]: SoccerCard | null }>({});
  const [selectedSlotForSwap, setSelectedSlotForSwap] = useState<string | null>(null);

  // Showdown Comparison State
  const [showdownScores, setShowdownScores] = useState<PackDuoCategoryScore[]>([]);
  const [showdownStage, setShowdownStage] = useState<number>(0);
  const [matchWinner, setMatchWinner] = useState<'user' | 'opponent' | 'tie' | null>(null);
  const [duoPointsEarned, setDuoPointsEarned] = useState<number>(0);
  const [shopSuccessMsg, setShopSuccessMsg] = useState<string | null>(null);

  // Sound ref
  const audioUnlockedRef = useRef<boolean>(true);

  // Save duo points to storage
  const updateDuoPoints = (amount: number) => {
    setDuoPoints((prev) => {
      const next = Math.max(0, prev + amount);
      safeSetItem('apex_fut_duo_points_v1', next.toString());
      return next;
    });
  };

  // Start new match
  const startMatch = (type: 'ai' | 'online') => {
    sound.playClick();
    const available = OPPONENT_PERSONAS.filter((p) => p.type === type);
    const chosen = available[Math.floor(Math.random() * available.length)] || OPPONENT_PERSONAS[0];
    setSelectedOpponent(chosen);
    setChecklists(generateRandomChecklists());
    setPacksRemaining(50);
    setOppPacksRemaining(50);
    setPulledCards([]);
    setRecentPulls([]);
    setOppPulledCards([]);
    setOppChecklistsCompleted(0);
    setDraftSquad({});
    setOppDraftSquad({});
    setSelectedSlotForSwap(null);
    setShowdownScores([]);
    setShowdownStage(0);
    setMatchWinner(null);
    setDuoPointsEarned(0);

    if (type === 'online') {
      setPhase('matchmaking');
      setTimeout(() => {
        setPhase('opening');
        sound.playWhistle();
      }, 2200);
    } else {
      setPhase('opening');
      sound.playWhistle();
    }
  };

  // Inspect cards for checklists
  const evaluateChecklists = (newCards: SoccerCard[], currentList: PackDuoChecklist[]): PackDuoChecklist[] => {
    let changed = false;
    const updated = currentList.map((ch) => {
      if (ch.completed) return ch;

      const matchingCard = newCards.find((c) => {
        if (!c || c.rating < ch.minRating) return false;
        if (ch.type === 'club') {
          return c.club.toLowerCase().includes(ch.targetValue.toLowerCase());
        }
        if (ch.type === 'league') {
          return c.league.toLowerCase().includes(ch.targetValue.toLowerCase());
        }
        if (ch.type === 'program') {
          return c.program === 'Throwback' || c.program === 'Summer Transfers' || c.program === 'Summer Premium' || c.program === 'Street Kings' || c.rarity === 'throwback' || c.rarity === 'street_kings';
        }
        if (ch.type === 'nation') {
          return c.nation.toLowerCase().includes(ch.targetValue.toLowerCase());
        }
        if (ch.type === 'apex') {
          return c.rating >= 92;
        }
        return false;
      });

      if (matchingCard) {
        changed = true;
        return {
          ...ch,
          completed: true,
          completedByCard: matchingCard,
        };
      }
      return ch;
    });

    if (changed) {
      sound.playSuccess();
    }
    return updated;
  };

  // Rip packs logic
  const handleRipPacks = (countToRip: number) => {
    if (packsRemaining <= 0) return;
    const actualCount = Math.min(countToRip, packsRemaining);
    sound.playPackRip();

    // Pull random cards from allCardsPool
    const pool = allCardsPool.length > 0 ? allCardsPool : [];
    const newPulls: SoccerCard[] = [];
    for (let i = 0; i < actualCount * 4; i++) {
      const card = pool[Math.floor(Math.random() * pool.length)];
      if (card) {
        newPulls.push({
          ...card,
          id: `${card.id}_draft_${Date.now()}_${i}`,
        });
      }
    }

    setPulledCards((prev) => [...prev, ...newPulls]);
    setRecentPulls(newPulls.slice(-8));
    setPacksRemaining((prev) => Math.max(0, prev - actualCount));

    // Evaluate checklists
    setChecklists((prev) => evaluateChecklists(newPulls, prev));

    // Opponent concurrent rip simulation
    const oppRipCount = actualCount;
    setOppPacksRemaining((prev) => Math.max(0, prev - oppRipCount));
    
    // Simulate opponent pulls
    const oppNewPulls: SoccerCard[] = [];
    for (let i = 0; i < oppRipCount * 4; i++) {
      const card = pool[Math.floor(Math.random() * pool.length)];
      if (card) oppNewPulls.push(card);
    }
    setOppPulledCards((prev) => [...prev, ...oppNewPulls]);

    // Random chance opponent completes a checklist
    if (Math.random() < 0.22 && oppChecklistsCompleted < 5) {
      setOppChecklistsCompleted((prev) => Math.min(5, prev + 1));
    }
  };

  // Auto-build best 11 squad from draft pulls
  const autoBuildSquad = () => {
    sound.playClick();
    if (pulledCards.length === 0) return;

    // Sort by rating descending
    const sorted = [...pulledCards].sort((a, b) => b.rating - a.rating);
    const usedIds = new Set<string>();
    const newSquad: { [slotId: string]: SoccerCard | null } = {};

    FORMATION_SLOTS.forEach((slot) => {
      // Find matching position candidate first
      const exactCandidate = sorted.find((c) => !usedIds.has(c.id) && c.position === slot.pos);
      if (exactCandidate) {
        newSquad[slot.id] = exactCandidate;
        usedIds.add(exactCandidate.id);
      } else {
        // Fallback to highest rating player
        const highestCandidate = sorted.find((c) => !usedIds.has(c.id));
        if (highestCandidate) {
          newSquad[slot.id] = highestCandidate;
          usedIds.add(highestCandidate.id);
        } else {
          newSquad[slot.id] = null;
        }
      }
    });

    setDraftSquad(newSquad);
  };

  // Calculate squad metrics
  const calculateSquadMetrics = (squad: { [slotId: string]: SoccerCard | null }) => {
    const filledCards = Object.values(squad).filter((c): c is SoccerCard => c !== null);
    if (filledCards.length === 0) {
      return { rating: 0, chemistry: 0, leagues: 0, nations: 0 };
    }

    const totalRating = filledCards.reduce((acc, c) => acc + c.rating, 0);
    const avgRating = Math.round(totalRating / filledCards.length);

    // Chemistry estimation (position matching + league synergy + nation synergy)
    let chem = 0;
    const leagueCounts: { [l: string]: number } = {};
    const nationCounts: { [n: string]: number } = {};

    FORMATION_SLOTS.forEach((slot) => {
      const card = squad[slot.id];
      if (card) {
        if (card.position === slot.pos) chem += 1;
        leagueCounts[card.league] = (leagueCounts[card.league] || 0) + 1;
        nationCounts[card.nation] = (nationCounts[card.nation] || 0) + 1;
      }
    });

    Object.values(leagueCounts).forEach((cnt) => {
      if (cnt >= 3) chem += 2;
      if (cnt >= 5) chem += 2;
      if (cnt >= 8) chem += 3;
    });

    Object.values(nationCounts).forEach((cnt) => {
      if (cnt >= 2) chem += 1;
      if (cnt >= 4) chem += 2;
      if (cnt >= 6) chem += 3;
    });

    chem = Math.min(33, Math.max(8, chem));
    const leaguesCount = Object.keys(leagueCounts).length;
    const nationsCount = Object.keys(nationCounts).length;

    return {
      rating: avgRating,
      chemistry: chem,
      leagues: leaguesCount,
      nations: nationsCount,
    };
  };

  // Move to Squad Building phase
  const handleProceedToSquad = () => {
    sound.playClick();
    setPhase('squad');
    // Pre-populate squad with best cards
    autoBuildSquad();

    // Generate opponent squad
    const oppCards = oppPulledCards.length > 15 ? oppPulledCards : allCardsPool;
    const sortedOpp = [...oppCards].sort((a, b) => b.rating - a.rating);
    const oppSquadObj: { [slotId: string]: SoccerCard } = {};
    const oppUsed = new Set<string>();

    FORMATION_SLOTS.forEach((slot) => {
      const match = sortedOpp.find((c) => !oppUsed.has(c.id) && c.position === slot.pos) || sortedOpp.find((c) => !oppUsed.has(c.id));
      if (match) {
        oppSquadObj[slot.id] = match;
        oppUsed.add(match.id);
      }
    });
    setOppDraftSquad(oppSquadObj);
  };

  // Enter Head-to-Head Showdown
  const handleEnterShowdown = () => {
    sound.playWhistle();
    setPhase('showdown');

    const userMetrics = calculateSquadMetrics(draftSquad);
    const oppMetrics = calculateSquadMetrics(oppDraftSquad);
    const userCompletedChecklists = checklists.filter((c) => c.completed).length;

    // Categories
    const categories: PackDuoCategoryScore[] = [
      {
        category: 'rating',
        label: 'Squad Overall Rating',
        userValue: userMetrics.rating,
        userDisplay: `${userMetrics.rating} OVR`,
        oppValue: oppMetrics.rating,
        oppDisplay: `${oppMetrics.rating} OVR`,
        userPoints: userMetrics.rating > oppMetrics.rating ? 250 : userMetrics.rating === oppMetrics.rating ? 100 : 0,
        oppPoints: oppMetrics.rating > userMetrics.rating ? 250 : userMetrics.rating === oppMetrics.rating ? 100 : 0,
        winner: userMetrics.rating > oppMetrics.rating ? 'user' : userMetrics.rating === oppMetrics.rating ? 'tie' : 'opponent',
      },
      {
        category: 'chemistry',
        label: 'Full Team Chemistry',
        userValue: userMetrics.chemistry,
        userDisplay: `${userMetrics.chemistry}/33 Chem`,
        oppValue: oppMetrics.chemistry,
        oppDisplay: `${oppMetrics.chemistry}/33 Chem`,
        userPoints: userMetrics.chemistry > oppMetrics.chemistry ? 250 : userMetrics.chemistry === oppMetrics.chemistry ? 100 : 0,
        oppPoints: oppMetrics.chemistry > userMetrics.chemistry ? 250 : userMetrics.chemistry === oppMetrics.chemistry ? 100 : 0,
        winner: userMetrics.chemistry > oppMetrics.chemistry ? 'user' : userMetrics.chemistry === oppMetrics.chemistry ? 'tie' : 'opponent',
      },
      {
        category: 'leagues',
        label: 'Distinct Leagues Diversity',
        userValue: userMetrics.leagues,
        userDisplay: `${userMetrics.leagues} Leagues`,
        oppValue: oppMetrics.leagues,
        oppDisplay: `${oppMetrics.leagues} Leagues`,
        userPoints: userMetrics.leagues > oppMetrics.leagues ? 200 : userMetrics.leagues === oppMetrics.leagues ? 100 : 0,
        oppPoints: oppMetrics.leagues > userMetrics.leagues ? 200 : userMetrics.leagues === oppMetrics.leagues ? 100 : 0,
        winner: userMetrics.leagues > oppMetrics.leagues ? 'user' : userMetrics.leagues === oppMetrics.leagues ? 'tie' : 'opponent',
      },
      {
        category: 'nations',
        label: 'Distinct Nationalities Diversity',
        userValue: userMetrics.nations,
        userDisplay: `${userMetrics.nations} Nations`,
        oppValue: oppMetrics.nations,
        oppDisplay: `${oppMetrics.nations} Nations`,
        userPoints: userMetrics.nations > oppMetrics.nations ? 200 : userMetrics.nations === oppMetrics.nations ? 100 : 0,
        oppPoints: oppMetrics.nations > userMetrics.nations ? 200 : userMetrics.nations === oppMetrics.nations ? 100 : 0,
        winner: userMetrics.nations > oppMetrics.nations ? 'user' : userMetrics.nations === oppMetrics.nations ? 'tie' : 'opponent',
      },
      {
        category: 'checklists',
        label: '5-Pack Checklists Completed',
        userValue: userCompletedChecklists,
        userDisplay: `${userCompletedChecklists}/5 Completed`,
        oppValue: oppChecklistsCompleted,
        oppDisplay: `${oppChecklistsCompleted}/5 Completed`,
        userPoints: userCompletedChecklists * 100,
        oppPoints: oppChecklistsCompleted * 100,
        winner: userCompletedChecklists > oppChecklistsCompleted ? 'user' : userCompletedChecklists === oppChecklistsCompleted ? 'tie' : 'opponent',
      },
    ];

    setShowdownScores(categories);

    // Staggered reveals
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      setShowdownStage(currentStep);
      sound.playClick();

      if (currentStep >= categories.length) {
        clearInterval(interval);
        // Calculate winner
        const totalUser = categories.reduce((acc, c) => acc + c.userPoints, 0);
        const totalOpp = categories.reduce((acc, c) => acc + c.oppPoints, 0);

        if (totalUser > totalOpp) {
          setMatchWinner('user');
          setDuoPointsEarned(350);
          updateDuoPoints(350);
          sound.playLevelUp();
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
        } else if (totalUser === totalOpp) {
          setMatchWinner('tie');
          setDuoPointsEarned(150);
          updateDuoPoints(150);
          sound.playSuccess();
        } else {
          setMatchWinner('opponent');
          setDuoPointsEarned(75);
          updateDuoPoints(75);
        }
      }
    }, 700);
  };

  // Buy pack from Duo Rewards Shop
  const handleBuyShopPack = (item: DuoShopItem) => {
    if (duoPoints < item.pointsCost) {
      sound.playClick();
      return;
    }

    sound.playSuccess();
    updateDuoPoints(-item.pointsCost);
    onAddUnopenedPack(item.pack, 'Pack Duo Vault', 'pack_duo');
    confetti({ particleCount: 40, spread: 60 });
    setShopSuccessMsg(`Successfully purchased ${item.name}! Saved directly to your My Packs vault.`);
    setTimeout(() => setShopSuccessMsg(null), 4000);
  };

  const userMetrics = useMemo(() => calculateSquadMetrics(draftSquad), [draftSquad]);
  const userChecklistsCount = useMemo(() => checklists.filter((c) => c.completed).length, [checklists]);

  return (
    <div className="space-y-6">
      {/* Top Header Banner: Points & Mode Sub-tabs */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-emerald-500/50 bg-gradient-to-r from-slate-950 via-[#041a12] to-slate-950 p-5 shadow-[0_0_35px_rgba(16,185,129,0.25)] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 flex items-center justify-center shadow-[0_0_20px_rgba(52,211,153,0.6)]">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-emerald-400">
              <Swords className="w-6 h-6 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase">
                Pack Duo Showdown ⚔️
              </h1>
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                50-Pack Draft
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Open 50 instant packs, complete 5 challenge checklists, craft your 11, and conquer the head-to-head showdown!
            </p>
          </div>
        </div>

        {/* Duo Points Wallet & Sub-tab Selector */}
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <div className="px-4 py-2 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <Trophy className="w-4 h-4 text-emerald-400" />
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Duo Points</span>
              <span className="text-sm font-black text-emerald-300">{duoPoints.toLocaleString()} PTS</span>
            </div>
          </div>

          <div className="flex items-center p-1 bg-slate-900 border border-slate-700 rounded-2xl">
            <button
              onClick={() => {
                setActiveSubTab('game');
                sound.playClick();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                activeSubTab === 'game'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ⚔️ Play Match
            </button>
            <button
              onClick={() => {
                setActiveSubTab('shop');
                sound.playClick();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeSubTab === 'shop'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Duo Vault Shop</span>
            </button>
          </div>
        </div>
      </div>

      {/* SUB-TAB 2: DUO REWARDS SHOP */}
      {activeSubTab === 'shop' ? (
        <div className="space-y-6">
          {shopSuccessMsg && (
            <div className="p-4 rounded-2xl bg-emerald-950/90 border-2 border-emerald-500 text-emerald-200 text-sm font-bold flex items-center justify-between shadow-[0_0_20px_rgba(16,185,129,0.5)] animate-fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>{shopSuccessMsg}</span>
              </div>
              {onNavigateToMyPacks && (
                <button
                  onClick={onNavigateToMyPacks}
                  className="px-3 py-1 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs hover:bg-emerald-400 transition-all flex items-center gap-1"
                >
                  <PackageOpen className="w-3.5 h-3.5" />
                  <span>Open in My Packs</span>
                </button>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {DUO_SHOP_PACKS.map((item) => {
              const canAfford = duoPoints >= item.pointsCost;
              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 flex flex-col justify-between hover:border-emerald-500/50 transition-all hover:-translate-y-1 shadow-lg"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        {item.badge}
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        {item.pack.cardCount} Players
                      </span>
                    </div>
                    <h3 className="text-base font-black text-white mb-1">{item.name}</h3>
                    <p className="text-xs text-slate-400 mb-4">{item.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-sm font-black text-emerald-400">
                      {item.pointsCost} PTS
                    </span>
                    <button
                      onClick={() => handleBuyShopPack(item)}
                      disabled={!canAfford}
                      className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 ${
                        canAfford
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.5)] active:scale-95'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{canAfford ? 'Redeem Pack' : 'Need Points'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* SUB-TAB 1: PLAY MATCH */
        <div>
          {/* PHASE: LOBBY */}
          {phase === 'lobby' && (
            <div className="space-y-6">
              <div className="text-center max-w-xl mx-auto space-y-2 py-4">
                <span className="text-xs font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                  Select Opponent
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  Choose Your Duo Matchup
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Compete against an intelligent AI bot or enter simulated live matchmaking against online community rivals!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                {/* AI Option */}
                <button
                  onClick={() => startMatch('ai')}
                  className="group relative rounded-3xl p-6 bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-slate-800 hover:border-emerald-500 transition-all hover:scale-[1.02] active:scale-[0.99] text-left flex flex-col justify-between shadow-xl"
                >
                  <div className="space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                      <Bot className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white group-hover:text-emerald-300 transition-colors">
                        🤖 Compete Against AI
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Instant matchup against smart tactical AI bots (Guardiola Sim, Tactical AI, Klopp Gegenpress). Ideal for quick drafting!
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-800/80">
                    <span className="text-xs font-bold text-slate-500">Instant Start</span>
                    <span className="text-xs font-black text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Play AI <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </button>

                {/* Online Users Option */}
                <button
                  onClick={() => startMatch('online')}
                  className="group relative rounded-3xl p-6 bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-slate-800 hover:border-cyan-500 transition-all hover:scale-[1.02] active:scale-[0.99] text-left flex flex-col justify-between shadow-xl"
                >
                  <div className="space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                      <Users className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white group-hover:text-cyan-300 transition-colors">
                        🌐 Compete Against Online Users
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Simulate live matchmaking to find active rival FUT managers with personalized gamer tags and skill ratings!
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-800/80">
                    <span className="text-xs font-bold text-slate-500">Skill-based Match</span>
                    <span className="text-xs font-black text-cyan-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Find Rival <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* PHASE: MATCHMAKING */}
          {phase === 'matchmaking' && (
            <div className="min-h-[350px] flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-cyan-500/30 border-t-cyan-400 animate-spin" />
                <Users className="w-10 h-10 text-cyan-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Searching for Online Rival...</h3>
                <p className="text-xs text-slate-400 mt-1">Connecting to live Pack Duo division server</p>
              </div>
              {selectedOpponent && (
                <div className="mt-4 px-4 py-2 rounded-2xl bg-slate-900 border border-cyan-500/50 flex items-center gap-3 animate-fade-in">
                  <span className="text-2xl">{selectedOpponent.avatar}</span>
                  <div className="text-left">
                    <div className="text-xs font-black text-cyan-300">{selectedOpponent.name}</div>
                    <div className="text-[10px] text-slate-400">{selectedOpponent.country} · {selectedOpponent.skillRating} Skill</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PHASE: 50-PACK OPENING & 5 CHECKLISTS */}
          {phase === 'opening' && (
            <div className="space-y-6">
              {/* Opponent Bar & Live Checklist Progress */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-lg">
                    {selectedOpponent?.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-white">{selectedOpponent?.name}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {selectedOpponent?.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Opponent packs left: <strong className="text-emerald-400">{oppPacksRemaining}</strong> · Checklists: <strong className="text-yellow-400">{oppChecklistsCompleted}/5</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Your Remaining</span>
                    <div className="text-lg font-black text-emerald-400">{packsRemaining} Packs</div>
                  </div>
                  {packsRemaining === 0 && (
                    <button
                      onClick={handleProceedToSquad}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-bounce"
                    >
                      <span>Build Squad</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* 5 Dynamic Challenge Checklists Banner */}
              <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-slate-950 to-emerald-950/40 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-emerald-300">
                      5 Pack Duo Checklists ({userChecklistsCount}/5 Completed)
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400 font-bold">
                    +100 Showdown Points each!
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                  {checklists.map((ch, idx) => (
                    <div
                      key={ch.id}
                      className={`p-2.5 rounded-xl border text-xs transition-all ${
                        ch.completed
                          ? 'bg-emerald-950/80 border-emerald-400/80 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                          : 'bg-slate-900/80 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-black uppercase text-slate-500">#{idx + 1}</span>
                        {ch.completed ? (
                          <span className="text-emerald-400 flex items-center gap-1 text-[10px] font-black">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Done
                          </span>
                        ) : (
                          <span className="text-slate-600 text-[10px]">Pending</span>
                        )}
                      </div>
                      <div className="font-bold text-white text-[11px] line-clamp-1">{ch.title}</div>
                      <div className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{ch.description}</div>
                      {ch.completed && ch.completedByCard && (
                        <div className="mt-1 text-[9px] text-emerald-300 font-mono truncate">
                          ✓ {ch.completedByCard.shortName} ({ch.completedByCard.rating})
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Pack Ripping Controls */}
              <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 text-center space-y-4">
                <div className="max-w-md mx-auto space-y-1">
                  <h3 className="text-lg font-black text-white">Rip Your 50 Draft Packs</h3>
                  <p className="text-xs text-slate-400">
                    Use quick buttons to rip singly, in 5x / 10x batches, or unwrap all remaining instantly!
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => handleRipPacks(1)}
                    disabled={packsRemaining < 1}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-black text-xs transition-all active:scale-95"
                  >
                    Rip 1 Pack
                  </button>
                  <button
                    onClick={() => handleRipPacks(5)}
                    disabled={packsRemaining < 1}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-slate-950 font-black text-xs transition-all shadow-md active:scale-95"
                  >
                    ⚡ Rip 5x Fast
                  </button>
                  <button
                    onClick={() => handleRipPacks(10)}
                    disabled={packsRemaining < 1}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-black text-xs transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] active:scale-95"
                  >
                    🚀 Rip 10x Rapid
                  </button>
                  <button
                    onClick={() => handleRipPacks(packsRemaining)}
                    disabled={packsRemaining < 1}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 disabled:opacity-40 text-slate-950 font-black text-xs transition-all shadow-md active:scale-95"
                  >
                    💥 Open All Remaining ({packsRemaining})
                  </button>
                </div>

                {packsRemaining === 0 && (
                  <div className="pt-4">
                    <button
                      onClick={handleProceedToSquad}
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-sm uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(16,185,129,0.6)] hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto"
                    >
                      <span>Proceed to Squad Builder</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Recent Pulls Showcase */}
              {recentPulls.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                    <span>Recent Pack Pulls ({pulledCards.length} Total Draft Cards)</span>
                    <span className="text-[11px] text-slate-500">Draft pool only (club stays clean)</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                    {recentPulls.map((card) => (
                      <div key={card.id} className="transform hover:scale-105 transition-transform">
                        <CardItem card={card} size="sm" interactive={false} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PHASE: SQUAD BUILDING */}
          {phase === 'squad' && (
            <div className="space-y-6">
              {/* Tactical Pitch Summary Bar */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-400" />
                    <span className="text-xs font-bold text-slate-400 uppercase">Team Rating:</span>
                    <strong className="text-lg font-black text-white">{userMetrics.rating} OVR</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <span className="text-xs font-bold text-slate-400 uppercase">Chemistry:</span>
                    <strong className="text-lg font-black text-yellow-300">{userMetrics.chemistry}/33</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-cyan-400" />
                    <span className="text-xs font-bold text-slate-400 uppercase">Leagues:</span>
                    <strong className="text-lg font-black text-cyan-300">{userMetrics.leagues}</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-pink-400" />
                    <span className="text-xs font-bold text-slate-400 uppercase">Nations:</span>
                    <strong className="text-lg font-black text-pink-300">{userMetrics.nations}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={autoBuildSquad}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Auto-Best 11</span>
                  </button>
                  <button
                    onClick={handleEnterShowdown}
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all active:scale-95"
                  >
                    <Swords className="w-4 h-4" />
                    <span>Lock In & Enter Showdown</span>
                  </button>
                </div>
              </div>

              {/* Pitch Layout (4-3-3) */}
              <div className="relative rounded-3xl overflow-hidden border-2 border-emerald-500/40 bg-gradient-to-b from-emerald-950/80 via-[#062c1d] to-[#041d13] p-4 sm:p-6 shadow-2xl min-h-[500px]">
                {/* Field markings */}
                <div className="absolute inset-x-8 top-1/2 border-b border-emerald-400/20" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-emerald-400/20" />

                {/* Strikers (LW, ST, RW) */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-2xl mx-auto mb-6">
                  {['slot_lw', 'slot_st', 'slot_rw'].map((slotId) => {
                    const slot = FORMATION_SLOTS.find((s) => s.id === slotId)!;
                    const card = draftSquad[slotId];
                    return (
                      <div
                        key={slotId}
                        onClick={() => setSelectedSlotForSwap(slotId)}
                        className={`cursor-pointer rounded-2xl p-2 border-2 transition-all flex flex-col items-center justify-center text-center ${
                          selectedSlotForSwap === slotId
                            ? 'border-yellow-400 bg-yellow-950/40 scale-105'
                            : 'border-emerald-500/40 bg-slate-950/70 hover:border-emerald-400'
                        }`}
                      >
                        <span className="text-[10px] font-black text-emerald-400 uppercase mb-1">{slot.label}</span>
                        {card ? (
                          <div className="w-full">
                            <CardItem card={card} size="sm" interactive={false} />
                          </div>
                        ) : (
                          <div className="h-28 flex flex-col items-center justify-center text-slate-500 text-xs font-bold">
                            <span>+ Empty</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Midfielders (CM, CDM, CM) */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-2xl mx-auto mb-6">
                  {['slot_cm1', 'slot_cdm', 'slot_cm2'].map((slotId) => {
                    const slot = FORMATION_SLOTS.find((s) => s.id === slotId)!;
                    const card = draftSquad[slotId];
                    return (
                      <div
                        key={slotId}
                        onClick={() => setSelectedSlotForSwap(slotId)}
                        className={`cursor-pointer rounded-2xl p-2 border-2 transition-all flex flex-col items-center justify-center text-center ${
                          selectedSlotForSwap === slotId
                            ? 'border-yellow-400 bg-yellow-950/40 scale-105'
                            : 'border-emerald-500/40 bg-slate-950/70 hover:border-emerald-400'
                        }`}
                      >
                        <span className="text-[10px] font-black text-emerald-400 uppercase mb-1">{slot.label}</span>
                        {card ? (
                          <div className="w-full">
                            <CardItem card={card} size="sm" interactive={false} />
                          </div>
                        ) : (
                          <div className="h-28 flex flex-col items-center justify-center text-slate-500 text-xs font-bold">
                            <span>+ Empty</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Defenders (LB, CB, CB, RB) */}
                <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-2xl mx-auto mb-6">
                  {['slot_lb', 'slot_cb1', 'slot_cb2', 'slot_rb'].map((slotId) => {
                    const slot = FORMATION_SLOTS.find((s) => s.id === slotId)!;
                    const card = draftSquad[slotId];
                    return (
                      <div
                        key={slotId}
                        onClick={() => setSelectedSlotForSwap(slotId)}
                        className={`cursor-pointer rounded-2xl p-2 border-2 transition-all flex flex-col items-center justify-center text-center ${
                          selectedSlotForSwap === slotId
                            ? 'border-yellow-400 bg-yellow-950/40 scale-105'
                            : 'border-emerald-500/40 bg-slate-950/70 hover:border-emerald-400'
                        }`}
                      >
                        <span className="text-[10px] font-black text-emerald-400 uppercase mb-1">{slot.label}</span>
                        {card ? (
                          <div className="w-full">
                            <CardItem card={card} size="sm" interactive={false} />
                          </div>
                        ) : (
                          <div className="h-28 flex flex-col items-center justify-center text-slate-500 text-xs font-bold">
                            <span>+ Empty</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Goalkeeper */}
                <div className="w-36 mx-auto">
                  {['slot_gk'].map((slotId) => {
                    const slot = FORMATION_SLOTS.find((s) => s.id === slotId)!;
                    const card = draftSquad[slotId];
                    return (
                      <div
                        key={slotId}
                        onClick={() => setSelectedSlotForSwap(slotId)}
                        className={`cursor-pointer rounded-2xl p-2 border-2 transition-all flex flex-col items-center justify-center text-center ${
                          selectedSlotForSwap === slotId
                            ? 'border-yellow-400 bg-yellow-950/40 scale-105'
                            : 'border-emerald-500/40 bg-slate-950/70 hover:border-emerald-400'
                        }`}
                      >
                        <span className="text-[10px] font-black text-emerald-400 uppercase mb-1">{slot.label}</span>
                        {card ? (
                          <div className="w-full">
                            <CardItem card={card} size="sm" interactive={false} />
                          </div>
                        ) : (
                          <div className="h-28 flex flex-col items-center justify-center text-slate-500 text-xs font-bold">
                            <span>+ Empty</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Swap Tray (if a pitch slot is clicked) */}
              {selectedSlotForSwap && (
                <div className="rounded-2xl border border-yellow-500/50 bg-slate-900/90 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-yellow-300 uppercase tracking-wider">
                      Select Player for {FORMATION_SLOTS.find((s) => s.id === selectedSlotForSwap)?.label}
                    </span>
                    <button
                      onClick={() => setSelectedSlotForSwap(null)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Close ✕
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 max-h-60 overflow-y-auto pr-1">
                    {pulledCards.map((card) => (
                      <div
                        key={card.id}
                        onClick={() => {
                          setDraftSquad((prev) => ({ ...prev, [selectedSlotForSwap]: card }));
                          setSelectedSlotForSwap(null);
                          sound.playClick();
                        }}
                        className="cursor-pointer transform hover:scale-105 transition-all"
                      >
                        <CardItem card={card} size="sm" interactive={false} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PHASE: SHOWDOWN HEAD-TO-HEAD COMPARISON */}
          {phase === 'showdown' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="text-center space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                  Head-to-Head Comparison
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  Duo Comparison Showdown ⚔️
                </h2>
                <p className="text-xs text-slate-400">
                  Comparing Squad Ratings, Chemistry, League and Nationality Diversity, and Checklists Completed!
                </p>
              </div>

              {/* Roster Matchup Header */}
              <div className="grid grid-cols-2 gap-4">
                {/* User Side */}
                <div className="p-4 rounded-2xl border-2 border-emerald-500 bg-emerald-950/40 text-center">
                  <div className="text-xs font-black text-emerald-400 uppercase tracking-wider">Your Draft XI</div>
                  <div className="text-2xl font-black text-white mt-1">{userMetrics.rating} OVR</div>
                  <div className="text-xs text-emerald-300">{userMetrics.chemistry}/33 Chem · {userChecklistsCount}/5 Checklists</div>
                </div>

                {/* Opponent Side */}
                <div className="p-4 rounded-2xl border-2 border-cyan-500 bg-cyan-950/40 text-center">
                  <div className="text-xs font-black text-cyan-400 uppercase tracking-wider">{selectedOpponent?.name}</div>
                  <div className="text-2xl font-black text-white mt-1">
                    {calculateSquadMetrics(oppDraftSquad).rating} OVR
                  </div>
                  <div className="text-xs text-cyan-300">
                    {calculateSquadMetrics(oppDraftSquad).chemistry}/33 Chem · {oppChecklistsCompleted}/5 Checklists
                  </div>
                </div>
              </div>

              {/* 5 Comparison Pillars */}
              <div className="space-y-3">
                {showdownScores.map((score, index) => {
                  const isRevealed = index < showdownStage;
                  return (
                    <div
                      key={score.category}
                      className={`p-4 rounded-2xl border transition-all ${
                        isRevealed
                          ? score.winner === 'user'
                            ? 'border-emerald-500 bg-emerald-950/30'
                            : score.winner === 'opponent'
                            ? 'border-red-500/50 bg-red-950/20'
                            : 'border-yellow-500/50 bg-yellow-950/20'
                          : 'border-slate-800 bg-slate-900/50 opacity-40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-1/3 text-left">
                          <span className="text-xs font-bold text-slate-400 block">{score.label}</span>
                          <span className="text-base font-black text-white">
                            {isRevealed ? score.userDisplay : '???'}
                          </span>
                        </div>

                        <div className="w-1/3 text-center">
                          {isRevealed ? (
                            score.winner === 'user' ? (
                              <span className="text-xs font-black uppercase text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40">
                                You Win (+{score.userPoints} pts)
                              </span>
                            ) : score.winner === 'opponent' ? (
                              <span className="text-xs font-black uppercase text-red-400 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40">
                                Opponent Wins (+{score.oppPoints} pts)
                              </span>
                            ) : (
                              <span className="text-xs font-black uppercase text-yellow-400 px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/40">
                                Draw (+{score.userPoints} pts)
                              </span>
                            )
                          ) : (
                            <span className="text-xs text-slate-500 font-mono">Comparing...</span>
                          )}
                        </div>

                        <div className="w-1/3 text-right">
                          <span className="text-xs font-bold text-slate-400 block">{selectedOpponent?.name}</span>
                          <span className="text-base font-black text-white">
                            {isRevealed ? score.oppDisplay : '???'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Showdown Winner Card */}
              {matchWinner && (
                <div className="p-6 rounded-3xl border-2 border-emerald-500 bg-gradient-to-b from-slate-950 via-[#031d13] to-slate-950 text-center space-y-4 shadow-[0_0_40px_rgba(16,185,129,0.5)] animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500 mx-auto flex items-center justify-center text-3xl">
                    {matchWinner === 'user' ? '🏆' : matchWinner === 'tie' ? '🤝' : '⚔️'}
                  </div>

                  <div>
                    <h3 className="text-2xl sm:text-3xl font-black text-white uppercase">
                      {matchWinner === 'user'
                        ? '🎉 Victory! You Won the Pack Duo!'
                        : matchWinner === 'tie'
                        ? 'Honorable Draw!'
                        : 'Defeat - Valiant Effort!'}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1">
                      {matchWinner === 'user'
                        ? `Congratulations! You outperformed ${selectedOpponent?.name} across the draft showdown.`
                        : `Good competition against ${selectedOpponent?.name}.`}
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-black text-base">
                    <Trophy className="w-5 h-5 text-emerald-400" />
                    <span>+{duoPointsEarned} Duo Points Awarded!</span>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => setPhase('lobby')}
                      className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 transition-all"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Play Another Match</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveSubTab('shop');
                        setPhase('lobby');
                      }}
                      className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Spend Points in Duo Shop</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
