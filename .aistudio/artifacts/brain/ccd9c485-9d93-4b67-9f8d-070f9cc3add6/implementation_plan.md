# Summer Transfers (Summer Basic) Card Series

A brand-new "Summer Transfers" card program featuring **Summer Basic** edition cards for landmark summer club transfers, styled with sunburst gold and tropical cyan ocean gradients, distributed through Store Packs and dedicated Summer SBC challenges.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following user preferences were confirmed during Phase 1 interactive clarification:
> - **Visual Theme & Palette**: Sunburst gold and tropical cyan ocean gradients (`#06b6d4`, `#0891b2`, `#f59e0b`, `#fbbf24`).
> - **Card Program & Roster**: "Summer Basic" cards exclusively celebrating summer transfers with updated club badges and ratings.
> - **Acquisition Channels**: Available in Store Packs (new dedicated Summer Transfers Pack + standard pack pool chances) and custom Summer Squad Building Challenges (SBCs).

- **Confirmed Decision 1**: Visual shield design utilizes an animated sunburst gold radial core framed by a vibrant tropical cyan ocean border with a distinct "SUMMER TRANSFERS" header notch.
- **Confirmed Decision 2**: Acquisition includes both direct store pack openings and puzzle-based Summer SBCs so players can either test their pack luck or trade duplicate squads for guaranteed Summer Basic stars.

---

## 1. Overview & Core Concept

- **What It Does**: Introduces the **Summer Transfers** card category (`summer_transfers` rarity, `summer_basic` card style). Players can discover marquee transferred athletes at their new clubs (e.g. Kylian Mbappé at Real Madrid, Michael Olise at Bayern Munich, Julián Álvarez at Atlético Madrid, Riccardo Calafiori at Arsenal, Dani Olmo at Barcelona) with custom Summer Basic visuals, enhanced PlayStyles, and updated chemistry links.
- **Target Audience / Persona**: Card collectors, squad builders, and football fans eager to build modern squads with the latest blockbuster summer moves.
- **Key Value**: Expands the game's collectible depth with a vibrant, seasonal card aesthetic, rewarding both pack-opening enthusiasts and strategic SBC solvers.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Store Exploration**: Player browses the Pack Store and finds the new **"Summer Transfers Pack"** featuring tropical cyan and sunburst gold branding, guaranteed to contain at least 1 Summer Basic transfer player.
2. **Pack Opening Ceremony**: Opening a Summer Pack triggers a tropical cyan and gold fireworks reveal animation displaying the player's new club badge, summer notch banner, and boosted attributes.
3. **Summer SBC Challenges**: In the SBC Hub, players find the **"Summer Signings Debut"** and **"Blockbuster Summer Swap"** SBCs, requiring tactical squad ratings in exchange for tradeable/untradeable Summer Basic stars.
4. **Club Gallery & Squad Builder**: Filter club cards by "Summer Transfers" rarity, seamlessly slotting them into active squads with appropriate league/nation chemistry.

### Visual Identity & Theme

- **Aesthetic Direction**: High-energy coastal festival theme celebrating summer moves, blending clean modern card architecture with sun-drenched sunburst gold and deep ocean cyan gradients.
- **Color Palette & Mood**:
  - *Dominant Ocean Cyan*: `#06b6d4` (Cyan 500) to `#0e7490` (Cyan 700).
  - *Sunburst Accent Gold*: `#f59e0b` (Amber 500) to `#fbbf24` (Amber 400).
  - *Deep Navy Slate Background*: `#08101e` to `#0f172a` ensuring WCAG AA contrast.
  - *Notch & Metallic Foil*: Prismatic cyan shimmer with gold typography.
- **Typography & Hierarchy**:
  - Card Name & Header: Bold condensed uppercase (`font-black tracking-tight`).
  - Card Tier Banner: "SUMMER TRANSFERS" in sunburst gold with cyan sub-lining.
  - Tabular Stats: Monospace tabular numerals (`tabular-nums font-bold`) for crisp rating comparison.
- **Component Styling & Layout**:
  - Responsive card shield SVG with dual-tone gradient stops (`url(#summerBorderGrad)` & `url(#summerShieldGrad)`).
  - Shimmering sunburst rays in the SVG background pattern.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Dedicated Roster vs Overwriting Existing Base Cards
- **Chosen Approach**: Create a dedicated `SUMMER_BASIC_CARDS` collection in `src/data/summerCards.ts` with explicit summer transfer clubs and `summer_transfers` rarity, rather than overwriting base cards.
- **Why**: Keeps base cards intact for standard play and SBC requirements, while offering players a distinct, highly sought-after seasonal edition.
- **Alternatives Considered**: In-place club mutations of base cards (rejected because it would disrupt existing user saved squads and SBC formulas).

### Decision 2: Acquisition Through Both Store Packs and SBCs
- **Chosen Approach**: Add a dedicated **Summer Transfers Pack** in `src/data/packs.ts` and add two themed Summer SBC challenges in `src/data/sbcs.ts`.
- **Why**: Directly aligns with the user's explicit request ("available in store packs,sbc") providing both instant coin-spend routes and gameplay-earned craft routes.
- **Alternatives Considered**: Exclusive store-only packs (rejected; excludes players who prefer earning cards through gameplay).

---

## 4. Technical Architecture & Data Strategy

```
┌───────────────────────────────────────────────────────────────┐
│                       App State (App.tsx)                     │
│  - allCards: SoccerCard[] (Base + HOF + Futmas + Summer)      │
│  - packs: PackDefinition[] (includes Summer Transfers Pack)   │
│  - sbcs: SBCChallenge[] (includes Summer Debut SBCs)          │
└───────────────────────────────┬───────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   Pack Store     │  │     SBC Hub      │  │   Club Gallery   │
│  - Summer Pack   │  │  - Summer Debut  │  │  - Summer Filter │
│  - Cyan/Gold FX  │  │  - Summer Swap   │  │  - Shield View   │
└──────────────────┘  └──────────────────┘  └──────────────────┘
        │                       │                       │
        └───────────────────────┼───────────────────────┘
                                ▼
              ┌───────────────────────────────────┐
              │      CardItem & SVG Generator     │
              │  - cardStyle: 'summer_basic'      │
              │  - Sunburst Gold + Tropical Cyan  │
              └───────────────────────────────────┘
```

### Data Model & State Updates

1. **`src/types/card.ts`**:
   - Add `'summer_transfers'` to `CardRarity`.
   - Add `'summer_basic'` to `CardStyle`.
   - Add `'summer_pack'` to `PackTheme`.
2. **`src/data/summerCards.ts`**:
   - Define marquee Summer Transfers (e.g. Mbappé to Real Madrid, Olise to Bayern, Álvarez to Atlético Madrid, Calafiori to Arsenal, Dani Olmo to Barcelona, Endrick to Real Madrid).
3. **`src/data/packs.ts` & `src/data/sbcs.ts`**:
   - Add "Summer Transfers Pack" with guaranteed Summer Basic card odds.
   - Add Summer SBCs with themed requirements and Summer Basic rewards.
4. **`src/data/defaultCards.ts` & `src/components/CardItem.tsx`**:
   - Implement `isSummerBasic` shader branches in SVG generator: tropical cyan `#06b6d4` & sunburst gold `#f59e0b` gradient stops, custom banner badge, and sun ray background overlay.
