import React, { useState, useMemo } from 'react';
import { SoccerCard, Position } from '../types/card';
import { CardItem } from './CardItem';
import { sound } from '../utils/audio';
import { 
  Trophy, 
  Sparkles, 
  Flame, 
  Shield, 
  ChevronRight, 
  Zap, 
  Layers, 
  Filter, 
  X, 
  Swords, 
  Package, 
  Compass, 
  Award,
  Search,
  ExternalLink
} from 'lucide-react';

interface InternationalMomentsHubProps {
  cards: SoccerCard[];
  onNavigateToPacks: (filter?: string) => void;
  onNavigateToSBCs: (category?: string) => void;
  onNavigateToClash: () => void;
  onAddCardToSquad?: (card: SoccerCard) => void;
}

type NationFilter = 'ALL' | 'Argentina' | 'Belgium' | 'Brazil';

export const InternationalMomentsHub: React.FC<InternationalMomentsHubProps> = ({
  cards,
  onNavigateToPacks,
  onNavigateToSBCs,
  onNavigateToClash,
  onAddCardToSquad,
}) => {
  const [selectedNation, setSelectedNation] = useState<NationFilter>('ALL');
  const [positionFilter, setPositionFilter] = useState<'ALL' | 'FWD' | 'MID' | 'DEF' | 'GK'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCard, setSelectedCard] = useState<SoccerCard | null>(null);

  // Filter only International Moments cards with unique IDs
  const intlCards = useMemo(() => {
    const map = new Map<string, SoccerCard>();
    cards.forEach((c) => {
      if (c.program === 'International Moments' || c.rarity === 'international_moments') {
        map.set(c.id, c);
      }
    });
    return Array.from(map.values());
  }, [cards]);

  // Apply filters
  const filteredCards = useMemo(() => {
    return intlCards.filter((card) => {
      // Nation match
      if (selectedNation !== 'ALL' && card.nation !== selectedNation) {
        return false;
      }

      // Position group match
      if (positionFilter === 'FWD' && !['ST', 'CF', 'LW', 'RW'].includes(card.position)) {
        return false;
      }
      if (positionFilter === 'MID' && !['CAM', 'CM', 'CDM', 'LM', 'RM'].includes(card.position)) {
        return false;
      }
      if (positionFilter === 'DEF' && !['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(card.position)) {
        return false;
      }
      if (positionFilter === 'GK' && card.position !== 'GK') {
        return false;
      }

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          card.name.toLowerCase().includes(q) ||
          card.nation.toLowerCase().includes(q) ||
          card.position.toLowerCase().includes(q) ||
          (card.momentTitle && card.momentTitle.toLowerCase().includes(q))
        );
      }

      return true;
    }).sort((a, b) => b.rating - a.rating);
  }, [intlCards, selectedNation, positionFilter, searchQuery]);

  // Nation Captains for Spotlight
  const captains: Record<string, SoccerCard | undefined> = {
    Brazil: intlCards.find((c) => c.id === 'intl-pele'),
    Belgium: intlCards.find((c) => c.id === 'intl-de-bruyne'),
    Argentina: intlCards.find((c) => c.id === 'intl-maradona'),
  };

  const spotlightCard = selectedNation !== 'ALL' && captains[selectedNation]
    ? captains[selectedNation]
    : intlCards.find((c) => c.id === 'intl-maradona') || intlCards[0];

  const nationMeta: Record<string, { flag: string; crest: string; name: string; tag: string; gradient: string; accent: string }> = {
    Argentina: {
      flag: '🇦🇷',
      crest: 'AFA',
      name: 'Argentina',
      tag: 'La Albiceleste · 3x World Champions',
      gradient: 'from-sky-950/60 via-slate-900/90 to-black',
      accent: 'border-sky-400 text-sky-300',
    },
    Belgium: {
      flag: '🇧🇪',
      crest: 'RBFA',
      name: 'Belgium',
      tag: 'The Red Devils · Golden Era Legends',
      gradient: 'from-red-950/60 via-slate-900/90 to-black',
      accent: 'border-rose-500 text-rose-300',
    },
    Brazil: {
      flag: '🇧🇷',
      crest: 'CBF',
      name: 'Brazil',
      tag: 'A Seleção · 5x World Champions · Joga Bonito',
      gradient: 'from-emerald-950/60 via-slate-900/90 to-black',
      accent: 'border-emerald-400 text-emerald-300',
    },
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-amber-500/40 bg-gradient-to-br from-amber-950/40 via-slate-950 to-black shadow-2xl p-6 md:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-black tracking-wide uppercase">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>International Football League · Special Collection</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white uppercase">
              International <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500">Moments</span>
            </h1>

            <p className="text-sm md:text-base text-slate-300 leading-relaxed">
              24 iconic international tournament masterclasses from <span className="text-sky-300 font-bold">Argentina 🇦🇷</span>, <span className="text-rose-300 font-bold">Belgium 🇧🇪</span>, and <span className="text-emerald-300 font-bold">Brazil 🇧🇷</span>. Featuring authentic radiant gold card shields, stacked PlayStyle badges, national crests, and tournament clash ladders.
            </p>

            {/* Quick Action Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={() => {
                  sound.playClick();
                  onNavigateToPacks('International Moments');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-transform hover:scale-105"
              >
                <Package className="w-4 h-4" />
                <span>Open National Packs</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onNavigateToSBCs('International Moments');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
              >
                <Award className="w-4 h-4 text-amber-400" />
                <span>National SBCs</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onNavigateToClash();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
              >
                <Swords className="w-4 h-4 text-rose-400" />
                <span>Tournament Clash</span>
              </button>
            </div>
          </div>

          {/* Captain Spotlight Mini Card in Hero */}
          {spotlightCard && (
            <div 
              onClick={() => {
                sound.playClick();
                setSelectedCard(spotlightCard);
              }}
              className="relative cursor-pointer group flex flex-col items-center"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-2xl blur-xl group-hover:opacity-100 transition-opacity opacity-75" />
              <div className="relative">
                <CardItem card={spotlightCard} size="lg" />
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/85 border border-amber-500/60 px-3 py-1 rounded-full text-[10px] font-black uppercase text-amber-300 tracking-wider flex items-center gap-1 shadow-lg">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Click to Enshrine</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* National Team Switcher Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => {
            sound.playClick();
            setSelectedNation('ALL');
          }}
          className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
            selectedNation === 'ALL'
              ? 'bg-amber-950/40 border-amber-400 text-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.2)]'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
          }`}
        >
          <div>
            <div className="text-xs font-black uppercase tracking-wider">All Moments</div>
            <div className="text-xl font-black text-white mt-1">24 Cards</div>
            <div className="text-[11px] text-slate-400 mt-0.5">3 Nations · Triple Crests</div>
          </div>
          <span className="text-2xl">🌍</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setSelectedNation('Argentina');
          }}
          className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
            selectedNation === 'Argentina'
              ? 'bg-sky-950/50 border-sky-400 text-sky-300 shadow-[0_0_20px_rgba(56,189,248,0.2)]'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
          }`}
        >
          <div>
            <div className="text-xs font-black uppercase tracking-wider flex items-center gap-1 text-sky-400">
              <span>Argentina</span>
              <span className="text-[10px] px-1 bg-sky-500/20 rounded">AFA</span>
            </div>
            <div className="text-xl font-black text-white mt-1">8 Cards</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Maradona · Messi · Enzo</div>
          </div>
          <span className="text-3xl">🇦🇷</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setSelectedNation('Belgium');
          }}
          className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
            selectedNation === 'Belgium'
              ? 'bg-red-950/50 border-rose-500 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.2)]'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
          }`}
        >
          <div>
            <div className="text-xs font-black uppercase tracking-wider flex items-center gap-1 text-rose-400">
              <span>Belgium</span>
              <span className="text-[10px] px-1 bg-rose-500/20 rounded">RBFA</span>
            </div>
            <div className="text-xl font-black text-white mt-1">8 Cards</div>
            <div className="text-[11px] text-slate-400 mt-0.5">De Bruyne · Hazard · Courtois</div>
          </div>
          <span className="text-3xl">🇧🇪</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setSelectedNation('Brazil');
          }}
          className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
            selectedNation === 'Brazil'
              ? 'bg-emerald-950/50 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.2)]'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
          }`}
        >
          <div>
            <div className="text-xs font-black uppercase tracking-wider flex items-center gap-1 text-emerald-400">
              <span>Brazil</span>
              <span className="text-[10px] px-1 bg-emerald-500/20 rounded">CBF</span>
            </div>
            <div className="text-xl font-black text-white mt-1">8 Cards</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Pelé · R9 · Ronaldinho</div>
          </div>
          <span className="text-3xl">🇧🇷</span>
        </button>
      </div>

      {/* Nation Details Bar if specific nation selected */}
      {selectedNation !== 'ALL' && (
        <div className={`p-4 rounded-2xl border bg-gradient-to-r ${nationMeta[selectedNation].gradient} border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4`}>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{nationMeta[selectedNation].flag}</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white uppercase">{nationMeta[selectedNation].name} International Moments</h3>
                <span className="text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full">
                  Official {nationMeta[selectedNation].crest}
                </span>
              </div>
              <p className="text-xs text-slate-300">{nationMeta[selectedNation].tag}</p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onNavigateToPacks(selectedNation);
            }}
            className="whitespace-nowrap px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-amber-500/50 rounded-xl text-amber-300 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Package className="w-3.5 h-3.5" />
            <span>Open {selectedNation} Pack</span>
          </button>
        </div>
      )}

      {/* Search & Position Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 p-3 rounded-2xl">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by player, moment, position..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Position filter buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {(['ALL', 'FWD', 'MID', 'DEF', 'GK'] as const).map((pos) => (
            <button
              key={pos}
              onClick={() => {
                sound.playClick();
                setPositionFilter(pos);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                positionFilter === pos
                  ? 'bg-amber-400 text-black shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>

      {/* Card Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-white uppercase tracking-wider">
              {selectedNation === 'ALL' ? 'Complete Collection' : `${selectedNation} Squad`}
            </h2>
            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-bold">
              {filteredCards.length} Players
            </span>
          </div>
          <span className="text-xs text-slate-400">
            Hover to inspect stacked PlayStyles · Click for full enshrinement
          </span>
        </div>

        {filteredCards.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800">
            <p className="text-slate-400 text-sm">No International Moments match your filters.</p>
            <button
              onClick={() => {
                setSelectedNation('ALL');
                setPositionFilter('ALL');
                setSearchQuery('');
              }}
              className="mt-3 text-xs text-amber-400 hover:underline"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-6 justify-items-center">
            {filteredCards.map((card, idx) => (
              <div
                key={`${card.id}_${idx}`}
                onClick={() => {
                  sound.playClick();
                  setSelectedCard(card);
                }}
                className="flex flex-col items-center group cursor-pointer transition-transform hover:-translate-y-1.5"
              >
                <CardItem card={card} size="md" />

                {/* Sub-card metadata strip */}
                <div className="mt-2 text-center w-full max-w-[180px]">
                  <div className="text-xs font-black text-white group-hover:text-amber-300 transition-colors truncate">
                    {card.name}
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                    <span>{card.nationFlag}</span>
                    <span>{card.position}</span>
                    <span>·</span>
                    <span className="text-amber-400 font-bold">{card.rating} OVR</span>
                    <span>·</span>
                    <span className="text-slate-500">{card.federationCrest || 'IFL'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Enshrinement Detail Modal */}
      {selectedCard && (
        <div 
          onClick={() => setSelectedCard(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl w-full bg-gradient-to-b from-slate-900 to-black border border-amber-500/50 rounded-3xl shadow-[0_0_50px_rgba(234,179,8,0.25)] p-6 md:p-8 overflow-hidden"
          >
            {/* Top Close Button */}
            <button
              onClick={() => setSelectedCard(null)}
              className="absolute top-4 right-4 p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-colors z-20"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Card 3D Preview */}
              <div className="flex-shrink-0 flex flex-col items-center">
                <CardItem card={selectedCard} size="walkout" />
                <span className="text-[10px] text-amber-400/80 uppercase font-mono tracking-wider mt-2">
                  Interactive 3D Gyro Tilt
                </span>
              </div>

              {/* Player Lore & Full Attributes Breakdown */}
              <div className="flex-1 space-y-4 w-full">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{selectedCard.nationFlag}</span>
                    <span className="text-xs font-black uppercase text-amber-400 tracking-wider">
                      {selectedCard.nation} · {selectedCard.federationCrest || 'IFL'} Crest
                    </span>
                    <span className="text-xs bg-amber-500/20 text-yellow-300 px-2 py-0.5 rounded-full font-bold">
                      {selectedCard.rating} OVR · {selectedCard.position}
                    </span>
                  </div>

                  <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
                    {selectedCard.name}
                  </h3>
                </div>

                {/* Tournament Moment Lore Box */}
                {selectedCard.momentTitle && (
                  <div className="p-3.5 bg-amber-950/30 border border-amber-500/30 rounded-2xl">
                    <div className="flex items-center gap-1.5 text-xs font-black text-amber-300 uppercase">
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      <span>{selectedCard.momentTitle}</span>
                    </div>
                    {selectedCard.momentDescription && (
                      <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                        {selectedCard.momentDescription}
                      </p>
                    )}
                  </div>
                )}

                {/* Stacked PlayStyles Breakdown */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    <span>Stacked PlayStyle Badges ({selectedCard.playStyles?.length || 1})</span>
                  </h4>

                  <div className="space-y-1.5">
                    {(selectedCard.playStyles || (selectedCard.playStylePlus ? [selectedCard.playStylePlus] : [])).map((ps, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl border flex items-center justify-between ${
                          ps.isPlus !== false
                            ? 'bg-amber-950/40 border-amber-500/60'
                            : 'bg-slate-900/60 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{ps.iconSymbol}</span>
                          <div>
                            <div className="text-xs font-black text-white flex items-center gap-1">
                              <span>{ps.name}</span>
                              {ps.isPlus !== false && (
                                <span className="text-[10px] text-amber-300 font-bold bg-amber-500/20 px-1.5 py-0.2 rounded">
                                  PLAYSTYLE+
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400">{ps.shortDesc}</div>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-amber-400 whitespace-nowrap ml-2">
                          +{ps.statBoost.bonus} {ps.statBoost.attribute.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 6 Core Attributes Grid */}
                <div className="grid grid-cols-6 gap-2 pt-2 border-t border-slate-800">
                  {selectedCard.position === 'GK' ? (
                    <>
                      <div className="bg-slate-950 p-2 rounded-xl text-center border border-slate-800">
                        <div className="text-[10px] text-slate-500 font-bold">DIV</div>
                        <div className="text-sm font-black text-white">{selectedCard.stats.pac}</div>
                      </div>
                      <div className="bg-slate-950 p-2 rounded-xl text-center border border-slate-800">
                        <div className="text-[10px] text-slate-500 font-bold">HAN</div>
                        <div className="text-sm font-black text-white">{selectedCard.stats.sho}</div>
                      </div>
                      <div className="bg-slate-950 p-2 rounded-xl text-center border border-slate-800">
                        <div className="text-[10px] text-slate-500 font-bold">KIC</div>
                        <div className="text-sm font-black text-white">{selectedCard.stats.pas}</div>
                      </div>
                      <div className="bg-slate-950 p-2 rounded-xl text-center border border-slate-800">
                        <div className="text-[10px] text-slate-500 font-bold">REF</div>
                        <div className="text-sm font-black text-white">{selectedCard.stats.dri}</div>
                      </div>
                      <div className="bg-slate-950 p-2 rounded-xl text-center border border-slate-800">
                        <div className="text-[10px] text-slate-500 font-bold">SPD</div>
                        <div className="text-sm font-black text-white">{selectedCard.stats.def}</div>
                      </div>
                      <div className="bg-slate-950 p-2 rounded-xl text-center border border-slate-800">
                        <div className="text-[10px] text-slate-500 font-bold">POS</div>
                        <div className="text-sm font-black text-white">{selectedCard.stats.phy}</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-slate-950 p-2 rounded-xl text-center border border-slate-800">
                        <div className="text-[10px] text-slate-500 font-bold">PAC</div>
                        <div className="text-sm font-black text-white">{selectedCard.stats.pac}</div>
                      </div>
                      <div className="bg-slate-950 p-2 rounded-xl text-center border border-slate-800">
                        <div className="text-[10px] text-slate-500 font-bold">SHO</div>
                        <div className="text-sm font-black text-white">{selectedCard.stats.sho}</div>
                      </div>
                      <div className="bg-slate-950 p-2 rounded-xl text-center border border-slate-800">
                        <div className="text-[10px] text-slate-500 font-bold">PAS</div>
                        <div className="text-sm font-black text-white">{selectedCard.stats.pas}</div>
                      </div>
                      <div className="bg-slate-950 p-2 rounded-xl text-center border border-slate-800">
                        <div className="text-[10px] text-slate-500 font-bold">DRI</div>
                        <div className="text-sm font-black text-white">{selectedCard.stats.dri}</div>
                      </div>
                      <div className="bg-slate-950 p-2 rounded-xl text-center border border-slate-800">
                        <div className="text-[10px] text-slate-500 font-bold">DEF</div>
                        <div className="text-sm font-black text-white">{selectedCard.stats.def}</div>
                      </div>
                      <div className="bg-slate-950 p-2 rounded-xl text-center border border-slate-800">
                        <div className="text-[10px] text-slate-500 font-bold">PHY</div>
                        <div className="text-sm font-black text-white">{selectedCard.stats.phy}</div>
                      </div>
                    </>
                  )}
                </div>

                {/* Modal Footer Actions */}
                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-amber-400 font-mono font-bold">
                    Quick Sell: {selectedCard.price.toLocaleString()} Coins
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedCard(null);
                        onNavigateToClash();
                        sound.playClick();
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-transform hover:scale-105"
                    >
                      Test in Clash ⚔️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
