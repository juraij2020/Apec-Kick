import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { SoccerCard, TransferListing, TransferFilter } from '../types/card';
import { CardItem } from './CardItem';
import { sound } from '../utils/audio';
import {
  Search,
  SlidersHorizontal,
  Coins,
  Tag,
  ArrowUpDown,
  RotateCcw,
  RotateCw,
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
  Gamepad2,
  Target,
  Zap,
  Flame,
  Gem,
  ShoppingBag,
} from 'lucide-react';
import { safeSetItem, safeGetItem, sanitizeListingsForStorage } from '../utils/safeStorage';
import { generateInitialListings, generateMarketBatch } from '../data/initialMarketListings';

interface TransferMarketProps {
  coins: number;
  clubCards: SoccerCard[];
  onDeductCoins: (amount: number) => boolean;
  onAddCoins: (amount: number) => void;
  onAddCardsToClub: (cards: SoccerCard[]) => void;
  onRemoveCardFromClub: (cardId: string) => void;
  allCardsPool: SoccerCard[];
  onNavigateToMiniGames?: () => void;
  onNavigateToMatchSimulator?: () => void;
  onNavigateToObjectives?: () => void;
}

const STORAGE_MARKET_KEY = 'apex_fut_market_listings_v3';

export const TransferMarket: React.FC<TransferMarketProps> = ({
  coins,
  clubCards,
  onDeductCoins,
  onAddCoins,
  onAddCardsToClub,
  onRemoveCardFromClub,
  allCardsPool,
  onNavigateToMiniGames,
  onNavigateToMatchSimulator,
  onNavigateToObjectives,
}) => {
  // Navigation tabs within Transfer Market
  const [activeTab, setActiveTab] = useState<'browse' | 'sell' | 'my_listings' | 'my_bids'>('browse');

  // Coin store / cash modal
  const [cashStoreModalOpen, setCashStoreModalOpen] = useState(false);
  const [insufficientModalListing, setInsufficientModalListing] = useState<TransferListing | null>(null);

  // Hydrates card with complete rich properties from allCardsPool
  const hydrateCard = useCallback((card: SoccerCard): SoccerCard => {
    if (!card) return card;
    const match = allCardsPool.find(
      (c) => c.id === card.id || (c.name.toLowerCase() === card.name?.toLowerCase() && c.rating === card.rating)
    );
    return match ? { ...card, ...match } : card;
  }, [allCardsPool]);

  // Load / initialize listings (PERMANENT: no timers, no expiration drops!)
  const [listings, setListings] = useState<TransferListing[]>(() => {
    const saved = safeGetItem(STORAGE_MARKET_KEY);
    if (saved) {
      try {
        const parsed: TransferListing[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // In timer-free market, all active listings stay active!
          const valid = parsed
            .filter((l) => l.isUserListing || l.status === 'active')
            .map((l) => ({
              ...l,
              isPermanent: true,
              card: l.card ? { ...l.card } : l.card,
            }));

          const activeCount = valid.filter((l) => l.status === 'active').length;
          if (activeCount >= 18) {
            return valid;
          }
          const fresh = generateInitialListings(allCardsPool);
          const userItems = valid.filter((l) => l.isUserListing);
          return [...userItems, ...fresh];
        }
      } catch (e) {
        // Fallback to fresh seed
      }
    }
    return generateInitialListings(allCardsPool);
  });

  // Re-hydrate card references whenever allCardsPool updates
  useEffect(() => {
    if (allCardsPool.length > 0) {
      setListings((prevListings) => {
        let changed = false;
        const hydrated = prevListings.map((listing) => {
          if (!listing.card) return listing;
          const match = allCardsPool.find((c) => c.id === listing.card.id);
          if (match && (!listing.card.fullCardImage || !listing.card.stats)) {
            changed = true;
            return { ...listing, card: { ...listing.card, ...match } };
          }
          return listing;
        });
        return changed ? hydrated : prevListings;
      });
    }
  }, [allCardsPool]);

  // Ensure market ALWAYS has healthy stock of at least 20 active permanent listings
  useEffect(() => {
    const activeCount = listings.filter((l) => l.status === 'active').length;
    if (activeCount < 18 && allCardsPool.length > 0) {
      const fresh = generateInitialListings(allCardsPool);
      setListings((prev) => {
        const userItems = prev.filter((l) => l.isUserListing);
        const existingActive = prev.filter((l) => !l.isUserListing && l.status === 'active');
        const updated = [...userItems, ...existingActive, ...fresh].slice(0, 60);
        safeSetItem(STORAGE_MARKET_KEY, JSON.stringify(sanitizeListingsForStorage(updated)));
        return updated;
      });
    }
  }, [allCardsPool, listings.length]);

  // Persist listings safely
  useEffect(() => {
    if (listings.length > 0) {
      safeSetItem(STORAGE_MARKET_KEY, JSON.stringify(sanitizeListingsForStorage(listings)));
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
    sortBy: 'trend',
  });

  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);

  // Selected card to sell from club
  const [sellingCard, setSellingCard] = useState<SoccerCard | null>(null);
  const [sellStartBid, setSellStartBid] = useState<number>(10000);
  const [sellBuyNow, setSellBuyNow] = useState<number>(25000);

  // Bid modal state
  const [bidModalListing, setBidModalListing] = useState<TransferListing | null>(null);
  const [customBidAmount, setCustomBidAmount] = useState<number>(0);

  // Feedback notifications
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Periodic living market simulation: Community trading activity & price shifts (NO expirations!)
  useEffect(() => {
    const timer = setInterval(() => {
      setListings((prevListings) => {
        let changed = false;
        const updated = prevListings.map((listing) => {
          // Non-user active listings occasionally receive bids from community AI bidders
          if (!listing.isUserListing && listing.status === 'active' && Math.random() < 0.12) {
            const nextBid = listing.currentBid > 0 ? listing.currentBid + 500 : listing.startBid;
            if (nextBid < listing.buyNowPrice) {
              changed = true;
              return {
                ...listing,
                currentBid: nextBid,
                bidsCount: listing.bidsCount + 1,
              };
            }
          }
          return listing;
        });

        // Auto-replenish if active listings drop below 20
        const activeCount = updated.filter((l) => l.status === 'active').length;
        if (activeCount < 20 && allCardsPool.length > 0) {
          changed = true;
          const freshBatch = generateMarketBatch(allCardsPool, 8);
          return [...updated, ...freshBatch];
        }

        return changed ? updated : prevListings;
      });
    }, 12000);

    return () => clearInterval(timer);
  }, [allCardsPool]);

  // Filtered browse listings
  const filteredListings = useMemo(() => {
    return listings
      .filter((listing) => {
        if (listing.status !== 'active') return false;

        const rawCard = listing.card;
        if (!rawCard) return false;
        const card = hydrateCard(rawCard);

        // Search query
        if (filter.query.trim()) {
          const q = filter.query.toLowerCase();
          const matchName = (card.name || '').toLowerCase().includes(q);
          const matchClub = (card.club || '').toLowerCase().includes(q);
          const matchNation = (card.nation || '').toLowerCase().includes(q);
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

        // Program (Summer Transfers, Street Kings, Intl, HOF, Futmas, Base, Icon)
        if (filter.program !== 'ALL') {
          if (filter.program === 'summer' && card.program !== 'Summer Transfers' && card.rarity !== 'summer_transfers' && card.cardStyle !== 'summer_basic') return false;
          if (filter.program === 'street_kings' && card.program !== 'Street Kings' && card.rarity !== 'street_kings') return false;
          if (filter.program === 'intl' && card.program !== 'International Moments' && card.rarity !== 'international_moments') return false;
          if (filter.program === 'hof' && card.program !== 'Hall of Fame' && card.rarity !== 'hall_of_fame') return false;
          if (filter.program === 'futmas' && card.program !== 'Futmas' && card.rarity !== 'futmas') return false;
          if (filter.program === 'base' && card.program !== 'Base Cards' && card.rarity !== 'base' && card.rarity !== 'gold_rare') return false;
          if (filter.program === 'icon' && card.rarity !== 'icon') return false;
        }

        // Rating
        if (filter.minRating > 0 && (card.rating || 0) < filter.minRating) return false;
        if (filter.maxRating < 99 && (card.rating || 0) > filter.maxRating) return false;

        // Nation
        if (filter.nation && filter.nation !== 'ALL') {
          if ((card.nation || '').toLowerCase() !== filter.nation.toLowerCase()) return false;
        }

        // Quality / Rarity
        if (filter.rarity && filter.rarity !== 'ALL') {
          if (card.rarity !== filter.rarity && card.cardStyle !== filter.rarity) return false;
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
      .map((listing) => ({
        ...listing,
        card: hydrateCard(listing.card),
      }))
      .sort((a, b) => {
        if (filter.sortBy === 'trend') {
          const score = (l: TransferListing) => {
            if (l.trend === 'hot') return 100 + (l.trendPercent || 0);
            if (l.trend === 'up') return 50 + (l.trendPercent || 0);
            if (l.trend === 'stable') return 10;
            return 0;
          };
          return score(b) - score(a);
        }
        if (filter.sortBy === 'popular') return b.bidsCount - a.bidsCount;
        if (filter.sortBy === 'price_asc') return a.buyNowPrice - b.buyNowPrice;
        if (filter.sortBy === 'price_desc') return b.buyNowPrice - a.buyNowPrice;
        if (filter.sortBy === 'rating_desc') return (b.card.rating || 0) - (a.card.rating || 0);
        if (filter.sortBy === 'rating_asc') return (a.card.rating || 0) - (b.card.rating || 0);
        return 0;
      });
  }, [listings, filter, hydrateCard]);

  // User listings & bids
  const userListings = useMemo(() => listings.filter((l) => l.isUserListing), [listings]);
  const userBids = useMemo(() => listings.filter((l) => l.userHasBid), [listings]);
  const claimableSold = useMemo(() => userListings.filter((l) => l.status === 'sold'), [userListings]);

  // Buy Now Handler
  const handleBuyNow = (listing: TransferListing) => {
    if (coins < listing.buyNowPrice) {
      sound.playClick();
      setInsufficientModalListing(listing);
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
    const minBid = listing.currentBid > 0 ? listing.currentBid + 500 : listing.startBid;
    if (coins < minBid) {
      sound.playClick();
      setInsufficientModalListing(listing);
      return;
    }
    sound.playClick();
    setBidModalListing(listing);
    setCustomBidAmount(minBid);
  };

  // Confirm Bid Handler
  const handleConfirmBid = () => {
    if (!bidModalListing) return;

    const minBid = bidModalListing.currentBid > 0 ? bidModalListing.currentBid + 500 : bidModalListing.startBid;
    if (customBidAmount < minBid) {
      showToast(`Bid must be at least ${minBid.toLocaleString()} coins.`, 'error');
      return;
    }

    if (customBidAmount >= bidModalListing.buyNowPrice) {
      // Auto-convert to Buy Now
      handleBuyNow(bidModalListing);
      setBidModalListing(null);
      return;
    }

    if (coins < customBidAmount) {
      showToast(`You don't have enough coins to place this bid!`, 'error');
      setInsufficientModalListing(bidModalListing);
      return;
    }

    const deducted = onDeductCoins(customBidAmount);
    if (!deducted) {
      showToast('Coin deduction failed.', 'error');
      return;
    }

    // Update listing with user's bid
    setListings((prev) =>
      prev.map((l) =>
        l.id === bidModalListing.id
          ? {
              ...l,
              currentBid: customBidAmount,
              bidsCount: l.bidsCount + 1,
              userHasBid: true,
            }
          : l
      )
    );

    sound.playCoinClink();
    showToast(`Placed winning bid of ${customBidAmount.toLocaleString()} coins on ${bidModalListing.card.name}!`, 'success');
    setBidModalListing(null);
  };

  // Select card to sell from club
  const handleSelectCardToSell = (card: SoccerCard) => {
    sound.playClick();
    setSellingCard(card);
    const baseValue = card.price || 15000;
    setSellStartBid(Math.max(1000, Math.floor(baseValue * 0.75)));
    setSellBuyNow(Math.max(sellStartBid + 2500, Math.floor(baseValue * 1.25)));
  };

  // Publish permanent listing from club
  const handlePublishListing = () => {
    if (!sellingCard) return;

    if (sellBuyNow <= sellStartBid) {
      showToast('Buy Now price must be higher than starting bid.', 'error');
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
      isPermanent: true,
      status: 'active',
      trend: 'stable',
      trendPercent: 0,
      marketTrend: 'stable',
    };

    setListings((prev) => [newListing, ...prev]);
    sound.playCoinClink();
    showToast(`Permanently listed ${sellingCard.name} for Buy Now ${sellBuyNow.toLocaleString()} coins!`, 'success');
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
      isPermanent: true,
      status: 'active',
      trend: 'stable',
      trendPercent: 0,
      marketTrend: 'stable',
    };

    setListings((prev) => [newListing, ...prev]);
    sound.playCoinClink();
    showToast(`Quick-listed ${card.name} for ${buyNow.toLocaleString()} coins! Permanent listing active.`, 'success');
    setActiveTab('my_listings');
  };

  // Claim coins from sold user listing
  const handleClaimSoldCoins = (listing: TransferListing) => {
    const amount = listing.currentBid > 0 ? listing.currentBid : listing.buyNowPrice;
    onAddCoins(amount);
    sound.playCoinClink();
    setListings((prev) => prev.filter((l) => l.id !== listing.id));
    showToast(`Claimed +${amount.toLocaleString()} coins from sale of ${listing.card.name}!`, 'success');
  };

  // Reclaim unsold card back to club
  const handleReclaimCard = (listing: TransferListing) => {
    onAddCardsToClub([listing.card]);
    sound.playCardFlip();
    setListings((prev) => prev.filter((l) => l.id !== listing.id));
    showToast(`Reclaimed ${listing.card.name} back to your Club inventory.`, 'success');
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
      sortBy: 'trend',
    });
    sound.playClick();
  };

  // Manual market restock trigger
  const handleRefreshMarket = () => {
    sound.playPackRip();
    const fresh = generateInitialListings(allCardsPool);
    setListings((prev) => {
      const userItems = prev.filter((l) => l.isUserListing);
      return [...userItems, ...fresh];
    });
    showToast('Market refreshed with 40+ permanent listings from all card sets!', 'success');
  };

  // Quick cash top-up handlers
  const handleQuickGrant = (amount: number, label: string) => {
    onAddCoins(amount);
    sound.playGoalCheer();
    showToast(`Claimed +${amount.toLocaleString()} coins (${label})!`, 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200 border ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/95 border-emerald-500/80 text-emerald-200'
              : toastMessage.type === 'error'
              ? 'bg-rose-950/95 border-rose-500/80 text-rose-200'
              : 'bg-slate-900/95 border-slate-700 text-slate-200'
          }`}
        >
          {toastMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
          {toastMessage.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />}
          <span className="text-xs font-semibold">{toastMessage.text}</span>
        </div>
      )}

      {/* TOP HEADER: Permanent Market + Play-to-Earn & Cash Integration */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
              <h1 className="text-2xl font-black text-white tracking-tight uppercase">
                Transfer Market
              </h1>
              {/* Permanent Market Badge */}
              <span className="text-emerald-400 font-semibold text-xs flex items-center gap-1.5 ml-2">
                <Gem className="w-3.5 h-3.5" />
                Permanent Listings · No Timer Expiration
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Players stay on the market indefinitely until bought. Earn coins by playing matches, completing daily objectives and mini-games, or top up with instant cash to buy your dream superstars.
            </p>
          </div>

          {/* Quick Actions & Coin Balance */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-950/80 border border-amber-500/40 rounded-2xl shadow-inner">
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-black text-amber-300 font-mono tabular-nums">
                {coins.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Coins</span>
            </div>

            {/* Quick Cash Top-Up Button */}
            <button
              onClick={() => {
                sound.playClick();
                setCashStoreModalOpen(true);
              }}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-xs rounded-xl shadow-lg transition-transform hover:scale-105 flex items-center gap-1.5"
              title="Instant Cash & Coin Top-Up Store"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Coin Store</span>
            </button>

            {/* Refresh Market Button */}
            <button
              onClick={handleRefreshMarket}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors border border-slate-700"
              title="Refresh Transfer Market Listings"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* DUAL ECONOMY BANNER: Play to Earn vs. Cash Integration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
          {/* Play to Earn Lane */}
          <div className="bg-slate-950/60 rounded-2xl p-3.5 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
                <Gamepad2 className="w-4 h-4" />
                <span>Play to Earn Route (Free Grind)</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Earn thousands of coins playing simulated league matches, daily objectives, and mini-games.
              </p>
            </div>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {onNavigateToMatchSimulator && (
                <button
                  onClick={onNavigateToMatchSimulator}
                  className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 hover:scale-105"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Match Simulator (+1,200 c)</span>
                </button>
              )}
              {onNavigateToObjectives && (
                <button
                  onClick={onNavigateToObjectives}
                  className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 hover:scale-105"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Daily Objectives (+15k c)</span>
                </button>
              )}
              {onNavigateToMiniGames && (
                <button
                  onClick={onNavigateToMiniGames}
                  className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 hover:scale-105"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Mini-Games (+800 c)</span>
                </button>
              )}
            </div>
          </div>

          {/* Cash / Instant Top-Up Lane */}
          <div className="bg-slate-950/60 rounded-2xl p-3.5 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
                <Zap className="w-4 h-4" />
                <span>Instant Cash Route (Quick Buy)</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Want immediate star players without waiting? Cash in with free instant grants or coin store top-ups.
              </p>
            </div>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <button
                onClick={() => handleQuickGrant(50000, 'Free Cash Grant')}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-xl text-[11px] transition-all flex items-center gap-1.5 shadow-md hover:scale-105"
              >
                <Coins className="w-3.5 h-3.5" />
                <span>+50,000 Instant Cash Grant</span>
              </button>
              <button
                onClick={() => setCashStoreModalOpen(true)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                <span>View All Cash Bundles</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800 flex-wrap">
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
            <span>Market Listings ({filteredListings.length})</span>
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
            <span>Sell Player from Club</span>
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
            <span>My Listed Cards ({userListings.length})</span>
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
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Active Bids ({userBids.length})</span>
          </button>
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
                  placeholder="Search player name, club, or nation (e.g. Ronaldinho, Mbappé, Man City)..."
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
                    <option value="trend" className="bg-slate-900">📈 Market Trend (High Demand)</option>
                    <option value="popular" className="bg-slate-900">🔥 Most Active Bids</option>
                    <option value="rating_desc" className="bg-slate-900">Rating: High to Low</option>
                    <option value="rating_asc" className="bg-slate-900">Rating: Low to High</option>
                    <option value="price_asc" className="bg-slate-900">Buy Now: Low to High</option>
                    <option value="price_desc" className="bg-slate-900">Buy Now: High to Low</option>
                  </select>
                </div>

                {/* Filter Drawer Toggle */}
                <button
                  onClick={() => setShowFiltersDrawer(!showFiltersDrawer)}
                  className={`p-2.5 rounded-2xl border transition-colors flex items-center gap-1.5 text-xs font-bold ${
                    showFiltersDrawer
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="hidden sm:inline">Filters</span>
                </button>
              </div>
            </div>

            {/* Quick program filter buttons */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
              {[
                { id: 'ALL', label: 'All Players' },
                { id: 'summer', label: '☀️ Summer Transfers' },
                { id: 'street_kings', label: '⚡ Street Kings' },
                { id: 'intl', label: '🌍 Intl Moments' },
                { id: 'hof', label: '👑 Hall of Fame' },
                { id: 'futmas', label: '❄️ Futmas' },
                { id: 'base', label: '⚽ Base Stars' },
              ].map((prog) => (
                <button
                  key={prog.id}
                  onClick={() => {
                    setFilter((prev) => ({ ...prev, program: prog.id }));
                    sound.playClick();
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                    filter.program === prog.id
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-sm'
                      : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {prog.label}
                </button>
              ))}
            </div>

            {/* Advanced Filters Drawer */}
            {showFiltersDrawer && (
              <div className="pt-4 border-t border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in duration-150">
                {/* Position */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Position</label>
                  <select
                    value={filter.position}
                    onChange={(e) => setFilter((prev) => ({ ...prev, position: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="ALL">Any Position</option>
                    <option value="FWD">Attackers (ST, CF, LW, RW)</option>
                    <option value="MID">Midfielders (CAM, CM, CDM, LM, RM)</option>
                    <option value="DEF">Defenders (CB, LB, RB)</option>
                    <option value="GK">Goalkeepers (GK)</option>
                  </select>
                </div>

                {/* Min Rating */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                    Min Rating: {filter.minRating > 0 ? filter.minRating : 'Any'}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="98"
                    value={filter.minRating}
                    onChange={(e) => setFilter((prev) => ({ ...prev, minRating: Number(e.target.value) }))}
                    className="w-full accent-emerald-500"
                  />
                </div>

                {/* Max Price */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                    Max Price: {filter.maxPrice < 1000000 ? `${filter.maxPrice.toLocaleString()} c` : 'No Limit'}
                  </label>
                  <input
                    type="range"
                    min="10000"
                    max="1000000"
                    step="25000"
                    value={filter.maxPrice}
                    onChange={(e) => setFilter((prev) => ({ ...prev, maxPrice: Number(e.target.value) }))}
                    className="w-full accent-emerald-500"
                  />
                </div>

                {/* Reset button */}
                <div className="flex items-end">
                  <button
                    onClick={handleResetFilters}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Filters</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Listings Grid */}
          {filteredListings.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-4">
              <p className="text-slate-400 text-sm font-semibold">No active market listings match your criteria.</p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold rounded-xl transition-colors"
                >
                  Clear Search & Filters
                </button>
                <button
                  onClick={handleRefreshMarket}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-black rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Restock Market</span>
                </button>
              </div>
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
                    {/* Header info strip: Zero-pill clean metadata with permanent indicator & dynamic trend */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2.5 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        {/* Permanent listing badge */}
                        <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                          <Gem className="w-3 h-3" />
                          <span>Permanent</span>
                        </span>

                        {/* Market Trend Indicator */}
                        {listing.trend === 'hot' && (
                          <span className="text-[10px] font-bold text-rose-400 flex items-center gap-0.5">
                            <Flame className="w-3 h-3 text-rose-400" />
                            <span>+{listing.trendPercent || 12}% Demand</span>
                          </span>
                        )}
                        {listing.trend === 'up' && (
                          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5">
                            <TrendingUp className="w-3 h-3 text-emerald-400" />
                            <span>+{listing.trendPercent || 5}% Trend</span>
                          </span>
                        )}
                        {listing.trend === 'down' && (
                          <span className="text-[10px] font-bold text-cyan-400">
                            📉 Deal {listing.trendPercent || -4}%
                          </span>
                        )}
                        {listing.trend === 'stable' && (
                          <span className="text-[10px] text-slate-500 font-medium">
                            ⚖️ Stable
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
                        {/* Bid Button */}
                        <button
                          onClick={() => handleOpenBid(listing)}
                          className={`py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors border ${
                            canAffordBid
                              ? 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border-cyan-500/40'
                              : 'bg-slate-900/60 text-slate-500 border-slate-800 hover:border-amber-500/40 hover:text-amber-300'
                          }`}
                        >
                          <Gavel className="w-3.5 h-3.5" />
                          <span>{canAffordBid ? 'Place Bid' : 'Get Coins'}</span>
                        </button>

                        {/* Buy Now Button */}
                        <button
                          onClick={() => handleBuyNow(listing)}
                          className={`py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-transform shadow-md ${
                            canAffordBuyNow
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 hover:scale-105 active:scale-95'
                              : 'bg-gradient-to-r from-amber-600/80 to-amber-700/80 hover:from-amber-500 hover:to-amber-600 text-white hover:scale-105 active:scale-95'
                          }`}
                        >
                          <Coins className="w-3.5 h-3.5" />
                          <span>{canAffordBuyNow ? 'Buy Now' : 'Cash In'}</span>
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
      {/* TAB 2: SELL A PLAYER FROM CLUB */}
      {/* ======================================================== */}
      {activeTab === 'sell' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-2">
            <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
              <Tag className="w-5 h-5 text-emerald-400" />
              <span>List a Player on the Permanent Market</span>
            </h2>
            <p className="text-xs text-slate-400">
              Select any player from your club to list on the transfer market. Your listing will remain permanently active until purchased by another trader or reclaimed.
            </p>
          </div>

          {sellingCard ? (
            <div className="bg-slate-900/90 border border-emerald-500/50 rounded-3xl p-6 shadow-2xl space-y-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Listing Configuration
                </span>
                <button
                  onClick={() => setSellingCard(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Change Player
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                <CardItem card={sellingCard} size="md" interactive={false} />
                <div className="flex-1 space-y-4 w-full">
                  <div>
                    <h3 className="text-lg font-black text-white">{sellingCard.name}</h3>
                    <p className="text-xs text-slate-400">
                      {sellingCard.position} · {sellingCard.rating} OVR · {sellingCard.club}
                    </p>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Starting Bid (Coins)
                    </label>
                    <input
                      type="number"
                      step={500}
                      min={1000}
                      value={sellStartBid}
                      onChange={(e) => setSellStartBid(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Buy Now Price (Coins)
                    </label>
                    <input
                      type="number"
                      step={500}
                      min={sellStartBid + 1000}
                      value={sellBuyNow}
                      onChange={(e) => setSellBuyNow(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono text-amber-300"
                    />
                  </div>

                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                    <Gem className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Permanent Listing: Active until bought. No timer will expire or remove your player.</span>
                  </div>

                  <button
                    onClick={handlePublishListing}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Publish Permanent Listing ({sellBuyNow.toLocaleString()} c)</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Choose a Card from Your Club ({clubCards.length} available)
              </div>

              {clubCards.length === 0 ? (
                <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800">
                  <p className="text-slate-400 text-sm">Your club has no tradeable cards.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {clubCards.map((card) => (
                    <div
                      key={card.id}
                      className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-3 flex flex-col items-center justify-between group transition-all"
                    >
                      <CardItem card={card} size="sm" interactive={false} />
                      <div className="w-full mt-3 space-y-1.5">
                        <button
                          onClick={() => handleSelectCardToSell(card)}
                          className="w-full py-1.5 bg-slate-800 hover:bg-emerald-600 hover:text-black text-slate-200 text-[11px] font-bold rounded-lg transition-colors"
                        >
                          Set Price & List
                        </button>
                        <button
                          onClick={() => handleQuickListCard(card)}
                          className="w-full py-1 bg-slate-950 hover:bg-slate-850 text-amber-400 border border-amber-500/30 text-[10px] font-bold rounded-lg transition-colors"
                        >
                          ⚡ 1-Click List
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: MY TRANSFERS */}
      {/* ======================================================== */}
      {activeTab === 'my_listings' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
              <Gavel className="w-5 h-5 text-emerald-400" />
              <span>Your Listed Transfer Cards</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Active permanent listings stay available until purchased. Sold players can have their coins claimed instantly.
            </p>
          </div>

          {userListings.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-3">
              <p className="text-slate-400 text-sm">You haven't listed any players yet.</p>
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
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {listing.status === 'sold' ? 'Sold!' : 'Permanent Active Listing'}
                    </span>
                    <span className="font-mono text-emerald-400 text-xs font-semibold">
                      {listing.status === 'sold' ? 'Ready to Claim' : 'Live on Market'}
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
                    ) : (
                      <button
                        onClick={() => handleReclaimCard(listing)}
                        className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors"
                      >
                        Reclaim Card to Club
                      </button>
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
              <TrendingUp className="w-5 h-5 text-amber-400" />
              <span>Auctions You Have Placed Bids On</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Live tracking of all transfer listings where you placed an active bid. Listings never expire!
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
                    <span className="font-mono text-emerald-400 text-xs">
                      Permanent Auction
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
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
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
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-semibold">
                  <Gem className="w-3 h-3" />
                  Permanent Listing
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

      {/* ======================================================== */}
      {/* INSUFFICIENT COINS: CHOOSE PLAY-TO-EARN OR CASH IN */}
      {/* ======================================================== */}
      {insufficientModalListing && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setInsufficientModalListing(null)}
        >
          <div
            className="bg-[#0f172a] border border-amber-500/50 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white uppercase flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-400" />
                <span>Need More Coins for {insufficientModalListing.card.name}</span>
              </h3>
              <button onClick={() => setInsufficientModalListing(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
              <CardItem card={insufficientModalListing.card} size="sm" interactive={false} />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-black text-white">{insufficientModalListing.card.name}</div>
                <div className="text-xs text-slate-400">
                  Buy Now Cost: <strong className="text-amber-400 font-mono">{insufficientModalListing.buyNowPrice.toLocaleString()} coins</strong>
                </div>
                <div className="text-xs text-slate-400">
                  Your Balance: <span className="font-mono text-slate-200">{coins.toLocaleString()} coins</span>
                </div>
                <div className="text-xs text-rose-400 font-bold mt-1">
                  Deficit: -{(insufficientModalListing.buyNowPrice - coins).toLocaleString()} coins needed
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Choose How to Acquire This Player:
              </div>

              {/* Option A: Play-to-Earn */}
              <div className="p-3.5 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5 uppercase">
                    <Gamepad2 className="w-4 h-4" />
                    Option 1: Play to Earn
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">100% Free Grind</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Simulate matches or complete daily objectives. Your player will remain on the market!
                </p>
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  {onNavigateToMatchSimulator && (
                    <button
                      onClick={() => {
                        setInsufficientModalListing(null);
                        onNavigateToMatchSimulator();
                      }}
                      className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold transition-all"
                    >
                      ⚽ Play Match Simulator
                    </button>
                  )}
                  {onNavigateToMiniGames && (
                    <button
                      onClick={() => {
                        setInsufficientModalListing(null);
                        onNavigateToMiniGames();
                      }}
                      className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-bold transition-all"
                    >
                      ⚡ Play Mini-Games
                    </button>
                  )}
                </div>
              </div>

              {/* Option B: Cash In Right Now */}
              <div className="p-3.5 bg-slate-900/60 rounded-2xl border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-400 flex items-center gap-1.5 uppercase">
                    <Zap className="w-4 h-4" />
                    Option 2: Cash In Instantly
                  </span>
                  <span className="text-[10px] text-amber-300 font-semibold">Instant Grant</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Claim immediate event coins right now to complete this purchase without waiting.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      const needed = insufficientModalListing.buyNowPrice - coins;
                      const grant = Math.max(50000, Math.ceil(needed / 10000) * 10000);
                      onAddCoins(grant);
                      sound.playGoalCheer();
                      showToast(`Claimed +${grant.toLocaleString()} cash coins!`, 'success');
                      // Immediately purchase the card
                      onDeductCoins(insufficientModalListing.buyNowPrice);
                      onAddCardsToClub([insufficientModalListing.card]);
                      setListings((prev) =>
                        prev.map((l) =>
                          l.id === insufficientModalListing.id
                            ? { ...l, status: 'sold' as const, buyerName: 'You (Apex User)' }
                            : l
                        )
                      );
                      setInsufficientModalListing(null);
                    }}
                    className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-transform hover:scale-105 flex items-center justify-center gap-1.5"
                  >
                    <Coins className="w-4 h-4" />
                    <span>Top Up Difference & Buy Card Now</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CASH STORE MODAL ("people who cash will buy cards") */}
      {/* ======================================================== */}
      {cashStoreModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setCashStoreModalOpen(false)}
        >
          <div
            className="bg-[#0f172a] border border-amber-500/40 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/40">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white uppercase">Coin Store & Cash In</h3>
                  <p className="text-xs text-slate-400">Buy coins instantly to acquire transfer market superstars</p>
                </div>
              </div>
              <button onClick={() => setCashStoreModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Balance */}
            <div className="flex items-center justify-between p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs">
              <span className="text-slate-400 font-semibold">Current Club Coins:</span>
              <span className="font-mono font-black text-amber-300 text-base">{coins.toLocaleString()} c</span>
            </div>

            {/* Coin Packages */}
            <div className="space-y-3">
              {[
                {
                  id: 'pack-50k',
                  name: 'Club Starter Cash Boost',
                  amount: 50000,
                  badge: 'Popular',
                  badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
                  desc: 'Perfect for signing marquee gold stars and summer basic cards.',
                },
                {
                  id: 'pack-150k',
                  name: 'Pro Trader Package',
                  amount: 150000,
                  badge: 'Best Value',
                  badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
                  desc: 'Sign world-class Street Kings and International Moments champions.',
                },
                {
                  id: 'pack-500k',
                  name: 'Apex Whale High-Roller',
                  amount: 500000,
                  badge: 'Ultimate',
                  badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
                  desc: 'Dominate the transfer market and buy any 95+ Hall of Fame legend.',
                },
              ].map((bundle) => (
                <div
                  key={bundle.id}
                  className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 transition-all flex items-center justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-white">{bundle.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${bundle.badgeColor}`}>
                        {bundle.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{bundle.desc}</p>
                    <div className="text-base font-black text-amber-400 font-mono mt-1">
                      +{bundle.amount.toLocaleString()} Coins
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      handleQuickGrant(bundle.amount, bundle.name);
                    }}
                    className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-transform hover:scale-105 active:scale-95 flex-shrink-0 flex items-center gap-1.5"
                  >
                    <Coins className="w-3.5 h-3.5" />
                    <span>Claim Cash</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800 text-[11px] text-slate-400 text-center">
              All coin bundles can also be earned 100% free by simulating matches and completing daily objectives!
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
