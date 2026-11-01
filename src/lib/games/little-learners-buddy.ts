/**
 * Little Learners — the child's name and their buddy, a little creature that reacts to every answer.
 * Pure data + text helpers; the creature itself is drawn in src/components/games/LittleBuddy.tsx.
 */

export type BuddyKind = 'bunny' | 'bear' | 'kitty' | 'sprout';
export type BuddyMood = 'idle' | 'happy' | 'cheer' | 'oops' | 'nod';

export type Buddy = { id: BuddyKind; name: string; body: string; belly: string; ink: string };

export const BUDDIES: readonly Buddy[] = [
  { id: 'kitty', name: 'Mimi', body: '#93c5fd', belly: '#dbeafe', ink: '#1e3a8a' },
  { id: 'bunny', name: 'Bun', body: '#f9a8d4', belly: '#fce7f3', ink: '#9d174d' },
  { id: 'bear', name: 'Honey', body: '#fcd34d', belly: '#fef3c7', ink: '#92400e' },
  { id: 'sprout', name: 'Sprout', body: '#86efac', belly: '#dcfce7', ink: '#166534' },
];

export function getBuddy(id: string | undefined): Buddy {
  return BUDDIES.find((b) => b.id === id) ?? BUDDIES[0];
}

export const NAME_MAX = 20;

/** Keeps letters (any alphabet), spaces, hyphens and apostrophes; trims and caps the length. */
export function cleanName(raw: string): string {
  return raw
    .replace(/[^\p{L}\p{M} '’-]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, NAME_MAX)
    .trim();
}

/**
 * Slips the child's name into the opening exclamation: "Yay! That's three!" → "Yay, Mia! That's three!".
 * Leaves the text alone when there is no name or no short opener to attach it to.
 */
export function withName(text: string, name: string): string {
  if (!name) return text;
  const m = /^([^!?.]{1,24})([!?])/.exec(text);
  if (!m) return text;
  return `${m[1]}, ${name}${m[2]}${text.slice(m[0].length)}`;
}

/** Not every line gets the child's name — often enough to feel personal, not so often it grates. */
export const NAME_CHANCE = 0.6;

export function sometimesWithName(text: string, name: string, rng: () => number = Math.random): string {
  return rng() < NAME_CHANCE ? withName(text, name) : text;
}
