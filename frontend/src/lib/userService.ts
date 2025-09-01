import { supabase } from './supabase'
import type { UserWithRelations, Answer, AnswerWithRelations, AnswerData, QuestionStatus, CreateUserInput } from './supabase'

export type LoginError = 'UNCONFIRMED' | 'INCORRECT CREDS' | 'USER DOES NOT EXIST' | 'DB ERROR'

export class UserService {
  static async signUp(userData: CreateUserInput): Promise<UserWithRelations | null> {
    try {
      const email: string = userData.email
      const password: string = userData.password

      const { data: user, error: signUpError } = await supabase.auth.signUp({
        email,
        password
      })  

      if (signUpError) {
        console.error('Error during sign up:', signUpError)
        return null
      }
      if (!user || !user.user) {
        console.error('No user returned from sign up')
        return null
      }

      // Store the User info now
      const { data, error } = await supabase
          .from('users')
          .insert([{
            id: user.user.id,
            email: userData.email,
            name: userData.name,
            isAdmin: userData.isAdmin,


          
          }])
          .select(`
          *
          `)
          .single()

      if (error) throw error
      return data as UserWithRelations
    } catch (error) {
      console.error('Error in signUp:', error)
      return null
    }
  }

  static async signIn(email: string, password: string): Promise<UserWithRelations | null> {
    try {
      const { data: user, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (signInError) {
        // TODO: Handle error return types!!
        console.error('Error during sign in:', signInError)
        return null
      }
      if (!user) {
        console.error('No user returned from sign in')
        return null
      }
      // Fetch the user with relations after sign in
      const userWithRelations = await this.getUserWithRelations(user.user.id)
      return userWithRelations
    } catch (error) {
      console.error('Error in signIn:', error)
      return null
    }
  }

  static async getUserWithRelations(userId: string): Promise<UserWithRelations | null> {
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

  static async getByEmail(email: string): Promise<UserWithRelations | null> {
    try {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select(`
          *,
          bookmarks:question_bookmarks!question_bookmarks_userId_fkey(*),
          upvotes:question_upvotes!question_upvotes_userId_fkey(*)
        `)
        .eq('email', email)
        .single()

      if (userError) {
        console.error('Error fetching user by email:', userError)
        return null
      }

      if (!user) return null

      // Transform the data to match UserWithRelations interface
      const userWithRelations: UserWithRelations = {
        ...user,
        bookmarks: user.bookmarks || [],
        upvotes: user.upvotes || []
      }

      console.log('Fetched user by email with relations:', userWithRelations)

      return userWithRelations

    } catch (error) {
      console.error('Error in getByEmail:', error)
      return null
    }
  }
}