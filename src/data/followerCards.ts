import { SoccerCard, CardSetDefinition, CardStats } from '../types/card';
import { PLAYSTYLE_PRESETS } from './cardSvgGenerator';

/**
 * Generates an SVG matching the exact visual style of the Follower Cards:
 * Crimson red futuristic vortex with electric turquoise & neon lime borders.
 */
export function generateFollowerCardSvg(
  shortName: string,
  rating: number,
  position: string,
  stats: CardStats,
  nationFlag: string,
  clubCode: string,
  playStyleBadge?: string,
  isGrandReward = false,
  cardType: 'modern' | 'hero' | 'icon' = 'modern'
): string {
  const isIcon = cardType === 'icon';
  const isHero = cardType === 'hero';
  const primaryGlow = isGrandReward ? '#fbbf24' : isIcon ? '#ffd700' : isHero ? '#fbbf24' : '#00f5d4';
  const accentGlow = isGrandReward ? '#f59e0b' : isIcon ? '#ffffff' : isHero ? '#f59e0b' : '#a3e635';
  const ribbonText = isGrandReward ? '99 MASTER' : isIcon ? 'ICON FOLLOWER' : isHero ? 'HERO FOLLOWER' : 'FOLLOWER';

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 644 900" width="100%" height="100%" style="border-radius: 28px; overflow: hidden; filter: drop-shadow(0 12px 25px rgba(0,0,0,0.6));">
    <defs>
      <!-- Neon Outer Border Gradient -->
      <linearGradient id="neonBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${primaryGlow}" />
        <stop offset="35%" stop-color="${isIcon ? '#fde047' : '#38bdf8'}" />
        <stop offset="70%" stop-color="${accentGlow}" />
        <stop offset="100%" stop-color="#ef4444" />
      </linearGradient>

      <!-- Deep Crimson Vortex Interior -->
      <radialGradient id="vortexGrad" cx="50%" cy="38%" r="65%">
        <stop offset="0%" stop-color="#991b1b" />
        <stop offset="35%" stop-color="#7f1d1d" />
        <stop offset="70%" stop-color="#450a0a" />
        <stop offset="100%" stop-color="#1a0204" />
      </radialGradient>

      <!-- Glow Filter -->
      <filter id="cardGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="8" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>

      <!-- Shield Clip Path -->
      <clipPath id="followerShieldClip">
        <path d="M 322 30 
                 C 490 30, 600 68, 600 185 
                 C 600 480, 560 710, 322 875 
                 C 84 710, 44 480, 44 185 
                 C 44 68, 154 30, 322 30 Z" />
      </clipPath>
    </defs>

    <!-- Outer Border -->
    <path d="M 322 24 
             C 496 24, 610 64, 610 185 
             C 610 490, 570 725, 322 890 
             C 74 725, 34 490, 34 185 
             C 34 64, 148 24, 322 24 Z" 
          fill="none" stroke="url(#neonBorderGrad)" stroke-width="12" filter="url(#cardGlow)" />

    <!-- Secondary Inner Accent Line -->
    <path d="M 322 34 
             C 488 34, 596 70, 596 185 
             C 596 480, 558 710, 322 874 
             C 86 710, 48 480, 48 185 
             C 48 70, 156 34, 322 34 Z" 
          fill="none" stroke="#ffffff" stroke-opacity="0.3" stroke-width="2" />

    <!-- Background Base -->
    <g clip-path="url(#followerShieldClip)">
      <rect width="644" height="900" fill="url(#vortexGrad)" />

      <!-- Concentric Vortex Energy Rings -->
      <g stroke="#ef4444" stroke-opacity="0.25" fill="none" stroke-width="4">
        <ellipse cx="322" cy="360" rx="260" ry="260" stroke-dasharray="12 8" />
        <ellipse cx="322" cy="360" rx="210" ry="210" stroke-width="3" />
        <ellipse cx="322" cy="360" rx="160" ry="160" stroke-dasharray="8 6" />
        <ellipse cx="322" cy="360" rx="110" ry="110" stroke-width="2" />
        <polygon points="322,180 470,360 322,540 174,360" stroke="#f43f5e" stroke-width="2.5" stroke-opacity="0.35" />
        <polygon points="322,230 420,360 322,490 224,360" stroke="#fb7185" stroke-width="2" stroke-opacity="0.4" />
      </g>

      <!-- Player Silhouette Graphic / Lighting Centerpiece -->
      <circle cx="322" cy="360" r="140" fill="#dc2626" fill-opacity="0.2" filter="blur(30px)" />

      <g transform="translate(192, 190)">
        <!-- Dynamic Player Bust Silhouette -->
        <path d="M 130 50 C 95 50, 75 75, 75 115 C 75 160, 95 190, 130 190 C 165 190, 185 160, 185 115 C 185 75, 165 50, 130 50 Z" 
              fill="#ffffff" fill-opacity="0.12" />
        <path d="M 50 280 C 50 220, 85 185, 130 185 C 175 185, 210 220, 210 280 L 260 360 L 0 360 Z" 
              fill="#ffffff" fill-opacity="0.1" />
      </g>

      <!-- PlayStyle Diamond Badge (if present) -->
      ${
        playStyleBadge
          ? `
      <g transform="translate(56, 410)">
        <polygon points="26,0 52,26 26,52 0,26" fill="#000000" stroke="#ffffff" stroke-width="3" />
        <text x="26" y="32" font-family="system-ui, sans-serif" font-size="20" fill="#ffffff" text-anchor="middle" font-weight="900">${playStyleBadge}</text>
      </g>
      `
          : ''
      }

      <!-- Top Left Rating & Position -->
      <g transform="translate(90, 150)">
        <text x="35" y="55" font-family="system-ui, -apple-system, sans-serif" font-size="76" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="-1">
          ${rating}
        </text>
        <text x="35" y="105" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="1">
          ${position}
        </text>
      </g>

      <!-- Instagram Follower Tag / Badge -->
      <g transform="translate(322, 110)">
        <rect x="-95" y="-18" width="190" height="32" rx="16" fill="rgba(0,0,0,0.6)" stroke="${primaryGlow}" stroke-width="1.5" />
        <text x="0" y="4" font-family="system-ui, sans-serif" font-size="12" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="2">
          ${ribbonText}
        </text>
      </g>

      <!-- Player Name Banner -->
      <rect x="70" y="575" width="504" height="60" fill="url(#nameplateGrad)" fill-opacity="0.75" rx="8" />
      <text x="322" y="618" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="0.5" filter="drop-shadow(0 2px 8px rgba(0,0,0,0.8))">
        ${shortName}
      </text>

      <!-- Stats Grid (PAC, SHO, PAS, DRI, DEF, PHY) -->
      <g transform="translate(95, 660)" font-family="system-ui, -apple-system, sans-serif">
        <!-- Row 1: Attribute Labels -->
        <text x="25" y="0" font-size="20" font-weight="700" fill="#ffffff" fill-opacity="0.9" text-anchor="middle">PAC</text>
        <text x="108" y="0" font-size="20" font-weight="700" fill="#ffffff" fill-opacity="0.9" text-anchor="middle">SHO</text>
        <text x="190" y="0" font-size="20" font-weight="700" fill="#ffffff" fill-opacity="0.9" text-anchor="middle">PAS</text>
        <text x="272" y="0" font-size="20" font-weight="700" fill="#ffffff" fill-opacity="0.9" text-anchor="middle">DRI</text>
        <text x="355" y="0" font-size="20" font-weight="700" fill="#ffffff" fill-opacity="0.9" text-anchor="middle">DEF</text>
        <text x="435" y="0" font-size="20" font-weight="700" fill="#ffffff" fill-opacity="0.9" text-anchor="middle">PHY</text>

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

        <!-- Division Pill -->
        <rect x="-60" y="-12" width="120" height="26" rx="6" fill="#000000" fill-opacity="0.7" stroke="#ffffff" stroke-width="1.5" />
        <text x="0" y="5" font-family="system-ui, sans-serif" font-size="10" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1">
          ${ribbonText}
        </text>

        <!-- Club Emblem -->
        <circle cx="90" cy="0" r="18" fill="#1e293b" stroke="#ffffff" stroke-width="2" />
        <text x="90" y="6" font-family="system-ui, sans-serif" font-size="12" font-weight="900" fill="#ffffff" text-anchor="middle">
          ${clubCode}
        </text>
      </g>
    </g>
  </svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// =========================================================================
// 8 FOLLOWER CHALLENGE CARDS (TIMED MINI GAME RELEASES)
// =========================================================================

export const FOLLOWER_CHALLENGE_CARDS: SoccerCard[] = [
  {
    id: 'follower-barnes',
    name: 'Harvey Barnes',
    shortName: 'Barnes',
    rating: 89,
    position: 'CAM',
    nation: 'England',
    nationFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    club: 'Leicester City',
    league: 'Championship',
    rarity: 'follower_edition',
    cardStyle: 'follower_edition',
    program: 'Follower Challenge',
    stats: { pac: 91, sho: 90, pas: 84, dri: 90, def: 52, phy: 75 },
    weakFoot: 4,
    skillMoves: 4,
    workRate: 'H/M',
    price: 65000,
    isCustom: true,
    instagramHandle: 'harveybarnes97',
    instagramUrl: 'https://www.instagram.com/harveybarnes97',
    playStylePlus: PLAYSTYLE_PRESETS.quick_step,
    fullCardImage: generateFollowerCardSvg('Barnes', 89, 'CAM', { pac: 91, sho: 90, pas: 84, dri: 90, def: 52, phy: 75 }, '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'LEI', '⚡'),
  },
  {
    id: 'follower-grimaldo',
    name: 'Alejandro Grimaldo',
    shortName: 'Grimaldo',
    rating: 87,
    position: 'LM',
    nation: 'Spain',
    nationFlag: '🇪🇸',
    club: 'Bayer Leverkusen',
    league: 'Bundesliga',
    rarity: 'follower_edition',
    cardStyle: 'follower_edition',
    program: 'Follower Challenge',
    stats: { pac: 75, sho: 79, pas: 89, dri: 87, def: 74, phy: 67 },
    weakFoot: 4,
    skillMoves: 4,
    workRate: 'H/H',
    price: 55000,
    isCustom: true,
    instagramHandle: 'grimaldo35',
    instagramUrl: 'https://www.instagram.com/grimaldo35',
    playStylePlus: PLAYSTYLE_PRESETS.whipped_pass,
    fullCardImage: generateFollowerCardSvg('Grimaldo', 87, 'LM', { pac: 75, sho: 79, pas: 89, dri: 87, def: 74, phy: 67 }, '🇪🇸', 'B04', '📐'),
  },
  {
    id: 'follower-guirassy',
    name: 'Serhou Guirassy',
    shortName: 'Guirassy',
    rating: 90,
    position: 'ST',
    nation: 'Guinea',
    nationFlag: '🇬🇳',
    club: 'Borussia Dortmund',
    league: 'Bundesliga',
    rarity: 'follower_edition',
    cardStyle: 'follower_edition',
    program: 'Follower Challenge',
    stats: { pac: 71, sho: 89, pas: 71, dri: 85, def: 45, phy: 83 },
    weakFoot: 4,
    skillMoves: 4,
    workRate: 'H/M',
    price: 75000,
    isCustom: true,
    instagramHandle: 'guirassy_19',
    instagramUrl: 'https://www.instagram.com/guirassy_19',
    playStylePlus: PLAYSTYLE_PRESETS.finesse_shot,
    fullCardImage: generateFollowerCardSvg('Guirassy', 90, 'ST', { pac: 71, sho: 89, pas: 71, dri: 85, def: 45, phy: 83 }, '🇬🇳', 'BVB', '🎯'),
  },
  {
    id: 'follower-kirian',
    name: 'Kirian Rodríguez',
    shortName: 'Kirian',
    rating: 88,
    position: 'CDM',
    nation: 'Spain',
    nationFlag: '🇪🇸',
    club: 'UD Las Palmas',
    league: 'LaLiga',
    rarity: 'follower_edition',
    cardStyle: 'follower_edition',
    program: 'Follower Challenge',
    stats: { pac: 67, sho: 89, pas: 88, dri: 88, def: 84, phy: 87 },
    weakFoot: 4,
    skillMoves: 3,
    workRate: 'M/H',
    price: 60000,
    isCustom: true,
    instagramHandle: 'kirian10rguez',
    instagramUrl: 'https://www.instagram.com/kirian10rguez',
    playStylePlus: PLAYSTYLE_PRESETS.anticipate,
    fullCardImage: generateFollowerCardSvg('Kirian', 88, 'CDM', { pac: 67, sho: 89, pas: 88, dri: 88, def: 84, phy: 87 }, '🇪🇸', 'LPA', '🛡️'),
  },
  {
    id: 'follower-murphy',
    name: 'Josh Murphy',
    shortName: 'Murphy',
    rating: 88,
    position: 'LM',
    nation: 'England',
    nationFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    club: 'Portsmouth',
    league: 'Championship',
    rarity: 'follower_edition',
    cardStyle: 'follower_edition',
    program: 'Follower Challenge',
    stats: { pac: 99, sho: 84, pas: 83, dri: 88, def: 53, phy: 76 },
    weakFoot: 4,
    skillMoves: 4,
    workRate: 'H/L',
    price: 62000,
    isCustom: true,
    instagramHandle: 'joshmurphy_',
    instagramUrl: 'https://www.instagram.com/joshmurphy_',
    playStylePlus: PLAYSTYLE_PRESETS.rapid,
    fullCardImage: generateFollowerCardSvg('Murphy', 88, 'LM', { pac: 99, sho: 84, pas: 83, dri: 88, def: 53, phy: 76 }, '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'POR', '💨'),
  },
  {
    id: 'follower-puertas',
    name: 'Cameron Puertas',
    shortName: 'Puertas',
    rating: 89,
    position: 'CAM',
    nation: 'Spain',
    nationFlag: '🇪🇸',
    club: 'Union SG',
    league: 'Pro League',
    rarity: 'follower_edition',
    cardStyle: 'follower_edition',
    program: 'Follower Challenge',
    stats: { pac: 84, sho: 88, pas: 90, dri: 91, def: 82, phy: 90 },
    weakFoot: 5,
    skillMoves: 4,
    workRate: 'H/H',
    price: 68000,
    isCustom: true,
    instagramHandle: 'cameronpuertas',
    instagramUrl: 'https://www.instagram.com/cameronpuertas',
    playStylePlus: PLAYSTYLE_PRESETS.dead_ball,
    fullCardImage: generateFollowerCardSvg('Puertas', 89, 'CAM', { pac: 84, sho: 88, pas: 90, dri: 91, def: 82, phy: 90 }, '🇪🇸', 'USG', '☄️'),
  },
  {
    id: 'follower-tarkowski',
    name: 'James Tarkowski',
    shortName: 'Tarkowski',
    rating: 86,
    position: 'CB',
    nation: 'England',
    nationFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    club: 'Everton',
    league: 'Premier League',
    rarity: 'follower_edition',
    cardStyle: 'follower_edition',
    program: 'Follower Challenge',
    stats: { pac: 47, sho: 53, pas: 70, dri: 65, def: 87, phy: 90 },
    weakFoot: 3,
    skillMoves: 2,
    workRate: 'M/H',
    price: 50000,
    isCustom: true,
    instagramHandle: 'jamestarkowski_',
    instagramUrl: 'https://www.instagram.com/jamestarkowski_',
    playStylePlus: PLAYSTYLE_PRESETS.bruiser,
    fullCardImage: generateFollowerCardSvg('Tarkowski', 86, 'CB', { pac: 47, sho: 53, pas: 70, dri: 65, def: 87, phy: 90 }, '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'EVE', '💪'),
  },
  {
    id: 'follower-zaniolo',
    name: 'Nicolò Zaniolo',
    shortName: 'Zaniolo',
    rating: 88,
    position: 'ST',
    nation: 'Italy',
    nationFlag: '🇮🇹',
    club: 'Galatasaray',
    league: 'Trendyol Süper Lig',
    rarity: 'follower_edition',
    cardStyle: 'follower_edition',
    program: 'Follower Challenge',
    stats: { pac: 86, sho: 89, pas: 85, dri: 87, def: 59, phy: 87 },
    weakFoot: 4,
    skillMoves: 4,
    workRate: 'H/M',
    price: 64000,
    isCustom: true,
    instagramHandle: 'nicolozaniolo',
    instagramUrl: 'https://www.instagram.com/nicolozaniolo',
    playStylePlus: PLAYSTYLE_PRESETS.finesse_shot,
    fullCardImage: generateFollowerCardSvg('Zaniolo', 88, 'ST', { pac: 86, sho: 89, pas: 85, dri: 87, def: 59, phy: 87 }, '🇮🇹', 'GAL', '☄️'),
  },
];

// =========================================================================
// THE GRAND 99 SET REWARD: MICHAEL OLISE 99 RM (EXCLUSIVE TO SET REWARD!)
// =========================================================================

export const OLISE_99_SET_REWARD: SoccerCard = {
  id: 'follower-olise-99',
  name: 'Michael Olise',
  shortName: 'Olise',
  rating: 99,
  position: 'RM',
  nation: 'France',
  nationFlag: '🇫🇷',
  club: 'FC Bayern Munich',
  league: 'Bundesliga',
  rarity: 'follower_edition',
  cardStyle: 'follower_edition',
  program: 'Follower Challenge',
  isSetRewardOnly: true, // EXCLUSIVE TO SET REWARDS! CANNOT BE PACKED!
  stats: { pac: 92, sho: 92, pas: 98, dri: 99, def: 56, phy: 79 },
  playStylePlus: PLAYSTYLE_PRESETS.quick_step,
  weakFoot: 5,
  skillMoves: 5,
  workRate: 'H/M',
  price: 2500000,
  isCustom: true,
  instagramHandle: 'michaell.olise',
  instagramUrl: 'https://www.instagram.com/michaell.olise',
  fullCardImage: generateFollowerCardSvg('Olise', 99, 'RM', { pac: 92, sho: 92, pas: 98, dri: 99, def: 56, phy: 79 }, '🇫🇷', 'BAY', '🪄', true),
};

// =========================================================================
// 8 FOLLOWER HERO CARDS (LEGENDARY HERO EXPANSION)
// =========================================================================

export const FOLLOWER_HERO_CARDS: SoccerCard[] = [
  {
    id: 'hero-follower-anelka',
    name: 'Nicolas Anelka',
    shortName: 'Anelka',
    rating: 93,
    position: 'ST',
    nation: 'France',
    nationFlag: '🇫🇷',
    club: 'Chelsea',
    league: 'Premier League',
    rarity: 'follower_edition',
    cardStyle: 'follower_edition',
    program: 'Follower Heroes',
    stats: { pac: 87, sho: 97, pas: 77, dri: 87, def: 48, phy: 80 },
    weakFoot: 4,
    skillMoves: 4,
    workRate: 'H/M',
    price: 150000,
    isCustom: true,
    instagramHandle: 'nicolasanelka_official',
    instagramUrl: 'https://www.instagram.com/nicolasanelka_official',
    playStylePlus: PLAYSTYLE_PRESETS.quick_step,
    fullCardImage: generateFollowerCardSvg('Anelka', 93, 'ST', { pac: 87, sho: 97, pas: 77, dri: 87, def: 48, phy: 80 }, '🇫🇷', 'CHE', '⚡'),
  },
  {
    id: 'hero-follower-ayala',
    name: 'Roberto Ayala',
    shortName: 'Ayala',
    rating: 94,
    position: 'CB',
    nation: 'Argentina',
    nationFlag: '🇦🇷',
    club: 'Valencia CF',
    league: 'LaLiga',
    rarity: 'follower_edition',
    cardStyle: 'follower_edition',
    program: 'Follower Heroes',
    stats: { pac: 83, sho: 61, pas: 82, dri: 81, def: 95, phy: 92 },
    weakFoot: 3,
    skillMoves: 2,
    workRate: 'M/H',
    price: 180000,
    isCustom: true,
    instagramHandle: 'robertoayala_ok',
    instagramUrl: 'https://www.instagram.com/robertoayala_ok',
    playStylePlus: PLAYSTYLE_PRESETS.anticipate,
    fullCardImage: generateFollowerCardSvg('Ayala', 94, 'CB', { pac: 83, sho: 61, pas: 82, dri: 81, def: 95, phy: 92 }, '🇦🇷', 'VCF', '🛡️'),
  },
  {
    id: 'hero-follower-barthez',
    name: 'Fabien Barthez',
    shortName: 'Barthez',
    rating: 90,
    position: 'GK',
    nation: 'France',
    nationFlag: '🇫🇷',
    club: 'Olympique Marseille',
    league: 'Ligue 1',
    rarity: 'follower_edition',
    cardStyle: 'follower_edition',
    program: 'Follower Heroes',
    stats: { pac: 86, sho: 89, pas: 84, dri: 92, def: 67, phy: 87 },
    weakFoot: 3,
    skillMoves: 1,
    workRate: 'M/M',
    price: 95000,
    isCustom: true,
    instagramHandle: 'fabienbarthezofficial',
    instagramUrl: 'https://www.instagram.com/fabienbarthezofficial',
    playStylePlus: PLAYSTYLE_PRESETS.cat_reflexes,
    fullCardImage: generateFollowerCardSvg('Barthez', 90, 'GK', { pac: 86, sho: 89, pas: 84, dri: 92, def: 67, phy: 87 }, '🇫🇷', 'OM', '🧤'),
  },
  {
    id: 'hero-follower-ceni',
    name: 'Rogério Ceni',
    shortName: 'Ceni',
    rating: 89,
    position: 'GK',
    nation: 'Brazil',
    nationFlag: '🇧🇷',
    club: 'São Paulo FC',
    league: 'CONMEBOL Libertadores',
    rarity: 'follower_edition',
    cardStyle: 'follower_edition',
    program: 'Follower Heroes',
    stats: { pac: 87, sho: 89, pas: 84, dri: 88, def: 52, phy: 88 },
    weakFoot: 4,
    skillMoves: 2,
    workRate: 'M/M',
    price: 90000,
    isCustom: true,
    instagramHandle: 'rogerioceni',
    instagramUrl: 'https://www.instagram.com/rogerioceni',
    playStylePlus: PLAYSTYLE_PRESETS.dead_ball,
    fullCardImage: generateFollowerCardSvg('Ceni', 89, 'GK', { pac: 87, sho: 89, pas: 84, dri: 88, def: 52, phy: 88 }, '🇧🇷', 'SPFC', '☄️'),
  },
  {
    id: 'hero-follower-deboer',
    name: 'Frank de Boer',
    shortName: 'De Boer',
    rating: 90,
    position: 'CB',
    nation: 'Netherlands',
    nationFlag: '🇳🇱',
    club: 'Ajax',
    league: 'Eredivisie',
    rarity: 'follower_edition',
    cardStyle: 'follower_edition',
    program: 'Follower Heroes',
    stats: { pac: 86, sho: 55, pas: 65, dri: 71, def: 92, phy: 91 },
    weakFoot: 4,
    skillMoves: 3,
    workRate: 'M/H',
    price: 110000,
    isCustom: true,
    instagramHandle: 'frankdeboerofficial',
    instagramUrl: 'https://www.instagram.com/frankdeboerofficial',
    playStylePlus: PLAYSTYLE_PRESETS.bruiser,
    fullCardImage: generateFollowerCardSvg('De Boer', 90, 'CB', { pac: 86, sho: 55, pas: 65, dri: 71, def: 92, phy: 91 }, '🇳🇱', 'AJA', '💪'),
  },
  {
    id: 'hero-follower-juninho',
    name: 'Juninho Pernambucano',
    shortName: 'Juninho',
    rating: 94,
    position: 'CM',
    nation: 'Brazil',
    nationFlag: '🇧🇷',
    club: 'Olympique Lyonnais',
    league: 'Ligue 1',
    rarity: 'follower_edition',
    cardStyle: 'follower_edition',
    program: 'Follower Heroes',
    stats: { pac: 84, sho: 79, pas: 85, dri: 88, def: 94, phy: 94 },
    weakFoot: 5,
    skillMoves: 4,
    workRate: 'H/H',
    price: 220000,
    isCustom: true,
    instagramHandle: 'juninhopeoficial',
    instagramUrl: 'https://www.instagram.com/juninhopeoficial',
    playStylePlus: PLAYSTYLE_PRESETS.dead_ball,
    fullCardImage: generateFollowerCardSvg('Juninho', 94, 'CM', { pac: 84, sho: 79, pas: 85, dri: 88, def: 94, phy: 94 }, '🇧🇷', 'OL', '☄️'),
  },
  {
    id: 'hero-follower-valderrama',
    name: 'Carlos Valderrama',
    shortName: 'Valderrama',
    rating: 90,
    position: 'CAM',
    nation: 'Colombia',
    nationFlag: '🇨🇴',
    club: 'Junior FC',
    league: 'Liga Colombia',
    rarity: 'follower_edition',
    cardStyle: 'follower_edition',
    program: 'Follower Heroes',
    stats: { pac: 92, sho: 88, pas: 88, dri: 94, def: 47, phy: 74 },
    weakFoot: 4,
    skillMoves: 5,
    workRate: 'M/L',
    price: 120000,
    isCustom: true,
    instagramHandle: 'elpievalderrama',
    instagramUrl: 'https://www.instagram.com/elpievalderrama',
    playStylePlus: PLAYSTYLE_PRESETS.trickster,
    fullCardImage: generateFollowerCardSvg('Valderrama', 90, 'CAM', { pac: 92, sho: 88, pas: 88, dri: 94, def: 47, phy: 74 }, '🇨🇴', 'JUN', '🪄'),
  },
  {
    id: 'hero-follower-villa',
    name: 'David Villa',
    shortName: 'Villa',
    rating: 91,
    position: 'ST',
    nation: 'Spain',
    nationFlag: '🇪🇸',
    club: 'Valencia CF',
    league: 'LaLiga',
    rarity: 'follower_edition',
    cardStyle: 'follower_edition',
    program: 'Follower Heroes',
    stats: { pac: 88, sho: 92, pas: 81, dri: 87, def: 49, phy: 89 },
    weakFoot: 5,
    skillMoves: 4,
    workRate: 'H/M',
    price: 135000,
    isCustom: true,
    instagramHandle: 'davidvilla',
    instagramUrl: 'https://www.instagram.com/davidvilla',
    playStylePlus: PLAYSTYLE_PRESETS.finesse_shot,
    fullCardImage: generateFollowerCardSvg('Villa', 91, 'ST', { pac: 88, sho: 92, pas: 81, dri: 87, def: 49, phy: 89 }, '🇪🇸', 'VCF', '🎯'),
  },
];

// =========================================================================
// THE GRAND 99 HERO SET REWARD: MICHAEL CARRICK 99 CDM (EXCLUSIVE TO SET REWARD!)
// =========================================================================

export const CARRICK_99_SET_REWARD: SoccerCard = {
  id: 'hero-follower-carrick-99',
  name: 'Michael Carrick',
  shortName: 'Carrick',
  rating: 99,
  position: 'CDM',
  nation: 'England',
  nationFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  club: 'Manchester United',
  league: 'Premier League',
  rarity: 'follower_edition',
  cardStyle: 'follower_edition',
  program: 'Follower Heroes',
  isSetRewardOnly: true, // EXCLUSIVE TO SET REWARDS! CANNOT BE PACKED!
  stats: { pac: 93, sho: 99, pas: 99, dri: 98, def: 85, phy: 88 },
  playStylePlus: PLAYSTYLE_PRESETS.incisive_pass,
  weakFoot: 5,
  skillMoves: 4,
  workRate: 'M/H',
  price: 2500000,
  isCustom: true,
  instagramHandle: 'carrick_michael',
  instagramUrl: 'https://www.instagram.com/carrick_michael',
  fullCardImage: generateFollowerCardSvg('Carrick', 99, 'CDM', { pac: 93, sho: 99, pas: 99, dri: 98, def: 85, phy: 88 }, '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'MUN', '🎯', true),
};

// =========================================================================
// 8 FOLLOWER ICON CARDS (LEGENDARY ICON EXPANSION)
// =========================================================================

export const FOLLOWER_ICON_CARDS: SoccerCard[] = [
  {
    id: 'icon-follower-zidane',
    name: 'Zinedine Zidane',
    shortName: 'Zidane',
    rating: 96,
    position: 'CAM',
    nation: 'France',
    nationFlag: '🇫🇷',
    club: 'Real Madrid',
    league: 'LaLiga',
    rarity: 'follower_edition',
    cardStyle: 'follower_edition',
    program: 'Follower Icons',
    stats: { pac: 87, sho: 94, pas: 98, dri: 97, def: 76, phy: 88 },
    weakFoot: 5,
    skillMoves: 5,
    workRate: 'M/M',
    price: 320000,
    isCustom: true,
    instagramHandle: 'zidane',
    instagramUrl: 'https://www.instagram.com/zidane',
    playStylePlus: PLAYSTYLE_PRESETS.incisive_pass,
    fullCardImage: generateFollowerCardSvg('Zidane', 96, 'CAM', { pac: 87, sho: 94, pas: 98, dri: 97, def: 76, phy: 88 }, '🇫🇷', 'RMA', '🎯', false, 'icon'),
  },
  {
    id: 'icon-follower-ronaldinho',
    name: 'Ronaldinho Gaúcho',
    shortName: 'Ronaldinho',
    rating: 95,
    position: 'LW',
    nation: 'Brazil',
    nationFlag: '🇧🇷',
    club: 'FC Barcelona',
    league: 'LaLiga',
    rarity: 'follower_edition',
    cardStyle: 'follower_edition',
    program: 'Follower Icons',
    stats: { pac: 93, sho: 92, pas: 93, dri: 97, def: 42, phy: 83 },
    weakFoot: 4,
    skillMoves: 5,
    workRate: 'H/L',
    price: 300000,
    isCustom: true,
    instagramHandle: 'ronaldinho',
    instagramUrl: 'https://www.instagram.com/ronaldinho',
    playStylePlus: PLAYSTYLE_PRESETS.trickster,
    fullCardImage: generateFollowerCardSvg('Ronaldinho', 95, 'LW', { pac: 93, sho: 92, pas: 93, dri: 97, def: 42, phy: 83 }, '🇧🇷', 'FCB', '🪄', false, 'icon'),
  },
  {
    id: 'icon-follower-ronaldo',
    name: 'Ronaldo Nazário',
    shortName: 'Ronaldo',
    rating: 96,
    position: 'ST',
    nation: 'Brazil',
    nationFlag: '🇧🇷',
    club: 'Real Madrid',
    league: 'LaLiga',
    rarity: 'follower_edition',
    cardStyle: 'follower_edition',
    program: 'Follower Icons',
    stats: { pac: 97, sho: 96, pas: 82, dri: 96, def: 46, phy: 82 },
    weakFoot: 5,
    skillMoves: 5,
    workRate: 'M/M',
    price: 380000,
    isCustom: true,
    instagramHandle: 'ronaldo',
    instagramUrl: 'https://www.instagram.com/ronaldo',
    playStylePlus: PLAYSTYLE_PRESETS.quick_step,
    fullCardImage: generateFollowerCardSvg('Ronaldo', 96, 'ST', { pac: 97, sho: 96, pas: 82, dri: 96, def: 46, phy: 82 }, '🇧🇷', 'RMA', '⚡', false, 'icon'),
  },
  {
    id: 'icon-follower-henry',
    name: 'Thierry Henry',
    shortName: 'Henry',
    rating: 93,
    position: 'ST',
    nation: 'France',
    nationFlag: '🇫🇷',
    club: 'Arsenal',
    league: 'Premier League',
    rarity: 'follower_edition',
    cardStyle: 'follower_edition',
    program: 'Follower Icons',
    stats: { pac: 94, sho: 92, pas: 85, dri: 92, def: 54, phy: 82 },
    weakFoot: 4,
    skillMoves: 4,
    workRate: 'H/M',
    price: 220000,
    isCustom: true,
    instagramHandle: 'thierryhenry',
    instagramUrl: 'https://www.instagram.com/thierryhenry',
    playStylePlus: PLAYSTYLE_PRESETS.finesse_shot,
    fullCardImage: generateFollowerCardSvg('Henry', 93, 'ST', { pac: 94, sho: 92, pas: 85, dri: 92, def: 54, phy: 82 }, '🇫🇷', 'ARS', '🎯', false, 'icon'),
  },
  {
    id: 'icon-follower-kaka',
    name: 'Kaká',
    shortName: 'Kaká',
    rating: 91,
    position: 'CAM',
    nation: 'Brazil',
    nationFlag: '🇧🇷',
    club: 'AC Milan',
    league: 'Serie A',
    rarity: 'follower_edition',
    cardStyle: 'follower_edition',
    program: 'Follower Icons',
    stats: { pac: 92, sho: 88, pas: 90, dri: 93, def: 45, phy: 75 },
    weakFoot: 4,
    skillMoves: 5,
    workRate: 'H/M',
    price: 180000,
    isCustom: true,
    instagramHandle: 'kaka',
    instagramUrl: 'https://www.instagram.com/kaka',
    playStylePlus: PLAYSTYLE_PRESETS.rapid,
    fullCardImage: generateFollowerCardSvg('Kaká', 91, 'CAM', { pac: 92, sho: 88, pas: 90, dri: 93, def: 45, phy: 75 }, '🇧🇷', 'ACM', '💨', false, 'icon'),
  },
  {
    id: 'icon-follower-rooney',
    name: 'Wayne Rooney',
    shortName: 'Rooney',
    rating: 91,
    position: 'ST',
    nation: 'England',
    nationFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    club: 'Manchester United',
    league: 'Premier League',
    rarity: 'follower_edition',
    cardStyle: 'follower_edition',
    program: 'Follower Icons',
    stats: { pac: 89, sho: 93, pas: 84, dri: 88, def: 58, phy: 91 },
    weakFoot: 4,
    skillMoves: 3,
    workRate: 'H/H',
    price: 175000,
    isCustom: true,
    instagramHandle: 'waynerooney',
    instagramUrl: 'https://www.instagram.com/waynerooney',
    playStylePlus: PLAYSTYLE_PRESETS.power_shot,
    fullCardImage: generateFollowerCardSvg('Rooney', 91, 'ST', { pac: 89, sho: 93, pas: 84, dri: 88, def: 58, phy: 91 }, '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'MUN', '🚀', false, 'icon'),
  },
  {
    id: 'icon-follower-gerrard',
    name: 'Steven Gerrard',
    shortName: 'Gerrard',
    rating: 91,
    position: 'CM',
    nation: 'England',
    nationFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    club: 'Liverpool',
    league: 'Premier League',
    rarity: 'follower_edition',
    cardStyle: 'follower_edition',
    program: 'Follower Icons',
    stats: { pac: 84, sho: 91, pas: 92, dri: 86, def: 81, phy: 89 },
    weakFoot: 4,
    skillMoves: 3,
    workRate: 'H/H',
    price: 165000,
    isCustom: true,
    instagramHandle: 'stevengerrard',
    instagramUrl: 'https://www.instagram.com/stevengerrard',
    playStylePlus: PLAYSTYLE_PRESETS.long_ball_pass,
    fullCardImage: generateFollowerCardSvg('Gerrard', 91, 'CM', { pac: 84, sho: 91, pas: 92, dri: 86, def: 81, phy: 89 }, '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'LIV', '☄️', false, 'icon'),
  },
  {
    id: 'icon-follower-casillas',
    name: 'Iker Casillas',
    shortName: 'Casillas',
    rating: 92,
    position: 'GK',
    nation: 'Spain',
    nationFlag: '🇪🇸',
    club: 'Real Madrid',
    league: 'LaLiga',
    rarity: 'follower_edition',
    cardStyle: 'follower_edition',
    program: 'Follower Icons',
    stats: { pac: 93, sho: 92, pas: 90, dri: 95, def: 58, phy: 91 },
    weakFoot: 3,
    skillMoves: 1,
    workRate: 'M/M',
    price: 190000,
    isCustom: true,
    instagramHandle: 'ikercasillas',
    instagramUrl: 'https://www.instagram.com/ikercasillas',
    playStylePlus: PLAYSTYLE_PRESETS.cat_reflexes,
    fullCardImage: generateFollowerCardSvg('Casillas', 92, 'GK', { pac: 93, sho: 92, pas: 90, dri: 95, def: 58, phy: 91 }, '🇪🇸', 'RMA', '🧤', false, 'icon'),
  },
];

// =========================================================================
// THE GRAND 99 ICON SET REWARD: GARETH BALE 99 RW (EXCLUSIVE TO SET REWARD!)
// =========================================================================

export const BALE_99_SET_REWARD: SoccerCard = {
  id: 'icon-follower-bale-99',
  name: 'Gareth Bale',
  shortName: 'Bale',
  rating: 99,
  position: 'RW',
  nation: 'Wales',
  nationFlag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
  club: 'Real Madrid',
  league: 'LaLiga',
  rarity: 'follower_edition',
  cardStyle: 'follower_edition',
  program: 'Follower Icons',
  isSetRewardOnly: true, // EXCLUSIVE TO SET REWARDS! CANNOT BE PACKED!
  stats: { pac: 99, sho: 98, pas: 97, dri: 98, def: 78, phy: 92 },
  playStylePlus: PLAYSTYLE_PRESETS.quick_step,
  weakFoot: 5,
  skillMoves: 5,
  workRate: 'H/M',
  price: 3000000,
  isCustom: true,
  instagramHandle: 'garethbale11',
  instagramUrl: 'https://www.instagram.com/garethbale11',
  fullCardImage: generateFollowerCardSvg('Bale', 99, 'RW', { pac: 99, sho: 98, pas: 97, dri: 98, def: 78, phy: 92 }, '🏴󠁧󠁢󠁷󠁬󠁳󠁿', 'RMA', '🚀', true, 'icon'),
};

// All Follower Cards combined for pool (8 Modern + 99 Olise + 8 Heroes + 99 Carrick + 8 Icons + 99 Bale)
export const ALL_FOLLOWER_CARDS: SoccerCard[] = [
  ...FOLLOWER_CHALLENGE_CARDS,
  OLISE_99_SET_REWARD,
  ...FOLLOWER_HERO_CARDS,
  CARRICK_99_SET_REWARD,
  ...FOLLOWER_ICON_CARDS,
  BALE_99_SET_REWARD,
];

// =========================================================================
// FOLLOWER SET DEFINITIONS (FOR SET REWARDS TAB)
// =========================================================================

export const FOLLOWER_SET_DEFINITION: CardSetDefinition = {
  id: 'set-follower-edition',
  title: 'Follower Challenge Edition',
  badge: '🔥 8-Card Master Set',
  subtitle: 'Collect all 8 Follower Challenge players and follow Michael Olise on Instagram to claim 99 Olise!',
  description: 'Assemble all 8 unique Follower cards (Barnes, Grimaldo, Guirassy, Kirian, Murphy, Puertas, Tarkowski, and Zaniolo) from the Mini Games Follower tab into your Club, then complete the final follow step to claim 99 RM Michael Olise.',
  program: 'Follower Challenge',
  requiredPlayerIds: FOLLOWER_CHALLENGE_CARDS.map((c) => c.id),
  rewardPlayer: OLISE_99_SET_REWARD,
  bonusCoins: 100000,
};

export const FOLLOWER_HEROES_SET_DEFINITION: CardSetDefinition = {
  id: 'set-follower-heroes-edition',
  title: 'Follower Heroes Edition',
  badge: '👑 8-Hero Master Set',
  subtitle: 'Collect all 8 Follower Heroes and follow Michael Carrick on Instagram to claim 99 Carrick!',
  description: 'Assemble all 8 legendary Follower Heroes (Anelka, Ayala, Barthez, Ceni, De Boer, Juninho, Valderrama, and Villa) from the Mini Games Follower tab into your Club, then complete the final follow step to claim 99 CDM Michael Carrick.',
  program: 'Follower Heroes',
  requiredPlayerIds: FOLLOWER_HERO_CARDS.map((c) => c.id),
  rewardPlayer: CARRICK_99_SET_REWARD,
  bonusCoins: 100000,
};

export const FOLLOWER_ICONS_SET_DEFINITION: CardSetDefinition = {
  id: 'set-follower-icons-edition',
  title: 'Follower Icons Edition',
  badge: '👑 8-Icon Master Set',
  subtitle: 'Collect all 8 Follower Icons and follow Gareth Bale on Instagram to claim 99 Bale!',
  description: 'Assemble all 8 elite Follower Icons (Zidane, Ronaldinho, Ronaldo R9, Henry, Kaká, Rooney, Gerrard, and Casillas) from the Mini Games Follower tab into your Club, then complete the final follow step to claim 99 RW Gareth Bale.',
  program: 'Follower Icons',
  requiredPlayerIds: FOLLOWER_ICON_CARDS.map((c) => c.id),
  rewardPlayer: BALE_99_SET_REWARD,
  bonusCoins: 150000,
};

// =========================================================================
// 3-DAY COOLDOWN AND UNOWNED REVEAL HELPERS
// =========================================================================

export const FOLLOWER_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000; // 3 Days in milliseconds (72 Hours)

export interface FollowerSeriesProgress {
  activePlayerId: string | null;
  cooldownUntil: number | null;
  lastClaimedAt: number | null;
}

export interface FollowerCooldownState {
  modern: FollowerSeriesProgress;
  heroes: FollowerSeriesProgress;
  icons: FollowerSeriesProgress;
}

/**
 * Returns a random unowned card from a given series (excluding already owned in Club and current card)
 */
export function getNextRandomUnownedPlayer(
  seriesCards: SoccerCard[],
  clubCards: SoccerCard[],
  excludeId?: string | null
): SoccerCard | null {
  const unowned = seriesCards.filter((card) => {
    const isOwned = clubCards.some(
      (c) => c.id === card.id || c.name.toLowerCase() === card.name.toLowerCase()
    );
    return !isOwned && card.id !== excludeId;
  });

  if (unowned.length === 0) {
    const anyUnowned = seriesCards.filter((card) => {
      return !clubCards.some(
        (c) => c.id === card.id || c.name.toLowerCase() === card.name.toLowerCase()
      );
    });
    return anyUnowned.length > 0 ? anyUnowned[0] : null;
  }

  const randomIndex = Math.floor(Math.random() * unowned.length);
  return unowned[randomIndex];
}

/**
 * Generates a mystery shrouded card SVG displayed during the 3-day cooldown
 */
export function generateMysteryFollowerSvg(seriesType: 'modern' | 'heroes' | 'icons' | boolean = 'modern'): string {
  const isHero = seriesType === true || seriesType === 'heroes';
  const isIcon = seriesType === 'icons';
  const primaryGlow = isIcon ? '#ffd700' : isHero ? '#fbbf24' : '#00f5d4';
  const title = isIcon ? 'MYSTERY ICON' : isHero ? 'MYSTERY HERO' : 'MYSTERY STAR';
  const subtitle = '3-DAY COOLDOWN';

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 644 900" width="100%" height="100%" style="border-radius: 28px; overflow: hidden; filter: drop-shadow(0 12px 25px rgba(0,0,0,0.6));">
    <defs>
      <linearGradient id="mysteryBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${primaryGlow}" />
        <stop offset="50%" stop-color="#ef4444" />
        <stop offset="100%" stop-color="${primaryGlow}" />
      </linearGradient>

      <radialGradient id="mysteryVortex" cx="50%" cy="40%" r="65%">
        <stop offset="0%" stop-color="#450a0a" />
        <stop offset="60%" stop-color="#1c0205" />
        <stop offset="100%" stop-color="#090102" />
      </radialGradient>

      <filter id="mysteryGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="8" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>

      <clipPath id="mysteryShieldClip">
        <path d="M 322 30 C 490 30, 600 68, 600 185 C 600 480, 560 710, 322 875 C 84 710, 44 480, 44 185 C 44 68, 154 30, 322 30 Z" />
      </clipPath>
    </defs>

    <!-- Outer Glow Border -->
    <path d="M 322 24 C 496 24, 610 64, 610 185 C 610 490, 570 725, 322 890 C 74 725, 34 490, 34 185 C 34 64, 148 24, 322 24 Z" 
          fill="none" stroke="url(#mysteryBorderGrad)" stroke-width="12" filter="url(#mysteryGlow)" />

    <g clip-path="url(#mysteryShieldClip)">
      <rect width="644" height="900" fill="url(#mysteryVortex)" />

      <!-- Energy Rings -->
      <g stroke="#ef4444" stroke-opacity="0.3" fill="none" stroke-width="3">
        <ellipse cx="322" cy="380" rx="230" ry="230" stroke-dasharray="10 10" />
        <ellipse cx="322" cy="380" rx="170" ry="170" />
        <ellipse cx="322" cy="380" rx="110" ry="110" stroke-dasharray="6 6" />
      </g>

      <!-- Center Mystery Silhouette -->
      <g transform="translate(192, 210)">
        <path d="M 130 50 C 95 50, 75 75, 75 115 C 75 160, 95 190, 130 190 C 165 190, 185 160, 185 115 C 185 75, 165 50, 130 50 Z" 
              fill="#ffffff" fill-opacity="0.08" />
        <path d="M 50 280 C 50 220, 85 185, 130 185 C 175 185, 210 220, 210 280 L 260 360 L 0 360 Z" 
              fill="#ffffff" fill-opacity="0.06" />
      </g>

      <!-- Giant Question Mark -->
      <text x="322" y="440" font-family="system-ui, sans-serif" font-size="160" font-weight="900" fill="#ffffff" fill-opacity="0.85" text-anchor="middle" filter="drop-shadow(0 0 25px ${primaryGlow})">
        ?
      </text>

      <!-- Top Badge -->
      <g transform="translate(322, 120)">
        <rect x="-95" y="-18" width="190" height="34" rx="17" fill="rgba(0,0,0,0.7)" stroke="${primaryGlow}" stroke-width="1.5" />
        <text x="0" y="5" font-family="system-ui, sans-serif" font-size="12" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="2">
          ${subtitle}
        </text>
      </g>

      <!-- Title Banner -->
      <text x="322" y="620" font-family="system-ui, sans-serif" font-size="40" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="2" filter="drop-shadow(0 4px 10px rgba(0,0,0,0.8))">
        ${title}
      </text>

      <text x="322" y="670" font-family="system-ui, sans-serif" font-size="18" font-weight="700" fill="${primaryGlow}" text-anchor="middle" letter-spacing="1">
        PREPARING RANDOM UNVEIL
      </text>
    </g>
  </svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}


