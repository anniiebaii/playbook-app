import { supabase } from './supabase'
import type { UserWithRelations, Answer, AnswerWithRelations, AnswerData, QuestionStatus} from './supabase'


export class UserService {
  
  static async getUserWithRelations(userId: number): Promise<UserWithRelations | null> {
    try {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select(`
          *,
          bookmarks:question_bookmarks!question_bookmarks_userId_fkey(*),
          upvotes:question_upvotes!question_upvotes_userId_fkey(*)
        `)
        .eq('id', userId)
        .single()

      if (userError) {
        console.error('Error fetching user:', userError)
        return null
      }

      if (!user) return null

      // Transform the data to match QuestionWithRelations interface
      const userWithRelations: UserWithRelations = {
        ...user,
        bookmarks: user.bookmarks || [],
        upvotes: user.upvotes || []
      }

      console.log('Fetched user with relations:', userWithRelations)

      return userWithRelations

    } catch (error) {
      console.error('Error in getUserWithRelations:', error)
      return null
    }
  }
}