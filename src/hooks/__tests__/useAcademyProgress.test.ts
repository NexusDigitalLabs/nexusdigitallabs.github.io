import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAcademyProgress } from '@/hooks/useAcademyProgress';

describe('useAcademyProgress', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('starts unloaded, then hydrates to empty progress', async () => {
    const { result } = renderHook(() => useAcademyProgress());
    await waitFor(() => expect(result.current.loaded).toBe(true));
    expect(result.current.completed.size).toBe(0);
    expect(result.current.xp).toBe(0);
    expect(result.current.level.name).toBe('Apprentice');
  });

  it('lesson 1 is unlocked from the start; lesson 2 is not', async () => {
    const { result } = renderHook(() => useAcademyProgress());
    await waitFor(() => expect(result.current.loaded).toBe(true));
    expect(result.current.isUnlocked(1)).toBe(true);
    expect(result.current.isUnlocked(2)).toBe(false);
  });

  it('markComplete unlocks the next lesson and persists to localStorage', async () => {
    const { result } = renderHook(() => useAcademyProgress());
    await waitFor(() => expect(result.current.loaded).toBe(true));

    act(() => result.current.markComplete('lesson-1'));

    expect(result.current.isComplete('lesson-1')).toBe(true);
    expect(result.current.isUnlocked(2)).toBe(true);
    expect(JSON.parse(window.localStorage.getItem('ndl_academy_completed')!)).toEqual(['lesson-1']);
  });

  it('marking the same lesson complete twice does not duplicate XP', async () => {
    const { result } = renderHook(() => useAcademyProgress());
    await waitFor(() => expect(result.current.loaded).toBe(true));

    act(() => result.current.markComplete('lesson-1'));
    const xpAfterFirst = result.current.xp;
    act(() => result.current.markComplete('lesson-1'));

    expect(result.current.xp).toBe(xpAfterFirst);
    expect(result.current.completed.size).toBe(1);
  });

  it('awards the correct XP and reflects it in a fresh hook instance (simulates navigating to another page)', async () => {
    const first = renderHook(() => useAcademyProgress());
    await waitFor(() => expect(first.result.current.loaded).toBe(true));
    act(() => first.result.current.markComplete('lesson-1')); // 20 XP

    // A new component mount (e.g. after navigating to a different lesson route)
    // must read the same persisted state, not start over.
    const second = renderHook(() => useAcademyProgress());
    await waitFor(() => expect(second.result.current.loaded).toBe(true));
    expect(second.result.current.xp).toBe(20);
    expect(second.result.current.isComplete('lesson-1')).toBe(true);
  });

  it('resetProgress clears completion state and localStorage', async () => {
    const { result } = renderHook(() => useAcademyProgress());
    await waitFor(() => expect(result.current.loaded).toBe(true));
    act(() => result.current.markComplete('lesson-1'));
    expect(result.current.xp).toBeGreaterThan(0);

    act(() => result.current.resetProgress());

    expect(result.current.xp).toBe(0);
    expect(result.current.completed.size).toBe(0);
    expect(window.localStorage.getItem('ndl_academy_completed')).toBe('[]');
  });

  describe('quiz answers', () => {
    it('defaults to no answers for a lesson never touched', async () => {
      const { result } = renderHook(() => useAcademyProgress());
      await waitFor(() => expect(result.current.loaded).toBe(true));
      expect(result.current.getQuizAnswers('lesson-1')).toEqual({});
    });

    it('setQuizAnswer records an answer and persists it', async () => {
      const { result } = renderHook(() => useAcademyProgress());
      await waitFor(() => expect(result.current.loaded).toBe(true));

      act(() => result.current.setQuizAnswer('lesson-1', 0, 2));

      expect(result.current.getQuizAnswers('lesson-1')).toEqual({ 0: 2 });
      expect(JSON.parse(window.localStorage.getItem('ndl_academy_quiz_answers')!)).toEqual({
        'lesson-1': { '0': 2 },
      });
    });

    it('persists across a fresh hook instance — the exact "navigate away and back" scenario', async () => {
      const first = renderHook(() => useAcademyProgress());
      await waitFor(() => expect(first.result.current.loaded).toBe(true));
      act(() => {
        first.result.current.setQuizAnswer('lesson-1', 0, 2);
        first.result.current.setQuizAnswer('lesson-1', 1, 0);
      });

      const second = renderHook(() => useAcademyProgress());
      await waitFor(() => expect(second.result.current.loaded).toBe(true));
      expect(second.result.current.getQuizAnswers('lesson-1')).toEqual({ 0: 2, 1: 0 });
    });

    it('keeps answers for different lessons independent', async () => {
      const { result } = renderHook(() => useAcademyProgress());
      await waitFor(() => expect(result.current.loaded).toBe(true));

      act(() => {
        result.current.setQuizAnswer('lesson-1', 0, 1);
        result.current.setQuizAnswer('lesson-2', 0, 3);
      });

      expect(result.current.getQuizAnswers('lesson-1')).toEqual({ 0: 1 });
      expect(result.current.getQuizAnswers('lesson-2')).toEqual({ 0: 3 });
    });

    it('resetQuizAnswers clears only the requested lesson', async () => {
      const { result } = renderHook(() => useAcademyProgress());
      await waitFor(() => expect(result.current.loaded).toBe(true));

      act(() => {
        result.current.setQuizAnswer('lesson-1', 0, 1);
        result.current.setQuizAnswer('lesson-2', 0, 3);
      });
      act(() => result.current.resetQuizAnswers('lesson-1'));

      expect(result.current.getQuizAnswers('lesson-1')).toEqual({});
      expect(result.current.getQuizAnswers('lesson-2')).toEqual({ 0: 3 });
    });

    it('resetProgress also wipes quiz answers, not just completion', async () => {
      const { result } = renderHook(() => useAcademyProgress());
      await waitFor(() => expect(result.current.loaded).toBe(true));

      act(() => result.current.setQuizAnswer('lesson-1', 0, 1));
      act(() => result.current.resetProgress());

      expect(result.current.getQuizAnswers('lesson-1')).toEqual({});
      expect(window.localStorage.getItem('ndl_academy_quiz_answers')).toBe('{}');
    });
  });
});
