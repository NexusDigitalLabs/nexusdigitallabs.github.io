'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import type { Session, User } from '@supabase/supabase-js';
import { ensureProfile, type Profile } from '@/lib/profile';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  /** Push a freshly saved profile into the shared auth UI (header, etc.). */
  setProfile: (profile: Profile | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function authConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authConfigured()) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const supabase = createBrowserSupabaseClient();

    async function syncProfile(nextUser: User) {
      const { profile: row } = await ensureProfile(supabase, nextUser);
      if (!cancelled && row) setProfile(row);
    }

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
      if (data.session?.user) {
        void syncProfile(data.session.user);
      } else {
        setProfile(null);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
      if (!nextSession?.user) {
        setProfile(null);
        if (event === 'SIGNED_OUT') {
          router.refresh();
        }
        return;
      }
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        void syncProfile(nextSession.user);
      }
      if (event === 'SIGNED_IN') {
        router.refresh();
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [router]);

  const signOut = useCallback(async () => {
    if (!authConfigured()) return;
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    router.refresh();
  }, [router]);

  const value = useMemo(
    () => ({ user, session, profile, loading, signOut, setProfile }),
    [user, session, profile, loading, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
