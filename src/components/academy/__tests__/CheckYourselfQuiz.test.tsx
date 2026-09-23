import { describe, it, expect } from 'vitest';
import { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CheckYourselfQuiz from '../CheckYourselfQuiz';
import type { QuizQuestion } from '@/data/academy';

const QUIZ: QuizQuestion[] = [
  { question: 'First question?', options: ['Wrong A', 'Right A', 'Wrong B', 'Wrong C'], correctIndex: 1 },
  { question: 'Second question?', options: ['Right B', 'Wrong D', 'Wrong E', 'Wrong F'], correctIndex: 0 },
];

/** Mirrors how LessonPageClient wires the controlled quiz to useAcademyProgress. */
function ControlledQuiz({ quiz = QUIZ }: { quiz?: QuizQuestion[] }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  return (
    <CheckYourselfQuiz
      quiz={quiz}
      answers={answers}
      onAnswer={(qi, oi) => setAnswers((prev) => ({ ...prev, [qi]: oi }))}
      onReset={() => setAnswers({})}
    />
  );
}

describe('CheckYourselfQuiz', () => {
  it('renders every question and its options', () => {
    render(<ControlledQuiz />);
    expect(screen.getByText(/First question\?/)).toBeInTheDocument();
    expect(screen.getByText(/Second question\?/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Right A' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Right B' })).toBeInTheDocument();
  });

  it('shows no score before anything is answered', () => {
    render(<ControlledQuiz />);
    expect(screen.queryByText(/correct$/)).not.toBeInTheDocument();
  });

  it('marks a correct pick as correct and updates the score', () => {
    render(<ControlledQuiz />);
    fireEvent.click(screen.getByRole('button', { name: 'Right A' }));

    expect(screen.getByText('✓ Correct.')).toBeInTheDocument();
    expect(screen.getByText('1/2 correct')).toBeInTheDocument();
  });

  it('marks a wrong pick as incorrect and still reveals the correct answer', () => {
    render(<ControlledQuiz />);
    fireEvent.click(screen.getByRole('button', { name: 'Wrong A' }));

    expect(screen.getByText('✗ Not quite — the correct answer is highlighted above.')).toBeInTheDocument();
    expect(screen.getByText('0/2 correct')).toBeInTheDocument();
    // The correct option is now shown (as text, no longer a clickable button — it becomes a styled row).
    expect(screen.getByText('Right A')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Right A' })).not.toBeInTheDocument();
  });

  it('locks a question after answering — the other options stop being clickable', () => {
    render(<ControlledQuiz />);
    fireEvent.click(screen.getByRole('button', { name: 'Right A' }));

    // None of question 1's options are buttons anymore once it's answered.
    expect(screen.queryByRole('button', { name: 'Wrong A' })).not.toBeInTheDocument();
    // Question 2 is untouched and still interactive.
    expect(screen.getByRole('button', { name: 'Right B' })).toBeInTheDocument();
  });

  it('only shows "Try again" once every question has been answered', () => {
    render(<ControlledQuiz />);
    expect(screen.queryByText('Try again')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Right A' }));
    expect(screen.queryByText('Try again')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Right B' }));
    expect(screen.getByText('Try again')).toBeInTheDocument();
    expect(screen.getByText('2/2 correct')).toBeInTheDocument();
  });

  it('"Try again" clears all answers back to the unanswered state', () => {
    render(<ControlledQuiz />);
    fireEvent.click(screen.getByRole('button', { name: 'Right A' }));
    fireEvent.click(screen.getByRole('button', { name: 'Right B' }));

    fireEvent.click(screen.getByText('Try again'));

    expect(screen.getByRole('button', { name: 'Right A' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Right B' })).toBeInTheDocument();
    expect(screen.queryByText('Try again')).not.toBeInTheDocument();
  });

  it('renders already-answered state on mount (persisted answers from a previous visit)', () => {
    function PreAnswered() {
      const [answers, setAnswers] = useState<Record<number, number>>({ 0: 1, 1: 0 });
      return (
        <CheckYourselfQuiz
          quiz={QUIZ}
          answers={answers}
          onAnswer={(qi, oi) => setAnswers((prev) => ({ ...prev, [qi]: oi }))}
          onReset={() => setAnswers({})}
        />
      );
    }
    render(<PreAnswered />);

    expect(screen.getByText('2/2 correct')).toBeInTheDocument();
    expect(screen.getAllByText('✓ Correct.')).toHaveLength(2);
  });
});
