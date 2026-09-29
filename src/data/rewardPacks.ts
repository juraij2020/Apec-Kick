import { PackDefinition, RewardLadderTier } from '../types/card';
import goldPackImg from '../assets/images/pack_gold_foil_1790566377916.jpg';
import iconPackImg from '../assets/images/pack_icon_cosmic_1790566397330.jpg';

// Higher or Lower Streak Reward Ladder Tiers
export const HL_REWARD_LADDER: RewardLadderTier[] = [
  {
    streak: 3,
    coins: 1000,
    title: 'Warm-up Master',
    description: 'Hit a 3-streak in Higher or Lower',
    pack: {
      id: 'reward-hl-streak-3',
      name: 'Gold Booster Pack',
      tagline: 'Earned from Higher or Lower 3x Streak · 3 Gold Players with high potential',
      cost: 0,
      cardCount: 3,
      minRating: 75,
      programFilter: 'All',
      theme: 'gold',
      imageAsset: goldPackImg,
      customChance: 0.2,
      customCardChance: 0.2,
    },
  },
  {
    streak: 5,
    coins: 2500,
    title: 'On Fire!',
    description: 'Reach a 5-streak in Higher or Lower',
    pack: {
      id: 'reward-hl-streak-5',
      name: 'Jumbo Premium Gold Pack',
      tagline: 'Earned from Higher or Lower 5x Streak · 5 Players with guaranteed 78+ rating',
      cost: 0,
      cardCount: 5,
      minRating: 78,
      guaranteedRating: 78,
      programFilter: 'All',
      theme: 'prismatic',
      imageAsset: iconPackImg,
      customChance: 0.45,
      customCardChance: 0.45,
    },
  },
  {
    streak: 8,
    coins: 5000,
    title: 'Tactical Genius',
    description: 'Reach an 8-streak in Higher or Lower',
    pack: {
      id: 'reward-hl-streak-8',
      name: 'Elite Players Pack',
      tagline: 'Earned from Higher or Lower 8x Streak · 4 Top-flight stars with guaranteed 82+ rating',
      cost: 0,
      cardCount: 4,
      minRating: 82,
      guaranteedRating: 82,
      programFilter: 'All',
      theme: 'ruby',
      imageAsset: iconPackImg,
      customChance: 0.65,
      customCardChance: 0.65,
    },
  },
  {
    streak: 12,
    coins: 10000,
    title: 'Apex Legend',
    description: 'Reach a 12-streak in Higher or Lower',
    pack: {
      id: 'reward-hl-streak-12',
      name: 'Walkout Mega Pack',
      tagline: 'Earned from Higher or Lower 12x Streak · Guaranteed 85+ Walkout superstar!',
      cost: 0,
      cardCount: 5,
      minRating: 84,
      guaranteedRating: 85,
      guaranteedWalkout: true,
      programFilter: 'All',
      theme: 'intl_moments',
      imageAsset: iconPackImg,
      customChance: 0.85,
      customCardChance: 0.85,
    },
  },
  {
    streak: 15,
    coins: 25000,
    title: 'God of the Pitch',
    description: 'Reach an incredible 15-streak in Higher or Lower',
    pack: {
      id: 'reward-hl-streak-15',
      name: 'Ultimate Mythic Vault Pack',
      tagline: 'Earned from Higher or Lower 15x Streak · Guaranteed 88+ Mythic Legend or Icon!',
      cost: 0,
      cardCount: 5,
      minRating: 86,
      guaranteedRating: 88,
      guaranteedWalkout: true,
      programFilter: 'All',
      theme: 'hof_gold',
      imageAsset: iconPackImg,
      customChance: 1.0,
      customCardChance: 1.0,
    },
  },
];

// Guess Who Tiered Pack Rewards
export const getGuessWhoTierReward = (guessesCount: number) => {
  if (guessesCount <= 1) {
    return {
      tierName: 'Mastermind (1 Clue)',
      coins: 6000,
      pack: {
        id: `reward-gw-mastermind-${Date.now()}`,
        name: 'Mastermind Rare Walkout Pack',
        tagline: 'Earned for solving Guess Who in only 1 Clue! Guaranteed 85+ Walkout',
        cost: 0,
        cardCount: 5,
        minRating: 84,
        guaranteedRating: 85,
        guaranteedWalkout: true,
        programFilter: 'All',
        theme: 'hof_gold',
        imageAsset: iconPackImg,
        customChance: 0.9,
        customCardChance: 0.9,
      } as PackDefinition,
    };
  }

  if (guessesCount === 2) {
    return {
      tierName: 'Super Detective (2 Clues)',
      coins: 4000,
      pack: {
        id: `reward-gw-detective-${Date.now()}`,
        name: 'Super Detective Jumbo Pack',
        tagline: 'Earned for solving Guess Who in 2 Clues! Guaranteed 82+ rating',
        cost: 0,
        cardCount: 4,
        minRating: 80,
        guaranteedRating: 82,
        guaranteedWalkout: true,
        programFilter: 'All',
        theme: 'intl_moments',
        imageAsset: iconPackImg,
        customChance: 0.7,
        customCardChance: 0.7,
      } as PackDefinition,
    };
  }

  if (guessesCount === 3) {
    return {
      tierName: 'Tactician (3 Clues)',
      coins: 2500,
      pack: {
        id: `reward-gw-tactician-${Date.now()}`,
        name: 'Mystery Sleuth Gold Pack',
        tagline: 'Earned for solving Guess Who in 3 Clues! 4 Gold Players with 78+ guaranteed',
        cost: 0,
        cardCount: 4,
        minRating: 78,
        guaranteedRating: 78,
        programFilter: 'All',
        theme: 'prismatic',
        imageAsset: iconPackImg,
        customChance: 0.5,
        customCardChance: 0.5,
      } as PackDefinition,
    };
  }

  return {
    tierName: 'Mystery Solver (4-5 Clues)',
    coins: 1500,
    pack: {
      id: `reward-gw-solver-${Date.now()}`,
      name: 'Challenger Reward Pack',
      tagline: 'Earned for cracking the Mystery Player! 3 Gold Players with 75+ rating',
      cost: 0,
      cardCount: 3,
      minRating: 75,
      programFilter: 'All',
      theme: 'gold',
      imageAsset: goldPackImg,
      customChance: 0.3,
      customCardChance: 0.3,
    } as PackDefinition,
  };
};

// Starter reward pack for new users or testing
export const INITIAL_REWARD_PACKS = [
  {
    instanceId: 'reward-starter-jumbo-1',
    packDefinition: {
      id: 'pack-starter-welcome',
      name: 'Apex Welcome Gift Pack',
      tagline: 'Free club kickstart pack · 4 players with guaranteed 80+ player item',
      cost: 0,
      cardCount: 4,
      minRating: 78,
      guaranteedRating: 80,
      programFilter: 'All',
      theme: 'prismatic',
      imageAsset: iconPackImg,
      customChance: 0.5,
      customCardChance: 0.5,
    },
    earnedAt: Date.now() - 3600000,
    sourceTitle: 'Apex Starter Bonus',
    sourceType: 'bonus' as const,
  },
  {
    instanceId: 'reward-starter-gold-2',
    packDefinition: {
      id: 'pack-starter-gold-booster',
      name: 'Pro Scout Gold Booster',
      tagline: 'Free rewards pack · 3 gold players ready for your starting XI',
      cost: 0,
      cardCount: 3,
      minRating: 76,
      programFilter: 'All',
      theme: 'gold',
      imageAsset: goldPackImg,
      customChance: 0.3,
      customCardChance: 0.3,
    },
    earnedAt: Date.now() - 1800000,
    sourceTitle: 'Welcome Gift',
    sourceType: 'bonus' as const,
  },
];
