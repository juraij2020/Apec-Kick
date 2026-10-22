import { CRAFTABLE_SCREAM_CARDS } from './halloweenScreamCards';

export interface CandyItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export const HALLOWEEN_CANDIES: Record<string, CandyItem> = {
  dark_chocolate_skull: {
    id: 'dark_chocolate_skull',
    name: 'Chocolate Skull',
    icon: '🍫',
    color: '#78350f',
    description: 'Rich dark cacao molded into an ancient pirate skull.',
  },
  ghostly_licorice: {
    id: 'ghostly_licorice',
    name: 'Ghostly Licorice',
    icon: '🖤',
    color: '#334155',
    description: 'Black twisted licorice spun with phantom sugar.',
  },
  candy_corn_fang: {
    id: 'candy_corn_fang',
    name: 'Candy Corn Fang',
    icon: '🌽',
    color: '#f59e0b',
    description: 'Sharp tricolor honey candy with a sugary bite.',
  },
  gummy_tarantula: {
    id: 'gummy_tarantula',
    name: 'Gummy Tarantula',
    icon: '🕷️',
    color: '#8b5cf6',
    description: 'Squishy grape-flavored gummy arachnid that glows.',
  },
  pumpkin_pop: {
    id: 'pumpkin_pop',
    name: 'Pumpkin Pop',
    icon: '🎃',
    color: '#ea580c',
    description: 'Crisp caramel spiced pumpkin lollipop on a bone stick.',
  },
  sour_bat_drop: {
    id: 'sour_bat_drop',
    name: 'Sour Bat Drop',
    icon: '🦇',
    color: '#10b981',
    description: 'Intensely sour lime hard candy shaped like folded wings.',
  },
  blood_orange_toffee: {
    id: 'blood_orange_toffee',
    name: 'Blood Toffee',
    icon: '🍬',
    color: '#e11d48',
    description: 'Crimson blood-orange chewy toffee from Lord Bellingham.',
  },
  witch_jelly: {
    id: 'witch_jelly',
    name: 'Witch Jelly',
    icon: '🧪',
    color: '#06b6d4',
    description: 'Luminous cyan jelly concocted in Sorceress Putellas’s pot.',
  },
  shock_wafer: {
    id: 'shock_wafer',
    name: 'Shock Wafer',
    icon: '⚡',
    color: '#eab308',
    description: 'Electrified honey wafer that crackles on your tongue.',
  },
  phantom_mints: {
    id: 'phantom_mints',
    name: 'Phantom Mints',
    icon: '❄️',
    color: '#67e8f9',
    description: 'Ice-cold mint drops that leave a chilling vapor breath.',
  },
};

export const CANDY_LIST: CandyItem[] = Object.values(HALLOWEEN_CANDIES);

export interface HauntedHouse {
  id: string;
  name: string;
  hostName: string;
  hostAvatar: string;
  hostTitle: string;
  themeColor: string;
  bgGradient: string;
  doorEmoji: string;
  greetingQuote: string;
  specialtyCandies: string[];
}

export const HAUNTED_HOUSES: HauntedHouse[] = [
  {
    id: 'house_pumpkin',
    name: 'The Pumpkin Manor',
    hostName: 'Count Haaland',
    hostAvatar: '🎃',
    hostTitle: 'Lord of the Golden Boot',
    themeColor: '#ea580c',
    bgGradient: 'from-amber-950 via-orange-950 to-slate-950',
    doorEmoji: '🚪',
    greetingQuote: '“Fee-fi-fo-fum! Take my Chocolate Skull and this player card from my personal vault!”',
    specialtyCandies: ['dark_chocolate_skull', 'pumpkin_pop', 'candy_corn_fang'],
  },
  {
    id: 'house_crypt',
    name: 'The Phantom Crypt',
    hostName: 'Ghostly Mbappé',
    hostAvatar: '👻',
    hostTitle: 'Speedster of the Underworld',
    themeColor: '#6366f1',
    bgGradient: 'from-indigo-950 via-slate-950 to-slate-950',
    doorEmoji: '🚪',
    greetingQuote: '“Too fast for the living! Here is my Ghostly Licorice and a base player to join your club.”',
    specialtyCandies: ['ghostly_licorice', 'phantom_mints', 'dark_chocolate_skull'],
  },
  {
    id: 'house_spider',
    name: 'The Spiderweb Villa',
    hostName: 'Spider Vini Jr',
    hostAvatar: '🕷️',
    hostTitle: 'Dribbling Weaver',
    themeColor: '#a855f7',
    bgGradient: 'from-purple-950 via-fuchsia-950 to-slate-950',
    doorEmoji: '🚪',
    greetingQuote: '“Caught in my web! Enjoy this squishy Gummy Tarantula and a footballer for your squad!”',
    specialtyCandies: ['gummy_tarantula', 'sour_bat_drop', 'candy_corn_fang'],
  },
  {
    id: 'house_vampire',
    name: 'Castle Dracula',
    hostName: 'Lord Bellingham',
    hostAvatar: '🧛',
    hostTitle: 'Midfield Blood Monarch',
    themeColor: '#e11d48',
    bgGradient: 'from-rose-950 via-red-950 to-slate-950',
    doorEmoji: '🚪',
    greetingQuote: '“Welcome to my banquet! Savor this Blood Toffee and accept this player into your club.”',
    specialtyCandies: ['blood_orange_toffee', 'dark_chocolate_skull', 'sour_bat_drop'],
  },
  {
    id: 'house_witch',
    name: "The Witch's Cottage",
    hostName: 'Sorceress Putellas',
    hostAvatar: '🧙‍♀️',
    hostTitle: 'Ballon d’Or Alchemist',
    themeColor: '#06b6d4',
    bgGradient: 'from-cyan-950 via-teal-950 to-slate-950',
    doorEmoji: '🚪',
    greetingQuote: '“Stir the cauldron! Take this glowing Witch Jelly and a worthy base player for your journey!”',
    specialtyCandies: ['witch_jelly', 'pumpkin_pop', 'phantom_mints'],
  },
  {
    id: 'house_laboratory',
    name: "Frank-Enzo's Lab",
    hostName: 'Monster Enzo',
    hostAvatar: '⚡',
    hostTitle: 'High Voltage Tactician',
    themeColor: '#eab308',
    bgGradient: 'from-yellow-950 via-stone-950 to-slate-950',
    doorEmoji: '🚪',
    greetingQuote: '“It is ALIVE! Catch this Shock Wafer and a base player recharged with lightning energy!”',
    specialtyCandies: ['shock_wafer', 'gummy_tarantula', 'ghostly_licorice'],
  },
];

// Helper to normalize candy combo to sorted key string
export function getRecipeKey(candyIds: string[]): string {
  return [...candyIds].sort().join('+');
}

// Secret recipe definitions mapping exact 5-candy combinations to the 31 craftable Scream players
export interface ScreamRecipe {
  cardId: string;
  candies: string[]; // exactly 5 candy ids
  key: string;
}

// Deterministically map each of the 31 craftable players to a unique 5-candy recipe
export const SCREAM_RECIPES: Record<string, ScreamRecipe> = {};

// Palette of combinations designed across the 10 candies
const RECIPE_PRESETS: string[][] = [
  ['dark_chocolate_skull', 'dark_chocolate_skull', 'gummy_tarantula', 'pumpkin_pop', 'shock_wafer'],
  ['blood_orange_toffee', 'candy_corn_fang', 'dark_chocolate_skull', 'ghostly_licorice', 'witch_jelly'],
  ['gummy_tarantula', 'phantom_mints', 'pumpkin_pop', 'sour_bat_drop', 'witch_jelly'],
  ['candy_corn_fang', 'ghostly_licorice', 'phantom_mints', 'shock_wafer', 'witch_jelly'],
  ['blood_orange_toffee', 'dark_chocolate_skull', 'ghostly_licorice', 'shock_wafer', 'sour_bat_drop'],
  ['candy_corn_fang', 'dark_chocolate_skull', 'gummy_tarantula', 'pumpkin_pop', 'sour_bat_drop'],
  ['blood_orange_toffee', 'ghostly_licorice', 'pumpkin_pop', 'shock_wafer', 'witch_jelly'],
  ['dark_chocolate_skull', 'phantom_mints', 'pumpkin_pop', 'shock_wafer', 'sour_bat_drop'],
  ['candy_corn_fang', 'ghostly_licorice', 'gummy_tarantula', 'sour_bat_drop', 'witch_jelly'],
  ['blood_orange_toffee', 'candy_corn_fang', 'dark_chocolate_skull', 'phantom_mints', 'shock_wafer'],
  ['dark_chocolate_skull', 'ghostly_licorice', 'gummy_tarantula', 'pumpkin_pop', 'witch_jelly'],
  ['blood_orange_toffee', 'gummy_tarantula', 'phantom_mints', 'shock_wafer', 'sour_bat_drop'],
  ['candy_corn_fang', 'dark_chocolate_skull', 'ghostly_licorice', 'pumpkin_pop', 'shock_wafer'],
  ['blood_orange_toffee', 'phantom_mints', 'pumpkin_pop', 'sour_bat_drop', 'witch_jelly'],
  ['candy_corn_fang', 'dark_chocolate_skull', 'gummy_tarantula', 'shock_wafer', 'witch_jelly'],
  ['blood_orange_toffee', 'dark_chocolate_skull', 'phantom_mints', 'pumpkin_pop', 'sour_bat_drop'],
  ['ghostly_licorice', 'gummy_tarantula', 'phantom_mints', 'pumpkin_pop', 'shock_wafer'],
  ['blood_orange_toffee', 'candy_corn_fang', 'ghostly_licorice', 'sour_bat_drop', 'witch_jelly'],
  ['dark_chocolate_skull', 'gummy_tarantula', 'phantom_mints', 'sour_bat_drop', 'shock_wafer'],
  ['blood_orange_toffee', 'candy_corn_fang', 'pumpkin_pop', 'shock_wafer', 'witch_jelly'],
  ['dark_chocolate_skull', 'ghostly_licorice', 'phantom_mints', 'sour_bat_drop', 'witch_jelly'],
  ['blood_orange_toffee', 'candy_corn_fang', 'gummy_tarantula', 'pumpkin_pop', 'sour_bat_drop'],
  ['dark_chocolate_skull', 'ghostly_licorice', 'gummy_tarantula', 'shock_wafer', 'sour_bat_drop'],
  ['candy_corn_fang', 'phantom_mints', 'pumpkin_pop', 'sour_bat_drop', 'witch_jelly'],
  ['blood_orange_toffee', 'dark_chocolate_skull', 'ghostly_licorice', 'gummy_tarantula', 'witch_jelly'],
  ['candy_corn_fang', 'dark_chocolate_skull', 'phantom_mints', 'sour_bat_drop', 'witch_jelly'],
  ['blood_orange_toffee', 'ghostly_licorice', 'gummy_tarantula', 'phantom_mints', 'shock_wafer'],
  ['candy_corn_fang', 'dark_chocolate_skull', 'pumpkin_pop', 'sour_bat_drop', 'shock_wafer'],
  ['blood_orange_toffee', 'candy_corn_fang', 'phantom_mints', 'sour_bat_drop', 'witch_jelly'],
  ['dark_chocolate_skull', 'gummy_tarantula', 'pumpkin_pop', 'shock_wafer', 'witch_jelly'],
  ['blood_orange_toffee', 'ghostly_licorice', 'phantom_mints', 'sour_bat_drop', 'shock_wafer'],
];

CRAFTABLE_SCREAM_CARDS.forEach((card, index) => {
  const candies = RECIPE_PRESETS[index % RECIPE_PRESETS.length];
  const key = getRecipeKey(candies);
  SCREAM_RECIPES[key] = {
    cardId: card.id,
    candies,
    key,
  };
});

// Helper to look up recipe result
export function checkRecipe(selectedCandies: string[]): {
  isMatch: boolean;
  matchedCardId?: string;
  recipeKey: string;
} {
  if (selectedCandies.length !== 5) {
    return { isMatch: false, recipeKey: '' };
  }
  const key = getRecipeKey(selectedCandies);
  const match = SCREAM_RECIPES[key];
  if (match) {
    return {
      isMatch: true,
      matchedCardId: match.cardId,
      recipeKey: key,
    };
  }
  return {
    isMatch: false,
    recipeKey: key,
  };
}
