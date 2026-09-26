import type { User as AuthUser } from '@supabase/supabase-js';

import { supabase } from '../lib/supabaseClient';
import type { ExpertProfile, User, UserStatus } from '../types/models';

/** Columns that are safe to expose publicly when embedding a user in another record. */
export const USER_SUMMARY_COLUMNS = 'id, name, isAdmin, avatar, title' as const;

const EXPERT_COLUMNS = `${USER_SUMMARY_COLUMNS}, bio, expertise, rating, responseTime` as const;

export async function fetchUserById(userId: string): Promise<User | null> {
  const { data, error } = await supabase.from('users').select('*').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data;
}

/** All users, including private fields. Intended for the admin dashboard (enforced by RLS). */
export async function fetchAllUsers(): Promise<User[]> {
  const { data, error } = await supabase.from('users').select('*').order('createdAt');
  if (error) throw error;
  return data;
}

/**
 * Activates or deactivates an account (experts only, enforced in the database). Deactivating
 * also bans the login in Supabase Auth and signs the user out everywhere.
 */
export async function setUserStatus(userId: string, status: UserStatus): Promise<void> {
  const { error } = await supabase.rpc('admin_set_user_status', {
    target_user_id: userId,
    new_status: status,
  });
  if (error) throw error;
}

/**
 * Permanently deletes an account and, via cascading foreign keys, everything the user
 * created (experts only, enforced in the database).
 */
export async function deleteUser(userId: string): Promise<void> {
  const { error } = await supabase.rpc('admin_delete_user', { target_user_id: userId });
  if (error) throw error;
}

/** Expert advisors (admin users), with public profile fields only. */
export async function fetchExperts(): Promise<ExpertProfile[]> {
  const { data, error } = await supabase
    .from('users')
    .select(EXPERT_COLUMNS)
    .eq('isAdmin', true)
    .order('name');
  if (error) throw error;
  return data;
}

/**
 * Returns the app profile for an authenticated user, creating it on first sign-in.
 *
 * Supabase Auth owns credentials; the `users` table holds the app profile keyed by the
 * same UUID. Creating the row lazily (rather than only at sign-up) also covers accounts
 * that had to confirm their email before they had a session. The upsert ignores
 * duplicates, so concurrent calls for the same user are safe.
 */
export async function ensureUserProfile(authUser: AuthUser): Promise<User> {
  const existing = await fetchUserById(authUser.id);
  if (existing) return existing;

  const email = authUser.email ?? '';
  const { error } = await supabase
    .from('users')
    .upsert(
      { id: authUser.id, email, name: getDisplayName(authUser, email) },
      { onConflict: 'id', ignoreDuplicates: true },
    );
  if (error) throw error;

  const created = await fetchUserById(authUser.id);
  if (!created) throw new Error('Your account exists, but your profile could not be loaded.');
  return created;
}

function getDisplayName(authUser: AuthUser, email: string): string {
  const metadataName: unknown = authUser.user_metadata.name;
  if (typeof metadataName === 'string' && metadataName.trim()) return metadataName.trim();
  return email.split('@')[0] ?? 'Member';
}
