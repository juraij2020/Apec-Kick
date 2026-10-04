# Set Rewards & Hall of FUT Collection Implementation Plan

Introduces a brand new **Set Rewards** feature and the **Hall of FUT** collection. Players collect 18 distinct Hall of FUT players (combining the **Grey Base** and **Red Upgrade** designs) in their Club to unlock the exclusive **99 ST Harry Kane** Set Reward player card.

***

### 1. User Requirements & Specifications

> [!IMPORTANT]
> - **Collection Identity**: **Hall of FUT** (distinct from *Hall of Fame*).
> - **Card Designs**:
>   - **Grey Design**: **Hall of FUT Base** (81–88 OVR).
>   - **Red Design**: **Hall of FUT Upgrade** (90–98 OVR).
> - **Set Objective**: Collect **18 unique Hall of FUT players** across Base and Upgrade.
> - **Duplicate Rule**: Duplicates do **not** count towards the 18 total. You must collect 18 distinct individual players in your Club.
> - **Set Reward**: **Harry Kane 99 ST** (Bayern Munich / Bundesliga, 99 OVR, 99 SHO, 92 PAS, 91 DRI, 92 PHY).
> - **Exclusive Reward Condition**: Harry Kane is **only** obtainable through Set Rewards. He cannot be packed, bought on the market, or drafted.
> - **New Dedicated Tab**: **Set Rewards** in the main navigation.

***

### 2. Player Roster Breakdown (From User Uploaded Cards)

#### A. Hall of FUT Base (Grey Design - 9 Players)
1. **Walton** - 81 GK (Ipswich Town / Premier League / England)
2. **Grimes** - 83 CDM (Coventry City / Premier League / England)
3. **Butland** - 84 GK (Hull City / Premier League / England)
4. **Hackney** - 85 CM (Everton / Premier League / England)
5. **Hudson-Odoi** - 85 LM (Nottingham Forest / Premier League / England)
6. **Pope** - 86 GK (Newcastle United / Premier League / England)
7. **Welbeck** - 87 ST (Chelsea / Premier League / England)
8. **Calvert-Lewin** - 88 ST (Leeds United / Premier League / England)
9. **Solanke** - 88 ST (Tottenham Hotspur / Premier League / England)

#### B. Hall of FUT Upgrade (Red Design - 9 Players)
10. **Rashford** - 90 LW (Manchester United / Premier League / England)
11. **Wharton** - 91 CM (Crystal Palace / Premier League / England)
12. **Foden** - 92 CAM (Manchester City / Premier League / England)
13. **Haynes** - 92 CAM (Fulham / Premier League / England)
14. **Beckham** - 94 RM (Manchester United / Premier League / England)
15. **Konsa** - 94 CB (Arsenal / Premier League / England)
16. **Rogers** - 94 CAM (Chelsea / Premier League / England)
17. **Owen** - 97 ST (Liverpool / Premier League / England)
18. **Clough** - 98 ST (Sunderland / Premier League / England)

#### C. The Grand Set Completion Reward (1 Player)
19. **Harry Kane** - **99 ST** (FC Bayern Munich / Bundesliga / England)
    - *Stats*: 71 PAC | 99 SHO | 92 PAS | 91 DRI | 58 DEF | 92 PHY
    - *Exclusivity*: `isSetRewardOnly: true` (strictly excluded from pack pools and market).

***

### 3. Architecture & Feature Modules

#### A. Card Generation & Styling (`src/data/cardSvgGenerator.ts` & `src/data/hallOfFutCards.ts`)
- Implement custom SVG generators for:
  - `hall_of_fut_base`: Sleek brushed-metallic grey and shattered crystal shield design with angular dark chrome borders.
  - `hall_of_fut_upgrade`: Crimson red and liquid shattered gold shield design with obsidian trim matching the uploaded cards.
- Add full player statistics, clubs, positions, nations, and playstyles for all 19 cards.
- Integrate the 18 collectible cards into `allCardsPool` with `program: 'Hall of FUT'`. Exclude Kane 99 from standard random pack distribution.

#### B. Set Rewards Hub Component (`src/components/SetRewardsHub.tsx`)
- **Header Overview**: Set banner, active collection status, completion progress bar (`X / 18 Players Collected`), and claim status.
- **Featured Reward Showcase**:
  - Grand 3D showcase of Harry Kane 99 ST with stats, PlayStyle+ badge, and "Exclusive Set Reward" shield.
  - Interactive "Claim Set Reward" button that unlocks only when 18 unique players are detected in `clubCards`.
  - Claim flow: awards Kane to `clubCards`, triggers walkout celebration fanfare and confetti, and marks the set completed.
- **18-Card Collector Album Grid**:
  - Filter toggle: `All (18)` / `Owned (X)` / `Missing (Y)` / `Base (9)` / `Upgrade (9)`.
  - Owned cards: Full color, glowing holographic border, and "In Club" badge.
  - Missing cards: Darkened silhouette card with player name, position, rating target, and "Need to Collect" badge.
  - Duplicate detection: Clear explanation showing that duplicates do not count toward set completion.

#### C. Navigation & Store Integration (`src/App.tsx` & `src/data/packs.ts`)
- Add `'set_rewards'` tab in top navigation and mobile nav bar with a trophy icon and live completion indicator (e.g. `12/18`).
- Add a **Hall of FUT Booster Pack** in the Pack Store so players can acquire Hall of FUT cards.
- Add `'Hall of FUT'` option to Transfer Market and My Club filters.

***

### 4. Step-by-Step Implementation Flow

1. **`src/types/card.ts`**:
   - Add `CardStyle` values: `'hall_of_fut_base'` and `'hall_of_fut_upgrade'`.
   - Add `isSetRewardOnly?: boolean` to `SoccerCard`.
   - Define `CardSetReward` and `SetCollectionProgress` interfaces.
2. **`src/data/cardSvgGenerator.ts`**:
   - Add SVG styling generators for `hall_of_fut_base` (grey geometric shattered shield) and `hall_of_fut_upgrade` (crimson & gold shattered crystal).
3. **`src/data/hallOfFutCards.ts` (NEW)**:
   - Define all 18 collectible players + Kane 99 Set Reward with exact stats and metadata.
4. **`src/data/defaultCards.ts`**:
   - Export and include the 18 collectible cards into the main card pool.
5. **`src/components/SetRewardsHub.tsx` (NEW)**:
   - Build the interactive Set Rewards Collector Hub with progress tracking, 18-card album, Kane 99 reward modal, and claim handler.
6. **`src/data/packs.ts`**:
   - Add "Hall of FUT Special Pack" to the store.
7. **`src/App.tsx`**:
   - Mount the `Set Rewards` tab and handle reward claiming into `clubCards`.
8. **Verification & Testing**:
   - Verify linting (`lint_applet`) and production compilation (`compile_applet`).
   - Validate duplicate handling (collecting 2 of the same card only counts as 1 towards the 18).
   - Verify Harry Kane is strictly awarded upon completing the 18 unique cards.
