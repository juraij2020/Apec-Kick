import { SoccerCard, PlayStylePlusBadge, PlayStylePlusType } from '../types/card';

export const INTL_PLAYSTYLES: Record<string, PlayStylePlusBadge> = {
  technical_plus: {
    id: 'technical',
    name: 'Technical+',
    shortDesc: 'Reaches maximum controlled sprint speed with razor-tight touch and tight-space agility.',
    iconSymbol: '👟',
    statBoost: { attribute: 'dri', bonus: 15 },
    isPlus: true,
  },
  technical: {
    id: 'technical',
    name: 'Technical',
    shortDesc: 'Exceptional controlled ball manipulation and tight dribbling in pressure pockets.',
    iconSymbol: '👟',
    statBoost: { attribute: 'dri', bonus: 8 },
    isPlus: false,
  },
  trickster_plus: {
    id: 'trickster',
    name: 'Trickster+',
    shortDesc: 'Unlocks rare five-star skill moves with lightning deceptive feints and elastico burst.',
    iconSymbol: '🪄',
    statBoost: { attribute: 'dri', bonus: 16 },
    isPlus: true,
  },
  trickster: {
    id: 'trickster',
    name: 'Trickster',
    shortDesc: 'Rapid skill moves execution and deceptive body swerves.',
    iconSymbol: '🪄',
    statBoost: { attribute: 'dri', bonus: 8 },
    isPlus: false,
  },
  incisive_pass_plus: {
    id: 'incisive_pass',
    name: 'Incisive Pass+',
    shortDesc: 'Dissects backlines with curved laser-guided ground through balls directly into runners.',
    iconSymbol: '🎯',
    statBoost: { attribute: 'pas', bonus: 16 },
    isPlus: true,
  },
  incisive_pass: {
    id: 'incisive_pass',
    name: 'Incisive Pass',
    shortDesc: 'Piercing through-ball trajectory with increased speed and accuracy.',
    iconSymbol: '🎯',
    statBoost: { attribute: 'pas', bonus: 8 },
    isPlus: false,
  },
  rapid_plus: {
    id: 'rapid',
    name: 'Rapid+',
    shortDesc: 'Reaches blistering top sprint velocity while keeping full touch without ball deflection.',
    iconSymbol: '💨',
    statBoost: { attribute: 'dri', bonus: 14 },
    isPlus: true,
  },
  quick_step_plus: {
    id: 'quick_step',
    name: 'Quick Step+',
    shortDesc: 'Instant rocket acceleration out of deceleration or first touch in the attacking third.',
    iconSymbol: '⚡',
    statBoost: { attribute: 'pac', bonus: 14 },
    isPlus: true,
  },
  quick_step: {
    id: 'quick_step',
    name: 'Quick Step',
    shortDesc: 'Explosive burst in transitions.',
    iconSymbol: '⚡',
    statBoost: { attribute: 'pac', bonus: 8 },
    isPlus: false,
  },
  finesse_shot_plus: {
    id: 'finesse_shot',
    name: 'Finesse Shot+',
    shortDesc: 'Devastating curling trajectory into top corners from inside or outside the 18-yard box.',
    iconSymbol: '☄️',
    statBoost: { attribute: 'sho', bonus: 16 },
    isPlus: true,
  },
  finesse_shot: {
    id: 'finesse_shot',
    name: 'Finesse Shot',
    shortDesc: 'Exceptional curve and accuracy on curling finishes.',
    iconSymbol: '☄️',
    statBoost: { attribute: 'sho', bonus: 8 },
    isPlus: false,
  },
  anticipate_plus: {
    id: 'anticipate',
    name: 'Anticipate+',
    shortDesc: 'Near-100% standing tackle win rate with instant possession recovery and zero foul risk.',
    iconSymbol: '🛡️',
    statBoost: { attribute: 'def', bonus: 16 },
    isPlus: true,
  },
  anticipate: {
    id: 'anticipate',
    name: 'Anticipate',
    shortDesc: 'Superior anticipation and standing tackle timing.',
    iconSymbol: '🛡️',
    statBoost: { attribute: 'def', bonus: 8 },
    isPlus: false,
  },
  bruiser_plus: {
    id: 'bruiser',
    name: 'Bruiser+',
    shortDesc: 'Unstoppable shoulder barge strength and physical dominance dispossessing opponents cleanly.',
    iconSymbol: '💪',
    statBoost: { attribute: 'phy', bonus: 15 },
    isPlus: true,
  },
  bruiser: {
    id: 'bruiser',
    name: 'Bruiser',
    shortDesc: 'Crushing strength in 50/50 shoulder duels.',
    iconSymbol: '💪',
    statBoost: { attribute: 'phy', bonus: 8 },
    isPlus: false,
  },
  whipped_pass_plus: {
    id: 'whipped_pass',
    name: 'Whipped Pass+',
    shortDesc: 'Whipped curling crosses delivered with unmatched speed, dip, and header convergence.',
    iconSymbol: '📐',
    statBoost: { attribute: 'pas', bonus: 15 },
    isPlus: true,
  },
  whipped_pass: {
    id: 'whipped_pass',
    name: 'Whipped Pass',
    shortDesc: 'Sharp curve and whip on driven crosses.',
    iconSymbol: '📐',
    statBoost: { attribute: 'pas', bonus: 8 },
    isPlus: false,
  },
  dead_ball_plus: {
    id: 'dead_ball',
    name: 'Dead Ball+',
    shortDesc: 'Mastery over set-piece spin, dipping dip shots, and impossible direct free kicks.',
    iconSymbol: '✨',
    statBoost: { attribute: 'pas', bonus: 18 },
    isPlus: true,
  },
  dead_ball: {
    id: 'dead_ball',
    name: 'Dead Ball',
    shortDesc: 'High spin curve on free kicks and corners.',
    iconSymbol: '✨',
    statBoost: { attribute: 'pas', bonus: 8 },
    isPlus: false,
  },
  cat_reflexes_plus: {
    id: 'cat_reflexes',
    name: 'Cat Reflexes+',
    shortDesc: 'Superhuman reaction speed on point-blank deflections and impossible fingertip saves.',
    iconSymbol: '🧤',
    statBoost: { attribute: 'def', bonus: 16 },
    isPlus: true,
  },
  relentless_plus: {
    id: 'relentless',
    name: 'Relentless+',
    shortDesc: 'Unstoppable stamina reserve with 0% fatigue decay and extra clutch performance in 90+ mins.',
    iconSymbol: '🔋',
    statBoost: { attribute: 'phy', bonus: 15 },
    isPlus: true,
  },
  long_ball_pass_plus: {
    id: 'long_ball_pass',
    name: 'Long Ball Pass+',
    shortDesc: 'Pinpoint 60-yard cross-field diagonal passes falling directly into running wingers.',
    iconSymbol: '📡',
    statBoost: { attribute: 'pas', bonus: 15 },
    isPlus: true,
  },
  press_proven_plus: {
    id: 'press_proven',
    name: 'Press Proven+',
    shortDesc: 'Impervious to aggressive pressing, shielding the ball effortlessly with back to goal.',
    iconSymbol: '⚓',
    statBoost: { attribute: 'phy', bonus: 14 },
    isPlus: true,
  },
  press_proven: {
    id: 'press_proven',
    name: 'Press Proven',
    shortDesc: 'Exceptional shield retention under heavy defensive pressure.',
    iconSymbol: '⚓',
    statBoost: { attribute: 'phy', bonus: 7 },
    isPlus: false,
  },
  poacher_plus: {
    id: 'poacher',
    name: 'Poacher+',
    shortDesc: 'Lethal first-time finishing inside the box, converting half-chances with instant instinct.',
    iconSymbol: '🥅',
    statBoost: { attribute: 'sho', bonus: 15 },
    isPlus: true,
  },
  acrobatic_plus: {
    id: 'acrobatic',
    name: 'Acrobatic+',
    shortDesc: 'Executes bicycle kicks, airborne volleys, and diving headers with spectacular power.',
    iconSymbol: '🤸',
    statBoost: { attribute: 'sho', bonus: 14 },
    isPlus: true,
  },
  power_header_plus: {
    id: 'power_header',
    name: 'Power Header+',
    shortDesc: 'Bullet trajectory headers on attacking corners and aerial clearances in defense.',
    iconSymbol: '💥',
    statBoost: { attribute: 'phy', bonus: 14 },
    isPlus: true,
  },
  power_header: {
    id: 'power_header',
    name: 'Power Header',
    shortDesc: 'Increased velocity and downward trajectory on headers.',
    iconSymbol: '💥',
    statBoost: { attribute: 'phy', bonus: 7 },
    isPlus: false,
  },
};

// Generates the authentic International Moments vector card shield SVG
export function generateInternationalMomentsCardSvg(card: SoccerCard): string {
  const isGK = card.position === 'GK';
  const l1 = isGK ? 'DIV' : 'PAC';
  const l2 = isGK ? 'HAN' : 'SHO';
  const l3 = isGK ? 'KIC' : 'PAS';
  const l4 = isGK ? 'REF' : 'DRI';
  const l5 = isGK ? 'SPD' : 'DEF';
  const l6 = isGK ? 'POS' : 'PHY';

  const nationColors: Record<string, { bg1: string; bg2: string; accent: string; glow: string }> = {
    Argentina: { bg1: '#08172e', bg2: '#0b2a4a', accent: '#38bdf8', glow: 'rgba(56, 189, 248, 0.45)' },
    Belgium: { bg1: '#1c080e', bg2: '#380e15', accent: '#ef4444', glow: 'rgba(239, 68, 68, 0.45)' },
    Brazil: { bg1: '#071c13', bg2: '#0c351f', accent: '#22c55e', glow: 'rgba(34, 197, 94, 0.45)' },
  };

  const palette = nationColors[card.nation] || {
    bg1: '#0b1120',
    bg2: '#1e293b',
    accent: '#facc15',
    glow: 'rgba(250, 204, 21, 0.4)',
  };

  const playStylesList = card.playStyles && card.playStyles.length > 0
    ? card.playStyles
    : card.playStylePlus ? [card.playStylePlus] : [];

  // Render stacked diamond badges for the left wing
  const stackedBadgesSvg = playStylesList.slice(0, 3).map((ps, idx) => {
    const yCenter = 330 + idx * 76;
    const isPlus = ps.isPlus !== false;
    const frameColor = isPlus ? '#facc15' : '#cbd5e1';
    const bgGrad = isPlus ? 'url(#psPlusGrad)' : 'url(#psBaseGrad)';
    const textColor = isPlus ? '#fef08a' : '#f8fafc';

    return `
      <!-- Stacked PlayStyle Badge ${idx + 1} -->
      <g transform="translate(68, ${yCenter})">
        <!-- Glow drop shadow -->
        <polygon points="0,-28 28,0 0,28 -28,0" fill="${frameColor}" opacity="${isPlus ? 0.35 : 0.15}" filter="blur(3px)" />
        <!-- Diamond Frame -->
        <polygon points="0,-26 26,0 0,26 -26,0" fill="${bgGrad}" stroke="${frameColor}" stroke-width="${isPlus ? 2.5 : 1.5}" />
        <!-- Inner accent facet -->
        <polygon points="0,-22 22,0 0,22 -22,0" fill="none" stroke="${frameColor}" stroke-width="0.8" opacity="0.6" />
        <!-- Icon symbol -->
        <text x="0" y="7" font-size="20" text-anchor="middle" filter="drop-shadow(0 2px 3px rgba(0,0,0,0.8))">${ps.iconSymbol}</text>
        ${isPlus ? `<text x="14" y="-12" font-size="14" font-weight="900" fill="#facc15" text-anchor="middle">+</text>` : ''}
      </g>
    `;
  }).join('');

  // Triple Footer: Flag, International Cup Trophy, Federation Crest
  const fedCrestText = card.federationCrest || (card.nation === 'Brazil' ? 'CBF' : card.nation === 'Belgium' ? 'RBFA' : 'AFA');

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 644 900" width="100%" height="100%">
    <defs>
      <!-- Radiant Golden Crown Gradient -->
      <linearGradient id="intlCrownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fffbeb" />
        <stop offset="25%" stop-color="#fef08a" />
        <stop offset="50%" stop-color="#facc15" />
        <stop offset="75%" stop-color="#ca8a04" />
        <stop offset="100%" stop-color="#854d0e" />
      </linearGradient>

      <!-- Outer Shield Gold Border -->
      <linearGradient id="intlBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fef08a" />
        <stop offset="20%" stop-color="#facc15" />
        <stop offset="45%" stop-color="#a16207" />
        <stop offset="70%" stop-color="#facc15" />
        <stop offset="90%" stop-color="#eab308" />
        <stop offset="100%" stop-color="#713f12" />
      </linearGradient>

      <!-- Deep Obsidian Shield Interior -->
      <linearGradient id="intlBgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${palette.bg2}" />
        <stop offset="40%" stop-color="${palette.bg1}" />
        <stop offset="75%" stop-color="#050811" />
        <stop offset="100%" stop-color="#020408" />
      </linearGradient>

      <!-- Name Banner Gradient -->
      <linearGradient id="nameplateGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="rgba(15, 23, 42, 0)" />
        <stop offset="15%" stop-color="rgba(15, 23, 42, 0.95)" />
        <stop offset="50%" stop-color="#0f172a" />
        <stop offset="85%" stop-color="rgba(15, 23, 42, 0.95)" />
        <stop offset="100%" stop-color="rgba(15, 23, 42, 0)" />
      </linearGradient>

      <!-- PlayStyle Diamond Gradients -->
      <linearGradient id="psPlusGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#451a03" />
        <stop offset="50%" stop-color="#18181b" />
        <stop offset="100%" stop-color="#09090b" />
      </linearGradient>
      <linearGradient id="psBaseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1e293b" />
        <stop offset="100%" stop-color="#0f172a" />
      </linearGradient>

      <!-- Filter for Golden Glow -->
      <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="6" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>

      <!-- Shield Clip Path -->
      <clipPath id="shieldClip">
        <path d="M 322 36 
                 C 480 36, 590 74, 590 195 
                 C 590 470, 560 690, 322 864 
                 C 84 690, 54 470, 54 195 
                 C 54 74, 164 36, 322 36 Z" />
      </clipPath>
    </defs>

    <!-- Outer Golden Shield Rim with Multi-Layer Bevel -->
    <path d="M 322 28 
             C 490 28, 600 68, 600 195 
             C 600 480, 570 705, 322 876 
             C 74 705, 44 480, 44 195 
             C 44 68, 154 28, 322 28 Z" 
          fill="none" 
          stroke="url(#intlBorderGrad)" 
          stroke-width="14" 
          stroke-linejoin="round"
          filter="drop-shadow(0 16px 28px rgba(0,0,0,0.85))" />

    <!-- Inner Hairline Highlight -->
    <path d="M 322 33 
             C 485 33, 594 72, 594 195 
             C 594 474, 564 696, 322 869 
             C 80 696, 50 474, 50 195 
             C 50 72, 159 33, 322 33 Z" 
          fill="none" 
          stroke="#fef08a" 
          stroke-width="2.5" 
          opacity="0.8" />

    <!-- Main Shield Body Interior -->
    <g clip-path="url(#shieldClip)">
      <!-- Background base -->
      <rect x="0" y="0" width="644" height="900" fill="url(#intlBgGrad)" />

      <!-- Carbon hex weave background pattern -->
      <pattern id="hexWeave" width="24" height="24" patternUnits="userSpaceOnUse" opacity="0.08">
        <path d="M 12 0 L 24 6 L 24 18 L 12 24 L 0 18 L 0 6 Z" fill="none" stroke="#ffffff" stroke-width="1.2" />
      </pattern>
      <rect x="0" y="0" width="644" height="900" fill="url(#hexWeave)" />

      <!-- Radiant Top Sunburst Arc / Fan Ribs -->
      <g opacity="0.4" stroke="url(#intlCrownGrad)" stroke-width="1.5">
        <line x1="322" y1="36" x2="322" y2="240" />
        <line x1="322" y1="36" x2="240" y2="230" />
        <line x1="322" y1="36" x2="404" y2="230" />
        <line x1="322" y1="36" x2="160" y2="210" />
        <line x1="322" y1="36" x2="484" y2="210" />
        <line x1="322" y1="36" x2="90" y2="180" />
        <line x1="322" y1="36" x2="554" y2="180" />
      </g>

      <!-- Radiant Golden Crown Arch -->
      <path d="M 180 40 Q 322 95 464 40 Q 322 55 180 40 Z" fill="url(#intlCrownGrad)" opacity="0.85" filter="url(#goldGlow)" />
      <circle cx="322" cy="72" r="14" fill="#facc15" stroke="#ffffff" stroke-width="2" />
      <text x="322" y="78" font-size="14" font-weight="900" fill="#713f12" text-anchor="middle">★</text>

      <!-- National Team Atmospheric Halo -->
      <circle cx="360" cy="330" r="220" fill="${palette.glow}" opacity="0.3" filter="blur(40px)" />

      <!-- Player Portrait / Silhouette Artwork -->
      <g transform="translate(340, 310)">
        <!-- Back halo rim -->
        <circle cx="0" cy="0" r="150" fill="none" stroke="url(#intlCrownGrad)" stroke-width="2" opacity="0.25" stroke-dasharray="8 6" />
        <!-- Player Silhouette & Silhouette Aura -->
        <path d="M -80 180 
                 C -70 120, -50 70, -35 40 
                 C -45 35, -55 20, -55 -15 
                 C -55 -60, -35 -90, 0 -90 
                 C 35 -90, 55 -60, 55 -15 
                 C 55 20, 45 35, 35 40 
                 C 50 70, 70 120, 80 180 Z" 
              fill="#0f172a" 
              stroke="${palette.accent}" 
              stroke-width="3" 
              opacity="0.9" />
        <!-- Jersey Collar & Accents -->
        <path d="M -30 45 Q 0 75 30 45" fill="none" stroke="#facc15" stroke-width="4" />
        <text x="0" y="115" font-family="sans-serif" font-weight="900" font-size="34" fill="#ffffff" text-anchor="middle" opacity="0.85">${card.shortName || card.name.split(' ').pop()?.toUpperCase()}</text>
        <text x="0" y="-15" font-size="52" text-anchor="middle" filter="drop-shadow(0 6px 12px rgba(0,0,0,0.8))">⚽</text>
      </g>

      <!-- Rating & Position Stack on Upper-Left -->
      <g transform="translate(105, 90)">
        <!-- OVR Rating -->
        <text x="0" y="80" 
              font-family="sans-serif" 
              font-weight="900" 
              font-size="82" 
              letter-spacing="-3"
              fill="url(#intlCrownGrad)" 
              filter="drop-shadow(0 4px 10px rgba(0,0,0,0.9))" 
              text-anchor="middle">${card.rating}</text>
        
        <!-- Position -->
        <text x="0" y="125" 
              font-family="sans-serif" 
              font-weight="800" 
              font-size="34" 
              letter-spacing="1"
              fill="#ffffff" 
              filter="drop-shadow(0 2px 6px rgba(0,0,0,0.8))" 
              text-anchor="middle">${card.position}</text>

        <!-- Divider Line -->
        <line x1="-32" y1="145" x2="32" y2="145" stroke="#facc15" stroke-width="2.5" opacity="0.8" />
        
        <!-- Small Tournament Pill -->
        <rect x="-38" y="156" width="76" height="18" rx="9" fill="#090d16" stroke="#ca8a04" stroke-width="1.2" />
        <text x="0" y="169" font-family="sans-serif" font-size="10" font-weight="900" fill="#facc15" text-anchor="middle" letter-spacing="1">MOMENT</text>
      </g>

      <!-- Stacked PlayStyle Badges (Left Wing) -->
      ${stackedBadgesSvg}

      <!-- Player Nameplate Plinth Bar -->
      <g transform="translate(322, 595)">
        <rect x="-260" y="-28" width="520" height="56" fill="url(#nameplateGrad)" />
        <line x1="-240" y1="-28" x2="240" y2="-28" stroke="url(#intlCrownGrad)" stroke-width="2.5" />
        <line x1="-240" y1="28" x2="240" y2="28" stroke="url(#intlCrownGrad)" stroke-width="1.5" opacity="0.7" />
        
        <!-- Player Full Name -->
        <text x="0" y="10" 
              font-family="sans-serif" 
              font-weight="900" 
              font-size="${card.name.length > 14 ? 32 : 38}" 
              letter-spacing="2"
              fill="#ffffff" 
              text-anchor="middle" 
              filter="drop-shadow(0 3px 6px rgba(0,0,0,0.9))">${card.name.toUpperCase()}</text>
      </g>

      <!-- 6 Attribute Ratings & Labels -->
      <g transform="translate(0, 650)">
        <!-- Stat Labels -->
        <text x="140" y="0" font-family="sans-serif" font-weight="700" font-size="18" fill="#94a3b8" letter-spacing="1" text-anchor="middle">${l1}</text>
        <text x="212" y="0" font-family="sans-serif" font-weight="700" font-size="18" fill="#94a3b8" letter-spacing="1" text-anchor="middle">${l2}</text>
        <text x="284" y="0" font-family="sans-serif" font-weight="700" font-size="18" fill="#94a3b8" letter-spacing="1" text-anchor="middle">${l3}</text>
        <text x="360" y="0" font-family="sans-serif" font-weight="700" font-size="18" fill="#94a3b8" letter-spacing="1" text-anchor="middle">${l4}</text>
        <text x="432" y="0" font-family="sans-serif" font-weight="700" font-size="18" fill="#94a3b8" letter-spacing="1" text-anchor="middle">${l5}</text>
        <text x="504" y="0" font-family="sans-serif" font-weight="700" font-size="18" fill="#94a3b8" letter-spacing="1" text-anchor="middle">${l6}</text>

        <!-- Stat Values -->
        <text x="140" y="38" font-family="sans-serif" font-weight="900" font-size="34" fill="#ffffff" text-anchor="middle">${card.stats.pac}</text>
        <text x="212" y="38" font-family="sans-serif" font-weight="900" font-size="34" fill="#ffffff" text-anchor="middle">${card.stats.sho}</text>
        <text x="284" y="38" font-family="sans-serif" font-weight="900" font-size="34" fill="#ffffff" text-anchor="middle">${card.stats.pas}</text>
        <text x="360" y="38" font-family="sans-serif" font-weight="900" font-size="34" fill="#ffffff" text-anchor="middle">${card.stats.dri}</text>
        <text x="432" y="38" font-family="sans-serif" font-weight="900" font-size="34" fill="#ffffff" text-anchor="middle">${card.stats.def}</text>
        <text x="504" y="38" font-family="sans-serif" font-weight="900" font-size="34" fill="#ffffff" text-anchor="middle">${card.stats.phy}</text>

        <!-- Divider line under stats -->
        <line x1="120" y1="58" x2="524" y2="58" stroke="url(#intlCrownGrad)" stroke-width="1.2" opacity="0.6" />
      </g>

      <!-- Triple Crest Footer: [Nation Flag] · [IFL Cup Trophy 🏆] · [Federation Crest] -->
      <g transform="translate(322, 775)">
        <!-- Left: Nation Flag -->
        <g transform="translate(-95, 0)">
          <circle cx="0" cy="0" r="26" fill="#0b1120" stroke="#facc15" stroke-width="2.5" />
          <text x="0" y="10" font-size="30" text-anchor="middle">${card.nationFlag}</text>
        </g>

        <!-- Center: International League Cup Trophy (IFL Cup) -->
        <g transform="translate(0, 0)">
          <circle cx="0" cy="0" r="28" fill="#171e2e" stroke="url(#intlCrownGrad)" stroke-width="3" />
          <!-- Gold trophy SVG -->
          <text x="0" y="9" font-size="28" text-anchor="middle" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.8))">🏆</text>
        </g>

        <!-- Right: Official Federation Crest Badge -->
        <g transform="translate(95, 0)">
          <polygon points="0,-27 25,-12 25,18 0,27 -25,18 -25,-12" fill="#0b1120" stroke="#facc15" stroke-width="2.5" />
          <text x="0" y="5" font-family="sans-serif" font-size="12" font-weight="900" fill="#fef08a" text-anchor="middle" letter-spacing="1">${fedCrestText}</text>
          <text x="0" y="-12" font-size="8" fill="#facc15" text-anchor="middle">★★★</text>
        </g>
      </g>
    </g>
  </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// -------------------------------------------------------------
// 1. BRAZIL 🇧🇷 (CBF) - 8 Official International Moments Cards
// -------------------------------------------------------------
export const BRAZIL_MOMENTS_CARDS: SoccerCard[] = [
  {
    id: 'intl-pele',
    name: 'Pelé',
    shortName: 'Pelé',
    rating: 95,
    position: 'CAM',
    nation: 'Brazil',
    nationFlag: '🇧🇷',
    club: 'Santos FC',
    league: 'CONMEBOL Libertadores',
    rarity: 'international_moments',
    cardStyle: 'intl_moments_gold',
    program: 'International Moments',
    federationCrest: 'CBF',
    tournamentEmblem: '🏆',
    momentTitle: '1970 World Final Masterpiece in Mexico City',
    momentDescription: 'Scored the opening towering header and provided the blind pass for the greatest team goal in tournament history.',
    playStylePlus: INTL_PLAYSTYLES.technical_plus,
    playStyles: [
      INTL_PLAYSTYLES.technical_plus,
      INTL_PLAYSTYLES.finesse_shot,
      INTL_PLAYSTYLES.trickster,
    ],
    stats: { pac: 96, sho: 95, pas: 97, dri: 96, def: 49, phy: 80 },
    weakFoot: 5,
    skillMoves: 5,
    workRate: 'H/M',
    price: 350000,
    isCustom: true,
  },
  {
    id: 'intl-ronaldo-r9',
    name: 'Ronaldo R9',
    shortName: 'Ronaldo',
    rating: 95,
    position: 'ST',
    nation: 'Brazil',
    nationFlag: '🇧🇷',
    club: 'Real Madrid',
    league: 'LaLiga',
    rarity: 'international_moments',
    cardStyle: 'intl_moments_gold',
    program: 'International Moments',
    federationCrest: 'CBF',
    tournamentEmblem: '🏆',
    momentTitle: '2002 World Cup Final Brace in Yokohama',
    momentDescription: 'Conquered redemption by slotting two clinical strikes past Oliver Kahn to secure the penta-championship.',
    playStylePlus: INTL_PLAYSTYLES.rapid_plus,
    playStyles: [
      INTL_PLAYSTYLES.rapid_plus,
      INTL_PLAYSTYLES.quick_step,
      INTL_PLAYSTYLES.finesse_shot,
    ],
    stats: { pac: 94, sho: 96, pas: 92, dri: 95, def: 50, phy: 94 },
    weakFoot: 5,
    skillMoves: 5,
    workRate: 'M/L',
    price: 320000,
    isCustom: true,
  },
  {
    id: 'intl-ronaldinho',
    name: 'Ronaldinho',
    shortName: 'Ronaldinho',
    rating: 94,
    position: 'LW',
    nation: 'Brazil',
    nationFlag: '🇧🇷',
    club: 'FC Barcelona',
    league: 'LaLiga',
    rarity: 'international_moments',
    cardStyle: 'intl_moments_gold',
    program: 'International Moments',
    federationCrest: 'CBF',
    tournamentEmblem: '🏆',
    momentTitle: '2002 Quarterfinal Free Kick Wonder vs England',
    momentDescription: 'Lofted an impossible 42-yard looping free kick over David Seaman in Shizuoka before dazzling defenders.',
    playStylePlus: INTL_PLAYSTYLES.trickster_plus,
    playStyles: [
      INTL_PLAYSTYLES.trickster_plus,
      INTL_PLAYSTYLES.dead_ball,
      INTL_PLAYSTYLES.technical,
    ],
    stats: { pac: 98, sho: 92, pas: 89, dri: 97, def: 30, phy: 89 },
    weakFoot: 4,
    skillMoves: 5,
    workRate: 'H/L',
    price: 280000,
    isCustom: true,
  },
  {
    id: 'intl-neymar-jr',
    name: 'Neymar Jr',
    shortName: 'Neymar Jr',
    rating: 94,
    position: 'LW',
    nation: 'Brazil',
    nationFlag: '🇧🇷',
    club: 'Al Hilal',
    league: 'Roshn Saudi League',
    rarity: 'international_moments',
    cardStyle: 'intl_moments_gold',
    program: 'International Moments',
    federationCrest: 'CBF',
    tournamentEmblem: '🏆',
    momentTitle: '2016 Rio Gold Penalty & 2022 Solo Masterpiece',
    momentDescription: 'Equalized Pelé as all-time top scorer with a jaw-dropping extra-time slalom goal.',
    playStylePlus: INTL_PLAYSTYLES.technical_plus,
    playStyles: [
      INTL_PLAYSTYLES.technical_plus,
      INTL_PLAYSTYLES.quick_step,
      INTL_PLAYSTYLES.finesse_shot,
    ],
    stats: { pac: 96, sho: 89, pas: 95, dri: 93, def: 46, phy: 73 },
    weakFoot: 5,
    skillMoves: 5,
    workRate: 'H/M',
    price: 240000,
    isCustom: true,
  },
  {
    id: 'intl-kaka',
    name: 'Kaká',
    shortName: 'Kaká',
    rating: 93,
    position: 'CAM',
    nation: 'Brazil',
    nationFlag: '🇧🇷',
    club: 'AC Milan',
    league: 'Serie A',
    rarity: 'international_moments',
    cardStyle: 'intl_moments_gold',
    program: 'International Moments',
    federationCrest: 'CBF',
    tournamentEmblem: '🏆',
    momentTitle: '2005 Confederations Cup Missile vs Argentina',
    momentDescription: 'Scored a 30-yard thunderous screamer to claim the international trophy in Frankfurt.',
    playStylePlus: INTL_PLAYSTYLES.technical_plus,
    playStyles: [
      INTL_PLAYSTYLES.technical_plus,
      INTL_PLAYSTYLES.rapid_plus,
      INTL_PLAYSTYLES.finesse_shot,
    ],
    stats: { pac: 95, sho: 93, pas: 91, dri: 98, def: 67, phy: 74 },
    weakFoot: 4,
    skillMoves: 5,
    workRate: 'H/M',
    price: 210000,
    isCustom: true,
  },
  {
    id: 'intl-rivaldo',
    name: 'Rivaldo',
    shortName: 'Rivaldo',
    rating: 93,
    position: 'LW',
    nation: 'Brazil',
    nationFlag: '🇧🇷',
    club: 'FC Barcelona',
    league: 'LaLiga',
    rarity: 'international_moments',
    cardStyle: 'intl_moments_gold',
    program: 'International Moments',
    federationCrest: 'CBF',
    tournamentEmblem: '🏆',
    momentTitle: '2002 World Cup Knockout Strike Run',
    momentDescription: 'Scored in 5 consecutive tournament rounds with deadly left-foot volleys and dummy runs.',
    playStylePlus: INTL_PLAYSTYLES.finesse_shot_plus,
    playStyles: [
      INTL_PLAYSTYLES.finesse_shot_plus,
      INTL_PLAYSTYLES.technical,
      INTL_PLAYSTYLES.acrobatic_plus,
    ],
    stats: { pac: 81, sho: 93, pas: 91, dri: 96, def: 83, phy: 82 },
    weakFoot: 2,
    skillMoves: 5,
    workRate: 'M/L',
    price: 180000,
    isCustom: true,
  },
  {
    id: 'intl-lucio',
    name: 'Lúcio',
    shortName: 'Lúcio',
    rating: 90,
    position: 'CB',
    nation: 'Brazil',
    nationFlag: '🇧🇷',
    club: 'Inter Milan',
    league: 'Serie A',
    rarity: 'international_moments',
    cardStyle: 'intl_moments_gold',
    program: 'International Moments',
    federationCrest: 'CBF',
    tournamentEmblem: '🏆',
    momentTitle: '2009 Confederations Cup Final Winner Header',
    momentDescription: 'Towered in the 84th minute to score the winning header as captain against USA.',
    playStylePlus: INTL_PLAYSTYLES.anticipate_plus,
    playStyles: [
      INTL_PLAYSTYLES.anticipate_plus,
      INTL_PLAYSTYLES.bruiser,
      INTL_PLAYSTYLES.power_header,
    ],
    stats: { pac: 91, sho: 78, pas: 86, dri: 84, def: 98, phy: 88 },
    weakFoot: 3,
    skillMoves: 3,
    workRate: 'H/H',
    price: 140000,
    isCustom: true,
  },
  {
    id: 'intl-cafu',
    name: 'Cafu',
    shortName: 'Cafu',
    rating: 88,
    position: 'RB',
    nation: 'Brazil',
    nationFlag: '🇧🇷',
    club: 'AC Milan',
    league: 'Serie A',
    rarity: 'international_moments',
    cardStyle: 'intl_moments_gold',
    program: 'International Moments',
    federationCrest: 'CBF',
    tournamentEmblem: '🏆',
    momentTitle: 'Three Consecutive World Cup Finals (1994, 1998, 2002)',
    momentDescription: 'The only footballer in history to play in three straight world finals, lifting the trophy as captain in 2002.',
    playStylePlus: INTL_PLAYSTYLES.whipped_pass_plus,
    playStyles: [
      INTL_PLAYSTYLES.whipped_pass_plus,
      INTL_PLAYSTYLES.quick_step,
      INTL_PLAYSTYLES.relentless_plus,
    ],
    stats: { pac: 98, sho: 75, pas: 90, dri: 87, def: 87, phy: 86 },
    weakFoot: 3,
    skillMoves: 4,
    workRate: 'H/M',
    price: 130000,
    isCustom: true,
  },
];

// -------------------------------------------------------------
// 2. BELGIUM 🇧🇪 (RBFA) - 8 Official International Moments Cards
// -------------------------------------------------------------
export const BELGIUM_MOMENTS_CARDS: SoccerCard[] = [
  {
    id: 'intl-de-bruyne',
    name: 'Kevin De Bruyne',
    shortName: 'De Bruyne',
    rating: 95,
    position: 'CAM',
    nation: 'Belgium',
    nationFlag: '🇧🇪',
    club: 'Manchester City',
    league: 'Premier League',
    rarity: 'international_moments',
    cardStyle: 'intl_moments_gold',
    program: 'International Moments',
    federationCrest: 'RBFA',
    tournamentEmblem: '🏆',
    momentTitle: '2018 Kazan Masterclass vs Brazil',
    momentDescription: 'Delivered a thunderous 25-yard drive past Alisson to propel Belgium to the World Cup semifinals.',
    playStylePlus: INTL_PLAYSTYLES.incisive_pass_plus,
    playStyles: [
      INTL_PLAYSTYLES.incisive_pass_plus,
      INTL_PLAYSTYLES.long_ball_pass_plus,
      INTL_PLAYSTYLES.whipped_pass,
    ],
    stats: { pac: 84, sho: 90, pas: 95, dri: 98, def: 85, phy: 95 },
    weakFoot: 5,
    skillMoves: 4,
    workRate: 'H/H',
    price: 340000,
    isCustom: true,
  },
  {
    id: 'intl-hazard',
    name: 'Eden Hazard',
    shortName: 'Hazard',
    rating: 94,
    position: 'LM',
    nation: 'Belgium',
    nationFlag: '🇧🇪',
    club: 'Chelsea',
    league: 'Premier League',
    rarity: 'international_moments',
    cardStyle: 'intl_moments_gold',
    program: 'International Moments',
    federationCrest: 'RBFA',
    tournamentEmblem: '🏆',
    momentTitle: '2018 Silver Ball Tournament Run',
    momentDescription: 'Recorded the highest successful dribble rate in modern tournament history, sealing Bronze against England.',
    playStylePlus: INTL_PLAYSTYLES.technical_plus,
    playStyles: [
      INTL_PLAYSTYLES.technical_plus,
      INTL_PLAYSTYLES.quick_step,
      INTL_PLAYSTYLES.finesse_shot,
    ],
    stats: { pac: 98, sho: 91, pas: 94, dri: 98, def: 48, phy: 82 },
    weakFoot: 4,
    skillMoves: 5,
    workRate: 'H/M',
    price: 270000,
    isCustom: true,
  },
  {
    id: 'intl-courtois',
    name: 'Thibaut Courtois',
    shortName: 'Courtois',
    rating: 94,
    position: 'GK',
    nation: 'Belgium',
    nationFlag: '🇧🇪',
    club: 'Real Madrid',
    league: 'LaLiga',
    rarity: 'international_moments',
    cardStyle: 'intl_moments_gold',
    program: 'International Moments',
    federationCrest: 'RBFA',
    tournamentEmblem: '🏆',
    momentTitle: '2018 Golden Glove Winner in Russia',
    momentDescription: 'Made 27 tournament saves including the iconic fingertip deflection against Neymar in the 94th minute.',
    playStylePlus: INTL_PLAYSTYLES.cat_reflexes_plus,
    playStyles: [
      INTL_PLAYSTYLES.cat_reflexes_plus,
      INTL_PLAYSTYLES.anticipate,
      INTL_PLAYSTYLES.relentless_plus,
    ],
    stats: { pac: 93, sho: 93, pas: 94, dri: 93, def: 72, phy: 97 },
    weakFoot: 3,
    skillMoves: 1,
    workRate: 'M/M',
    price: 250000,
    isCustom: true,
  },
  {
    id: 'intl-preudhomme',
    name: "Michel Preud'homme",
    shortName: "Preud'homme",
    rating: 91,
    position: 'GK',
    nation: 'Belgium',
    nationFlag: '🇧🇪',
    club: 'Mechelen',
    league: 'Pro League',
    rarity: 'international_moments',
    cardStyle: 'intl_moments_gold',
    program: 'International Moments',
    federationCrest: 'RBFA',
    tournamentEmblem: '🏆',
    momentTitle: '1994 Lev Yashin Award Winner in USA',
    momentDescription: 'Produced an impenetrable performance against Netherlands and Morocco to capture the tournament goalkeeping crown.',
    playStylePlus: INTL_PLAYSTYLES.cat_reflexes_plus,
    playStyles: [
      INTL_PLAYSTYLES.cat_reflexes_plus,
      INTL_PLAYSTYLES.anticipate,
      INTL_PLAYSTYLES.bruiser,
    ],
    stats: { pac: 95, sho: 91, pas: 83, dri: 93, def: 62, phy: 90 },
    weakFoot: 3,
    skillMoves: 1,
    workRate: 'M/M',
    price: 160000,
    isCustom: true,
  },
  {
    id: 'intl-mertens',
    name: 'Dries Mertens',
    shortName: 'Mertens',
    rating: 92,
    position: 'ST',
    nation: 'Belgium',
    nationFlag: '🇧🇪',
    club: 'Napoli',
    league: 'Serie A',
    rarity: 'international_moments',
    cardStyle: 'intl_moments_gold',
    program: 'International Moments',
    federationCrest: 'RBFA',
    tournamentEmblem: '🏆',
    momentTitle: '2018 World Cup Opener Volley vs Panama',
    momentDescription: 'Struck an uncatchable dipping drop volley from an acute angle in Sochi to open Belgium campaign.',
    playStylePlus: INTL_PLAYSTYLES.finesse_shot_plus,
    playStyles: [
      INTL_PLAYSTYLES.finesse_shot_plus,
      INTL_PLAYSTYLES.acrobatic_plus,
      INTL_PLAYSTYLES.quick_step,
    ],
    stats: { pac: 89, sho: 96, pas: 92, dri: 93, def: 40, phy: 75 },
    weakFoot: 4,
    skillMoves: 4,
    workRate: 'H/L',
    price: 190000,
    isCustom: true,
  },
  {
    id: 'intl-doku',
    name: 'Jérémy Doku',
    shortName: 'Doku',
    rating: 92,
    position: 'LW',
    nation: 'Belgium',
    nationFlag: '🇧🇪',
    club: 'Manchester City',
    league: 'Premier League',
    rarity: 'international_moments',
    cardStyle: 'intl_moments_gold',
    program: 'International Moments',
    federationCrest: 'RBFA',
    tournamentEmblem: '🏆',
    momentTitle: 'Euro Quarterfinal Touchline Blitz vs Italy',
    momentDescription: 'Won a penalty and completed 8 successful take-ons against the eventual champions in Munich.',
    playStylePlus: INTL_PLAYSTYLES.quick_step_plus,
    playStyles: [
      INTL_PLAYSTYLES.quick_step_plus,
      INTL_PLAYSTYLES.trickster,
      INTL_PLAYSTYLES.rapid_plus,
    ],
    stats: { pac: 91, sho: 94, pas: 90, dri: 97, def: 41, phy: 82 },
    weakFoot: 4,
    skillMoves: 5,
    workRate: 'H/M',
    price: 185000,
    isCustom: true,
  },
  {
    id: 'intl-lukaku',
    name: 'Romelu Lukaku',
    shortName: 'Lukaku',
    rating: 90,
    position: 'ST',
    nation: 'Belgium',
    nationFlag: '🇧🇪',
    club: 'Roma',
    league: 'Serie A',
    rarity: 'international_moments',
    cardStyle: 'intl_moments_gold',
    program: 'International Moments',
    federationCrest: 'RBFA',
    tournamentEmblem: '🏆',
    momentTitle: '2018 Rostov Comeback Dummy vs Japan',
    momentDescription: 'Executed the legendary step-over dummy in the 94th minute allowing Chadli to tap in the counter-attack winner.',
    playStylePlus: INTL_PLAYSTYLES.bruiser_plus,
    playStyles: [
      INTL_PLAYSTYLES.bruiser_plus,
      INTL_PLAYSTYLES.power_header_plus,
      INTL_PLAYSTYLES.press_proven,
    ],
    stats: { pac: 89, sho: 90, pas: 91, dri: 93, def: 47, phy: 97 },
    weakFoot: 4,
    skillMoves: 3,
    workRate: 'H/M',
    price: 145000,
    isCustom: true,
  },
  {
    id: 'intl-kompany',
    name: 'Vincent Kompany',
    shortName: 'Kompany',
    rating: 88,
    position: 'CB',
    nation: 'Belgium',
    nationFlag: '🇧🇪',
    club: 'Manchester City',
    league: 'Premier League',
    rarity: 'international_moments',
    cardStyle: 'intl_moments_gold',
    program: 'International Moments',
    federationCrest: 'RBFA',
    tournamentEmblem: '🏆',
    momentTitle: '2018 Quarterfinal Corner Assist & Defensive Lockout',
    momentDescription: 'Captained Belgium through their greatest tournament finish with authoritative tackles and aerial command.',
    playStylePlus: INTL_PLAYSTYLES.bruiser_plus,
    playStyles: [
      INTL_PLAYSTYLES.bruiser_plus,
      INTL_PLAYSTYLES.power_header,
      INTL_PLAYSTYLES.anticipate,
    ],
    stats: { pac: 90, sho: 74, pas: 84, dri: 81, def: 97, phy: 89 },
    weakFoot: 3,
    skillMoves: 3,
    workRate: 'M/H',
    price: 135000,
    isCustom: true,
  },
];

// -------------------------------------------------------------
// 3. ARGENTINA 🇦🇷 (AFA) - 8 Official International Moments Cards
// -------------------------------------------------------------
export const ARGENTINA_MOMENTS_CARDS: SoccerCard[] = [
  {
    id: 'intl-maradona',
    name: 'Diego Maradona',
    shortName: 'Maradona',
    rating: 95,
    position: 'CAM',
    nation: 'Argentina',
    nationFlag: '🇦🇷',
    club: 'Napoli',
    league: 'Serie A',
    rarity: 'international_moments',
    cardStyle: 'intl_moments_gold',
    program: 'International Moments',
    federationCrest: 'AFA',
    tournamentEmblem: '🏆',
    momentTitle: '1986 Goal of the Century at Estadio Azteca',
    momentDescription: 'Dribbled past 5 English defenders from the halfway line in 10 seconds to score the greatest solo goal in football lore.',
    playStylePlus: INTL_PLAYSTYLES.technical_plus,
    playStyles: [
      INTL_PLAYSTYLES.technical_plus,
      INTL_PLAYSTYLES.trickster,
      INTL_PLAYSTYLES.finesse_shot,
    ],
    stats: { pac: 90, sho: 91, pas: 91, dri: 96, def: 40, phy: 77 },
    weakFoot: 4,
    skillMoves: 5,
    workRate: 'H/M',
    price: 360000,
    isCustom: true,
  },
  {
    id: 'intl-messi',
    name: 'Lionel Messi',
    shortName: 'Messi',
    rating: 93,
    position: 'ST',
    nation: 'Argentina',
    nationFlag: '🇦🇷',
    club: 'Inter Miami',
    league: 'MLS',
    rarity: 'international_moments',
    cardStyle: 'intl_moments_gold',
    program: 'International Moments',
    federationCrest: 'AFA',
    tournamentEmblem: '🏆',
    momentTitle: '2022 Lusail World Cup Final Coronation',
    momentDescription: 'Scored twice and converted his penalty to fulfill destiny and lift the World Cup trophy for La Albiceleste.',
    playStylePlus: INTL_PLAYSTYLES.incisive_pass_plus,
    playStyles: [
      INTL_PLAYSTYLES.incisive_pass_plus,
      INTL_PLAYSTYLES.finesse_shot_plus,
      INTL_PLAYSTYLES.technical,
    ],
    stats: { pac: 90, sho: 88, pas: 94, dri: 93, def: 40, phy: 70 },
    weakFoot: 4,
    skillMoves: 4,
    workRate: 'M/L',
    price: 290000,
    isCustom: true,
  },
  {
    id: 'intl-de-paul',
    name: 'Rodrigo De Paul',
    shortName: 'De Paul',
    rating: 92,
    position: 'CM',
    nation: 'Argentina',
    nationFlag: '🇦🇷',
    club: 'Atlético de Madrid',
    league: 'LaLiga',
    rarity: 'international_moments',
    cardStyle: 'intl_moments_gold',
    program: 'International Moments',
    federationCrest: 'AFA',
    tournamentEmblem: '🏆',
    momentTitle: '2021 Maracanã Copa Final Assist & Defensive Engine',
    momentDescription: 'Delivered the laser 40-yard assist to Di María and covered 13km to end a 28-year senior trophy drought.',
    playStylePlus: INTL_PLAYSTYLES.relentless_plus,
    playStyles: [
      INTL_PLAYSTYLES.relentless_plus,
      INTL_PLAYSTYLES.bruiser,
      INTL_PLAYSTYLES.long_ball_pass_plus,
    ],
    stats: { pac: 91, sho: 92, pas: 93, dri: 92, def: 78, phy: 87 },
    weakFoot: 3,
    skillMoves: 3,
    workRate: 'H/H',
    price: 210000,
    isCustom: true,
  },
  {
    id: 'intl-enzo',
    name: 'Enzo Fernández',
    shortName: 'Enzo',
    rating: 90,
    position: 'CM',
    nation: 'Argentina',
    nationFlag: '🇦🇷',
    club: 'Chelsea',
    league: 'Premier League',
    rarity: 'international_moments',
    cardStyle: 'intl_moments_gold',
    program: 'International Moments',
    federationCrest: 'AFA',
    tournamentEmblem: '🏆',
    momentTitle: '2022 World Cup Young Player of the Tournament',
    momentDescription: 'Curled an iconic upper-90 clincher against Mexico after step-overs, orchestrating the midfield run to gold.',
    playStylePlus: INTL_PLAYSTYLES.long_ball_pass_plus,
    playStyles: [
      INTL_PLAYSTYLES.long_ball_pass_plus,
      INTL_PLAYSTYLES.incisive_pass,
      INTL_PLAYSTYLES.finesse_shot,
    ],
    stats: { pac: 86, sho: 84, pas: 89, dri: 90, def: 85, phy: 91 },
    weakFoot: 4,
    skillMoves: 3,
    workRate: 'H/H',
    price: 175000,
    isCustom: true,
  },
  {
    id: 'intl-lautaro',
    name: 'Lautaro Martínez',
    shortName: 'Lautaro',
    rating: 89,
    position: 'ST',
    nation: 'Argentina',
    nationFlag: '🇦🇷',
    club: 'Inter Milan',
    league: 'Serie A',
    rarity: 'international_moments',
    cardStyle: 'intl_moments_gold',
    program: 'International Moments',
    federationCrest: 'AFA',
    tournamentEmblem: '🏆',
    momentTitle: '2024 Copa América Final Extra-Time Winner',
    momentDescription: 'Blasted an extra-time 112th-minute winner in Miami to secure the Golden Boot and back-to-back continental crowns.',
    playStylePlus: INTL_PLAYSTYLES.poacher_plus,
    playStyles: [
      INTL_PLAYSTYLES.poacher_plus,
      INTL_PLAYSTYLES.press_proven,
      INTL_PLAYSTYLES.finesse_shot,
    ],
    stats: { pac: 92, sho: 90, pas: 76, dri: 89, def: 53, phy: 88 },
    weakFoot: 4,
    skillMoves: 4,
    workRate: 'H/M',
    price: 155000,
    isCustom: true,
  },
  {
    id: 'intl-ruggeri',
    name: 'Oscar Ruggeri',
    shortName: 'Ruggeri',
    rating: 89,
    position: 'CB',
    nation: 'Argentina',
    nationFlag: '🇦🇷',
    club: 'River Plate',
    league: 'Primera División',
    rarity: 'international_moments',
    cardStyle: 'intl_moments_gold',
    program: 'International Moments',
    federationCrest: 'AFA',
    tournamentEmblem: '🏆',
    momentTitle: '1986 World Cup Champion Backline Rock',
    momentDescription: 'Conceded only one goal in the entire knockout stage, anchoring Bilardo’s 3-5-2 fortress.',
    playStylePlus: INTL_PLAYSTYLES.bruiser_plus,
    playStyles: [
      INTL_PLAYSTYLES.bruiser_plus,
      INTL_PLAYSTYLES.anticipate,
      INTL_PLAYSTYLES.power_header,
    ],
    stats: { pac: 78, sho: 74, pas: 80, dri: 81, def: 92, phy: 87 },
    weakFoot: 3,
    skillMoves: 2,
    workRate: 'M/H',
    price: 140000,
    isCustom: true,
  },
  {
    id: 'intl-alvarez',
    name: 'Julián Alvarez',
    shortName: 'Alvarez',
    rating: 87,
    position: 'ST',
    nation: 'Argentina',
    nationFlag: '🇦🇷',
    club: 'Atlético de Madrid',
    league: 'LaLiga',
    rarity: 'international_moments',
    cardStyle: 'intl_moments_gold',
    program: 'International Moments',
    federationCrest: 'AFA',
    tournamentEmblem: '🏆',
    momentTitle: '2022 Semifinal Half-Pitch Solo vs Croatia',
    momentDescription: 'Raced 60 meters through two bouncing challenges to score one of the World Cup semifinals iconic goals.',
    playStylePlus: INTL_PLAYSTYLES.press_proven_plus,
    playStyles: [
      INTL_PLAYSTYLES.press_proven_plus,
      INTL_PLAYSTYLES.quick_step,
      INTL_PLAYSTYLES.relentless_plus,
    ],
    stats: { pac: 86, sho: 88, pas: 84, dri: 92, def: 62, phy: 83 },
    weakFoot: 4,
    skillMoves: 4,
    workRate: 'H/H',
    price: 120000,
    isCustom: true,
  },
  {
    id: 'intl-icardi',
    name: 'Mauro Icardi',
    shortName: 'Icardi',
    rating: 87,
    position: 'ST',
    nation: 'Argentina',
    nationFlag: '🇦🇷',
    club: 'Galatasaray',
    league: 'Süper Lig',
    rarity: 'international_moments',
    cardStyle: 'intl_moments_gold',
    program: 'International Moments',
    federationCrest: 'AFA',
    tournamentEmblem: '🏆',
    momentTitle: '2018 Mexico Clash 71st-Second Strike in Mendoza',
    momentDescription: 'Outpaced two center-backs to blast home his debut international goal in 71 seconds.',
    playStylePlus: INTL_PLAYSTYLES.acrobatic_plus,
    playStyles: [
      INTL_PLAYSTYLES.acrobatic_plus,
      INTL_PLAYSTYLES.power_header,
      INTL_PLAYSTYLES.poacher_plus,
    ],
    stats: { pac: 86, sho: 88, pas: 78, dri: 84, def: 45, phy: 80 },
    weakFoot: 4,
    skillMoves: 3,
    workRate: 'M/L',
    price: 110000,
    isCustom: true,
  },
];

// Pre-render full card SVGs for all 24 cards
export const ALL_INTERNATIONAL_MOMENTS_CARDS: SoccerCard[] = [
  ...BRAZIL_MOMENTS_CARDS,
  ...BELGIUM_MOMENTS_CARDS,
  ...ARGENTINA_MOMENTS_CARDS,
].map(c => ({
  ...c,
  fullCardImage: generateInternationalMomentsCardSvg(c),
}));

export const INTERNATIONAL_MOMENTS_CARDS = ALL_INTERNATIONAL_MOMENTS_CARDS;
