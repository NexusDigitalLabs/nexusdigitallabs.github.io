'use client';

import type { QuizQuestion } from '@/data/academy';

/** answers[questionIndex] = the option index the learner picked, once answered. */
type Answers = Record<number, number>;

type OptionState = 'unanswered' | 'correct' | 'incorrect-picked' | 'incorrect-other' | 'correct-unpicked';

function OptionRow({ label, state }: { label: string; state: OptionState }) {
  const styles: Record<OptionState, string> = {
    unanswered:
      'border-[var(--ndl-border)] hover:border-[var(--ndl-accent)] cursor-pointer bg-transparent',
    correct: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-400 cursor-default',
    'correct-unpicked': 'border-emerald-400/40 bg-emerald-500/10 text-emerald-400 cursor-default',
    'incorrect-picked': 'border-red-400/40 bg-red-500/10 text-red-400 cursor-default',
    'incorrect-other': 'border-[var(--ndl-border)] opacity-50 cursor-default',
  };
  const icon = state === 'correct' || state === 'correct-unpicked' ? '✓' : state === 'incorrect-picked' ? '✗' : null;
  return (
    <div
      className={`flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm transition-colors ${styles[state]}`}
      style={state === 'unanswered' ? { color: 'var(--ndl-text-secondary)' } : undefined}
    >
      {icon && <span className="font-bold shrink-0">{icon}</span>}
      <span>{label}</span>
    </div>
  );
}

function QuizItem({ q, index, answered, onAnswer }: { q: QuizQuestion; index: number; answered: number | undefined; onAnswer: (optionIndex: number) => void }) {
  const isAnswered = answered !== undefined;
  const wasCorrect = answered === q.correctIndex;

  return (
    <div className={index > 0 ? 'mt-6 pt-6 border-t' : ''} style={index > 0 ? { borderColor: 'var(--ndl-border)' } : undefined}>
      <p className="text-sm font-medium mb-3" style={{ color: 'var(--ndl-text)' }}>
        {index + 1}. {q.question}
      </p>
      <div className="space-y-2">
        {q.options.map((opt, i) => {
          let state: OptionState = 'unanswered';
          if (isAnswered) {
            if (i === q.correctIndex) state = i === answered ? 'correct' : 'correct-unpicked';
            else if (i === answered) state = 'incorrect-picked';
            else state = 'incorrect-other';
          }
          return isAnswered ? (
            <OptionRow key={i} label={opt} state={state} />
          ) : (
            <button
              key={i}
              type="button"
              onClick={() => onAnswer(i)}
              className="w-full text-left flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm transition-colors border-[var(--ndl-border)] hover:border-[var(--ndl-accent)] cursor-pointer bg-transparent"
              style={{ color: 'var(--ndl-text-secondary)' }}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {isAnswered && (
        <p className={`text-xs font-medium mt-2.5 ${wasCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
          {wasCorrect ? '✓ Correct.' : '✗ Not quite — the correct answer is highlighted above.'}
        </p>
      )}
    </div>
  );
}

/**
 * Controlled: `answers` is owned by useAcademyProgress (persisted per lesson
 * in localStorage), not local component state — so answers survive
 * navigating away and back to this lesson instead of resetting.
 */
export default function CheckYourselfQuiz({
  quiz,
  answers,
  onAnswer,
  onReset,
}: {
  quiz: QuizQuestion[];
  answers: Answers;
  onAnswer: (questionIndex: number, optionIndex: number) => void;
  onReset: () => void;
}) {
  const answeredCount = Object.keys(answers).length;
  const correctCount = Object.entries(answers).filter(([qi, oi]) => quiz[Number(qi)].correctIndex === oi).length;

  return (
    <section
      className="rounded-xl border p-5 mb-10"
      style={{ borderColor: 'var(--ndl-border)', background: 'var(--ndl-card-bg)' }}
    >
      <div className="flex items-center justify-between mb-1">
        <p className="text-[0.65rem] font-semibold tracking-widest uppercase" style={{ color: 'var(--ndl-accent)' }}>
          Check yourself
        </p>
        {answeredCount > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs" style={{ color: 'var(--ndl-faint)' }}>
              {correctCount}/{quiz.length} correct
            </span>
            {answeredCount === quiz.length && (
              <button
                type="button"
                onClick={onReset}
                className="text-xs bg-transparent border-0 cursor-pointer underline underline-offset-2"
                style={{ color: 'var(--ndl-faint)' }}
              >
                Try again
              </button>
            )}
          </div>
        )}
      </div>
      {quiz.map((q, i) => (
        <QuizItem key={i} q={q} index={i} answered={answers[i]} onAnswer={(optionIndex) => onAnswer(i, optionIndex)} />
      ))}
    </section>
  );
}
