import { Eye, EyeOff } from 'lucide-react';
import { useId, useState, type SubmitEvent } from 'react';

import { ErrorMessage } from '../components/ui/ErrorMessage';
import { useAuth } from '../hooks/useAuth';
import type { User } from '../types/models';
import { getErrorMessage } from '../utils/errors';

type AuthMode = 'signin' | 'signup';

const MIN_PASSWORD_LENGTH = 6;

const inputClass =
  'w-full rounded-lg border border-white/20 bg-white/10 p-3 text-white placeholder-white/60';

interface AuthPageProps {
  onAuthenticated: (user: User) => void;
  onContinueAsGuest: () => void;
}

export function AuthPage({ onAuthenticated, onContinueAsGuest }: AuthPageProps) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const ids = { name: useId(), email: useId(), password: useId() };

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError(null);
    setNotice(null);
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setNotice(null);

    try {
      if (mode === 'signin') {
        onAuthenticated(await signIn(email.trim(), password));
        return;
      }

      const result = await signUp({ name: name.trim(), email: email.trim(), password });
      if (result.status === 'signed-in') {
        onAuthenticated(result.user);
      } else {
        setMode('signin');
        setNotice('Check your email to confirm your account, then sign in.');
      }
    } catch (authError) {
      setError(getErrorMessage(authError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-700 p-4 text-white">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-5xl font-bold">Lynk</h1>
          <p className="text-white/70">The Business Leadership Knowledge Base</p>
        </div>

        <div className="rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur-xl">
          <div role="tablist" aria-label="Authentication mode" className="mb-8 flex">
            {(['signin', 'signup'] as const).map((tabMode) => (
              <button
                key={tabMode}
                type="button"
                role="tab"
                aria-selected={mode === tabMode}
                onClick={() => {
                  switchMode(tabMode);
                }}
                className={`flex-1 py-3 font-semibold transition first:rounded-l-lg last:rounded-r-lg ${
                  mode === tabMode ? 'bg-white/20' : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                {tabMode === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form
            onSubmit={(event) => {
              void handleSubmit(event);
            }}
          >
            {error && (
              <div className="mb-4">
                <ErrorMessage message={error} />
              </div>
            )}
            {notice && (
              <div
                role="status"
                className="mb-4 rounded-lg border border-green-500/50 bg-green-500/20 p-3 text-sm text-green-200"
              >
                {notice}
              </div>
            )}

            {mode === 'signup' && (
              <div className="mb-4">
                <label htmlFor={ids.name} className="mb-2 block text-sm font-medium">
                  Name
                </label>
                <input
                  id={ids.name}
                  type="text"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                  }}
                  placeholder="Your name"
                  autoComplete="name"
                  required
                  className={inputClass}
                />
              </div>
            )}

            <div className="mb-4">
              <label htmlFor={ids.email} className="mb-2 block text-sm font-medium">
                Email
              </label>
              <input
                id={ids.email}
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                }}
                placeholder="your@email.com"
                autoComplete="email"
                required
                className={inputClass}
              />
            </div>

            <div className="mb-6">
              <label htmlFor={ids.password} className="mb-2 block text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <input
                  id={ids.password}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                  }}
                  placeholder="••••••••"
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  minLength={mode === 'signup' ? MIN_PASSWORD_LENGTH : undefined}
                  required
                  className={`${inputClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowPassword((isShown) => !isShown);
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transform text-white/60 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-white/20 py-3 font-semibold transition hover:bg-white/30 disabled:opacity-50"
            >
              {isSubmitting ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>

        <button
          type="button"
          onClick={onContinueAsGuest}
          className="mt-6 w-full py-3 text-white/70 transition hover:text-white"
        >
          Continue as Guest
        </button>
      </div>
    </main>
  );
}
