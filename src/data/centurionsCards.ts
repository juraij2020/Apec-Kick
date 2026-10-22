import { SoccerCard } from '../types/card';
import { calculateCardRating } from '../utils/cardRatingCalculator';

// Raw player data for the Centurions Promo Event
// Every rating is strictly calculated using calculateCardRating(stats, position)
// so the card rating accurately reflects the position-weighted player stats!

interface RawCenturionCard extends Omit<SoccerCard, 'rating'> {
  stats: SoccerCard['stats'];
}

const rawCenturions: RawCenturionCard[] = [
  {
    id: 'centurion_cr7',
    name: 'Cristiano Ronaldo',
    shortName: 'Ronaldo',
    position: 'ST',
    nation: 'Portugal',
    nationFlag: '🇵🇹',
    club: 'Al Nassr',
    league: 'ROSHN Saudi League',
    rarity: 'centurions',
    cardStyle: 'centurions',
    program: 'Centurions',
    centurionMilestone: '140 UEFA Champions League Goals',
    photoUrl: '🐐',
    weakFoot: 5,
    skillMoves: 5,
    workRate: 'High / Medium',
    price: 350000,
    playStylePlus: {
      id: 'poacher',
      name: 'Poacher+',
      shortDesc: 'Deadly instinctive first-time penalty box finishing',
      iconSymbol: '🎯',
      statBoost: { attribute: 'sho', bonus: 15 },
      isPlus: true
    },
    stats: {
      pac: 88,
      sho: 94,
      pas: 82,
      dri: 90,
      def: 38,
      phy: 86
    }
  },
  {
    id: 'centurion_kdb',
    name: 'Kevin De Bruyne',
    shortName: 'De Bruyne',
    position: 'CAM',
    nation: 'Belgium',
    nationFlag: '🇧🇪',
    club: 'Manchester City',
    league: 'Premier League',
    rarity: 'centurions',
    cardStyle: 'centurions',
    program: 'Centurions',
    centurionMilestone: '100+ Premier League Assists',
    photoUrl: '🎯',
    weakFoot: 5,
    skillMoves: 4,
    workRate: 'High / High',
    price: 290000,
    playStylePlus: {
      id: 'incisive_pass',
      name: 'Incisive Pass+',
      shortDesc: 'Laser through-balls dissecting defensive lines with precision',
      iconSymbol: '🪡',
      statBoost: { attribute: 'pas', bonus: 15 },
      isPlus: true
    },
    stats: {
      pac: 82,
      sho: 91,
      pas: 96,
      dri: 92,
      def: 68,
      phy: 82
    }
  },
  {
    id: 'centurion_ramos',
    name: 'Sergio Ramos',
    shortName: 'Ramos',
    position: 'CB',
    nation: 'Spain',
    nationFlag: '🇪🇸',
    club: 'Sevilla',
    league: 'La Liga',
    rarity: 'centurions',
    cardStyle: 'centurions',
    program: 'Centurions',
    centurionMilestone: '180 International Caps & 100+ Career Goals',
    photoUrl: '🛡️',
    weakFoot: 3,
    skillMoves: 3,
    workRate: 'High / Medium',
    price: 210000,
    playStylePlus: {
      id: 'anticipate',
      name: 'Anticipate+',
      shortDesc: 'Supreme standing tackle precision & interception instinct',
      iconSymbol: '🛑',
      statBoost: { attribute: 'def', bonus: 15 },
      isPlus: true
    },
    stats: {
      pac: 82,
      sho: 75,
      pas: 81,
      dri: 78,
      def: 93,
      phy: 91
    }
  },
  {
    id: 'centurion_modric',
    name: 'Luka Modrić',
    shortName: 'Modrić',
    position: 'CM',
    nation: 'Croatia',
    nationFlag: '🇭🇷',
    club: 'Real Madrid',
    league: 'La Liga',
    rarity: 'centurions',
    cardStyle: 'centurions',
    program: 'Centurions',
    centurionMilestone: '175 International Caps & 500+ Club Appearances',
    photoUrl: '🪄',
    weakFoot: 4,
    skillMoves: 4,
    workRate: 'Medium / Medium',
    price: 240000,
    playStylePlus: {
      id: 'technical',
      name: 'Technical+',
      shortDesc: 'Effortless ball control and tempo mastery under pressure',
      iconSymbol: '⚙️',
      statBoost: { attribute: 'dri', bonus: 12 },
      isPlus: true
    },
    stats: {
      pac: 80,
      sho: 84,
      pas: 93,
      dri: 92,
      def: 78,
      phy: 76
    }
  },
  {
    id: 'centurion_rashford',
    name: 'Marcus Rashford',
    shortName: 'Rashford',
    position: 'LW',
    nation: 'England',
    nationFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    club: 'Manchester United',
    league: 'Premier League',
    rarity: 'centurions',
    cardStyle: 'centurions',
    program: 'Centurions',
    centurionMilestone: '130+ Manchester United Career Goals',
    photoUrl: '⚡',
    weakFoot: 4,
    skillMoves: 5,
    workRate: 'High / Low',
    price: 220000,
    playStylePlus: {
      id: 'quick_step',
      name: 'Quick Step+',
      shortDesc: 'Explosive pace burst leaving fullbacks behind',
      iconSymbol: '⚡',
      statBoost: { attribute: 'pac', bonus: 12 },
      isPlus: true
    },
    stats: {
      pac: 94,
      sho: 89,
      pas: 84,
      dri: 88,
      def: 45,
      phy: 82
    }
  },
  {
    id: 'centurion_neuer',
    name: 'Manuel Neuer',
    shortName: 'Neuer',
    position: 'GK',
    nation: 'Germany',
    nationFlag: '🇩🇪',
    club: 'Bayern Munich',
    league: 'Bundesliga',
    rarity: 'centurions',
    cardStyle: 'centurions',
    program: 'Centurions',
    centurionMilestone: '140+ Champions League Apps & 100+ Clean Sheets',
    photoUrl: '🧤',
    weakFoot: 4,
    skillMoves: 3,
    workRate: 'Medium / Medium',
    price: 200000,
    playStylePlus: {
      id: 'cat_reflexes',
      name: 'Cat Reflexes+',
      shortDesc: 'Point-blank reaction saves and aggressive sweeper-keeper diving',
      iconSymbol: '🧤',
      statBoost: { attribute: 'dri', bonus: 15 },
      isPlus: true
    },
    stats: {
      pac: 90, // DIV
      sho: 89, // HAN
      pas: 93, // KIC
      dri: 91, // REF
      def: 62, // SPD
      phy: 92  // POS
    }
  },
  {
    id: 'centurion_thiago_silva',
    name: 'Thiago Silva',
    shortName: 'Silva',
    position: 'CB',
    nation: 'Brazil',
    nationFlag: '🇧🇷',
    club: 'Fluminense',
    league: 'Brasileirão',
    rarity: 'centurions',
    cardStyle: 'centurions',
    program: 'Centurions',
    centurionMilestone: '113 Brazil Caps & 100+ Champions League Matches',
    photoUrl: '🧱',
    weakFoot: 3,
    skillMoves: 2,
    workRate: 'Medium / High',
    price: 160000,
    playStylePlus: {
      id: 'anticipate',
      name: 'Anticipate+',
      shortDesc: 'Masterclass positional timing and turnover creation',
      iconSymbol: '🛑',
      statBoost: { attribute: 'def', bonus: 15 },
      isPlus: true
    },
    stats: {
      pac: 76,
      sho: 58,
      pas: 82,
      dri: 77,
      def: 93,
      phy: 84
    }
  },
  {
    id: 'centurion_popp',
    name: 'Alexandra Popp',
    shortName: 'Popp',
    position: 'ST',
    nation: 'Germany',
    nationFlag: '🇩🇪',
    club: 'VfL Wolfsburg',
    league: 'Frauen-Bundesliga',
    rarity: 'centurions',
    cardStyle: 'centurions',
    program: 'Centurions',
    centurionMilestone: '135 International Caps & 67 International Goals',
    photoUrl: '🦅',
    weakFoot: 4,
    skillMoves: 3,
    workRate: 'High / High',
    price: 180000,
    playStylePlus: {
      id: 'power_header',
      name: 'Power Header+',
      shortDesc: 'Unstoppable bullet trajectory on aerial deliveries',
      iconSymbol: '💥',
      statBoost: { attribute: 'sho', bonus: 14 },
      isPlus: true
    },
    stats: {
      pac: 84,
      sho: 91,
      pas: 80,
      dri: 85,
      def: 55,
      phy: 92
    }
  },
  {
    id: 'centurion_kroos',
    name: 'Toni Kroos',
    shortName: 'Kroos',
    position: 'CM',
    nation: 'Germany',
    nationFlag: '🇩🇪',
    club: 'Real Madrid',
    league: 'La Liga',
    rarity: 'centurions',
    cardStyle: 'centurions',
    program: 'Centurions',
    centurionMilestone: '108 Germany Caps & 151 UCL Appearances',
    photoUrl: '🎯',
    weakFoot: 5,
    skillMoves: 3,
    workRate: 'Medium / Medium',
    price: 210000,
    playStylePlus: {
      id: 'dead_ball',
      name: 'Dead Ball+',
      shortDesc: 'Pinpoint delivery and curve on all dead-ball set pieces',
      iconSymbol: '🎯',
      statBoost: { attribute: 'pas', bonus: 20 },
      isPlus: true
    },
    stats: {
      pac: 75,
      sho: 85,
      pas: 95,
      dri: 87,
      def: 76,
      phy: 74
    }
  },
  {
    id: 'centurion_rooney',
    name: 'Wayne Rooney',
    shortName: 'Rooney',
    position: 'CF',
    nation: 'England',
    nationFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    club: 'Manchester United',
    league: 'Premier League',
    rarity: 'centurions',
    cardStyle: 'centurions',
    program: 'Centurions',
    centurionMilestone: '253 All-Time Club Goals & 120 England Caps',
    photoUrl: '🥊',
    weakFoot: 4,
    skillMoves: 4,
    workRate: 'High / High',
    price: 280000,
    playStylePlus: {
      id: 'power_shot',
      name: 'Power Shot+',
      shortDesc: 'Devastating ferocious drives from distance',
      iconSymbol: '🚀',
      statBoost: { attribute: 'sho', bonus: 15 },
      isPlus: true
    },
    stats: {
      pac: 86,
      sho: 92,
      pas: 86,
      dri: 88,
      def: 58,
      phy: 90
    }
  },
  {
    id: 'centurion_van_nistelrooy',
    name: 'Ruud van Nistelrooy',
    shortName: 'Van Nistelrooy',
    position: 'ST',
    nation: 'Netherlands',
    nationFlag: '🇳🇱',
    club: 'Real Madrid',
    league: 'La Liga',
    rarity: 'centurions',
    cardStyle: 'centurions',
    program: 'Centurions',
    centurionMilestone: '150 Goals in Record 219 Games',
    photoUrl: '⚽',
    weakFoot: 4,
    skillMoves: 3,
    workRate: 'High / Low',
    price: 230000,
    playStylePlus: {
      id: 'poacher',
      name: 'Poacher+',
      shortDesc: 'Pure fox-in-the-box first touch conversion',
      iconSymbol: '🎯',
      statBoost: { attribute: 'sho', bonus: 15 },
      isPlus: true
    },
    stats: {
      pac: 87,
      sho: 93,
      pas: 78,
      dri: 86,
      def: 38,
      phy: 84
    }
  },
  {
    id: 'centurion_fernan',
    name: 'Fernandinho',
    shortName: 'Fernandinho',
    position: 'CDM',
    nation: 'Brazil',
    nationFlag: '🇧🇷',
    club: 'Manchester City',
    league: 'Premier League',
    rarity: 'centurions',
    cardStyle: 'centurions',
    program: 'Centurions',
    centurionMilestone: '100+ European Matches & 264 Premier League Caps',
    photoUrl: '🛡️',
    weakFoot: 3,
    skillMoves: 3,
    workRate: 'Medium / High',
    price: 175000,
    playStylePlus: {
      id: 'relentless',
      name: 'Relentless+',
      shortDesc: 'Stamina endurance across 90 minutes with zero drop-off',
      iconSymbol: '🔋',
      statBoost: { attribute: 'phy', bonus: 12 },
      isPlus: true
    },
    stats: {
      pac: 80,
      sho: 75,
      pas: 85,
      dri: 83,
      def: 89,
      phy: 88
    }
  }
];

// Map over raw cards and enforce that overall rating is calculated strictly from stats!
export const CENTURIONS_CARDS: SoccerCard[] = rawCenturions.map(card => ({
  ...card,
  rating: calculateCardRating(card.stats, card.position)
}));
