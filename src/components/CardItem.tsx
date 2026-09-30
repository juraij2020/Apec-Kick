import React, { useRef, useState } from 'react';
import { SoccerCard } from '../types/card';
import { generateUserCardSvg } from '../data/defaultCards';

interface CardItemProps {
  card: SoccerCard;
  size?: 'sm' | 'md' | 'lg' | 'walkout';
  interactive?: boolean;
  chemistry?: number; // 0 to 3
  isOutOfPosition?: boolean;
  onClick?: () => void;
  showQuickSell?: boolean;
  onQuickSell?: () => void;
}

export const CardItem: React.FC<CardItemProps> = ({
  card,
  size = 'md',
  interactive = true,
  chemistry,
  isOutOfPosition,
  onClick,
  showQuickSell,
  onQuickSell,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || size === 'sm') return;
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setRotateX(-(y / rect.height) * 16);
    setRotateY((x / rect.width) * 16);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  // Dimensions by size (maintaining 644x900 aspect ratio)
  const sizeConfig = {
    sm: {
      w: 'w-[100px]',
      h: 'h-[140px]',
    },
    md: {
      w: 'w-[180px]',
      h: 'h-[252px]',
    },
    lg: {
      w: 'w-[240px]',
      h: 'h-[335px]',
    },
    walkout: {
      w: 'w-[280px] sm:w-[330px]',
      h: 'h-[390px] sm:h-[460px]',
    },
  };

  const cfg = sizeConfig[size];

  // Resolve card graphic: use custom-designed shield SVG or generate dynamically
  const cardGraphicSrc = card.fullCardImage || generateUserCardSvg(
    card.name,
    card.rating,
    card.position,
    card.stats,
    card.nationFlag,
    card.club,
    card.photoUrl || '⚽',
    card.cardStyle || (card.program === 'Street Kings' ? 'street_kings_urban' : card.program === 'Summer Transfers' ? 'summer_basic' : card.program === 'Hall of Fame' ? 'hof_gold_obsidian' : card.program === 'Futmas' ? 'futmas_crimson' : card.rarity === 'base' ? 'classic_gold' : 'hof_gold_obsidian'),
    card.playStylePlus
  );

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: rotateX === 0 && rotateY === 0 ? 'transform 0.4s ease-out' : 'none',
      }}
      className={`relative select-none transition-shadow group ${cfg.w} ${cfg.h} ${
        interactive ? 'cursor-pointer hover:scale-[1.03]' : ''
      }`}
    >
      {/* Container with exact drop shadow */}
      <div className="relative w-full h-full flex items-center justify-center filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.65)]">
        {/* Exact User-Designed Shield Card Vector */}
        <img
          src={cardGraphicSrc}
          alt={card.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain pointer-events-none select-none"
        />

        {/* Dynamic Holographic Foil Light Glint */}
        <div
          className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden opacity-30 mix-blend-color-dodge transition-opacity"
          style={{
            background: `radial-gradient(circle at ${50 + rotateY * 2}% ${
              50 + rotateX * 2
            }%, rgba(255,255,255,0.45) 0%, rgba(255,215,0,0.15) 40%, transparent 70%)`,
          }}
        />

        {/* PlayStyle Badge(s) Floating Overlay with Tooltip */}
        {size !== 'sm' && (
          card.playStyles && card.playStyles.length > 0 ? (
            <div className="absolute top-2 left-2 z-20 flex flex-col gap-1">
              {card.playStyles.map((ps, idx) => {
                const isPlus = ps.isPlus !== false;
                return (
                  <div key={idx} className="relative group/ps">
                    <div className={`flex items-center gap-1 border px-1.5 py-0.5 rounded-full cursor-help transition-transform hover:scale-110 shadow-md ${
                      isPlus 
                        ? 'bg-gradient-to-r from-amber-950/95 to-zinc-950/95 border-amber-500/80 text-amber-300' 
                        : 'bg-zinc-900/95 border-slate-600/80 text-slate-200'
                    }`}>
                      <span className="text-xs">{ps.iconSymbol}</span>
                      <span className="text-[9px] font-black uppercase tracking-wider">
                        {ps.name.replace('+', '')}
                        {isPlus && <span className="text-yellow-400 font-black">+</span>}
                      </span>
                    </div>

                    {/* Hover Tooltip */}
                    <div className="absolute left-0 top-full mt-1 w-52 p-2.5 bg-zinc-950/95 border border-amber-500/60 rounded-lg shadow-2xl opacity-0 pointer-events-none group-hover/ps:opacity-100 transition-opacity z-50 text-left backdrop-blur-md">
                      <div className="flex items-center justify-between text-[11px] font-bold text-amber-400 pb-1 border-b border-amber-500/20">
                        <span>{ps.name}</span>
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1 py-0.5 rounded uppercase font-mono">
                          +{ps.statBoost.bonus} {ps.statBoost.attribute}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-300 mt-1 leading-snug">
                        {ps.shortDesc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : card.playStylePlus ? (
            <div className="absolute top-2 left-2 z-20 group/ps">
              <div className="flex items-center gap-1 bg-gradient-to-r from-amber-950/90 to-black/90 border border-amber-500/70 shadow-[0_0_10px_rgba(234,179,8,0.4)] px-1.5 py-0.5 rounded-full cursor-help transition-transform hover:scale-110">
                <span className="text-xs">{card.playStylePlus.iconSymbol}</span>
                <span className="text-[9px] font-black uppercase tracking-wider text-amber-300">
                  {card.playStylePlus.id.replace('_', ' ')}
                  <span className="text-yellow-400 font-black">+</span>
                </span>
              </div>

              {/* Hover Tooltip */}
              <div className="absolute left-0 top-full mt-1 w-48 p-2 bg-zinc-950/95 border border-amber-500/60 rounded-lg shadow-2xl opacity-0 pointer-events-none group-hover/ps:opacity-100 transition-opacity z-50 text-left backdrop-blur-md">
                <div className="flex items-center justify-between text-[11px] font-bold text-amber-400 pb-1 border-b border-amber-500/20">
                  <span>{card.playStylePlus.name}</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1 py-0.5 rounded uppercase font-mono">
                    +{card.playStylePlus.statBoost.bonus} {card.playStylePlus.statBoost.attribute}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-300 mt-1 leading-snug">
                  {card.playStylePlus.shortDesc}
                </p>
              </div>
            </div>
          ) : null
        )}

        {/* Chemistry diamonds for Squad Builder */}
        {chemistry !== undefined && (
          <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-black/75 backdrop-blur-sm px-1.5 py-1 rounded shadow-md z-20">
            {[1, 2, 3].map((val) => (
              <div
                key={val}
                className={`w-2 h-2 rotate-45 transition-colors ${
                  isOutOfPosition
                    ? 'bg-rose-500'
                    : val <= chemistry
                    ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]'
                    : 'bg-zinc-600'
                }`}
              />
            ))}
          </div>
        )}

        {/* Quick Sell Overlay if requested */}
        {showQuickSell && onQuickSell && (
          <div className="absolute inset-x-2 bottom-3 p-2 bg-black/90 backdrop-blur-md z-30 flex items-center justify-between rounded-lg border border-amber-500/40 shadow-xl">
            <span className="text-xs text-amber-400 font-bold tabular-nums">
              +{card.price.toLocaleString()} coins
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickSell();
              }}
              className="text-[10px] bg-rose-600 hover:bg-rose-500 text-white font-bold px-2 py-1 rounded transition-colors shadow-sm"
            >
              Quick Sell
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
