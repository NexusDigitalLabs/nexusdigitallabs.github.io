'use client';

import { useState, useEffect, useCallback } from 'react';

const KEYS = {
  username: 'ndl_username',
  score: (game: string) => `ndl_hs_${game}`,
};

export function useGameState() {
  const [username, setUsernameState] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEYS.username);
      setUsernameState(stored);
    } catch {
      // localStorage blocked (private browsing restriction in some browsers)
    }
    setLoaded(true);
  }, []);

  const setUsername = useCallback((name: string) => {
    try { localStorage.setItem(KEYS.username, name); } catch { /* ignore */ }
    setUsernameState(name);
  }, []);

  const clearUsername = useCallback(() => {
    try { localStorage.removeItem(KEYS.username); } catch { /* ignore */ }
    setUsernameState(null);
  }, []);

  // useCallback gives a stable reference so components that include
  // getHighScore in a useEffect dependency array don't trigger infinite loops.
  const getHighScore = useCallback((game: string): number => {
    try {
      return parseInt(localStorage.getItem(KEYS.score(game)) ?? '0', 10);
    } catch {
      return 0;
    }
  }, []);

  const saveScore = useCallback((game: string, score: number) => {
    try {
      const current = parseInt(localStorage.getItem(KEYS.score(game)) ?? '0', 10);
      if (score > current) {
        localStorage.setItem(KEYS.score(game), String(score));
      }
    } catch { /* ignore */ }
  }, []);

  return { username, setUsername, clearUsername, getHighScore, saveScore, loaded };
}
