'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import {
  fetchOwnGameScores,
  isGameKey,
  upsertGameScore,
  type GameKey,
} from '@/lib/game-scores';

const KEYS = {
  username: 'ndl_username',
  score: (game: string) => `ndl_hs_${game}`,
};

function readLocalScore(game: string): number {
  try {
    return parseInt(localStorage.getItem(KEYS.score(game)) ?? '0', 10);
  } catch {
    return 0;
  }
}

function writeLocalScore(game: string, score: number) {
  try {
    localStorage.setItem(KEYS.score(game), String(score));
  } catch {
    /* ignore */
  }
}

export function useGameState() {
  const { user, profile } = useAuth();
  const [username, setUsernameState] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const mergingRef = useRef(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEYS.username);
      setUsernameState(stored);
    } catch {
      // localStorage blocked
    }
    setLoaded(true);
  }, []);

  // Merge cloud ↔ local when signed in
  useEffect(() => {
    if (!user?.id || !loaded || mergingRef.current) return;
    let cancelled = false;
    mergingRef.current = true;

    (async () => {
      try {
        const supabase = createBrowserSupabaseClient();
        const cloud = await fetchOwnGameScores(supabase, user.id);
        if (cancelled) return;

        for (const [game, cloudScore] of Object.entries(cloud)) {
          if (!isGameKey(game)) continue;
          const local = readLocalScore(game);
          const best = Math.max(local, cloudScore);
          if (best > local) writeLocalScore(game, best);
          if (best > cloudScore) {
            await upsertGameScore(
              supabase,
              user.id,
              game,
              best,
              profile?.display_name ?? username
            );
          }
        }
      } catch {
        /* cloud optional */
      } finally {
        mergingRef.current = false;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id, loaded, profile?.display_name, username]);

  const setUsername = useCallback((name: string) => {
    try {
      localStorage.setItem(KEYS.username, name);
    } catch {
      /* ignore */
    }
    setUsernameState(name);
  }, []);

  const clearUsername = useCallback(() => {
    try {
      localStorage.removeItem(KEYS.username);
    } catch {
      /* ignore */
    }
    setUsernameState(null);
  }, []);

  const getHighScore = useCallback((game: string): number => {
    return readLocalScore(game);
  }, []);

  const saveScore = useCallback(
    (game: string, score: number) => {
      const current = readLocalScore(game);
      if (score > current) {
        writeLocalScore(game, score);
      }

      if (user?.id && isGameKey(game) && score > current) {
        const supabase = createBrowserSupabaseClient();
        void upsertGameScore(
          supabase,
          user.id,
          game as GameKey,
          score,
          profile?.display_name ?? username
        );
      }
    },
    [user?.id, profile?.display_name, username]
  );

  return {
    username,
    setUsername,
    clearUsername,
    getHighScore,
    saveScore,
    loaded,
    cloudSync: Boolean(user),
  };
}
