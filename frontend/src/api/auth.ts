import type { AuthError, User as AuthUser } from '@supabase/supabase-js';

import { supabase } from '../lib/supabaseClient';

export interface SignUpCredentials {
  name: string;
  email: string;
  password: string;
}

export interface SignUpResponse {
  user: AuthUser;
  /** False when the project requires email confirmation before the first sign-in. */
  hasSession: boolean;
}

const FRIENDLY_AUTH_ERRORS: Partial<Record<string, string>> = {
  invalid_credentials: 'Invalid email or password.',
  email_not_confirmed: 'Please confirm your email address, then sign in.',
  user_already_exists: 'An account with this email already exists.',
  weak_password: 'Please choose a stronger password.',
};

function toFriendlyError(error: AuthError): Error {
  return new Error((error.code && FRIENDLY_AUTH_ERRORS[error.code]) ?? error.message);
}

export async function signInWithPassword(email: string, password: string): Promise<AuthUser> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw toFriendlyError(error);
  return data.user;
}

export async function signUpWithPassword({
  name,
  email,
  password,
}: SignUpCredentials): Promise<SignUpResponse> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    // Stored in auth user metadata so the profile can be created after email confirmation.
    options: { data: { name } },
  });
  if (error) throw toFriendlyError(error);
  if (!data.user) throw new Error('Sign up failed. Please try again.');
  return { user: data.user, hasSession: data.session !== null };
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw toFriendlyError(error);
}

/**
 * Subscribes to auth changes. The callback fires immediately with the restored session
 * (if any), then on every sign-in, sign-out, and token refresh.
 *
 * @returns An unsubscribe function.
 */
export function onAuthUserChange(callback: (user: AuthUser | null) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
  return () => {
    data.subscription.unsubscribe();
  };
}
