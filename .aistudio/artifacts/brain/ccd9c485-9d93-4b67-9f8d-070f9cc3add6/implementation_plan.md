# Implementation Plan: Hall of FUT Spanish Legends (Two Progressive Set Rewards: Xavi 99 & Di Stéfano 99)

Expand the **Hall of FUT** program with **20 new Spanish edition cards**, structured into a **progressive 2-tier set collection** where collecting any 10 unique players awards **Xavi 99 CM**, and assembling all 19 cards (the 18 players plus Xavi) unlocks the supreme master reward: **Alfredo Di Stéfano 99 ST**.

---

## User Specifications & Answers
1. **Cards Included**:
   - **18 Collectible Players**: Aleix Febas (87), Álex Baena (92), Carlos Espí (86), César Tárrega (80), Chupe (82), David Soria (89), Fran García (86), Iago Aspas (88), Iker Muñoz (79), Iñigo Vicente (86), Isi (87), Jesús Navas (89), Laporte (93), Mella (80), Moleiro (92), Oyarzabal (90), Pacheco (80), Urko González (84).
   - **Set Reward 1**: **Xavi 99 CM** (FC Barcelona, 88 PAC, 86 SHO, 99 PAS, 99 DRI, 77 DEF, 78 PHY, Tiki-Taka+).
   - **Set Reward 2 (Apex Master)**: **Alfredo Di Stéfano 99 ST** (Real Madrid, 96 PAC, 99 SHO, 98 PAS, 99 DRI, 75 DEF, 99 PHY).
2. **Two Progressive Set Tiers**:
   - **Tier 1 (Spanish Masters)**: Claim any **10 unique players** from this series to claim **Xavi 99 CM**.
   - **Tier 2 (Immortal Apex)**: Collect all **19 cards** (all 18 players + Xavi 99 CM) to unlock **Di Stéfano 99 ST**.
3. **Display Format**:
   - Connected progressive tiers in the vertical expandable set collections list, clearly showing Tier 1 unlocking into Tier 2.

---

## Proposed Changes

### 1. Card Definitions & SVG Rendering (`src/data/hallOfFutSpanishCards.ts` or `src/data/hallOfFutCards.ts`)
- Define all 18 collectible players with their exact stats, positions, clubs, nations, and ratings from the user's uploaded images.
- Generate high-fidelity dynamic card SVGs preserving the custom Hall of FUT card artwork (Grey Base & Red Upgrade themes).
- Define the two exclusive set reward cards:
  - `XAVI_SET_REWARD`: 99 CM, FC Barcelona, `isSetRewardOnly: true`.
  - `DI_STEFANO_SET_REWARD`: 99 ST, Real Madrid, `isSetRewardOnly: true`.

### 2. Progressive Set Definitions (`src/types/card.ts` & `src/data/hallOfFutCards.ts`)
- Update `CardSetDefinition` to support progressive tiers:
  - `tier`: 1 or 2.
  - `parentSetId` (optional link to previous tier).
  - `requiresSetRewardId` (Tier 2 requires `XAVI_SET_REWARD.id`).
  - `requiredPlayerCount`: 10 for Tier 1 (any 10 from the 18 pool), 19 for Tier 2 (all 18 + Xavi).
- Export both sets in `AVAILABLE_CARD_SETS`:
  1. `Hall of FUT: Spanish Legends (Tier 1 - Xavi 99)`
  2. `Hall of FUT: Spanish Legends (Tier 2 - Di Stéfano 99)`

### 3. Progressive Set Hub UI (`src/components/SetRewardsHub.tsx`)
- Enhance the expandable set view to render connected progressive tiers:
  - Visual connector badge indicating "Tier 1: Collect any 10 cards to unlock Xavi 99" ➔ "Tier 2: Collect all 18 cards + Xavi 99 to unlock Di Stéfano 99".
  - Live progress counters for each tier:
    - Tier 1: `X / 10 Unique Players` (Unlocks Xavi 99 CM).
    - Tier 2: `X / 19 Cards` (Locked until Xavi is in Club, unlocks Di Stéfano 99 ST).
  - Album grid showing the 18 Spanish players + Xavi + Di Stéfano with clear ownership status.
  - Sound effects, confetti, and celebratory modals for claiming both Xavi and Di Stéfano.

### 4. Pack & Store Integration (`src/data/cardSets.ts` / `src/App.tsx`)
- Add all 18 collectible Spanish Hall of FUT cards to `allCardsPool` so they can be obtained from:
  - The **Daily Reward Pack** (12–15 cards per rip).
  - The **Pack Store** (Hall of FUT Packs & Promo Packs).
  - The **Transfer Market**.

---

## Verification Plan
1. **Compilation Check**: Run `lint_applet` and `compile_applet` to ensure type safety.
2. **Tier 1 Progression**: Verify that collecting any 10 unique Spanish Hall of FUT players enables the "Claim Xavi 99 CM" button.
3. **Tier 2 Progression**: Verify that Tier 2 checks for all 18 players plus Xavi in the Club before unlocking Di Stéfano 99 ST.
4. **Duplicate Safeguard**: Ensure duplicates do not count toward unique card progression.
