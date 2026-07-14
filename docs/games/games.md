# Games Section

**Three lightweight browser games with shared session state, username persistence, and high score tracking.**

### [→ Open Games Lobby](https://nexusdigitallabs.dev/games/)

![Status](https://img.shields.io/badge/Status-Live-brightgreen?style=flat-square)
![Built With](https://img.shields.io/badge/Built%20With-React%20%2F%20Next.js-000000?style=flat-square&logo=next.js)
![Storage](https://img.shields.io/badge/Storage-localStorage%20%2B%20optional%20cloud-lightgrey?style=flat-square)

---

## Overview

The `/games/` section provides a set of lightweight, skill-based browser games built entirely with React and (where needed) HTML5 Canvas. All game logic is client-side. A shared username gate appears on first visit to any game, and high scores persist in `localStorage`. When signed in, best scores also sync to Supabase (`game_scores`) and merge with local on load.

---

## Routes

| Route | Component | Mechanic |
|---|---|---|
| `/games/` | `GamesLobbyClient.tsx` | Lobby — username gate + game cards with high score badges |
| `/games/2048/` | `Game2048.tsx` | Turn-based 4×4 matrix tile merge |
| `/games/snake/` | `GameSnake.tsx` | Arcade — HTML5 Canvas, `requestAnimationFrame` loop |
| `/games/blackjack/` | `GameBlackjack.tsx` | Card game — dealer AI, chip betting |

---

## Source Files

```
src/app/games/page.tsx                    ← Lobby server component (metadata)
src/app/games/2048/page.tsx               ← 2048 server component (metadata)
src/app/games/snake/page.tsx              ← Snake server component (metadata)
src/app/games/blackjack/page.tsx          ← Blackjack server component (metadata)

src/components/games/UsernameGate.tsx     ← Shared username modal
src/components/games/GamesLobbyClient.tsx ← Lobby UI with score badges
src/components/games/Game2048.tsx         ← 2048 game
src/components/games/GameSnake.tsx        ← Snake game (Canvas)
src/components/games/GameBlackjack.tsx    ← Blackjack game

src/hooks/useGameState.ts                 ← localStorage hook for username + high scores
```

---

## Shared State — `useGameState`

Custom hook providing:

| Function | Description |
|---|---|
| `username` | Current player name (from `localStorage`) |
| `setUsername(name)` | Persist new username |
| `clearUsername()` | Remove username (triggers gate on next game visit) |
| `getHighScore(gameKey)` | Read high score for a game from `localStorage` |
| `saveScore(gameKey, score)` | Write new high score if it beats the existing record |
| `loaded` | Boolean — `true` after `useEffect` hydrates from `localStorage` |

`localStorage` keys:
- `ndl_username` — temporary player name
- `ndl_hs_{gameKey}` — high score per game (`2048`, `snake`, `blackjack`)

Cloud (optional, signed-in): table `public.game_scores` via [`005_game_scores.sql`](../../supabase/migrations/005_game_scores.sql). Helpers in `src/lib/game-scores.ts`.

---

## Username Gate — `UsernameGate.tsx`

Displayed as a centered modal overlay when `username` is `null`. Input is optional — if left blank, a fallback name (`Player_XXXX`) is auto-assigned. On submit, `setUsername()` is called and the gate dismisses.

---

## 2048

**File:** `src/components/games/Game2048.tsx`

- 4×4 board stored as a flat `number[]` array in `useState`.
- `shiftLine(line)` implements the core compress-merge-compress algorithm.
- `applyMove(direction)` applies `shiftLine` across rows/columns in the correct traversal order.
- New tiles (90% chance `2`, 10% chance `4`) spawn in a random empty cell after each valid move.
- Game over is detected when no empty cells remain and no adjacent merge is possible.
- Keyboard arrow keys and touch swipe are both handled.
- High score persisted via `useGameState`.
- Tile colours follow the standard 2048 palette up to `2048`.

**Accent:** Emerald `#4ade80` for 2048 tile and win banner. Red for game over.

---

## Snake

**File:** `src/components/games/GameSnake.tsx`

- Canvas size: 280×280px (14×14 grid, 20px cells).
- Game loop uses `requestAnimationFrame`. Each frame's elapsed time is compared against a tick interval (150ms) to advance state without fixed `setInterval`.
- **All mutable game state** (snake segments, direction, food position, score, alive flag) is stored in `useRef` to avoid stale closures inside the `rAF` callback.
- Food is placed randomly in a cell not occupied by the snake.
- Collision detection: wall bounds + self-intersection.
- Controls: keyboard arrow / WASD keys, and an on-screen D-pad (visible on touch devices via CSS `@media (pointer: coarse)`).
- High score persisted via `useGameState`.

**Accent:** Emerald snake body and food. Red for game over overlay.

---

## Blackjack

**File:** `src/components/games/GameBlackjack.tsx`

- Full 52-card deck built from `SUITS × FACES`, shuffled with Fisher-Yates.
- Hand values calculated with correct Ace softening (Ace = 11, reduced to 1 if bust).
- Player starts with 500 chips per session (reset on page reload).
- Game phases: `idle → player → dealer → result`.
- **Actions:** Hit, Stand, Double Down (2× bet, one card, then dealer plays).
- **Dealer AI:** Draws until hand total ≥ 17.
- Payout rules: Blackjack pays 1.5×, win pays 1×, push returns bet, bust/loss forfeits bet.
- High score = peak chip count, persisted via `useGameState`.

**Accent:** Emerald for win/blackjack states. Red for bust/lose states.

---

## Design System

Consistent with the project's minimalist Swedish aesthetic:

| Token | Value |
|---|---|
| Page background | `#F9FAFB` |
| Card / panel background | `#FFFFFF` |
| Primary text | `slate-900` |
| Sharp edges | `border-radius: 0` on all game elements |
| Win / high score accent | Emerald `#4ADE80` |
| Game over / bust accent | `#ef4444` red |
| Button focus | Crisp `1px solid #000` border |

---

## Privacy

- Only `localStorage` is used — for username and high scores.
- No data is transmitted to any server.
- No cookies written.
- GDPR/CCPA compliant without a cookie banner.
