import { describe, it, expect } from 'vitest';
import {
  LESSONS,
  PHASES,
  TOTAL_XP,
  LEVELS,
  levelForXp,
  getLessonBySlug,
  getPhaseLessons,
  orderedLessons,
  nextLesson,
  previousLesson,
  lessonMetaDescription,
  lessonKeywords,
} from '@/data/academy';

describe('academy lesson data', () => {
  it('has 46 lessons numbered 1..46 with no gaps or duplicates', () => {
    const orders = LESSONS.map((l) => l.order).sort((a, b) => a - b);
    expect(orders).toEqual(Array.from({ length: 46 }, (_, i) => i + 1));
  });

  it('uses unique slugs across every lesson — regression guard for the "Project:" title collision', () => {
    const slugs = LESSONS.map((l) => l.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('uses unique ids across every lesson', () => {
    const ids = LESSONS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every lesson a non-empty, URL-safe slug', () => {
    for (const l of LESSONS) {
      expect(l.slug.length).toBeGreaterThan(0);
      expect(l.slug).toMatch(/^[a-z0-9-]+$/);
      expect(l.slug.startsWith('-')).toBe(false);
      expect(l.slug.endsWith('-')).toBe(false);
    }
  });

  it('assigns every lesson to a real phase', () => {
    const phaseIds = new Set(PHASES.map((p) => p.id));
    for (const l of LESSONS) {
      expect(phaseIds.has(l.phaseId)).toBe(true);
    }
  });

  it('gives every ready lesson well-formed content', () => {
    for (const l of LESSONS.filter((l) => l.status === 'ready')) {
      expect(l.content, `lesson ${l.order} is ready but has no content`).toBeDefined();
      expect(l.content!.blocks.length).toBeGreaterThan(0);
      expect(l.content!.exercise.length).toBeGreaterThan(0);
      expect(l.content!.quiz.length).toBeGreaterThan(0);
      for (const q of l.content!.quiz) {
        expect(q.question.length).toBeGreaterThan(0);
        expect(q.options.length).toBe(4);
        expect(new Set(q.options).size).toBe(4); // no duplicate options
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex).toBeLessThan(q.options.length);
      }
    }
  });

  it('never gives a coming-soon lesson content', () => {
    for (const l of LESSONS.filter((l) => l.status === 'coming-soon')) {
      expect(l.content).toBeUndefined();
    }
  });

  it('sums TOTAL_XP from every lesson regardless of status', () => {
    const expected = LESSONS.reduce((sum, l) => sum + l.xp, 0);
    expect(TOTAL_XP).toBe(expected);
  });
});

describe('levelForXp', () => {
  it('starts at the lowest level for 0 XP', () => {
    const { level, index, next } = levelForXp(0);
    expect(level.name).toBe('Apprentice');
    expect(index).toBe(0);
    expect(next?.name).toBe(LEVELS[1].name);
  });

  it('promotes exactly at a level threshold, not one XP early', () => {
    const threshold = LEVELS[1].minXp; // Practitioner
    expect(levelForXp(threshold - 1).level.name).toBe('Apprentice');
    expect(levelForXp(threshold).level.name).toBe('Practitioner');
  });

  it('reaches the max level at TOTAL_XP with no next level', () => {
    const { level, next } = levelForXp(TOTAL_XP);
    expect(level.name).toBe('AI Engineer');
    expect(next).toBeNull();
  });
});

describe('lesson lookup helpers', () => {
  it('getLessonBySlug finds a real lesson and misses an unknown one', () => {
    const first = LESSONS[0];
    expect(getLessonBySlug(first.slug)?.id).toBe(first.id);
    expect(getLessonBySlug('not-a-real-slug')).toBeUndefined();
  });

  it('getPhaseLessons returns only that phase, sorted by order', () => {
    const foundations = getPhaseLessons('foundations');
    expect(foundations.length).toBeGreaterThan(0);
    expect(foundations.every((l) => l.phaseId === 'foundations')).toBe(true);
    const orders = foundations.map((l) => l.order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
  });

  it('orderedLessons returns all 46 lessons sorted by order', () => {
    const ordered = orderedLessons();
    expect(ordered).toHaveLength(46);
    expect(ordered.map((l) => l.order)).toEqual(Array.from({ length: 46 }, (_, i) => i + 1));
  });

  it('nextLesson/previousLesson walk the sequence and stop at the ends', () => {
    expect(previousLesson(1)).toBeUndefined();
    expect(nextLesson(1)?.order).toBe(2);
    expect(nextLesson(46)).toBeUndefined();
    expect(previousLesson(46)?.order).toBe(45);
  });
});

describe('SEO metadata helpers', () => {
  it('lessonMetaDescription pulls the lesson\'s own opening paragraph, not boilerplate', () => {
    const lesson = LESSONS[0];
    const firstParagraph = lesson.content!.blocks.find((b) => b.type === 'p') as { text: string };
    expect(lessonMetaDescription(lesson)).not.toMatch(/^Lesson \d+ of the free/);
    expect(firstParagraph.text.startsWith(lessonMetaDescription(lesson).replace(/…$/, ''))).toBe(true);
  });

  it('lessonMetaDescription returns short text unmodified, with no ellipsis added', () => {
    const lesson = { ...LESSONS[0], content: { ...LESSONS[0].content!, blocks: [{ type: 'p' as const, text: 'A short opening line.' }] } };
    expect(lessonMetaDescription(lesson)).toBe('A short opening line.');
  });

  it('lessonMetaDescription truncates long text at a word boundary with an ellipsis, never mid-word', () => {
    const lesson = { ...LESSONS[0], content: { ...LESSONS[0].content!, blocks: [{ type: 'p' as const, text: 'word '.repeat(60).trim() }] } };
    const desc = lessonMetaDescription(lesson, 50);
    expect(desc.length).toBeLessThanOrEqual(51); // 50 + the ellipsis character
    expect(desc.endsWith('…')).toBe(true);
    expect(desc.slice(0, -1).endsWith(' ')).toBe(false); // trimmed cleanly, no dangling space before the ellipsis
  });

  it('lessonMetaDescription falls back to the title when a lesson has no paragraph block', () => {
    const lesson = { ...LESSONS[0], content: { ...LESSONS[0].content!, blocks: [{ type: 'code' as const, code: 'x = 1' }] } };
    expect(lessonMetaDescription(lesson)).toBe(lesson.title);
  });

  it('lessonKeywords includes the lesson title and the phase name, with no empty entries', () => {
    const lesson = LESSONS[0];
    const keywords = lessonKeywords(lesson);
    expect(keywords).toContain(lesson.title);
    expect(keywords.every((k) => k.length > 0)).toBe(true);
    expect(new Set(keywords).size).toBe(keywords.length); // no duplicates
  });

  it('every ready lesson produces a non-empty, search-snippet-length meta description', () => {
    for (const l of LESSONS.filter((l) => l.status === 'ready')) {
      const desc = lessonMetaDescription(l);
      expect(desc.length).toBeGreaterThan(0);
      expect(desc.length).toBeLessThanOrEqual(156); // 155 + possible ellipsis
    }
  });
});
