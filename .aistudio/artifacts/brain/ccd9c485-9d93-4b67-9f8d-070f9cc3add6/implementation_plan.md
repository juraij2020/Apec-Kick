# Implementation Plan: Ultimate Halloween Scream Trick-or-Treat Mini-Game & Dembélé 99 Set Reward (Revised)

Build the **Ultimate Halloween Scream** feature featuring a spooky Trick-or-Treat street with 6 interactive haunted houses, a 5-candy cauldron brewing crafting system (where valid recipes grant Scream players and incorrect combinations award Base cards), 32 authentic Halloween Scream player cards utilizing user-uploaded artwork, and the grand **99 OVR Ousmane Dembélé** collection set reward.

---

## 1. User Intent & Clarifications Summary
- **6 Spooky Houses**: Players visit 6 distinct haunted houses on a Halloween street with free, unlimited door knocking.
- **House Door Rewards**: Knocking on a house door rewards a Halloween treat (e.g. Dark Chocolate Skull, Ghostly Licorice, Candy Corn, Gummy Worms, Pumpkin Pop, Sour Bat Drops, Witch Jelly, etc.) and the house owner (a fellow FUT club master) also gifts a base player card from their personal reserve.
- **5-Treat Mystery Crafting & Outcome Rules**:
  - Players collect candies into their Treat Basket.
  - Combining any 5 treats in the Spooky Cauldron attempts a secret recipe.
  - **Correct Combination**: Brews the specific **Ultimate Halloween Scream player** card associated with that recipe with walkout fanfare!
  - **Incorrect Combination**: The cauldron bubbles with a fizzle, and awards a **Base Player card** (added directly to your Club) so players can immediately keep trying new combinations without feeling empty-handed.
- **Exclusivity & Dembélé 99 Set Reward**: The 31 Halloween Scream players are obtainable exclusively through the Trick-or-Treat mini-game. Collecting all 31 unlocks the grand **99 OVR Ultimate Halloween Scream Ousmane Dembélé (ST, 99 OVR)** set reward in the Set Rewards Hub!

---

## 2. Card Roster & Asset Integration (`src/data/halloweenScreamCards.ts`)
Map all 32 player cards to their exact local image assets in `/assets/aistudio/`:
1. **Ousmane Dembélé** (99 ST, PSG, 🇫🇷) - *The Grand Collection Set Reward* (`Demb_l__644x900__1__efe07ee2.png`)
2. **Virgil van Dijk** (97 CB, Liverpool, 🇳🇱) (`van_Dijk_644x900_81dfd467.png`)
3. **Marc Cucurella** (96 LB, Real Madrid, 🇪🇸) (`Cucurella_644x900_0b854dd7.png`)
4. **Luis Díaz** (95 LM, Bayern Munich, 🇨🇴) (`D_az_644x900_58b0c827.png`)
5. **Viktor Gyökeres** (95 ST, Arsenal, 🇸🇪) (`Gy_keres_644x900_546515bb.png`)
6. **Declan Rice** (94 CDM, Arsenal, 🏴󠁧󠁢󠁥󠁮󠁧󠁿) (`Rice_644x900_6892b3da.png`)
7. **Jonathan Tah** (94 CB, Bayern Munich, 🇩🇪) (`Tah_644x900_56d80337.png`)
8. **Ademola Lookman** (91 ST, Atlético Madrid, 🇳🇬) (`Lookman_644x900_a2f7a249.png`)
9. **William Saliba** (90 CB, Arsenal, 🇫🇷) (`Saliba_644x900_8f8f452f.png`)
10. **Gabriel** (90 CB, Arsenal, 🇧🇷) (`Gabriel_644x900_e62c7840.png`)
11. **Hakan Çalhanoğlu** (90 CDM, Inter, 🇹🇷) (`_alhano_lu_644x900_5558a6ca.png`)
12. **Federico Valverde** (90 CM, Real Madrid, 🇺🇾) (`Valverde_644x900_6d26bfc6.png`)
13. **Joško Gvardiol** (90 CB, Manchester City, 🇭🇷) (`Gvardiol_644x900_2f5da575.png`)
14. **Jules Koundé** (88 RB, Barcelona, 🇫🇷) (`Kound__644x900_de65b58c.png`)
15. **Theo Hernández** (88 LB, Al Hilal, 🇫🇷) (`Hern_ndez_644x900_ed306a61.png`)
16. **Emiliano Martínez** (88 GK, Chelsea, 🇦🇷) (`Mart_nez_644x900_d4eb9343.png`)
17. **André-Frank Zambo Anguissa** (88 CM, Napoli, 🇨🇲) (`Zambo_Anguissa_644x900_8a75e3ca.png`)
18. **Arda Güler** (87 RM, Real Madrid, 🇹🇷) (`G_ler_644x900_246aa816.png`)
19. **Nico Williams** (87 LW, Athletic Club, 🇪🇸) (`Nico_Williams_644x900_28bda584.png`)
20. **Son Heung-Min** (87 ST, Los Angeles FC, 🇰🇷) (`Son_Heung_Min_644x900_809ceb93.png`)
21. **Reece James** (87 RB, Chelsea, 🏴󠁧󠁢󠁥󠁮󠁧󠁿) (`James_644x900_7fa71637.png`)
22. **Phil Foden** (86 CAM, Manchester City, 🏴󠁧󠁢󠁥󠁮󠁧󠁿) (`Foden_644x900_348c5e51.png`)
23. **Eberechi Eze** (86 CAM, Arsenal, 🏴󠁧󠁢󠁥󠁮󠁧󠁿) (`Eze_644x900_2ef99486.png`)
24. **N'Golo Kanté** (86 CDM, Fenerbahçe, 🇫🇷) (`Kant__644x900_e1e72fb7.png`)
25. **Alejandro Garnacho** (86 LM, Aston Villa, 🇦🇷) (`Garnacho_644x900_dbc0a910.png`)
26. **Rafael Leão** (86 LW, Galatasaray, 🇵🇹) (`Rafael_Le_o_644x900_be82441a.png`)
27. **Giovanni Di Lorenzo** (85 RB, Napoli, 🇮🇹) (`Di_Lorenzo_644x900_75e7f7d2.png`)
28. **Jeremie Frimpong** (85 RB, Liverpool, 🇳🇱) (`Frimpong_644x900_5e86e8ac.png`)
29. **Giorgi Mamardashvili** (85 GK, Liverpool, 🇬🇪) (`Mamardashvili_644x900_92d98fc7.png`)
30. **Victor Boniface** (84 ST, Bayer Leverkusen, 🇳🇬) (`Boniface_644x900_b5fba645.png`)
31. **Eduardo Camavinga** (83 CM, Real Madrid, 🇫🇷) (`Camavinga_644x900_54422914.png`)
32. **Micky van de Ven** (82 CB, Tottenham Hotspur, 🇳🇱) (`van_de_Ven_644x900_76176770.png`)

All cards will have `rarity: 'halloween_scream'`, `program: 'Halloween Scream'`, and `fullCardImage` set to their local PNG image.

---

## 3. The 6 Haunted Houses & Candies Mechanics (`src/data/halloweenHouses.ts`)
- **6 Themed Houses**:
  1. *The Pumpkin Manor* (Host: Count Haaland) — Specialty: Pumpkin Pops & Dark Chocolate Skulls
  2. *The Phantom Crypt* (Host: Ghostly Mbappé) — Specialty: Ghostly Licorice & Phantom Mints
  3. *The Spiderweb Villa* (Host: Spider Vini Jr) — Specialty: Gummy Tarantulas & Sour Cobwebs
  4. *The Vampire Castle* (Host: Lord Bellingham) — Specialty: Blood-Orange Toffee & Crimson Chews
  5. *The Witch's Cottage* (Host: Sorceress Putellas) — Specialty: Witch Jellies & Cauldron Drops
  6. *The Monster Laboratory* (Host: Frank-Enzo Fernández) — Specialty: Monster Marshmallows & Shock Wafers
- **Door Knock Experience**:
  - Interactive door with knocker animation and sound effect.
  - Door swings open to reveal the house owner, greeting dialogue, a treat drop into your basket, and a bonus base player card added directly into your Club collection.

---

## 4. 5-Treat Cauldron Brewing Engine (`src/components/HalloweenScreamHub.tsx`)
- **Interactive Treat Basket & Cauldron**:
  - Displays your live candy inventory (counts of each candy collected).
  - Slot in 5 candies into the bubbling Halloween Cauldron.
  - Click **"Brew Halloween Spell"** with boiling smoke, purple embers, and sound effects.
- **Recipe Matching & Base Card Fallback**:
  - Valid secret recipes match specific 5-treat blends to the 31 craftable Halloween Scream superstars.
  - **If Correct**: Reveals and awards the corresponding Scream superstar with full walkout graphics! Discovered recipes are saved into your Recipe Book.
  - **If Incorrect**: The cauldron sparks with a puff of smoke, notifying the player: *"The spell fizzled! A spooky Base Card was concocted instead."*, and immediately awards a Base Player Card from the base roster directly to the user's Club.

---

## 5. Dembélé 99 Grand Collection Set Reward (`src/components/SetRewardsHub.tsx`)
- **Halloween Scream Set Definition**:
  - *Title*: Ultimate Halloween Scream Collection (99 Dembélé Master)
  - *Requirement*: Collect all 31 Halloween Scream players from the Trick-or-Treat mini-game.
  - *Reward*: **99 OVR Ousmane Dembélé (ST)** + 250,000 Coins.
  - *Live Progress Tracker*: Shows `ownedScreamCount / 31` with completion percentage.
  - *Dev Test Shortcut*: Convenient "Simulate 31 Scream Cards" button to test the 99 Dembélé claim celebration immediately.

---

## 6. Mini-Games Hub & Navigation Integration (`src/components/MiniGamesHub.tsx`, `src/App.tsx`)
- Add `'halloween_scream'` to the Mini-Games mode selector with a glowing pumpkin badge: "🎃 Ultimate Halloween Scream (6 Houses)".
- Add direct navigation shortcut banner in the Set Rewards Hub and Mini-Games Hub.

---

## 7. Verification & Build
1. Create `src/data/halloweenScreamCards.ts` and `src/data/halloweenHouses.ts`.
2. Build `src/components/HalloweenScreamHub.tsx` with 6 houses, door animations, candy drops, base player gifts, 5-treat cauldron brewing, and the base card fallback.
3. Update `src/components/MiniGamesHub.tsx` to include the new game mode.
4. Update `src/components/SetRewardsHub.tsx` with the Dembélé 99 set reward.
5. Run `compile_applet` and `lint_applet` to verify build integrity.
