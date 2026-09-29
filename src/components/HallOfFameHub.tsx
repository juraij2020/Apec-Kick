import React, { useState, useMemo } from 'react';
import { SoccerCard, PlayStylePlusType } from '../types/card';
import { HALL_OF_FAME_CARDS, PLAYSTYLE_PRESETS } from '../data/defaultCards';
import { CardItem } from './CardItem';
import { 
  Trophy, 
  Sparkles, 
  Flame, 
  Shield, 
  Search, 
  Zap, 
  ArrowRight, 
  Package, 
  CheckCircle2, 
  Award,
  Crown,
  ChevronRight
} from 'lucide-react';
import { sound } from '../utils/audio';

interface HallOfFameHubProps {
  onNavigateToPacks: () => void;
  onNavigateToSBCs: () => void;
  onNavigateToClash: () => void;
  onSelectCardForSquad?: (card: SoccerCard) => void;
}

export const HallOfFameHub: React.FC<HallOfFameHubProps> = ({
  onNavigateToPacks,
  onNavigateToSBCs,
  onNavigateToClash,
}) => {
  // Currently spotlighted player (default to Messi 99 or Addai)
  const [selectedCardId, setSelectedCardId] = useState<string>(HALL_OF_FAME_CARDS[0]?.id || 'hof-messi-99');
  const [activePositionFilter, setActivePositionFilter] = useState<'All' | 'FWD' | 'MID' | 'DEF' | 'GK'>('All');
  const [activePlayStyleFilter, setActivePlayStyleFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'pac' | 'sho' | 'def'>('rating');
  const [simulatedTrigger, setSimulatedTrigger] = useState<boolean>(false);

  const selectedCard = useMemo(() => {
    return HALL_OF_FAME_CARDS.find(c => c.id === selectedCardId) || HALL_OF_FAME_CARDS[0];
  }, [selectedCardId]);

  // Filter & sort roster
  const filteredCards = useMemo(() => {
    return HALL_OF_FAME_CARDS.filter(card => {
      // Position filter
      if (activePositionFilter === 'FWD' && !['ST', 'CF', 'RW', 'LW'].includes(card.position)) return false;
      if (activePositionFilter === 'MID' && !['CAM', 'CM', 'CDM', 'LM', 'RM'].includes(card.position)) return false;
      if (activePositionFilter === 'DEF' && !['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(card.position)) return false;
      if (activePositionFilter === 'GK' && card.position !== 'GK') return false;

      // PlayStyle filter
      if (activePlayStyleFilter !== 'All' && card.playStylePlus?.id !== activePlayStyleFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = card.name.toLowerCase().includes(q) || (card.shortName && card.shortName.toLowerCase().includes(q));
        const matchNation = card.nation.toLowerCase().includes(q);
        const matchClub = card.club.toLowerCase().includes(q);
        if (!matchName && !matchNation && !matchClub) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'pac') return b.stats.pac - a.stats.pac;
      if (sortBy === 'sho') return b.stats.sho - a.stats.sho;
      if (sortBy === 'def') return b.stats.def - a.stats.def;
      return 0;
    });
  }, [activePositionFilter, activePlayStyleFilter, searchQuery, sortBy]);

  const handleTestPlayStyle = () => {
    setSimulatedTrigger(true);
    sound.playGoalCheer();
    setTimeout(() => {
      setSimulatedTrigger(false);
    }, 2800);
  };

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 pb-20 selection:bg-amber-500 selection:text-black">
      {/* Hero Banner with Golden Accents */}
      <div className="relative overflow-hidden border-b border-amber-500/20 bg-gradient-to-b from-[#14120c] via-[#09090b] to-[#070709] pt-8 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-700/10 border border-amber-500/30 text-amber-300 text-xs font-bold tracking-widest uppercase mb-3 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>Class of 2026 Enshrinement</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-400 to-amber-600 tracking-tight flex items-center gap-3">
                HALL OF FAME
                <Sparkles className="w-7 h-7 text-amber-400 animate-pulse" />
              </h1>
              <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mt-2 leading-relaxed">
                The apex tier of Ultimate Team legend. 17 custom-designed shield cards and iconic world superstars, equipped with tactical <span className="text-amber-400 font-semibold">PlayStyle Plus (PS+)</span> traits that actively amplify pitch simulation performance.
              </p>
            </div>

            {/* Quick action buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={onNavigateToPacks}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-extrabold text-sm shadow-[0_4px_20px_rgba(234,179,8,0.35)] transition-all transform active:scale-95"
              >
                <Package className="w-4 h-4" />
                <span>Open HOF Packs</span>
              </button>
              <button
                onClick={onNavigateToSBCs}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-amber-300 font-bold text-sm border border-amber-500/30 shadow-md transition-all active:scale-95"
              >
                <Award className="w-4 h-4 text-amber-400" />
                <span>Enshrinement SBCs</span>
              </button>
              <button
                onClick={onNavigateToClash}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 font-bold text-sm border border-zinc-700/60 transition-all active:scale-95"
              >
                <Flame className="w-4 h-4 text-orange-400" />
                <span>Test in Clash</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Spotlight Hero + Roster Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Spotlight Showcase Hero */}
        {selectedCard && (
          <div className="mb-12 rounded-2xl bg-gradient-to-b from-[#171510] to-[#0c0c0e] border border-amber-500/30 p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.8)] relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: 3D Card Display */}
              <div className="lg:col-span-4 flex flex-col items-center justify-center">
                <div className="relative transform hover:scale-105 transition-transform duration-300">
                  <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-600/20 rounded-2xl blur-xl opacity-75" />
                  <CardItem card={selectedCard} size="lg" interactive={true} />
                </div>
                <div className="mt-4 text-center">
                  <span className="text-xs text-amber-400/80 uppercase tracking-widest font-mono">
                    Official Shield Geometry &bull; Class of {selectedCard.hofInductionYear || 2026}
                  </span>
                </div>
              </div>

              {/* Right Column: Player Lore & Detailed Stats */}
              <div className="lg:col-span-8 flex flex-col justify-between">
                <div>
                  {/* Top Metadata Tags */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      Hall of Fame Legend
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 text-xs font-semibold">
                      {selectedCard.nationFlag} {selectedCard.nation}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 text-xs font-semibold">
                      {selectedCard.club} &bull; {selectedCard.league}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-amber-950/60 border border-amber-600/30 text-amber-400 text-xs font-bold tabular-nums">
                      Valued at {selectedCard.price.toLocaleString()} Coins
                    </span>
                  </div>

                  {/* Player Headline */}
                  <div className="flex items-baseline gap-4">
                    <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                      {selectedCard.name}
                    </h2>
                    <span className="text-2xl sm:text-3xl font-black text-amber-400 tabular-nums">
                      {selectedCard.rating} <span className="text-lg font-bold text-zinc-400">{selectedCard.position}</span>
                    </span>
                  </div>

                  {/* Legacy Quote */}
                  {selectedCard.hofLegacyQuote && (
                    <p className="mt-2 text-zinc-300 text-sm sm:text-base italic border-l-2 border-amber-500/50 pl-3 py-1 bg-amber-500/5 rounded-r">
                      "{selectedCard.hofLegacyQuote}"
                    </p>
                  )}

                  {/* Signature PlayStyle Plus Section */}
                  {selectedCard.playStylePlus && (
                    <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-[#211a0c] to-[#141416] border border-amber-500/40 relative">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start sm:items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(234,179,8,0.5)] flex-shrink-0">
                            {selectedCard.playStylePlus.iconSymbol}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-base font-black text-amber-300 tracking-wide">
                                {selectedCard.playStylePlus.name}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-200 text-xs font-extrabold uppercase tracking-wider border border-amber-500/40">
                                Tactical PS+
                              </span>
                            </div>
                            <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">
                              {selectedCard.playStylePlus.shortDesc}
                            </p>
                          </div>
                        </div>

                        {/* Interactive Clash Boost Tester */}
                        <button
                          onClick={handleTestPlayStyle}
                          disabled={simulatedTrigger}
                          className={`px-3 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all flex-shrink-0 ${
                            simulatedTrigger
                              ? 'bg-amber-400 text-black shadow-[0_0_20px_rgba(250,204,21,0.8)] scale-105'
                              : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          <Zap className={`w-3.5 h-3.5 ${simulatedTrigger ? 'text-black fill-black' : 'text-amber-400'}`} />
                          <span>{simulatedTrigger ? 'PS+ Clash Boost Active!' : 'Simulate Match Trigger'}</span>
                        </button>
                      </div>

                      {/* Animated alert toast when simulated */}
                      {simulatedTrigger && (
                        <div className="mt-3 p-2.5 rounded-lg bg-amber-950/90 border border-amber-400 text-amber-200 text-xs font-bold flex items-center gap-2 animate-bounce">
                          <span>⚡</span>
                          <span>
                            CLASH IMPACT: +{selectedCard.playStylePlus.statBoost.bonus} {selectedCard.playStylePlus.statBoost.attribute.toUpperCase()} applied! Overcoming defensive marking with lethal conversion rate.
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 6 Core Stats Matrix */}
                  <div className="mt-6 grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {[
                      { label: selectedCard.position === 'GK' ? 'DIV' : 'PAC', val: selectedCard.stats.pac, attr: 'pac' },
                      { label: selectedCard.position === 'GK' ? 'HAN' : 'SHO', val: selectedCard.stats.sho, attr: 'sho' },
                      { label: selectedCard.position === 'GK' ? 'KIC' : 'PAS', val: selectedCard.stats.pas, attr: 'pas' },
                      { label: selectedCard.position === 'GK' ? 'REF' : 'DRI', val: selectedCard.stats.dri, attr: 'dri' },
                      { label: selectedCard.position === 'GK' ? 'SPE' : 'DEF', val: selectedCard.stats.def, attr: 'def' },
                      { label: selectedCard.position === 'GK' ? 'POS' : 'PHY', val: selectedCard.stats.phy, attr: 'phy' },
                    ].map((st) => {
                      const isBoosted = selectedCard.playStylePlus?.statBoost.attribute === st.attr;
                      return (
                        <div
                          key={st.label}
                          className={`p-2.5 rounded-xl border text-center transition-all ${
                            isBoosted
                              ? 'bg-amber-500/15 border-amber-500/60 shadow-[0_0_12px_rgba(234,179,8,0.2)]'
                              : 'bg-zinc-900/60 border-zinc-800'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-xs font-bold text-zinc-400">{st.label}</span>
                            {isBoosted && (
                              <span className="text-[10px] text-amber-400 font-extrabold">+</span>
                            )}
                          </div>
                          <div className={`text-xl font-black tabular-nums mt-0.5 ${
                            st.val >= 90 ? 'text-amber-400' : st.val >= 80 ? 'text-zinc-100' : 'text-zinc-300'
                          }`}>
                            {st.val}
                          </div>
                          {/* Mini Progress Bar */}
                          <div className="w-full bg-zinc-800 h-1 rounded-full mt-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isBoosted ? 'bg-amber-400' : st.val >= 90 ? 'bg-yellow-500' : 'bg-zinc-500'
                              }`}
                              style={{ width: `${Math.min(100, st.val)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Subfooter Details */}
                <div className="mt-6 pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between text-xs text-zinc-400 gap-4">
                  <div className="flex items-center gap-4">
                    <span>Weak Foot: <strong className="text-amber-400">{'★'.repeat(selectedCard.weakFoot || 4)}</strong></span>
                    <span>Skill Moves: <strong className="text-amber-400">{'★'.repeat(selectedCard.skillMoves || 4)}</strong></span>
                    <span>Work Rate: <strong className="text-zinc-200">{selectedCard.workRate || 'H/M'}</strong></span>
                  </div>
                  <span className="text-zinc-500">Card ID: {selectedCard.id}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Roster Controls: Filters & Search */}
        <div className="bg-[#121115] border border-zinc-800/80 rounded-2xl p-4 sm:p-5 mb-8 shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Position Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider mr-1">Position:</span>
              {(['All', 'FWD', 'MID', 'DEF', 'GK'] as const).map(pos => (
                <button
                  key={pos}
                  onClick={() => setActivePositionFilter(pos)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                    activePositionFilter === pos
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  {pos === 'All' ? 'All Roles' : pos}
                </button>
              ))}
            </div>

            {/* PlayStyle Filter */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider mr-1">PlayStyle+:</span>
              <select
                value={activePlayStyleFilter}
                onChange={(e) => setActivePlayStyleFilter(e.target.value)}
                className="bg-zinc-900 text-zinc-200 text-xs font-bold border border-zinc-700/80 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
              >
                <option value="All">All Traits</option>
                {Object.values(PLAYSTYLE_PRESETS).map(ps => (
                  <option key={ps.id} value={ps.id}>
                    {ps.iconSymbol} {ps.name}
                  </option>
                ))}
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-zinc-900 text-zinc-200 text-xs font-bold border border-zinc-700/80 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
              >
                <option value="rating">Sort: Highest Rating</option>
                <option value="pac">Sort: Pace</option>
                <option value="sho">Sort: Shooting</option>
                <option value="def">Sort: Defense</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name, nation, club..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Roster Cards Grid */}
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <span>Hall of Fame Roster</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold">
              {filteredCards.length} Legends
            </span>
          </h3>
          <span className="text-xs text-zinc-500">Click any card to inspect in the Enshrinement Spotlight</span>
        </div>

        {filteredCards.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900/40 rounded-2xl border border-zinc-800">
            <Trophy className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-zinc-300">No Hall of Fame cards match this filter</h4>
            <p className="text-xs text-zinc-500 mt-1">Try resetting position or search query</p>
            <button
              onClick={() => {
                setActivePositionFilter('All');
                setActivePlayStyleFilter('All');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 rounded-lg bg-amber-500/20 text-amber-300 font-bold text-xs hover:bg-amber-500/30"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {filteredCards.map((card, idx) => {
              const isSelected = card.id === selectedCard?.id;
              return (
                <div
                  key={`${card.id}_${idx}`}
                  onClick={() => {
                    setSelectedCardId(card.id);
                    sound.playCardFlip();
                  }}
                  className={`group relative flex flex-col items-center p-3 rounded-2xl cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'bg-amber-500/10 border-2 border-amber-400 shadow-[0_0_24px_rgba(234,179,8,0.35)] scale-105'
                      : 'bg-zinc-900/40 hover:bg-zinc-800/60 border border-zinc-800 hover:border-amber-500/40 hover:scale-[1.02]'
                  }`}
                >
                  <CardItem card={card} size="sm" interactive={false} />

                  <div className="mt-2 text-center w-full">
                    <div className="text-xs font-extrabold text-white truncate group-hover:text-amber-300">
                      {card.name}
                    </div>
                    <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-400 mt-0.5">
                      <span className="font-black text-amber-400">{card.rating}</span>
                      <span>{card.position}</span>
                      <span>&bull;</span>
                      <span>{card.nationFlag}</span>
                    </div>

                    {/* PlayStyle Badge Pill */}
                    {card.playStylePlus && (
                      <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-[10px] text-amber-300 font-bold">
                        <span>{card.playStylePlus.iconSymbol}</span>
                        <span>{card.playStylePlus.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Hall of Fame Tactical Lore & PlayStyle Plus Guide */}
        <div className="mt-16 bg-[#111015] border border-amber-500/20 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">PlayStyle Plus (PS+) System Guide</h3>
              <p className="text-xs text-zinc-400">How signature badges mathematically influence your match clash simulations</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.values(PLAYSTYLE_PRESETS).map((ps) => (
              <div
                key={ps.id}
                className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-amber-500/40 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{ps.iconSymbol}</span>
                    <span className="font-extrabold text-sm text-amber-300">{ps.name}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-200 text-[10px] font-black uppercase">
                    +{ps.statBoost.bonus} {ps.statBoost.attribute}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {ps.shortDesc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
