# Implementation Plan: Permanent Transfer Market & Google Account Authentication

## Section 1: Executive Summary & User Alignment

Based on user feedback, this update introduces two foundational capabilities:
1. **Permanent, Timer-Free Dynamic Transfer Market**:
   - **No Expiration Timers**: Removal of artificial countdown timers. Market listings remain live indefinitely until purchased by the player or actively sold by the community.
   - **Dynamic Market Trends**: Integrated real-time market trends (📈 High Demand / 📉 Price Dip / 💎 Apex Value) reflecting player ratings, positions, and program rarity.
   - **Play-to-Earn & Cash Integration**: Transparent economy highlighting both routes: earning coins through matches, objectives, and mini-games vs. direct quick cash/coin store access for immediate card acquisition.
2. **Client Google Account Sign-In**:
   - Integrated client-side Google Sign-In linked directly to the user's club progress, saved squads, coins, and market listings.
   - High-contrast authenticated user badge in the top navigation bar featuring the Google avatar, user name, account status, and easy switch/sign-out controls.

---

## Section 2: Domain-Specific Design & Anti-Slop Safeguards

Applying rules from `frontend-design` and `4_games_2d_casual.md`:

### A. Transfer Market Card Presentation
- **Zero-Pill Discipline**: Remove tiny pill timer capsules (`Ends in 04:12`) and replace them with quiet, clean metadata: seller reputation, listing status, and market trend indicators (`📈 +4.2% Demand` or `💎 Permanent Auction`).
- **Clear Action Hierarchy**:
  - Primary button: High-contrast **"Buy Now"** with exact coin cost.
  - Secondary button: **"Place Bid"** with minimum bid increment step.
  - Quick Play-to-Earn affordance: **"Earn Coins"** shortcut leading directly to Match Simulator or Mini-Games.
- **Dynamic Price Indices**: Visual trend cues with clean typography (emerald for trending up, rose for price dips) to simulate a living soccer stock market.

### B. Google Authentication Header Component
- Standard Google branding guidelines: Official Google "G" emblem, clean white/dark badge with user avatar picture, display name, and email.
- Responsive mobile & desktop integration: Compact avatar dropdown on mobile, full status display on desktop.
- Unobtrusive state management: If unauthenticated, displays `"Sign in with Google"` with guest progress preservation; once signed in, instantly binds existing club cards and coins to the Google user ID.

---

## Section 3: System Architecture & Data Flow

### A. Authentication & Profile Persistence
- **Client-Side Google Auth Engine** (`src/utils/googleAuth.ts`):
  - Integrates Google Identity Services (GIS) / Client OAuth token flow.
  - Manages session lifecycle (`GoogleUser` state: `uid`, `name`, `email`, `picture`, `signedInAt`).
  - Automatically merges existing club cards, active squads, and coin balance with the authenticated Google profile in `safeStorage`.
- **Top Navigation Integration** (`src/components/GoogleAuthButton.tsx` & `src/App.tsx`):
  - Positioned prominently in the top header alongside audio and coin counters.
  - Provides a user profile modal with account statistics (Total Club Value, Cards Owned, Matches Played, Market Sales).

### B. Permanent Timer-Free Market Engine
- **Type Definitions** (`src/types/card.ts`):
  - Deprecate `expiresAt` urgency requirement on `TransferListing`; introduce `marketTrend: 'rising' | 'stable' | 'dipping' | 'high_demand'`.
  - Add `demandMultiplier: number` and `isPermanent: boolean`.
- **Market State & Replenishment** (`src/data/initialMarketListings.ts` & `src/components/TransferMarket.tsx`):
  - Remove expiration purge timeouts and countdown intervals.
  - Cards remain persistently listed until bought or canceled.
  - Allow manual user-driven restocking via the **"Refresh Market"** button or when the active listings pool falls below inventory threshold.
  - Add Play-to-Earn quick jump shortcuts ("Need Coins? Play Mini-Games or Simulate Match").

---

## Section 4: Step-by-Step Execution Plan

### Step 1: Client Google Authentication Service
- Create `src/utils/googleAuth.ts` with Google Identity Services SDK initialization, Google OAuth client sign-in handler, and persistent profile storage.
- Create `src/components/GoogleAuthButton.tsx` with Google sign-in button, profile dropdown menu, and account details modal.

### Step 2: Refactor Market Types & Storage
- Update `TransferListing` in `src/types/card.ts` to make expiration optional/permanent and add market trend properties.
- Update `src/data/initialMarketListings.ts` to assign realistic market trends and permanent statuses to all generated listings.

### Step 3: Upgrade TransferMarket Component
- Remove countdown timers (`timeRemaining`, clock badges, auto-expiring hooks) from `src/components/TransferMarket.tsx`.
- Render dynamic price trends and permanent listing badges (`💎 Permanent Listing · Always Available`).
- Add a Play-to-Earn banner and quick coin acquisition options (`Grind Matches · Earn Coins · Cash In`).
- Enhance "Buy Now" and "Place Bid" modals with transparent coin check and direct earn/cash shortcuts.

### Step 4: Header & App Integration
- Mount `GoogleAuthButton` in `src/App.tsx` header with real-time profile state.
- Wire user profile syncing so club progress and achievements are tied to the Google account.

### Step 5: Verification & Compilation
- Run `compile_applet` and `lint_applet` to verify clean build without TypeScript or syntax errors.
- Test sign-in flow, market navigation, permanent listing purchases, and coin balance synchronization.
