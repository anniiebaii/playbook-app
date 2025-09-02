import { supabase } from './supabase'
import type { CreateBookmarkInput, QuestionBookmark} from './supabase'


export class BookmarkService {  

    static async delete(bookmarkId: number): Promise<void> {
        console.log('Deleting bookmark with ID:', bookmarkId);
        const { error } = await supabase
            .from('question_bookmarks')
            .delete()
            .eq('id', bookmarkId) 
        if (error) throw error
    }

    static async deleteByQuestionAndUser(questionId: number, userId: string): Promise<void> {
        console.log('Deleting bookmark for question ID:', questionId, 'and user ID:', userId);
        const { error } = await supabase
            .from('question_bookmarks')
            .delete()
            .eq('questionId', questionId)
            .eq('userId', userId)
        if (error) throw error
    }


    static async create(bookmarkData: CreateBookmarkInput): Promise<QuestionBookmark> {
        console.log('Creating question with data:', bookmarkData);
        const { data, error } = await supabase
            .from('question_bookmarks')
            .insert([{
            questionId: bookmarkData.questionId,
            userId: bookmarkData.userId,
            }])
            .select(`
            *
            `)
            .single()

        if (error) throw error
        return data as QuestionBookmark
    }

    static async getByQuestion(questionId: number): Promise<QuestionBookmark[]> {
        const { data, error } = await supabase
            .from('question_bookmarks')
            .select('*')
            .eq('questionId', questionId)

        if (error) throw error
        return data as QuestionBookmark[]
    }

    static async getByUser(userId: string): Promise<QuestionBookmark[]> {
        const { data, error } = await supabase
            .from('question_bookmarks')
            .select('*')
            .eq('userId', userId)

        if (error) throw error
        return data as QuestionBookmark[]
    }
}