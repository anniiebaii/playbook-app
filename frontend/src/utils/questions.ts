import { HOT_QUESTION_UPVOTE_THRESHOLD } from '../constants';
import type { QuestionReaction, QuestionWithRelations } from '../types/models';

export type ViewMode = 'trending' | 'recent' | 'unanswered';

export const VIEW_MODE_TITLES: Record<ViewMode, string> = {
  trending: 'Trending Questions',
  recent: 'Recent Questions',
  unanswered: 'Unanswered Questions',
};

export interface QuestionFilters {
  searchQuery: string;
  /** Empty string means "all topics". */
  tag: string;
}

const newestFirst = (a: QuestionWithRelations, b: QuestionWithRelations): number =>
  Date.parse(b.createdAt) - Date.parse(a.createdAt);

const COMPARATORS: Record<
  ViewMode,
  (a: QuestionWithRelations, b: QuestionWithRelations) => number
> = {
  recent: newestFirst,
  unanswered: (a, b) =>
    Number(b.status === 'PENDING') - Number(a.status === 'PENDING') || newestFirst(a, b),
  trending: (a, b) => b.upvotes.length - a.upvotes.length || newestFirst(a, b),
};

/** Returns a new array sorted for the given view. Does not mutate the input. */
export function sortQuestions(
  questions: readonly QuestionWithRelations[],
  viewMode: ViewMode,
): QuestionWithRelations[] {
  return [...questions].sort(COMPARATORS[viewMode]);
}

/** Case-insensitive match on question text or author name, plus an optional tag. */
export function filterQuestions(
  questions: readonly QuestionWithRelations[],
  { searchQuery, tag }: QuestionFilters,
): QuestionWithRelations[] {
  const query = searchQuery.trim().toLowerCase();
  return questions.filter(
    (question) =>
      (!tag || (question.tags?.includes(tag) ?? false)) &&
      (!query ||
        question.text.toLowerCase().includes(query) ||
        question.author.name.toLowerCase().includes(query)),
  );
}

export function hasReacted(reactions: readonly QuestionReaction[], userId?: string): boolean {
  return userId !== undefined && reactions.some((reaction) => reaction.userId === userId);
}

export function isHotQuestion(question: QuestionWithRelations): boolean {
  return question.upvotes.length > HOT_QUESTION_UPVOTE_THRESHOLD;
}

export function countAnswers(questions: readonly QuestionWithRelations[]): number {
  return questions.reduce((total, question) => total + question.answers.length, 0);
}
