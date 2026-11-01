import { describe, expect, it } from 'vitest';
import { BUDDIES, NAME_MAX, cleanName, getBuddy, withName } from '@/lib/games/little-learners-buddy';

describe('little learners name', () => {
  it('keeps letters from any alphabet, spaces, hyphens and apostrophes', () => {
    expect(cleanName('  Mia  ')).toBe('Mia');
    expect(cleanName('Little   Bear')).toBe('Little Bear');
    expect(cleanName("Zoë-Ann O'Neil")).toBe("Zoë-Ann O'Neil");
    expect(cleanName('දිලන්')).toBe('දිලන්');
    expect(cleanName('<b>Sam</b> 123!')).toBe('bSamb');
  });

  it('caps the length', () => {
    expect(cleanName('a'.repeat(50))).toHaveLength(NAME_MAX);
  });

  it('slips the name into the opening exclamation', () => {
    expect(withName("Yay! That's number three!", 'Mia')).toBe("Yay, Mia! That's number three!");
    expect(withName("Oops, good try! That's five. Let's try again!", 'Mia')).toBe(
      "Oops, good try, Mia! That's five. Let's try again!",
    );
    expect(withName("That's 4! Can you find 3?", 'Mia')).toBe("That's 4, Mia! Can you find 3?");
  });

  it('leaves text alone without a name or a short opener', () => {
    expect(withName('Yay!', '')).toBe('Yay!');
    expect(withName('This sentence is far too long to take a name. Really!', 'Mia')).toBe(
      'This sentence is far too long to take a name. Really!',
    );
  });
});

describe('little learners buddies', () => {
  it('falls back to the first buddy for unknown ids', () => {
    expect(getBuddy('dragon')).toBe(BUDDIES[0]);
    expect(getBuddy('bear').name).toBe('Honey');
  });
});
