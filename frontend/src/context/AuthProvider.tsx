import type { User as AuthUser } from '@supabase/supabase-js';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import {
  ACCOUNT_DEACTIVATED_MESSAGE,
  onAuthUserChange,
  signInWithPassword,
  signOut as endSession,
  signUpWithPassword,
  type SignUpCredentials,
} from '../api/auth';
import { ensureUserProfile } from '../api/users';
import type { User } from '../types/models';
import { AuthContext, type AuthContextValue, type SignUpResult } from './authContext';

interface ProfileResult {
  userId: string;
  profile: User | null;
}

/**
 * Tracks the Supabase session and the matching row in the `users` table.
 *
 * Supabase persists the session in local storage, so users stay signed in across page
 * loads. Profile loads are de-duplicated per user, which prevents a race between the
 * auth-change listener and an explicit sign-in both creating the profile.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  // `undefined` until Supabase reports the initial session.
  const [authUser, setAuthUser] = useState<AuthUser | null | undefined>(undefined);
  const [profileResult, setProfileResult] = useState<ProfileResult | null>(null);
  const profileRequest = useRef<{ userId: string; promise: Promise<User> } | null>(null);

  const loadProfile = useCallback((user: AuthUser): Promise<User> => {
    if (profileRequest.current?.userId === user.id) return profileRequest.current.promise;

    const promise = ensureUserProfile(user);
    profileRequest.current = { userId: user.id, promise };
    promise.catch(() => {
      // Allow a retry on the next sign-in attempt.
      if (profileRequest.current?.promise === promise) profileRequest.current = null;
    });
    return promise;
  }, []);

  useEffect(() => onAuthUserChange(setAuthUser), []);

  useEffect(() => {
    if (!authUser) {
      profileRequest.current = null;
      return;
    }
    let isStale = false;
    loadProfile(authUser).then(
      (profile) => {
        if (isStale) return;
        if (profile.status === 'INACTIVE') {
          // A restored session for a deactivated account: sign it out instead.
          setProfileResult({ userId: authUser.id, profile: null });
          endSession().catch((error: unknown) => {
            console.error('Failed to sign out deactivated account:', error);
          });
          return;
        }
        setProfileResult({ userId: authUser.id, profile });
      },
      (error: unknown) => {
        console.error('Failed to load user profile:', error);
        if (!isStale) setProfileResult({ userId: authUser.id, profile: null });
      },
    );
    return () => {
      isStale = true;
    };
  }, [authUser, loadProfile]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const user = await signInWithPassword(email, password);
      const profile = await loadProfile(user);
      if (profile.status === 'INACTIVE') {
        // Supabase Auth rejects banned accounts before this point; this also covers a status
        // that was changed directly in the table without a ban.
        await endSession();
        throw new Error(ACCOUNT_DEACTIVATED_MESSAGE);
      }
      setProfileResult({ userId: user.id, profile });
      return profile;
    },
    [loadProfile],
  );

  const signUp = useCallback(
    async (credentials: SignUpCredentials): Promise<SignUpResult> => {
      const { user, hasSession } = await signUpWithPassword(credentials);
      // Without a session the profile can't be written yet; it's created at first sign-in.
      if (!hasSession) return { status: 'confirmation-required' };

      const profile = await loadProfile(user);
      setProfileResult({ userId: user.id, profile });
      return { status: 'signed-in', user: profile };
    },
    [loadProfile],
  );

  const value = useMemo<AuthContextValue>(() => {
    const isCurrent = authUser != null && profileResult?.userId === authUser.id;
    return {
      currentUser: isCurrent ? profileResult.profile : null,
      isLoading: authUser === undefined || (authUser !== null && !isCurrent),
      signIn,
      signUp,
      signOut: endSession,
    };
  }, [authUser, profileResult, signIn, signUp]);

  return <AuthContext value={value}>{children}</AuthContext>;
}
