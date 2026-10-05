# Implementation Plan: Cursed Horror Snakes & Ladders & Germany Nations Collection

Introduce the **Germany Nations Collection** (featuring the German black-red-gold flag shield, Brandenburg Gate twilight silhouette, and 4-star DFB eagle crest) and the thrilling **Cursed Horror Snakes & Ladders** mini-game where cards, packs, and coins are earned on a haunted board filled with booby traps, flying bats and ghosts, 3-question national trivia quizzes on every landing, a terrifying central Ouija Board Nightmare event, and the ultimate end-of-board set reward: the **All-Time Germany Legendary XI (99 OVR)**.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Confirmed Choices from Phase 1 Interactive Clarifications**:
> - **Trivia Quiz Frequency**: Every landing triggers a 3-question German trivia quiz, regardless of whether that landing has rewards or traps. Passing trivia questions awards bonus dice/points or disarms hazards.
> - **Central Ouija Board Tile**: Every central tile of the board is an authentic cursed Ouija board that triggers the ultimate "Real Nightmare" sequence: moving planchette, blood-red fog vignette, screen shake, ghost/bat swarms, eerie audio wails, and phantom banishment.
> - **Navigation Placement**: Featured as a prominent game inside the existing **Mini-Games Hub** (with a top-level quick-access banner).
> - **Cards Included**: All 22 exact cards from user uploads:
>   - 11 Collectible Germany cards (Adeyemi 91, Brown 90, Can 87, Kimmich 97, Kroos 96, Musiala 96, Schlotterbeck 93, Tah 94, ter Stegen 87, Wirtz 95, Woltemade 87).
>   - 11 All-Time Germany Legendary XI Cards (Beckenbauer 99, Brehme 99, Breitner 99, Lahm 99, Matthäus 99, Netzer 99, Neuer 99, Rahn 99, Rummenigge 99, Sammer 99, Schnellinger 98) awarded as the grand prize upon reaching the finish!

---

## 1. Overview & Core Concept

- **What It Does**: Transports the player from standard pack opening into an eerie gothic football underworld. Instead of buying packs in the store, players roll dice on a 100-tile cursed Snakes & Ladders board to explore, unlock German national player cards, answer national football trivia, dodge haunted booby traps, survive the Ouija Nightmare, and reach the final sanctuary to claim the legendary All-Time Germany XI.
- **Target Audience**: Players who love interactive game modes, football trivia, Halloween/horror aesthetics, and collecting high-tier national cards.
- **Key Value**: Bridges active tactical gameplay (board navigation, dice rolling, trivia mastery) with card collection progression, creating high replayability and unforgettable audiovisual presentation.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Entering the Cursed Board**: Inside the Mini-Games Hub, the user selects **"🎃 Cursed Snakes & Ladders (Germany Edition)"**. Eerie atmospheric wind, distant bell tolls, and flying bat shadows set the mood.
2. **Rolling the Cursed Bone Dice**: The player rolls a 3D bone dice (1 to 6) to advance their cursed token along the winding cobblestone board.
3. **Landing & National Trivia Quiz**:
   - On landing, the game pauses for the **3-Question Germany Trivia Challenge** (questions drawn from an authentic pool of German football lore: 1954 Miracle of Bern, 1974 & 1990 & 2014 World Cup victories, Bundesliga legends, stadium records, and iconic national team moments).
   - Answering correctly disarms nearby traps, enhances card drop chances, and awards bonus coins.
4. **Tile Encounters & Hazards**:
   - **German Card Chests**: Directly awards one of the 11 Germany Nations cards into the user's Club!
   - **Booby Traps**: Cursed Guillotines, Spike Pits, and Haunted Snakes that hiss and strike, causing the player to slide back down the board.
   - **Bone Ladders**: Glowing spectral ladders that elevate the player across tiers.
   - **Flying Ghosts & Bats**: Interactive particle/animation effects that swoop across the screen with spatial sound effects when triggered.
5. **The Central Ouija Board Nightmare**:
   - Landing on tile 50 (or the center Ouija tiles) triggers the **"Real Nightmare"**: The lights flicker out, a glowing planchette spells out ominous messages ("TREMBLE", "DOOM", "GO BACK"), flying specters and bats swarm the screen, screen shake and blood-red vignette activate, and a sinister phantom laugh sends the token reeling into a random cursed rift!
6. **Victory at Tile 100**:
   - Reaching the 100th tile triggers the **Grand Germany All-Time XI Ceremony**: Confetti and spectral gold lightning burst as the player opens the **"All-Time Germany Legendary XI Pack"** containing all 11 immortal 98–99 legends.

### Visual Identity & Theme
- **Color Palette**: Deep midnight slate (`#020617`), gothic charcoal (`#090d16`), blood crimson (`#991b1b`), eerie phantom cyan (`#06b6d4`), German national gold (`#facc15`), and glowing emerald ectoplasm (`#10b981`).
- **Card Design**: German Flag Shield with dynamic black, crimson red, and gold radiant wave backdrop, Brandenburg Gate twilight silhouette, 4-star DFB eagle crest, and gold metallic bevels.
- **Horror Audio FX**: Synthesized and Web Audio effects for bat chirps, ghost wails, bone dice rattles, ominous bell chimes, trap snaps, and victorious gold fanfare.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Board Size & Mechanics**:
  - *Chosen Approach*: 100-tile (10x10) board with zigzag snake progression, featuring 8 ladders, 8 snakes, 12 card reward chests, 6 coin vaults, 1 central Ouija nightmare zone, and trivia modals on landing.
  - *Why*: 100 tiles is the universally recognized Snakes & Ladders layout, providing substantial adventure length while ensuring milestones and rewards happen every 2–3 turns.
- **Decision 2: Modular Multi-Nation Architecture**:
  - *Chosen Approach*: Separate nation definitions into a config object (`NATION_BOARDS`), with `'germany'` as the inaugural board, ready for future nations (e.g., `'brazil'`, `'argentina'`, `'france'`).
  - *Why*: User explicitly stated: *"more nation will come in future"*. Modular configuration makes adding subsequent nations effortless.
- **Decision 3: Card Model & SVGs**:
  - *Chosen Approach*: Add `nations_germany` rarity and cardStyle with dedicated SVG background rendering matching the 22 uploaded cards.
  - *Why*: Keeps cards fully consistent with the existing dynamic vector rendering engine, market, club gallery, and squad builder.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Mini-Games Hub View                             │
│  [Higher or Lower]  [Guess Who]  [Pack Duo]  [🎃 Cursed Snakes (NEW)]  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 CursedBoardGame Component (src/components)             │
│                                                                        │
│  ┌───────────────────────┐ ┌─────────────────────────────────────────┐ │
│  │     HUD & Meters      │ │        Horror Snakes & Ladders Board    │ │
│  │  Tile / 100 · Streak  │ │  10x10 Cursed Cobblestone Grid Tiles    │ │
│  │  Coins · Audio Toggle │ │  Animated Player Token · Snakes/Ladders │ │
│  └───────────────────────┘ └─────────────────────────────────────────┘ │
│                                                                        │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ Interactive Horror FX Layer (Bats, Ghosts, Red Vignette, Ouija)   │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────┐ ┌─────────────────────────────────┐ │
│  │ 3-Question Trivia Modal       │ │ Tile Reward / Nightmare Modal   │ │
│  │ (German Football History)     │ │ (Cards, Traps, Ouija Planchette)│ │
│  └───────────────────────────────┘ └─────────────────────────────────┘ │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      Data Stores & Utilities                           │
│  • src/data/nationsGermany.ts (22 Player Cards + Trivia Question Pool) │
│  • src/data/cardSvgGenerator.ts (Germany Flag Shield Card Theme)       │
│  • src/utils/horrorAudio.ts (Horror Ambient & FX Synthesizer)          │
│  • localStorage (Board Progress, Claimed Rewards, Best Runs)          │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Entities & State
1. **`GermanyCard`**: All 22 players defined with exact stats, positions, ratings, and SVG graphics:
   - 11 Collectibles: Adeyemi (91), Brown (90), Can (87), Kimmich (97), Kroos (96), Musiala (96), Schlotterbeck (93), Tah (94), ter Stegen (87), Wirtz (95), Woltemade (87).
   - 11 All-Time Legends: Beckenbauer (99), Brehme (99), Breitner (99), Lahm (99), Matthäus (99), Netzer (99), Neuer (99), Rahn (99), Rummenigge (99), Sammer (99), Schnellinger (98).
2. **`TriviaQuestion`**: Over 30 rich German football questions with 4 choices, randomized on each turn.
3. **`CursedBoardState`**:
   - `playerPosition`: 1 to 100
   - `isRolling`: boolean
   - `activeTrivia`: 3 questions with answer tracking
   - `activeNightmare`: Ouija nightmare animation state
   - `flyingBats`: Active flying bat particle models
   - `flyingGhosts`: Active floating ghost particle models
   - `claimedRewardTiles`: List of collected tile IDs
   - `isCompleted`: boolean (reaching Tile 100)

---

## Verification Plan

1. **Compilation Check**: Run `lint_applet` and `compile_applet` to ensure zero errors.
2. **Cursed Board Mechanics**:
   - Verify dice rolling and token animation along the 100-tile grid.
   - Verify that landing on any tile prompts the 3-question German football trivia modal.
   - Verify snakes, ladders, coin vaults, and card chests trigger their respective events.
3. **Horror & Ouija Nightmare Testing**:
   - Verify flying bats and ghost animations across the screen.
   - Verify the central Ouija board tile triggers the full nightmare sequence (planchette, blood-red vignette, eerie sounds, backward rift).
4. **End-of-Board Set Reward**:
   - Verify reaching Tile 100 opens the All-Time Germany Legendary XI Pack, awarding all 11 98-99 rated cards into the user's club.
5. **Card Appearance**:
   - Verify German flag shield, Brandenburg Gate, and 4-star eagle crest render properly on cards.
