import React, { useState } from 'react';
import { SoccerCard } from '../types/card';
import { CardItem } from './CardItem';
import { FUTMAS_CARDS } from '../data/defaultCards';
import { Sparkles, Gift, Flame, Trophy, Package, ArrowRight, CheckCircle2, Star } from 'lucide-react';
import { sound } from '../utils/audio';

interface FutmasHubProps {
  coins: number;
  clubCards: SoccerCard[];
  onOpenPackStore: (filterCategory?: string) => void;
  onOpenSBCs: (category?: string) => void;
  onClaimHolidayGift: (giftCoins: number, giftPackName: string) => void;
  hasClaimedGift: boolean;
}

export const FutmasHub: React.FC<FutmasHubProps> = ({
  coins,
  clubCards,
  onOpenPackStore,
  onOpenSBCs,
  onClaimHolidayGift,
  hasClaimedGift,
}) => {
  const [selectedPlayer, setSelectedPlayer] = useState<SoccerCard>(FUTMAS_CARDS[0]);

  // Check how many Futmas cards user has in club
  const ownedFutmasCount = clubCards.filter(
    (c) => c.program === 'Futmas' || c.rarity === 'futmas'
  ).length;

  const handleClaim = () => {
    if (hasClaimedGift) return;
    sound.playWalkoutFanfare();
    onClaimHolidayGift(10000, 'Futmas Frost Pack');
  };

  return (
    <div className="space-y-8">
      {/* Hero Festive Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#3b0716] via-[#1a0510] to-[#041c15] border border-cyan-400/40 p-6 sm:p-10 shadow-2xl">
        {/* Ambient background particles */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-cyan-950/80 text-cyan-300 border border-cyan-400/50 flex items-center gap-1.5 shadow-lg">
                <span className="text-cyan-400">❄️</span>
                <span>FUTMAS WINTER EVENT</span>
              </span>
              <span className="text-xs text-rose-300 font-bold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                Special Edition Cards Live
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
              Winter Countdown & Festive Rewards
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Experience the 15 exclusive <strong className="text-rose-400">Futmas Player Cards</strong> styled in festive crimson shield armor with icy gold borders. Complete seasonal SBC puzzles and unwrap holiday packs.
            </p>

            {/* Quick Stats Pill Bar */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-semibold text-slate-300">
              <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Futmas Squad: <strong className="text-white">15 Players</strong></span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
                <Star className="w-4 h-4 text-cyan-400" />
                <span>Owned in Club: <strong className="text-cyan-300">{ownedFutmasCount} / 15</strong></span>
              </div>
            </div>
          </div>

          {/* Holiday Gift Claim Card */}
          <div className="bg-black/60 backdrop-blur-md rounded-2xl border border-rose-500/40 p-5 w-full lg:w-80 flex flex-col justify-between shadow-xl">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <Gift className="w-4 h-4" />
                  Festive Holiday Gift
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-bold">
                  FREE
                </span>
              </div>
              <p className="text-sm font-bold text-white">
                10,000 Coins + Futmas Frost Pack
              </p>
              <p className="text-xs text-slate-400">
                Unwrap your free winter booster pack containing a guaranteed 85+ Futmas special player!
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10">
              {hasClaimedGift ? (
                <div className="w-full py-2.5 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Claimed for Today</span>
                </div>
              ) : (
                <button
                  onClick={handleClaim}
                  className="w-full py-2.5 bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95"
                >
                  <Gift className="w-4 h-4" />
                  <span>Unwrap Holiday Gift</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Roster Showcase & Inspection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Selected Card Spotlight */}
        <div className="lg:col-span-5 bg-gradient-to-b from-slate-900/90 to-slate-950 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center relative shadow-2xl">
          <div className="w-full flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <span>❄️</span>
              Card Showcase
            </span>
            <span className="text-xs font-extrabold text-amber-400">
              Rating {selectedPlayer.rating} · {selectedPlayer.position}
            </span>
          </div>

          <div className="py-4">
            <CardItem card={selectedPlayer} size="walkout" interactive={true} />
          </div>

          {/* Quick Details Matrix */}
          <div className="w-full mt-4 bg-black/50 rounded-2xl p-4 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white">{selectedPlayer.name}</h3>
                <p className="text-xs text-slate-400">
                  {selectedPlayer.club} · {selectedPlayer.league}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-400 block">Market Value</span>
                <span className="text-sm font-extrabold text-amber-400 tabular-nums">
                  {selectedPlayer.price.toLocaleString()} coins
                </span>
              </div>
            </div>

            {/* Outfield 6-stat bar preview */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center">
              <div className="bg-slate-900/60 p-2 rounded-xl">
                <span className="text-[10px] text-slate-400 block font-bold">PAC</span>
                <span className="text-sm font-black text-white tabular-nums">{selectedPlayer.stats.pac}</span>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-xl">
                <span className="text-[10px] text-slate-400 block font-bold">SHO</span>
                <span className="text-sm font-black text-white tabular-nums">{selectedPlayer.stats.sho}</span>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-xl">
                <span className="text-[10px] text-slate-400 block font-bold">PAS</span>
                <span className="text-sm font-black text-white tabular-nums">{selectedPlayer.stats.pas}</span>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-xl">
                <span className="text-[10px] text-slate-400 block font-bold">DRI</span>
                <span className="text-sm font-black text-white tabular-nums">{selectedPlayer.stats.dri}</span>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-xl">
                <span className="text-[10px] text-slate-400 block font-bold">DEF</span>
                <span className="text-sm font-black text-white tabular-nums">{selectedPlayer.stats.def}</span>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-xl">
                <span className="text-[10px] text-slate-400 block font-bold">PHY</span>
                <span className="text-sm font-black text-white tabular-nums">{selectedPlayer.stats.phy}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => onOpenPackStore('Futmas')}
                className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <Package className="w-4 h-4" />
                <span>Open Futmas Packs</span>
              </button>
              <button
                onClick={() => onOpenSBCs('Futmas Special')}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs uppercase tracking-wider rounded-xl border border-cyan-500/30 transition-colors flex items-center justify-center gap-1.5"
              >
                <Trophy className="w-4 h-4" />
                <span>Futmas SBCs</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: 15 Futmas Player Cards Grid */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Full Futmas Player Roster (15 Cards)</span>
            </h2>
            <span className="text-xs text-slate-400">
              Click any card to inspect details
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 max-h-[640px] overflow-y-auto p-1 custom-scrollbar">
            {FUTMAS_CARDS.map((card, idx) => {
              const isSelected = selectedPlayer.id === card.id;
              const isOwned = clubCards.some((c) => c.id === card.id || c.name === card.name);

              return (
                <div
                  key={`${card.id}_${idx}`}
                  onClick={() => {
                    setSelectedPlayer(card);
                    sound.playCardFlip();
                  }}
                  className={`group relative rounded-2xl p-2 cursor-pointer transition-all duration-200 flex flex-col items-center ${
                    isSelected
                      ? 'bg-rose-950/60 ring-2 ring-cyan-400 scale-[1.03] shadow-lg shadow-cyan-900/40'
                      : 'bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800'
                  }`}
                >
                  <CardItem card={card} size="sm" interactive={false} />
                  <div className="text-center mt-2 w-full">
                    <span className="text-xs font-bold text-white truncate block">
                      {card.shortName || card.name}
                    </span>
                    <span className="text-[10px] text-amber-400 font-semibold">
                      {card.rating} · {card.position}
                    </span>
                  </div>

                  {isOwned && (
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-950 text-emerald-300 border border-emerald-400/50 shadow">
                      Owned
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Link Cards to Pack Store & SBCs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div
              onClick={() => onOpenPackStore('Futmas')}
              className="p-5 rounded-2xl bg-gradient-to-r from-red-950/70 to-slate-900 border border-rose-500/40 hover:border-cyan-400 transition-all cursor-pointer group shadow-lg flex items-center justify-between"
            >
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block">
                  Limited Time
                </span>
                <h4 className="text-base font-black text-white group-hover:text-cyan-300 transition-colors">
                  Futmas Frost Packs
                </h4>
                <p className="text-xs text-slate-400">
                  Guaranteed 85+ Futmas star items with custom shield foil
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-rose-400 group-hover:translate-x-1 transition-transform" />
            </div>

            <div
              onClick={() => onOpenSBCs('Futmas Special')}
              className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/70 to-slate-900 border border-emerald-500/40 hover:border-emerald-300 transition-all cursor-pointer group shadow-lg flex items-center justify-between"
            >
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                  Seasonal Challenge
                </span>
                <h4 className="text-base font-black text-white group-hover:text-emerald-300 transition-colors">
                  Festive Wonder SBC
                </h4>
                <p className="text-xs text-slate-400">
                  Submit 80+ squads to claim Futmas Countdown packs
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
