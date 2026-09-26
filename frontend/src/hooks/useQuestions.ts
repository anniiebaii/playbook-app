import { useCallback, useRef } from 'react';

import { createAnswer } from '../api/answers';
import {
  createQuestion as insertQuestion,
  fetchQuestions,
  updateQuestionStatus,
} from '../api/questions';
import { addReaction, removeReaction, type ReactionKind } from '../api/reactions';
import type {
  NewAnswerInput,
  NewQuestionInput,
  QuestionReaction,
  QuestionWithRelations,
} from '../types/models';
import { hasReacted } from '../utils/questions';
import { useAsyncData } from './useAsyncData';

const NO_QUESTIONS: QuestionWithRelations[] = [];

const REACTION_FIELDS = {
  upvote: 'upvotes',
  bookmark: 'bookmarks',
} as const satisfies Record<ReactionKind, keyof QuestionWithRelations>;

/**
 * Loads the question feed and exposes mutations that persist to the database and then
 * update local state, so the UI never shows data the server rejected.
 */
export function useQuestions() {
  const { data, error, isLoading, mutate, reload } = useAsyncData(fetchQuestions);
  const pendingReactions = useRef(new Set<string>());

  const updateQuestion = useCallback(
    (questionId: number, update: (question: QuestionWithRelations) => QuestionWithRelations) => {
      mutate((questions) => questions.map((q) => (q.id === questionId ? update(q) : q)));
    },
    [mutate],
  );

  const createQuestion = useCallback(
    async (input: NewQuestionInput) => {
      const question = await insertQuestion(input);
      mutate((questions) => [question, ...questions]);
      return question;
    },
    [mutate],
  );

  const addAnswer = useCallback(
    async (input: NewAnswerInput) => {
      const answer = await createAnswer(input);
      updateQuestion(input.questionId, (q) => ({ ...q, answers: [...q.answers, answer] }));

      await updateQuestionStatus(input.questionId, 'ANSWERED');
      updateQuestion(input.questionId, (q) => ({ ...q, status: 'ANSWERED' }));
    },
    [updateQuestion],
  );

  const toggleReaction = useCallback(
    async (kind: ReactionKind, question: QuestionWithRelations, userId: string) => {
      // Ignore repeat clicks while a toggle for the same question is still in flight.
      const key = `${kind}:${String(question.id)}`;
      if (pendingReactions.current.has(key)) return;
      pendingReactions.current.add(key);

      const field = REACTION_FIELDS[kind];
      const setReactions = (update: (reactions: QuestionReaction[]) => QuestionReaction[]) => {
        updateQuestion(question.id, (q) => ({ ...q, [field]: update(q[field]) }));
      };

      try {
        if (hasReacted(question[field], userId)) {
          await removeReaction(kind, question.id, userId);
          setReactions((reactions) => reactions.filter((r) => r.userId !== userId));
        } else {
          const reaction = await addReaction(kind, question.id, userId);
          setReactions((reactions) => [...reactions, reaction]);
        }
      } finally {
        pendingReactions.current.delete(key);
      }
    },
    [updateQuestion],
  );

  const toggleUpvote = useCallback(
    (question: QuestionWithRelations, userId: string) => toggleReaction('upvote', question, userId),
    [toggleReaction],
  );

  const toggleBookmark = useCallback(
    (question: QuestionWithRelations, userId: string) =>
      toggleReaction('bookmark', question, userId),
    [toggleReaction],
  );

  return {
    questions: data ?? NO_QUESTIONS,
    isLoading,
    error,
    createQuestion,
    addAnswer,
    toggleUpvote,
    toggleBookmark,
    /** Refetches the feed, e.g. after an admin deletes a user and their content. */
    reload,
  };
}
