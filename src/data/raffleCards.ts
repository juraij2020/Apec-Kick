import { SoccerCard, CardStats } from '../types/card';
import { PLAYSTYLE_PRESETS } from './cardSvgGenerator';

/**
 * Generates an ultra-luxurious, golden-amber SVG shield for the Official Raffle Edition cards.
 * Features guilloche raffle ticket geometry, metallic gold gradient borders, and glowing accents.
 */
export function generateRaffleCardSvg(
  shortName: string,
  rating: number,
  position: string,
  stats: CardStats,
  nationFlag: string,
  clubCode: string,
  monthLabel: string,
  playStyleBadge?: string
): string {
  const primaryGold = '#fbbf24';
  const moltenGold = '#f59e0b';
  const amberGlow = '#d97706';
  const deepObsidian = '#0f172a';

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 644 900" width="100%" height="100%" style="border-radius: 28px; overflow: hidden; filter: drop-shadow(0 16px 32px rgba(0,0,0,0.75));">
    <defs>
      <!-- Gold Foil Metallic Border Gradient -->
      <linearGradient id="raffleBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fef08a" />
        <stop offset="25%" stop-color="${primaryGold}" />
        <stop offset="50%" stop-color="#fef9c3" />
        <stop offset="75%" stop-color="${moltenGold}" />
        <stop offset="100%" stop-color="#b45309" />
      </linearGradient>

      <!-- Royal Obsidian & Molten Gold Background -->
      <radialGradient id="raffleVortexGrad" cx="50%" cy="36%" r="68%">
        <stop offset="0%" stop-color="#78350f" />
        <stop offset="35%" stop-color="#451a03" />
        <stop offset="70%" stop-color="#1c1917" />
        <stop offset="100%" stop-color="${deepObsidian}" />
      </radialGradient>

      <!-- Soft Gold Glow -->
      <filter id="raffleGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="7" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>

      <!-- Golden Nameplate Gradient -->
      <linearGradient id="nameplateGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#78350f" stop-opacity="0.8" />
        <stop offset="50%" stop-color="#d97706" stop-opacity="0.9" />
        <stop offset="100%" stop-color="#78350f" stop-opacity="0.8" />
      </linearGradient>

      <!-- Shield Clip Path -->
      <clipPath id="raffleShieldClip">
        <path d="M 322 30 
                 C 490 30, 600 68, 600 185 
                 C 600 480, 560 710, 322 875 
                 C 84 710, 44 480, 44 185 
                 C 44 68, 154 30, 322 30 Z" />
      </clipPath>
    </defs>

    <!-- Outer Gold Border -->
    <path d="M 322 24 
             C 496 24, 610 64, 610 185 
             C 610 490, 570 725, 322 890 
             C 74 725, 34 490, 34 185 
             C 34 64, 148 24, 322 24 Z" 
          fill="none" stroke="url(#raffleBorderGrad)" stroke-width="12" filter="url(#raffleGlow)" />

    <!-- Secondary Inner Accent Line -->
    <path d="M 322 34 
             C 488 34, 596 70, 596 185 
             C 596 480, 558 710, 322 874 
             C 86 710, 48 480, 48 185 
             C 48 70, 156 34, 322 34 Z" 
          fill="none" stroke="#fef08a" stroke-opacity="0.4" stroke-width="2.5" />

    <!-- Interior Graphics & Layout -->
    <g clip-path="url(#raffleShieldClip)">
      <rect width="644" height="900" fill="url(#raffleVortexGrad)" />

      <!-- Geometric Ticket Guilloche & Sunburst Rays -->
      <g stroke="#f59e0b" stroke-opacity="0.22" fill="none" stroke-width="2">
        <line x1="322" y1="360" x2="0" y2="0" />
        <line x1="322" y1="360" x2="644" y2="0" />
        <line x1="322" y1="360" x2="644" y2="720" />
        <line x1="322" y1="360" x2="0" y2="720" />
        <line x1="322" y1="360" x2="322" y2="0" stroke-width="3" stroke-opacity="0.3" />
        <circle cx="322" cy="360" r="270" stroke-dasharray="14 10" />
        <circle cx="322" cy="360" r="220" stroke-width="3" />
        <circle cx="322" cy="360" r="160" stroke-dasharray="8 6" />
        <circle cx="322" cy="360" r="100" stroke-width="2" />
        <!-- Golden Ticket Diamond Crests -->
        <polygon points="322,170 475,360 322,550 169,360" stroke="#fde047" stroke-width="2.5" stroke-opacity="0.4" />
        <polygon points="322,220 435,360 322,500 209,360" stroke="#fbbf24" stroke-width="1.8" stroke-opacity="0.45" />
      </g>

      <!-- Core Amber Aura -->
      <circle cx="322" cy="350" r="135" fill="#f59e0b" fill-opacity="0.2" filter="blur(26px)" />

      <!-- Player Silhouette Graphic -->
      <g transform="translate(192, 185)">
        <path d="M 130 50 C 95 50, 75 75, 75 115 C 75 160, 95 190, 130 190 C 165 190, 185 160, 185 115 C 185 75, 165 50, 130 50 Z" 
              fill="#fef08a" fill-opacity="0.18" />
        <path d="M 50 280 C 50 220, 85 185, 130 185 C 175 185, 210 220, 210 280 L 260 360 L 0 360 Z" 
              fill="#fbbf24" fill-opacity="0.14" />
      </g>

      <!-- PlayStyle Diamond Badge (if present) -->
      ${
        playStyleBadge
          ? `
      <g transform="translate(56, 400)">
        <polygon points="26,0 52,26 26,52 0,26" fill="#1c1917" stroke="#fbbf24" stroke-width="3" />
        <text x="26" y="32" font-family="system-ui, sans-serif" font-size="20" fill="#fef08a" text-anchor="middle" font-weight="900">${playStyleBadge}</text>
      </g>
      `
          : ''
      }

      <!-- Top Left Rating & Position -->
      <g transform="translate(90, 150)">
        <text x="35" y="55" font-family="system-ui, -apple-system, sans-serif" font-size="76" font-weight="900" fill="#fef08a" text-anchor="middle" letter-spacing="-1" filter="drop-shadow(0 2px 8px rgba(0,0,0,0.8))">
          ${rating}
        </text>
        <text x="35" y="105" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="1">
          ${position}
        </text>
      </g>

      <!-- Top Raffle Crown Ribbon Badge -->
      <g transform="translate(322, 105)">
        <rect x="-115" y="-18" width="230" height="34" rx="17" fill="rgba(15, 23, 42, 0.85)" stroke="url(#raffleBorderGrad)" stroke-width="2" />
        <text x="0" y="4" font-family="system-ui, sans-serif" font-size="12" font-weight="900" fill="#fef08a" text-anchor="middle" letter-spacing="2.5">
          🎟️ RAFFLE · ${monthLabel.toUpperCase()}
        </text>
      </g>

      <!-- Player Name Banner -->
      <rect x="70" y="575" width="504" height="60" fill="url(#nameplateGrad)" stroke="#fef08a" stroke-width="1.5" stroke-opacity="0.4" rx="8" />
      <text x="322" y="618" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1" filter="drop-shadow(0 3px 10px rgba(0,0,0,0.9))">
        ${shortName.toUpperCase()}
      </text>

      <!-- Stats Grid (PAC, SHO, PAS, DRI, DEF, PHY) -->
      <g transform="translate(95, 660)" font-family="system-ui, -apple-system, sans-serif">
        <!-- Row 1: Attribute Labels -->
        <text x="25" y="0" font-size="20" font-weight="700" fill="#fef08a" fill-opacity="0.95" text-anchor="middle">PAC</text>
        <text x="108" y="0" font-size="20" font-weight="700" fill="#fef08a" fill-opacity="0.95" text-anchor="middle">SHO</text>
        <text x="190" y="0" font-size="20" font-weight="700" fill="#fef08a" fill-opacity="0.95" text-anchor="middle">PAS</text>
        <text x="272" y="0" font-size="20" font-weight="700" fill="#fef08a" fill-opacity="0.95" text-anchor="middle">DRI</text>
        <text x="355" y="0" font-size="20" font-weight="700" fill="#fef08a" fill-opacity="0.95" text-anchor="middle">DEF</text>
        <text x="435" y="0" font-size="20" font-weight="700" fill="#fef08a" fill-opacity="0.95" text-anchor="middle">PHY</text>

        <!-- Row 2: Values -->
        <text x="25" y="38" font-size="34" font-weight="900" fill="#ffffff" text-anchor="middle">${stats.pac}</text>
        <text x="108" y="38" font-size="34" font-weight="900" fill="#ffffff" text-anchor="middle">${stats.sho}</text>
        <text x="190" y="38" font-size="34" font-weight="900" fill="#ffffff" text-anchor="middle">${stats.pas}</text>
        <text x="272" y="38" font-size="34" font-weight="900" fill="#ffffff" text-anchor="middle">${stats.dri}</text>
        <text x="355" y="38" font-size="34" font-weight="900" fill="#ffffff" text-anchor="middle">${stats.def}</text>
        <text x="435" y="38" font-size="34" font-weight="900" fill="#ffffff" text-anchor="middle">${stats.phy}</text>
      </g>

      <!-- Bottom Badges: Country Flag · League/Program · Club Crest -->
      <g transform="translate(322, 790)">
        <!-- Nation Flag -->
        <text x="-90" y="10" font-size="32" text-anchor="middle">${nationFlag}</text>

        <!-- Golden Raffle Shield Insignia -->
        <g transform="translate(0, 0)">
          <circle cx="0" cy="0" r="20" fill="#1c1917" stroke="#fbbf24" stroke-width="2.5" />
          <text x="0" y="7" font-size="18" text-anchor="middle" fill="#fbbf24">🎟️</text>
        </g>

        <!-- Club / Code Text -->
        <text x="90" y="7" font-family="system-ui, sans-serif" font-size="22" font-weight="900" fill="#fef08a" text-anchor="middle" letter-spacing="1">
          ${clubCode}
        </text>
      </g>
    </g>
  </svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export interface MonthlyRaffleConfig {
  monthKey: string;
  monthIndex: number; // 1-12
  monthName: string;
  card: SoccerCard;
  headline: string;
  description: string;
}

/**
 * Complete 10-Month Raffle Calendar Roster
 * October: Buksa
 * November: Cahill
 * December: Coluna
 * January: Esposito
 * February: Griezmann
 * March: Joao Neves
 * April: Keown
 * May: Martinez
 * June: Paez
 * July: Richard
 */
export const MONTHLY_RAFFLE_PLAYERS: MonthlyRaffleConfig[] = [
  {
    monthKey: 'october',
    monthIndex: 10,
    monthName: 'October',
    headline: 'October Official 99 OVR Raffle Star: Adam Buksa 🇵🇱',
    description: 'Towering Polish striker sensation with clinical box presence, thunderous aerial leap, and unstoppable 99-rated breakaway finishing.',
    card: {
      id: 'raffle-buksa-october',
      name: 'Adam Buksa',
      shortName: 'Buksa',
      rating: 99,
      position: 'ST',
      nation: 'Poland',
      nationFlag: '🇵🇱',
      club: 'FC Midtjylland',
      league: 'Superliga',
      rarity: 'raffle',
      cardStyle: 'raffle_amber',
      program: 'Daily Raffle',
      stats: { pac: 99, sho: 99, pas: 95, dri: 99, def: 65, phy: 99 },
      weakFoot: 5,
      skillMoves: 5,
      workRate: 'H/M',
      price: 1500000,
      isCustom: true,
      playStylePlus: PLAYSTYLE_PRESETS.quick_step,
      momentTitle: 'October Daily Raffle 99 Grand Champion',
      momentDescription: 'Exclusive 99 OVR 1st place daily prize for October. Earned through daily raffle lottery draws.',
      fullCardImage: generateRaffleCardSvg('Buksa', 99, 'ST', { pac: 99, sho: 99, pas: 95, dri: 99, def: 65, phy: 99 }, '🇵🇱', 'FCM', 'October', '⚡'),
    },
  },
  {
    monthKey: 'november',
    monthIndex: 11,
    monthName: 'November',
    headline: 'November Official 99 OVR Raffle Star: Tim Cahill 🇦🇺',
    description: 'Everton and Australia legend iconic for soaring aerial headers, clutch volleys, and celebratory corner flag boxing.',
    card: {
      id: 'raffle-cahill-november',
      name: 'Tim Cahill',
      shortName: 'Cahill',
      rating: 99,
      position: 'CAM',
      nation: 'Australia',
      nationFlag: '🇦🇺',
      club: 'Premier League Legends',
      league: 'Premier League',
      rarity: 'raffle',
      cardStyle: 'raffle_amber',
      program: 'Daily Raffle',
      stats: { pac: 97, sho: 99, pas: 98, dri: 98, def: 88, phy: 99 },
      weakFoot: 5,
      skillMoves: 5,
      workRate: 'H/H',
      price: 1600000,
      isCustom: true,
      playStylePlus: PLAYSTYLE_PRESETS.bruiser,
      momentTitle: 'November Daily Raffle 99 Grand Champion',
      momentDescription: 'Exclusive 99 OVR 1st place daily prize for November. Uncompromising aerial powerhouse and match-winner.',
      fullCardImage: generateRaffleCardSvg('Cahill', 99, 'CAM', { pac: 97, sho: 99, pas: 98, dri: 98, def: 88, phy: 99 }, '🇦🇺', 'EVE', 'November', '💪'),
    },
  },
  {
    monthKey: 'december',
    monthIndex: 12,
    monthName: 'December',
    headline: 'December Official 99 OVR Raffle Star: Mário Coluna 🇵🇹',
    description: 'The legendary "O Monstro Sagrado" of Benfica & Portugal, a master midfielder with unmatched field vision and rocket strikes.',
    card: {
      id: 'raffle-coluna-december',
      name: 'Mário Coluna',
      shortName: 'Coluna',
      rating: 99,
      position: 'CM',
      nation: 'Portugal',
      nationFlag: '🇵🇹',
      club: 'Benfica Legends',
      league: 'Liga Portugal',
      rarity: 'raffle',
      cardStyle: 'raffle_amber',
      program: 'Daily Raffle',
      stats: { pac: 97, sho: 98, pas: 99, dri: 99, def: 94, phy: 97 },
      weakFoot: 5,
      skillMoves: 5,
      workRate: 'H/H',
      price: 1800000,
      isCustom: true,
      playStylePlus: PLAYSTYLE_PRESETS.relentless,
      momentTitle: 'December Daily Raffle 99 Grand Champion',
      momentDescription: 'Exclusive 99 OVR 1st place daily prize for December. Golden midfield tactician and European champion.',
      fullCardImage: generateRaffleCardSvg('Coluna', 99, 'CM', { pac: 97, sho: 98, pas: 99, dri: 99, def: 94, phy: 97 }, '🇵🇹', 'SLB', 'December', '🔋'),
    },
  },
  {
    monthKey: 'january',
    monthIndex: 1,
    monthName: 'January',
    headline: 'January Official 99 OVR Raffle Star: Francesco Pio Esposito 🇮🇹',
    description: 'Azzurri breakout marksman with deadly positioning, cold-blooded one-touch finishing, and relentless attacking movement.',
    card: {
      id: 'raffle-esposito-january',
      name: 'Francesco Pio Esposito',
      shortName: 'Esposito',
      rating: 99,
      position: 'ST',
      nation: 'Italy',
      nationFlag: '🇮🇹',
      club: 'Inter Milan',
      league: 'Serie A',
      rarity: 'raffle',
      cardStyle: 'raffle_amber',
      program: 'Daily Raffle',
      stats: { pac: 99, sho: 99, pas: 94, dri: 98, def: 62, phy: 99 },
      weakFoot: 5,
      skillMoves: 5,
      workRate: 'H/M',
      price: 1500000,
      isCustom: true,
      playStylePlus: PLAYSTYLE_PRESETS.finesse_shot,
      momentTitle: 'January Daily Raffle 99 Grand Champion',
      momentDescription: 'Exclusive 99 OVR 1st place daily prize for January. Rising Italian sensation with sniper finishing.',
      fullCardImage: generateRaffleCardSvg('Esposito', 99, 'ST', { pac: 99, sho: 99, pas: 94, dri: 98, def: 62, phy: 99 }, '🇮🇹', 'INT', 'January', '🎯'),
    },
  },
  {
    monthKey: 'february',
    monthIndex: 2,
    monthName: 'February',
    headline: 'February Official 99 OVR Raffle Star: Antoine Griezmann 🇫🇷',
    description: 'World champion maestro possessing hypnotic dribbling, pinpoint curling finishes, and tireless defensive work rate.',
    card: {
      id: 'raffle-griezmann-february',
      name: 'Antoine Griezmann',
      shortName: 'Griezmann',
      rating: 99,
      position: 'ST',
      nation: 'France',
      nationFlag: '🇫🇷',
      club: 'Atlético Madrid',
      league: 'La Liga',
      rarity: 'raffle',
      cardStyle: 'raffle_amber',
      program: 'Daily Raffle',
      stats: { pac: 99, sho: 99, pas: 99, dri: 99, def: 80, phy: 95 },
      weakFoot: 5,
      skillMoves: 5,
      workRate: 'H/H',
      price: 2000000,
      isCustom: true,
      playStylePlus: PLAYSTYLE_PRESETS.finesse_shot,
      momentTitle: 'February Daily Raffle 99 Grand Champion',
      momentDescription: 'Exclusive 99 OVR 1st place daily prize for February. World-class playmaker and prolific goalscorer.',
      fullCardImage: generateRaffleCardSvg('Griezmann', 99, 'ST', { pac: 99, sho: 99, pas: 99, dri: 99, def: 80, phy: 95 }, '🇫🇷', 'ATM', 'February', '🎯'),
    },
  },
  {
    monthKey: 'march',
    monthIndex: 3,
    monthName: 'March',
    headline: 'March Official 99 OVR Raffle Star: João Neves 🇵🇹',
    description: 'PSG midfield prodigy controlling the pitch with surgical passing, ferocious recovery tackles, and endless engine.',
    card: {
      id: 'raffle-joao-neves-march',
      name: 'João Neves',
      shortName: 'João Neves',
      rating: 99,
      position: 'CM',
      nation: 'Portugal',
      nationFlag: '🇵🇹',
      club: 'Paris Saint-Germain',
      league: 'Ligue 1',
      rarity: 'raffle',
      cardStyle: 'raffle_amber',
      program: 'Daily Raffle',
      stats: { pac: 98, sho: 95, pas: 99, dri: 99, def: 98, phy: 97 },
      weakFoot: 5,
      skillMoves: 5,
      workRate: 'H/H',
      price: 1850000,
      isCustom: true,
      playStylePlus: PLAYSTYLE_PRESETS.anticipate,
      momentTitle: 'March Daily Raffle 99 Grand Champion',
      momentDescription: 'Exclusive 99 OVR 1st place daily prize for March. Unstoppable midfield dynamo.',
      fullCardImage: generateRaffleCardSvg('J. Neves', 99, 'CM', { pac: 98, sho: 95, pas: 99, dri: 99, def: 98, phy: 97 }, '🇵🇹', 'PSG', 'March', '🛡️'),
    },
  },
  {
    monthKey: 'april',
    monthIndex: 4,
    monthName: 'April',
    headline: 'April Official 99 OVR Raffle Star: Martin Keown 🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    description: 'Legendary Arsenal Invincible defender whose ruthless physical presence and dominant aerial power shut down every attack.',
    card: {
      id: 'raffle-keown-april',
      name: 'Martin Keown',
      shortName: 'Keown',
      rating: 99,
      position: 'CB',
      nation: 'England',
      nationFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      club: 'Arsenal Legends',
      league: 'Premier League',
      rarity: 'raffle',
      cardStyle: 'raffle_amber',
      program: 'Daily Raffle',
      stats: { pac: 97, sho: 70, pas: 92, dri: 94, def: 99, phy: 99 },
      weakFoot: 4,
      skillMoves: 4,
      workRate: 'M/H',
      price: 1750000,
      isCustom: true,
      playStylePlus: PLAYSTYLE_PRESETS.bruiser,
      momentTitle: 'April Daily Raffle 99 Grand Champion',
      momentDescription: 'Exclusive 99 OVR 1st place daily prize for April. Iron wall of Highbury.',
      fullCardImage: generateRaffleCardSvg('Keown', 99, 'CB', { pac: 97, sho: 70, pas: 92, dri: 94, def: 99, phy: 99 }, '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'ARS', 'April', '💪'),
    },
  },
  {
    monthKey: 'may',
    monthIndex: 5,
    monthName: 'May',
    headline: 'May Official 99 OVR Raffle Star: Lautaro Martínez 🇦🇷',
    description: '"El Toro" — fierce Nerazzurri captain and Copa América golden boot hero with lethal killer instinct in front of goal.',
    card: {
      id: 'raffle-martinez-may',
      name: 'Lautaro Martínez',
      shortName: 'Martínez',
      rating: 99,
      position: 'ST',
      nation: 'Argentina',
      nationFlag: '🇦🇷',
      club: 'Inter Milan',
      league: 'Serie A',
      rarity: 'raffle',
      cardStyle: 'raffle_amber',
      program: 'Daily Raffle',
      stats: { pac: 99, sho: 99, pas: 95, dri: 99, def: 65, phy: 99 },
      weakFoot: 5,
      skillMoves: 5,
      workRate: 'H/H',
      price: 2100000,
      isCustom: true,
      playStylePlus: PLAYSTYLE_PRESETS.rapid,
      momentTitle: 'May Daily Raffle 99 Grand Champion',
      momentDescription: 'Exclusive 99 OVR 1st place daily prize for May. World-class Argentine predator.',
      fullCardImage: generateRaffleCardSvg('Martínez', 99, 'ST', { pac: 99, sho: 99, pas: 95, dri: 99, def: 65, phy: 99 }, '🇦🇷', 'INT', 'May', '💨'),
    },
  },
  {
    monthKey: 'june',
    monthIndex: 6,
    monthName: 'June',
    headline: 'June Official 99 OVR Raffle Star: Kendry Páez 🇪🇨',
    description: 'Ecuadorian teen prodigy dazzling with breathtaking acceleration, trickster dribbling runs, and laser assists.',
    card: {
      id: 'raffle-paez-june',
      name: 'Kendry Páez',
      shortName: 'Páez',
      rating: 99,
      position: 'CAM',
      nation: 'Ecuador',
      nationFlag: '🇪🇨',
      club: 'Chelsea / Independiente',
      league: 'Premier League',
      rarity: 'raffle',
      cardStyle: 'raffle_amber',
      program: 'Daily Raffle',
      stats: { pac: 99, sho: 97, pas: 99, dri: 99, def: 78, phy: 92 },
      weakFoot: 5,
      skillMoves: 5,
      workRate: 'H/M',
      price: 1650000,
      isCustom: true,
      playStylePlus: PLAYSTYLE_PRESETS.whipped_pass,
      momentTitle: 'June Daily Raffle 99 Grand Champion',
      momentDescription: 'Exclusive 99 OVR 1st place daily prize for June. Electric South American wonderkid.',
      fullCardImage: generateRaffleCardSvg('Páez', 99, 'CAM', { pac: 99, sho: 97, pas: 99, dri: 99, def: 78, phy: 92 }, '🇪🇨', 'CFC', 'June', '📐'),
    },
  },
  {
    monthKey: 'july',
    monthIndex: 7,
    monthName: 'July',
    headline: 'July Official 99 OVR Raffle Star: Richard Ríos 🇨🇴',
    description: 'Copa América tournament sensation dictating midfield duels with electrifying futsal footwork, press resistance, and grit.',
    card: {
      id: 'raffle-richard-july',
      name: 'Richard Ríos',
      shortName: 'Richard Ríos',
      rating: 99,
      position: 'CM',
      nation: 'Colombia',
      nationFlag: '🇨🇴',
      club: 'Palmeiras',
      league: 'Série A',
      rarity: 'raffle',
      cardStyle: 'raffle_amber',
      program: 'Daily Raffle',
      stats: { pac: 98, sho: 96, pas: 98, dri: 99, def: 96, phy: 99 },
      weakFoot: 5,
      skillMoves: 5,
      workRate: 'H/H',
      price: 1700000,
      isCustom: true,
      playStylePlus: PLAYSTYLE_PRESETS.quick_step,
      momentTitle: 'July Daily Raffle 99 Grand Champion',
      momentDescription: 'Exclusive 99 OVR 1st place daily prize for July. Flamboyant Colombian engine.',
      fullCardImage: generateRaffleCardSvg('Ríos', 99, 'CM', { pac: 98, sho: 96, pas: 98, dri: 99, def: 96, phy: 99 }, '🇨🇴', 'PAL', 'July', '⚡'),
    },
  },
];

/**
 * Returns the current calendar month key based strictly on real-world UTC date.
 * October (10) -> Buksa
 * November (11) -> Cahill
 * December (12) -> Coluna
 * January (1) -> Esposito
 * February (2) -> Griezmann
 * March (3) -> João Neves
 * April (4) -> Keown
 * May (5) -> Martínez
 * June (6) -> Páez
 * July (7) -> Richard
 * Default: 'october'
 */
export function getCurrentCalendarMonthKey(date = new Date()): string {
  const utcMonth = date.getUTCMonth() + 1; // 1-12
  const monthMap: Record<number, string> = {
    10: 'october',
    11: 'november',
    12: 'december',
    1: 'january',
    2: 'february',
    3: 'march',
    4: 'april',
    5: 'may',
    6: 'june',
    7: 'july',
  };
  return monthMap[utcMonth] || 'october';
}

/**
 * Returns the active monthly raffle player. Defaults to the current calendar month (October Buksa).
 */
export function getRafflePlayerForMonth(monthKeyOrIndex?: string | number): MonthlyRaffleConfig {
  const activeKey = typeof monthKeyOrIndex === 'string' && monthKeyOrIndex
    ? monthKeyOrIndex.toLowerCase()
    : getCurrentCalendarMonthKey();

  const found = MONTHLY_RAFFLE_PLAYERS.find(
    (p) => p.monthKey.toLowerCase() === activeKey || p.monthIndex === monthKeyOrIndex
  );
  if (found) return found;

  // Default to October Buksa
  return MONTHLY_RAFFLE_PLAYERS[0];
}

