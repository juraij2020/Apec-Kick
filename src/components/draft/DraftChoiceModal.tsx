import React from 'react';
import { SoccerCard } from '../../types/card';
import { DraftSlot } from '../../types/draft';
import { CardItem } from '../CardItem';
import { sound } from '../../utils/audio';
import { Sparkles, X, Check, Shield, Flame, Award } from 'lucide-react';

interface DraftChoiceModalProps {
  slot: DraftSlot | null;
  choices: SoccerCard[];
  onSelectCard: (card: SoccerCard) => void;
  onClose: () => void;
}

export const DraftChoiceModal: React.FC<DraftChoiceModalProps> = ({
  slot,
  choices,
  onSelectCard,
  onClose,
}) => {
  if (!slot || choices.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border border-amber-500/30 rounded-3xl p-5 sm:p-8 shadow-2xl shadow-amber-950/40 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black tracking-wider uppercase bg-amber-500/20 border border-amber-500/40 text-amber-300">
                {slot.type === 'starting' ? 'Starting XI Slot' : slot.type === 'bench' ? 'Bench Substitute' : 'Reserve Slot'}
              </span>
              <span className="text-xs text-slate-400 font-semibold">Position: {slot.position}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-500">
              Draft Player Choice
            </h2>
            <p className="text-sm text-slate-400">
              Pick 1 of 5 elite players to strengthen your squad chemistry and rating.
            </p>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 5 Card Choices Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 my-6">
          {choices.map((card, idx) => {
            const isExactPos = card.position === slot.position;

            return (
              <div
                key={card.id || idx}
                onClick={() => {
                  sound.playSuccess();
                  onSelectCard(card);
                }}
                className="group relative flex flex-col items-center bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 hover:border-amber-400/80 rounded-2xl p-3 cursor-pointer transition-all duration-200 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-amber-500/10"
              >
                {/* Top Badge: Exact or Compatible Position */}
                <div className="w-full flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                      isExactPos
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                    }`}
                  >
                    {isExactPos ? '✓ Exact Pos' : card.position}
                  </span>
                  <span className="text-[11px] font-bold text-amber-400">Choice #{idx + 1}</span>
                </div>

                {/* Card Item */}
                <div className="transform transition-transform duration-200 group-hover:scale-105 pointer-events-none mb-3">
                  <CardItem card={card} size="sm" />
                </div>

                {/* Player Metadata & Quick Stats */}
                <div className="w-full text-center mt-auto pt-2 border-t border-slate-700/50">
                  <div className="font-black text-sm text-white truncate">{card.name}</div>
                  <div className="text-xs text-slate-400 truncate">
                    {card.club} · {card.nation}
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-1.5 text-[11px] font-bold text-slate-300">
                    <span className="text-amber-300">{card.rating} OVR</span>
                    <span>·</span>
                    <span>{card.position}</span>
                    <span>·</span>
                    <span className="text-slate-400">{card.league}</span>
                  </div>
                </div>

                {/* Pick Button */}
                <button
                  type="button"
                  className="w-full mt-3 py-1.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider text-slate-900 bg-gradient-to-r from-amber-300 to-yellow-400 group-hover:from-yellow-300 group-hover:to-amber-400 shadow-md group-hover:shadow-amber-500/25 transition-all flex items-center justify-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  Select Card
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-500">
          <span>Tip: You can swap starting players with bench and reserves anytime to maximize chemistry.</span>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="text-slate-400 hover:text-white underline font-semibold"
          >
            Cancel Selection
          </button>
        </div>
      </div>
    </div>
  );
};
