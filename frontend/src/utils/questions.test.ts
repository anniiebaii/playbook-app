import { describe, expect, it } from 'vitest';

import { makeQuestion, makeReaction, makeUserSummary } from '../test/fixtures';
import {
  countAnswers,
  describeDeletion,
  filterQuestions,
  hasReacted,
  isHotQuestion,
  sortQuestions,
} from './questions';

const ids = (questions: { id: number }[]) => questions.map((q) => q.id);

describe('sortQuestions', () => {
  const older = makeQuestion({
    id: 1,
    createdAt: '2025-01-01T00:00:00Z',
    upvotes: [makeReaction()],
  });
  const newer = makeQuestion({ id: 2, createdAt: '2025-02-01T00:00:00Z', status: 'ANSWERED' });
  const newest = makeQuestion({ id: 3, createdAt: '2025-03-01T00:00:00Z' });
  const questions = [older, newer, newest];

  it('orders "recent" newest first', () => {
    expect(ids(sortQuestions(questions, 'recent'))).toEqual([3, 2, 1]);
  });

  it('orders "trending" by upvotes, then recency', () => {
    expect(ids(sortQuestions(questions, 'trending'))).toEqual([1, 3, 2]);
  });

  it('puts pending questions first in "unanswered"', () => {
    expect(ids(sortQuestions(questions, 'unanswered'))).toEqual([3, 1, 2]);
  });

  it('does not mutate its input', () => {
    sortQuestions(questions, 'recent');
    expect(ids(questions)).toEqual([1, 2, 3]);
  });
});

describe('filterQuestions', () => {
  const questions = [
    makeQuestion({ id: 1, text: 'Cold calling scripts', tags: ['Sales'] }),
    makeQuestion({
      id: 2,
      text: 'Onboarding new hires',
      tags: ['Recruiting'],
      author: makeUserSummary({ name: 'Casey Calloway' }),
    }),
  ];

  it('matches question text and author name case-insensitively', () => {
    expect(ids(filterQuestions(questions, { searchQuery: 'CALL', tag: '' }))).toEqual([1, 2]);
  });

  it('filters by tag', () => {
    expect(ids(filterQuestions(questions, { searchQuery: '', tag: 'Recruiting' }))).toEqual([2]);
  });

  it('combines search and tag filters', () => {
    expect(filterQuestions(questions, { searchQuery: 'scripts', tag: 'Recruiting' })).toEqual([]);
  });
});

describe('hasReacted', () => {
  const reactions = [makeReaction({ userId: 'user-1' })];

  it('is true only for users who reacted', () => {
    expect(hasReacted(reactions, 'user-1')).toBe(true);
    expect(hasReacted(reactions, 'user-2')).toBe(false);
  });

  it('is false for guests', () => {
    expect(hasReacted(reactions, undefined)).toBe(false);
  });
});

describe('isHotQuestion', () => {
  it('requires more than the threshold number of upvotes', () => {
    const upvotes = (count: number) =>
      Array.from({ length: count }, (_, i) => makeReaction({ id: i }));
    expect(isHotQuestion(makeQuestion({ upvotes: upvotes(30) }))).toBe(false);
    expect(isHotQuestion(makeQuestion({ upvotes: upvotes(31) }))).toBe(true);
  });
});

describe('countAnswers', () => {
  it('sums answers across questions', () => {
    const answer = {
      id: 1,
      type: 'TEXT' as const,
      content: 'Answer',
      authorId: 'user-1',
      questionId: 1,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      author: makeUserSummary(),
    };
    expect(countAnswers([makeQuestion({ answers: [answer, answer] }), makeQuestion()])).toBe(2);
  });
});

describe('filterQuestions with missing tags', () => {
  it('treats a null tag list as having no tags', () => {
    const untagged = makeQuestion({ id: 9, tags: null });
    expect(filterQuestions([untagged], { searchQuery: '', tag: 'Sales' })).toEqual([]);
    expect(ids(filterQuestions([untagged], { searchQuery: '', tag: '' }))).toEqual([9]);
  });
});

describe('describeDeletion', () => {
  it('lists what else is removed with the question', () => {
    const question = makeQuestion({ upvotes: [makeReaction()], bookmarks: [] });
    expect(describeDeletion(question)).toBe(
      "This permanently deletes the question along with its 0 answers, 1 upvote, 0 bookmarks. This can't be undone.",
    );
  });
});
