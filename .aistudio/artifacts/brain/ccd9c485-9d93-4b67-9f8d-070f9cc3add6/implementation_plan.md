# Implementation Plan: Card Evolutions Hub (Bukayo Saka 75 ➔ 98 OVR)

Create a dedicated **Evolutions** tab featuring a **free starter 75 OVR Bukayo Saka** card, an **Evolution Points** economy earned across the entire game (Daily Objectives, Matches, Mini-Games, and Packs), and a **random stat training system** that progressively upgrades Saka through all 14 stages up to his supreme **98 OVR** card.

---

## User Specifications & Answers
- **New Tab**: Dedicated "Evolutions" navigation tab with custom DNA icon.
- **Starting Card**: Free **75 OVR LB Bukayo Saka** automatically granted to the user.
- **Point Earning**:
  - Daily Objectives (+100 Evo Points per objective claimed)
  - Match Simulator / Clash (+35 Evo Points per win, +15 per match played)
  - Mini-Games (+25 Evo Points per successful game)
  - Pack Openings (+5 Evo Points per rip)
- **Upgrade Mechanic**:
  - Spend Evolution Points to **roll random attribute upgrades** (+1 to a random stat that has not yet reached the next stage target).
  - When all 6 attributes reach the target threshold of the next tier, the card **automatically evolves** to the next OVR stage (triggering fanfare, confetti, updated card visual, and position adjustments).
- **Evolution Stages (14 Total)**:
  1. Stage 0 (Starter): **75 LB** (75 PAC · 75 SHO · 73 PAS · 75 DRI · 64 DEF · 63 PHY)
  2. Stage 1: **84 LB** (84 PAC · 84 SHO · 82 PAS · 84 DRI · 73 DEF · 72 PHY)
  3. Stage 2: **85 RM** (85 PAC · 85 SHO · 83 PAS · 85 DRI · 74 DEF · 73 PHY)
  4. Stage 3: **86 RW** (86 PAC · 86 SHO · 83 PAS · 86 DRI · 75 DEF · 72 PHY)
  5. Stage 4: **87 RW** (87 PAC · 87 SHO · 85 PAS · 87 DRI · 76 DEF · 75 PHY)
  6. Stage 5: **88 RW** (88 PAC · 88 SHO · 86 PAS · 88 DRI · 77 DEF · 76 PHY)
  7. Stage 6: **89 RW** (89 PAC · 89 SHO · 87 PAS · 89 DRI · 78 DEF · 77 PHY)
  8. Stage 7: **90 RW** (90 PAC · 90 SHO · 88 PAS · 90 DRI · 79 DEF · 78 PHY)
  9. Stage 8: **91 RW** (91 PAC · 91 SHO · 89 PAS · 91 DRI · 80 DEF · 79 PHY)
  10. Stage 9: **92 RW** (92 PAC · 92 SHO · 90 PAS · 92 DRI · 81 DEF · 80 PHY)
  11. Stage 10: **93 RW** (93 PAC · 93 SHO · 91 PAS · 93 DRI · 82 DEF · 81 PHY)
  12. Stage 11: **95 RW** (95 PAC · 95 SHO · 93 PAS · 95 DRI · 84 DEF · 83 PHY)
  13. Stage 12: **97 CAM** (97 PAC · 97 SHO · 95 PAS · 97 DRI · 86 DEF · 85 PHY)
  14. Stage 13 (Apex Master): **98 RW** (98 PAC · 98 SHO · 96 PAS · 98 DRI · 87 DEF · 86 PHY)

---

## Proposed Changes

### 1. Evolution Stages Data & Card Generator (`src/data/evolutionSaka.ts`)
- Define the 14 evolution stages with their exact ratings, positions, stats, and card styles (`evolution_emerald` & `evolution_gold_apex`).
- Generate dynamic SVGs for each stage using custom DNA emerald and apex gold border designs.
- Export helper functions:
  - `getEvoStage(stageIndex: number): EvolutionStage`
  - `canEvolveToNextStage(currentStats, nextStageStats): boolean`

### 2. Evolution State & Storage Management (`src/types/card.ts` & `src/App.tsx`)
- Add `evoPoints` and `sakaEvoState` to persistent state:
  - `currentStageIndex`: number (starts at 0 = 75 OVR).
  - `currentStats`: { pac, sho, pas, dri, def, phy }.
  - `claimedFreeStarter`: boolean.
- Distribute Evolution Points across user activities:
  - In `handleAwardMatchPrize`: add +35 Evo Points.
  - In `DailyObjectives`: award +100 Evo Points per task claimed.
  - In `MiniGamesHub`: award +25 Evo Points on wins.
  - In `handleIncrementPacksOpened`: award +5 Evo Points.
- Sync the evolved Saka card automatically with `clubCards` so the user can immediately play him in their Squad!

### 3. Dedicated Evolution Hub Component (`src/components/EvolutionHub.tsx`)
- Interactive DNA-themed UI featuring:
  - **Live Card Showcase**: Displaying the active evolving Saka card with live glowing stat counters.
  - **Stage Progress Bar & Roadmap**: Visual chain displaying all 14 stages (75 ➔ 84 ➔ 85 ... ➔ 98).
  - **Target Stat Radar**: Shows current stat vs target stat for each of the 6 attributes (PAC, SHO, PAS, DRI, DEF, PHY) with animated progress indicators.
  - **"🎲 Train Random Stat" Button**: Consumes 10 Evo Points to randomly upgrade one eligible stat by +1 with sound effects and floating numbers.
  - **"⚡ Train x5" & "⚡ Train All Available"**: Multi-train buttons for convenient fast training.
  - **Stage Evolution Celebration**: When all 6 attributes match the target stats, triggers an evolution fanfare sequence and transforms the card to the next tier!

### 4. Navigation & App Integration (`src/App.tsx`)
- Add `'evolution'` to `NavTab` with a glowing DNA / Sparkles icon.
- Header counter displaying live **🧬 Evo Points** alongside coins.

---

## Verification Plan
1. **Compilation Check**: Run `lint_applet` and `compile_applet`.
2. **Starter Grant**: Verify that opening the Evolution tab or launching the app grants the free 75 OVR LB Saka card.
3. **Point Earning**: Verify that matches, mini-games, objectives, and pack openings award Evo Points.
4. **Random Attribute Roll**: Confirm that clicking "Train Stat" rolls an attribute that needs points and updates live.
5. **Auto-Evolution**: Confirm that completing all 6 stats triggers the evolution animation and updates Saka to the next tier.
