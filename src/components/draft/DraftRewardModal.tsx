import React from 'react';
import { Trophy, Coins, PackageOpen, Sparkles, Check, ArrowRight } from 'lucide-react';
import { sound } from '../../utils/audio';
import confetti from 'canvas-confetti';

interface DraftRewardModalProps {
  isOpen: boolean;
  coinsWon: number;
  packName: string;
  dayConditionBonus: boolean;
  onClaim: () => void;
}

export const DraftRewardModal: React.FC<DraftRewardModalProps> = ({
  isOpen,
  coinsWon,
  packName,
  dayConditionBonus,
  onClaim,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border-2 border-amber-400 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-500/30 text-center flex flex-col items-center">
        {/* Glowing Trophy Icon */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 flex items-center justify-center text-5xl shadow-2xl shadow-yellow-500/50 mb-4 animate-bounce">
          🏆
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 mb-2">
          Knockout Tournament Champion!
        </span>

        <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-500">
          CHAMPIONSHIP GLORY
        </h2>

        <p className="text-sm text-slate-300 mt-2 max-w-sm">
          You went undefeated through the Round of 16, Quarter-Finals, Semi-Finals, and Final!
        </p>

        {/* Rewards Box */}
        <div className="w-full my-6 p-4 rounded-2xl bg-slate-800/80 border border-amber-500/40 flex flex-col gap-3">
          {/* Pack Reward */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-700">
            <div className="flex items-center gap-3 text-left">
              <PackageOpen className="w-8 h-8 text-amber-400" />
              <div>
                <span className="text-[10px] font-black uppercase text-amber-400">Grand Prize Pack</span>
                <div className="font-black text-white text-sm sm:text-base">{packName}</div>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              Unopened
            </span>
          </div>

          {/* Coin Reward */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-700">
            <div className="flex items-center gap-3 text-left">
              <Coins className="w-8 h-8 text-yellow-400" />
              <div>
                <span className="text-[10px] font-black uppercase text-amber-400">Tournament Purse</span>
                <div className="font-black text-yellow-300 text-lg">+{coinsWon.toLocaleString()} Coins</div>
              </div>
            </div>
            <span className="text-xs font-bold text-yellow-400 bg-yellow-500/10 px-2.5 py-1 rounded-lg border border-yellow-500/20">
              Credited
            </span>
          </div>

          {/* Draft of the Day Bonus if met */}
          {dayConditionBonus && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs">
              <div className="flex items-center gap-2 text-emerald-300 font-bold">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Draft of the Day Condition Completed!</span>
              </div>
              <span className="font-black text-yellow-400">+5,000 Coins</span>
            </div>
          )}
        </div>

        {/* Claim CTA */}
        <button
          onClick={() => {
            sound.playSuccess();
            onClaim();
          }}
          className="w-full py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 hover:from-yellow-200 hover:to-amber-400 text-slate-950 shadow-xl shadow-amber-500/40 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
        >
          <span>Claim Rewards & Open in My Packs</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
