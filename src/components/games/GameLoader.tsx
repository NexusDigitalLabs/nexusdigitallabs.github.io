'use client';

/**
 * Client-side loader for all game components.
 *
 * Using `dynamic` with `ssr: false` here (inside a 'use client' component)
 * is the correct Next.js App Router pattern. This prevents SSR for game
 * components that rely on browser-only APIs (localStorage, canvas) and
 * eliminates hydration mismatches that would leave the page non-interactive.
 */
import dynamic from 'next/dynamic';

const GamesLobbyClient = dynamic(() => import('./GamesLobbyClient'), { ssr: false, loading: () => null });
const Game2048 = dynamic(() => import('./Game2048'), { ssr: false, loading: () => null });
const GameSnake = dynamic(() => import('./GameSnake'), { ssr: false, loading: () => null });
const GameBlackjack = dynamic(() => import('./GameBlackjack'), { ssr: false, loading: () => null });
const GameSudoku = dynamic(() => import('./GameSudoku'), { ssr: false, loading: () => null });
const GameGridlock = dynamic(() => import('./GameGridlock'), { ssr: false, loading: () => null });
const GameSumoku = dynamic(() => import('./GameSumoku'), { ssr: false, loading: () => null });
const GameCrypticPaths = dynamic(() => import('./GameCrypticPaths'), { ssr: false, loading: () => null });
const GameSemanticShift = dynamic(() => import('./GameSemanticShift'), { ssr: false, loading: () => null });

const COMPONENTS = {
  lobby: GamesLobbyClient,
  '2048': Game2048,
  snake: GameSnake,
  blackjack: GameBlackjack,
  sudoku: GameSudoku,
  gridlock: GameGridlock,
  sumoku: GameSumoku,
  'cryptic-paths': GameCrypticPaths,
  'semantic-shift': GameSemanticShift,
} as const;

type GameKey = keyof typeof COMPONENTS;

export default function GameLoader({ game }: { game: GameKey }) {
  const Component = COMPONENTS[game];
  return <Component />;
}
