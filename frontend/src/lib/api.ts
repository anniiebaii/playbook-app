import { supabase } from './supabase'
import type { Question, Answer, User } from './supabase'

class LeaderLinkAPI {
  
  // Questions
  async getQuestions(filters?: {
    tags?: string[]
    status?: string
    limit?: number
    offset?: number
  }) {
    let query = supabase
      .from('questions')
      .select(`
        *,
        author:users(id, username, fullName, role, rating),
        answers(count),
        upvotes(count),
        bookmarks(count)
      `)
      .order('createdAt', { ascending: false })

    if (filters?.tags?.length) {
      query = query.contains('tags', filters.tags)
    }

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) throw error
    return data as Question[]
  }

  async getQuestion(id: string) {
    const { data, error } = await supabase
      .from('questions')
      .select(`
        *,
        author:users(id, username, fullName, role, rating),
        answers(
          *,
          author:users(id, username, fullName, role, rating),
          upvotes(count)
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    // Increment view count
    await supabase
      .from('questions')
      .update({ viewCount: (data.viewCount || 0) + 1 })
      .eq('id', id)

    return data as Question
  }

  async createQuestion(questionData: {
    title: string
    content: string
    tags?: string[]
  }) {
    const { data, error } = await supabase
      .from('questions')
      .insert([{
        title: questionData.title,
        content: questionData.content,
        tags: questionData.tags || [],
        authorId: (await supabase.auth.getUser()).data.user?.id
      }])
      .select(`
        *,
        author:users(id, username, fullName, role)
      `)
      .single()

    if (error) throw error
    return data as Question
  }

  // Answers
  async createAnswer(answerData: {
    questionId: string
    content: string
  }) {
    const { data, error } = await supabase
      .from('answers')
      .insert([{
        questionId: answerData.questionId,
        content: answerData.content,
        authorId: (await supabase.auth.getUser()).data.user?.id,
        isExpert: false // You can add logic to determine this
      }])
      .select(`
        *,
        author:users(id, username, fullName, role, rating)
      `)
      .single()

    if (error) throw error
    return data as Answer
  }

  // Upvotes
  async toggleUpvote(type: 'QUESTION' | 'ANSWER', targetId: string) {
    const user = (await supabase.auth.getUser()).data.user
    if (!user) throw new Error('Must be logged in to upvote')

    const column = type === 'QUESTION' ? 'questionId' : 'answerId'
    
    // Check if upvote already exists
    const { data: existing } = await supabase
      .from('upvotes')
      .select('id')
      .eq('userId', user.id)
      .eq(column, targetId)
      .single()

    if (existing) {
      // Remove upvote
      const { error } = await supabase
        .from('upvotes')
        .delete()
        .eq('id', existing.id)
      
      if (error) throw error
      return false // Removed
    } else {
      // Add upvote
      const { error } = await supabase
        .from('upvotes')
        .insert([{
          type,
          userId: user.id,
          [column]: targetId
        }])
      
      if (error) throw error
      return true // Added
    }
  }

  // Bookmarks
  async toggleBookmark(questionId: string) {
    const user = (await supabase.auth.getUser()).data.user
    if (!user) throw new Error('Must be logged in to bookmark')

    const { data: existing } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('userId', user.id)
      .eq('questionId', questionId)
      .single()

    if (existing) {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', existing.id)
      
      if (error) throw error
      return false
    } else {
      const { error } = await supabase
        .from('bookmarks')
        .insert([{
          userId: user.id,
          questionId
        }])
      
      if (error) throw error
      return true
    }
  }

  // Users
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data as User | null
  }

  async updateUserProfile(updates: Partial<User>) {
    const user = (await supabase.auth.getUser()).data.user
    if (!user) throw new Error('Must be logged in')

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error
    return data as User
  }
}

export const api = new LeaderLinkAPI()