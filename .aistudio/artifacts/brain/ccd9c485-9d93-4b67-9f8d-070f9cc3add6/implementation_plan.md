# Implementation Plan: Daily Reward Pack (50 Daily Rips)

Add a permanent **Daily Reward Pack** to the "My Packs" tab that provides **50 free rips each day**, auto-resetting every day, delivering 12–15 cards per rip, bonus coins (10–1000 with rare 500/1000 tiers), and a distinct "Already Owned" divider bar separating new pulls from duplicate cards.

---

## User Specifications
- **Pack Format**: A single Daily Reward Pack that can be ripped **50 times per day**.
- **Daily Reset**: Automatically resets back to 50 rips every new day (tracked via persistent local date comparison).
- **Cards per Rip**: 12 to 15 cards per rip from the card pool (mix of gold, promo, specials, and Hall of FUT).
- **Coin Drops**: 10 to 1,000 coins per rip, with 500 and 1,000 being super rare.
- **Results Layout**:
  1. **Coins Awarded Card/Banner** at the top.
  2. **New Players** (cards you did not previously own in your Club).
  3. **"Already Owned" Divider Bar** separating new players from duplicates.
  4. **Duplicate Players** displayed below the "Already Owned" bar with quick-sell or send options.

---

## Proposed Changes

### 1. Daily Reset & State Tracking (`src/components/MyPacksHub.tsx` & `src/types/card.ts`)
- Track daily state in `localStorage`:
  - `apex_daily_pack_date`: String `YYYY-MM-DD`.
  - `apex_daily_pack_rips`: Number (starts at 50, decrements on each rip).
  - If date has changed, automatically reset `apex_daily_pack_rips` to 50 and update date.
- Display a prominent **Daily Reward Pack (50 Rips Daily)** card at the top of the "My Packs" screen with:
  - Daily countdown/reset indicator.
  - Live rips badge (e.g. `🔥 50 / 50 Rips Available Today`).
  - "Rip Pack" action button.

### 2. Rip Generation Logic (`src/components/MyPacksHub.tsx`)
- On rip:
  - Generate between 12 and 15 cards from the comprehensive player pool.
  - Calculate coin drop with rare weighting:
    - 1000 coins: 1% chance (super rare)
    - 500 coins: 3% chance (super rare)
    - 200–400 coins: 16% chance
    - 50–150 coins: 45% chance
    - 10–40 coins: 35% chance
  - Automatically credit coins to user balance with audio/visual flair.
  - Classify cards into two groups based on `clubCards`:
    - `newCards`: Cards not currently in the user's club.
    - `duplicateCards`: Cards already owned in the user's club.
  - Decrement remaining daily rips by 1.

### 3. Pack Opening & Results Screen Presentation
- **Top Section**:
  - Animated bonus coin chest/banner showing `+X Coins Earned!`.
  - Walkout animation for top-rated card (86+).
- **New Players Section**:
  - Clear heading: `✨ New Players Unlocked (Added to Club)`.
  - Grid of newly acquired player cards.
- **"Already Owned" Divider Bar**:
  - High-visibility branded separator banner with label: `⚠️ ALREADY OWNED / DUPLICATES`.
- **Duplicate Players Section**:
  - Grid of duplicate cards with individual and "Quick Sell All Duplicates" or "Send to Club" actions.
- **Next Action Controls**:
  - "Rip Again (X rips left today)" button if rips remain > 0.
  - "Back to My Packs Vault" button.

---

## Verification Plan
1. **Compilation**: Run `lint_applet` and `compile_applet` to verify no TypeScript or build regressions.
2. **50-Rip Daily Reset**: Verify that date checking initializes 50 rips, decrements properly, and resets when date changes.
3. **Card Count & Coin Odds**: Confirm each rip produces 12–15 cards and properly weighted coins (10–1000).
4. **Layout Check**: Verify the coins banner appears on top, new players appear first, the "Already Owned" bar divides them, and duplicates appear below the bar.
