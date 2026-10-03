# Pack Duo Game Mode: 50-Pack Speed Draft, 5 Checklists & Head-to-Head Showdown

Introduces the **Pack Duo** competitive game mode inside the Mini Games Hub. Players compete against either an **Online User** (simulated live multiplayer matchmaking with gamer tags) or an **AI Rival**, opening 50 speed-draft packs while racing to complete 5 dynamic challenge checklists. Players then craft an 11-player squad from their temporary draft pool and enter a dramatic head-to-head showdown comparing Rating, Full Chemistry, League Count, Nationality Count, and Checklists Completed. Winning matches earns **Duo Points**, which can be redeemed in the built-in **Duo Rewards Shop** for premium packs that are deposited directly into the player's permanent **My Packs** vault.

***

### User Decisions & Scope Confirmation

> [!IMPORTANT]
> **Summary of User Requirements & Preferences**:
> 1. **50 Instant Packs**: 50 packs are granted immediately at match start, openable via fast single, batch (5x/10x), or instant auto-rip controls.
> 2. **5 In-Pack Challenge Checklists**: 5 randomized target checklists per match (e.g. Real Madrid 87+, specific league with OVR requirement, specific collection/program with OVR requirement, specific nationality with OVR requirement, and 92+ Apex walkout).
> 3. **Matchmaking Modes**: Option to click **"Compete Against AI"** or **"Compete Against Online Users"** with real-time simulated rival drafts.
> 4. **Squad Building Phase**: Build a starting 11 using solely the players pulled from the 50 packs (best squad auto-builder + manual adjustments). These cards do **not** enter the player's permanent club inventory (temporary draft pool).
> 5. **5-Pillar Head-to-Head Comparison**:
>    - **Overall Rating**
>    - **Full Chemistry (0–33)**
>    - **Distinct Leagues Count**
>    - **Distinct Nationalities Count**
>    - **Checklists Completed Count (0–5)**
>    - Each category awards showdown points; the winner of the total score claims the match and earns **Duo Points**.
> 6. **Duo Rewards Shop (Small Tab inside Pack Duo)**: Buy packs across tiered Duo Point costs (from 50 pts to 1400 pts); purchased packs are deposited into **My Packs** (`StoredRewardPack`) to be opened and kept in the real club!

***

## 1. Game Flow Architecture

```
[Mini Games Hub -> Pack Duo Tab]
       │
       ├─► [Duo Rewards Shop Tab] ──► Spend Duo Points ──► Pack sent to "My Packs" vault
       │
       └─► [Lobby: Select Opponent]
             ├── 🤖 Compete Against AI
             └── 🌐 Compete Against Online Users (Simulated Live Matchmaking)
                   │
                   ▼
             [Phase 1: 50-Pack Speed Rip & 5 Checklists]
             ├── Open 50 packs (Quick Rip 1x, 5x, 10x, All)
             ├── Complete 5 dynamic checklists (e.g. Real Madrid 87+, Premier League 88+, etc.)
             ├── Live opponent draft progress simulation
             └── Cards stored in temporary draft pool (Club remains clean)
                   │
                   ▼
             [Phase 2: Squad Construction (Draft 11)]
             ├── 4-3-3 / 4-4-2 Tactical Pitch
             ├── ⚡ Auto-Build Best Squad (Max Chemistry & Rating)
             ├── Manual bench swap / position optimization
             └── Opponent locks in squad concurrently
                   │
                   ▼
             [Phase 3: Head-to-Head Duo Showdown]
             ├── Rating Comparison (+250 pts)
             ├── Full Chemistry Comparison (+250 pts)
             ├── Leagues Diversity Comparison (+200 pts)
             ├── Nationalities Diversity Comparison (+200 pts)
             ├── Checklists Completed Score (up to +500 pts)
             └── Winner Celebrated ──► Award Duo Points (+350 on Win)
```

***

## 2. Dynamic 5-Checklist Generator

Each match generates 5 unique objectives dynamically:
1. **Club & OVR Target**: e.g., "Pull an 87+ Real Madrid player" (or Barcelona, Man City, Bayern Munich, Liverpool, PSG, Chelsea, Juventus, Arsenal).
2. **League & OVR Target**: e.g., "Pull an 88+ player from Premier League" (or La Liga, Serie A, Bundesliga, Ligue 1).
3. **Program / Collection Target**: e.g., "Pull an 86+ Throwback or Summer Transfers card".
4. **Nationality & OVR Target**: e.g., "Pull an 86+ player from France, Brazil, Argentina, or England".
5. **Apex / Mythic Pull**: e.g., "Pull any 92+ Apex Legend, Icon, or Walkout card".

Each checklist card item has an interactive progress badge that lights up with a green checkmark and audio chime the instant a qualifying card is opened in the 50 packs.

***

## 3. Pack Duo Rewards Shop (Duo Vault)

Integrated within a dedicated sub-tab in Pack Duo:
- **Bronze Duo Pack** (50 Duo Pts): 3 Players, 75+ OVR floor.
- **Silver Duo Pack** (120 Duo Pts): 4 Players, 80+ OVR floor.
- **Gold Duo Pack** (250 Duo Pts): 5 Players, 83+ OVR floor, elevated TOTW odds.
- **Street Kings Booster** (450 Duo Pts): 5 Players, guaranteed 85+ Street Kings item.
- **Summer Transfers Vault** (700 Duo Pts): 5 Players, guaranteed 85+ Summer Transfers card with 97–99 Mythic odds.
- **Throwback Rewind Pack** (950 Duo Pts): 5 Players, guaranteed 85+ Throwback card with 98 Messi & Ronaldo odds.
- **Mythic Apex 95+ Player Pack** (1400 Duo Pts): 1 Guaranteed 95–99 Apex Icon or Premium card.

When purchased, packs are pushed to `unopenedPacks` via `onAddUnopenedPack(packDef, 'Pack Duo Victory Vault', 'pack_duo')` and persisted in `localStorage`.

***

## 4. Technical File Plan

1. **`src/types/card.ts`**:
   - Update `sourceType` in `StoredRewardPack` to include `'pack_duo'`.
   - Add types for `PackDuoChecklist`, `PackDuoOpponent`, and `PackDuoMatchResult`.
2. **`src/components/PackDuoGame.tsx` (NEW)**:
   - Full implementation of the Pack Duo experience:
     - Matchmaking selection (AI vs Online Users).
     - 50-pack quick opening engine with batching and instant reveal.
     - 5 dynamic checklist evaluation engine.
     - Squad builder pitch with 11 slots and best-squad auto-solver.
     - 5-pillar showdown comparison screen with animated scores.
     - Sub-tab Duo Rewards Shop with live Duo Points balance and redemption logic.
3. **`src/components/MiniGamesHub.tsx`**:
   - Add `'pack_duo'` to `MiniGameMode`.
   - Add `⚔️ Pack Duo` tab button in the header nav.
   - Mount `<PackDuoGame />` when active.
   - Pass through `onAddUnopenedPack`.
4. **`src/data/rewardPacks.ts`**:
   - Define dedicated Duo Shop pack definitions (`DUO_SHOP_PACKS`).

***

## 5. Verification Plan

1. **Lint Verification**:
   - Run `lint_applet` (`tsc --noEmit`) to verify zero type mismatches or missing imports.
2. **Compilation Verification**:
   - Run `compile_applet` to confirm Vite production build compiles with no errors.
3. **Functional Testing**:
   - Test AI matchmaking and Online simulated matchmaking.
   - Verify 50 packs rip smoothly with single, batch (5x/10x), and all-open buttons.
   - Check that checklist items correctly detect matching cards (e.g. Real Madrid 87+).
   - Test squad auto-builder and manual swaps.
   - Verify showdown scoring, winner declaration, and Duo Points award.
   - Test purchasing a pack from the Duo Shop and verifying it shows up in "My Packs".
