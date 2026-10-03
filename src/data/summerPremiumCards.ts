import { SoccerCard, Position, PlayStylePlusBadge } from '../types/card';
import { generateUserCardSvg, PLAYSTYLE_PRESETS } from './cardSvgGenerator';

/**
 * RAW SUMMER PREMIUM ROSTER
 * Strictly follows user specifications:
 * [id, name, shortName, rating (97-99 strictly), pos, nation, flag, transferredClub, league, pac, sho, pas, dri, def, phy, psKey, price]
 */
type RawSummerPremiumTuple = [
  string, // id
  string, // name
  string, // shortName
  number, // rating
  Position, // pos
  string, // nation
  string, // flag
  string, // club
  string, // league
  number, // pac
  number, // sho
  number, // pas
  number, // dri
  number, // def
  number, // phy
  string, // psKey
  number  // price
];

const RAW_SUMMER_PREMIUM_ROSTER: RawSummerPremiumTuple[] = [
  // 1-10
  ['summer-prem-akliouche-99', 'Maghnes Akliouche', 'Akliouche', 99, 'CAM', 'France', '🇫🇷', 'Paris Saint-Germain', 'Ligue 1', 97, 98, 99, 99, 72, 90, 'finesse_shot', 3850000],
  ['summer-prem-alajbegovic-99', 'Kerim Alajbegović', 'Alajbegović', 99, 'LW', 'Bosnia and Herzegovina', '🇧🇦', 'Juventus', 'Serie A', 99, 97, 96, 99, 60, 92, 'rapid', 3800000],
  ['summer-prem-almada-99', 'Thiago Almada', 'Almada', 99, 'CAM', 'Argentina', '🇦🇷', 'River Plate', 'Primera División', 98, 97, 99, 99, 68, 88, 'finesse_shot', 3750000],
  ['summer-prem-araujo-99', 'Ronald Araújo', 'Araújo', 99, 'CB', 'Uruguay', '🇺🇾', 'Liverpool', 'Premier League', 96, 68, 88, 90, 99, 99, 'bruiser', 3900000],
  ['summer-prem-aubameyang-97', 'Pierre-Emerick Aubameyang', 'Aubameyang', 97, 'ST', 'Gabon', '🇬🇦', 'Deportivo La Coruña', 'La Liga 2', 98, 97, 90, 95, 48, 88, 'quick_step', 1850000],
  ['summer-prem-barco-99', 'Valentín Barco', 'Barco', 99, 'LB', 'Argentina', '🇦🇷', 'Chelsea', 'Premier League', 98, 92, 99, 98, 96, 94, 'whipped_pass', 3700000],
  ['summer-prem-barcola-99', 'Bradley Barcola', 'Barcola', 99, 'LW', 'France', '🇫🇷', 'Liverpool', 'Premier League', 99, 97, 96, 99, 58, 90, 'rapid', 3950000],
  ['summer-prem-berhalter-99', 'Sebastian Berhalter', 'Berhalter', 99, 'CM', 'USA', '🇺🇸', 'Middlesbrough', 'Championship', 95, 94, 99, 97, 95, 96, 'dead_ball', 3600000],
  ['summer-prem-bernardo-silva-98', 'Bernardo Silva', 'Bernardo Silva', 98, 'CM', 'Portugal', '🇵🇹', 'Real Madrid', 'La Liga', 93, 94, 99, 99, 84, 88, 'finesse_shot', 2900000],
  ['summer-prem-bruno-guimaraes-99', 'Bruno Guimarães', 'Bruno Guimarães', 99, 'CM', 'Brazil', '🇧🇷', 'Arsenal', 'Premier League', 94, 95, 99, 98, 96, 98, 'anticipate', 3850000],

  // 11-20
  ['summer-prem-bouaddi-99', 'Ayyoub Bouaddi', 'Bouaddi', 99, 'CM', 'France', '🇫🇷', 'Manchester City', 'Premier League', 95, 93, 99, 98, 96, 95, 'anticipate', 3800000],
  ['summer-prem-casemiro-98', 'Casemiro', 'Casemiro', 98, 'CDM', 'Brazil', '🇧🇷', 'Inter Miami', 'MLS', 90, 92, 95, 93, 99, 99, 'bruiser', 2750000],
  ['summer-prem-david-99', 'Jonathan David', 'David', 99, 'ST', 'Canada', '🇨🇦', 'Atlético Madrid', 'La Liga', 99, 99, 94, 98, 56, 96, 'quick_step', 3850000],
  ['summer-prem-dedic-98', 'Amar Dedić', 'Dedić', 98, 'RB', 'Bosnia and Herzegovina', '🇧🇦', 'Newcastle United', 'Premier League', 98, 85, 94, 96, 96, 95, 'quick_step', 2600000],
  ['summer-prem-digne-99', 'Lucas Digne', 'Digne', 99, 'LB', 'France', '🇫🇷', 'Paris Saint-Germain', 'Ligue 1', 97, 90, 99, 96, 97, 95, 'whipped_pass', 3750000],
  ['summer-prem-diaby-99', 'Moussa Diaby', 'Diaby', 99, 'RW', 'France', '🇫🇷', 'Bayer Leverkusen', 'Bundesliga', 99, 97, 96, 99, 54, 88, 'quick_step', 3850000],
  ['summer-prem-diop-99', 'Issa Diop', 'Diop', 99, 'CB', 'France', '🇫🇷', 'Ipswich Town', 'Premier League', 94, 55, 88, 90, 99, 99, 'bruiser', 3650000],
  ['summer-prem-dragojevic-99', 'Marko Dragojević', 'Dragojević', 99, 'GK', 'Montenegro', '🇲🇪', 'Rangers', 'Scottish Premiership', 99, 98, 97, 99, 76, 99, 'cat_reflexes', 3600000],
  ['summer-prem-dumfries-98', 'Denzel Dumfries', 'Dumfries', 98, 'RB', 'Netherlands', '🇳🇱', 'Real Madrid', 'La Liga', 97, 88, 93, 95, 97, 99, 'bruiser', 2850000],
  ['summer-prem-embolo-99', 'Breel Embolo', 'Embolo', 99, 'ST', 'Switzerland', '🇨🇭', 'Atlanta United', 'MLS', 98, 98, 92, 97, 60, 99, 'bruiser', 3700000],

  // 21-30
  ['summer-prem-fatawu-99', 'Abdul Fatawu', 'Fatawu', 99, 'RW', 'Ghana', '🇬🇭', 'Ipswich Town', 'Premier League', 99, 97, 95, 99, 60, 92, 'rapid', 3800000],
  ['summer-prem-fernandez-99', 'Enzo Fernández', 'Fernández', 99, 'CM', 'Argentina', '🇦🇷', 'Manchester City', 'Premier League', 94, 96, 99, 98, 94, 96, 'whipped_pass', 3900000],
  ['summer-prem-ferran-torres-99', 'Ferran Torres', 'Ferran Torres', 99, 'LW', 'Spain', '🇪🇸', 'Paris Saint-Germain', 'Ligue 1', 98, 98, 96, 98, 60, 92, 'finesse_shot', 3850000],
  ['summer-prem-fortounis-99', 'Konstantinos Fortounis', 'Fortounis', 99, 'CAM', 'Greece', '🇬🇷', 'Olympiacos', 'Super League Greece', 96, 97, 99, 98, 64, 90, 'dead_ball', 3650000],
  ['summer-prem-jesus-99', 'Gabriel Jesus', 'Gabriel Jesus', 99, 'ST', 'Brazil', '🇧🇷', 'FC Barcelona', 'La Liga', 98, 98, 96, 99, 62, 94, 'finesse_shot', 3900000],
  ['summer-prem-geertruida-97', 'Lutsharel Geertruida', 'Geertruida', 97, 'RB', 'Netherlands', '🇳🇱', 'PSV Eindhoven', 'Eredivisie', 94, 80, 92, 93, 96, 97, 'anticipate', 1750000],
  ['summer-prem-godts-99', 'Mika Godts', 'Godts', 99, 'LW', 'Belgium', '🇧🇪', 'Paris Saint-Germain', 'Ligue 1', 99, 96, 96, 99, 54, 88, 'rapid', 3800000],
  ['summer-prem-goncalo-ramos-99', 'Gonçalo Ramos', 'Gonçalo Ramos', 99, 'ST', 'Portugal', '🇵🇹', 'AC Milan', 'Serie A', 98, 99, 93, 97, 60, 97, 'bruiser', 3850000],
  ['summer-prem-gordon-99', 'Anthony Gordon', 'Gordon', 99, 'LW', 'England', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'FC Barcelona', 'La Liga', 99, 97, 95, 99, 66, 93, 'rapid', 3950000],
  ['summer-prem-goretzka-99', 'Leon Goretzka', 'Goretzka', 99, 'CM', 'Germany', '🇩🇪', 'Aston Villa', 'Premier League', 95, 97, 98, 97, 96, 99, 'bruiser', 3900000],

  // 31-40
  ['summer-prem-griezmann-99', 'Antoine Griezmann', 'Griezmann', 99, 'ST', 'France', '🇫🇷', 'Orlando City', 'MLS', 98, 99, 99, 99, 80, 90, 'finesse_shot', 3950000],
  ['summer-prem-grimaldo-97', 'Álex Grimaldo', 'Grimaldo', 97, 'LWB', 'Spain', '🇪🇸', 'Atlético Madrid', 'La Liga', 95, 93, 98, 96, 90, 86, 'whipped_pass', 1850000],
  ['summer-prem-hackney-99', 'Hayden Hackney', 'Hackney', 99, 'CM', 'England', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Everton', 'Premier League', 95, 94, 99, 97, 94, 96, 'relentless', 3700000],
  ['summer-prem-herrington-98', 'Lucas Herrington', 'Herrington', 98, 'CB', 'Australia', '🇦🇺', 'Hull City', 'Championship', 94, 55, 88, 90, 98, 97, 'anticipate', 2800000],
  ['summer-prem-hwang-in-beom-97', 'Hwang In-Beom', 'Hwang In-Beom', 97, 'CM', 'South Korea', '🇰🇷', 'FC Porto', 'Liga Portugal', 93, 92, 98, 96, 91, 92, 'whipped_pass', 1700000],
  ['summer-prem-inao-oulai-98', 'Christ Inao Oulaï', 'Inao Oulaï', 98, 'CB', 'Ivory Coast', '🇨🇮', 'Fiorentina', 'Serie A', 94, 55, 88, 90, 98, 99, 'bruiser', 2650000],
  ['summer-prem-jackson-99', 'Nicolas Jackson', 'Jackson', 99, 'ST', 'Senegal', '🇸🇳', 'Aston Villa', 'Premier League', 99, 98, 93, 98, 58, 96, 'quick_step', 3850000],
  ['summer-prem-jimenez-98', 'Raúl Jiménez', 'Jiménez', 98, 'ST', 'Mexico', '🇲🇽', 'Wolves', 'Premier League', 95, 98, 93, 96, 60, 98, 'finesse_shot', 2700000],
  ['summer-prem-koffi-99', 'Hervé Koffi', 'Koffi', 99, 'GK', 'Burkina Faso', '🇧🇫', 'Union Saint-Gilloise', 'Pro League', 99, 98, 96, 99, 76, 98, 'cat_reflexes', 3600000],
  ['summer-prem-kolo-muani-99', 'Randal Kolo Muani', 'Kolo Muani', 99, 'ST', 'France', '🇫🇷', 'Juventus', 'Serie A', 99, 98, 94, 99, 60, 95, 'rapid', 3850000],

  // 41-50
  ['summer-prem-konsa-99', 'Ezri Konsa', 'Konsa', 99, 'CB', 'England', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Arsenal', 'Premier League', 95, 58, 90, 92, 99, 99, 'anticipate', 3850000],
  ['summer-prem-lacroix-99', 'Maxence Lacroix', 'Lacroix', 99, 'CB', 'France', '🇫🇷', 'Chelsea', 'Premier League', 98, 54, 88, 91, 99, 99, 'anticipate', 3900000],
  ['summer-prem-lee-kang-in-99', 'Lee Kang-In', 'Lee Kang-In', 99, 'CAM', 'South Korea', '🇰🇷', 'Atlético Madrid', 'La Liga', 97, 97, 99, 99, 70, 90, 'finesse_shot', 3850000],
  ['summer-prem-lewandowski-99', 'Robert Lewandowski', 'Lewandowski', 99, 'ST', 'Poland', '🇵🇱', 'Chicago Fire', 'MLS', 96, 99, 95, 97, 50, 96, 'finesse_shot', 3950000],
  ['summer-prem-lis-97', 'Mateusz Lis', 'Lis', 97, 'GK', 'Poland', '🇵🇱', 'Lech Poznań', 'Ekstraklasa', 97, 96, 95, 97, 70, 97, 'cat_reflexes', 1550000],
  ['summer-prem-lukaku-99', 'Romelu Lukaku', 'Lukaku', 99, 'ST', 'Belgium', '🇧🇪', 'Fenerbahçe', 'Süper Lig', 97, 99, 91, 96, 56, 99, 'bruiser', 3900000],
  ['summer-prem-maeda-98', 'Daizen Maeda', 'Maeda', 98, 'LW', 'Japan', '🇯🇵', 'Ipswich Town', 'Premier League', 99, 95, 93, 98, 70, 96, 'rapid', 2850000],
  ['summer-prem-makhanya-97', 'Siyabonga Makhanya', 'Makhanya', 97, 'CB', 'South Africa', '🇿🇦', 'Rangers', 'Scottish Premiership', 93, 48, 85, 86, 97, 98, 'bruiser', 1600000],
  ['summer-prem-manzambi-99', 'Johan Manzambi', 'Manzambi', 99, 'CAM', 'Switzerland', '🇨🇭', 'Aston Villa', 'Premier League', 97, 96, 98, 99, 66, 92, 'quick_step', 3750000],
  ['summer-prem-cucurella-98', 'Marc Cucurella', 'Cucurella', 98, 'LB', 'Spain', '🇪🇸', 'Real Madrid', 'La Liga', 97, 82, 95, 96, 98, 97, 'anticipate', 2850000],

  // 51-60
  ['summer-prem-marmoush-99', 'Omar Marmoush', 'Marmoush', 99, 'ST', 'Egypt', '🇪🇬', 'Tottenham Hotspur', 'Premier League', 99, 98, 95, 99, 56, 95, 'rapid', 3950000],
  ['summer-prem-martinez-99', 'Emiliano Martínez', 'Martínez', 99, 'GK', 'Argentina', '🇦🇷', 'Chelsea', 'Premier League', 99, 99, 97, 99, 78, 99, 'cat_reflexes', 3900000],
  ['summer-prem-mastantuono-99', 'Franco Mastantuono', 'Mastantuono', 99, 'CAM', 'Argentina', '🇦🇷', 'Fiorentina', 'Serie A', 98, 97, 99, 99, 64, 90, 'finesse_shot', 3850000],
  ['summer-prem-mbaye-99', 'Ibrahim Mbaye', 'Mbaye', 99, 'RW', 'France', '🇫🇷', 'Aston Villa', 'Premier League', 99, 96, 95, 99, 58, 90, 'rapid', 3800000],
  ['summer-prem-meunier-97', 'Thomas Meunier', 'Meunier', 97, 'RB', 'Belgium', '🇧🇪', 'Sunderland', 'Championship', 92, 85, 93, 91, 96, 98, 'bruiser', 1700000],
  ['summer-prem-muriqi-99', 'Vedat Muriqi', 'Muriqi', 99, 'ST', 'Kosovo', '🇽🇰', 'Fenerbahçe', 'Süper Lig', 94, 98, 92, 95, 58, 99, 'bruiser', 3750000],
  ['summer-prem-ndiaye-99', 'Iliman Ndiaye', 'Ndiaye', 99, 'CAM', 'Senegal', '🇸🇳', 'Manchester City', 'Premier League', 98, 96, 98, 99, 66, 92, 'quick_step', 3850000],
  ['summer-prem-nico-gonzalez-99', 'Nico González', 'Nico González', 99, 'CM', 'Spain', '🇪🇸', 'Newcastle United', 'Premier League', 94, 95, 99, 98, 95, 97, 'anticipate', 3850000],
  ['summer-prem-nkunku-99', 'Christopher Nkunku', 'Nkunku', 99, 'CAM', 'France', '🇫🇷', 'RB Leipzig', 'Bundesliga', 98, 98, 98, 99, 68, 90, 'finesse_shot', 3900000],
  ['summer-prem-openda-98', 'Loïs Openda', 'Openda', 98, 'ST', 'Belgium', '🇧🇪', 'Lyon', 'Ligue 1', 99, 97, 88, 97, 52, 94, 'rapid', 2900000],

  // 61-70
  ['summer-prem-palestra-98', 'Marco Palestra', 'Palestra', 98, 'RWB', 'Italy', '🇮🇹', 'Chelsea', 'Premier League', 98, 84, 94, 96, 96, 95, 'relentless', 2700000],
  ['summer-prem-payne-98', 'Deshane Payne', 'Payne', 98, 'RB', 'Honduras', '🇭🇳', 'CD Olimpia', 'Liga Nacional', 97, 82, 92, 95, 96, 95, 'quick_step', 2600000],
  ['summer-prem-pineda-99', 'Orbelín Pineda', 'Pineda', 99, 'CAM', 'Mexico', '🇲🇽', 'CF Monterrey', 'Liga MX', 97, 96, 98, 99, 68, 89, 'finesse_shot', 3750000],
  ['summer-prem-leao-99', 'Rafael Leão', 'Leão', 99, 'LW', 'Portugal', '🇵🇹', 'Galatasaray', 'Süper Lig', 99, 98, 95, 99, 50, 95, 'rapid', 3950000],
  ['summer-prem-reese-97', 'Fabian Reese', 'Reese', 97, 'LM', 'Germany', '🇩🇪', 'VfL Wolfsburg', 'Bundesliga', 97, 93, 94, 96, 62, 92, 'rapid', 1800000],
  ['summer-prem-reijnders-99', 'Tijjani Reijnders', 'Reijnders', 99, 'CM', 'Netherlands', '🇳🇱', 'Al Qadsiah', 'Saudi Pro League', 96, 95, 99, 98, 94, 95, 'relentless', 3800000],
  ['summer-prem-robertson-98', 'Andy Robertson', 'Robertson', 98, 'LB', 'Scotland', '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'Tottenham Hotspur', 'Premier League', 96, 82, 98, 95, 97, 96, 'whipped_pass', 2900000],
  ['summer-prem-rodri-99', 'Rodri', 'Rodri', 99, 'CDM', 'Spain', '🇪🇸', 'FC Barcelona', 'La Liga', 93, 95, 99, 97, 99, 99, 'anticipate', 3950000],
  ['summer-prem-rogers-99', 'Morgan Rogers', 'Rogers', 99, 'CAM', 'England', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Chelsea', 'Premier League', 97, 97, 98, 99, 68, 94, 'quick_step', 3850000],
  ['summer-prem-romero-99', 'Cristian Romero', 'Romero', 99, 'CB', 'Argentina', '🇦🇷', 'Atlético Madrid', 'La Liga', 95, 62, 88, 90, 99, 99, 'bruiser', 3900000],

  // 71-80
  ['summer-prem-saad-97', 'Sohaib Saad', 'Saad', 97, 'ST', 'Morocco', '🇲🇦', 'Nashville SC', 'MLS', 97, 95, 91, 96, 52, 92, 'quick_step', 1700000],
  ['summer-prem-saibari-99', 'Ismaël Saibari', 'Saibari', 99, 'CM', 'Morocco', '🇲🇦', 'Bayern Munich', 'Bundesliga', 96, 96, 99, 98, 90, 96, 'finesse_shot', 3850000],
  ['summer-prem-saint-maximin-97', 'Allan Saint-Maximin', 'Saint-Maximin', 97, 'LW', 'France', '🇫🇷', 'Charlotte FC', 'MLS', 99, 92, 92, 99, 44, 86, 'trickster', 1900000],
  ['summer-prem-salah-99', 'Mohamed Salah', 'Salah', 99, 'RW', 'Egypt', '🇪🇬', 'Trabzonspor', 'Süper Lig', 99, 99, 97, 99, 58, 92, 'finesse_shot', 3950000],
  ['summer-prem-sangare-99', 'Ibrahim Sangaré', 'Sangaré', 99, 'CDM', 'Ivory Coast', '🇨🇮', 'Brentford', 'Premier League', 92, 86, 94, 93, 99, 99, 'bruiser', 3800000],
  ['summer-prem-sano-99', 'Kodai Sano', 'Sano', 99, 'CM', 'Japan', '🇯🇵', 'PSV Eindhoven', 'Eredivisie', 95, 93, 99, 97, 94, 95, 'relentless', 3750000],
  ['summer-prem-schlager-99', 'Xaver Schlager', 'Schlager', 99, 'CM', 'Austria', '🇦🇹', 'Nottingham Forest', 'Premier League', 94, 94, 98, 97, 96, 98, 'anticipate', 3800000],
  ['summer-prem-sow-99', 'Djibril Sow', 'Sow', 99, 'CM', 'Switzerland', '🇨🇭', 'Genoa', 'Serie A', 95, 93, 98, 97, 95, 96, 'relentless', 3700000],
  ['summer-prem-spence-99', 'Djed Spence', 'Spence', 99, 'RB', 'England', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Inter Milan', 'Serie A', 99, 86, 94, 98, 96, 96, 'rapid', 3850000],
  ['summer-prem-stones-99', 'John Stones', 'Stones', 99, 'CB', 'England', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Inter Milan', 'Serie A', 94, 76, 96, 96, 99, 98, 'anticipate', 3900000],

  // 81-90
  ['summer-prem-stroud-99', 'Jack Stroud', 'Stroud', 99, 'RM', 'England', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Hull City', 'Championship', 98, 96, 96, 98, 64, 92, 'quick_step', 3650000],
  ['summer-prem-summerville-99', 'Crysencio Summerville', 'Summerville', 99, 'LW', 'Netherlands', '🇳🇱', 'Al Hilal', 'Saudi Pro League', 99, 97, 95, 99, 52, 88, 'rapid', 3850000],
  ['summer-prem-suzuki-99', 'Zion Suzuki', 'Suzuki', 99, 'GK', 'Japan', '🇯🇵', 'Aston Villa', 'Premier League', 99, 98, 97, 99, 74, 99, 'cat_reflexes', 3750000],
  ['summer-prem-tabakovic-98', 'Haris Tabaković', 'Tabaković', 98, 'ST', 'Bosnia and Herzegovina', '🇧🇦', 'RB Salzburg', 'Austrian Bundesliga', 95, 98, 88, 94, 52, 99, 'bruiser', 2700000],
  ['summer-prem-tielemans-99', 'Youri Tielemans', 'Tielemans', 99, 'CM', 'Belgium', '🇧🇪', 'Manchester United', 'Premier League', 93, 97, 99, 98, 92, 94, 'finesse_shot', 3900000],
  ['summer-prem-trippier-97', 'Kieran Trippier', 'Trippier', 97, 'RB', 'England', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Wolves', 'Premier League', 93, 85, 98, 92, 95, 91, 'whipped_pass', 1800000],
  ['summer-prem-trossard-99', 'Leandro Trossard', 'Trossard', 99, 'LW', 'Belgium', '🇧🇪', 'Beşiktaş', 'Süper Lig', 97, 98, 98, 99, 62, 88, 'finesse_shot', 3850000],
  ['summer-prem-tzolis-97', 'Christos Tzolis', 'Tzolis', 97, 'LW', 'Greece', '🇬🇷', 'Arsenal', 'Premier League', 98, 96, 92, 97, 50, 88, 'rapid', 1850000],
  ['summer-prem-veerman-99', 'Joey Veerman', 'Veerman', 99, 'CM', 'Netherlands', '🇳🇱', 'Borussia Dortmund', 'Bundesliga', 92, 94, 99, 97, 94, 95, 'whipped_pass', 3850000],
  ['summer-prem-vozinha-99', 'Vozinha', 'Vozinha', 99, 'GK', 'Cape Verde', '🇨🇻', 'Colo-Colo', 'Primera División', 99, 97, 96, 99, 74, 98, 'cat_reflexes', 3600000],

  // 91-97
  ['summer-prem-vuskovic-99', 'Luka Vušković', 'Vušković', 99, 'CB', 'Croatia', '🇭🇷', 'Brighton', 'Premier League', 95, 68, 88, 90, 99, 99, 'bruiser', 3850000],
  ['summer-prem-watkins-99', 'Ollie Watkins', 'Watkins', 99, 'ST', 'England', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Al Hilal', 'Saudi Pro League', 99, 99, 94, 98, 58, 96, 'quick_step', 3950000],
  ['summer-prem-welbeck-97', 'Danny Welbeck', 'Welbeck', 97, 'ST', 'England', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Chelsea', 'Premier League', 95, 96, 92, 95, 56, 95, 'bruiser', 1700000],
  ['summer-prem-wimmer-97', 'Patrick Wimmer', 'Wimmer', 97, 'RW', 'Austria', '🇦🇹', 'Hoffenheim', 'Bundesliga', 97, 94, 94, 96, 64, 92, 'rapid', 1750000],
  ['summer-prem-voltemade-99', 'Nick Woltemade', 'Woltemade', 99, 'ST', 'Germany', '🇩🇪', 'Juventus', 'Serie A', 95, 98, 96, 99, 58, 99, 'bruiser', 3850000],
  ['summer-prem-yan-diomande-99', 'Yan Diomande', 'Diomande', 99, 'LW', 'Ivory Coast', '🇨🇮', 'Real Madrid', 'La Liga', 99, 97, 95, 99, 54, 92, 'rapid', 3950000],
  ['summer-prem-zalazar-99', 'Rodrigo Zalazar', 'Zalazar', 99, 'CAM', 'Uruguay', '🇺🇾', 'Sporting CP', 'Liga Portugal', 96, 98, 99, 99, 72, 94, 'dead_ball', 3850000],
];

export const SUMMER_PREMIUM_CARDS: SoccerCard[] = RAW_SUMMER_PREMIUM_ROSTER.map((t) => {
  const [id, name, shortName, rating, pos, nation, flag, club, league, pac, sho, pas, dri, def, phy, psKey, price] = t;
  const playStylePlus = PLAYSTYLE_PRESETS[psKey] || PLAYSTYLE_PRESETS.quick_step;
  const stats = { pac, sho, pas, dri, def, phy };

  // Generate full 644x900 card shield vector matching the uploaded Summer Premium style
  const fullCardImage = generateUserCardSvg(
    shortName,
    rating,
    pos,
    stats,
    flag,
    club.slice(0, 4).toUpperCase(),
    '⚽',
    'summer_premium',
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
    rarity: 'summer_premium',
    cardStyle: 'summer_premium',
    program: 'Summer Premium',
    momentTitle: `Summer Transfer ${rating} Masterclass`,
    momentDescription: `Transferred to ${club} (${league})! Marquee blockbuster Summer item featuring elite ${rating} OVR rating and ${playStylePlus.name} PlayStyle+.`,
    fullCardImage,
    stats,
    weakFoot: 5,
    skillMoves: rating >= 98 ? 5 : 4,
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
