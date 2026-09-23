'use client';

import Link from 'next/link';
import { PHASES, TOTAL_XP, getPhaseLessons, type Lesson, type PhaseColor } from '@/data/academy';
import { useAcademyProgress } from '@/hooks/useAcademyProgress';
import AdSlot from '@/components/AdSlot';

const COLOR_CLASSES: Record<PhaseColor, { text: string; bg: string; border: string; bar: string }> = {
  blue:    { text: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/25',    bar: 'bg-blue-500' },
  violet:  { text: 'text-violet-400',  bg: 'bg-violet-500/10',  border: 'border-violet-500/25',  bar: 'bg-violet-500' },
  emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-400/25', bar: 'bg-emerald-500' },
  amber:   { text: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-400/25',   bar: 'bg-amber-500' },
};

type ProgressReader = {
  loaded: boolean;
  isComplete: (lessonId: string) => boolean;
  isUnlocked: (order: number) => boolean;
};

/**
 * Takes progress as props rather than calling useAcademyProgress() itself —
 * this component is rendered 46x on the lobby page, and each hook call would
 * be its own isolated React state with no shared source of truth. Reset
 * Progress (owned by a single hook call in AcademyLobbyClient) would then
 * update the header stats but leave every card's own stale state untouched
 * until a full page reload. One shared reader, passed down, fixes that.
 */
function LessonCard({
  lesson,
  colors,
  progress,
}: {
  lesson: Lesson;
  colors: (typeof COLOR_CLASSES)[PhaseColor];
  progress: ProgressReader;
}) {
  const { isComplete, isUnlocked, loaded } = progress;

  if (lesson.status === 'coming-soon') {
    return (
      <div
        className="rounded-xl border border-dashed p-4 opacity-60"
        style={{ borderColor: 'var(--ndl-border-soft)' }}
      >
        <p className="text-xs font-mono mb-1" style={{ color: 'var(--ndl-faint)' }}>
          Lesson {lesson.order}
        </p>
        <p className="text-sm" style={{ color: 'var(--ndl-muted)' }}>
          {lesson.title}
        </p>
        <p className="text-[0.65rem] font-semibold tracking-widest uppercase mt-2" style={{ color: 'var(--ndl-faint)' }}>
          Coming soon
        </p>
      </div>
    );
  }

  const done = loaded && isComplete(lesson.id);
  const unlocked = loaded && isUnlocked(lesson.order);

  if (!unlocked) {
    return (
      <div
        className="rounded-xl border p-4 opacity-40"
        style={{ borderColor: 'var(--ndl-border)', background: 'var(--ndl-card-bg)' }}
      >
        <p className="text-xs font-mono mb-1" style={{ color: 'var(--ndl-faint)' }}>
          Lesson {lesson.order}
        </p>
        <p className="text-sm" style={{ color: 'var(--ndl-text-secondary)' }}>
          {lesson.title}
        </p>
        <p className="text-[0.65rem] font-semibold tracking-widest uppercase mt-2" style={{ color: 'var(--ndl-faint)' }}>
          🔒 Locked — finish the previous lesson
        </p>
      </div>
    );
  }

  return (
    <Link
      href={`/academy/${lesson.slug}/`}
      className={`block rounded-xl border p-4 no-underline transition-colors hover:border-opacity-60 ${colors.border}`}
      style={{ background: 'var(--ndl-card-bg)' }}
    >
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-mono" style={{ color: 'var(--ndl-faint)' }}>
          Lesson {lesson.order}
        </p>
        <span className={`text-[0.65rem] font-semibold px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
          {lesson.xp} XP
        </span>
      </div>
      <p className="text-sm font-medium" style={{ color: 'var(--ndl-text)' }}>
        {lesson.title}
      </p>
      <p className="text-[0.65rem] font-semibold tracking-widest uppercase mt-2" style={{ color: done ? undefined : 'var(--ndl-accent)' }}>
        {done ? <span className={colors.text}>✓ Completed</span> : 'Start lesson →'}
      </p>
    </Link>
  );
}

export default function AcademyLobbyClient() {
  const { loaded, xp, level, nextLevel, completedReadyCount, totalReadyCount, resetProgress, isComplete, isUnlocked } =
    useAcademyProgress();
  const progress: ProgressReader = { loaded, isComplete, isUnlocked };
  const progressPct = TOTAL_XP > 0 ? Math.min(100, Math.round((xp / TOTAL_XP) * 100)) : 0;

  return (
    <div className="max-w-5xl mx-auto px-6 sm:px-10 py-14 sm:py-16">
      <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--ndl-accent)' }}>
        AI Engineer Academy
      </p>
      <h1 className="text-3xl sm:text-4xl font-light tracking-tight mb-3" style={{ color: 'var(--ndl-text)' }}>
        Become an AI engineer, one lesson at a time
      </h1>
      <p className="text-sm font-light leading-relaxed max-w-2xl mb-10" style={{ color: 'var(--ndl-muted)' }}>
        A free, self-paced course from Python foundations to production AI systems — RAG, agents, evals, and
        deployment. Lessons unlock as you finish the one before, and new lessons ship over time as they&apos;re written.
        No account, no payment, ever — matches the studio&apos;s free-forever policy.
      </p>

      {/* Progress / gamification header */}
      <div
        className="rounded-2xl border p-5 sm:p-6 mb-12 flex flex-col sm:flex-row sm:items-center gap-5"
        style={{ borderColor: 'var(--ndl-border)', background: 'var(--ndl-surface-2)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 ndl-on-accent"
            style={{ background: 'linear-gradient(135deg,#2563eb,#6366f1)', boxShadow: '0 4px 14px rgba(37,99,235,0.28)' }}
          >
            {level.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--ndl-text)' }}>
              {level.name}
            </p>
            <p className="text-xs" style={{ color: 'var(--ndl-faint)' }}>
              {loaded ? `${xp} XP` : '—'}
              {nextLevel ? ` · ${nextLevel.minXp - xp} XP to ${nextLevel.name}` : ' · Max level'}
            </p>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[0.65rem] font-semibold tracking-widest uppercase" style={{ color: 'var(--ndl-faint)' }}>
              Course progress
            </span>
            <span className="text-xs" style={{ color: 'var(--ndl-muted)' }}>
              {loaded ? `${completedReadyCount}/${totalReadyCount} lessons available now` : '—'}
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--ndl-border)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg,#2563eb,#6366f1)' }}
            />
          </div>
        </div>

        {loaded && xp > 0 && (
          <button
            type="button"
            onClick={() => {
              if (confirm('Reset your Academy progress? This clears completed lessons on this device.')) {
                resetProgress();
              }
            }}
            className="text-xs whitespace-nowrap bg-transparent border-0 cursor-pointer underline underline-offset-2 self-start sm:self-center"
            style={{ color: 'var(--ndl-faint)' }}
          >
            Reset progress
          </button>
        )}
      </div>

      <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_ACADEMY_LOBBY} />

      {/* Phases */}
      <div className="space-y-12">
        {PHASES.map((phase) => {
          const colors = COLOR_CLASSES[phase.color];
          const lessons = getPhaseLessons(phase.id);
          return (
            <section key={phase.id}>
              <div className="flex items-center gap-3 mb-2">
                <span className={`w-1.5 h-1.5 rounded-full ${colors.bar}`} />
                <h2 className="text-lg font-medium" style={{ color: 'var(--ndl-text)' }}>
                  {phase.title}
                </h2>
              </div>
              <p className="text-sm font-light mb-5 max-w-2xl" style={{ color: 'var(--ndl-muted)' }}>
                {phase.description}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {lessons.map((lesson) => (
                  <LessonCard key={lesson.id} lesson={lesson} colors={colors} progress={progress} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <p className="text-xs font-light leading-relaxed mt-12 pt-8 border-t" style={{ color: 'var(--ndl-faint)', borderColor: 'var(--ndl-border)' }}>
        Progress is stored locally in this browser only — clearing site data resets it. There is no login, no
        payment, and no tier beyond what&apos;s unlocked by finishing the lesson before it.
      </p>
    </div>
  );
}
