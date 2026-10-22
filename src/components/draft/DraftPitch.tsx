import React from 'react';
import { DraftSlot } from '../../types/draft';
import { Formation, SoccerCard } from '../../types/card';
import { CardItem } from '../CardItem';
import { Plus, ArrowLeftRight, X, Sparkles, Shield, User } from 'lucide-react';
import { sound } from '../../utils/audio';

interface DraftPitchProps {
  formation: Formation;
  startingSlots: DraftSlot[];
  benchSlots: DraftSlot[];
  reserveSlots: DraftSlot[];
  onSlotClick: (slot: DraftSlot) => void;
  selectedSwapSlot: DraftSlot | null;
  onClearSwap: () => void;
}

export const DraftPitch: React.FC<DraftPitchProps> = ({
  formation,
  startingSlots,
  benchSlots,
  reserveSlots,
  onSlotClick,
  selectedSwapSlot,
  onClearSwap,
}) => {
  return (
    <div className="w-full flex flex-col gap-6">
      {/* Swap Mode Indicator Bar */}
      {selectedSwapSlot && (
        <div className="flex items-center justify-between p-3 px-4 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-sm font-semibold animate-pulse">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-amber-300" />
            <span>
              Swap Mode: Select another slot to swap with <strong>{selectedSwapSlot.card?.name || selectedSwapSlot.label}</strong>
            </span>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClearSwap();
            }}
            className="flex items-center gap-1 text-xs text-amber-300 hover:text-white uppercase font-bold tracking-wider px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Cancel
          </button>
        </div>
      )}

      {/* The Soccer Pitch (Starting 11) */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] max-h-[640px] bg-gradient-to-b from-emerald-900 via-emerald-800 to-green-950 rounded-3xl border-2 border-emerald-600/40 shadow-2xl shadow-emerald-950/60 overflow-hidden select-none">
        {/* Grass Texture & Pitch Lines */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
        
        {/* Field Markings */}
        {/* Center Circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-44 sm:h-44 rounded-full border border-white/20 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/40 pointer-events-none" />
        {/* Halfway Line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/20 pointer-events-none" />
        {/* Penalty Areas */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 sm:w-72 h-20 sm:h-28 border-b border-x border-white/20 rounded-b-xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 sm:w-72 h-20 sm:h-28 border-t border-x border-white/20 rounded-t-xl pointer-events-none" />

        {/* Starting 11 Slots */}
        {startingSlots.map((slot) => {
          const isSelected = selectedSwapSlot?.id === slot.id;
          const xPos = slot.x !== undefined ? slot.x : 50;
          const yPos = slot.y !== undefined ? slot.y : 50;

          return (
            <div
              key={slot.id}
              style={{
                left: `${xPos}%`,
                top: `${yPos}%`,
                transform: 'translate(-50%, -50%)',
              }}
              onClick={() => {
                sound.playClick();
                onSlotClick(slot);
              }}
              className={`absolute cursor-pointer transition-all duration-200 z-10 ${
                isSelected ? 'scale-110 ring-4 ring-amber-400 rounded-xl shadow-xl shadow-amber-400/30' : 'hover:scale-105'
              }`}
            >
              {slot.card ? (
                <div className="relative group">
                  <div className="pointer-events-none scale-75 sm:scale-90 origin-center">
                    <CardItem card={slot.card} size="sm" />
                  </div>
                  {/* Position Pill */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-slate-900/90 border border-slate-700 text-[10px] font-black text-amber-300 uppercase shadow-md whitespace-nowrap">
                    {slot.position}
                  </div>
                </div>
              ) : (
                <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-2xl border-2 border-dashed border-white/40 hover:border-amber-400 bg-slate-900/60 hover:bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-1 shadow-lg transition-colors group">
                  <div className="w-6 h-6 rounded-full bg-white/10 group-hover:bg-amber-400 group-hover:text-slate-900 flex items-center justify-center text-white text-xs mb-1 transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-black text-white group-hover:text-amber-300 uppercase tracking-wider">
                    {slot.position}
                  </span>
                  <span className="text-[9px] text-slate-300 font-semibold">Pick</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bench Section (7 Slots) */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Bench Substitutes ({benchSlots.filter((s) => s.card).length}/7)
            </h3>
          </div>
          <span className="text-xs text-slate-400">Click to draft or swap with pitch</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {benchSlots.map((slot) => {
            const isSelected = selectedSwapSlot?.id === slot.id;

            return (
              <div
                key={slot.id}
                onClick={() => {
                  sound.playClick();
                  onSlotClick(slot);
                }}
                className={`relative cursor-pointer transition-all duration-200 rounded-xl p-2 flex flex-col items-center justify-center min-h-[96px] ${
                  isSelected
                    ? 'ring-2 ring-amber-400 bg-amber-500/10'
                    : 'bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600'
                }`}
              >
                {slot.card ? (
                  <div className="w-full flex flex-col items-center">
                    <div className="pointer-events-none scale-75 origin-top -mb-6">
                      <CardItem card={slot.card} size="sm" />
                    </div>
                    <div className="w-full text-center mt-6">
                      <div className="text-[11px] font-bold text-white truncate">{slot.card.name}</div>
                      <div className="text-[10px] text-amber-400 font-black">
                        {slot.card.rating} · {slot.card.position}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center text-slate-400 hover:text-white">
                    <Plus className="w-5 h-5 mb-1 text-slate-400" />
                    <span className="text-[11px] font-black uppercase text-amber-300/90">{slot.label}</span>
                    <span className="text-[9px] text-slate-500 font-semibold">{slot.position}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Reserves Section (5 Slots) */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Reserves ({reserveSlots.filter((s) => s.card).length}/5)
            </h3>
          </div>
          <span className="text-xs text-slate-400">Tactical depth & wildcard flex</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {reserveSlots.map((slot) => {
            const isSelected = selectedSwapSlot?.id === slot.id;

            return (
              <div
                key={slot.id}
                onClick={() => {
                  sound.playClick();
                  onSlotClick(slot);
                }}
                className={`relative cursor-pointer transition-all duration-200 rounded-xl p-2 flex flex-col items-center justify-center min-h-[96px] ${
                  isSelected
                    ? 'ring-2 ring-cyan-400 bg-cyan-500/10'
                    : 'bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600'
                }`}
              >
                {slot.card ? (
                  <div className="w-full flex flex-col items-center">
                    <div className="pointer-events-none scale-75 origin-top -mb-6">
                      <CardItem card={slot.card} size="sm" />
                    </div>
                    <div className="w-full text-center mt-6">
                      <div className="text-[11px] font-bold text-white truncate">{slot.card.name}</div>
                      <div className="text-[10px] text-cyan-400 font-black">
                        {slot.card.rating} · {slot.card.position}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center text-slate-400 hover:text-white">
                    <Plus className="w-5 h-5 mb-1 text-slate-400" />
                    <span className="text-[11px] font-black uppercase text-cyan-300/90">{slot.label}</span>
                    <span className="text-[9px] text-slate-500 font-semibold">{slot.position}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
