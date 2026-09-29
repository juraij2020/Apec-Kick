# Higher or Lower Clue Mechanics, Streak Reward Ladder, Tiered Guess Who Packs & 'My Packs' Tab

Implement a shrouded mystery card presentation in **Higher or Lower** with intelligent multi-stat and profile clues, an interactive **Streak Reward Ladder** delivering automatic reward packs, **tiered pack rewards** for Guess Who solutions, and a dedicated **My Packs** unopened rewards tab positioned next to My Club.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following user preferences were confirmed in Phase 1 clarification:
> - **Reward Ladder Packs Claiming**: Automatic transfer directly to the new "My Packs" tab upon hitting streak milestones.
> - **'My Packs' Tab Placement**: Located directly adjacent to the "My Club" tab in both desktop and mobile navigation.
> - **Guess Who Pack Rewards**: Tiered reward packs scaled by performance (how few clues/guesses were needed to solve).

- **Confirmed Decision 1**: Higher or Lower shrouds the mystery card's photo and name with an enigmatic card silhouette while providing rich contextual clues (Nation flag, Club & League, Position, and non-target face stats like PAC, SHO, DEF, PHY) so guessing higher or lower on the chosen attribute is a strategic, knowledge-based deduction.
- **Confirmed Decision 2**: Higher or Lower features a visual Reward Ladder displaying streak milestones (3x, 5x, 8x, 12x, 15x) with corresponding coin bonuses and reward packs that automatically land in "My Packs".
- **Confirmed Decision 3**: Guess Who grants tiered packs (e.g. Mastermind 85+ Walkout Pack for 1 guess, Detective Jumbo Pack for 2 guesses, Sleuth Gold Pack for 3 guesses, and Challenger Pack for 4-5 guesses) automatically routed to "My Packs".
- **Confirmed Decision 4**: A dedicated "My Packs" tab near "My Club" with an unopened pack count badge, pack inventory showcase, full pack-rip animation, walkout sequences, and seamless "Add to Club" integration.

---

## 1. Overview & Core Concept

- **What It Does**:
  1. **Clue-Driven Higher or Lower**: Upgrades Higher or Lower from a trivial or blind guessing game into a tactical soccer IQ challenge. The opponent card's face is obscured with a sleek dark silhouette and concealed name ("Mystery Player"), but displays key soccer clues: nationality flag, club badge, league, pitch position, and face stats for the other attributes. Users evaluate the anchor player vs. mystery player clues to predict HIGHER or LOWER.
  2. **Higher or Lower Streak Reward Ladder**: An interactive visual progression track that displays milestone steps (3x, 5x, 8x, 12x, 15x). Reaching each milestone awards instant bonus coins, triggers confetti, and automatically deposits high-value packs (e.g., Gold Booster, Jumbo Premium Gold, Elite Players, Walkout Mega, Ultimate Icon Vault) into "My Packs".
  3. **Tiered Guess Who Rewards**: Winning the Guess Who mini-game rewards coins plus high-grade packs scaled by efficiency (fewer clues/guesses = rarer walkout packs).
  4. **Dedicated 'My Packs' Tab**: An authentic FC/FUT-style unopened pack store located right next to "My Club". Players can inspect unopened packs, view contents and guaranteed ratings, and open them with full pack rip animations, dramatic walkout spotlights, and "Add to Club" or "Quick Sell" workflows.

- **Target Audience / Persona**:
  - Soccer fans and FUT enthusiasts who enjoy trivia, strategic deduction, streak progression, and the excitement of storing and ripping packs earned from gameplay achievements.

- **Key Value**:
  - Connects game modes into a cohesive gameplay loop: play Mini-Games -> build streaks and solve mysteries -> earn exclusive reward packs -> open them in My Packs -> bolster club squad.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Higher or Lower Tactical Match**:
   - The user selects an attribute (Overall Rating, Pace, Shooting, Passing, Dribbling).
   - Left card is known (e.g. Kevin De Bruyne, 91 OVR, 86 PAS).
   - Right card is shrouded: mysterious card shadow with pulsing gold perimeter, hidden name, but showing:
     - Country flag & name (e.g. 🇧🇷 Brazil)
     - Club & League (e.g. Real Madrid · La Liga)
     - Primary Position (e.g. LW / Attacker)
     - Visible complementary stats (e.g. PAC: 95, DRI: 90, DEF: 34, PHY: 78) while the target stat (SHO) displays `??? [HIGHER OR LOWER?]`.
   - The user deduces whether Vinícius Jr.'s Shooting is higher or lower than De Bruyne's, and clicks **Higher** or **Lower**.
   - Upon guessing, the shroud dissipates with a gold flash: the full card, player photo, and exact stat value are revealed with win/loss celebration feedback.

2. **Reward Ladder Streak Progression**:
   - Above or below the Higher or Lower arena, a visual progression ladder highlights milestones:
     - 🎯 **3 Streak**: +1,000 Coins + *Gold Booster Pack*
     - 🔥 **5 Streak**: +2,500 Coins + *Jumbo Premium Gold Pack*
     - ⚡ **8 Streak**: +5,000 Coins + *Elite Players Pack*
     - 👑 **12 Streak**: +10,000 Coins + *Walkout Mega Pack (85+ Guaranteed)*
     - 🏆 **15 Streak**: +25,000 Coins + *Ultimate Icon Vault Pack (88+ Guaranteed)*
   - When a milestone is reached, an celebratory modal pops up with confetti: *"Reward Ladder Unlocked! Jumbo Premium Gold Pack transferred to My Packs!"*.

3. **Guess Who Clue-Scaled Victory**:
   - Player guesses mystery soccer star with progressive hints.
   - Upon identifying the player:
     - Solved in 1 guess: **Mastermind Rank** -> 6,000 Coins + *Rare Walkout Pack (85+)*
     - Solved in 2 guesses: **Expert Sleuth** -> 4,000 Coins + *Detective Jumbo Pack (82+)*
     - Solved in 3 guesses: **Tactician** -> 2,500 Coins + *Mystery Gold Pack (78+)*
     - Solved in 4-5 guesses: **Solver** -> 1,500 Coins + *Challenger Pack*
   - Direct notification banner with button: *"Go to My Packs to Rip Now"*.

4. **'My Packs' Tab Hub**:
   - Positioned in primary navigation between **My Club** and **Card Creator** (or adjacent to My Club), marked with an active counter chip (e.g. `My Packs [3]`).
   - Displays an unopened pack vault grid showing each stored reward pack:
     - Pack foil artwork, pack tier title, source origin tag (*"Higher or Lower 5x Streak"*, *"Guess Who 1-Guess Mastermind"*).
     - Card count and guaranteed walkout criteria.
     - **Open Pack** button.
   - Clicking **Open Pack** transitions into the immersive pack-opening animation stage:
     - Tear animation with sound effects.
     - Walkout card reveal for high-rated players (flag, position, club stage before full card reveal).
     - Card summary grid with *"Send All to Club"* or *"Quick Sell"* controls.
   - Empty state when 0 packs are held, with shortcuts to Mini-Games and Daily Objectives to earn more.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Concealment Level for Higher or Lower**:
  - *Chosen Approach*: Shroud player face and name, but expose nationality, club/league, position, and 3-4 non-target face stats.
  - *Why*: Balances difficulty and fun. Pure blind guessing (no info) is luck; full card visibility makes it a simple math test. Providing clues lets players use real-world soccer knowledge (e.g. *"Brazilian winger at Real Madrid with 95 pace... that's Vini Jr., let's compare his shooting"*).
  - *Alternatives Considered*: Hiding everything except rating range. Rejected because it eliminates the soccer trivia aspect.

- **Decision 2: Automatic Pack Delivery vs. Manual Claim Button**:
  - *Chosen Approach*: User confirmed automatic transfer directly to My Packs upon reaching milestones, accompanied by celebratory toasts and sound effects.
  - *Why*: Frictionless; players never lose rewards if they exit or restart a streak.

- **Decision 3: Persistent Storage of Unopened Packs**:
  - *Chosen Approach*: Store unopened reward packs in `localStorage` under `apex_fut_my_unopened_packs_v1`.
  - *Why*: Retains earned packs across page reloads, browser restarts, and device sessions without requiring external backend servers.

---

## 4. Technical Architecture & Data Strategy

### System Component Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                                App.tsx                                 │
│  - coins, clubCards, userCreatedCards, activeTab                       │
│  - unopenedPacks: StoredPack[] (localStorage persistence)               │
│  - onAddUnopenedPack(pack), onRemoveUnopenedPack(id)                   │
└───────────┬────────────────────────────┬───────────────────────────────┘
            │                            │
   ┌────────▼─────────────┐     ┌────────▼───────────────────────────────┐
   │    MiniGamesHub      │     │               MyPacksHub               │
   │  ┌─────────────────┐ │     │  - Unopened pack inventory grid        │
   │  │ Higher or Lower │ │     │  - Pack foil art & source badges       │
   │  │ - Shrouded Card │ │     │  - Integrated Pack Tear Animation      │
   │  │ - Clue Engine   │ │     │  - Walkout reveal sequence             │
   │  │ - Reward Ladder │ │     │  - Summary grid (Send to Club/Sell)    │
   │  └─────────────────┘ │     └────────────────────────────────────────┘
   │  ┌─────────────────┐ │
   │  │    Guess Who    │ │
   │  │ - Tiered Packs  │ │
   │  └─────────────────┘ │
   └──────────────────────┘
```

### Data Models & Pack Storage

```typescript
export interface StoredRewardPack {
  instanceId: string;
  packDefinition: PackDefinition;
  earnedAt: number;
  sourceTitle: string; // e.g. "Higher or Lower 5x Streak" | "Guess Who 1-Clue Mastermind"
  sourceType: 'high_low' | 'guess_who' | 'daily_objective' | 'bonus';
}
```

### Reward Ladder Definition (Higher or Lower)

```typescript
export interface RewardLadderTier {
  streak: number;
  coins: number;
  pack: PackDefinition;
  title: string;
  description: string;
}
```

- Tier 1: 3 Streak -> 1,000 Coins + Gold Booster Pack (3 cards, 75+ OVR)
- Tier 2: 5 Streak -> 2,500 Coins + Jumbo Premium Gold Pack (5 cards, 78+ OVR)
- Tier 3: 8 Streak -> 5,000 Coins + Elite Players Pack (4 cards, 82+ OVR)
- Tier 4: 12 Streak -> 10,000 Coins + Walkout Mega Pack (5 cards, 85+ guaranteed walkout)
- Tier 5: 15 Streak -> 25,000 Coins + Ultimate Icon Vault (5 cards, 88+ guaranteed legend)

---

## 5. Step-by-Step Implementation Strategy

1. **Step 1: Stored Packs State & Types (`src/types/card.ts`)**:
   - Define `StoredRewardPack` and reward pack templates for ladder & Guess Who tiers.
   - Add state in `App.tsx` with `localStorage` sync.
2. **Step 2: Higher or Lower Shrouded Card & Clue Engine (`src/components/MiniGamesHub.tsx`)**:
   - Build `ShroudedCard` component rendering dark silhouette avatar, redacted name, glowing question target, and visible clue panel (nation flag, club/league crest, position, and 3 complementary face stats).
   - Implement the interactive **Streak Reward Ladder** component with milestone badges, active progress line, and claimed milestone tracking.
   - Automatically award coins and dispatch ladder reward packs to `onAddUnopenedPack`.
3. **Step 3: Guess Who Tiered Pack Rewards (`src/components/MiniGamesHub.tsx`)**:
   - Calculate tier based on guess count (1, 2, 3, 4+).
   - Award corresponding coin bonus and dispatch high-tier reward pack to `onAddUnopenedPack` with celebratory modal.
4. **Step 4: 'My Packs' Dedicated Component (`src/components/MyPacksHub.tsx`)**:
   - Build a dedicated, full-featured unopened packs hub adjacent to My Club.
   - Render unopened reward pack inventory, pack details, guaranteed cards, and "Open Pack" button.
   - Connect full opening flow: rip animation, walkout sequence with sound effects, and cards grid with "Send All to Club" / "Quick Sell".
5. **Step 5: Navigation & Tab Integration (`src/App.tsx`)**:
   - Add `'mypacks'` tab next to `'club'` in both desktop and mobile navigation bars.
   - Include real-time badge count showing the number of unopened reward packs.
   - Verify complete build with `compile_applet`.
