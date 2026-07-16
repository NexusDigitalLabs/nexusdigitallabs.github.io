export type CrypticTier = 'easy' | 'medium' | 'hard';

export type GraphNode = { id: number; x: number; y: number };
export type GraphEdge = { a: number; b: number };

export const CRYPTIC_TIERS: Record<
  CrypticTier,
  { countdownSec: number; baseScore: number }
> = {
  easy: { countdownSec: 90, baseScore: 500 },
  medium: { countdownSec: 60, baseScore: 900 },
  hard: { countdownSec: 30, baseScore: 1400 },
};

export function edgeKey(a: number, b: number): string {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

type Puzzle = { nodes: GraphNode[]; edges: GraphEdge[] };

/** Eulerian undirected graphs (all vertices even degree; connected). */
export function buildPuzzle(tier: CrypticTier): Puzzle {
  if (tier === 'easy') {
    // Square: 4 nodes, 4 edges — Eulerian circuit
    const nodes: GraphNode[] = [
      { id: 0, x: 80, y: 80 },
      { id: 1, x: 240, y: 80 },
      { id: 2, x: 240, y: 240 },
      { id: 3, x: 80, y: 240 },
    ];
    const edges: GraphEdge[] = [
      { a: 0, b: 1 },
      { a: 1, b: 2 },
      { a: 2, b: 3 },
      { a: 3, b: 0 },
    ];
    return { nodes, edges };
  }

  if (tier === 'medium') {
    // House / overlapping: 6 nodes
    const nodes: GraphNode[] = [
      { id: 0, x: 160, y: 40 },
      { id: 1, x: 60, y: 120 },
      { id: 2, x: 260, y: 120 },
      { id: 3, x: 60, y: 240 },
      { id: 4, x: 260, y: 240 },
      { id: 5, x: 160, y: 180 },
    ];
    const edges: GraphEdge[] = [
      { a: 0, b: 1 },
      { a: 0, b: 2 },
      { a: 1, b: 2 },
      { a: 1, b: 3 },
      { a: 2, b: 4 },
      { a: 3, b: 4 },
      { a: 1, b: 5 },
      { a: 2, b: 5 },
      { a: 3, b: 5 },
      { a: 4, b: 5 },
    ];
    return { nodes, edges };
  }

  // Hard: 8-node cycle + inner even chords (all vertices even degree → Eulerian circuit)
  const nodes: GraphNode[] = [
    { id: 0, x: 50, y: 60 },
    { id: 1, x: 160, y: 40 },
    { id: 2, x: 270, y: 70 },
    { id: 3, x: 300, y: 170 },
    { id: 4, x: 250, y: 270 },
    { id: 5, x: 120, y: 280 },
    { id: 6, x: 40, y: 190 },
    { id: 7, x: 160, y: 160 },
  ];
  const edges: GraphEdge[] = [
    { a: 0, b: 1 },
    { a: 1, b: 2 },
    { a: 2, b: 3 },
    { a: 3, b: 4 },
    { a: 4, b: 5 },
    { a: 5, b: 6 },
    { a: 6, b: 7 },
    { a: 7, b: 0 },
    { a: 0, b: 2 },
    { a: 2, b: 4 },
    { a: 4, b: 6 },
    { a: 6, b: 0 },
  ];
  return { nodes, edges };
}

export function neighbors(edges: GraphEdge[], node: number): number[] {
  const out: number[] = [];
  for (const e of edges) {
    if (e.a === node) out.push(e.b);
    if (e.b === node) out.push(e.a);
  }
  return out;
}

export function scoreCryptic(tier: CrypticTier, elapsedSec: number): number {
  const { baseScore, countdownSec } = CRYPTIC_TIERS[tier];
  const timePenalty = Math.floor(elapsedSec * 4);
  const bonus = Math.max(0, countdownSec - elapsedSec) * 5;
  return Math.max(0, baseScore - timePenalty + bonus);
}
