import { SoccerCard, Position } from '../types/card';
import { generateUserCardSvg, PLAYSTYLE_PRESETS } from './cardSvgGenerator';

/**
 * THROWBACK (FLASHBACK) 27-PLAYER DATASET
 * Directly mapped from the user's uploaded throwback card images:
 * [id, name, shortName, rating, pos, nation, flag, club, league, pac, sho, pas, dri, def, phy, psKey, price]
 */
type RawThrowbackTuple = [
  string, // id
  string, // name
  string, // shortName
  number, // rating
  Position, // pos
  string, // nation
  string, // flag
  string, // club
  string, // league
  number, // pac / div
  number, // sho / han
  number, // pas / kic
  number, // dri / ref
  number, // def / spe
  number, // phy / pos
  string, // psKey
  number  // price
];

const RAW_THROWBACK_ROSTER: RawThrowbackTuple[] = [
  // 98 Apex Legends
  ['throwback-messi-98', 'Lionel Messi', 'Messi', 98, 'RW', 'Argentina', '🇦🇷', 'FC Barcelona', 'La Liga', 93, 98, 98, 99, 45, 72, 'finesse_shot', 3600000],
  ['throwback-ronaldo-98', 'Cristiano Ronaldo', 'Ronaldo', 98, 'ST', 'Portugal', '🇵🇹', 'Juventus', 'Serie A', 98, 99, 90, 97, 43, 86, 'finesse_shot', 3600000],

  // 95-94 World Class
  ['throwback-neymar-95', 'Neymar Jr', 'Neymar Jr', 95, 'LW', 'Brazil', '🇧🇷', 'Paris Saint-Germain', 'Ligue 1', 99, 93, 95, 99, 40, 66, 'rapid', 2400000],
  ['throwback-debruyne-94', 'Kevin De Bruyne', 'De Bruyne', 94, 'CAM', 'Belgium', '🇧🇪', 'Manchester City', 'Premier League', 84, 94, 99, 95, 69, 86, 'whipped_pass', 2100000],
  ['throwback-modric-94', 'Luka Modrić', 'Modrić', 94, 'CM', 'Croatia', '🇭🇷', 'Real Madrid', 'La Liga', 80, 82, 95, 96, 78, 72, 'finesse_shot', 2000000],

  // 93-92 Elite Blockbusters
  ['throwback-lewandowski-93', 'Robert Lewandowski', 'Lewandowski', 93, 'ST', 'Poland', '🇵🇱', 'Bayern Munich', 'Bundesliga', 81, 92, 78, 90, 45, 86, 'finesse_shot', 1600000],
  ['throwback-benzema-92', 'Karim Benzema', 'Benzema', 92, 'ST', 'France', '🇫🇷', 'Real Madrid', 'La Liga', 85, 92, 89, 95, 49, 86, 'finesse_shot', 1400000],
  ['throwback-dimaria-92', 'Ángel Di María', 'Di María', 92, 'RW', 'Argentina', '🇦🇷', 'Paris Saint-Germain', 'Ligue 1', 92, 87, 92, 95, 56, 76, 'quick_step', 1350000],
  ['throwback-courtois-92', 'Thibaut Courtois', 'Courtois', 92, 'GK', 'Belgium', '🇧🇪', 'Real Madrid', 'La Liga', 90, 94, 77, 92, 53, 90, 'cat_reflexes', 1250000],
  ['throwback-telles-92', 'Alex Telles', 'Telles', 92, 'LB', 'Brazil', '🇧🇷', 'FC Porto', 'Liga Portugal', 95, 83, 94, 91, 90, 86, 'whipped_pass', 1200000],

  // 91-90 Top Tier
  ['throwback-szczesny-91', 'Wojciech Szczęsny', 'Szczęsny', 91, 'GK', 'Poland', '🇵🇱', 'Arsenal', 'Premier League', 91, 88, 79, 94, 53, 92, 'cat_reflexes', 950000],
  ['throwback-mane-90', 'Sadio Mané', 'Mané', 90, 'LW', 'Senegal', '🇸🇳', 'Liverpool', 'Premier League', 96, 88, 81, 92, 48, 78, 'rapid', 880000],

  // 89 Marquee
  ['throwback-alberto-89', 'Luis Alberto', 'Alberto', 89, 'CM', 'Spain', '🇪🇸', 'Lazio', 'Serie A', 74, 79, 89, 89, 57, 67, 'whipped_pass', 550000],
  ['throwback-griezmann-89', 'Antoine Griezmann', 'Griezmann', 89, 'LW', 'France', '🇫🇷', 'FC Barcelona', 'La Liga', 83, 88, 86, 91, 59, 76, 'finesse_shot', 620000],
  ['throwback-hakimi-89', 'Achraf Hakimi', 'Hakimi', 89, 'RM', 'Morocco', '🇲🇦', 'Borussia Dortmund', 'Bundesliga', 99, 85, 88, 93, 85, 88, 'quick_step', 750000],
  ['throwback-alba-89', 'Jordi Alba', 'Jordi Alba', 89, 'LB', 'Spain', '🇪🇸', 'FC Barcelona', 'La Liga', 95, 74, 86, 88, 84, 78, 'whipped_pass', 580000],
  ['throwback-kante-89', 'N\'Golo Kanté', 'Kanté', 89, 'CDM', 'France', '🇫🇷', 'Chelsea', 'Premier League', 82, 68, 80, 84, 90, 86, 'anticipate', 720000],

  // 88 Solid Anchors
  ['throwback-alonso-88', 'Marcos Alonso', 'Alonso', 88, 'LWB', 'Spain', '🇪🇸', 'Chelsea', 'Premier League', 76, 84, 88, 87, 89, 88, 'dead_ball', 480000],
  ['throwback-delaney-88', 'Thomas Delaney', 'Delaney', 88, 'CDM', 'Denmark', '🇩🇰', 'Borussia Dortmund', 'Bundesliga', 83, 79, 81, 81, 89, 88, 'bruiser', 460000],
  ['throwback-ziyech-88', 'Hakim Ziyech', 'Ziyech', 88, 'CAM', 'Morocco', '🇲🇦', 'Ajax', 'Eredivisie', 86, 81, 92, 89, 56, 72, 'whipped_pass', 520000],

  // 87 Fan Favorites
  ['throwback-arnold-87', 'Trent Alexander-Arnold', 'Alexander-Arnold', 87, 'RB', 'England', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Liverpool', 'Premier League', 86, 71, 89, 83, 85, 76, 'whipped_pass', 450000],
  ['throwback-donnarumma-87', 'Gianluigi Donnarumma', 'Donnarumma', 87, 'GK', 'Italy', '🇮🇹', 'AC Milan', 'Serie A', 93, 84, 77, 93, 52, 84, 'cat_reflexes', 420000],
  ['throwback-gomez-87', 'Alejandro Gómez', 'Gómez', 87, 'CAM', 'Argentina', '🇦🇷', 'Atalanta', 'Serie A', 94, 83, 86, 91, 44, 60, 'quick_step', 410000],
  ['throwback-muller-87', 'Thomas Müller', 'Müller', 87, 'CM', 'Germany', '🇩🇪', 'Bayern Munich', 'Bundesliga', 73, 84, 80, 79, 56, 72, 'relentless', 380000],

  // 86-85 Cult Heroes
  ['throwback-mahrez-86', 'Riyad Mahrez', 'Mahrez', 86, 'RW', 'Algeria', '🇩🇿', 'Manchester City', 'Premier League', 87, 82, 83, 91, 41, 62, 'finesse_shot', 320000],
  ['throwback-trippier-86', 'Kieran Trippier', 'Trippier', 86, 'RB', 'England', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Atlético Madrid', 'La Liga', 90, 79, 87, 82, 84, 78, 'whipped_pass', 310000],
  ['throwback-beek-85', 'Donny van de Beek', 'Beek', 85, 'CDM', 'Netherlands', '🇳🇱', 'Ajax', 'Eredivisie', 77, 84, 82, 84, 76, 84, 'anticipate', 260000],
];

export const THROWBACK_CARDS: SoccerCard[] = RAW_THROWBACK_ROSTER.map((t) => {
  const [id, name, shortName, rating, pos, nation, flag, club, league, pac, sho, pas, dri, def, phy, psKey, price] = t;
  const playStylePlus = PLAYSTYLE_PRESETS[psKey] || PLAYSTYLE_PRESETS.quick_step;
  const stats = { pac, sho, pas, dri, def, phy };

  // Generate the full 644x900 green SVG shield with 3D Flashback sign and FW badge
  const fullCardImage = generateUserCardSvg(
    shortName,
    rating,
    pos,
    stats,
    flag,
    club.slice(0, 4).toUpperCase(),
    '⚽',
    'throwback',
    playStylePlus
  );

  return {
    id,
    name,
    shortName,
    rating,
    position: pos,
    nation,
    nationFlag: flag,
    club,
    league,
    rarity: 'throwback',
    cardStyle: 'throwback',
    program: 'Throwback',
    momentTitle: `Flashback ${club} Masterclass`,
    momentDescription: `Historic Flashback item honoring ${name}'s iconic era at ${club}! Features ${rating} OVR rating with ${playStylePlus.name} PlayStyle+.`,
    fullCardImage,
    stats,
    weakFoot: rating >= 92 ? 5 : 4,
    skillMoves: rating >= 92 ? 5 : 4,
    workRate: pos === 'CB' || pos === 'CDM' ? 'M/H' : 'H/M',
    price,
    playStylePlus,
    playStyles: [
      playStylePlus,
      {
        id: 'relentless',
        name: 'Relentless+',
        shortDesc: 'Stamina preservation & 90th-min clutch performance',
        iconSymbol: '🔋',
        isPlus: true,
        statBoost: { attribute: 'phy', bonus: 10 },
      },
    ],
  };
});
