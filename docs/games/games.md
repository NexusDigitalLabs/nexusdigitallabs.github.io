# Games Section

**Eight browser games in two categories — Fun and Brain — with shared username gate, local high scores, and optional cloud sync when signed in.**

### [→ Open Games Lobby](https://nexusdigitallabs.dev/games/)

![Status](https://img.shields.io/badge/Status-Live-brightgreen?style=flat-square)
![Built With](https://img.shields.io/badge/Built%20With-React%20%2F%20Next.js-000000?style=flat-square&logo=next.js)
![Storage](https://img.shields.io/badge/Storage-localStorage%20%2B%20optional%20cloud-lightgrey?style=flat-square)

---

## Overview

The `/games/` section is fully client-side. High scores persist in `localStorage`. When signed in, best scores also sync to Supabase (`game_scores`) and merge with local on load.

### Categories

| Category | Games |
|---|---|
| **Fun** | 2048, Snake, Blackjack |
| **Brain** | Nexus Sudoku, Gridlock, Sumoku, Cryptic Paths, Semantic Shift |

---

## Routes

| Route | Category | Component |
|---|---|---|
| `/games/` | Lobby | `GamesLobbyClient.tsx` |
| `/games/2048/` | Fun | `Game2048.tsx` |
| `/games/snake/` | Fun | `GameSnake.tsx` |
| `/games/blackjack/` | Fun | `GameBlackjack.tsx` |
| `/games/sudoku/` | Brain | `GameSudoku.tsx` |
| `/games/gridlock/` | Brain | `GameGridlock.tsx` |
| `/games/sumoku/` | Brain | `GameSumoku.tsx` |
| `/games/cryptic-paths/` | Brain | `GameCrypticPaths.tsx` |
| `/games/semantic-shift/` | Brain | `GameSemanticShift.tsx` |

---

## Shared pieces

```
src/data/catalog.ts                 ← GAMES + category (fun|brain)
src/components/games/GameLoader.tsx ← dynamic ssr:false map
src/components/games/BrainShell.tsx ← shared brain chrome (difficulty, pause, overlay)
src/components/games/game-ui.tsx    ← fun-game chrome
src/lib/games/*.ts                  ← pure engines
src/lib/game-scores.ts              ← GameKey + cloud upsert helpers
supabase/migrations/007_game_scores_brain.sql
```

Brain games share: explicit `idle | playing | paused | gameover` lifecycle, difficulty tiers that reset state, timers via `useEffect` cleanup, and sharp / high-contrast chrome.

Cloud sync keys: `2048`, `snake`, `blackjack`, `sudoku`, `gridlock`, `sumoku`, `cryptic-paths`, `semantic-shift`.

---

## Brain games (summary)

### Nexus Sudoku
Unique-solution generator. Beginner→Hard clue counts (48 / 40 / 32 / 24) with countdowns **12 / 9 / 6 / 4 minutes**. Conflict highlighting; score = tier base − mistakes + time remaining.

### Gridlock
Flash / recall memory. Easy 3×3 (3 tiles, 2s look, **8s recall**) · Medium 4×4 (5, 1.5s, **6s**) · Hard 5×5 (7, 1s, **4s**). Wrong tile or recall timeout costs a life; three misses → game over.

### Sumoku
Connect adjacent tiles to hit a target sum; gravity refill. Timed rounds: Easy **75s** · Medium **45s** · Hard **40s** (+ target shifts every 12s).

### Cryptic Paths
Eulerian edge tour on SVG graphs. Timed: Easy **90s** · Medium **60s** · Hard **30s**. Undo available; score rewards speed.

### Semantic Shift
Stroop: MATCH WORD vs MATCH COLOR. Per-round timers **2.5s / 1.3s / 0.7s**. Streak multipliers; miss or timeout ends the run.

---

## Fun games

See prior docs for 2048, Snake (wrap-around walls + levels/speed), and Blackjack. Shared fun chrome lives in `game-ui.tsx`.

---

## Privacy

- Scores default to `localStorage`. When signed in, personal bests sync to Supabase (`game_scores`).
- See the Privacy Policy for accounts, analytics, and advertising.
- Run migration `007_game_scores_brain.sql` before cloud sync of new brain game keys will succeed.
