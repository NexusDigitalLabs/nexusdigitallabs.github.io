import { describe, it, expect } from 'vitest';
import { isGameKey, GAME_KEYS } from '@/lib/game-scores';
import { isToolDraftKey, TOOL_DRAFT_KEYS } from '@/lib/tool-drafts';

describe('game-scores helpers', () => {
  it('accepts known game keys', () => {
    for (const key of GAME_KEYS) {
      expect(isGameKey(key)).toBe(true);
    }
  });

  it('rejects unknown keys', () => {
    expect(isGameKey('tetris')).toBe(false);
    expect(isGameKey('')).toBe(false);
  });
});

describe('tool-drafts helpers', () => {
  it('accepts known tool keys', () => {
    for (const key of TOOL_DRAFT_KEYS) {
      expect(isToolDraftKey(key)).toBe(true);
    }
  });

  it('rejects unknown keys', () => {
    expect(isToolDraftKey('prompt-architect')).toBe(false);
  });
});
