import { supabase } from './supabase'
import type { User, Answer, AnswerWithRelations, CreateUpvoteInput, QuestionStatus, QuestionUpvote} from './supabase'


export class UpvoteService {  

    static async delete(upvoteId: number): Promise<void> {
        console.log('Deleting upvote with ID:', upvoteId);
        const { error } = await supabase
            .from('question_upvotes')
            .delete()
            .eq('id', upvoteId) 
        if (error) throw error
    }

    static async deleteByQuestionAndUser(questionId: number, userId: number): Promise<void> {
        console.log('Deleting upvote for question ID:', questionId, 'and user ID:', userId);
        const { error } = await supabase
            .from('question_upvotes')
            .delete()
            .eq('questionId', questionId)
            .eq('userId', userId)
        if (error) throw error
    }

    static async create(upvoteData: CreateUpvoteInput): Promise<QuestionUpvote> {
        console.log('Creating question with data:', upvoteData);
        const { data, error } = await supabase
            .from('question_upvotes')
            .insert([{
            questionId: upvoteData.questionId,
            userId: upvoteData.userId,
            }])
            .select(`
            *
            `)
            .single()

        if (error) throw error
        return data as QuestionUpvote
    }

    static async getByQuestion(questionId: number): Promise<QuestionUpvote[]> {
        const { data, error } = await supabase
            .from('question_upvotes')
            .select('*')
            .eq('questionId', questionId)

        if (error) throw error
        return data as QuestionUpvote[]
    }

    static async getByUser(userId: number): Promise<QuestionUpvote[]> {
        const { data, error } = await supabase
            .from('question_upvotes')
            .select('*')
            .eq('userId', userId)

        if (error) throw error
        return data as QuestionUpvote[]
    }
}