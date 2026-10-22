# Implementation Plan: Rating-Scaled Jigsaw Pixel Puzzle

Upgrade the Pixel Puzzle mini-game so each player card's puzzle scales its piece count directly to the player's OVR rating (e.g., 100 pieces for Pedri 100 OVR up to 105 pieces for 105 OVR cards), featuring direct on-board piece swapping and a slightly blurred reference preview.

---

## 1. Grid Dimensions & Rating-Scaled Configurations
Map each card's exact OVR rating to a piece count and grid dimension that preserves card slicing geometry:
- **100 OVR (Pedri)**: 100 Pieces → `10 columns × 10 rows`
- **102 OVR (Nico Paz, Pau Cubarsí, Cole Palmer)**: 102 Pieces → `6 columns × 17 rows`
- **104 OVR (Pedro Porro, João Pedro)**: 104 Pieces → `8 columns × 13 rows`
- **105 OVR (Jordan Pickford, Pedro Gonçalves, Pedro Neto)**: 105 Pieces → `7 columns × 15 rows`

---

## 2. Interactive Jigsaw Gameplay Mechanics
- **Direct Board Piece Swapping**:
  - The puzzle board displays the complete grid initialized in a randomized state.
  - Clicking Piece A marks it selected with an active neon outline and coordinate tag.
  - Clicking Piece B instantly swaps Piece A and Piece B with an audio click.
  - Pieces that match their target coordinate display a subtle alignment indicator.
  - Live progress counter: `Pieces in place: X / [100-105]`.
- **Blurred Reference Preview**:
  - A side blueprint preview of the target card with a soft intentional blur (`filter blur-[2px]`) as requested, with a quick toggle between blurred and unblurred preview.
- **Fast Testing & Verification**:
  - Retain "⚡ Auto Solve Current" and "⚡ Solve All 9 Puzzles" buttons so 100+ piece puzzles can be quickly completed during testing and development.
- **Completion Fanfare & Rewards**:
  - Solving all pieces triggers walkout fanfare, confetti, card award directly to Club, and progression toward the 108 LW Yeremy Pino Set Reward.

---

## 3. Files to Update
1. `src/components/PixelPuzzleHub.tsx`:
   - Add dynamic grid configuration calculator based on card rating (`cols`, `rows`, `pieceCount`).
   - Implement dynamic background slicing `backgroundSize: ${cols * 100}% ${rows * 100}%` and position calculation.
   - Update the preview box to render the blurred reference graphic.
   - Update header/labels to reflect jigsaw piece counts (e.g. "100-Piece Jigsaw" vs "105-Piece Jigsaw").
2. Verification via `lint_applet` and `compile_applet`.
