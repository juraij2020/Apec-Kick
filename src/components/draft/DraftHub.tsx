import React, { useState, useEffect, useMemo } from 'react';
import { SoccerCard, Formation, PackDefinition } from '../../types/card';
import {
  DraftSlot,
  DraftSquadState,
  DraftDayCondition,
  TournamentRound,
  TournamentMatch,
  TournamentCup,
} from '../../types/draft';
import {
  DRAFT_FORMATIONS,
  TOURNAMENT_CUPS,
  initializeDraftSlots,
  getDailyDraftCondition,
  evaluateDraftDayCondition,
  calculateDraftSquadStats,
  generateDraftChoices,
  createTournamentBracket,
  simulateFullMatchEvents,
  advanceTournamentBracket,
  DRAFT_STORAGE_KEY,
  TOURNAMENT_STORAGE_KEY,
} from '../../utils/draftService';
import { DraftPitch } from './DraftPitch';
import { DraftChoiceModal } from './DraftChoiceModal';
import { DraftTournamentBracket } from './DraftTournamentBracket';
import { DraftMatchSimulation } from './DraftMatchSimulation';
import { DraftRewardModal } from './DraftRewardModal';
import { sound } from '../../utils/audio';
import { safeSetItem, safeGetItem } from '../../utils/safeStorage';
import {
  Trophy,
  Play,
  RotateCcw,
  Sparkles,
  Shield,
  Layers,
  ArrowRight,
  Flame,
  Award,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Shuffle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DraftHubProps {
  coins: number;
  setCoins: React.Dispatch<React.SetStateAction<number>>;
  packCardsPool: SoccerCard[];
  initialView?: 'builder' | 'tournament';
  onAddUnopenedPack: (
    pack: PackDefinition,
    sourceTitle: string,
    sourceType: 'high_low' | 'guess_who' | 'daily_objective' | 'bonus' | 'sbc' | 'pack_duo' | 'raffle' | 'draft'
  ) => void;
  onNavigateToTab: (tab: string) => void;
}

type DraftView = 'builder' | 'tournament' | 'simulation';

export const DraftHub: React.FC<DraftHubProps> = ({
  coins,
  setCoins,
  packCardsPool,
  initialView,
  onAddUnopenedPack,
  onNavigateToTab,
}) => {
  // Current Active Sub-View: Builder (Draft Table) -> Tournament -> Simulation
  const [activeView, setActiveView] = useState<DraftView>(() => initialView || 'builder');

  useEffect(() => {
    if (initialView && initialView !== activeView && activeView !== 'simulation') {
      setActiveView(initialView);
    }
  }, [initialView]);

  // Selected Formation
  const [selectedFormation, setSelectedFormation] = useState<Formation>(() => DRAFT_FORMATIONS[0]);

  // Draft Slots (11 Starting, 7 Bench, 5 Reserves = 23 Total)
  const [startingSlots, setStartingSlots] = useState<DraftSlot[]>(() => {
    return initializeDraftSlots(DRAFT_FORMATIONS[0]).startingSlots;
  });
  const [benchSlots, setBenchSlots] = useState<DraftSlot[]>(() => {
    return initializeDraftSlots(DRAFT_FORMATIONS[0]).benchSlots;
  });
  const [reserveSlots, setReserveSlots] = useState<DraftSlot[]>(() => {
    return initializeDraftSlots(DRAFT_FORMATIONS[0]).reserveSlots;
  });

  // Draft of the Day Challenge Condition
  const [dayCondition, setDayCondition] = useState<DraftDayCondition>(() => getDailyDraftCondition());

  // Player Choice Modal State
  const [activeSlotToDraft, setActiveSlotToDraft] = useState<DraftSlot | null>(null);
  const [draftChoices, setDraftChoices] = useState<SoccerCard[]>([]);

  // Slot Swap Mode State
  const [selectedSwapSlot, setSelectedSwapSlot] = useState<DraftSlot | null>(null);

  // Tournament Cup & Bracket State
  const [currentCup, setCurrentCup] = useState<TournamentCup>(() => TOURNAMENT_CUPS[0]);
  const [tournamentMatches, setTournamentMatches] = useState<TournamentMatch[]>([]);
  const [currentTournamentRound, setCurrentTournamentRound] = useState<TournamentRound>('r16');
  const [isEliminated, setIsEliminated] = useState<boolean>(false);
  const [isChampion, setIsChampion] = useState<boolean>(false);
  const [activeMatchToSim, setActiveMatchToSim] = useState<TournamentMatch | null>(null);
  const [showRewardModal, setShowRewardModal] = useState<boolean>(false);

  // Calculate squad rating and chemistry live
  const squadStats = useMemo(() => {
    return calculateDraftSquadStats(selectedFormation, startingSlots, benchSlots, reserveSlots);
  }, [selectedFormation, startingSlots, benchSlots, reserveSlots]);

  // Evaluate Draft of the Day condition
  const evaluatedCondition = useMemo(() => {
    const allSlots = [...startingSlots, ...benchSlots, ...reserveSlots];
    return evaluateDraftDayCondition(dayCondition, allSlots, squadStats.chemistry, squadStats.rating);
  }, [dayCondition, startingSlots, benchSlots, reserveSlots, squadStats.chemistry, squadStats.rating]);

  // Track all drafted card IDs to prevent duplicate choices
  const alreadyDraftedCardIds = useMemo(() => {
    const ids = new Set<string>();
    [...startingSlots, ...benchSlots, ...reserveSlots].forEach((s) => {
      if (s.card) {
        ids.add(s.card.id);
        ids.add(s.card.id.split('_inst_')[0]);
      }
    });
    return ids;
  }, [startingSlots, benchSlots, reserveSlots]);

  // Check if starting 11 is completely drafted (requirement to enter tournament)
  const isStartingXIComplete = useMemo(() => {
    return startingSlots.every((s) => s.card !== undefined);
  }, [startingSlots]);

  // Handle Slot Click (Drafting or Swapping)
  const handleSlotClick = (clickedSlot: DraftSlot) => {
    // If we're already in Swap Mode:
    if (selectedSwapSlot) {
      if (selectedSwapSlot.id === clickedSlot.id) {
        // Deselect
        setSelectedSwapSlot(null);
        return;
      }

      // Execute Swap between selectedSwapSlot and clickedSlot
      executeSwap(selectedSwapSlot, clickedSlot);
      setSelectedSwapSlot(null);
      sound.playHit();
      return;
    }

    // If slot has a card, clicking it enters Swap Mode
    if (clickedSlot.card) {
      setSelectedSwapSlot(clickedSlot);
      return;
    }

    // If slot is empty, open 5-card choice picker
    const choices = generateDraftChoices(clickedSlot, packCardsPool, alreadyDraftedCardIds);
    setActiveSlotToDraft(clickedSlot);
    setDraftChoices(choices);
  };

  // Execute Swap between two slots (Starting, Bench, or Reserve)
  const executeSwap = (slotA: DraftSlot, slotB: DraftSlot) => {
    const updateSlotList = (list: DraftSlot[], targetId: string, newCard?: SoccerCard): DraftSlot[] => {
      return list.map((s) => (s.id === targetId ? { ...s, card: newCard } : s));
    };

    const cardA = slotA.card;
    const cardB = slotB.card;

    const applySlotChange = (slotId: string, card?: SoccerCard) => {
      if (slotId.startsWith('starting_')) {
        setStartingSlots((prev) => updateSlotList(prev, slotId, card));
      } else if (slotId.startsWith('bench_')) {
        setBenchSlots((prev) => updateSlotList(prev, slotId, card));
      } else if (slotId.startsWith('reserve_')) {
        setReserveSlots((prev) => updateSlotList(prev, slotId, card));
      }
    };

    applySlotChange(slotA.id, cardB);
    applySlotChange(slotB.id, cardA);
  };

  // Card Choice Selected from Modal
  const handleSelectDraftCard = (card: SoccerCard) => {
    if (!activeSlotToDraft) return;

    const clonedCard: SoccerCard = {
      ...card,
      id: `${card.id}_draft_${Date.now()}_${activeSlotToDraft.id}`,
    };

    if (activeSlotToDraft.type === 'starting') {
      setStartingSlots((prev) =>
        prev.map((s) => (s.id === activeSlotToDraft.id ? { ...s, card: clonedCard } : s))
      );
    } else if (activeSlotToDraft.type === 'bench') {
      setBenchSlots((prev) =>
        prev.map((s) => (s.id === activeSlotToDraft.id ? { ...s, card: clonedCard } : s))
      );
    } else if (activeSlotToDraft.type === 'reserve') {
      setReserveSlots((prev) =>
        prev.map((s) => (s.id === activeSlotToDraft.id ? { ...s, card: clonedCard } : s))
      );
    }

    setActiveSlotToDraft(null);
    setDraftChoices([]);

    // Check if next empty slot should be auto-focused or just let user browse
  };

  // Formation Change
  const handleSelectFormation = (form: Formation) => {
    if (form.id === selectedFormation.id) return;
    sound.playClick();
    setSelectedFormation(form);

    // Re-map existing cards to new formation slots
    const currentStartingCards = startingSlots.map((s) => s.card).filter((c): c is SoccerCard => c !== undefined);
    const newStartingSlots: DraftSlot[] = form.slots.map((slot, idx) => ({
      id: `starting_${slot.id}`,
      label: slot.position,
      type: 'starting',
      position: slot.position,
      card: currentStartingCards[idx] || undefined,
      x: slot.x,
      y: slot.y,
    }));

    setStartingSlots(newStartingSlots);
  };

  // Reset Draft completely
  const handleResetDraft = () => {
    sound.playClick();
    const { startingSlots: s, benchSlots: b, reserveSlots: r } = initializeDraftSlots(selectedFormation);
    setStartingSlots(s);
    setBenchSlots(b);
    setReserveSlots(r);
    setSelectedSwapSlot(null);
    setActiveView('builder');
    setTournamentMatches([]);
    setIsChampion(false);
    setIsEliminated(false);
  };

  // Transition from Draft Table to Tournament Arena
  const handleEnterTournament = (requireComplete: boolean = false) => {
    if (requireComplete && !isStartingXIComplete) {
      sound.playHit();
      return;
    }

    if (isStartingXIComplete) {
      sound.playWhistle();
    } else {
      sound.playClick();
    }

    // If tournament bracket not initialized yet, create it
    if (tournamentMatches.length === 0) {
      const userRating = Math.max(80, squadStats.rating || 82);
      const matches = createTournamentBracket('Your Apex XI', userRating, currentCup);
      setTournamentMatches(matches);
      setCurrentTournamentRound('r16');
      setIsEliminated(false);
      setIsChampion(false);
    }

    setActiveView('tournament');
    onNavigateToTab('tournament');
  };

  // Trigger Match Simulation
  const handleStartMatch = (match: TournamentMatch) => {
    const userCards = startingSlots.map((s) => s.card).filter((c): c is SoccerCard => c !== undefined);

    // Simulate match events
    const simResult = simulateFullMatchEvents(
      match.homeTeam.name,
      userCards,
      squadStats.rating,
      squadStats.chemistry,
      match.awayTeam.name,
      match.awayTeam.gamerTag || match.awayTeam.name,
      match.awayTeam.rating
    );

    const enrichedMatch: TournamentMatch = {
      ...match,
      homeScore: simResult.homeScore,
      awayScore: simResult.awayScore,
      winnerTeamName: simResult.winnerTeamName,
      commentaryLog: simResult.events,
      status: 'in_progress',
    };

    setActiveMatchToSim(enrichedMatch);
    setActiveView('simulation');
  };

  // Finish Match from Simulation
  const handleFinishMatch = (userWon: boolean, userScore: number, oppScore: number) => {
    const { updatedMatches, nextRound, isEliminated: elim, isChampion: champ } = advanceTournamentBracket(
      tournamentMatches,
      currentTournamentRound,
      userWon,
      userScore,
      oppScore,
      'Your Apex XI',
      squadStats.rating
    );

    setTournamentMatches(updatedMatches);
    setCurrentTournamentRound(nextRound);
    setIsEliminated(elim);
    setIsChampion(champ);
    setActiveMatchToSim(null);
    setActiveView('tournament');

    if (champ) {
      sound.playFanfare();
      setShowRewardModal(true);
    }
  };

  // Claim Champion Reward
  const handleClaimGrandPrize = () => {
    // 1. Award 25,000 Coins
    let prizeCoins = currentCup.championCoins;
    if (evaluatedCondition.isMet) {
      prizeCoins += evaluatedCondition.rewardCoins; // + 5,000 bonus!
    }

    setCoins((prev) => {
      const updated = prev + prizeCoins;
      safeSetItem('apex_fut_coins_v2', updated.toString());
      return updated;
    });

    // 2. Deposit Jumbo Rare Players Pack into user's unopenedPacks
    onAddUnopenedPack(
      currentCup.championPack,
      `Draft Champion Trophy: ${currentCup.name} 🏆`,
      'draft'
    );

    sound.playSuccess();
    setShowRewardModal(false);

    // 3. Redirect to 'mypacks' so user can open their pack immediately!
    onNavigateToTab('mypacks');
  };

  return (
    <div className="w-full flex flex-col gap-6 max-w-7xl mx-auto px-2 sm:px-4 py-4 animate-in fade-in duration-200">
      {/* Top Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-0.5 rounded-full text-xs font-black tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
              FIFA FUT Draft Simulator
            </span>
            <span className="text-xs text-slate-400 font-semibold">16-Team Knockout Mode</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-500">
            DRAFT SIMULATOR & TOURNAMENT
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Draft your complete starting 11, bench, and reserves. Take on global online contenders from the Round of 16 to the Grand Final to win the Jumbo Rare Players Pack!
          </p>
        </div>

        {/* View Switcher Tabs: Draft Table in one tab next to that Tournament tab */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              setActiveView('builder');
              onNavigateToTab('draft');
            }}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeView === 'builder'
                ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/25 ring-2 ring-amber-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Draft Table</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                activeView === 'builder'
                  ? 'bg-slate-950 text-amber-300'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              {startingSlots.filter((s) => s.card).length}/11
            </span>
          </button>

          <button
            onClick={() => {
              handleEnterTournament(false);
            }}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeView === 'tournament'
                ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/25 ring-2 ring-amber-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Tournament</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                activeView === 'tournament'
                  ? 'bg-slate-950 text-amber-300'
                  : 'bg-yellow-500/20 text-yellow-300'
              }`}
            >
              16 Teams
            </span>
          </button>

          <button
            onClick={handleResetDraft}
            title="Reset Draft"
            className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: DRAFT BUILDER (23 SLOTS + FORMATION + CONDITIONS)                 */}
      {/* ========================================================================= */}
      {activeView === 'builder' && (
        <div className="w-full flex flex-col gap-6">
          {/* Top Bar: Formations & Draft of the Day Challenge Banner */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Formation Selector */}
            <div className="lg:col-span-2 p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Select Tactical Formation
                </span>
                <span className="text-xs font-bold text-amber-400">Current: {selectedFormation.name}</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {DRAFT_FORMATIONS.map((form) => (
                  <button
                    key={form.id}
                    onClick={() => handleSelectFormation(form)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                      form.id === selectedFormation.id
                        ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    {form.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Draft of the Day Condition */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-amber-950/30 to-slate-900 border border-amber-500/30 shadow-xl flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px] font-black uppercase text-amber-400">Draft of the Day</span>
                </div>
                {evaluatedCondition.isMet ? (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Met (+5,000 Coins)
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-slate-400">
                    Progress: {evaluatedCondition.currentValue}/{evaluatedCondition.targetValue}
                  </span>
                )}
              </div>
              <h4 className="text-sm font-black text-white">{evaluatedCondition.title}</h4>
              <p className="text-xs text-slate-300 line-clamp-2 mt-0.5">{evaluatedCondition.description}</p>
            </div>
          </div>

          {/* Squad Vital Stats Bar (Live Rating, Chemistry, Draft Progress) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl text-center">
            <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-800/50">
              <span className="text-[10px] font-black uppercase text-slate-400">Squad Rating</span>
              <span className="text-2xl font-black text-white">{squadStats.rating}</span>
              <span className="text-[10px] text-amber-400 font-bold">OVR</span>
            </div>

            <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-800/50">
              <span className="text-[10px] font-black uppercase text-slate-400">Team Chemistry</span>
              <span className="text-2xl font-black text-amber-300">{squadStats.chemistry}/33</span>
              <span className="text-[10px] text-emerald-400 font-bold">
                {squadStats.chemistry >= 30 ? 'Maximum Synergy' : squadStats.chemistry >= 22 ? 'Solid Synergy' : 'Low Synergy'}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-800/50">
              <span className="text-[10px] font-black uppercase text-slate-400">Total Drafted</span>
              <span className="text-2xl font-black text-cyan-300">{squadStats.draftedCount}/23</span>
              <span className="text-[10px] text-slate-400 font-semibold">
                Starting: {startingSlots.filter((s) => s.card).length}/11
              </span>
            </div>

            <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-800/50">
              <span className="text-[10px] font-black uppercase text-slate-400">Attack / Mid / Def</span>
              <span className="text-sm font-black text-white mt-1">
                {squadStats.attackRating} · {squadStats.midfieldRating} · {squadStats.defenseRating}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">Live Sector Power</span>
            </div>
          </div>

          {/* The Pitch Component */}
          <DraftPitch
            formation={selectedFormation}
            startingSlots={startingSlots}
            benchSlots={benchSlots}
            reserveSlots={reserveSlots}
            onSlotClick={handleSlotClick}
            selectedSwapSlot={selectedSwapSlot}
            onClearSwap={() => setSelectedSwapSlot(null)}
          />

          {/* Fixed / Bottom CTA Bar: Redirect to Tournament */}
          <div className="sticky bottom-4 z-30 p-4 rounded-3xl bg-slate-900/95 backdrop-blur-md border border-amber-500/40 shadow-2xl shadow-slate-950 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <h4 className="font-black text-white text-base">
                  {isStartingXIComplete ? 'Starting 11 Complete & Battle Ready!' : 'Draft Starting 11 to Unlock Tournament'}
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isStartingXIComplete
                  ? `Team Rating: ${squadStats.rating} OVR · Chemistry: ${squadStats.chemistry}/33. Click to play in the 16-team tournament!`
                  : `Draft all 11 pitch positions (${startingSlots.filter((s) => s.card).length}/11 drafted) before kicking off knockout matches.`}
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  handleEnterTournament(false);
                }}
                className="px-4 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                title="View Tournament Bracket & Cups"
              >
                <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                <span>Tournaments Tab</span>
              </button>

              <button
                onClick={() => handleEnterTournament(true)}
                disabled={!isStartingXIComplete}
                className={`flex-1 sm:flex-initial px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-xl transition-all flex items-center justify-center gap-2 ${
                  isStartingXIComplete
                    ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 shadow-amber-500/30 hover:scale-105 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Play Draft Match</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: TOURNAMENT ARENA (16-TEAM BRACKET + OPPONENTS)                    */}
      {/* ========================================================================= */}
      {activeView === 'tournament' && (
        <DraftTournamentBracket
          currentCup={currentCup}
          cups={TOURNAMENT_CUPS}
          onSelectCup={(cup) => {
            setCurrentCup(cup);
            // Re-generate bracket for new cup
            const userRating = Math.max(80, squadStats.rating || 82);
            const matches = createTournamentBracket('Your Apex XI', userRating, cup);
            setTournamentMatches(matches);
            setCurrentTournamentRound('r16');
            setIsEliminated(false);
            setIsChampion(false);
          }}
          matches={tournamentMatches}
          currentRound={currentTournamentRound}
          isEliminated={isEliminated}
          isChampion={isChampion}
          isSquadReady={isStartingXIComplete}
          draftedCount={startingSlots.filter((s) => s.card).length}
          onGoToDraftTable={() => {
            setActiveView('builder');
            onNavigateToTab('draft');
          }}
          onStartMatch={handleStartMatch}
          onClaimPrize={() => setShowRewardModal(true)}
          onResetTournament={handleResetDraft}
        />
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: MATCH SIMULATION (MINUTE-BY-MINUTE COMMENTARY)                   */}
      {/* ========================================================================= */}
      {activeView === 'simulation' && activeMatchToSim && (
        <DraftMatchSimulation
          match={activeMatchToSim}
          userCards={startingSlots.map((s) => s.card).filter((c): c is SoccerCard => c !== undefined)}
          onFinishMatch={handleFinishMatch}
          onExit={() => setActiveView('tournament')}
        />
      )}

      {/* 5-Card Choice Draft Modal */}
      <DraftChoiceModal
        slot={activeSlotToDraft}
        choices={draftChoices}
        onSelectCard={handleSelectDraftCard}
        onClose={() => {
          setActiveSlotToDraft(null);
          setDraftChoices([]);
        }}
      />

      {/* Tournament Grand Champion Reward Modal */}
      <DraftRewardModal
        isOpen={showRewardModal}
        coinsWon={currentCup.championCoins}
        packName={currentCup.championPack.name}
        dayConditionBonus={evaluatedCondition.isMet}
        onClaim={handleClaimGrandPrize}
      />
    </div>
  );
};
