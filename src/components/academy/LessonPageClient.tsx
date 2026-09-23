'use client';

import Link from 'next/link';
import { useState } from 'react';
import { PHASES, nextLesson, previousLesson, type Lesson } from '@/data/academy';
import { useAcademyProgress } from '@/hooks/useAcademyProgress';
import AdSlot from '@/components/AdSlot';
import CheckYourselfQuiz from '@/components/academy/CheckYourselfQuiz';

export default function LessonPageClient({ lesson }: { lesson: Lesson }) {
  const { loaded, isComplete, isUnlocked, markComplete, getQuizAnswers, setQuizAnswer, resetQuizAnswers } =
    useAcademyProgress();
  const [justCompleted, setJustCompleted] = useState(false);
  const phase = PHASES.find((p) => p.id === lesson.phaseId);
  const content = lesson.content;
  const done = loaded && (isComplete(lesson.id) || justCompleted);
  const unlocked = loaded && isUnlocked(lesson.order);
  const next = nextLesson(lesson.order);
  const prev = previousLesson(lesson.order);
  const quizAnswers = getQuizAnswers(lesson.id);
  const quizAllAnswered = loaded && content ? Object.keys(quizAnswers).length === content.quiz.length : false;

  if (!content) return null;

  return (
    <div className="max-w-2xl mx-auto px-6 sm:px-10 py-14 sm:py-16">
      <Link href="/academy/" className="text-xs no-underline" style={{ color: 'var(--ndl-accent)' }}>
        ← Back to Academy
      </Link>

      <p className="text-xs font-semibold tracking-widest uppercase mt-6 mb-3 flex flex-wrap items-center gap-x-2 gap-y-1">
        <span style={{ color: 'var(--ndl-accent)' }}>
          {phase?.title} · Lesson {lesson.order} · {lesson.xp} XP
        </span>
        {done && <span className="text-emerald-400">· ✓ Completed</span>}
      </p>
      <h1 className="text-2xl sm:text-3xl font-light tracking-tight mb-8" style={{ color: 'var(--ndl-text)' }}>
        {lesson.title}
      </h1>

      {loaded && !unlocked && (
        <div
          className="rounded-xl border p-4 mb-8 text-sm"
          style={{ borderColor: 'var(--ndl-border)', background: 'var(--ndl-surface-2)', color: 'var(--ndl-muted)' }}
        >
          You can read ahead, but finish the previous lesson first to keep your XP and unlock streak accurate.
        </div>
      )}

      <div className="space-y-5 mb-10">
        {content.blocks.map((block, i) => {
          if (block.type === 'p') {
            return (
              <p key={i} className="text-sm font-light leading-relaxed" style={{ color: 'var(--ndl-text-secondary)' }}>
                {block.text}
              </p>
            );
          }
          if (block.type === 'list') {
            return (
              <ul key={i} className="list-disc pl-5 space-y-1.5">
                {block.items.map((item, j) => (
                  <li key={j} className="text-sm font-light leading-relaxed" style={{ color: 'var(--ndl-text-secondary)' }}>
                    {item}
                  </li>
                ))}
              </ul>
            );
          }
          return (
            <pre
              key={i}
              className="rounded-lg p-4 overflow-x-auto text-xs leading-relaxed font-mono"
              style={{ background: 'var(--ndl-surface-2)', border: '1px solid var(--ndl-border)', color: 'var(--ndl-text)' }}
            >
              <code>{block.code}</code>
            </pre>
          );
        })}
      </div>

      <section
        className="rounded-xl border p-5 mb-6"
        style={{ borderColor: 'var(--ndl-border)', background: 'var(--ndl-card-bg)' }}
      >
        <p className="text-[0.65rem] font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--ndl-accent)' }}>
          Exercise
        </p>
        <p className="text-sm font-light leading-relaxed" style={{ color: 'var(--ndl-text-secondary)' }}>
          {content.exercise}
        </p>
      </section>

      <CheckYourselfQuiz
        quiz={content.quiz}
        answers={quizAnswers}
        onAnswer={(qIndex, oIndex) => setQuizAnswer(lesson.id, qIndex, oIndex)}
        onReset={() => resetQuizAnswers(lesson.id)}
      />

      <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_ACADEMY_LESSON} />

      <div className="flex flex-wrap items-start justify-between gap-4">
        {prev && prev.status === 'ready' ? (
          <div>
            <Link
              href={`/academy/${prev.slug}/`}
              className="inline-block text-sm font-medium px-5 py-2.5 rounded-lg no-underline"
              style={{ color: 'var(--ndl-accent)', background: 'var(--ndl-surface-2)' }}
            >
              ← Previous lesson
            </Link>
            <p className="text-xs mt-1.5 max-w-[240px]" style={{ color: 'var(--ndl-faint)' }}>
              {prev.title}
            </p>
          </div>
        ) : (
          <span />
        )}

        {!done && (
          <div className="text-right">
            <button
              type="button"
              disabled={!quizAllAnswered}
              onClick={() => {
                markComplete(lesson.id);
                setJustCompleted(true);
              }}
              className={`text-sm font-medium px-5 py-2.5 rounded-lg border-0 ndl-on-accent ${
                quizAllAnswered ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'
              }`}
              style={{ background: 'linear-gradient(135deg,#2563eb,#6366f1)' }}
            >
              Mark lesson complete (+{lesson.xp} XP)
            </button>
            {!quizAllAnswered && (
              <p className="text-xs mt-1.5 max-w-[240px]" style={{ color: 'var(--ndl-faint)' }}>
                Answer the check-yourself questions to unlock this
              </p>
            )}
          </div>
        )}
        {done && next && next.status === 'ready' && (
          <div className="text-right">
            <Link
              href={`/academy/${next.slug}/`}
              className="inline-block text-sm font-medium px-5 py-2.5 rounded-lg no-underline ndl-on-accent"
              style={{ background: 'linear-gradient(135deg,#2563eb,#6366f1)' }}
            >
              Next lesson →
            </Link>
            <p className="text-xs mt-1.5 max-w-[240px]" style={{ color: 'var(--ndl-faint)' }}>
              {next.title}
            </p>
          </div>
        )}
        {done && next && next.status === 'coming-soon' && (
          <span className="text-sm" style={{ color: 'var(--ndl-faint)' }}>
            Next lesson is coming soon — check back later.
          </span>
        )}
      </div>
    </div>
  );
}
