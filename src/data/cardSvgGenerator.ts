import { CardStyle, PlayStylePlusBadge } from '../types/card';

export const PLAYSTYLE_PRESETS: Record<string, PlayStylePlusBadge> = {
  quick_step: {
    id: 'quick_step',
    name: 'Quick Step+',
    shortDesc: '+12 Pace burst & explosive breakaways in transitions',
    iconSymbol: '⚡',
    statBoost: { attribute: 'pac', bonus: 12 },
  },
  finesse_shot: {
    id: 'finesse_shot',
    name: 'Finesse Shot+',
    shortDesc: '+15 Curve & lethal top-corner curling finishes',
    iconSymbol: '🎯',
    statBoost: { attribute: 'sho', bonus: 15 },
  },
  anticipate: {
    id: 'anticipate',
    name: 'Anticipate+',
    shortDesc: '+15 Standing tackle precision & instant turnover rate',
    iconSymbol: '🛡️',
    statBoost: { attribute: 'def', bonus: 15 },
  },
  bruiser: {
    id: 'bruiser',
    name: 'Bruiser+',
    shortDesc: '+12 Physical strength & dominant shoulder duels',
    iconSymbol: '💪',
    statBoost: { attribute: 'phy', bonus: 12 },
  },
  whipped_pass: {
    id: 'whipped_pass',
    name: 'Whipped Pass+',
    shortDesc: '+14 Crossing accuracy & pinpoint set-piece assists',
    iconSymbol: '📐',
    statBoost: { attribute: 'pas', bonus: 14 },
  },
  dead_ball: {
    id: 'dead_ball',
    name: 'Dead Ball+',
    shortDesc: '+20 Free kick & corner accuracy with dipping curl',
    iconSymbol: '☄️',
    statBoost: { attribute: 'pas', bonus: 20 },
  },
  rapid: {
    id: 'rapid',
    name: 'Rapid+',
    shortDesc: '+10 Sprint dribble speed without losing ball control',
    iconSymbol: '💨',
    statBoost: { attribute: 'dri', bonus: 10 },
  },
  cat_reflexes: {
    id: 'cat_reflexes',
    name: 'Cat Reflexes+',
    shortDesc: '+15 Goalkeeper diving speed & point-blank reaction saves',
    iconSymbol: '🧤',
    statBoost: { attribute: 'def', bonus: 15 },
  },
  relentless: {
    id: 'relentless',
    name: 'Relentless+',
    shortDesc: 'Zero stamina decay & clutch 90th-minute match boost',
    iconSymbol: '🔋',
    statBoost: { attribute: 'phy', bonus: 12 },
  },
};

// Helper to create full-card SVG graphics matching the exact custom card shield template
export function generateUserCardSvg(
  name: string = 'PLAYER',
  rating: number = 80,
  pos: string = 'ST',
  stats: { pac: number; sho: number; pas: number; dri: number; def: number; phy: number } = { pac: 80, sho: 80, pas: 80, dri: 80, def: 80, phy: 80 },
  nationFlag: string = '🏳️',
  clubText: string = 'APEX',
  portraitEmojiOrUrl: string = '⚽',
  cardStyle: CardStyle = 'hof_gold_obsidian',
  playStylePlus?: PlayStylePlusBadge
): string {
  const safeName = (name || 'PLAYER').toUpperCase();
  const safeClub = (clubText || 'APEX').slice(0, 4).toUpperCase();
  const safeFlag = nationFlag || '🏳️';
  const safeStats = {
    pac: stats?.pac ?? 80,
    sho: stats?.sho ?? 80,
    pas: stats?.pas ?? 80,
    dri: stats?.dri ?? 80,
    def: stats?.def ?? 80,
    phy: stats?.phy ?? 80,
  };
  const safePortrait = portraitEmojiOrUrl || '⚽';
  const isGK = pos === 'GK';
  const l1 = isGK ? 'DIV' : 'PAC';
  const l2 = isGK ? 'HAN' : 'SHO';
  const l3 = isGK ? 'KIC' : 'PAS';
  const l4 = isGK ? 'REF' : 'DRI';
  const l5 = isGK ? 'SPD' : 'DEF';
  const l6 = isGK ? 'POS' : 'PHY';

  const isObjectiveExclusive = cardStyle === 'objective_obsidian_gold' || (cardStyle as string) === 'objective_exclusive';
  const isSummerBasic = cardStyle === 'summer_basic' || (cardStyle as string) === 'summer_transfers';
  const isStreetKings = cardStyle === 'street_kings_urban' || (cardStyle as string) === 'street_kings';
  const isFutmas = cardStyle === 'futmas_crimson';
  const isGold = cardStyle === 'classic_gold';
  const isHOF = cardStyle === 'hof_gold_obsidian';

  const borderStops = isSummerBasic
    ? `<stop offset="0%" stop-color="#06b6d4"/>
       <stop offset="28%" stop-color="#38bdf8"/>
       <stop offset="55%" stop-color="#fbbf24"/>
       <stop offset="82%" stop-color="#f59e0b"/>
       <stop offset="100%" stop-color="#0891b2"/>`
    : isObjectiveExclusive
    ? `<stop offset="0%" stop-color="#f59e0b"/>
       <stop offset="25%" stop-color="#06b6d4"/>
       <stop offset="50%" stop-color="#fbbf24"/>
       <stop offset="75%" stop-color="#ec4899"/>
       <stop offset="100%" stop-color="#f59e0b"/>`
    : isStreetKings
    ? `<stop offset="0%" stop-color="#06b6d4"/>
       <stop offset="22%" stop-color="#ec4899"/>
       <stop offset="50%" stop-color="#facc15"/>
       <stop offset="78%" stop-color="#10b981"/>
       <stop offset="100%" stop-color="#06b6d4"/>`
    : isFutmas
    ? `<stop offset="0%" stop-color="#a7f3d0"/>
       <stop offset="25%" stop-color="#34d399"/>
       <stop offset="50%" stop-color="#fef08a"/>
       <stop offset="75%" stop-color="#059669"/>
       <stop offset="100%" stop-color="#fbbf24"/>`
    : isHOF
    ? `<stop offset="0%" stop-color="#fffbeb"/>
       <stop offset="20%" stop-color="#fef08a"/>
       <stop offset="45%" stop-color="#eab308"/>
       <stop offset="70%" stop-color="#ca8a04"/>
       <stop offset="88%" stop-color="#854d0e"/>
       <stop offset="100%" stop-color="#fef08a"/>`
    : isGold
    ? `<stop offset="0%" stop-color="#fef08a"/>
       <stop offset="25%" stop-color="#eab308"/>
       <stop offset="50%" stop-color="#ca8a04"/>
       <stop offset="75%" stop-color="#854d0e"/>
       <stop offset="100%" stop-color="#eab308"/>`
    : `<stop offset="0%" stop-color="#fef08a"/>
       <stop offset="25%" stop-color="#ca8a04"/>
       <stop offset="50%" stop-color="#fef08a"/>
       <stop offset="75%" stop-color="#a16207"/>
       <stop offset="100%" stop-color="#eab308"/>`;

  const shieldStops = isSummerBasic
    ? `<stop offset="0%" stop-color="#083344"/>
       <stop offset="25%" stop-color="#0e7490"/>
       <stop offset="55%" stop-color="#0891b2"/>
       <stop offset="80%" stop-color="#78350f"/>
       <stop offset="100%" stop-color="#451a03"/>`
    : isObjectiveExclusive
    ? `<stop offset="0%" stop-color="#1c1917"/>
       <stop offset="30%" stop-color="#292524"/>
       <stop offset="60%" stop-color="#44403c"/>
       <stop offset="100%" stop-color="#0c0a09"/>`
    : isStreetKings
    ? `<stop offset="0%" stop-color="#090d16"/>
       <stop offset="30%" stop-color="#111827"/>
       <stop offset="65%" stop-color="#0f172a"/>
       <stop offset="100%" stop-color="#020617"/>`
    : isFutmas
    ? `<stop offset="0%" stop-color="#991b1b"/>
       <stop offset="50%" stop-color="#4c0519"/>
       <stop offset="100%" stop-color="#190207"/>`
    : isHOF
    ? `<stop offset="0%" stop-color="#1c1917"/>
       <stop offset="25%" stop-color="#18181b"/>
       <stop offset="70%" stop-color="#09090b"/>
       <stop offset="100%" stop-color="#000000"/>`
    : isGold
    ? `<stop offset="0%" stop-color="#ca8a04"/>
       <stop offset="50%" stop-color="#a16207"/>
       <stop offset="100%" stop-color="#713f12"/>`
    : `<stop offset="0%" stop-color="#18181b"/>
       <stop offset="50%" stop-color="#09090b"/>
       <stop offset="100%" stop-color="#000000"/>`;

  const lineStops = isSummerBasic
    ? `<stop offset="0%" stop-color="#38bdf8" stop-opacity="0.95"/>
       <stop offset="45%" stop-color="#fbbf24" stop-opacity="0.85"/>
       <stop offset="100%" stop-color="#0891b2" stop-opacity="0.2"/>`
    : isStreetKings
    ? `<stop offset="0%" stop-color="#06b6d4" stop-opacity="0.9"/>
       <stop offset="45%" stop-color="#ec4899" stop-opacity="0.8"/>
       <stop offset="100%" stop-color="#10b981" stop-opacity="0.2"/>`
    : isFutmas
    ? `<stop offset="0%" stop-color="#67e8f9" stop-opacity="0.8"/>
       <stop offset="100%" stop-color="#34d399" stop-opacity="0.1"/>`
    : isHOF
    ? `<stop offset="0%" stop-color="#fef08a" stop-opacity="0.95"/>
       <stop offset="50%" stop-color="#eab308" stop-opacity="0.6"/>
       <stop offset="100%" stop-color="#ca8a04" stop-opacity="0.1"/>`
    : isGold
    ? `<stop offset="0%" stop-color="#fef08a" stop-opacity="0.8"/>
       <stop offset="100%" stop-color="#ca8a04" stop-opacity="0.1"/>`
    : `<stop offset="0%" stop-color="#eab308" stop-opacity="0.8"/>
       <stop offset="100%" stop-color="#a16207" stop-opacity="0.1"/>`;

  const starSymbol = isSummerBasic ? '☀️' : isStreetKings ? '⚡' : isFutmas ? '❄' : isHOF ? '👑' : '★';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 644 900" width="100%" height="100%">
    <defs>
      <linearGradient id="cardBorder" x1="0%" y1="0%" x2="100%" y2="100%">
        ${borderStops}
      </linearGradient>
      <linearGradient id="cardShield" x1="0%" y1="0%" x2="0%" y2="100%">
        ${shieldStops}
      </linearGradient>
      <linearGradient id="cardLines" x1="0%" y1="0%" x2="100%" y2="100%">
        ${lineStops}
      </linearGradient>
      <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#eab308" flood-opacity="0.6"/>
      </filter>
      <clipPath id="cardClip">
        <path d="M 322 108 C 300 128 275 140 252 118 C 220 95 105 170 85 220 L 85 710 C 85 790 250 865 322 885 C 394 865 559 790 559 710 L 559 220 C 539 170 424 95 392 118 C 369 140 344 128 322 108 Z"/>
      </clipPath>
    </defs>

    <!-- Outer Card Trim (Dual-tier metallic frame) -->
    <path d="M 322 100 C 296 123 270 136 248 112 C 214 88 96 164 76 214 L 76 716 C 76 802 246 878 322 900 C 398 878 568 802 568 716 L 568 214 C 548 164 430 88 396 112 C 374 136 348 123 322 100 Z" 
      fill="none" stroke="url(#cardBorder)" stroke-width="14" stroke-linejoin="round"/>

    <!-- Inner Shield Body -->
    <path d="M 322 108 C 300 128 275 140 252 118 C 220 95 105 170 85 220 L 85 710 C 85 790 250 865 322 885 C 394 865 559 790 559 710 L 559 220 C 539 170 424 95 392 118 C 369 140 344 128 322 108 Z" 
      fill="url(#cardShield)"/>

    <!-- Gold Geometry Pattern & Carbon Textures -->
    <g opacity="${isHOF ? '0.55' : '0.4'}" clip-path="url(#cardClip)">
      <polygon points="410,160 520,270 470,320 360,210" fill="url(#cardLines)" />
      <polygon points="460,190 560,290 520,330 420,230" fill="url(#cardLines)" />
      <polygon points="370,220 440,290 410,320 340,250" fill="url(#cardLines)" />
      <line x1="330" y1="210" x2="550" y2="430" stroke="#facc15" stroke-width="4" stroke-opacity="0.45"/>
      <line x1="350" y1="230" x2="570" y2="450" stroke="#facc15" stroke-width="3" stroke-opacity="0.45"/>
      <line x1="310" y1="240" x2="490" y2="420" stroke="#facc15" stroke-width="2" stroke-opacity="0.35"/>
      ${isHOF ? `
      <!-- Additional Hall of Fame Radiance Rays -->
      <line x1="120" y1="180" x2="300" y2="360" stroke="#eab308" stroke-width="2" stroke-opacity="0.25"/>
      <line x1="150" y1="160" x2="330" y2="340" stroke="#ca8a04" stroke-width="1.5" stroke-opacity="0.2"/>
      ` : ''}
    </g>

    ${isSummerBasic ? `
    <!-- Summer Transfers Upper Notch Banner -->
    <text x="322" y="146" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="12" fill="#38bdf8" letter-spacing="3" text-anchor="middle" filter="url(#goldGlow)">☀️ SUMMER TRANSFERS ☀️</text>
    ` : isObjectiveExclusive ? `
    <!-- Objective Exclusive Upper Notch Banner -->
    <text x="322" y="146" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="12" fill="#fbbf24" letter-spacing="3" text-anchor="middle" filter="url(#goldGlow)">🎯 OBJECTIVE EXCLUSIVE 🎯</text>
    ` : isStreetKings ? `
    <!-- Street Kings Upper Notch Banner -->
    <text x="322" y="146" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="13" fill="#22d3ee" letter-spacing="3" text-anchor="middle" filter="url(#goldGlow)">⚡ STREET KINGS ⚡</text>
    ` : isHOF ? `
    <!-- Hall of Fame Upper Notch Banner -->
    <text x="322" y="146" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="14" fill="#fef08a" letter-spacing="4" text-anchor="middle" filter="url(#goldGlow)">HALL OF FAME</text>
    ` : ''}

    <!-- Top Left Rating & Position Stack -->
    <text x="135" y="275" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="82" fill="#ffffff" text-anchor="middle" filter="${isHOF ? 'url(#goldGlow)' : 'none'}">${rating}</text>
    <text x="135" y="325" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="34" fill="${isHOF ? '#fef08a' : '#ffffff'}" text-anchor="middle">${pos}</text>

    <!-- Center Player Face Silhouette / Avatar placeholder -->
    <g transform="translate(322, 380)">
      <clipPath id="avatarClip">
        <circle cx="0" cy="0" r="126"/>
      </clipPath>
      <circle cx="0" cy="0" r="128" fill="#18181b" stroke="${isStreetKings ? '#06b6d4' : isHOF ? '#ca8a04' : '#3f3f46'}" stroke-width="${isStreetKings ? '5' : '4'}" filter="${isStreetKings ? 'url(#goldGlow)' : 'none'}"/>
      ${safePortrait.startsWith('http') || safePortrait.startsWith('data:') || safePortrait.startsWith('/') || safePortrait.includes('/') || safePortrait.includes('.') || safePortrait.length > 10
        ? `<image href="${safePortrait}" x="-126" y="-126" width="252" height="252" preserveAspectRatio="xMidYMid slice" clip-path="url(#avatarClip)"/>`
        : `<text x="0" y="35" font-family="system-ui, sans-serif" font-size="110" text-anchor="middle">${safePortrait}</text>`
      }
    </g>

    <!-- PlayStyle Plus Crest on Card (if active) -->
    ${playStylePlus ? `
    <g transform="translate(322, 516)" filter="url(#goldGlow)">
      <polygon points="0,-18 18,0 0,18 -18,0" fill="#09090b" stroke="#facc15" stroke-width="2.5"/>
      <polygon points="0,-14 14,0 0,14 -14,0" fill="#ca8a04" fill-opacity="0.35"/>
      <text x="0" y="6" font-size="15" text-anchor="middle">${playStylePlus.iconSymbol}</text>
      <!-- Mini PS+ pill badge -->
      <rect x="-18" y="20" width="36" height="11" rx="3" fill="#000000" stroke="#ca8a04" stroke-width="1"/>
      <text x="0" y="29" font-family="system-ui, sans-serif" font-weight="900" font-size="8" fill="#fef08a" text-anchor="middle" letter-spacing="0.5">PS+</text>
    </g>
    ` : ''}

    <!-- Player Name Banner Plate -->
    <rect x="100" y="565" width="444" height="60" fill="#000000" fill-opacity="${isHOF ? '0.75' : '0.5'}" rx="4" stroke="${isHOF ? '#ca8a04' : 'transparent'}" stroke-width="${isHOF ? '1.5' : '0'}"/>
    <text x="322" y="610" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="42" fill="${isHOF ? '#ffffff' : '#ffffff'}" text-anchor="middle" letter-spacing="1.5">${safeName}</text>

    <!-- Stats Grid Divider Lines -->
    <line x1="110" y1="635" x2="534" y2="635" stroke="${isHOF ? '#eab308' : '#ffffff'}" stroke-opacity="${isHOF ? '0.5' : '0.2'}" stroke-width="2"/>

    <!-- Stats Row 1: Labels -->
    <text x="140" y="660" font-family="sans-serif" font-weight="700" font-size="20" fill="${isHOF ? '#fef08a' : '#ffffff'}" opacity="0.9" text-anchor="middle">${l1}</text>
    <text x="212" y="660" font-family="sans-serif" font-weight="700" font-size="20" fill="${isHOF ? '#fef08a' : '#ffffff'}" opacity="0.9" text-anchor="middle">${l2}</text>
    <text x="284" y="660" font-family="sans-serif" font-weight="700" font-size="20" fill="${isHOF ? '#fef08a' : '#ffffff'}" opacity="0.9" text-anchor="middle">${l3}</text>
    <text x="360" y="660" font-family="sans-serif" font-weight="700" font-size="20" fill="${isHOF ? '#fef08a' : '#ffffff'}" opacity="0.9" text-anchor="middle">${l4}</text>
    <text x="432" y="660" font-family="sans-serif" font-weight="700" font-size="20" fill="${isHOF ? '#fef08a' : '#ffffff'}" opacity="0.9" text-anchor="middle">${l5}</text>
    <text x="504" y="660" font-family="sans-serif" font-weight="700" font-size="20" fill="${isHOF ? '#fef08a' : '#ffffff'}" opacity="0.9" text-anchor="middle">${l6}</text>

    <!-- Stats Row 2: Values -->
    <text x="140" y="705" font-family="sans-serif" font-weight="900" font-size="34" fill="#ffffff" text-anchor="middle">${safeStats.pac}</text>
    <text x="212" y="705" font-family="sans-serif" font-weight="900" font-size="34" fill="#ffffff" text-anchor="middle">${safeStats.sho}</text>
    <text x="284" y="705" font-family="sans-serif" font-weight="900" font-size="34" fill="#ffffff" text-anchor="middle">${safeStats.pas}</text>
    <text x="360" y="705" font-family="sans-serif" font-weight="900" font-size="34" fill="#ffffff" text-anchor="middle">${safeStats.dri}</text>
    <text x="432" y="705" font-family="sans-serif" font-weight="900" font-size="34" fill="#ffffff" text-anchor="middle">${safeStats.def}</text>
    <text x="504" y="705" font-family="sans-serif" font-weight="900" font-size="34" fill="#ffffff" text-anchor="middle">${safeStats.phy}</text>

    <!-- Bottom Badges (Flag, Star/Crown, Club) -->
    <g transform="translate(230, 770)">
      <text x="0" y="10" font-size="44" text-anchor="middle">${safeFlag}</text>
    </g>
    <g transform="translate(322, 775)">
      <circle cx="0" cy="0" r="22" fill="#18181b" stroke="${isHOF ? '#facc15' : '#ca8a04'}" stroke-width="2"/>
      <text x="0" y="6" font-size="18" fill="${isHOF ? '#fef08a' : '#ca8a04'}" font-weight="900" text-anchor="middle">${starSymbol}</text>
    </g>
    <g transform="translate(414, 775)">
      <circle cx="0" cy="0" r="24" fill="#18181b" stroke="${isHOF ? '#ca8a04' : '#71717a'}" stroke-width="2"/>
      <text x="0" y="4" font-size="12" fill="#ffffff" font-weight="700" text-anchor="middle">${safeClub}</text>
    </g>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
