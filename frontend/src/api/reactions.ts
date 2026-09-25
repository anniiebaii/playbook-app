import { supabase } from '../lib/supabaseClient';
import type { QuestionReaction } from '../types/models';

/** Upvotes and bookmarks are stored in separate tables with identical shapes. */
export type ReactionKind = 'upvote' | 'bookmark';

const REACTION_TABLES = {
  upvote: 'question_upvotes',
  bookmark: 'question_bookmarks',
} as const satisfies Record<ReactionKind, string>;

export async function addReaction(
  kind: ReactionKind,
  questionId: number,
  userId: string,
): Promise<QuestionReaction> {
  const { data, error } = await supabase
    .from(REACTION_TABLES[kind])
    .insert({ questionId, userId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function removeReaction(
  kind: ReactionKind,
  questionId: number,
  userId: string,
): Promise<void> {
  const { error } = await supabase
    .from(REACTION_TABLES[kind])
    .delete()
    .eq('questionId', questionId)
    .eq('userId', userId);
  if (error) throw error;
}
