'use client';

import { useCallback, useEffect, useState } from 'react';
import { LESSONS, levelForXp, orderedLessons } from '@/data/academy';

const STORAGE_KEY = 'ndl_academy_completed';
const QUIZ_STORAGE_KEY = 'ndl_academy_quiz_answers';

/** lessonId -> questionIndex -> the option index picked for that question. */
type QuizAnswers = Record<string, Record<number, number>>;

function readCompleted(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed) : new Set();
  } catch {
    return new Set();
  }
}

function writeCompleted(ids: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    /* localStorage blocked (private mode, etc.) — progress just won't persist */
  }
}

function readQuizAnswers(): QuizAnswers {
  try {
    const raw = localStorage.getItem(QUIZ_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeQuizAnswers(answers: QuizAnswers) {
  try {
    localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(answers));
  } catch {
    /* localStorage blocked — answers just won't persist */
  }
}

/**
 * Local-first academy progress: which lessons are completed, derived XP and
 * level, sequential unlocking, and check-yourself quiz answers per lesson.
 * Matches the site's "client-side first" policy — no account required, no
 * server round trip to read your own progress. Nothing here is
 * payment-gated; it's purely completion-gated.
 *
 * Quiz answers are stored here (not as CheckYourselfQuiz's own state) so
 * they survive navigating away and back to a lesson — see docs/academy.
 */
export function useAcademyProgress() {
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setCompleted(readCompleted());
    setQuizAnswers(readQuizAnswers());
    setLoaded(true);
  }, []);

  const markComplete = useCallback((lessonId: string) => {
    setCompleted((prev) => {
      if (prev.has(lessonId)) return prev;
      const next = new Set(prev);
      next.add(lessonId);
      writeCompleted(next);
      return next;
    });
  }, []);

  const resetProgress = useCallback(() => {
    const empty = new Set<string>();
    writeCompleted(empty);
    setCompleted(empty);
    writeQuizAnswers({});
    setQuizAnswers({});
  }, []);

  const isComplete = useCallback((lessonId: string) => completed.has(lessonId), [completed]);

  /** A lesson is unlocked once every earlier *ready* lesson is completed. */
  const isUnlocked = useCallback(
    (order: number) => {
      const readyBefore = orderedLessons().filter((l) => l.order < order && l.status === 'ready');
      return readyBefore.every((l) => completed.has(l.id));
    },
    [completed]
  );

  const getQuizAnswers = useCallback(
    (lessonId: string): Record<number, number> => quizAnswers[lessonId] ?? {},
    [quizAnswers]
  );

  const setQuizAnswer = useCallback((lessonId: string, questionIndex: number, optionIndex: number) => {
    setQuizAnswers((prev) => {
      const next = { ...prev, [lessonId]: { ...prev[lessonId], [questionIndex]: optionIndex } };
      writeQuizAnswers(next);
      return next;
    });
  }, []);

  const resetQuizAnswers = useCallback((lessonId: string) => {
    setQuizAnswers((prev) => {
      const next = { ...prev };
      delete next[lessonId];
      writeQuizAnswers(next);
      return next;
    });
  }, []);

  const xp = LESSONS.filter((l) => completed.has(l.id)).reduce((sum, l) => sum + l.xp, 0);
  const { level, next: nextLevel } = levelForXp(xp);
  const readyLessons = LESSONS.filter((l) => l.status === 'ready');
  const completedReadyCount = readyLessons.filter((l) => completed.has(l.id)).length;

  return {
    loaded,
    completed,
    xp,
    level,
    nextLevel,
    completedReadyCount,
    totalReadyCount: readyLessons.length,
    markComplete,
    resetProgress,
    isComplete,
    isUnlocked,
    getQuizAnswers,
    setQuizAnswer,
    resetQuizAnswers,
  };
}
