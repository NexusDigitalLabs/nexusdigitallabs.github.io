import { describe, expect, it } from 'vitest';
import {
  MIN_INDEXABLE_LESSON_WORDS,
  isLessonIndexable,
  lessonWordCount,
  type Lesson,
} from '@/data/academy';

const filler = (n: number) => Array.from({ length: n }, (_, i) => `word${i}`).join(' ');

function lesson(overrides: Partial<Lesson> & { words?: number } = {}): Lesson {
  const { words = 10, ...rest } = overrides;
  return {
    id: 'lesson-x',
    slug: 'x',
    order: 1,
    phaseId: 'foundations',
    title: 'X',
    xp: 10,
    status: 'ready',
    content: {
      blocks: [
        { type: 'p', text: filler(words) },
        { type: 'code', code: filler(5000) },
      ],
      exercise: '',
      quiz: [],
    },
    ...rest,
  };
}

describe('lesson indexability', () => {
  it('counts prose, list items and the exercise but not code', () => {
    const l = lesson({ words: 100 });
    l.content!.blocks.push({ type: 'list', items: [filler(20), filler(30)] });
    l.content!.exercise = filler(50);
    expect(lessonWordCount(l)).toBe(200);
  });

  it('treats lessons under the threshold as thin', () => {
    expect(isLessonIndexable(lesson({ words: MIN_INDEXABLE_LESSON_WORDS - 1 }))).toBe(false);
  });

  it('indexes lessons at or above the threshold', () => {
    expect(isLessonIndexable(lesson({ words: MIN_INDEXABLE_LESSON_WORDS }))).toBe(true);
  });

  it('never indexes coming-soon lessons', () => {
    expect(isLessonIndexable(lesson({ words: 2000, status: 'coming-soon' }))).toBe(false);
  });
});
