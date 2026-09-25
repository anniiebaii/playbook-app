import { describe, expect, it } from 'vitest';

import { formatRelativeTime, getInitials, pluralize } from './format';

describe('formatRelativeTime', () => {
  const now = new Date('2025-06-15T12:00:00Z');
  const ago = (ms: number) => new Date(now.getTime() - ms).toISOString();

  it.each([
    [30_000, 'just now'],
    [5 * 60_000, '5m ago'],
    [3 * 3_600_000, '3h ago'],
    [2 * 86_400_000, '2d ago'],
  ])('formats %d ms ago as "%s"', (elapsed, expected) => {
    expect(formatRelativeTime(ago(elapsed), now)).toBe(expected);
  });

  it('falls back to a calendar date after a week', () => {
    expect(formatRelativeTime(ago(10 * 86_400_000), now)).not.toMatch(/ago$/);
  });
});

describe('getInitials', () => {
  it('uses the first letters of the first two words', () => {
    expect(getInitials('stacey  marie santos')).toBe('SM');
  });

  it('handles single-word names', () => {
    expect(getInitials('Prince')).toBe('P');
  });
});

describe('pluralize', () => {
  it('uses the singular form only for exactly one', () => {
    expect(pluralize(1, 'answer')).toBe('1 answer');
    expect(pluralize(0, 'answer')).toBe('0 answers');
    expect(pluralize(2, 'reply', 'replies')).toBe('2 replies');
  });
});
