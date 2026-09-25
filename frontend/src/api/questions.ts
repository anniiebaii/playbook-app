import { DEFAULT_QUESTION_ROLE } from '../constants';
import { supabase } from '../lib/supabaseClient';
import type { NewQuestionInput, QuestionStatus, QuestionWithRelations } from '../types/models';
import { USER_SUMMARY_COLUMNS } from './users';

/**
 * PostgREST embedded-resource query. `alias:table!fk_name(columns)` joins through a
 * specific foreign key, which is required where `questions` references `users` twice.
 */
const QUESTION_SELECT = `
  *,
  author:users!questions_authorId_fkey(${USER_SUMMARY_COLUMNS}),
  assignedTo:users!questions_assignedToId_fkey(${USER_SUMMARY_COLUMNS}),
  answers(*, author:users!answers_authorId_fkey(${USER_SUMMARY_COLUMNS})),
  upvotes:question_upvotes!question_upvotes_questionId_fkey(*),
  bookmarks:question_bookmarks!question_bookmarks_questionId_fkey(*)
` as const;

/** All questions, newest first, with their answers in chronological order. */
export async function fetchQuestions(): Promise<QuestionWithRelations[]> {
  const { data, error } = await supabase
    .from('questions')
    .select(QUESTION_SELECT)
    .order('createdAt', { ascending: false })
    .order('createdAt', { referencedTable: 'answers', ascending: true });
  if (error) throw error;
  return data;
}

export async function createQuestion(input: NewQuestionInput): Promise<QuestionWithRelations> {
  const { data, error } = await supabase
    .from('questions')
    .insert({
      text: input.title,
      description: input.description || null,
      tags: input.tags,
      authorId: input.authorId,
      assignedToId: input.assignedToId ?? null,
      priority: input.priority ?? 'LOW',
      role: DEFAULT_QUESTION_ROLE,
    })
    .select(QUESTION_SELECT)
    .single();
  if (error) throw error;
  return data;
}

export async function updateQuestionStatus(
  questionId: number,
  status: QuestionStatus,
): Promise<void> {
  const { error } = await supabase.from('questions').update({ status }).eq('id', questionId);
  if (error) throw error;
}
