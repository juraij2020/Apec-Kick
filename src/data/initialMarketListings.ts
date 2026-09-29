import { TransferListing, SoccerCard } from '../types/card';
import { INTERNATIONAL_MOMENTS_CARDS } from './internationalMoments';
import { HALL_OF_FAME_CARDS, BASE_SOCCER_CARDS, FUTMAS_CARDS } from './defaultCards';

// Helper to find a card by ID or fallback
function findCard(id: string): SoccerCard | undefined {
  return (
    INTERNATIONAL_MOMENTS_CARDS.find((c) => c.id === id) ||
    HALL_OF_FAME_CARDS.find((c) => c.id === id) ||
    FUTMAS_CARDS.find((c) => c.id === id) ||
    BASE_SOCCER_CARDS.find((c) => c.id === id)
  );
}

// Generate realistic initial market listings
export function generateInitialListings(): TransferListing[] {
  const seedItems: {
    cardId: string;
    seller: string;
    startBid: number;
    currentBid: number;
    buyNow: number;
    expiresInMins: number;
    bids: number;
  }[] = [
    // International Moments
    {
      cardId: 'intl-ronaldinho',
      seller: 'RioSamba_XI',
      startBid: 180000,
      currentBid: 215000,
      buyNow: 280000,
      expiresInMins: 14,
      bids: 6,
    },
    {
      cardId: 'intl-de-bruyne',
      seller: 'BrusselsMaster',
      startBid: 110000,
      currentBid: 135000,
      buyNow: 175000,
      expiresInMins: 38,
      bids: 4,
    },
    {
      cardId: 'intl-maradona',
      seller: 'DiegoAlbiceleste',
      startBid: 240000,
      currentBid: 275000,
      buyNow: 340000,
      expiresInMins: 8,
      bids: 11,
    },
    {
      cardId: 'intl-hazard',
      seller: 'ChelseaClassic',
      startBid: 95000,
      currentBid: 112000,
      buyNow: 145000,
      expiresInMins: 52,
      bids: 3,
    },
    {
      cardId: 'intl-pele',
      seller: 'ORei_Brasil',
      startBid: 280000,
      currentBid: 310000,
      buyNow: 390000,
      expiresInMins: 22,
      bids: 8,
    },
    {
      cardId: 'intl-courtois',
      seller: 'WallOfMadrid',
      startBid: 70000,
      currentBid: 78000,
      buyNow: 98000,
      expiresInMins: 65,
      bids: 2,
    },
    {
      cardId: 'intl-messi',
      seller: 'RosarioMagician',
      startBid: 320000,
      currentBid: 360000,
      buyNow: 420000,
      expiresInMins: 19,
      bids: 9,
    },
    {
      cardId: 'intl-kaka',
      seller: 'Milan22_Legend',
      startBid: 115000,
      currentBid: 130000,
      buyNow: 165000,
      expiresInMins: 84,
      bids: 5,
    },
    {
      cardId: 'intl-neymar-jr',
      seller: 'SantosProdigy',
      startBid: 160000,
      currentBid: 185000,
      buyNow: 230000,
      expiresInMins: 41,
      bids: 7,
    },
    // Hall of Fame
    {
      cardId: 'hof-zidane',
      seller: 'LesBleus_10',
      startBid: 220000,
      currentBid: 245000,
      buyNow: 310000,
      expiresInMins: 29,
      bids: 5,
    },
    {
      cardId: 'hof-cruyff',
      seller: 'TotalFootball_14',
      startBid: 260000,
      currentBid: 295000,
      buyNow: 360000,
      expiresInMins: 47,
      bids: 8,
    },
    {
      cardId: 'hof-maldini',
      seller: 'Capitano3_AC',
      startBid: 150000,
      currentBid: 175000,
      buyNow: 220000,
      expiresInMins: 72,
      bids: 4,
    },
    {
      cardId: 'hof-henry',
      seller: 'HighburyKing14',
      startBid: 190000,
      currentBid: 210000,
      buyNow: 265000,
      expiresInMins: 15,
      bids: 6,
    },
    // Futmas
    {
      cardId: 'futmas-son',
      seller: 'NorthLondonFrost',
      startBid: 65000,
      currentBid: 72000,
      buyNow: 89000,
      expiresInMins: 33,
      bids: 3,
    },
    {
      cardId: 'futmas-bellingham',
      seller: 'StourbridgeStar',
      startBid: 85000,
      currentBid: 98000,
      buyNow: 125000,
      expiresInMins: 58,
      bids: 5,
    },
    // Base Stars
    {
      cardId: 'base-haaland',
      seller: 'VikingStriker_9',
      startBid: 45000,
      currentBid: 52000,
      buyNow: 68000,
      expiresInMins: 12,
      bids: 4,
    },
    {
      cardId: 'base-debruyne',
      seller: 'CityPassMaster',
      startBid: 40000,
      currentBid: 44000,
      buyNow: 55000,
      expiresInMins: 49,
      bids: 2,
    },
    {
      cardId: 'base-van-dijk',
      seller: 'AnfieldRock4',
      startBid: 38000,
      currentBid: 43000,
      buyNow: 54000,
      expiresInMins: 26,
      bids: 3,
    },
    {
      cardId: 'base-salah',
      seller: 'EgyptianKing_11',
      startBid: 39000,
      currentBid: 45000,
      buyNow: 56000,
      expiresInMins: 62,
      bids: 4,
    },
  ];

  const now = Date.now();
  const listings: TransferListing[] = [];

  seedItems.forEach((seed, idx) => {
    const card = findCard(seed.cardId);
    if (card) {
      const trends: ('up' | 'down' | 'hot' | 'stable')[] = ['up', 'down', 'hot', 'stable'];
      const trend = trends[idx % trends.length];
      const trendPercent = trend === 'up' ? Math.floor(Math.random() * 8) + 3 : trend === 'down' ? -(Math.floor(Math.random() * 7) + 2) : trend === 'hot' ? Math.floor(Math.random() * 14) + 6 : 0;

      listings.push({
        id: `listing-seed-${idx + 1}-${seed.cardId}`,
        card,
        sellerName: seed.seller,
        isUserListing: false,
        startBid: seed.startBid,
        currentBid: seed.currentBid,
        buyNowPrice: seed.buyNow,
        bidsCount: seed.bids,
        expiresAt: now + seed.expiresInMins * 60 * 1000,
        status: 'active',
        trend,
        trendPercent,
      });
    }
  });

  return listings;
}
