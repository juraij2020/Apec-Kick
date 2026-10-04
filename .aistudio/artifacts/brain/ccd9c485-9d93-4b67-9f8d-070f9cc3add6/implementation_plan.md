# Implementation Plan: Signature Series Collection & Grand Set Rewards

Introduce the official **Signature Series** card program featuring authentic golden **autograph script replacing player names**, a progressive milestone system unlocking 99-rated stars, and the grand culmination granting the **Final Four 99 Legends: Messi, Cristiano Ronaldo, Pelé, and Ronaldo Nazário**.

---

## User Specifications & Verified Answers
- **Card Styling**: Black/green-gold geometric crystal shield with golden borders matching the 20 uploaded cards.
- **Autograph Feature**: Every card displays a **golden cursive signature script** in place of the standard block font name.
- **Set Progression**: Progressive milestone tiers unlocking the 99-rated Signature cards, culminating in the final set reward.
- **The 20 Exact Cards from Uploads**:
  - **Collectible Set (10 Players)**:
    1. Douglas Luiz (79 CDM) · Juventus
    2. Lacroix (83 CB) · Chelsea
    3. Ferran Torres (83 ST) · PSG
    4. Alvarez (85 ST) · Atlético Madrid
    5. Fernández (85 CM) · Man City
    6. Mbappé (89 ST) · Real Madrid
    7. Insigne (89 CAM) · Napoli
    8. Dembélé (90 ST) · PSG
    9. Maradona (90 CAM) · Napoli
    10. Esposito (92 ST) · Cagliari/Bologna
  - **Progressive Milestone 99 Rewards**:
    - Collect 2: Gareth Bale (99 RW)
    - Collect 4: Bradley Barcola (99 LW)
    - Collect 6: Michael Olise (99 RM)
    - Collect 8: Antoine Semenyo (99 LM)
    - Collect 10: Paolo Maldini (99 CB)
    - Collect 12: Yaya Touré (99 CM)
  - **Grand Ultimate Set Reward (Complete Set)**:
    - **All 4 Legendary 99 Signature Cards**:
      1. Lionel Messi (99 CAM) · Barcelona
      2. Cristiano Ronaldo (99 ST) · Real Madrid
      3. Pelé (99 CAM) · Santos
      4. Ronaldo Nazário (99 ST) · Real Madrid

---

## Proposed Changes

### 1. Card Model & Autograph Rendering (`src/types/card.ts` & `src/data/cardSvgGenerator.ts`)
- Add `'signature_autograph'` to `CardRarity` and `CardStyle`.
- In `generateUserCardSvg`:
  - When `cardStyle === 'signature_autograph'`, render a signature styling layer:
    - Flowing golden cursive font (`font-family: 'Brush Script MT', 'Dancing Script', 'Pacifico', cursive`)
    - Subtle tilt (-4deg to -6deg) and gold-foil drop-shadow filter.
    - Custom SVG autograph flourishes and pen strokes beneath the text.
  - Green-gold/black geometric crystal shield gradients matching the uploaded cards.

### 2. Signature Series Cards Database (`src/data/signatureCards.ts`)
- Define all 20 players with exact ratings, positions, clubs, nations, and stats from the images.
- Provide custom cursive signature data and PlayStyle+ badges.
- Export utility functions:
  - `SIGNATURE_COLLECTIBLE_CARDS`: The 10 base set cards.
  - `SIGNATURE_99_TIER_REWARDS`: The 6 progressive 99 rewards (Bale, Barcola, Olise, Semenyo, Maldini, Touré).
  - `SIGNATURE_FINAL_FOUR_LEGENDS`: Messi 99, CR7 99, Pelé 99, Ronaldo 99.

### 3. Signature Pack in Store & Vault (`src/data/packs.ts`)
- Add the **"Signature Series Showcase Pack"**:
  - Contains guaranteed Signature Series cards with chances to pull base set players.
  - Custom pack art and theme matching the green-gold obsidian foil.

### 4. Interactive Set Rewards Hub Integration (`src/components/SetRewardsHub.tsx`)
- Add a dedicated **Signature Series Collection** showcase:
  - Grid of the 10 collectible cards showing owned vs unowned status.
  - **Milestone Reward Track**: Visual path unlocking Bale 99 ➔ Barcola 99 ➔ Olise 99 ➔ Semenyo 99 ➔ Maldini 99 ➔ Touré 99 as cards are acquired.
  - **The Grand Finale Vault**: Unlocks when milestones are met, letting the user claim the 4 GOATs (Messi, CR7, Pelé, R9) into their Club with confetti and fanfare!

---

## Verification Plan
1. **Compilation Check**: Run `lint_applet` and `compile_applet`.
2. **Card Visual Check**: Verify that Signature cards display golden cursive autographs in place of standard player names.
3. **Set Progression Check**: Verify that collecting cards tracks correctly, milestones unlock the 6 99-rated cards, and the Grand Finale claims Messi, CR7, Pelé, and R9.
