import { SBCChallenge, SoccerCard } from '../types/card';

export const INITIAL_SBCS: SBCChallenge[] = [
  {
    id: 'sbc-street-kings-haneen',
    title: 'Street Kings: The Pride of Tharavaadees ⚡',
    category: 'Street Kings',
    description: 'Assemble a high-chemistry 11-player squad (Min. 81 Team Rating, Min. 2 Midfielders) to unlock the exclusive untradeable 92 OVR Haneen Mustafa Street Kings item + Street Kings Underground Vault Pack + 25,000 Coins!',
    rewardPackId: 'pack-street-kings-vault',
    rewardPackName: 'Street Kings Underground Vault ⚡',
    rewardCoins: 25000,
    completed: false,
    slots: [
      { position: 'LW', label: 'Left Winger' },
      { position: 'ST', label: 'Striker' },
      { position: 'RW', label: 'Right Winger' },
      { position: 'CAM', label: 'Central Playmaker' },
      { position: 'CM', label: 'Box-to-Box Midfielder' },
      { position: 'CDM', label: 'Defensive Anchor' },
      { position: 'LB', label: 'Left Back' },
      { position: 'CB', label: 'Center Back' },
      { position: 'CB', label: 'Center Back' },
      { position: 'RB', label: 'Right Back' },
      { position: 'GK', label: 'Goalkeeper' },
    ],
    requirements: [
      {
        id: 'req-sk-rating',
        description: 'Min. Team Rating: 81',
        check: (cards) => {
          if (cards.length === 0) return false;
          const avg = cards.reduce((acc, c) => acc + c.rating, 0) / cards.length;
          return avg >= 81;
        },
        progress: (cards) => {
          const avg = cards.length ? Math.round(cards.reduce((acc, c) => acc + c.rating, 0) / cards.length) : 0;
          return { current: avg, target: 81, met: avg >= 81 };
        },
      },
      {
        id: 'req-sk-midfielder',
        description: 'Min. 2 Midfielders (CM/CAM/CDM)',
        check: (cards) => cards.filter((c) => ['CM', 'CAM', 'CDM'].includes(c.position)).length >= 2,
        progress: (cards) => {
          const count = cards.filter((c) => ['CM', 'CAM', 'CDM'].includes(c.position)).length;
          return { current: count, target: 2, met: count >= 2 };
        },
      },
      {
        id: 'req-sk-full-squad',
        description: 'Full 11-Player Starting XI',
        check: (cards) => cards.length === 11,
        progress: (cards) => ({ current: cards.length, target: 11, met: cards.length === 11 }),
      },
    ],
  },
  {
    id: 'sbc-intl-joga-bonito',
    title: 'Seleção Joga Bonito 🇧🇷',
    category: 'International Moments',
    description: 'Assemble an attacking trident featuring at least 1 Brazilian international and 82+ squad rating to unlock a guaranteed Brazil Moments pack.',
    rewardPackId: 'pack-intl-brazil',
    rewardPackName: 'Seleção Canarinho Pack 🇧🇷',
    rewardCoins: 35000,
    completed: false,
    slots: [
      { position: 'LW', label: 'Left Winger' },
      { position: 'ST', label: 'Striker' },
      { position: 'CAM', label: 'Playmaker' },
    ],
    requirements: [
      {
        id: 'req-brazil-card',
        description: 'Min. 1 Brazil Player',
        check: (cards) => cards.some((c) => c.nation === 'Brazil'),
        progress: (cards) => {
          const count = cards.filter((c) => c.nation === 'Brazil').length;
          return { current: count, target: 1, met: count >= 1 };
        },
      },
      {
        id: 'req-brazil-rating',
        description: 'Min. Team Rating: 80',
        check: (cards) => {
          if (cards.length === 0) return false;
          const avg = cards.reduce((acc, c) => acc + c.rating, 0) / cards.length;
          return avg >= 80;
        },
        progress: (cards) => {
          const avg = cards.length ? Math.round(cards.reduce((acc, c) => acc + c.rating, 0) / cards.length) : 0;
          return { current: avg, target: 80, met: avg >= 80 };
        },
      },
      {
        id: 'req-brazil-count',
        description: '3 Attackers Submitted',
        check: (cards) => cards.length === 3,
        progress: (cards) => ({ current: cards.length, target: 3, met: cards.length === 3 }),
      },
    ],
  },
  {
    id: 'sbc-intl-albiceleste-glory',
    title: 'La Albiceleste Glory 🇦🇷',
    category: 'International Moments',
    description: 'Build a high-tempo midfield engine featuring at least 1 Argentine player and 80+ squad rating to claim the Albiceleste Champions Pack.',
    rewardPackId: 'pack-intl-argentina',
    rewardPackName: 'Albiceleste Champions Pack 🇦🇷',
    rewardCoins: 35000,
    completed: false,
    slots: [
      { position: 'CM', label: 'Central Midfielder' },
      { position: 'CAM', label: 'Attacking Midfielder' },
      { position: 'CM', label: 'Central Midfielder' },
    ],
    requirements: [
      {
        id: 'req-arg-card',
        description: 'Min. 1 Argentina Player',
        check: (cards) => cards.some((c) => c.nation === 'Argentina'),
        progress: (cards) => {
          const count = cards.filter((c) => c.nation === 'Argentina').length;
          return { current: count, target: 1, met: count >= 1 };
        },
      },
      {
        id: 'req-arg-rating',
        description: 'Min. Team Rating: 80',
        check: (cards) => {
          if (cards.length === 0) return false;
          const avg = cards.reduce((acc, c) => acc + c.rating, 0) / cards.length;
          return avg >= 80;
        },
        progress: (cards) => {
          const avg = cards.length ? Math.round(cards.reduce((acc, c) => acc + c.rating, 0) / cards.length) : 0;
          return { current: avg, target: 80, met: avg >= 80 };
        },
      },
      {
        id: 'req-arg-count',
        description: '3 Midfielders Submitted',
        check: (cards) => cards.length === 3,
        progress: (cards) => ({ current: cards.length, target: 3, met: cards.length === 3 }),
      },
    ],
  },
  {
    id: 'sbc-intl-red-devils',
    title: 'Belgian Golden Generation 🇧🇪',
    category: 'International Moments',
    description: 'Assemble an unyielding defensive barrier featuring at least 1 Belgian player to claim the Red Devils Golden Era Pack.',
    rewardPackId: 'pack-intl-belgium',
    rewardPackName: 'Red Devils Golden Era Pack 🇧🇪',
    rewardCoins: 35000,
    completed: false,
    slots: [
      { position: 'CB', label: 'Center Back' },
      { position: 'GK', label: 'Goalkeeper' },
      { position: 'CB', label: 'Center Back' },
    ],
    requirements: [
      {
        id: 'req-bel-card',
        description: 'Min. 1 Belgium Player',
        check: (cards) => cards.some((c) => c.nation === 'Belgium'),
        progress: (cards) => {
          const count = cards.filter((c) => c.nation === 'Belgium').length;
          return { current: count, target: 1, met: count >= 1 };
        },
      },
      {
        id: 'req-bel-rating',
        description: 'Min. Team Rating: 80',
        check: (cards) => {
          if (cards.length === 0) return false;
          const avg = cards.reduce((acc, c) => acc + c.rating, 0) / cards.length;
          return avg >= 80;
        },
        progress: (cards) => {
          const avg = cards.length ? Math.round(cards.reduce((acc, c) => acc + c.rating, 0) / cards.length) : 0;
          return { current: avg, target: 80, met: avg >= 80 };
        },
      },
      {
        id: 'req-bel-count',
        description: '3 Defensive Specialists Submitted',
        check: (cards) => cards.length === 3,
        progress: (cards) => ({ current: cards.length, target: 3, met: cards.length === 3 }),
      },
    ],
  },
  {
    id: 'sbc-hof-defensive-wall',
    title: 'Hall of Fame: Defensive Wall',
    category: 'Hall of Fame',
    description: 'Assemble a rock-solid 3-player backline featuring at least 1 Hall of Fame defensive titan with min. 76 squad rating.',
    rewardPackId: 'pack-hof-induction',
    rewardPackName: 'Hall of Fame Enshrinement Pack',
    rewardCoins: 15000,
    completed: false,
    slots: [
      { position: 'CB', label: 'Center Back' },
      { position: 'CB', label: 'Center Back' },
      { position: 'CDM', label: 'Midfield Anchor' },
    ],
    requirements: [
      {
        id: 'req-hof-wall-card',
        description: 'Min. 1 Hall of Fame Card',
        check: (cards) => cards.some(c => c.program === 'Hall of Fame' || c.rarity === 'hall_of_fame' || c.program === 'Program One' || c.rarity === 'program_one'),
        progress: (cards) => {
          const count = cards.filter(c => c.program === 'Hall of Fame' || c.rarity === 'hall_of_fame' || c.program === 'Program One' || c.rarity === 'program_one').length;
          return { current: count, target: 1, met: count >= 1 };
        }
      },
      {
        id: 'req-hof-wall-rating',
        description: 'Min. Team Rating: 76',
        check: (cards) => {
          if (cards.length === 0) return false;
          const avg = cards.reduce((acc, c) => acc + c.rating, 0) / cards.length;
          return avg >= 76;
        },
        progress: (cards) => {
          const avg = cards.length ? Math.round(cards.reduce((acc, c) => acc + c.rating, 0) / cards.length) : 0;
          return { current: avg, target: 76, met: avg >= 76 };
        }
      },
      {
        id: 'req-hof-wall-count',
        description: '3 Players Submitted',
        check: (cards) => cards.length === 3,
        progress: (cards) => ({ current: cards.length, target: 3, met: cards.length === 3 })
      }
    ]
  },
  {
    id: 'sbc-hof-apex-poacher',
    title: 'Hall of Fame: Apex Poacher',
    category: 'Hall of Fame',
    description: 'Build a clinical 3-player attacking trident featuring at least 1 Hall of Fame attacker with min. 80 squad rating.',
    rewardPackId: 'pack-hof-mythic',
    rewardPackName: 'Hall of Fame Mythic Vault',
    rewardCoins: 25000,
    completed: false,
    slots: [
      { position: 'ST', label: 'Striker' },
      { position: 'RW', label: 'Right Wing' },
      { position: 'LW', label: 'Left Wing' },
    ],
    requirements: [
      {
        id: 'req-hof-poacher-card',
        description: 'Min. 1 Hall of Fame Card',
        check: (cards) => cards.some(c => c.program === 'Hall of Fame' || c.rarity === 'hall_of_fame' || c.program === 'Program One' || c.rarity === 'program_one'),
        progress: (cards) => {
          const count = cards.filter(c => c.program === 'Hall of Fame' || c.rarity === 'hall_of_fame' || c.program === 'Program One' || c.rarity === 'program_one').length;
          return { current: count, target: 1, met: count >= 1 };
        }
      },
      {
        id: 'req-hof-poacher-rating',
        description: 'Min. Team Rating: 80',
        check: (cards) => {
          if (cards.length === 0) return false;
          const avg = cards.reduce((acc, c) => acc + c.rating, 0) / cards.length;
          return avg >= 80;
        },
        progress: (cards) => {
          const avg = cards.length ? Math.round(cards.reduce((acc, c) => acc + c.rating, 0) / cards.length) : 0;
          return { current: avg, target: 80, met: avg >= 80 };
        }
      },
      {
        id: 'req-hof-poacher-count',
        description: '3 Players Submitted',
        check: (cards) => cards.length === 3,
        progress: (cards) => ({ current: cards.length, target: 3, met: cards.length === 3 })
      }
    ]
  },
  {
    id: 'sbc-futmas-festive-wonder',
    title: 'Futmas Festive Wonder',
    category: 'Futmas Special',
    description: 'Submit a 3-player lineup with 80+ team rating to unlock a guaranteed Futmas Frost Pack.',
    rewardPackId: 'pack-futmas-frost',
    rewardPackName: 'Futmas Frost Pack',
    rewardCoins: 10000,
    completed: false,
    slots: [
      { position: 'ST', label: 'Striker' },
      { position: 'CM', label: 'Central Mid' },
      { position: 'CB', label: 'Center Back' },
    ],
    requirements: [
      {
        id: 'req-futmas-sbc-rating',
        description: 'Min. Team Rating: 80',
        check: (cards) => {
          if (cards.length === 0) return false;
          const avg = cards.reduce((acc, c) => acc + c.rating, 0) / cards.length;
          return avg >= 80;
        },
        progress: (cards) => {
          const avg = cards.length ? Math.round(cards.reduce((acc, c) => acc + c.rating, 0) / cards.length) : 0;
          return { current: avg, target: 80, met: avg >= 80 };
        }
      },
      {
        id: 'req-futmas-players-3',
        description: '3 Players Submitted',
        check: (cards) => cards.length === 3,
        progress: (cards) => ({ current: cards.length, target: 3, met: cards.length === 3 })
      }
    ]
  },
  {
    id: 'sbc-futmas-winter-champions',
    title: 'Futmas Winter Champions',
    category: 'Futmas Special',
    description: 'Build a prestigious 83+ rated squad with at least 1 Futmas or Program One star to claim the Futmas Mega Countdown.',
    rewardPackId: 'pack-futmas-mega',
    rewardPackName: 'Futmas Mega Countdown',
    rewardCoins: 20000,
    completed: false,
    slots: [
      { position: 'RW', label: 'Right Wing' },
      { position: 'CAM', label: 'Attacking Mid' },
      { position: 'ST', label: 'Striker' },
    ],
    requirements: [
      {
        id: 'req-futmas-or-prog1',
        description: 'Min. 1 Futmas or Program One Card',
        check: (cards) => cards.some(c => c.program === 'Futmas' || c.rarity === 'futmas' || c.program === 'Program One' || c.rarity === 'program_one'),
        progress: (cards) => {
          const count = cards.filter(c => c.program === 'Futmas' || c.rarity === 'futmas' || c.program === 'Program One' || c.rarity === 'program_one').length;
          return { current: count, target: 1, met: count >= 1 };
        }
      },
      {
        id: 'req-futmas-rating-83',
        description: 'Min. Team Rating: 83',
        check: (cards) => {
          if (cards.length === 0) return false;
          const avg = cards.reduce((acc, c) => acc + c.rating, 0) / cards.length;
          return avg >= 83;
        },
        progress: (cards) => {
          const avg = cards.length ? Math.round(cards.reduce((acc, c) => acc + c.rating, 0) / cards.length) : 0;
          return { current: avg, target: 83, met: avg >= 83 };
        }
      }
    ]
  },
  {
    id: 'sbc-program-one-showcase',
    title: 'Program One Showcase',
    category: 'Program One',
    description: 'Submit a 3-player lineup featuring at least 2 Program One special cards with 75+ team rating.',
    rewardPackId: 'pack-program-one-elite',
    rewardPackName: 'Program One Elite Pack',
    rewardCoins: 7500,
    completed: false,
    slots: [
      { position: 'ST', label: 'Striker' },
      { position: 'LM', label: 'Left Mid' },
      { position: 'RM', label: 'Right Mid' },
    ],
    requirements: [
      {
        id: 'req-prog1-count',
        description: 'Min. 2 Program One Cards',
        check: (cards) => cards.filter(c => c.program === 'Program One' || c.rarity === 'program_one').length >= 2,
        progress: (cards) => {
          const count = cards.filter(c => c.program === 'Program One' || c.rarity === 'program_one').length;
          return { current: count, target: 2, met: count >= 2 };
        }
      },
      {
        id: 'req-rating-75',
        description: 'Min. Team Rating: 75',
        check: (cards) => {
          if (cards.length === 0) return false;
          const avg = cards.reduce((acc, c) => acc + c.rating, 0) / cards.length;
          return avg >= 75;
        },
        progress: (cards) => {
          const avg = cards.length ? Math.round(cards.reduce((acc, c) => acc + c.rating, 0) / cards.length) : 0;
          return { current: avg, target: 75, met: avg >= 75 };
        }
      }
    ]
  },
  {
    id: 'sbc-base-foundation',
    title: 'Base Foundations',
    category: 'Base Challenges',
    description: 'Build a solid 3-man core using standard Base Cards to unlock a Program One Booster.',
    rewardPackId: 'pack-program-one',
    rewardPackName: 'Program One Booster',
    rewardCoins: 5000,
    completed: false,
    slots: [
      { position: 'CB', label: 'Center Back' },
      { position: 'CM', label: 'Central Mid' },
      { position: 'ST', label: 'Striker' },
    ],
    requirements: [
      {
        id: 'req-base-count',
        description: 'Min. 2 Base Cards',
        check: (cards) => cards.filter(c => c.program === 'Base Cards' || c.rarity === 'base' || !c.isCustom).length >= 2,
        progress: (cards) => {
          const count = cards.filter(c => c.program === 'Base Cards' || c.rarity === 'base' || !c.isCustom).length;
          return { current: count, target: 2, met: count >= 2 };
        }
      },
      {
        id: 'req-rating-76',
        description: 'Min. Team Rating: 76',
        check: (cards) => {
          if (cards.length === 0) return false;
          const avg = cards.reduce((acc, c) => acc + c.rating, 0) / cards.length;
          return avg >= 76;
        },
        progress: (cards) => {
          const avg = cards.length ? Math.round(cards.reduce((acc, c) => acc + c.rating, 0) / cards.length) : 0;
          return { current: avg, target: 76, met: avg >= 76 };
        }
      }
    ]
  },
  {
    id: 'sbc-midfield-engine',
    title: 'Midfield Engine',
    category: 'Starter',
    description: 'Assemble a synchronized 3-player midfield trio capable of dominating the center of the pitch.',
    rewardPackId: 'pack-base-gold',
    rewardPackName: 'Base Gold Pack',
    rewardCoins: 4000,
    completed: false,
    slots: [
      { position: 'CAM', label: 'Attacking Mid (CAM)' },
      { position: 'CM', label: 'Central Mid (CM)' },
      { position: 'CDM', label: 'Defensive Mid (CDM)' },
    ],
    requirements: [
      {
        id: 'req-mid-positions',
        description: 'Exact Midfielders (CAM + CM + CDM)',
        check: (cards) => {
          const positions = cards.map(c => c.position);
          return positions.includes('CAM') && positions.includes('CM') && positions.includes('CDM');
        },
        progress: (cards) => {
          const positions = new Set(cards.map(c => c.position));
          let count = 0;
          if (positions.has('CAM')) count++;
          if (positions.has('CM')) count++;
          if (positions.has('CDM')) count++;
          return { current: count, target: 3, met: count === 3 };
        }
      },
      {
        id: 'req-rating-75',
        description: 'Min. Team Rating: 75',
        check: (cards) => {
          if (cards.length === 0) return false;
          const avg = cards.reduce((acc, c) => acc + c.rating, 0) / cards.length;
          return avg >= 75;
        },
        progress: (cards) => {
          const avg = cards.length ? Math.round(cards.reduce((acc, c) => acc + c.rating, 0) / cards.length) : 0;
          return { current: avg, target: 75, met: avg >= 75 };
        }
      }
    ]
  },
  {
    id: 'sbc-nation-harmony',
    title: 'Global Nations Harmony',
    category: 'Advanced',
    description: 'Bring together world-class talent from at least 3 distinct football nations.',
    rewardPackId: 'pack-mixed-jumbo',
    rewardPackName: 'Program One & Base Jumbo',
    rewardCoins: 8000,
    completed: false,
    slots: [
      { position: 'LW', label: 'Left Wing' },
      { position: 'ST', label: 'Striker' },
      { position: 'RW', label: 'Right Wing' },
      { position: 'CM', label: 'Playmaker' },
    ],
    requirements: [
      {
        id: 'req-nations-3',
        description: 'Min. 3 Different Nations',
        check: (cards) => {
          const nations = new Set(cards.map(c => c.nation));
          return nations.size >= 3;
        },
        progress: (cards) => {
          const nations = new Set(cards.map(c => c.nation));
          return { current: nations.size, target: 3, met: nations.size >= 3 };
        }
      },
      {
        id: 'req-rating-78',
        description: 'Min. Team Rating: 78',
        check: (cards) => {
          if (cards.length === 0) return false;
          const avg = cards.reduce((acc, c) => acc + c.rating, 0) / cards.length;
          return avg >= 78;
        },
        progress: (cards) => {
          const avg = cards.length ? Math.round(cards.reduce((acc, c) => acc + c.rating, 0) / cards.length) : 0;
          return { current: avg, target: 78, met: avg >= 78 };
        }
      }
    ]
  },
  {
    id: 'sbc-iron-fortress',
    title: 'The Iron Fortress',
    category: 'Advanced',
    description: 'Construct an impenetrable backline: 1 Goalkeeper + 2 Center Backs + 2 Fullbacks.',
    rewardPackId: 'pack-program-one-elite',
    rewardPackName: 'Program One Elite Pack',
    rewardCoins: 12000,
    completed: false,
    slots: [
      { position: 'GK', label: 'Goalkeeper' },
      { position: 'LB', label: 'Left Back' },
      { position: 'CB', label: 'Center Back 1' },
      { position: 'CB', label: 'Center Back 2' },
      { position: 'RB', label: 'Right Back' },
    ],
    requirements: [
      {
        id: 'req-defense-structure',
        description: 'All 5 Defending Positions Correct',
        check: (cards) => {
          const pos = cards.map(c => c.position);
          return pos.filter(p => p === 'GK').length >= 1 &&
                 pos.filter(p => p === 'LB' || p === 'LWB').length >= 1 &&
                 pos.filter(p => p === 'CB').length >= 2 &&
                 pos.filter(p => p === 'RB' || p === 'RWB').length >= 1;
        },
        progress: (cards) => {
          const pos = cards.map(c => c.position);
          let score = 0;
          if (pos.filter(p => p === 'GK').length >= 1) score++;
          if (pos.filter(p => p === 'LB' || p === 'LWB').length >= 1) score++;
          if (pos.filter(p => p === 'CB').length >= 2) score += 2;
          else if (pos.filter(p => p === 'CB').length === 1) score += 1;
          if (pos.filter(p => p === 'RB' || p === 'RWB').length >= 1) score++;
          return { current: score, target: 5, met: score === 5 };
        }
      },
      {
        id: 'req-rating-78',
        description: 'Min. Team Rating: 78',
        check: (cards) => {
          if (cards.length === 0) return false;
          const avg = cards.reduce((acc, c) => acc + c.rating, 0) / cards.length;
          return avg >= 78;
        },
        progress: (cards) => {
          const avg = cards.length ? Math.round(cards.reduce((acc, c) => acc + c.rating, 0) / cards.length) : 0;
          return { current: avg, target: 78, met: avg >= 78 };
        }
      }
    ]
  },
  {
    id: 'sbc-galactic-allstars',
    title: 'Galactic All-Stars',
    category: 'Icons & Legends',
    description: 'Sacrifice 6 elite performers with an 82+ overall squad rating to earn the ultimate Jumbo pack.',
    rewardPackId: 'pack-mixed-jumbo',
    rewardPackName: 'Program One & Base Jumbo',
    rewardCoins: 20000,
    completed: false,
    slots: [
      { position: 'LW', label: 'Attacker 1' },
      { position: 'ST', label: 'Attacker 2' },
      { position: 'RW', label: 'Attacker 3' },
      { position: 'CM', label: 'Midfield 1' },
      { position: 'CM', label: 'Midfield 2' },
      { position: 'CB', label: 'Anchor CB' },
    ],
    requirements: [
      {
        id: 'req-rating-82',
        description: 'Min. Team Rating: 82',
        check: (cards) => {
          if (cards.length === 0) return false;
          const avg = cards.reduce((acc, c) => acc + c.rating, 0) / cards.length;
          return avg >= 82;
        },
        progress: (cards) => {
          const avg = cards.length ? Math.round(cards.reduce((acc, c) => acc + c.rating, 0) / cards.length) : 0;
          return { current: avg, target: 82, met: avg >= 82 };
        }
      },
      {
        id: 'req-prog1-presence',
        description: 'Min. 3 Program One or Custom Cards',
        check: (cards) => cards.filter(c => c.program === 'Program One' || c.isCustom).length >= 3,
        progress: (cards) => {
          const count = cards.filter(c => c.program === 'Program One' || c.isCustom).length;
          return { current: count, target: 3, met: count >= 3 };
        }
      }
    ]
  }
];
