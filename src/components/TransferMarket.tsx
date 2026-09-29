import React, { useState, useEffect, useMemo } from 'react';
import { SoccerCard, TransferListing, TransferFilter } from '../types/card';
import { CardItem } from './CardItem';
import { sound } from '../utils/audio';
import {
  Search,
  SlidersHorizontal,
  Coins,
  Clock,
  Tag,
  ArrowUpDown,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Gavel,
  PlusCircle,
  X,
  Sparkles,
  Trophy,
  Filter,
  Check,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface TransferMarketProps {
  coins: number;
  clubCards: SoccerCard[];
  onDeductCoins: (amount: number) => boolean;
  onAddCoins: (amount: number) => void;
  onAddCardsToClub: (cards: SoccerCard[]) => void;
  onRemoveCardFromClub: (cardId: string) => void;
  allCardsPool: SoccerCard[];
  onNavigateToMiniGames?: () => void;
}

const STORAGE_MARKET_KEY = 'apex_fut_market_listings_v2';

export const TransferMarket: React.FC<TransferMarketProps> = ({
  coins,
  clubCards,
  onDeductCoins,
  onAddCoins,
  onAddCardsToClub,
  onRemoveCardFromClub,
  allCardsPool,
  onNavigateToMiniGames,
}) => {
  // Navigation tabs within Transfer Market
  const [activeTab, setActiveTab] = useState<'browse' | 'sell' | 'my_listings' | 'my_bids'>('browse');

  // Load / initialize listings
  const [listings, setListings] = useState<TransferListing[]>(() => {
    const saved = localStorage.getItem(STORAGE_MARKET_KEY);
    if (saved) {
      try {
        const parsed: TransferListing[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        // Fallback
      }
    }
    // Lazy load initial seed from storage or fallback
    return [];
  });

  // Ensure initial seed if empty
  useEffect(() => {
    if (listings.length === 0) {
      import('../data/initialMarketListings').then(({ generateInitialListings }) => {
        const initial = generateInitialListings();
        setListings(initial);
        localStorage.setItem(STORAGE_MARKET_KEY, JSON.stringify(initial));
      });
    }
  }, [listings.length]);

  // Persist listings
  useEffect(() => {
    if (listings.length > 0) {
      localStorage.setItem(STORAGE_MARKET_KEY, JSON.stringify(listings));
    }
  }, [listings]);

  // Filter state
  const [filter, setFilter] = useState<TransferFilter>({
    query: '',
    position: 'ALL',
    program: 'ALL',
    nation: 'ALL',
    rarity: 'ALL',
    playStyle: 'ALL',
    instantBuyOnly: false,
    minRating: 0,
    maxRating: 99,
    minPrice: 0,
    maxPrice: 1000000,
    sortBy: 'expires_soon',
  });

  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);

  // Selected card to sell from club
  const [sellingCard, setSellingCard] = useState<SoccerCard | null>(null);
  const [sellStartBid, setSellStartBid] = useState<number>(10000);
  const [sellBuyNow, setSellBuyNow] = useState<number>(25000);
  const [sellDurationHours, setSellDurationHours] = useState<number>(3);

  // Bid dialog
  const [bidModalListing, setBidModalListing] = useState<TransferListing | null>(null);
  const [customBidAmount, setCustomBidAmount] = useState<number>(0);

  // Toast / feedback message
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Simulated market tick (AI bidding and simulated purchases on user items)
  useEffect(() => {
    const timer = setInterval(() => {
      setListings((prevListings) => {
        let changed = false;
        const now = Date.now();

        const updated = prevListings.map((listing) => {
          // If user listing is active and priced reasonably, simulate a chance of AI buyer
          if (listing.isUserListing && listing.status === 'active') {
            // 20% chance per tick to get bought or bid on
            if (Math.random() < 0.22) {
              changed = true;
              return {
                ...listing,
                status: 'sold' as const,
                buyerName: 'FutCollector_' + Math.floor(Math.random() * 899 + 100),
                currentBid: listing.buyNowPrice,
              };
            }
          }

          // If expired
          if (listing.status === 'active' && now > listing.expiresAt) {
            changed = true;
            return {
              ...listing,
              status: listing.bidsCount > 0 ? ('sold' as const) : ('expired' as const),
            };
          }

          return listing;
        });

        return changed ? updated : prevListings;
      });
    }, 15000);

    return () => clearInterval(timer);
  }, []);

  // Filtered browse listings
  const filteredListings = useMemo(() => {
    return listings
      .filter((listing) => {
        if (listing.status !== 'active') return false;

        const card = listing.card;
        // Search query
        if (filter.query.trim()) {
          const q = filter.query.toLowerCase();
          const matchName = card.name.toLowerCase().includes(q);
          const matchClub = card.club.toLowerCase().includes(q);
          const matchNation = card.nation.toLowerCase().includes(q);
          if (!matchName && !matchClub && !matchNation) return false;
        }

        // Position
        if (filter.position !== 'ALL') {
          if (filter.position === 'FWD' && !['ST', 'CF', 'LW', 'RW'].includes(card.position)) return false;
          if (filter.position === 'MID' && !['CAM', 'CM', 'CDM', 'LM', 'RM'].includes(card.position)) return false;
          if (filter.position === 'DEF' && !['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(card.position)) return false;
          if (filter.position === 'GK' && card.position !== 'GK') return false;
          if (!['FWD', 'MID', 'DEF', 'GK'].includes(filter.position) && card.position !== filter.position) return false;
        }

        // Program
        if (filter.program !== 'ALL') {
          if (filter.program === 'intl' && card.program !== 'International Moments' && card.rarity !== 'international_moments') return false;
          if (filter.program === 'hof' && card.program !== 'Hall of Fame' && card.rarity !== 'hall_of_fame') return false;
          if (filter.program === 'futmas' && card.program !== 'Futmas' && card.rarity !== 'futmas') return false;
          if (filter.program === 'base' && card.program !== 'Base Cards' && card.rarity !== 'base' && card.rarity !== 'gold_rare') return false;
          if (filter.program === 'icon' && card.rarity !== 'icon') return false;
        }

        // Rating
        if (filter.minRating > 0 && card.rating < filter.minRating) return false;
        if (filter.maxRating < 99 && card.rating > filter.maxRating) return false;

        // Nation
        if (filter.nation && filter.nation !== 'ALL') {
          if (card.nation.toLowerCase() !== filter.nation.toLowerCase()) return false;
        }

        // Quality / Rarity
        if (filter.rarity && filter.rarity !== 'ALL') {
          if (card.rarity !== filter.rarity) return false;
        }

        // PlayStyle
        if (filter.playStyle && filter.playStyle !== 'ALL') {
          const matchesPlus = card.playStylePlus?.id === filter.playStyle;
          const matchesStacked = card.playStyles?.some((ps) => ps.id === filter.playStyle);
          if (!matchesPlus && !matchesStacked) return false;
        }

        // Price
        if (filter.minPrice > 0 && listing.buyNowPrice < filter.minPrice) return false;
        if (filter.maxPrice < 1000000 && listing.buyNowPrice > filter.maxPrice) return false;

        // Instant Buy Only
        if (filter.instantBuyOnly && listing.currentBid > 0) return false;

        return true;
      })
      .sort((a, b) => {
        if (filter.sortBy === 'price_asc') return a.buyNowPrice - b.buyNowPrice;
        if (filter.sortBy === 'price_desc') return b.buyNowPrice - a.buyNowPrice;
        if (filter.sortBy === 'rating_desc') return b.card.rating - a.card.rating;
        if (filter.sortBy === 'rating_asc') return a.card.rating - b.card.rating;
        if (filter.sortBy === 'expires_soon') return a.expiresAt - b.expiresAt;
        return 0;
      });
  }, [listings, filter]);

  // User listings & bids
  const userListings = useMemo(() => listings.filter((l) => l.isUserListing), [listings]);
  const userBids = useMemo(() => listings.filter((l) => l.userHasBid), [listings]);
  const claimableSold = useMemo(() => userListings.filter((l) => l.status === 'sold'), [userListings]);

  // Buy Now Handler
  const handleBuyNow = (listing: TransferListing) => {
    if (coins < listing.buyNowPrice) {
      showToast(`Not enough coins! You need ${listing.buyNowPrice.toLocaleString()} coins.`, 'error');
      sound.playClick();
      return;
    }

    const success = onDeductCoins(listing.buyNowPrice);
    if (!success) {
      showToast('Transaction failed.', 'error');
      return;
    }

    // Add card to user's club
    onAddCardsToClub([listing.card]);
    sound.playGoalCheer();

    // Mark listing as sold
    setListings((prev) =>
      prev.map((l) =>
        l.id === listing.id
          ? { ...l, status: 'sold' as const, buyerName: 'You (Apex User)' }
          : l
      )
    );

    showToast(`Purchased ${listing.card.name} for ${listing.buyNowPrice.toLocaleString()} coins! Card added to Club.`, 'success');
  };

  // Open Bid Modal
  const handleOpenBid = (listing: TransferListing) => {
    const nextMinBid = listing.currentBid > 0 ? listing.currentBid + Math.max(500, Math.floor(listing.currentBid * 0.05)) : listing.startBid;
    setCustomBidAmount(nextMinBid);
    setBidModalListing(listing);
    sound.playClick();
  };

  // Confirm Bid
  const handleConfirmBid = () => {
    if (!bidModalListing) return;

    if (customBidAmount > coins) {
      showToast('Not enough coins to place this bid.', 'error');
      return;
    }

    const minRequired = bidModalListing.currentBid > 0 
      ? bidModalListing.currentBid + 250 
      : bidModalListing.startBid;

    if (customBidAmount < minRequired) {
      showToast(`Bid must be at least ${minRequired.toLocaleString()} coins.`, 'error');
      return;
    }

    // If bid equals or exceeds Buy Now, trigger instant Buy Now
    if (customBidAmount >= bidModalListing.buyNowPrice) {
      handleBuyNow(bidModalListing);
      setBidModalListing(null);
      return;
    }

    // Deduct coins for active bid
    onDeductCoins(customBidAmount);
    sound.playCoinClink();

    setListings((prev) =>
      prev.map((l) =>
        l.id === bidModalListing.id
          ? {
              ...l,
              currentBid: customBidAmount,
              bidsCount: l.bidsCount + 1,
              userHasBid: true,
              buyerName: 'You (Apex User)',
            }
          : l
      )
    );

    showToast(`Bid of ${customBidAmount.toLocaleString()} coins placed on ${bidModalListing.card.name}!`, 'success');
    setBidModalListing(null);
  };

  // List Card from Club onto Market
  const handleSelectCardToSell = (card: SoccerCard) => {
    setSellingCard(card);
    // Suggest market pricing
    const baseValue = card.price || 15000;
    const start = Math.max(1000, Math.floor(baseValue * 0.7));
    const buyNow = Math.max(start + 2000, Math.floor(baseValue * 1.3));
    setSellStartBid(start);
    setSellBuyNow(buyNow);
    sound.playClick();
  };

  const handleConfirmListCard = () => {
    if (!sellingCard) return;

    if (sellBuyNow <= sellStartBid) {
      showToast('Buy Now price must be higher than Starting Bid.', 'error');
      return;
    }

    // Remove from club inventory
    onRemoveCardFromClub(sellingCard.id);

    const newListing: TransferListing = {
      id: `user-listing-${Date.now()}-${sellingCard.id}`,
      card: sellingCard,
      sellerName: 'Your Club',
      isUserListing: true,
      startBid: sellStartBid,
      currentBid: 0,
      buyNowPrice: sellBuyNow,
      bidsCount: 0,
      expiresAt: Date.now() + sellDurationHours * 60 * 60 * 1000,
      status: 'active',
    };

    setListings((prev) => [newListing, ...prev]);
    sound.playCoinClink();
    showToast(`Listed ${sellingCard.name} for Buy Now ${sellBuyNow.toLocaleString()} coins!`, 'success');
    setSellingCard(null);
    setActiveTab('my_listings');
  };

  // 1-Click Quick List at Suggested Market Value
  const handleQuickListCard = (card: SoccerCard) => {
    const baseValue = card.price || 15000;
    const start = Math.max(1000, Math.floor(baseValue * 0.7));
    const buyNow = Math.max(start + 2000, Math.floor(baseValue * 1.25));

    onRemoveCardFromClub(card.id);

    const newListing: TransferListing = {
      id: `user-listing-${Date.now()}-${card.id}`,
      card,
      sellerName: 'Your Club',
      isUserListing: true,
      startBid: start,
      currentBid: 0,
      buyNowPrice: buyNow,
      bidsCount: 0,
      expiresAt: Date.now() + 3 * 60 * 60 * 1000,
      status: 'active',
      trend: 'stable',
      trendPercent: 0,
    };

    setListings((prev) => [newListing, ...prev]);
    sound.playCoinClink();
    showToast(`Quick-listed ${card.name} for ${buyNow.toLocaleString()} coins at suggested market price!`, 'success');
    setActiveTab('my_listings');
  };

  // Claim coins from sold user listing
  const handleClaimSoldCoins = (listing: TransferListing) => {
    const amount = listing.currentBid > 0 ? listing.currentBid : listing.buyNowPrice;
    onAddCoins(amount);
    sound.playCoinClink();

    // Remove from listings
    setListings((prev) => prev.filter((l) => l.id !== listing.id));
    showToast(`Claimed +${amount.toLocaleString()} coins from sale of ${listing.card.name}!`, 'success');
  };

  // Reclaim unsold / expired card
  const handleReclaimExpiredCard = (listing: TransferListing) => {
    onAddCardsToClub([listing.card]);
    sound.playCardFlip();
    setListings((prev) => prev.filter((l) => l.id !== listing.id));
    showToast(`Reclaimed ${listing.card.name} back to your Club inventory.`, 'success');
  };

  // Format countdown
  const formatTimeLeft = (expiresAt: number) => {
    const diff = expiresAt - Date.now();
    if (diff <= 0) return 'Expired';
    const mins = Math.floor(diff / (1000 * 60));
    if (mins < 60) return `${mins}m left`;
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hours}h ${remMins}m`;
  };

  // Reset all filters
  const handleResetFilters = () => {
    setFilter({
      query: '',
      position: 'ALL',
      program: 'ALL',
      nation: 'ALL',
      rarity: 'ALL',
      playStyle: 'ALL',
      instantBuyOnly: false,
      minRating: 0,
      maxRating: 99,
      minPrice: 0,
      maxPrice: 1000000,
      sortBy: 'expires_soon',
    });
    sound.playClick();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-fadeIn">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl border shadow-2xl backdrop-blur-md transition-all animate-bounce text-xs font-bold ${
            toastMsg.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/80 text-emerald-200'
              : 'bg-rose-950/90 border-rose-500/80 text-rose-200'
          }`}
        >
          {toastMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Hero Header & Market Status */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-[#0c1427] p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 text-xs font-black tracking-wide uppercase">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Live Transfer Market · Apex League</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase">
              Transfer <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">Market</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Buy, sell, bid, and trade authentic cards across International Moments, Hall of Fame, Futmas, and Base tiers. Live automated pricing, auction countdowns, and instant player listings.
            </p>
          </div>

          {/* Quick HUD Counters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-inner">
              <Coins className="w-5 h-5 text-amber-400" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Available Balance</span>
                <span className="text-base font-black text-amber-300 tabular-nums">{coins.toLocaleString()} Coins</span>
              </div>
            </div>

            {claimableSold.length > 0 && (
              <button
                onClick={() => {
                  setActiveTab('my_listings');
                  sound.playClick();
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 px-4 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-transform hover:scale-105"
              >
                <Coins className="w-4 h-4" />
                <span>Claim {claimableSold.length} Sold!</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="relative z-10 flex flex-wrap items-center gap-2 pt-6 mt-6 border-t border-slate-800/80">
          <button
            onClick={() => {
              setActiveTab('browse');
              sound.playClick();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'browse'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search Market ({filteredListings.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('sell');
              sound.playClick();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'sell'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>List Player from Club</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('my_listings');
              sound.playClick();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 relative ${
              activeTab === 'my_listings'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Gavel className="w-3.5 h-3.5" />
            <span>My Transfers ({userListings.length})</span>
            {claimableSold.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute -top-1 -right-1" />
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('my_bids');
              sound.playClick();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'my_bids'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Active Bids ({userBids.length})</span>
          </button>

          {onNavigateToMiniGames && (
            <button
              onClick={() => {
                onNavigateToMiniGames();
                sound.playClick();
              }}
              className="sm:ml-auto px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-teal-500/20 text-amber-300 hover:text-white border border-amber-500/40 hover:border-amber-400 shadow-sm hover:scale-105"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>🎮 Play Mini-Games (Earn Coins)</span>
            </button>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: BROWSE & SEARCH MARKET */}
      {/* ======================================================== */}
      {activeTab === 'browse' && (
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Primary Name/Club/Nation Search Input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={filter.query}
                  onChange={(e) => setFilter((prev) => ({ ...prev, query: e.target.value }))}
                  placeholder="Search player name, club, or nation (e.g. Ronaldinho, Argentina, Man City)..."
                  className="w-full pl-10 pr-9 py-2.5 bg-slate-950 border border-slate-700/80 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 shadow-inner"
                />
                {filter.query && (
                  <button
                    onClick={() => setFilter((prev) => ({ ...prev, query: '' }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2 text-xs text-slate-300">
                  <ArrowUpDown className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] uppercase font-bold text-slate-500">Sort:</span>
                  <select
                    value={filter.sortBy}
                    onChange={(e) => setFilter((prev) => ({ ...prev, sortBy: e.target.value as any }))}
                    className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="expires_soon" className="bg-slate-900">Ending Soonest</option>
                    <option value="price_asc" className="bg-slate-900">Buy Now: Low to High</option>
                    <option value="price_desc" className="bg-slate-900">Buy Now: High to Low</option>
                    <option value="rating_desc" className="bg-slate-900">Rating: High to Low</option>
                    <option value="rating_asc" className="bg-slate-900">Rating: Low to High</option>
                  </select>
                </div>

                <button
                  onClick={() => setShowFiltersDrawer(!showFiltersDrawer)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold border transition-colors ${
                    showFiltersDrawer
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Filters</span>
                </button>
              </div>
            </div>

            {/* Program Quick Filter Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/60">
              <span className="text-[10px] uppercase font-black text-slate-500 mr-1">Program:</span>
              {[
                { id: 'ALL', label: 'All Listings' },
                { id: 'intl', label: '🌍 Intl Moments' },
                { id: 'hof', label: '👑 Hall of Fame' },
                { id: 'futmas', label: '❄️ Futmas' },
                { id: 'base', label: '⚽ Base Stars' },
                { id: 'icon', label: '✨ Icons' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setFilter((prev) => ({ ...prev, program: p.id }));
                    sound.playClick();
                  }}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                    filter.program === p.id
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {p.label}
                </button>
              ))}

              <div className="ml-auto flex items-center gap-2">
                {(filter.query || filter.program !== 'ALL' || filter.position !== 'ALL' || filter.nation !== 'ALL' || filter.rarity !== 'ALL' || filter.playStyle !== 'ALL' || filter.instantBuyOnly || filter.minRating > 0 || filter.maxPrice < 1000000) && (
                  <button
                    onClick={handleResetFilters}
                    className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Filters</span>
                  </button>
                )}
              </div>
            </div>

            {/* Expandable Advanced Filters Drawer */}
            {showFiltersDrawer && (
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 animate-fadeIn space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Position Group */}
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                      Position
                    </label>
                    <select
                      value={filter.position}
                      onChange={(e) => setFilter((prev) => ({ ...prev, position: e.target.value as any }))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                    >
                      <option value="ALL">All Positions</option>
                      <option value="FWD">Attackers (ST, CF, LW, RW)</option>
                      <option value="MID">Midfielders (CAM, CM, CDM)</option>
                      <option value="DEF">Defenders (CB, LB, RB)</option>
                      <option value="GK">Goalkeepers (GK)</option>
                    </select>
                  </div>

                  {/* Nation Filter */}
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                      Nation / Country
                    </label>
                    <select
                      value={filter.nation || 'ALL'}
                      onChange={(e) => setFilter((prev) => ({ ...prev, nation: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                    >
                      <option value="ALL">All Nations</option>
                      <option value="Argentina">Argentina 🇦🇷</option>
                      <option value="Brazil">Brazil 🇧🇷</option>
                      <option value="Belgium">Belgium 🇧🇪</option>
                      <option value="France">France 🇫🇷</option>
                      <option value="England">England 🏴󠁧󠁢󠁥󠁮󠁧󠁿</option>
                      <option value="Netherlands">Netherlands 🇳🇱</option>
                      <option value="Portugal">Portugal 🇵🇹</option>
                      <option value="Spain">Spain 🇪🇸</option>
                      <option value="Germany">Germany 🇩🇪</option>
                      <option value="Norway">Norway 🇳🇴</option>
                      <option value="Egypt">Egypt 🇪🇬</option>
                      <option value="Italy">Italy 🇮🇹</option>
                      <option value="Uruguay">Uruguay 🇺🇾</option>
                    </select>
                  </div>

                  {/* Quality / Rarity Filter */}
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                      Quality / Rarity
                    </label>
                    <select
                      value={filter.rarity || 'ALL'}
                      onChange={(e) => setFilter((prev) => ({ ...prev, rarity: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                    >
                      <option value="ALL">All Rarities</option>
                      <option value="international_moments">International Moments</option>
                      <option value="hall_of_fame">Hall of Fame</option>
                      <option value="futmas">Futmas Special</option>
                      <option value="icon">Icon / Legend</option>
                      <option value="base">Base Card</option>
                      <option value="gold_rare">Gold Rare</option>
                      <option value="program_one">Program One</option>
                    </select>
                  </div>

                  {/* PlayStyle+ Filter */}
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                      PlayStyle+ Trait
                    </label>
                    <select
                      value={filter.playStyle || 'ALL'}
                      onChange={(e) => setFilter((prev) => ({ ...prev, playStyle: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                    >
                      <option value="ALL">All PlayStyles</option>
                      <option value="technical">Technical+ (Dribble Control)</option>
                      <option value="incisive_pass">Incisive Pass+ (Through Balls)</option>
                      <option value="rapid">Rapid+ (Breakaway Speed)</option>
                      <option value="bruiser">Bruiser+ (Physical Power)</option>
                      <option value="finesse_shot">Finesse Shot+ (Curling Finish)</option>
                      <option value="anticipate">Anticipate+ (Tackle Accuracy)</option>
                      <option value="quick_step">Quick Step+ (Acceleration)</option>
                      <option value="whipped_pass">Whipped Pass+ (Cross Delivery)</option>
                      <option value="relentless">Relentless+ (Clutch Stamina)</option>
                      <option value="trickster">Trickster+ (Skill Moves)</option>
                      <option value="long_ball_pass">Long Ball Pass+ (Lofted Ping)</option>
                      <option value="press_proven">Press Proven+ (Retention)</option>
                      <option value="power_header">Power Header+ (Aerial Goal)</option>
                      <option value="acrobatic">Acrobatic+ (Volley Flair)</option>
                      <option value="poacher">Poacher+ (Instinct Finish)</option>
                      <option value="cat_reflexes">Cat Reflexes+ (GK Save)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-slate-800/60">
                  {/* Rating Range */}
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                      Overall Rating: {filter.minRating} - {filter.maxRating}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={99}
                        value={filter.minRating}
                        onChange={(e) => setFilter((prev) => ({ ...prev, minRating: Number(e.target.value) }))}
                        placeholder="Min"
                        className="w-1/2 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                      />
                      <span className="text-slate-500">-</span>
                      <input
                        type="number"
                        min={0}
                        max={99}
                        value={filter.maxRating}
                        onChange={(e) => setFilter((prev) => ({ ...prev, maxRating: Number(e.target.value) }))}
                        placeholder="Max"
                        className="w-1/2 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                      Buy Now Coins (Max)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step={5000}
                        min={0}
                        value={filter.minPrice}
                        onChange={(e) => setFilter((prev) => ({ ...prev, minPrice: Number(e.target.value) }))}
                        placeholder="Min coins"
                        className="w-1/2 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                      />
                      <span className="text-slate-500">-</span>
                      <input
                        type="number"
                        step={5000}
                        max={1000000}
                        value={filter.maxPrice}
                        onChange={(e) => setFilter((prev) => ({ ...prev, maxPrice: Number(e.target.value) }))}
                        placeholder="Max coins"
                        className="w-1/2 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Instant Buy Only Toggle */}
                  <div className="flex flex-col justify-center">
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                      Buying Style
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 px-3 py-2 rounded-xl border border-slate-800">
                      <input
                        type="checkbox"
                        checked={filter.instantBuyOnly || false}
                        onChange={(e) => setFilter((prev) => ({ ...prev, instantBuyOnly: e.target.checked }))}
                        className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 w-4 h-4 bg-slate-950"
                      />
                      <span>⚡ Instant Buy Now Only</span>
                    </label>
                  </div>

                  {/* Clear / Apply actions */}
                  <div className="flex items-end gap-2">
                    <button
                      onClick={handleResetFilters}
                      className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition-colors"
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => setShowFiltersDrawer(false)}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs rounded-xl transition-colors"
                    >
                      Apply ({filteredListings.length})
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Listings Grid */}
          {filteredListings.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-3">
              <p className="text-slate-400 text-sm font-semibold">No active market listings match your criteria.</p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold rounded-xl transition-colors"
              >
                Clear Search & Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredListings.map((listing, idx) => {
                const canAffordBuyNow = coins >= listing.buyNowPrice;
                const minBid = listing.currentBid > 0 ? listing.currentBid + 500 : listing.startBid;
                const canAffordBid = coins >= minBid;

                return (
                  <div
                    key={`${listing.id}_${idx}`}
                    className="group bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-emerald-500/50 rounded-3xl p-4 shadow-xl transition-all duration-200 flex flex-col justify-between"
                  >
                    {/* Header info strip */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2.5 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 font-mono font-bold text-amber-400">
                          <Clock className="w-3.5 h-3.5" />
                          {formatTimeLeft(listing.expiresAt)}
                        </span>
                        {listing.trend === 'hot' && (
                          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            🔥 Hot +{listing.trendPercent || 12}%
                          </span>
                        )}
                        {listing.trend === 'up' && (
                          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            ▲ +{listing.trendPercent || 5}%
                          </span>
                        )}
                        {listing.trend === 'down' && (
                          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            ▼ {listing.trendPercent || -4}% Deal
                          </span>
                        )}
                      </div>
                      <span className="text-slate-500 truncate max-w-[100px] text-right">
                        <strong className="text-slate-300 font-semibold">{listing.sellerName}</strong>
                      </span>
                    </div>

                    {/* Card Preview */}
                    <div className="my-3 flex justify-center">
                      <CardItem card={listing.card} size="md" interactive={true} />
                    </div>

                    {/* Pricing and Action Hub */}
                    <div className="space-y-3 pt-2 border-t border-slate-800">
                      {/* Bids info */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="text-left">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">
                            Current Bid ({listing.bidsCount} bids)
                          </span>
                          <span className="font-mono font-black text-slate-200 text-sm">
                            {listing.currentBid > 0 ? `${listing.currentBid.toLocaleString()} c` : 'No bids yet'}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">
                            Buy Now Price
                          </span>
                          <span className="font-mono font-black text-amber-400 text-base">
                            {listing.buyNowPrice.toLocaleString()} c
                          </span>
                        </div>
                      </div>

                      {/* Interactive Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          onClick={() => handleOpenBid(listing)}
                          disabled={!canAffordBid}
                          className={`py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors border ${
                            canAffordBid
                              ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200 hover:text-white'
                              : 'bg-slate-950 border-slate-800 text-slate-600 cursor-not-allowed'
                          }`}
                        >
                          <Gavel className="w-3.5 h-3.5 text-amber-400" />
                          <span>Bid ({minBid.toLocaleString()})</span>
                        </button>

                        <button
                          onClick={() => handleBuyNow(listing)}
                          disabled={!canAffordBuyNow}
                          className={`py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md ${
                            canAffordBuyNow
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 hover:scale-105'
                              : 'bg-slate-950 border border-slate-800 text-slate-600 cursor-not-allowed'
                          }`}
                        >
                          <Coins className="w-3.5 h-3.5 text-slate-950" />
                          <span>Buy Now</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: SELL / LIST PLAYER FROM CLUB */}
      {/* ======================================================== */}
      {activeTab === 'sell' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
              <Tag className="w-5 h-5 text-emerald-400" />
              <span>Select a Player from Your Club to List</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Choose any player from your Club inventory. Set your starting auction price and instant Buy Now price. Simulated managers & buyers on the market will bid on and buy your listing!
            </p>
          </div>

          {/* Club inventory selector */}
          {clubCards.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800">
              <p className="text-slate-400 text-sm">You do not have any cards in your Club to list.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {clubCards.map((card, idx) => (
                <div
                  key={`${card.id}_${idx}`}
                  onClick={() => handleSelectCardToSell(card)}
                  className={`group relative flex flex-col items-center p-3 rounded-2xl cursor-pointer transition-all border ${
                    sellingCard?.id === card.id
                      ? 'bg-emerald-950/60 border-emerald-400 ring-2 ring-emerald-500 scale-105'
                      : 'bg-slate-950 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900'
                  }`}
                >
                  <CardItem card={card} size="sm" interactive={false} />
                  <div className="mt-2 text-center w-full">
                    <span className="text-xs font-bold text-white block truncate">{card.name}</span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">
                      Est. Val: {card.price?.toLocaleString()} c
                    </span>
                  </div>
                  <div className="mt-2 flex flex-col gap-1 w-full">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickListCard(card);
                      }}
                      className="w-full py-1 text-[10px] font-black uppercase rounded bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 text-slate-950 transition-colors shadow-sm flex items-center justify-center gap-1"
                      title="Instantly list at standard suggested market value"
                    >
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>Quick List ({((card.price || 15000) * 1.25).toLocaleString()} c)</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectCardToSell(card);
                      }}
                      className="w-full py-0.5 text-[9px] font-bold uppercase rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
                    >
                      Custom Price
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Listing Modal Drawer */}
          {sellingCard && (
            <div
              className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
              onClick={() => setSellingCard(null)}
            >
              <div
                className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-lg font-black text-white uppercase flex items-center gap-2">
                    <Tag className="w-4 h-4 text-emerald-400" />
                    <span>List on Transfer Market</span>
                  </h3>
                  <button onClick={() => setSellingCard(null)} className="text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
                  <CardItem card={sellingCard} size="md" interactive={false} />

                  <div className="space-y-4 w-full">
                    <div>
                      <span className="text-sm font-black text-white block">{sellingCard.name}</span>
                      <span className="text-xs text-slate-400">
                        {sellingCard.rating} OVR · {sellingCard.position} · {sellingCard.nation}
                      </span>
                    </div>

                    {/* Start Bid */}
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Starting Bid (Coins)
                      </label>
                      <input
                        type="number"
                        step={1000}
                        min={500}
                        value={sellStartBid}
                        onChange={(e) => setSellStartBid(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Buy Now Price */}
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Buy Now Price (Coins)
                      </label>
                      <input
                        type="number"
                        step={1000}
                        min={sellStartBid + 500}
                        value={sellBuyNow}
                        onChange={(e) => setSellBuyNow(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Duration */}
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Auction Duration
                      </label>
                      <div className="flex items-center gap-1.5">
                        {[1, 3, 6, 12, 24].map((hrs) => (
                          <button
                            key={hrs}
                            type="button"
                            onClick={() => setSellDurationHours(hrs)}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                              sellDurationHours === hrs
                                ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                                : 'bg-slate-950 text-slate-400 border-slate-800'
                            }`}
                          >
                            {hrs}h
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleQuickListCard(sellingCard);
                      setSellingCard(null);
                    }}
                    className="w-full py-2 bg-gradient-to-r from-amber-500/20 to-emerald-500/20 hover:from-amber-500/30 hover:to-emerald-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>⚡ 1-Click Auto Quick-List at Standard Market Value</span>
                  </button>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => setSellingCard(null)}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmListCard}
                    className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-transform hover:scale-105"
                  >
                    Confirm Listing
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: MY TRANSFERS / LISTINGS */}
      {/* ======================================================== */}
      {activeTab === 'my_listings' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Gavel className="w-5 h-5 text-emerald-400" />
                <span>My Active & Sold Listings</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Monitor items you listed on the Transfer Market. Claim coins from sold items or relist expired cards.
              </p>
            </div>

            {claimableSold.length > 0 && (
              <button
                onClick={() => {
                  claimableSold.forEach((item) => handleClaimSoldCoins(item));
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-transform hover:scale-105"
              >
                Claim All ({claimableSold.length})
              </button>
            )}
          </div>

          {userListings.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-3">
              <p className="text-slate-400 text-sm">You haven't listed any players on the market yet.</p>
              <button
                onClick={() => setActiveTab('sell')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs uppercase rounded-xl"
              >
                List a Player Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userListings.map((listing, idx) => (
                <div
                  key={`${listing.id}_${idx}`}
                  className="bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        listing.status === 'sold'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : listing.status === 'expired'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {listing.status === 'sold' ? 'Sold!' : listing.status === 'expired' ? 'Expired' : 'Active Auction'}
                    </span>
                    <span className="font-mono text-slate-400 text-xs">
                      {formatTimeLeft(listing.expiresAt)}
                    </span>
                  </div>

                  <div className="my-4 flex justify-center">
                    <CardItem card={listing.card} size="sm" interactive={false} />
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-800">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Buy Now</span>
                        <span className="font-mono font-bold text-amber-400">
                          {listing.buyNowPrice.toLocaleString()} c
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Bids</span>
                        <span className="font-mono font-bold text-slate-200">
                          {listing.bidsCount} bids ({listing.currentBid.toLocaleString()} c)
                        </span>
                      </div>
                    </div>

                    {listing.status === 'sold' ? (
                      <button
                        onClick={() => handleClaimSoldCoins(listing)}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-transform hover:scale-105 flex items-center justify-center gap-2"
                      >
                        <Coins className="w-4 h-4" />
                        <span>Claim +{listing.buyNowPrice.toLocaleString()} Coins</span>
                      </button>
                    ) : listing.status === 'expired' ? (
                      <button
                        onClick={() => handleReclaimExpiredCard(listing)}
                        className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl"
                      >
                        Reclaim Card to Club
                      </button>
                    ) : (
                      <div className="text-center text-[11px] text-slate-500 py-1 font-mono">
                        Active on Market · Awaiting bids
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: MY ACTIVE BIDS */}
      {/* ======================================================== */}
      {activeTab === 'my_bids' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <span>Auctions You Have Placed Bids On</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Live tracking of all transfer listings where you placed an active bid.
            </p>
          </div>

          {userBids.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-3">
              <p className="text-slate-400 text-sm">You haven't placed any bids on active listings.</p>
              <button
                onClick={() => setActiveTab('browse')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs uppercase rounded-xl"
              >
                Browse Market
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userBids.map((listing, idx) => (
                <div
                  key={`${listing.id}_${idx}`}
                  className="bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Highest Bidder: You
                    </span>
                    <span className="font-mono text-amber-400 text-xs">
                      {formatTimeLeft(listing.expiresAt)}
                    </span>
                  </div>

                  <div className="my-4 flex justify-center">
                    <CardItem card={listing.card} size="sm" interactive={false} />
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-800">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Your Bid</span>
                        <span className="font-mono font-bold text-emerald-400">
                          {listing.currentBid.toLocaleString()} c
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Buy Now</span>
                        <span className="font-mono font-bold text-amber-400">
                          {listing.buyNowPrice.toLocaleString()} c
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBuyNow(listing)}
                      className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md"
                    >
                      Instant Buy Now ({listing.buyNowPrice.toLocaleString()} c)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* BID AMOUNT MODAL */}
      {/* ======================================================== */}
      {bidModalListing && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setBidModalListing(null)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white uppercase flex items-center gap-2">
                <Gavel className="w-4 h-4 text-amber-400" />
                <span>Place Auction Bid</span>
              </h3>
              <button onClick={() => setBidModalListing(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <CardItem card={bidModalListing.card} size="sm" interactive={false} />
              <div>
                <span className="text-sm font-black text-white block">{bidModalListing.card.name}</span>
                <span className="text-xs text-slate-400">
                  Current Bid: <strong className="text-amber-300 font-mono">{bidModalListing.currentBid > 0 ? bidModalListing.currentBid.toLocaleString() : bidModalListing.startBid.toLocaleString()} c</strong>
                </span>
                <span className="text-xs text-slate-400 block mt-1">
                  Buy Now: <strong className="text-emerald-400 font-mono">{bidModalListing.buyNowPrice.toLocaleString()} c</strong>
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] uppercase font-bold text-slate-400 block">
                Your Bid Amount (Coins)
              </label>
              <input
                type="number"
                step={500}
                min={bidModalListing.currentBid + 250}
                value={customBidAmount}
                onChange={(e) => setCustomBidAmount(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-amber-400"
              />

              {/* Quick increment buttons */}
              <div className="flex items-center gap-2 pt-1">
                {[500, 1000, 2500, 5000].map((inc) => (
                  <button
                    key={inc}
                    onClick={() => setCustomBidAmount((prev) => prev + inc)}
                    className="flex-1 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold text-amber-400 rounded-lg"
                  >
                    +{inc.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setBidModalListing(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBid}
                className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-transform hover:scale-105"
              >
                Confirm Bid
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
