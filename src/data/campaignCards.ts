import { SoccerCard } from '../types/card';
import { calculateCardRating } from '../utils/cardRatingCalculator';
import { generateUserCardSvg, PLAYSTYLE_PRESETS } from './cardSvgGenerator';

// =========================================================================
// 5 EXCLUSIVE CAMPAIGN CARDS
// STRICTLY OBTAINABLE AS THE 100% GAME COMPLETION SET REWARD!
// Ratings are automatically calculated via the position-weighted stat formula.
// =========================================================================

interface RawCampaignCard extends Omit<SoccerCard, 'rating'> {
  stats: SoccerCard['stats'];
}

const rawCampaignCards: RawCampaignCard[] = [
  {
    id: 'campaign-descamps-gk',
    name: 'Rémy Descamps',
    shortName: 'Descamps',
    position: 'GK',
    nation: 'France',
    nationFlag: '🇫🇷',
    club: 'Olympique Lyonnais',
    league: 'Ligue 1',
    rarity: 'campaign',
    cardStyle: 'campaign_futuristic',
    program: 'Campaign Masters',
    isCustom: true,
    isSetRewardOnly: true,
    photoUrl: '🧤',
    weakFoot: 3,
    skillMoves: 1,
    workRate: 'M/M',
    price: 350000,
    playStylePlus: PLAYSTYLE_PRESETS.cat_reflexes,
    stats: {
      pac: 80, // DIV
      sho: 79, // HAN
      pas: 78, // KIC
      dri: 82, // REF
      def: 48, // SPD
      phy: 81, // POS
    },
  },
  {
    id: 'campaign-soler-cm',
    name: 'Carlos Soler',
    shortName: 'Soler',
    position: 'CM',
    nation: 'Spain',
    nationFlag: '🇪🇸',
    club: 'Paris Saint-Germain',
    league: 'Ligue 1',
    rarity: 'campaign',
    cardStyle: 'campaign_futuristic',
    program: 'Campaign Masters',
    isCustom: true,
    isSetRewardOnly: true,
    photoUrl: '⚡',
    weakFoot: 4,
    skillMoves: 4,
    workRate: 'H/M',
    price: 420000,
    playStylePlus: PLAYSTYLE_PRESETS.whipped_pass,
    stats: {
      pac: 82,
      sho: 82,
      pas: 85,
      dri: 84,
      def: 76,
      phy: 80,
    },
  },
  {
    id: 'campaign-solanke-st',
    name: 'Dominic Solanke',
    shortName: 'Solanke',
    position: 'ST',
    nation: 'England',
    nationFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    club: 'Tottenham Hotspur',
    league: 'Premier League',
    rarity: 'campaign',
    cardStyle: 'campaign_futuristic',
    program: 'Campaign Masters',
    isCustom: true,
    isSetRewardOnly: true,
    photoUrl: '🎯',
    weakFoot: 4,
    skillMoves: 4,
    workRate: 'H/H',
    price: 480000,
    playStylePlus: PLAYSTYLE_PRESETS.finesse_shot,
    stats: {
      pac: 86,
      sho: 85,
      pas: 75,
      dri: 82,
      def: 45,
      phy: 84,
    },
  },
  {
    id: 'campaign-medina-cb',
    name: 'Facundo Medina',
    shortName: 'Medina',
    position: 'CB',
    nation: 'Argentina',
    nationFlag: '🇦🇷',
    club: 'RC Lens',
    league: 'Ligue 1',
    rarity: 'campaign',
    cardStyle: 'campaign_futuristic',
    program: 'Campaign Masters',
    isCustom: true,
    isSetRewardOnly: true,
    photoUrl: '🛡️',
    weakFoot: 3,
    skillMoves: 3,
    workRate: 'H/H',
    price: 440000,
    playStylePlus: PLAYSTYLE_PRESETS.anticipate,
    stats: {
      pac: 79,
      sho: 56,
      pas: 78,
      dri: 77,
      def: 85,
      phy: 84,
    },
  },
  {
    id: 'campaign-cherki-cam',
    name: 'Rayan Cherki',
    shortName: 'Cherki',
    position: 'CAM',
    nation: 'France',
    nationFlag: '🇫🇷',
    club: 'Olympique Lyonnais',
    league: 'Ligue 1',
    rarity: 'campaign',
    cardStyle: 'campaign_futuristic',
    program: 'Campaign Masters',
    isCustom: true,
    isSetRewardOnly: true,
    photoUrl: '🪄',
    weakFoot: 5,
    skillMoves: 5,
    workRate: 'H/L',
    price: 460000,
    playStylePlus: PLAYSTYLE_PRESETS.quick_step,
    stats: {
      pac: 83,
      sho: 80,
      pas: 85,
      dri: 89,
      def: 36,
      phy: 64,
    },
  },
];

// Build fully initialized Campaign cards with strictly computed ratings and SVG art
export const CAMPAIGN_CARDS: SoccerCard[] = rawCampaignCards.map((raw) => {
  const calculatedOvr = calculateCardRating(raw.stats, raw.position);
  return {
    ...raw,
    rating: calculatedOvr,
    fullCardImage: generateUserCardSvg(
      raw.name,
      calculatedOvr,
      raw.position,
      raw.stats,
      raw.nationFlag,
      raw.club.slice(0, 4).toUpperCase(),
      raw.photoUrl || '⚽',
      'campaign_futuristic',
      raw.playStylePlus
    ),
  };
});
