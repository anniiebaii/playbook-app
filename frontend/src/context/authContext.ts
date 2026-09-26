import { createContext } from 'react';

import type { SignUpCredentials } from '../api/auth';
import type { User } from '../types/models';

export type SignUpResult =
  { status: 'signed-in'; user: User } | { status: 'confirmation-required' };

export interface AuthContextValue {
  /** The signed-in user's profile, or `null` for guests. */
  currentUser: User | null;
  /** True while the initial session or the user's profile is being restored. */
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (credentials: SignUpCredentials) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
