import { TransferListing, SoccerCard } from '../types/card';
import { INTERNATIONAL_MOMENTS_CARDS } from './internationalMoments';
import { HALL_OF_FAME_CARDS, BASE_SOCCER_CARDS, FUTMAS_CARDS } from './defaultCards';
import { STREET_KINGS_CARDS } from './streetKings';
import { SUMMER_BASIC_CARDS } from './summerCards';

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
  if (card.program === 'Summer Transfers' || card.rarity === 'summer_transfers') {
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
 * Creates a single TransferListing for a card
 */
export function createListingForCard(
  card: SoccerCard,
  idx: number,
  expiresInMins?: number
): TransferListing {
  const { startBid, currentBid, buyNowPrice, bidsCount } = calculateRealisticMarketPrice(card);
  const seller = SELLER_NAMES[(idx + Math.floor(Math.random() * SELLER_NAMES.length)) % SELLER_NAMES.length];
  const trends: ('up' | 'down' | 'hot' | 'stable')[] = ['up', 'down', 'hot', 'stable'];
  const trend = trends[idx % trends.length];
  const trendPercent =
    trend === 'up'
      ? Math.floor(Math.random() * 8) + 3
      : trend === 'down'
      ? -(Math.floor(Math.random() * 7) + 2)
      : trend === 'hot'
      ? Math.floor(Math.random() * 14) + 6
      : 0;

  const durationMins = expiresInMins ?? Math.floor(Math.random() * 150) + 15; // 15 to 165 minutes
  const now = Date.now();

  return {
    id: `listing-${Date.now()}-${idx}-${card.id}`,
    card,
    sellerName: seller,
    isUserListing: false,
    startBid,
    currentBid,
    buyNowPrice,
    bidsCount,
    expiresAt: now + durationMins * 60 * 1000,
    status: 'active',
    trend,
    trendPercent,
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
          ...SUMMER_BASIC_CARDS,
          ...STREET_KINGS_CARDS,
          ...INTERNATIONAL_MOMENTS_CARDS,
          ...HALL_OF_FAME_CARDS,
          ...FUTMAS_CARDS,
          ...BASE_SOCCER_CARDS,
        ];

  // Specific high-profile marquee players guaranteed to be listed first
  const marqueeIds = [
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
