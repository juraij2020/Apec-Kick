# Street Kings Event: Haneen Mustafa 92 CM (THARAVAADEES · TKM)

Introduce the high-octane **Street Kings** card event headlined by community star **Haneen Mustafa (92 OVR CM)** from club **THARAVAADEES** in the **TKM League**, featuring urban turf & graffiti card aesthetics, event packs with clear pack odds, Transfer Market live bidding, mini-game pool integration, and a dedicated Squad Building Challenge (SBC).

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following specifications were confirmed in Phase 1 clarification:
> - **Visual Theme**: *Street Kings* aesthetic with urban concrete, electric neon graffiti trims, spray-paint accents, and rugged street turf backgrounds.
> - **Player Profile**: Haneen Mustafa as a **92 OVR Central Midfielder (CM)**, Playmaker archetype with elite passing (96 PAS), silky dribbling (95 DRI), rapid tempo (88 PAC), pinpoint shooting (89 SHO), and signature PlayStyle+ (*Incisive Pass+* & *Technical+*).
> - **Event Scope**: Comprehensive feature rollout spanning **Event Packs with published drop odds**, **Transfer Market listings**, **Higher or Lower & Guess Who mini-games**, and a dedicated **Street Kings SBC**.

- **Confirmed Decision 1**: Haneen Mustafa's card features his dynamic player cutout portrait flexing his biceps in a THARAVAADEES electric cyan football kit with glowing neon Street Kings borders.
- **Confirmed Decision 2**: Introduce a dedicated Street Kings card program & rarity tier (`street_kings`) with distinctive animated neon graffiti borders, spray tags, and glowing dark turf textures.
- **Confirmed Decision 3**: Add two specialized Street Kings packs to the Pack Store & My Packs:
  1. *Street Kings Underground Vault* (22,000 Coins / guaranteed 90+ Street Kings walkout with high Haneen drop odds).
  2. *Street Kings Turf Booster* (6,500 Coins / 82+ guaranteed with Street Kings chances).
- **Confirmed Decision 4**: Create a custom Squad Building Challenge: *"Street Kings: The Pride of Tharavaadees"* rewarding an untradeable 92 OVR Haneen Mustafa card + 15,000 bonus coins.
- **Confirmed Decision 5**: Add Haneen Mustafa and Street Kings contenders into the Transfer Market with live market price trends, as well as the Higher or Lower and Guess Who mini-game pools.
- **Confirmed Decision 6**: Added the 'Daily Objectives' tab featuring 3 dynamic daily tasks ('Pack Hunter', 'Pitch Victor', 'Squad Strategist') with progress tracking, UTC midnight reset countdown, individual task rewards, and a grand 2,500 coins + Daily Bonus Pack group claim.

---

## 1. Overview & Core Concept

- **What It Does**:
  - Launches a full-scale in-game promo event titled **Street Kings**, celebrating grassroots urban soccer culture.
  - Headlined by user's friend **Haneen Mustafa (92 OVR CM)** representing **THARAVAADEES** in the **TKM League**.
  - Embeds Haneen's real-world likeness directly into the soccer card engine with custom PlayStyle+ perks, signature stats, and an urban turf aesthetic.
  - Integrates the card across the entire game loop: Open Packs, Buy/Sell on Transfer Market, Earn in Mini-Games, and Craft in SBCs.

- **Target Audience / Persona**:
  - Players wanting fresh, personalized high-rated promo cards with real personal connections, engaging street culture aesthetics, and balanced competitive stats.

- **Key Value**:
  - Brings a personalized player card to life with full professional FUT presentation, matching the quality of official International Moments and Hall of Fame items.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Street Kings Event Showcase Banner**:
   - Prominent event banner across the app and pack store with neon magenta/cyan spray-tag typography and rugged street pitch textures.
   - Highlights: *"STREET KINGS INVASION: Haneen Mustafa 92 CM Masterclass Available in Packs, Market & SBCs Now!"*

2. **Opening Street Kings Packs**:
   - Players can purchase or earn *Street Kings Underground Vault* packs.
   - Transparent Pack Odds modal: shows exact probabilities (e.g. 100% 86+, 35% 90+, 12.5% Haneen Mustafa Walkout).
   - Full walkout animation triggers when pulling Haneen:
     - 🇮🇳 Country spotlight
     - CM Position spotlight
     - THARAVAADEES crest spotlight
     - Explosive graffiti explosion with neon confetti and crowd cheers!

3. **Street Kings SBC Challenge**:
   - Located in the SBC Challenges tab: *"Street Kings: Haneen Mustafa Special"*.
   - Requirements: 11-player squad, Min 83 Team Rating, Min 2 Midfielders, Min 70 Chemistry.
   - Reward: **Untradeable 92 OVR Haneen Mustafa Street Kings Item** + 15,000 Coins + Street Kings Mega Badge.

4. **Transfer Market Action**:
   - Haneen Mustafa is featured on the Transfer Market with fluctuating street demand (Hot trend indicator `+8%`), Buy Now options, and active bidding.

5. **Mini-Games Integration**:
   - In **Higher or Lower**: Haneen appears with his 92 OVR, 96 PAS, and 95 DRI, serving as a formidable comparison anchor and mystery opponent.
   - In **Guess Who**: Haneen is added as a mystery star with clues for club (THARAVAADEES), league (TKM), position (CM), and rating (92).

### Visual Identity & Theme

- **Aesthetic Direction**: Gritty urban street soccer, concrete cage pitches, fluorescent graffiti spray, stencil badges, and dark industrial contrast.
- **Color Palette**:
  - Dominant Arena: Dark asphalt / midnight slate (`#0B0F19`, `#020617`)
  - Accent Neons: Electric Cyber Cyan (`#06B6D4`), Street Magenta (`#EC4899`), Bright Amber Flare (`#F59E0B`)
  - Pitch Green: Rugged cage turf green (`#10B981`)
- **Card Design**:
  - Custom border with subtle graffiti stencils and spray-paint splatters.
  - Position & rating block in electric cyan with sharp drop shadow.
  - Photo frame displaying Haneen's uploaded photo with athletic cutout treatment and vibrant edge glow.
  - Badges for THARAVAADEES crest and TKM League emblem.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Card Rarity & Program Structure**:
  - *Chosen Approach*: Add a new official program `Street Kings` and rarity `street_kings` with dedicated card frame styles in `CardItem.tsx`.
  - *Why*: Seamlessly fits into existing filter dropdowns (Program filter, quality filters, SBC requirements, and pack tags) without breaking existing base or icon cards.

- **Decision 2: Image Handling for Haneen Mustafa**:
  - *Chosen Approach*: Embed Haneen's uploaded photo into `src/assets/images/` as an optimized asset with cutout transparency or styled framed portrait, ensuring fast local rendering, high fidelity, and zero network dependency.

- **Decision 3: Stat & Meta Balance**:
  - *Chosen Approach*: 92 OVR with 88 PAC, 89 SHO, 96 PAS, 95 DRI, 82 DEF, 85 PHY, 5-Star Skill Moves, and *Incisive Pass+* & *Technical+* PlayStyles.
  - *Why*: Creates an elite, meta-defining playmaker suitable for endgame dream squads while maintaining competitive match simulator realism.

---

## 4. Technical Architecture & Data Strategy

### System Component Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Street Kings Event                            │
└───────────┬───────────────────┬───────────────────┬────────────────────┘
            │                   │                   │
   ┌────────▼─────────┐ ┌───────▼────────┐  ┌───────▼────────┐  ┌────────▼─────────┐
   │ Haneen Card Data │ │ Event Packs    │  │ SBC Challenge  │  │ Transfer Market  │
   │ - 92 OVR CM      │ │ - Vault (90+)  │  │ - 11 Players   │  │ - Seed Listings  │
   │ - THARAVAADEES   │ │ - Odds Modal   │  │ - 83 OVR Req   │  │ - Live Bidding   │
   │ - TKM League     │ │ - Walkouts     │  │ - 92 Card Rwd  │  │ - Dynamic Trends │
   │ - Custom Photo   │ └────────────────┘  └────────────────┘  └──────────────────┘
   └──────────────────┘
```

### Data Schema Extensions

```typescript
// Added to SoccerCard in src/types/card.ts
program: 'Street Kings' | 'International Moments' | 'Hall of Fame' | 'Futmas' | 'Program One' | 'Base Cards';
rarity: 'street_kings' | ... ;

// Haneen Mustafa Card Definition
export const HANEEN_MUSTAFA_CARD: SoccerCard = {
  id: 'sk-haneen-mustafa-92',
  name: 'Haneen Mustafa',
  rating: 92,
  position: 'CM',
  club: 'THARAVAADEES',
  league: 'TKM',
  nation: 'India',
  nationFlag: '🇮🇳',
  program: 'Street Kings',
  rarity: 'street_kings',
  stats: { pac: 88, sho: 89, pas: 96, dri: 95, def: 82, phy: 85 },
  playStylePlus: {
    id: 'incisive_pass',
    name: 'Incisive Pass+',
    shortDesc: 'Visionary line-breaking through balls with pinpoint curve',
    iconSymbol: '⚡',
    isPlus: true,
    statBoost: { attribute: 'pas', bonus: 16 },
  },
  price: 240000,
  photoUrl: '...',
};
```

---

## 5. Step-by-Step Implementation Strategy

1. **Step 1: Asset Preparation & Card Definition**:
   - Save and optimize Haneen Mustafa's photo into the assets directory.
   - Define the `street_kings` rarity styling in `src/components/CardItem.tsx` (graffiti borders, urban texture, neon cyan/magenta badge accents).
   - Add `HANEEN_MUSTAFA_CARD` and supplementary Street Kings contenders to `src/data/cards.ts` and `src/data/initialCustomCards.ts`.

2. **Step 2: Street Kings Packs & Published Odds**:
   - Add *Street Kings Underground Vault* and *Street Kings Turf Booster* to `src/data/packs.ts` with custom themes and guaranteed ratings.
   - Implement pack drop odds inspector in `src/components/PackOpening.tsx` and `src/components/MyPacksHub.tsx`.

3. **Step 3: Dedicated Street Kings SBC**:
   - Add *"Street Kings: Haneen Mustafa"* SBC challenge into `src/data/initialSBCs.ts` with balanced criteria and untradeable 92 CM reward.

4. **Step 4: Market & Mini-Games Pool Updates**:
   - Add Street Kings listings to `src/data/initialMarketListings.ts` with active trends.
   - Include Haneen Mustafa in Higher or Lower and Guess Who mini-game pools with accurate clues (Club: THARAVAADEES, League: TKM, Nation: 🇮🇳, Position: CM).

5. **Step 5: Event Showcase & Navigation**:
   - Feature Street Kings event banners in the app header, Pack Store, and My Club views.
   - Verify build and compilation with `compile_applet`.
