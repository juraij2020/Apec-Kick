# Strong Authentication & Cloud Cross-Device Progress Synchronization (Firebase)

Upgrade the authentication and data persistence architecture to use **Firebase Authentication** and **Cloud Firestore** so that user progress—including coins, club cards, squad lineups, unopened packs, evolutions, and mini-game states—is seamlessly saved to the cloud and never reset when opening the app on different laptops or deploying to Vercel.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Confirmed Choices from Clarification Interview**:
> - **Authentication & Backend**: Firebase Authentication (Google Sign-In + Email/Password) backed by a Cloud Firestore database.
> - **Synchronized Data Scope**: **Everything in the game**:
>   - Coins balance & club value
>   - Full club card collection (all collectibles, user-created cards, and nations cards)
>   - Active squad slots & formation
>   - Unopened pack inventory (`MyPacks`)
>   - Evolution progress (stage index, stats, evo points)
>   - Mini-game states (Cursed Snakes & Ladders tile position, Higher/Lower streaks)
> - **Pre-Login / Multi-Device Conflict Resolution**: Automatically merge local progress into the signed-in cloud account upon login, ensuring that opening the app on a fresh device never overwrites or resets prior achievements.
> - **Vercel Readiness**: Environment variables and client configuration will support both the local preview and external Vercel deployments seamlessly.

---

## 1. Overview & Core Concept

- **Problem**: The application currently relies on local browser storage (`localStorage`) for player data. When accessing the Vercel-deployed application from a different laptop or browser, the local storage is blank, resetting progress back to the starter team and coins.
- **Solution**: Connect the application to **Firebase Authentication** and **Cloud Firestore**. Every game event (packing a card, earning coins, setting up a squad, advancing on the Cursed Board) synchronizes securely to the user's Firestore document. Signing in from any laptop or mobile device immediately pulls the player's full club, ensuring zero data loss across platforms.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **First-Time Sign-In (Any Laptop)**:
   - User clicks **"Sign in with Google"** (or Email/Password) in the top bar.
   - Firebase Auth authenticates the user.
   - The app checks Firestore for an existing cloud club profile:
     - If found: Hydrates the entire club state (coins, cards, squad, packs). If the new laptop already had unbacked progress, it intelligently merges cards and balances without loss.
     - If new: Uploads the initial local state as the cloud master profile.
2. **Seamless Cloud Sync Indicator**:
   - The top bar profile dropdown displays live status: `☁️ Cloud Synced` (green pulse), `🔄 Syncing...` (spin), or `Offline (Cached)`.
   - Displays user avatar, Google email, and quick "Force Sync Now" button.
3. **Cross-Laptop Experience on Vercel**:
   - Opening the Vercel link on Laptop A and Laptop B under the same account shares the identical club roster, squad chemistry, and coin balance.
   - Logging out clears sensitive session tokens while keeping cloud data safe in Firestore.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Real-Time Auto-Save with Debounce**:
  - *Chosen Approach*: Debounced background sync (800ms) to Firestore whenever coins, club cards, squads, or minigames update.
  - *Why*: Prevents exceeding Firestore write limits during rapid pack openings while ensuring data is always backed up to the cloud.
- **Decision 2: Intelligent Union Merge for New Devices**:
  - *Chosen Approach*: When a user signs in on a device that already had local cards, the app merges the collections by card ID (union), takes `Math.max(cloudCoins, localCoins)` (or sums recently earned rewards), and reconciles squad slots.
  - *Why*: Users never lose cards opened as an anonymous guest before remembering to sign in.
- **Decision 3: Firebase Auth Providers**:
  - *Chosen Approach*: Support both **Google Sign-In** (one-click popup) and **Email/Password** fallback.
  - *Why*: Ensures compatibility across all browsers, incognito windows, and third-party cookie restrictions on Vercel.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Apex Kick Client (Vercel)                       │
│  [Top Bar Auth Button] ──> Firebase Auth SDK (Google / Email Auth)     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 Cloud Sync Manager (src/utils/cloudSync.ts)            │
│  • Auto-detects auth state changes                                     │
│  • Debounces local state updates                                       │
│  • Merges local cache with remote Firestore snapshot                   │
└──────────────────┬─────────────────────────────────┬───────────────────┘
                   │                                 │
                   ▼                                 ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│        Local Browser Cache           │  │   Cloud Firestore Database   │
│  • Fast initial render (<50ms)       │  │   /users/{uid}/data/club     │
│  • Offline resilience                │  │   • coins, clubCards         │
│  • safeStorage fallback              │  │   • squad, packs, minigames  │
└──────────────────────────────────────┘  └──────────────────────────────┘
```

### Firestore Database Schema
- **Path**: `users/{uid}/game_data/profile`
```typescript
interface CloudClubProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  coins: number;
  clubCards: SoccerCard[];
  formationId: string;
  activeSquadSlots: Record<string, string | null>;
  unopenedPacks: StoredRewardPack[];
  sakaStageIndex: number;
  sakaStats: CardStats;
  cursedBoardPos: number;
  hlBestStreak: number;
  lastSyncedAt: number;
}
```

### Security Rules (`firestore.rules`)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 5. Verification Plan

1. **Firebase Provisioning & Rules Verification**:
   - Provision Firestore and Firebase Auth using standard AI Studio setup flow.
   - Validate and deploy security rules enforcing user-isolated access.
2. **Local & Cloud Sync Testing**:
   - Sign in with an account on one session and earn coins / add cards.
   - Simulate a second browser session (or fresh incognito window), sign in with the same account, and verify that all cards, coins, squad, and Cursed Board position are restored.
3. **Merge Conflict Resolution Testing**:
   - Verify that logging in on a device with unsaved guest cards merges them into the cloud roster without replacing or deleting existing cloud cards.
4. **App Compilation**:
   - Run `lint_applet` and `compile_applet` to ensure zero compilation or type errors.
