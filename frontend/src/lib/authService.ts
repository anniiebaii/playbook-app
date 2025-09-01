import { supabase } from './supabase'
import type { UserWithRelations, Answer, AnswerWithRelations, AnswerData, QuestionStatus, CreateUserInput } from './supabase'

export class AuthService {
  
  // Sign up new user
  static async signUp(email: string, password: string, userData = {} ) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData // This gets stored in auth.users.raw_user_meta_data
      }
    })

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  // Sign in user
  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  // Sign out
  static async signOut() {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      throw new Error(error.message)
    }

    return { success: true }
  }

  // Get current user
  static async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      throw new Error(error.message)
    }

    return user
  }

  // Get current session
  static async getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      throw new Error(error.message)
    }

    return session
  }

  // Change password (user must be logged in)
  static async changePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      throw new Error(error.message)
    }

    return { success: true }
  }

  // Send password reset email
  static async resetPassword(email: string, redirectTo: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo || `${window.location.origin}/reset-password`
    })

    if (error) {
      throw new Error(error.message)
    }

    return { success: true }
  }

  // Resend confirmation email
  static async resendConfirmation(email: string) {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email
    })

    if (error) {
      throw new Error(error.message)
    }

    return { success: true }
  }

}