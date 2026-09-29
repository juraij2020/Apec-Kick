import React, { useState } from 'react';
import { SoccerCard, Formation } from '../types/card';
import { CardItem } from './CardItem';
import { FORMATIONS } from '../data/formations';
import { calculateSquadChemistry } from '../utils/chemistry';
import pitchTurfBg from '../assets/images/pitch_turf_texture_1790566408619.jpg';
import { sound } from '../utils/audio';
import { Shield, Sparkles, X, Plus, Wand2, Trash2, Search } from 'lucide-react';

interface SquadBuilderProps {
  clubCards: SoccerCard[];
  formationId: string;
  onChangeFormation: (id: string) => void;
  activeSquadSlots: { [slotId: string]: string | undefined };
  onUpdateSquadSlots: (slots: { [slotId: string]: string | undefined }) => void;
  onNavigateToMatch: () => void;
}

export const SquadBuilder: React.FC<SquadBuilderProps> = ({
  clubCards,
  formationId,
  onChangeFormation,
  activeSquadSlots,
  onUpdateSquadSlots,
  onNavigateToMatch,
}) => {
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [reserveSearch, setReserveSearch] = useState('');
  const [reservePosFilter, setReservePosFilter] = useState<'ALL' | 'FWD' | 'MID' | 'DEF' | 'GK'>('ALL');

  // Map of club cards for fast lookup
  const cardMap = new Map<string, SoccerCard>();
  clubCards.forEach((c) => cardMap.set(c.id, c));

  const currentFormation = FORMATIONS.find((f) => f.id === formationId) || FORMATIONS[0];

  // Calculate chemistry & stats
  const squadStats = calculateSquadChemistry(currentFormation, activeSquadSlots, cardMap);

  // Cards currently on pitch
  const placedCardIds = new Set(
    Object.values(activeSquadSlots).filter((id): id is string => id !== undefined)
  );

  // Available cards for selection with search & position filtering
  const availableCards = clubCards.filter((c) => {
    if (placedCardIds.has(c.id)) return false;
    if (reserveSearch.trim()) {
      const q = reserveSearch.toLowerCase();
      if (!c.name.toLowerCase().includes(q) && !c.club.toLowerCase().includes(q) && !c.nation.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (reservePosFilter === 'FWD' && !['ST', 'CF', 'LW', 'RW'].includes(c.position)) return false;
    if (reservePosFilter === 'MID' && !['CAM', 'CM', 'CDM', 'LM', 'RM'].includes(c.position)) return false;
    if (reservePosFilter === 'DEF' && !['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(c.position)) return false;
    if (reservePosFilter === 'GK' && c.position !== 'GK') return false;
    return true;
  });

  const handleSlotClick = (slotId: string) => {
    setSelectedSlotId(slotId);
    sound.playClick();
  };

  const handleSelectCardForSlot = (card: SoccerCard) => {
    if (!selectedSlotId) return;
    onUpdateSquadSlots({
      ...activeSquadSlots,
      [selectedSlotId]: card.id,
    });
    setSelectedSlotId(null);
    sound.playCardFlip();
  };

  const handleRemoveFromSlot = (slotId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = { ...activeSquadSlots };
    delete next[slotId];
    onUpdateSquadSlots(next);
    sound.playClick();
  };

  const handleAutoBuild = () => {
    sound.playClick();
    const newSlots: { [slotId: string]: string } = {};
    const usedIds = new Set<string>();

    // Sort club cards by rating descending
    const sorted = [...clubCards].sort((a, b) => b.rating - a.rating);

    currentFormation.slots.forEach((slot) => {
      // Find matching position first
      const candidate = sorted.find(
        (c) => !usedIds.has(c.id) && c.position === slot.position
      ) || sorted.find((c) => !usedIds.has(c.id));

      if (candidate) {
        newSlots[slot.id] = candidate.id;
        usedIds.add(candidate.id);
      }
    });

    onUpdateSquadSlots(newSlots);
    sound.playGoalCheer();
  };

  const handleClearSquad = () => {
    sound.playClick();
    onUpdateSquadSlots({});
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top HUD Squad Overview */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Formation selector */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Formation
          </span>
          <div className="flex gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl">
            {FORMATIONS.map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  onChangeFormation(f.id);
                  sound.playClick();
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  formationId === f.id
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f.id}
              </button>
            ))}
          </div>
        </div>

        {/* Center: Rating & Chemistry Gauges */}
        <div className="flex items-center gap-6">
          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Squad Rating
            </span>
            <span className="text-2xl font-black text-amber-400 tabular-nums">
              {squadStats.averageRating || '--'}
            </span>
          </div>

          <div className="w-[1px] h-8 bg-slate-800" />

          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Chemistry
            </span>
            <div className="flex items-center gap-1">
              <span className="text-2xl font-black text-emerald-400 tabular-nums">
                {squadStats.totalChemistry}
              </span>
              <span className="text-xs text-slate-500 font-bold">/33</span>
            </div>
          </div>

          <div className="w-[1px] h-8 bg-slate-800" />

          <div className="hidden sm:flex items-center gap-3 text-xs">
            <div className="text-center">
              <span className="text-[9px] text-slate-400 uppercase">ATT</span>
              <span className="block font-bold text-white tabular-nums">{squadStats.attackRating || '--'}</span>
            </div>
            <div className="text-center">
              <span className="text-[9px] text-slate-400 uppercase">MID</span>
              <span className="block font-bold text-white tabular-nums">{squadStats.midfieldRating || '--'}</span>
            </div>
            <div className="text-center">
              <span className="text-[9px] text-slate-400 uppercase">DEF</span>
              <span className="block font-bold text-white tabular-nums">{squadStats.defenseRating || '--'}</span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleAutoBuild}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/40 rounded-xl transition-colors"
            title="Auto-fill best available players"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Best Squad</span>
          </button>

          <button
            onClick={handleClearSquad}
            className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-slate-800 transition-colors"
            title="Clear squad"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={onNavigateToMatch}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            Play Match &rarr;
          </button>
        </div>
      </div>

      {/* Main Pitch Arena & Selection Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Tactical Pitch Surface (8 cols on lg) */}
        <div className="lg:col-span-8 relative rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800">
          {/* Pitch grass background */}
          <div
            className="relative w-full h-[660px] sm:h-[720px] bg-cover bg-center"
            style={{ backgroundImage: `url(${pitchTurfBg})` }}
          >
            {/* White Chalk Line Markings */}
            <div className="absolute inset-4 border-2 border-white/40 pointer-events-none rounded-xl">
              {/* Half-way line */}
              <div className="absolute inset-x-0 top-1/2 h-[2px] bg-white/40" />
              {/* Center Circle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-2 border-white/40" />
              {/* Penalty Box Top */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-56 h-28 border-b-2 border-x-2 border-white/40" />
              {/* Penalty Box Bottom */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-56 h-28 border-t-2 border-x-2 border-white/40" />
            </div>

            {/* Dark Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/50 pointer-events-none" />

            {/* Slots on Pitch */}
            {currentFormation.slots.map((slot) => {
              const cardId = activeSquadSlots[slot.id];
              const card = cardId ? cardMap.get(cardId) : undefined;
              const chemInfo = card ? squadStats.playerChem[card.id] : undefined;

              return (
                <div
                  key={slot.id}
                  style={{
                    left: `${slot.x}%`,
                    top: `${slot.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className="absolute z-10 flex flex-col items-center"
                >
                  {card ? (
                    <div className="relative group cursor-pointer" onClick={() => handleSlotClick(slot.id)}>
                      <CardItem
                        card={card}
                        size="sm"
                        interactive={false}
                        chemistry={chemInfo?.chemistry}
                        isOutOfPosition={chemInfo?.isOutOfPosition}
                      />
                      <button
                        onClick={(e) => handleRemoveFromSlot(slot.id, e)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-600 hover:bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 shadow transition-opacity"
                        title="Remove player"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSlotClick(slot.id)}
                      className="w-[95px] h-[135px] rounded-2xl border-2 border-dashed border-white/50 hover:border-emerald-400 bg-black/50 hover:bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-1 transition-all group hover:scale-105"
                    >
                      <span className="text-xs font-black text-white uppercase group-hover:text-emerald-400">
                        {slot.position}
                      </span>
                      <div className="w-7 h-7 rounded-full bg-white/20 group-hover:bg-emerald-500/30 flex items-center justify-center text-white group-hover:text-emerald-300">
                        <Plus className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] text-white/60">Tap to add</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Drawer: Slot Selection & Club Cards (4 cols on lg) */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {selectedSlotId ? `Select Player for ${selectedSlotId.toUpperCase()}` : 'Club Reserves'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {selectedSlotId ? 'Choose a player from your club' : 'Click any empty slot on pitch to assign'}
              </p>
            </div>
            {selectedSlotId && (
              <button
                onClick={() => setSelectedSlotId(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            )}
          </div>

          {/* Search & Position Filters for Reserves */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={reserveSearch}
                onChange={(e) => setReserveSearch(e.target.value)}
                placeholder="Search reserves..."
                className="w-full pl-8 pr-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              {reserveSearch && (
                <button
                  onClick={() => setReserveSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1">
              {(['ALL', 'FWD', 'MID', 'DEF', 'GK'] as const).map((pos) => (
                <button
                  key={pos}
                  onClick={() => {
                    setReservePosFilter(pos);
                    sound.playClick();
                  }}
                  className={`flex-1 py-1 text-[10px] font-bold rounded transition-colors ${
                    reservePosFilter === pos
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-[520px] overflow-y-auto space-y-2 pr-1">
            {availableCards.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs">
                {reserveSearch || reservePosFilter !== 'ALL' 
                  ? 'No reserves match your search filter.' 
                  : 'No spare players available in Club. Open more booster packs or check the Transfer Market!'}
              </div>
            ) : (
              availableCards.map((card, idx) => (
                <div
                  key={`${card.id}_${idx}`}
                  onClick={() => {
                    if (selectedSlotId) {
                      handleSelectCardForSlot(card);
                    } else {
                      // If no slot is selected, find the first matching empty slot
                      const emptySlot = currentFormation.slots.find(
                        (s) => !activeSquadSlots[s.id] && s.position === card.position
                      ) || currentFormation.slots.find((s) => !activeSquadSlots[s.id]);

                      if (emptySlot) {
                        onUpdateSquadSlots({
                          ...activeSquadSlots,
                          [emptySlot.id]: card.id,
                        });
                        sound.playCardFlip();
                      }
                    }
                  }}
                  className="flex items-center justify-between p-2.5 bg-slate-950 hover:bg-slate-800 rounded-xl border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base font-black text-amber-400 tabular-nums">
                      {card.rating}
                    </span>
                    <span className="text-xs font-bold text-slate-300">
                      {card.position}
                    </span>
                    <div className="truncate max-w-[120px]">
                      <span className="text-xs font-bold text-white block truncate">
                        {card.name}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate block">
                        {card.nationFlag} {card.club}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {card.isCustom && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" /> Custom
                      </span>
                    )}
                    <span className="text-xs text-slate-500 hover:text-emerald-400">
                      &rarr;
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
