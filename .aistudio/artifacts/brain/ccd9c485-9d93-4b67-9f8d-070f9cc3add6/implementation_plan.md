# Throwback Collection: Green 3D Flashback Cards Integration

Integrates the **27 Throwback (Flashback)** player cards into the game with exact overall ratings, positions, historic clubs, and full 6-attribute stat clusters matching the uploaded images. Implements a dedicated emerald-green vector shield design with 3D flashback chevrons (`<<<`), cybernetic circuit patterns, and bottom "FW" badge, alongside a dedicated **Throwback Vault Pack** and **Transfer Market** integration.

***

### User Decisions & Scope Confirmation

> [!IMPORTANT]
> **Summary of User Requirements & Preferences**:
> 1. **27 Throwback Cards**: All 27 uploaded players (Messi 98, Ronaldo 98, Neymar Jr 95, Modrić 94, De Bruyne 94, Lewandowski 93, Benzema 92, Di María 92, Courtois 92, Telles 92, Szczęsny 91, Mané 90, Griezmann 89, Hakimi 89, Jordi Alba 89, Kanté 89, Alberto 89, Ziyech 88, Alonso 88, Delaney 88, Alexander-Arnold 87, Gómez 87, Müller 87, Donnarumma 87, Mahrez 86, Trippier 86, and Beek 85).
> 2. **Exact Image Stats & Clubs**: Exact numbers from the card images (e.g. Messi at Barcelona, Ronaldo at Juventus, Neymar at PSG, Hakimi at Dortmund, Szczęsny at Arsenal, Telles at Porto, Trippier at Atlético Madrid).
> 3. **Emerald Green & 3D Flashback Sign**: Card shield vector rendering features radiant emerald/lime borders, cyber circuit traces, prominent 3D green rewind chevrons (`<<<`), lime green typography, and the "FW" badge at the shield notch.
> 4. **Obtaining Cards**: Players obtain these cards via a **Dedicated Throwback Pack** in the Store and through active **Transfer Market** listings (no clutter on navigation tabs).

***

## 1. Complete Throwback 27-Card Roster Table

| # | Player | OVR | Pos | Nation | Flashback Club | League | PAC | SHO | PAS | DRI | DEF | PHY | PlayStyle+ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Lionel Messi | 98 | RW | 🇦🇷 Argentina | FC Barcelona | La Liga | 93 | 98 | 98 | 99 | 45 | 72 | Finesse Shot+ |
| 2 | Cristiano Ronaldo | 98 | ST | 🇵🇹 Portugal | Juventus | Serie A | 98 | 99 | 90 | 97 | 43 | 86 | Power Shot+ |
| 3 | Neymar Jr | 95 | LW | 🇧🇷 Brazil | Paris Saint-Germain | Ligue 1 | 99 | 93 | 95 | 99 | 40 | 66 | Trickster+ |
| 4 | Kevin De Bruyne | 94 | CAM | 🇧🇪 Belgium | Manchester City | Premier League | 84 | 94 | 99 | 95 | 69 | 86 | Incisive Pass+ |
| 5 | Luka Modrić | 94 | CM | 🇭🇷 Croatia | Real Madrid | La Liga | 80 | 82 | 95 | 96 | 78 | 72 | Trivela+ |
| 6 | Robert Lewandowski | 93 | ST | 🇵🇱 Poland | Bayern Munich | Bundesliga | 81 | 92 | 78 | 90 | 45 | 86 | Poacher+ |
| 7 | Karim Benzema | 92 | ST | 🇫🇷 France | Real Madrid | La Liga | 85 | 92 | 89 | 95 | 49 | 86 | Finesse Shot+ |
| 8 | Ángel Di María | 92 | RW | 🇦🇷 Argentina | Paris Saint-Germain | Ligue 1 | 92 | 87 | 92 | 95 | 56 | 76 | Trickster+ |
| 9 | Thibaut Courtois | 92 | GK | 🇧🇪 Belgium | Real Madrid | La Liga | 90* | 94* | 77* | 92* | 53* | 90* | Cat Reflexes+ |
| 10 | Alex Telles | 92 | LB | 🇧🇷 Brazil | FC Porto | Liga Portugal | 95 | 83 | 94 | 91 | 90 | 86 | Whipped Pass+ |
| 11 | Wojciech Szczęsny | 91 | GK | 🇵🇱 Poland | Arsenal | Premier League | 91* | 88* | 79* | 94* | 53* | 92* | Far Reach+ |
| 12 | Sadio Mané | 90 | LW | 🇸🇳 Senegal | Liverpool | Premier League | 96 | 88 | 81 | 92 | 48 | 78 | Rapid+ |
| 13 | Luis Alberto | 89 | CM | 🇪🇸 Spain | Lazio | Serie A | 74 | 79 | 89 | 89 | 57 | 67 | Tiki Taka+ |
| 14 | Antoine Griezmann | 89 | LW | 🇫🇷 France | FC Barcelona | La Liga | 83 | 88 | 86 | 91 | 59 | 76 | Finesse Shot+ |
| 15 | Achraf Hakimi | 89 | RM | 🇲🇦 Morocco | Borussia Dortmund | Bundesliga | 99 | 85 | 88 | 93 | 85 | 88 | Quick Step+ |
| 16 | Jordi Alba | 89 | LB | 🇪🇸 Spain | FC Barcelona | La Liga | 95 | 74 | 86 | 88 | 84 | 78 | Whipped Pass+ |
| 17 | N'Golo Kanté | 89 | CDM | 🇫🇷 France | Chelsea | Premier League | 82 | 68 | 80 | 84 | 90 | 86 | Intercept+ |
| 18 | Marcos Alonso | 88 | LWB | 🇪🇸 Spain | Chelsea | Premier League | 76 | 84 | 88 | 87 | 89 | 88 | Dead Ball+ |
| 19 | Thomas Delaney | 88 | CDM | 🇩🇰 Denmark | Borussia Dortmund | Bundesliga | 83 | 79 | 81 | 81 | 89 | 88 | Bruiser+ |
| 20 | Hakim Ziyech | 88 | CAM | 🇲🇦 Morocco | Ajax | Eredivisie | 86 | 81 | 92 | 89 | 56 | 72 | Whipped Pass+ |
| 21 | Trent Alexander-Arnold | 87 | RB | 🏴󠁧󠁢󠁥󠁮󠁧󠁿 England | Liverpool | Premier League | 86 | 71 | 89 | 83 | 85 | 76 | Long Ball Pass+ |
| 22 | Gianluigi Donnarumma | 87 | GK | 🇮🇹 Italy | AC Milan | Serie A | 93* | 84* | 77* | 93* | 52* | 84* | Cat Reflexes+ |
| 23 | Alejandro Gómez | 87 | CAM | 🇦🇷 Argentina | Atalanta | Serie A | 94 | 83 | 86 | 91 | 44 | 60 | Technical+ |
| 24 | Thomas Müller | 87 | CM | 🇩🇪 Germany | Bayern Munich | Bundesliga | 73 | 84 | 80 | 79 | 56 | 72 | Relentless+ |
| 25 | Riyad Mahrez | 86 | RW | 🇩🇿 Algeria | Manchester City | Premier League | 87 | 82 | 83 | 91 | 41 | 62 | Finesse Shot+ |
| 26 | Kieran Trippier | 86 | RB | 🏴󠁧󠁢󠁥󠁮󠁧󠁿 England | Atlético Madrid | La Liga | 90 | 79 | 87 | 82 | 84 | 78 | Whipped Pass+ |
| 27 | Donny van de Beek | 85 | CDM | 🇳🇱 Netherlands | Ajax | Eredivisie | 77 | 84 | 82 | 84 | 76 | 84 | Anticipate+ |

*\*For GKs, stats represent DIV, HAN, KIC, REF, SPE, and POS as shown on the cards.*

***

## 2. Card Design: Emerald Green with 3D Flashback Sign

In `src/data/cardSvgGenerator.ts`, a dedicated card style `'throwback'` / `'flashback'` will be introduced:
- **Card Frame & Borders**: Deep forest-emerald to vibrant neon lime (`#052e16` -> `#16a34a` -> `#4ade80` -> `#22c55e`).
- **Cybernetic Circuit Overlay**: Subtle circuit board PCB traces etched across the top half with green luminescence.
- **3D Flashback Sign**: Distinctive multi-layered green chevron arrows (`<<<`) positioned behind the player figure, matching the 3D depth of the source images.
- **Notch "FW" Emblem**: The circular badge with the green border and "FW" glyph at the bottom apex.
- **Lime Typography**: High-legibility condensed green typography (`#22c55e` / `#4ade80`) for the OVR number, position label, player name header, and 6-stat attribute column.

***

## 3. Dedicated Pack & Transfer Market Implementation

1. **Dedicated Store Pack (`src/data/packs.ts`)**:
   - **Pack Name**: `Throwback Rewind Pack ⏳`
   - **Cost**: 35,000 Coins / 500 FP
   - **Contents**: 5 Cards, guaranteed 1+ Throwback item (rating 85–98), featuring high odds for iconic throwback versions of Messi, Ronaldo, Neymar, De Bruyne, and Modrić.
   - **Walkout Animation (`src/components/PackOpening.tsx`)**:
     - Special glowing green stage lighting with emerald lasers.
     - Flashback walkout banner: `⏳ THROWBACK FLASHBACK MASTERCLASS WALKOUT! ⏳`.
     - Suspense sequence showing the player's nation flag, position, and historic club crest before the 3D card walkout.
2. **Transfer Market (`src/components/TransferMarket.tsx` & `src/data/initialMarketListings.ts`)**:
   - Add `throwback` to the program filter list (`⏳ Throwback`).
   - Seed initial auction listings with marquee Throwback cards (e.g., Messi 98 at Barcelona, Ronaldo 98 at Juventus, Neymar 95 at PSG).
   - Dynamic price calculation scaled to ratings:
     - 98 OVR: 3,200,000 – 3,750,000 coins
     - 94–95 OVR: 1,800,000 – 2,400,000 coins
     - 90–93 OVR: 850,000 – 1,400,000 coins
     - 85–89 OVR: 250,000 – 650,000 coins

***

## 4. Technical Architecture & File Plan

- **`src/types/card.ts`**:
  - Add `'throwback'` to `CardRarity` and `CardStyle` union types.
- **`src/data/cardSvgGenerator.ts`**:
  - Implement the `throwback` card frame, cybernetic background, 3D flashback chevron elements, FW bottom insignia, and green typography styling.
- **`src/data/throwbackCards.ts` (NEW)**:
  - Create the complete 27-player dataset with exact image stats, positions, clubs, nations, and pre-rendered vector card shields.
- **`src/data/packs.ts`**:
  - Add the `pack-throwback-rewind` store pack with Throwback program filters and guaranteed drop rates.
- **`src/data/initialMarketListings.ts`**:
  - Include Throwback cards in the initial listings pool and marquee featured cards.
- **`src/components/TransferMarket.tsx`**:
  - Add the quick filter button for `⏳ Throwback` cards.
- **`src/components/PackOpening.tsx`**:
  - Add Throwback walkout banner and emerald stadium visual effects.
- **`src/App.tsx`**:
  - Mount `THROWBACK_CARDS` in `allCardsPool` so all packs, squads, and chemistry calculations resolve seamlessly.

***

## 5. Step-by-Step Execution Plan

1. **Update Types & Vector Generator**:
   - Add `'throwback'` rarity and style to `src/types/card.ts`.
   - Implement emerald green theme, 3D flashback chevrons (`<<<`), cyber traces, and FW badge in `src/data/cardSvgGenerator.ts`.
2. **Build `src/data/throwbackCards.ts`**:
   - Encode all 27 players with exact ratings, stats, and clubs from the images.
3. **Add Throwback Pack in `src/data/packs.ts`**:
   - Define `pack-throwback-rewind` with guaranteed Throwback player odds.
4. **Update Pack Opening & Market**:
   - Wire walkout banner and green FX in `src/components/PackOpening.tsx`.
   - Add `⏳ Throwback` filter in `src/components/TransferMarket.tsx`.
   - Seed marquee listings in `src/data/initialMarketListings.ts`.
5. **App Integration & Verification**:
   - Register cards in `src/App.tsx`.
   - Run `lint_applet` and `compile_applet` to confirm zero errors and successful production build.
