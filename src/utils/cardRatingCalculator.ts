import { CardStats, Position, SoccerCard } from '../types/card';

export interface PositionWeight {
  pac: number; // DIV for GK
  sho: number; // HAN for GK
  pas: number; // KIC for GK
  dri: number; // REF for GK
  def: number; // SPE for GK
  phy: number; // POS for GK
}

export interface RatingBreakdownItem {
  attribute: string;
  weight: number;
  statValue: number;
  contribution: number;
}

export interface RatingCalculationResult {
  rating: number;
  position: Position;
  weights: PositionWeight;
  breakdown: RatingBreakdownItem[];
  formulaSummary: string;
}

// Position-weighted formulas based on authentic football simulation standards
export const POSITION_STAT_WEIGHTS: Record<Position, PositionWeight> = {
  // Attackers
  ST:  { pac: 0.18, sho: 0.40, pas: 0.10, dri: 0.20, def: 0.02, phy: 0.10 },
  CF:  { pac: 0.18, sho: 0.36, pas: 0.16, dri: 0.20, def: 0.02, phy: 0.08 },
  LW:  { pac: 0.28, sho: 0.22, pas: 0.18, dri: 0.24, def: 0.02, phy: 0.06 },
  RW:  { pac: 0.28, sho: 0.22, pas: 0.18, dri: 0.24, def: 0.02, phy: 0.06 },

  // Midfielders
  CAM: { pac: 0.12, sho: 0.20, pas: 0.32, dri: 0.26, def: 0.02, phy: 0.08 },
  LM:  { pac: 0.25, sho: 0.16, pas: 0.25, dri: 0.24, def: 0.04, phy: 0.06 },
  RM:  { pac: 0.25, sho: 0.16, pas: 0.25, dri: 0.24, def: 0.04, phy: 0.06 },
  CM:  { pac: 0.10, sho: 0.16, pas: 0.30, dri: 0.22, def: 0.12, phy: 0.10 },
  CDM: { pac: 0.08, sho: 0.08, pas: 0.22, dri: 0.14, def: 0.28, phy: 0.20 },

  // Defenders
  CB:  { pac: 0.12, sho: 0.02, pas: 0.08, dri: 0.06, def: 0.44, phy: 0.28 },
  LB:  { pac: 0.26, sho: 0.04, pas: 0.16, dri: 0.14, def: 0.26, phy: 0.14 },
  RB:  { pac: 0.26, sho: 0.04, pas: 0.16, dri: 0.14, def: 0.26, phy: 0.14 },
  LWB: { pac: 0.28, sho: 0.06, pas: 0.18, dri: 0.16, def: 0.20, phy: 0.12 },
  RWB: { pac: 0.28, sho: 0.06, pas: 0.18, dri: 0.16, def: 0.20, phy: 0.12 },

  // Goalkeeper (stats map to DIV, HAN, KIC, REF, SPE, POS)
  GK:  { pac: 0.24, sho: 0.22, pas: 0.10, dri: 0.26, def: 0.04, phy: 0.14 }
};

/**
 * Calculates a player's exact overall card rating strictly from their individual stats
 * and position weights.
 */
export function calculateCardRating(stats: CardStats, position: Position): number {
  const weights = POSITION_STAT_WEIGHTS[position] || POSITION_STAT_WEIGHTS.CM;
  
  const rawSum = 
    (stats.pac || 0) * weights.pac +
    (stats.sho || 0) * weights.sho +
    (stats.pas || 0) * weights.pas +
    (stats.dri || 0) * weights.dri +
    (stats.def || 0) * weights.def +
    (stats.phy || 0) * weights.phy;

  // Round to nearest integer and clamp between 45 and 99
  const rating = Math.min(99, Math.max(45, Math.round(rawSum)));
  return rating;
}

/**
 * Returns detailed calculation breakdown showing how stats formulate the overall rating.
 */
export function getRatingCalculationDetails(stats: CardStats, position: Position): RatingCalculationResult {
  const isGK = position === 'GK';
  const weights = POSITION_STAT_WEIGHTS[position] || POSITION_STAT_WEIGHTS.CM;

  const statLabels = isGK 
    ? { pac: 'DIV', sho: 'HAN', pas: 'KIC', dri: 'REF', def: 'SPE', phy: 'POS' }
    : { pac: 'PAC', sho: 'SHO', pas: 'PAS', dri: 'DRI', def: 'DEF', phy: 'PHY' };

  const breakdown: RatingBreakdownItem[] = [
    {
      attribute: statLabels.pac,
      weight: weights.pac,
      statValue: stats.pac,
      contribution: stats.pac * weights.pac
    },
    {
      attribute: statLabels.sho,
      weight: weights.sho,
      statValue: stats.sho,
      contribution: stats.sho * weights.sho
    },
    {
      attribute: statLabels.pas,
      weight: weights.pas,
      statValue: stats.pas,
      contribution: stats.pas * weights.pas
    },
    {
      attribute: statLabels.dri,
      weight: weights.dri,
      statValue: stats.dri,
      contribution: stats.dri * weights.dri
    },
    {
      attribute: statLabels.def,
      weight: weights.def,
      statValue: stats.def,
      contribution: stats.def * weights.def
    },
    {
      attribute: statLabels.phy,
      weight: weights.phy,
      statValue: stats.phy,
      contribution: stats.phy * weights.phy
    }
  ];

  const rawSum = breakdown.reduce((acc, item) => acc + item.contribution, 0);
  const rating = Math.min(99, Math.max(45, Math.round(rawSum)));

  // Top two key attributes for display summary
  const sortedByWeight = [...breakdown].sort((a, b) => b.weight - a.weight);
  const primaryKeys = `${sortedByWeight[0].attribute} (${Math.round(sortedByWeight[0].weight * 100)}%) + ${sortedByWeight[1].attribute} (${Math.round(sortedByWeight[1].weight * 100)}%)`;

  return {
    rating,
    position,
    weights,
    breakdown,
    formulaSummary: `Formula: ${primaryKeys} + other attributes = ${rating} OVR`
  };
}

/**
 * Returns a new SoccerCard with its rating recalculated strictly from stats.
 */
export function recalculateCardRating(card: SoccerCard): SoccerCard {
  const calculatedRating = calculateCardRating(card.stats, card.position);
  return {
    ...card,
    rating: calculatedRating
  };
}
