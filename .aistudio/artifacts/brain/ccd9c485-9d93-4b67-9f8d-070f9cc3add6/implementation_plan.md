# 99 OVR Raffle Cards & Single-Month Secret Reveal Plan

Implement the requested updates to the Daily Raffle system: boost all Raffle Cards to prestigious **99 OVR** cards with endgame 99-tier stats, and restrict the Daily Raffle tab so it **strictly displays only the single player of the active month**, completely hiding upcoming players and calendar previews until the current month concludes.

---

## 1. Overview & Core Changes

### Key Requirements
1. **Every Raffle Card is 99 OVR**:
   - All monthly raffle player cards (October Buksa through July Richard) will have an official rating of **99**.
   - Stats updated to elite 99-level endgame ratings (99 PAC, 99 SHO, 99 DRI, 99 PHY, etc.).
   - Card SVG visual badges, shields, and rating headers will render `99` in embossed molten gold foil.
2. **Single Active Player Display in Raffle Tab**:
   - The Daily Raffle tab will exclusively show **one player**—the player for the active calendar month (currently **Adam Buksa 99 OVR** for October).
   - All multi-month calendar modals, month-selector tabs, and preview buttons will be removed.
   - Zero future month leaks: players cannot see who is coming in November, December, or later until October ends.
3. **Strict Real-World UTC Calendar Progression**:
   - The active raffle player is determined strictly by the real-world calendar month (`new Date().getUTCMonth() + 1`).
   - When October ends and midnight UTC on November 1st arrives, the tab automatically transitions to reveal the November 99 OVR player.
   - Daily draws, ticket purchases (1 coin = 1 ticket), countdown timer to midnight UTC, and winner podium below the ticket counter remain fully active and rewarding the 99 OVR player for 1st place.

---

## 2. Proposed Changes

### Data Layer (`src/data/raffleCards.ts`)
- **Update all 10 monthly raffle cards to 99 OVR**:
  - `raffle-buksa-october`: Adam Buksa — **99 ST** (PAC 99, SHO 99, PAS 95, DRI 99, DEF 65, PHY 99)
  - `raffle-cahill-november`: Tim Cahill — **99 CAM** (PAC 97, SHO 99, PAS 98, DRI 98, DEF 88, PHY 99)
  - `raffle-coluna-december`: Mário Coluna — **99 CM** (PAC 97, SHO 98, PAS 99, DRI 99, DEF 94, PHY 97)
  - `raffle-esposito-january`: Francesco Pio Esposito — **99 ST** (PAC 99, SHO 99, PAS 94, DRI 98, DEF 62, PHY 99)
  - `raffle-griezmann-february`: Antoine Griezmann — **99 ST** (PAC 99, SHO 99, PAS 99, DRI 99, DEF 80, PHY 95)
  - `raffle-joao-neves-march`: João Neves — **99 CM** (PAC 98, SHO 95, PAS 99, DRI 99, DEF 98, PHY 97)
  - `raffle-keown-april`: Martin Keown — **94 -> 99 CB** (PAC 97, SHO 70, PAS 92, DRI 94, DEF 99, PHY 99)
  - `raffle-martinez-may`: Emiliano Martínez — **99 GK** (DIV 99, HAN 99, KIC 98, REF 99, SPE 75, POS 99)
  - `raffle-paez-june`: Kendry Páez — **99 CAM** (PAC 99, SHO 97, PAS 99, DRI 99, DEF 78, PHY 92)
  - `raffle-richard-july`: Richard Ríos — **99 CM** (PAC 98, SHO 96, PAS 98, DRI 99, DEF 96, PHY 99)
- **Provide Safe Active Month Getter**:
  - Export a helper function `getActiveRaffleConfig()` that only returns the config for the real-world UTC current month.
  - Remove public calendar exports that expose future months to client components.

### Raffle Service (`src/utils/raffleService.ts`)
- Lock the active month detection strictly to the real-world UTC month.
- Ensure daily draw winner resolution awards the 99 OVR card for 1st place.
- Ensure the runner-up prizes (Jumbo Rare Players Pack for 2nd, Mega Pack for 3rd) continue to work seamlessly.

### Raffle Component (`src/components/RaffleHub.tsx`)
- **Single-Month Focus**:
  - Remove the "10-Month Season Calendar" modal button and modal markup completely.
  - Remove any month selector tabs or future-month previews.
  - The hero card spotlight, title, and raffle badge only highlight the current month's star (October: Adam Buksa 99 ST).
  - Keep the ticket counter, quick buy buttons (1 coin = 1 ticket), 24h countdown timer, and daily winners podium directly below the ticket counter.
  - Keep the draw test action ("Simulate Daily Midnight UTC Draw") for testing the daily draw and claim workflow while keeping future months hidden.

---

## 3. Verification Plan

### Automated Build Verification
- Run `lint_applet` to check for syntax and type issues.
- Run `compile_applet` to verify a clean build.

### User Flow Verification
1. **99 OVR Display**:
   - Inspect the active Buksa card in the Daily Raffle tab; verify it displays 93 -> **99 OVR** in gold foil with 99-tier stats.
2. **Single-Month Secrecy**:
   - Verify the Raffle tab contains no future month buttons, calendar modals, or spoilers about upcoming months.
   - Verify only the current month's player (October: Buksa) is shown.
3. **Daily Gameplay Loop**:
   - Verify buying tickets still charges 1 coin per ticket.
   - Verify the 24-hour UTC countdown runs accurately.
   - Verify the winner podium displays directly below the ticket counter.
   - Verify winning 1st place awards the 99 OVR card to the Club collection.
