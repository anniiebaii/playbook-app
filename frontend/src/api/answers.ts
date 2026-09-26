import { supabase } from '../lib/supabaseClient';
import type { AnswerWithAuthor, NewAnswerInput } from '../types/models';
import { USER_SUMMARY_COLUMNS } from './users';

export async function createAnswer(input: NewAnswerInput): Promise<AnswerWithAuthor> {
  const { data, error } = await supabase
    .from('answers')
    .insert({
      questionId: input.questionId,
      authorId: input.authorId,
      content: input.content,
      type: input.type,
    })
    .select(`*, author:users!answers_authorId_fkey(${USER_SUMMARY_COLUMNS})` as const)
    .single();
  if (error) throw error;
  return data;
}
