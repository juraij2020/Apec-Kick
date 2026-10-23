# Implementation Plan: Market Evolution Cards & 118 Stam Master Reward

Implement the Market Evolution Cards system where 5 base cards are purchased exclusively from the Transfer Market and upgraded through multi-stage objectives in the Evolution Hub, unlocking the gated 103 → 118 Stam Master Evolution and Grand Set Reward.

---

## 1. Card Rosters & Visual Assets (`src/data/marketEvolutionCards.ts`)
Define 5 base cards (purchasable on Market) and their highest evolved forms (earned via Evolution):

1. **Enzo Francescoli (CAM)**
   - **Base**: 95 CAM · Uruguay · Liga Profesional (`/assets/aistudio/Francescoli_82618683.png`)
   - **Max Evolution**: 117 CAM (`/assets/aistudio/Francescoli__1__0848cfbe.png`)
2. **Antonio Di Natale (ST)**
   - **Base**: 100 ST · Italy · Serie A (`/assets/aistudio/Di_Natale_6118a7db.png`)
   - **Max Evolution**: 109 ST (`/assets/aistudio/Di_Natale__1__3ad7c80d.png`)
3. **Rafael Márquez (CB)**
   - **Base**: 101 CB · Mexico · La Liga (`/assets/aistudio/M_rquez_d021b3a1.png`)
   - **Max Evolution**: 115 CB (`/assets/aistudio/M_rquez__1__b29373d6.png`)
4. **Ricardo Carvalho (CB)**
   - **Base**: 94 CB · Portugal · Liga Portugal (`/assets/aistudio/Ricardo_Carvalho_080af17b.png`)
   - **Max Evolution**: 115 CB (`/assets/aistudio/Ricardo_Carvalho__1__62f6d7bd.png`)
5. **Jaap Stam (CM)**
   - **Base**: 103 CM · Netherlands · Premier League (`/assets/aistudio/Stam_ae7aeb60.png`)
   - **Master Evolution / Set Reward**: 118 CM (`/assets/aistudio/Stam__1__3551a8ee.png`)

---

## 2. Transfer Market Integration
- Pre-populate all 5 base cards (Francescoli 95, Di Natale 100, Márquez 101, Carvalho 94, Stam 103) into initial market listings with reasonable pricing (e.g. 50,000–95,000 coins).
- Add a dedicated **"Market Evolution"** filter tab in `TransferMarket.tsx` so users can immediately view, bid on, and buy these base cards.

---

## 3. Evolution Hub Gameplay (`src/components/EvolutionHub.tsx`)
- Add a top-level mode switcher: **Market Evolution Legends** vs **Saka Academy**.
- For each base card owned in the Club:
  - Display current stage, target card preview, and multi-stage objectives (e.g., Level 1: Play 3 matches, Level 2: Score goals / clean sheets, Level 3: Win matches).
  - Track live progress through match simulator / daily gameplay, plus quick "Play Match / Simulate" and "⚡ Instant Complete" dev assist buttons.
  - Upgrading converts the base card into its final max-rated card in the Club, with celebratory walkout fanfare.
- **118 Stam Gated Unlock**:
  - In Evolution, Stam 103's pathway remains locked as a preview until all 4 base cards (Francescoli, Di Natale, Márquez, Carvalho) have reached their final evolved rating.
  - Once the 4 are complete, Stam's Master Evolution unlocks, allowing the player to evolve 103 Stam to **118 Stam CM**.

---

## 4. Set Rewards Hub Integration (`src/components/SetRewardsHub.tsx`)
- Add a dedicated **Market Evolution (118 Stam)** tab.
- Displays the 4-card evolution tracker, with 118 Stam shown as a preview.
- When all 4 cards are evolved and Stam reaches 118, players claim the Grand Set Reward (+ 500,000 bonus coins).

---

## 5. Verification Plan
- Verify clean compilation via `lint_applet` and `compile_applet`.
- Verify market purchasing, evolution objective progression, and Set Rewards claim flow.
