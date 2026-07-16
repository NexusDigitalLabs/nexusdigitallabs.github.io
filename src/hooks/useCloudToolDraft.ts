'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import {
  deleteToolDraft,
  fetchToolDraft,
  isCloudDraftOptedIn,
  setCloudDraftOptIn,
  type ToolDraftKey,
  upsertToolDraft,
} from '@/lib/tool-drafts';

type Props<T extends Record<string, unknown>> = {
  toolKey: ToolDraftKey;
  /** Serialize current editor state for cloud. */
  getPayload: () => T;
  /** Apply a restored payload (called once when cloud data found). */
  applyPayload: (payload: T) => void;
  /** Optional hook after cloud restore (e.g. recalculate derived UI). */
  onRestored?: (payload: T) => void;
  /** Debounce ms for autosave while opted in. */
  debounceMs?: number;
};

function readOptIn(toolKey: ToolDraftKey): boolean {
  if (typeof window === 'undefined') return false;
  return isCloudDraftOptedIn(toolKey);
}

/**
 * Opt-in cloud draft for Invoice / Debt. Local-only by default.
 * When enabled and signed in, drafts upsert to tool_drafts under RLS.
 * If a cloud draft already exists, opt-in is turned on automatically on load.
 */
export function useCloudToolDraft<T extends Record<string, unknown>>({
  toolKey,
  getPayload,
  applyPayload,
  onRestored,
  debounceMs = 1200,
}: Props<T>) {
  const { user } = useAuth();
  const [optIn, setOptIn] = useState(() => readOptIn(toolKey));
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error' | 'restored'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [bootstrapped, setBootstrapped] = useState(() => typeof window === 'undefined');
  const restoredRef = useRef(false);
  const getPayloadRef = useRef(getPayload);
  const applyPayloadRef = useRef(applyPayload);
  const onRestoredRef = useRef(onRestored);
  getPayloadRef.current = getPayload;
  applyPayloadRef.current = applyPayload;
  onRestoredRef.current = onRestored;

  useEffect(() => {
    setOptIn(readOptIn(toolKey));
  }, [toolKey]);

  // Allow restore again after sign-out → sign-in
  useEffect(() => {
    if (!user?.id) {
      restoredRef.current = false;
    }
  }, [user?.id]);

  // When signed in, probe cloud — restore + auto-enable if a draft exists (no re-click needed).
  useEffect(() => {
    if (!user?.id) {
      setBootstrapped(true);
      return;
    }
    if (restoredRef.current) {
      setBootstrapped(true);
      return;
    }
    let cancelled = false;

    (async () => {
      try {
        const supabase = createBrowserSupabaseClient();
        const { payload, error } = await fetchToolDraft(supabase, user.id, toolKey);
        if (cancelled) return;
        if (error) {
          setStatus('error');
          setMessage(error);
          return;
        }
        if (payload && Object.keys(payload).length > 0) {
          setCloudDraftOptIn(toolKey, true);
          setOptIn(true);
          applyPayloadRef.current(payload as T);
          onRestoredRef.current?.(payload as T);
          restoredRef.current = true;
          setStatus('restored');
          setMessage('Restored draft from your account.');
        }
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setBootstrapped(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id, toolKey]);

  const saveNow = useCallback(async () => {
    if (!user?.id || !optIn) return;
    setStatus('saving');
    setMessage(null);
    try {
      const supabase = createBrowserSupabaseClient();
      const { ok, error } = await upsertToolDraft(
        supabase,
        user.id,
        toolKey,
        getPayloadRef.current()
      );
      if (!ok) {
        setStatus('error');
        setMessage(error ?? 'Save failed');
        return;
      }
      setStatus('saved');
      setMessage('Draft saved to your account.');
    } catch {
      setStatus('error');
      setMessage('Save failed');
    }
  }, [user?.id, optIn, toolKey]);

  // Debounced autosave while opted in — callers should bump `dirtyToken` via scheduleSave
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleSave = useCallback(() => {
    if (!user?.id || !optIn) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      void saveNow();
    }, debounceMs);
  }, [user?.id, optIn, debounceMs, saveNow]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const enable = useCallback(async () => {
    if (!user) {
      setMessage('Sign in to enable cloud drafts.');
      setStatus('error');
      return;
    }
    setCloudDraftOptIn(toolKey, true);
    setOptIn(true);
    setMessage('Cloud drafts on — drafts sync while you’re signed in.');
    setStatus('saving');
    try {
      const supabase = createBrowserSupabaseClient();
      const { ok, error } = await upsertToolDraft(
        supabase,
        user.id,
        toolKey,
        getPayloadRef.current()
      );
      if (!ok) {
        setStatus('error');
        setMessage(error ?? 'Save failed');
        return;
      }
      restoredRef.current = true;
      setStatus('saved');
      setMessage('Draft saved to your account.');
    } catch {
      setStatus('error');
      setMessage('Save failed');
    }
  }, [user, toolKey]);

  const disable = useCallback(async (deleteRemote: boolean) => {
    setCloudDraftOptIn(toolKey, false);
    setOptIn(false);
    restoredRef.current = false;
    if (deleteRemote && user?.id) {
      const supabase = createBrowserSupabaseClient();
      await deleteToolDraft(supabase, user.id, toolKey);
      setMessage('Cloud drafts off — remote draft deleted.');
    } else {
      setMessage('Cloud drafts off — local work continues here only.');
    }
    setStatus('idle');
  }, [toolKey, user?.id]);

  return {
    user,
    optIn,
    bootstrapped,
    status,
    message,
    enable,
    disable,
    saveNow,
    scheduleSave,
  };
}
