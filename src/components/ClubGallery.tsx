import React, { useState } from 'react';
import { SoccerCard } from '../types/card';
import { CardItem } from './CardItem';
import { sound } from '../utils/audio';
import { Sparkles, Search, Coins, Plus, Filter } from 'lucide-react';

interface ClubGalleryProps {
  clubCards: SoccerCard[];
  onQuickSellCard: (card: SoccerCard) => void;
  onOpenCardCreator: () => void;
  onSelectCardForDetails?: (card: SoccerCard) => void;
}

export const ClubGallery: React.FC<ClubGalleryProps> = ({
  clubCards,
  onQuickSellCard,
  onOpenCardCreator,
}) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<
    'all' | 'summer' | 'street_kings' | 'intl' | 'hall_of_fame' | 'futmas' | 'program_one' | 'base' | 'custom' | 'icons' | 'attackers' | 'midfielders' | 'defenders' | 'gks'
  >('all');
  const [minRatingFilter, setMinRatingFilter] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'rating_desc' | 'rating_asc' | 'price_desc'>('rating_desc');
  const [inspectCard, setInspectCard] = useState<SoccerCard | null>(null);

  // Filter logic
  let filtered = clubCards.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.club.toLowerCase().includes(search.toLowerCase()) ||
      c.nation.toLowerCase().includes(search.toLowerCase()) ||
      c.position.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (minRatingFilter > 0 && c.rating < minRatingFilter) return false;

    if (filterType === 'summer') return c.program === 'Summer Transfers' || c.rarity === 'summer_transfers' || c.cardStyle === 'summer_basic';
    if (filterType === 'street_kings') return c.program === 'Street Kings' || c.rarity === 'street_kings';
    if (filterType === 'intl') return c.program === 'International Moments' || c.rarity === 'international_moments';
    if (filterType === 'hall_of_fame') return c.program === 'Hall of Fame' || c.rarity === 'hall_of_fame' || c.program === 'Program One';
    if (filterType === 'futmas') return c.program === 'Futmas' || c.rarity === 'futmas';
    if (filterType === 'program_one') return c.program === 'Program One' || c.rarity === 'program_one' || c.program === 'Hall of Fame';
    if (filterType === 'base') return c.program === 'Base Cards' || c.rarity === 'base' || !c.isCustom;
    if (filterType === 'custom') return c.isCustom;
    if (filterType === 'icons') return c.rarity === 'icon';
    if (filterType === 'attackers') return ['ST', 'CF', 'LW', 'RW'].includes(c.position);
    if (filterType === 'midfielders') return ['CAM', 'CM', 'CDM', 'LM', 'RM'].includes(c.position);
    if (filterType === 'defenders') return ['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(c.position);
    if (filterType === 'gks') return c.position === 'GK';

    return true;
  });

  // Sort logic
  filtered.sort((a, b) => {
    if (sortBy === 'rating_desc') return b.rating - a.rating;
    if (sortBy === 'rating_asc') return a.rating - b.rating;
    if (sortBy === 'price_desc') return b.price - a.price;
    return 0;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            My Club Collection
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Total Players: <strong className="text-emerald-400">{clubCards.length}</strong> (Custom Created:{' '}
            <strong className="text-emerald-400">
              {clubCards.filter((c) => c.isCustom).length}
            </strong>
            )
          </p>
        </div>

        <button
          onClick={onOpenCardCreator}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-emerald-300 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/40 rounded-xl transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Card</span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search player, nation, club..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Filter Segmented Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl">
          {[
            { id: 'all', label: 'All Players' },
            { id: 'summer', label: '☀️ Summer Transfers' },
            { id: 'street_kings', label: '⚡ Street Kings' },
            { id: 'intl', label: '🌍 Intl Moments' },
            { id: 'hall_of_fame', label: '👑 Hall of Fame' },
            { id: 'futmas', label: '❄️ Futmas' },
            { id: 'program_one', label: 'Program One' },
            { id: 'base', label: 'Base Cards' },
            { id: 'custom', label: 'Custom' },
            { id: 'icons', label: 'Icons' },
            { id: 'attackers', label: 'Attackers' },
            { id: 'midfielders', label: 'Midfielders' },
            { id: 'defenders', label: 'Defenders' },
            { id: 'gks', label: 'GK' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => {
                setFilterType(f.id as typeof filterType);
                sound.playClick();
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                filterType === f.id
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Min Rating & Sort selectors */}
        <div className="flex items-center gap-3 self-end md:self-auto flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-semibold">Min:</span>
            <select
              value={minRatingFilter}
              onChange={(e) => setMinRatingFilter(Number(e.target.value))}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none"
            >
              <option value="0">All Ratings</option>
              <option value="80">80+ OVR</option>
              <option value="85">85+ OVR</option>
              <option value="90">90+ OVR</option>
              <option value="93">93+ OVR</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-semibold">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none"
            >
              <option value="rating_desc">Rating (High to Low)</option>
              <option value="rating_asc">Rating (Low to High)</option>
              <option value="price_desc">Quick Sell Value</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-500 text-sm bg-slate-900/40 rounded-3xl border border-slate-800">
          No cards found matching your criteria. Try adjusting the filter or open booster packs!
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filtered.map((card, idx) => (
            <div key={`${card.id}_${idx}`} className="flex flex-col items-center">
              <CardItem
                card={card}
                size="md"
                interactive={true}
                showQuickSell={true}
                onClick={() => setInspectCard(card)}
                onQuickSell={() => {
                  if (confirm(`Quick sell ${card.name} for ${card.price.toLocaleString()} coins?`)) {
                    onQuickSellCard(card);
                    sound.playCoinClink();
                  }
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Inspect Modal */}
      {inspectCard && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setInspectCard(null)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full flex flex-col items-center space-y-6 shadow-2xl animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs uppercase font-bold text-slate-400">
                Card Inspection
              </span>
              <button
                onClick={() => setInspectCard(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <CardItem card={inspectCard} size="lg" interactive={true} />

            <div className="w-full bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Club / League:</span>
                <span className="font-bold text-white">{inspectCard.club} ({inspectCard.league})</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Nation:</span>
                <span className="font-bold text-white">{inspectCard.nationFlag} {inspectCard.nation}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Quick Sell Value:</span>
                <span className="font-bold text-amber-400 flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5" />
                  {inspectCard.price.toLocaleString()} coins
                </span>
              </div>
              {inspectCard.isCustom && (
                <div className="flex justify-between text-emerald-300 pt-2 border-t border-slate-800">
                  <span>Custom Creator Tag:</span>
                  <span className="font-bold">{inspectCard.creatorTag || 'Community Creator'}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
