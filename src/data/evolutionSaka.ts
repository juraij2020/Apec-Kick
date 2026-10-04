import { SoccerCard, Position, CardStats, CardStyle } from '../types/card';
import { generateUserCardSvg, PLAYSTYLE_PRESETS } from './cardSvgGenerator';

export interface EvolutionStage {
  stageIndex: number;
  rating: number;
  position: Position;
  targetStats: CardStats;
  cardStyle: CardStyle;
  stageName: string;
  stageBadge: string;
  lore: string;
}

export const SAKA_EVOLUTION_STAGES: EvolutionStage[] = [
  {
    stageIndex: 0,
    rating: 75,
    position: 'LB',
    targetStats: { pac: 75, sho: 75, pas: 73, dri: 75, def: 64, phy: 63 },
    cardStyle: 'evolution_emerald',
    stageName: 'Academy Debutant',
    stageBadge: '🌱 Stage 1 / 14: Academy Genesis',
    lore: 'Bukayo breaks into the first team dynamic as a tenacious left-back with lightning speed and tactical drive.',
  },
  {
    stageIndex: 1,
    rating: 84,
    position: 'LB',
    targetStats: { pac: 84, sho: 84, pas: 82, dri: 84, def: 73, phy: 72 },
    cardStyle: 'evolution_emerald',
    stageName: 'First-Team Breakthrough',
    stageBadge: '⚡ Stage 2 / 14: Flank General',
    lore: 'Establishing Premier League command, unlocking defensive aggression and rapid transitions along the wing.',
  },
  {
    stageIndex: 2,
    rating: 85,
    position: 'RM',
    targetStats: { pac: 85, sho: 85, pas: 83, dri: 85, def: 74, phy: 73 },
    cardStyle: 'evolution_emerald',
    stageName: 'Midfield Transition',
    stageBadge: '🏃 Stage 3 / 14: Dynamic Wide Man',
    lore: 'Pushed into an attacking midfield role with clinical link-up play, pinpoint crossings, and match-winning runs.',
  },
  {
    stageIndex: 3,
    rating: 86,
    position: 'RW',
    targetStats: { pac: 86, sho: 86, pas: 83, dri: 86, def: 75, phy: 72 },
    cardStyle: 'evolution_emerald',
    stageName: 'Winger Evolution',
    stageBadge: '🎯 Stage 4 / 14: Lethal Inverted Winger',
    lore: 'Settling into his iconic right-wing post: cutting inside with devastating curve and explosive first touches.',
  },
  {
    stageIndex: 4,
    rating: 87,
    position: 'RW',
    targetStats: { pac: 87, sho: 87, pas: 85, dri: 87, def: 76, phy: 75 },
    cardStyle: 'evolution_emerald',
    stageName: 'Starboy Ascendant',
    stageBadge: '✨ Stage 5 / 14: Starboy Presence',
    lore: 'Guiding Arsenal back to title contention with cold-blooded clutch finishes and visionary playmaking.',
  },
  {
    stageIndex: 5,
    rating: 88,
    position: 'RW',
    targetStats: { pac: 88, sho: 88, pas: 86, dri: 88, def: 77, phy: 76 },
    cardStyle: 'evolution_emerald',
    stageName: 'North London Hero',
    stageBadge: '🔥 Stage 6 / 14: Big-Game Decider',
    lore: 'Tormenting backlines week after week with sublime trickery, tight dribbling in crowds, and lethal shooting.',
  },
  {
    stageIndex: 6,
    rating: 89,
    position: 'RW',
    targetStats: { pac: 89, sho: 89, pas: 87, dri: 89, def: 78, phy: 77 },
    cardStyle: 'evolution_emerald',
    stageName: 'International Catalyst',
    stageBadge: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Stage 7 / 14: England Dynamo',
    lore: 'Shining on the grand international stage, orchestrating attacks and lifting entire stadiums with every sprint.',
  },
  {
    stageIndex: 7,
    rating: 90,
    position: 'RW',
    targetStats: { pac: 90, sho: 90, pas: 88, dri: 90, def: 79, phy: 78 },
    cardStyle: 'evolution_emerald',
    stageName: 'World Class Elite',
    stageBadge: '💎 Stage 8 / 14: Elite 90 Milestone',
    lore: 'Entering the stratosphere of 90+ rated legends with peerless technique and relentless stamina.',
  },
  {
    stageIndex: 8,
    rating: 91,
    position: 'RW',
    targetStats: { pac: 91, sho: 91, pas: 89, dri: 91, def: 80, phy: 79 },
    cardStyle: 'evolution_emerald',
    stageName: 'Precision Tactician',
    stageBadge: '📐 Stage 9 / 14: Pinpoint Maestro',
    lore: 'Delivering sublime assists from impossible angles, controlling match tempo through defensive traps.',
  },
  {
    stageIndex: 9,
    rating: 92,
    position: 'RW',
    targetStats: { pac: 92, sho: 92, pas: 90, dri: 92, def: 81, phy: 80 },
    cardStyle: 'evolution_emerald',
    stageName: 'Premier League Juggernaut',
    stageBadge: '🛡️ Stage 10 / 14: Unshakeable Strength',
    lore: 'Bulletproof physical shielding and electrifying bursts make Bukayo an unstoppable offensive threat.',
  },
  {
    stageIndex: 10,
    rating: 93,
    position: 'RW',
    targetStats: { pac: 93, sho: 93, pas: 91, dri: 93, def: 82, phy: 81 },
    cardStyle: 'evolution_emerald',
    stageName: 'Generational Dynamo',
    stageBadge: '🌟 Stage 11 / 14: Generational Talent',
    lore: 'A certified generational phenomenon. Capable of turning any match on its head in a single touch.',
  },
  {
    stageIndex: 11,
    rating: 95,
    position: 'RW',
    targetStats: { pac: 95, sho: 95, pas: 93, dri: 95, def: 84, phy: 83 },
    cardStyle: 'evolution_emerald',
    stageName: 'Apex Phenomenon',
    stageBadge: '🚀 Stage 12 / 14: 95 Super-Winger',
    lore: 'Reaching astronomical speeds and precision, terrorizing the finest defenders across European football.',
  },
  {
    stageIndex: 12,
    rating: 97,
    position: 'CAM',
    targetStats: { pac: 97, sho: 97, pas: 95, dri: 97, def: 86, phy: 85 },
    cardStyle: 'evolution_emerald',
    stageName: 'Maestro Conducteur',
    stageBadge: '🪄 Stage 13 / 14: 97 CAM Playmaker',
    lore: 'Total football intelligence. Transitioning into an omnipotent central attacking playmaker who orchestrates all.',
  },
  {
    stageIndex: 13,
    rating: 98,
    position: 'RW',
    targetStats: { pac: 98, sho: 98, pas: 96, dri: 98, def: 87, phy: 86 },
    cardStyle: 'evolution_gold_apex',
    stageName: 'Immortal Apex Master',
    stageBadge: '👑 Final Stage 14 / 14: 98 Apex Immortal',
    lore: 'The ultimate DNA evolution complete. A golden football immortal with near-perfection in every statistical metric.',
  },
];

// Helper to construct the full SoccerCard for any evolution stage & live stats
export function buildEvolvedSakaCard(stageIndex: number, customStats?: CardStats): SoccerCard {
  const stage = SAKA_EVOLUTION_STAGES[Math.min(stageIndex, SAKA_EVOLUTION_STAGES.length - 1)] || SAKA_EVOLUTION_STAGES[0];
  const statsToUse = customStats || { ...stage.targetStats };

  const playStyleToUse =
    stage.rating >= 97
      ? PLAYSTYLE_PRESETS.finesse_shot
      : stage.rating >= 90
      ? PLAYSTYLE_PRESETS.quick_step
      : stage.rating >= 86
      ? PLAYSTYLE_PRESETS.whipped_pass
      : undefined;

  return {
    id: 'evo-saka-active',
    name: 'Bukayo Saka',
    shortName: 'Saka',
    rating: stage.rating,
    position: stage.position,
    nation: 'England',
    nationFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    club: 'Arsenal',
    league: 'Premier League',
    rarity: stage.rating >= 98 ? 'evolution_gold_apex' : 'evolution_emerald',
    cardStyle: stage.cardStyle,
    program: 'Evolutions',
    isCustom: true,
    stats: statsToUse,
    weakFoot: stage.rating >= 92 ? 5 : 4,
    skillMoves: stage.rating >= 90 ? 5 : 4,
    workRate: 'H/H',
    price: stage.rating * 5000,
    playStylePlus: playStyleToUse,
    fullCardImage: generateUserCardSvg(
      'Saka',
      stage.rating,
      stage.position,
      statsToUse,
      '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'ARS',
      stage.rating >= 98 ? '👑' : stage.rating >= 90 ? '⚡' : '⚽',
      stage.cardStyle,
      playStyleToUse
    ),
  };
}
