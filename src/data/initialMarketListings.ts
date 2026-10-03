import { TransferListing, SoccerCard } from '../types/card';
import { INTERNATIONAL_MOMENTS_CARDS } from './internationalMoments';
import { HALL_OF_FAME_CARDS, BASE_SOCCER_CARDS, FUTMAS_CARDS } from './defaultCards';
import { STREET_KINGS_CARDS } from './streetKings';
import { SUMMER_BASIC_CARDS, SUMMER_PREMIUM_CARDS } from './summerCards';

const SELLER_NAMES = [
  'TransferGuru_99',
  'Madridista_Prime',
  'SambaKing_BR',
  'CampNou_Elite',
  'EPL_Trader_UK',
  'ApexCollector',
  'MilanoCalcio',
  'AjaxAcademy_14',
  'Anfield_Rock',
  'TKM_StreetMaster',
  'FutTrader_London',
  'BayernMunich_Fan',
  'LisbonScout_7',
  'ParisianFlair',
  'CalcioSpecialist',
  'DortmundWall_09',
  'ScoutPro_Global',
  'UltimateTrader_XI',
];

/**
 * Derives a realistic market price based on card attributes and rating
 */
export function calculateRealisticMarketPrice(card: SoccerCard): {
  startBid: number;
  currentBid: number;
  buyNowPrice: number;
  bidsCount: number;
} {
  const rating = card.rating || 80;
  let baseValue = card.price && card.price > 0 ? card.price : 15000;

  if (!card.price || card.price === 0) {
    if (rating >= 96) baseValue = 350000 + (rating - 96) * 60000;
    else if (rating >= 92) baseValue = 180000 + (rating - 92) * 35000;
    else if (rating >= 88) baseValue = 85000 + (rating - 88) * 20000;
    else if (rating >= 84) baseValue = 32000 + (rating - 84) * 10000;
    else if (rating >= 80) baseValue = 14000 + (rating - 80) * 4000;
    else baseValue = 3500 + Math.max(0, (rating - 70) * 800);
  }

  // Program premium adjustments
  if (
    card.program === 'Summer Premium' ||
    card.rarity === 'summer_premium' ||
    card.cardStyle === 'summer_premium' ||
    (card.program === 'Summer Transfers' && rating >= 97)
  ) {
    // Summer Premium 97-99 high-roller luxury valuation
    if (!card.price || card.price < 1000000) {
      if (rating >= 99) baseValue = 3750000;
      else if (rating >= 98) baseValue = 2750000;
      else baseValue = 1750000;
    } else {
      baseValue = card.price;
    }
  } else if (card.program === 'Summer Transfers' || card.rarity === 'summer_transfers') {
    baseValue = Math.floor(baseValue * 1.15);
  } else if (card.program === 'Street Kings' || card.rarity === 'street_kings') {
    baseValue = Math.floor(baseValue * 1.2);
  } else if (card.program === 'Hall of Fame' || card.rarity === 'hall_of_fame') {
    baseValue = Math.floor(baseValue * 1.25);
  }

  // Round to clean thousands or hundreds
  const roundedBase = Math.round(baseValue / 500) * 500;
  const startBid = Math.max(1000, Math.round((roundedBase * 0.75) / 500) * 500);
  const buyNowPrice = Math.max(startBid + 1500, Math.round((roundedBase * 1.15) / 500) * 500);

  // Realistic randomized bids
  const bidsCount = Math.floor(Math.random() * 7);
  let currentBid = 0;
  if (bidsCount > 0) {
    const spread = buyNowPrice - startBid;
    const bidProgress = 0.25 + Math.random() * 0.55;
    currentBid = Math.min(buyNowPrice - 500, Math.round((startBid + spread * bidProgress) / 250) * 250);
  }

  return { startBid, currentBid, buyNowPrice, bidsCount };
}

/**
 * Creates a permanent TransferListing for a card (no expiration timer)
 */
export function createListingForCard(
  card: SoccerCard,
  idx: number,
  _expiresInMins?: number
): TransferListing {
  const { startBid, currentBid, buyNowPrice, bidsCount } = calculateRealisticMarketPrice(card);
  const seller = SELLER_NAMES[(idx + Math.floor(Math.random() * SELLER_NAMES.length)) % SELLER_NAMES.length];

  // Dynamic market trends: High Demand, Price Dip, Apex Value, or Stable Market
  const trendOptions: {
    trend: 'up' | 'down' | 'hot' | 'stable';
    marketTrend: 'rising' | 'stable' | 'dipping' | 'high_demand';
    percent: number;
    multiplier: number;
  }[] = [
    { trend: 'hot', marketTrend: 'high_demand', percent: Math.floor(Math.random() * 9) + 6, multiplier: 1.15 },
    { trend: 'up', marketTrend: 'rising', percent: Math.floor(Math.random() * 6) + 2, multiplier: 1.05 },
    { trend: 'down', marketTrend: 'dipping', percent: -(Math.floor(Math.random() * 6) + 2), multiplier: 0.92 },
    { trend: 'stable', marketTrend: 'stable', percent: 0, multiplier: 1.0 },
  ];

  const selectedTrend = trendOptions[idx % trendOptions.length];

  return {
    id: `listing-${Date.now()}-${idx}-${card.id}`,
    card,
    sellerName: seller,
    isUserListing: false,
    startBid,
    currentBid,
    buyNowPrice: Math.round((buyNowPrice * selectedTrend.multiplier) / 250) * 250,
    bidsCount,
    isPermanent: true,
    status: 'active',
    trend: selectedTrend.trend,
    trendPercent: selectedTrend.percent,
    marketTrend: selectedTrend.marketTrend,
    demandMultiplier: selectedTrend.multiplier,
  };
}

/**
 * Generates an active, diverse transfer market collection featuring:
 * - ☀️ Summer Transfers (130+ player pool)
 * - 🌍 International Moments
 * - 👑 Hall of Fame
 * - ❄️ Futmas Specials
 * - ⚡ Street Kings
 * - ⚽ Base Gold Stars
 */
export function generateInitialListings(customPool?: SoccerCard[]): TransferListing[] {
  // Use provided pool or gather all available card collections
  const pool =
    customPool && customPool.length > 0
      ? customPool
      : [
          ...SUMMER_PREMIUM_CARDS,
          ...SUMMER_BASIC_CARDS,
          ...STREET_KINGS_CARDS,
          ...INTERNATIONAL_MOMENTS_CARDS,
          ...HALL_OF_FAME_CARDS,
          ...FUTMAS_CARDS,
          ...BASE_SOCCER_CARDS,
        ];

  // Specific high-profile marquee players guaranteed to be listed first
  const marqueeIds = [
    // Summer Premium 97-99 Transferred Apex Cards
    'summer-prem-lewandowski-99',
    'summer-prem-griezmann-99',
    'summer-prem-salah-99',
    'summer-prem-rodri-99',
    'summer-prem-martinez-99',
    'summer-prem-araujo-99',
    'summer-prem-bernardo-silva-98',
    'summer-prem-barcola-99',
    'summer-prem-watkins-99',
    'summer-prem-akliouche-99',
    'summer-prem-leao-99',
    'summer-prem-marmoush-99',
    // Summer Transfers
    'ter-stegen',
    'tonali',
    'vlahovic',
    'vicario',
    'dovbyk',
    'martinelli',
    'savinho',
    'mendy',
    'ake',
    'thiago-silva',
    'garnacho',
    'adeyemi',
    // Street Kings
    'sk-haneen-mustafa-92',
    'sk-rashed-cam-90',
    'sk-arjun-lw-89',
    // International Moments
    'intl-pele',
    'intl-maradona',
    'intl-messi',
    'intl-ronaldinho',
    'intl-de-bruyne',
    'intl-hazard',
    'intl-neymar-jr',
    'intl-kaka',
    // Hall of Fame
    'hof-ronaldo-98',
    'hof-cafu-93',
    'hof-lucio-91',
    // Futmas
    'futmas-saka',
    'futmas-gabriel',
    'futmas-guler',
    'futmas-isak',
    // Base Stars
    'base-haaland',
    'base-debruyne',
    'base-van-dijk',
    'base-alisson',
    'base-valverde',
  ];

  const selectedCards: SoccerCard[] = [];
  const addedIds = new Set<string>();

  // Add marquee cards
  marqueeIds.forEach((id) => {
    const found = pool.find((c) => c.id === id);
    if (found && !addedIds.has(found.id)) {
      selectedCards.push(found);
      addedIds.add(found.id);
    }
  });

  // Pick an extra diverse selection of Summer Basic cards
  const summerCards = pool.filter(
    (c) =>
      (c.program === 'Summer Transfers' || c.rarity === 'summer_transfers' || c.cardStyle === 'summer_basic') &&
      !addedIds.has(c.id)
  );
  // Shuffle & take 10 additional Summer Basic cards
  const shuffledSummer = [...summerCards].sort(() => 0.5 - Math.random()).slice(0, 12);
  shuffledSummer.forEach((c) => {
    selectedCards.push(c);
    addedIds.add(c.id);
  });

  // Pick extra random cards across other programs to make up ~35-42 active auctions
  const otherCards = pool.filter((c) => !addedIds.has(c.id));
  const shuffledOthers = [...otherCards].sort(() => 0.5 - Math.random()).slice(0, 10);
  shuffledOthers.forEach((c) => {
    selectedCards.push(c);
    addedIds.add(c.id);
  });

  // If pool was sparse for any reason, fallback to whatever pool cards are available
  if (selectedCards.length === 0 && pool.length > 0) {
    selectedCards.push(...pool.slice(0, 25));
  }

  // Shuffle selected cards so all programs are mixed naturally in market
  const randomizedList = [...selectedCards].sort(() => 0.5 - Math.random());

  return randomizedList.map((card, idx) => createListingForCard(card, idx));
}

/**
 * Replenishes the market with fresh listings when count runs low
 */
export function generateMarketBatch(
  pool: SoccerCard[],
  count: number = 6
): TransferListing[] {
  if (!pool || pool.length === 0) return [];

  // Pick random cards from pool
  const sample = [...pool].sort(() => 0.5 - Math.random()).slice(0, count);
  return sample.map((card, idx) => createListingForCard(card, idx + Math.floor(Math.random() * 100)));
}
