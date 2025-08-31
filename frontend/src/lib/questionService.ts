import { get } from 'http'
import { supabase } from './supabase'
import type { QuestionWithRelations, Question, User, Answer, QuestionUpvote, QuestionBookmark, QuestionData, AnswerWithRelations } from './supabase'

export class QuestionService {

    /* Syntax explanation:
        author:users!questions_authorId_fkey(*) means:
            author: - Name this relationship "author" in the result
            users - Join to the users table
            !questions_authorId_fkey - Use this specific foreign key relationship
            (*) - Get all columns from the users table

        answers(
            *, -- This automatically adds: WHERE answers.questionId = questions.id
            author:users!answers_authorId_fkey(*)
    */

    private static readonly QUESTION_WITH_RELATIONS_QUERY = `
            *,
            author:users!questions_authorId_fkey(*),
            assignedTo:users!questions_assignedToId_fkey(*),
            answers(
            *,
            author:users!answers_authorId_fkey(*)
        ),
            upvotes:question_upvotes!question_upvotes_questionId_fkey(*),
            bookmarks:question_bookmarks!question_bookmarks_questionId_fkey(*)
        `
    
    // Main question query with relations
    private static getQuestionWithRelationsQuery() {
        return supabase
            .from('questions')
            .select(QuestionService.QUESTION_WITH_RELATIONS_QUERY)
    }

  /**
   * Get a single question with all relations and computed fields
   */
  static async getQuestionWithRelations(questionId: number): Promise<QuestionWithRelations | null> {
    try {
      const { data: question, error: questionError } = await QuestionService.getQuestionWithRelationsQuery()
        .eq('id', questionId)
        .single()

      if (questionError) {
        console.error('Error fetching question:', questionError)
        return null
      }

      if (!question) return null

      // Transform the data to match QuestionWithRelations interface
      const questionWithRelations: QuestionWithRelations = {
        ...question,
        author: question.author,
        assignedTo: question.assignedTo || undefined,
        answers: question.answers || [],
        upvotes: question.upvotes || [],
        bookmarks: question.bookmarks || [],
        createdAt: new Date(question.createdAt),

        // Computed fields
        upvoteCount: question.upvotes?.length || 0,
        bookmarkCount: question.bookmarks?.length || 0
      }

      console.log('Fetched question with relations:', questionWithRelations)

      return questionWithRelations

    } catch (error) {
      console.error('Error in getQuestionWithRelations:', error)
      return null
    }
  }

  /**
   * Get multiple questions with relations and computed fields
   */
  static async getQuestionsWithRelations(options?: {
    limit?: number
    offset?: number
    status?: 'PENDING' | 'ANSWERED'
    priority?: 'LOW' | 'MEDIUM' | 'HIGH'
    authorId?: number
    assignedToId?: number
    tags?: string[]
  }): Promise<QuestionWithRelations[]> {
    try {
      let query = QuestionService.getQuestionWithRelationsQuery()
        .order('createdAt', { ascending: false })

      // Apply filters
      if (options?.status) {
        query = query.eq('status', options.status)
      }
      if (options?.priority) {
        query = query.eq('priority', options.priority)
      }
      if (options?.authorId) {
        query = query.eq('authorId', options.authorId)
      }
      if (options?.assignedToId) {
        query = query.eq('assignedToId', options.assignedToId)
      }
      if (options?.tags && options.tags.length > 0) {
        query = query.overlaps('tags', options.tags)
      }

      // Apply pagination
      if (options?.limit) {
        query = query.limit(options.limit)
      }
      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
      }

    // Execute the actual query
      const { data: questions, error } = await query

      if (error) {
        console.error('Error fetching questions:', error)
        return []
      }

      // Transform each question to include computed fields
      const questionsWithRelations: QuestionWithRelations[] = (questions || []).map(question => (
        {
        ...question,
        author: question.author,
        assignedTo: question.assignedTo || undefined,

         // Map over answers to format dates in each answer
        answers: (question.answers || []).map((answer: AnswerWithRelations) => ({
            ...answer,
            // Convert date strings to Date objects
            createdAt: new Date(answer.createdAt),
            updatedAt: new Date(answer.updatedAt),
        })),
        upvotes: question.upvotes || [],
        bookmarks: question.bookmarks || [],

        createdAt: new Date(question.createdAt),
        updatedAt: new Date(question.updatedAt),

        // Computed fields
        upvoteCount: question.upvotes?.length || 0,
        bookmarkCount: question.bookmarks?.length || 0
      }))

     console.log('Fetched questions with relations:', questionsWithRelations)

      return questionsWithRelations

    } catch (error) {
      console.error('Error in getQuestionsWithRelations:', error)
      return []
    }
  }

    static async createQuestion(questionData: QuestionData): Promise<Question> {
        console.log('Creating question with data:', questionData);
        const { data, error } = await supabase
            .from('questions')
            .insert([{
            text: questionData.title,
            description: questionData.description || '',
            tags: questionData.tags || [],
            authorId: questionData.authorId,
            role: "User" // TODO: replace with current user role
            }])
            .select(`
            *,
            author:users!questions_authorId_fkey(id, email, name, isAdmin)
            `)
            .single()

        if (error) throw error
        return data as Question
    }

    static async update(quesionId: number, updates: Partial<Question>): Promise<Question> {
        console.log('Updating question ID:', quesionId, 'with data:', updates);
        const { data, error } = await supabase
            .from('questions')
            .update(updates)
            .eq('id', quesionId)
            .select(`
            *`)
            .single()
        if (error) throw error
        return data as Question
    }

  /**
   * Get questions bookmarked by a specific user
   */
  static async getUserBookmarkedQuestions(userId: number): Promise<QuestionBookmark[]> {
    try {
        // TODO: only get question IDs first, then get questions with relations in local cache
      const { data: bookmarks, error } = await supabase
        .from('question_bookmarks')
        .select(`
          *,
          question:questions(
            *,
            author:users!questions_authorId_fkey(*),
            assignedTo:users!questions_assignedToId_fkey(*),
            answers(*),
            upvotes:question_upvotes(*),
            bookmarks:question_bookmarks(*)
          )
        `)
        .eq('userId', userId)
        .order('createdAt', { ascending: false })

      if (error) {
        console.error('Error fetching bookmarked questions:', error)
        return []
      }

      const questions = bookmarks?.map(bookmark => bookmark.question).filter(Boolean) || []
      
      return questions.map(question => ({
        ...question,
        author: question.author,
        assignedTo: question.assignedTo || undefined,
        answers: question.answers || [],
        upvotes: question.upvotes || [],
        bookmarks: question.bookmarks || [],
        upvoteCount: question.upvotes?.length || 0,
        bookmarkCount: question.bookmarks?.length || 0
      }))

    } catch (error) {
      console.error('Error in getUserBookmarkedQuestions:', error)
      return []
    }
  }

  /**
   * Get questions upvoted by a specific user
   */
  static async getUserUpvotedQuestions(userId: number): Promise<QuestionWithRelations[]> {
    return []
    // try {
    //   const { data: upvotes, error } = await supabase
    //     .from('question_upvotes')
    //     .select(`
    //       question:questions(
    //         *,
    //         author:users!questions_authorId_fkey(*),
    //         assignedTo:users!questions_assignedToId_fkey(*),
    //         answers(*),
    //         upvotes:question_upvotes(*),
    //         bookmarks:question_bookmarks(*)
    //       )
    //     `)
    //     .eq('userId', userId)
    //     .order('createdAt', { ascending: false })

    //   if (error) {
    //     console.error('Error fetching upvoted questions:', error)
    //     return []
    //   }

    //   const questions = upvotes?.map(upvote => upvote.question).filter(Boolean) || []
      
    //   return questions.map(question => ({
    //     ...question,
    //     author: question.author,
    //     assignedTo: question.assignedTo || undefined,
    //     answers: question.answers || [],
    //     upvotes: question.upvotes || [],
    //     bookmarks: question.bookmarks || [],
    //     upvoteCount: question.upvotes?.length || 0,
    //     bookmarkCount: question.bookmarks?.length || 0
    //   }))

    // } catch (error) {
    //   console.error('Error in getUserUpvotedQuestions:', error)
    //   return []
    // }
  }

  /**
   * Check if a user has upvoted a specific question
   */
  static async hasUserUpvotedQuestion(userId: number, questionId: number): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('question_upvotes')
        .select('id')
        .eq('userId', userId)
        .eq('questionId', questionId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking upvote status:', error)
        return false
      }

      return !!data
    } catch (error) {
      console.error('Error in hasUserUpvotedQuestion:', error)
      return false
    }
  }

  /**
   * Check if a user has bookmarked a specific question
   */
  static async hasUserBookmarkedQuestion(userId: number, questionId: number): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('question_bookmarks')
        .select('id')
        .eq('userId', userId)
        .eq('questionId', questionId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking bookmark status:', error)
        return false
      }

      return !!data
    } catch (error) {
      console.error('Error in hasUserBookmarkedQuestion:', error)
      return false
    }
  }

  /**
   * Get trending questions (most upvoted in the last week)
   */
  static async getTrendingQuestions(limit: number = 10): Promise<QuestionWithRelations[]> {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    try {
      // Get questions with upvotes from the last week
      const { data: questions, error } = await supabase
        .from('questions')
        .select(`
          *,
          author:users!questions_authorId_fkey(*),
          assignedTo:users!questions_assignedToId_fkey(*),
          answers(*),
          upvotes:question_upvotes!inner(createdAt),
          bookmarks:question_bookmarks(*)
        `)
        .gte('upvotes.createdAt', oneWeekAgo.toISOString())
        .limit(limit)

      if (error) {
        console.error('Error fetching trending questions:', error)
        return []
      }

      // Sort by upvote count and transform
      const questionsWithRelations: QuestionWithRelations[] = (questions || [])
        .map(question => ({
          ...question,
          author: question.author,
          assignedTo: question.assignedTo || undefined,
          answers: question.answers || [],
          upvotes: question.upvotes || [],
          bookmarks: question.bookmarks || [],
          upvoteCount: question.upvotes?.length || 0,
          bookmarkCount: question.bookmarks?.length || 0
        }))
        .sort((a, b) => (b.upvoteCount || 0) - (a.upvoteCount || 0))

      return questionsWithRelations

    } catch (error) {
      console.error('Error in getTrendingQuestions:', error)
      return []
    }
  }
}

// Usage examples:
/*

// Get a single question with all relations
const question = await QuestionService.getQuestionWithRelations(1)

// Get all questions with pagination
const questions = await QuestionService.getQuestionsWithRelations({
  limit: 20,
  offset: 0,
  status: 'PENDING'
})

// Get questions by a specific author
const authorQuestions = await QuestionService.getQuestionsWithRelations({
  authorId: 123,
  limit: 10
})

// Get user's bookmarked questions
const bookmarked = await QuestionService.getUserBookmarkedQuestions(456)

// Check if user upvoted a question
const hasUpvoted = await QuestionService.hasUserUpvotedQuestion(456, 1)

// Get trending questions
const trending = await QuestionService.getTrendingQuestions(5)

*/