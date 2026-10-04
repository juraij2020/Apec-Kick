# Implementation Plan: Vertical Expandable Set Rewards Architecture

Support multiple sets in the **Set Rewards** tab using a **vertical expandable list of set collections**, establishing a clean, extensible foundation so new sets can be plugged in seamlessly in the future while currently displaying the active Hall of FUT set.

---

## User Preferences & Decisions
- **Layout Style**: Vertical expandable list of set collections (accordions with smooth expansion).
- **Scope**: Display the active **Hall of FUT** set as the primary live collection, built on a modular data-driven structure ready for future sets.

---

## Proposed Architecture & Changes

### 1. Data Structure Extensibility (`src/types/card.ts` & `src/data/cardSets.ts` or `src/data/hallOfFutCards.ts`)
- Maintain an exported registry array `AVAILABLE_CARD_SETS: CardSetDefinition[]`.
- Ensure each set definition includes:
  - `id`: unique set identifier (e.g., `'set-hall-of-fut'`).
  - `title`, `badge`, `subtitle`, `description`, `program`.
  - `requiredPlayerIds`: list of unique card IDs that must be in the Club.
  - `rewardPlayer`: untradeable master reward card (`isSetRewardOnly: true`).
  - `bonusCoins` (optional bonus coins on completion).
  - Status indicators (Active, Completed).

### 2. Multi-Set Vertical Expandable Component (`src/components/SetRewardsHub.tsx`)
- **State Management**:
  - `expandedSetId`: tracks which set collection is currently expanded (defaults to `'set-hall-of-fut'`).
  - `claimedSetIds`: persistent array of completed and claimed set IDs in `localStorage`.
- **Set Header Row / Summary Card (Collapsed & Expanded Header)**:
  - Set Icon / Badge (e.g. `👑 18-Card Master Set`).
  - Title and Program branding.
  - Live progress meter: `X / 18 Unique Players` with animated mini progress bar.
  - Status pill: `In Progress`, `Ready to Claim!`, or `Claimed ✓`.
  - Reward preview chip showing Harry Kane 99 ST miniature rating badge.
  - Expand / Collapse chevron toggle with smooth transition.
- **Expanded Body**:
  - **3D Interactive Master Reward Showcase**: Full Harry Kane 99 ST card, in-depth stat breakdown (71 PAC, 99 SHO, 92 PAS, 91 DRI, 58 DEF, 92 PHY, Finesse Shot+), and "Claim Set Reward" button.
  - **Collector Album Grid & Filters**: 18-card interactive album with filters (`All (18)`, `Owned`, `Missing`, `Base (9 Grey)`, `Upgrade (9 Red)`).
  - **Duplicate Enforcement**: Clearly indicates that duplicate cards in the user's club do not advance progress (each player must be unique).
  - **Claim Flow**: Triggers confetti, fanfare, and deposits the card to `clubCards`.

---

## Verification & Testing Plan
1. **Compilation & Type Check**:
   - Run `lint_applet` and `compile_applet` to confirm strict TypeScript typing.
2. **Expansion Interaction**:
   - Verify clicking the set header smoothly expands and collapses the collection view.
3. **Progress Accuracy**:
   - Verify duplicate cards in Club only count as 1 towards the 18 unique players.
4. **Claim & Persistence**:
   - Verify set claim state persists in `localStorage` under `apex_fut_claimed_sets_v1`.
