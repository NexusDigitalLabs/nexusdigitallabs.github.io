import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PromptArchitectClient from '@/components/tools/PromptArchitectClient';
import {
  SAMPLE_PROMPT,
  removeExtraWhitespace,
  flattenToSingleLine,
  computeStats,
} from '@/lib/prompt-architect';

describe('prompt-architect transforms', () => {
  it('removeExtraWhitespace collapses blank lines and multi-spaces without destroying words', () => {
    const src = 'Hello    world\n\n\n\nNext';
    expect(removeExtraWhitespace(src)).toBe('Hello world\n\nNext');
  });

  it('flattenToSingleLine removes newlines', () => {
    expect(flattenToSingleLine('a\nb\nc')).toBe('a b c');
  });

  it('sample prompt saves tokens after whitespace removal', () => {
    const before = computeStats(SAMPLE_PROMPT).tokens;
    const after = computeStats(removeExtraWhitespace(SAMPLE_PROMPT)).tokens;
    expect(after).toBeLessThan(before);
  });
});

describe('PromptArchitectClient — input isolation', () => {
  it('does not change Input when Remove Extra Whitespace is clicked', () => {
    render(<PromptArchitectClient />);
    fireEvent.click(screen.getByRole('button', { name: /load sample/i }));
    const textarea = screen.getByLabelText(/input prompt/i) as HTMLTextAreaElement;
    const original = textarea.value;
    expect(original.length).toBeGreaterThan(50);

    fireEvent.click(screen.getByRole('button', { name: /remove extra whitespace/i }));

    expect(textarea.value).toBe(original);
    const output = screen.getByRole('region', { name: /optimized output/i });
    expect(output.textContent).not.toBe(original);
    expect(output.textContent?.length).toBeGreaterThan(10);
  });

  it('only Use Output as Input copies into the left panel', () => {
    render(<PromptArchitectClient />);
    fireEvent.click(screen.getByRole('button', { name: /load sample/i }));
    const textarea = screen.getByLabelText(/input prompt/i) as HTMLTextAreaElement;
    const original = textarea.value;

    fireEvent.click(screen.getByRole('button', { name: /flatten to single line/i }));
    const flattened = screen.getByRole('region', { name: /optimized output/i }).textContent ?? '';
    expect(textarea.value).toBe(original);

    fireEvent.click(screen.getByRole('button', { name: /use output as input/i }));
    expect(textarea.value).toBe(flattened);
    expect(screen.getByRole('region', { name: /optimized output/i }).textContent).toMatch(
      /appear here after applying/i
    );
  });
});
