import React, { useState } from 'react';
import { SBCChallenge, SoccerCard, Position } from '../types/card';
import { CardItem } from './CardItem';
import { sound } from '../utils/audio';
import { Trophy, Coins, Gift, Check, ArrowLeft, Plus, X, Sparkles, Wand2, ShieldAlert } from 'lucide-react';

interface SBCViewProps {
  challenges: SBCChallenge[];
  clubCards: SoccerCard[];
  onCompleteSBC: (sbcId: string, submittedCardIds: string[], rewardCoins: number, rewardPackId: string) => void;
  onOpenPackNow: (packId: string) => void;
}

export const SBCView: React.FC<SBCViewProps> = ({
  challenges,
  clubCards,
  onCompleteSBC,
  onOpenPackNow,
}) => {
  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [slotAssignments, setSlotAssignments] = useState<{ [slotIndex: number]: SoccerCard | null }>({});
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Summer Transfers' | 'Street Kings' | 'International Moments' | 'Hall of Fame' | 'Futmas Special' | 'Program One' | 'Base Challenges' | 'Starter' | 'Advanced'>('All');
  const [completedRewardModal, setCompletedRewardModal] = useState<{
    coins: number;
    packId: string;
    packName: string;
  } | null>(null);

  const activeChallenge = challenges.find((c) => c.id === activeChallengeId);

  // Filtered challenges
  const filteredChallenges = challenges.filter(
    (c) => categoryFilter === 'All' || c.category === categoryFilter
  );

  const handleSelectChallenge = (sbc: SBCChallenge) => {
    setActiveChallengeId(sbc.id);
    setSlotAssignments({});
    setSelectedSlotIndex(null);
    sound.playClick();
  };

  const handleOpenSlot = (index: number) => {
    setSelectedSlotIndex(index);
    sound.playClick();
  };

  const handleAssignCard = (card: SoccerCard) => {
    if (selectedSlotIndex === null) return;
    setSlotAssignments((prev) => ({
      ...prev,
      [selectedSlotIndex]: card,
    }));
    setSelectedSlotIndex(null);
    sound.playCardFlip();
  };

  const handleRemoveSlotCard = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSlotAssignments((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
    sound.playClick();
  };

  // Get currently placed cards in active challenge
  const placedCards = Object.values(slotAssignments).filter((c): c is SoccerCard => c !== null);
  const placedCardIds = new Set(placedCards.map((c) => c.id));

  // Eligible cards from club that are not already assigned to another slot in this SBC
  const availableClubCards = clubCards.filter((c) => !placedCardIds.has(c.id));

  // Check requirements
  const requirementChecks = activeChallenge
    ? activeChallenge.requirements.map((req) => ({
        ...req,
        result: req.progress(placedCards),
        isMet: req.check(placedCards),
      }))
    : [];

  const allSlotsFilled = activeChallenge
    ? activeChallenge.slots.every((_, idx) => slotAssignments[idx] !== undefined)
    : false;

  const canSubmit = activeChallenge && allSlotsFilled && requirementChecks.every((r) => r.isMet);

  // Auto-fill logic
  const handleAutoFill = () => {
    if (!activeChallenge) return;
    sound.playClick();
    const newAssignments: { [slotIndex: number]: SoccerCard } = {};
    const usedIds = new Set<string>();

    activeChallenge.slots.forEach((slot, index) => {
      // Find matching position first, preferably custom if requirement has custom
      const candidate = availableClubCards.find(
        (c) => !usedIds.has(c.id) && c.position === slot.position
      ) || availableClubCards.find((c) => !usedIds.has(c.id));

      if (candidate) {
        newAssignments[index] = candidate;
        usedIds.add(candidate.id);
      }
    });

    setSlotAssignments(newAssignments);
  };

  const handleSubmitSquad = () => {
    if (!canSubmit || !activeChallenge) return;

    const submittedCardIds = placedCards.map((c) => c.id);
    onCompleteSBC(
      activeChallenge.id,
      submittedCardIds,
      activeChallenge.rewardCoins,
      activeChallenge.rewardPackId
    );

    sound.playGoalCheer();
    setCompletedRewardModal({
      coins: activeChallenge.rewardCoins,
      packId: activeChallenge.rewardPackId,
      packName: activeChallenge.rewardPackName,
    });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border border-blue-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Trophy className="w-4 h-4" />
            <span>Squad Building Challenges</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Exchange Cards for Coins & High-Tier Packs
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Meet the tactical criteria using players in your club. Complete Creator Special challenges with your custom cards!
          </p>
        </div>

        {activeChallenge && (
          <button
            onClick={() => setActiveChallengeId(null)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors border border-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Challenges</span>
          </button>
        )}
      </div>

      {/* REWARD MODAL */}
      {completedRewardModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/50 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl animate-fade-in">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-400/40">
              <Trophy className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-white">
                Challenge Completed!
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                Your squad was submitted and rewards are delivered!
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Coins Awarded:</span>
                <span className="text-base font-black text-amber-400 flex items-center gap-1">
                  <Coins className="w-4 h-4" />
                  +{completedRewardModal.coins.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Bonus Pack:</span>
                <span className="text-xs font-bold text-emerald-300">
                  {completedRewardModal.packName}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => {
                  const pid = completedRewardModal.packId;
                  setCompletedRewardModal(null);
                  setActiveChallengeId(null);
                  onOpenPackNow(pid);
                }}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2"
              >
                <Gift className="w-4 h-4" />
                <span>Open Reward Pack Now</span>
              </button>

              <button
                onClick={() => {
                  setCompletedRewardModal(null);
                  setActiveChallengeId(null);
                }}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
              >
                Close & Return
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 1: CHALLENGES LIST */}
      {!activeChallenge && (
        <div className="space-y-6">
          {/* Segmented Filter Controls */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl w-fit">
            {(['All', 'Summer Transfers', 'Street Kings', 'International Moments', 'Hall of Fame', 'Futmas Special', 'Program One', 'Base Challenges', 'Starter', 'Advanced'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  categoryFilter === cat
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat === 'Summer Transfers' ? '☀️ Summer Transfers' : cat === 'Street Kings' ? '⚡ Street Kings' : cat === 'International Moments' ? '🌍 International Moments' : cat === 'Hall of Fame' ? '👑 Hall of Fame' : cat === 'Futmas Special' ? '❄️ Futmas Special' : cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChallenges.map((challenge) => (
              <div
                key={challenge.id}
                onClick={() => handleSelectChallenge(challenge)}
                className="group relative bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-5 shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {challenge.category}
                    </span>
                    {challenge.completed ? (
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Completed
                      </span>
                    ) : (
                      <span className="text-[10px] text-cyan-400 font-semibold">
                        {challenge.slots.length} Slots
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-black text-white group-hover:text-cyan-300 transition-colors">
                    {challenge.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 min-h-[36px]">
                    {challenge.description}
                  </p>
                </div>

                {/* Slots preview miniature */}
                <div className="my-4 flex items-center gap-1.5">
                  {challenge.slots.map((slot, i) => (
                    <div
                      key={i}
                      className="px-2 py-1 bg-slate-950 border border-slate-800 rounded text-[9px] font-bold text-slate-400"
                    >
                      {slot.position}
                    </div>
                  ))}
                </div>

                {/* Rewards Footer */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-amber-400 font-bold text-xs tabular-nums">
                      <Coins className="w-3.5 h-3.5" />
                      <span>+{challenge.rewardCoins.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-400 font-medium text-xs">
                      <Gift className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[130px]">{challenge.rewardPackName}</span>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">
                    Build &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: ACTIVE CHALLENGE SUBMISSION PITCH */}
      {activeChallenge && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Challenge Pitch Slots (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-xl font-black text-white">
                  {activeChallenge.title}
                </h3>
                <p className="text-xs text-slate-400">
                  Tap any slot to insert a card from your Club
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleAutoFill}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/40 rounded-xl transition-colors"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Auto-Fill</span>
                </button>

                <button
                  onClick={() => setSlotAssignments({})}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Slots Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 min-h-[300px] items-center justify-center p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80">
              {activeChallenge.slots.map((slot, index) => {
                const assignedCard = slotAssignments[index];
                return (
                  <div
                    key={index}
                    onClick={() => handleOpenSlot(index)}
                    className={`relative flex flex-col items-center justify-center cursor-pointer transition-all ${
                      assignedCard ? '' : 'hover:scale-105'
                    }`}
                  >
                    {assignedCard ? (
                      <div className="relative group">
                        <CardItem card={assignedCard} size="sm" interactive={false} />
                        <button
                          onClick={(e) => handleRemoveSlotCard(index, e)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-rose-600 hover:bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg border border-white/40"
                          title="Remove player"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-[100px] h-[145px] rounded-2xl border-2 border-dashed border-slate-700 hover:border-cyan-400 bg-slate-900/50 flex flex-col items-center justify-center gap-2 p-2 text-center transition-colors">
                        <span className="text-xs font-black text-slate-300 uppercase">
                          {slot.position}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-cyan-400">
                          <Plus className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {slot.label}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Warnings notice */}
            <div className="flex items-center gap-2 text-xs text-amber-400/90 bg-amber-950/30 border border-amber-500/20 px-4 py-2.5 rounded-xl">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>
                Cards submitted into SBCs are permanently exchanged for coins & reward packs.
              </span>
            </div>
          </div>

          {/* Right Column: Live Requirements & Submit (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Challenge Requirements
              </h4>

              <div className="space-y-3">
                {requirementChecks.map((req) => (
                  <div
                    key={req.id}
                    className={`p-3 rounded-xl border transition-colors flex items-start gap-3 ${
                      req.isMet
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        req.isMet ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {req.isMet ? <Check className="w-3.5 h-3.5" /> : '•'}
                    </div>

                    <div className="flex-1 text-xs">
                      <span className="font-semibold">{req.description}</span>
                      <div className="flex items-center justify-between text-[11px] mt-1 opacity-80">
                        <span>Current: {req.result.current}</span>
                        <span>Target: {req.result.target}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Rewards Summary */}
              <div className="pt-4 border-t border-slate-800">
                <span className="text-xs text-slate-400 font-semibold block mb-2">
                  Completion Rewards:
                </span>
                <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-1.5 text-amber-400 font-black text-sm tabular-nums">
                    <Coins className="w-4 h-4" />
                    <span>+{activeChallenge.rewardCoins.toLocaleString()} Coins</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                    <Gift className="w-4 h-4" />
                    <span>{activeChallenge.rewardPackName}</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmitSquad}
                disabled={!canSubmit}
                className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all ${
                  canSubmit
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 hover:scale-[1.02] active:scale-[0.98] shadow-emerald-900/40 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>Submit Squad ({placedCards.length}/{activeChallenge.slots.length})</span>
              </button>
            </div>

            {/* Club Card Picker Modal / Drawer if slot selected */}
            {selectedSlotIndex !== null && (
              <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl p-5 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Select Player for Slot {selectedSlotIndex + 1} ({activeChallenge.slots[selectedSlotIndex].position})
                  </h4>
                  <button
                    onClick={() => setSelectedSlotIndex(null)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                  {availableClubCards.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-6">
                      No eligible cards found in your Club. Open packs or create new cards!
                    </p>
                  ) : (
                    availableClubCards.map((card, idx) => (
                      <div
                        key={`${card.id}_${idx}`}
                        onClick={() => handleAssignCard(card)}
                        className="flex items-center justify-between p-2.5 bg-slate-950 hover:bg-slate-800/80 rounded-xl border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-black text-emerald-400 tabular-nums">
                            {card.rating}
                          </span>
                          <span className="text-xs font-bold text-slate-300">
                            {card.position}
                          </span>
                          <div>
                            <span className="text-xs font-bold text-white block">
                              {card.name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {card.nationFlag} {card.club}
                            </span>
                          </div>
                        </div>

                        {card.isCustom && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" /> Custom
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
