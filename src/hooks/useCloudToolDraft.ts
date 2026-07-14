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
  /** Apply a restored payload (called once when opt-in + cloud data found). */
  applyPayload: (payload: T) => void;
  /** Debounce ms for autosave while opted in. */
  debounceMs?: number;
};

/**
 * Opt-in cloud draft for Invoice / Debt. Local-only by default.
 * When enabled and signed in, drafts upsert to tool_drafts under RLS.
 */
export function useCloudToolDraft<T extends Record<string, unknown>>({
  toolKey,
  getPayload,
  applyPayload,
  debounceMs = 1200,
}: Props<T>) {
  const { user } = useAuth();
  const [optIn, setOptIn] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error' | 'restored'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const restoredRef = useRef(false);
  const getPayloadRef = useRef(getPayload);
  const applyPayloadRef = useRef(applyPayload);
  getPayloadRef.current = getPayload;
  applyPayloadRef.current = applyPayload;

  useEffect(() => {
    setOptIn(isCloudDraftOptedIn(toolKey));
  }, [toolKey]);

  // Restore once when signed in + opted in
  useEffect(() => {
    if (!user?.id || !optIn || restoredRef.current) return;
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
          applyPayloadRef.current(payload as T);
          restoredRef.current = true;
          setStatus('restored');
          setMessage('Restored draft from your account.');
        }
      } catch {
        /* ignore */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id, optIn, toolKey]);

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
    status,
    message,
    enable,
    disable,
    saveNow,
    scheduleSave,
  };
}
