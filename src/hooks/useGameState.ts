'use client';

import { useState, useEffect } from 'react';

const KEYS = {
  username: 'ndl_username',
  score: (game: string) => `ndl_hs_${game}`,
};

export function useGameState() {
  const [username, setUsernameState] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(KEYS.username);
    setUsernameState(stored);
    setLoaded(true);
  }, []);

  const setUsername = (name: string) => {
    localStorage.setItem(KEYS.username, name);
    setUsernameState(name);
  };

  const clearUsername = () => {
    localStorage.removeItem(KEYS.username);
    setUsernameState(null);
  };

  const getHighScore = (game: string): number => {
    if (typeof window === 'undefined') return 0;
    return parseInt(localStorage.getItem(KEYS.score(game)) ?? '0', 10);
  };

  const saveScore = (game: string, score: number) => {
    const current = getHighScore(game);
    if (score > current) {
      localStorage.setItem(KEYS.score(game), String(score));
    }
  };

  return { username, setUsername, clearUsername, getHighScore, saveScore, loaded };
}
