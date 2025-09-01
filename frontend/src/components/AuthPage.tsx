// AuthPage.tsx
import React, { useState } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { AuthMode } from '../App'

interface AuthPageProps {
  authMode: AuthMode
  setAuthMode: (mode: 'signin' | 'signup') => void;
  handleSignIn: (email: string, password: string) => void;
  handleSignUp: (email: string, password: string, name: string) => void;
  error: string;
  setError: (msg: string) => void;
  setShowAuthPage: (show: boolean) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({
  authMode,
  setAuthMode,
  handleSignIn,
  handleSignUp,
  error,
  setError,
  setShowAuthPage,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-700 text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold mb-2">Lynk</h1>
            <p className="text-white/70">The Business Leadership Knowledge Base</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-xl p-8 rounded-2xl border border-white/20">
            <div className="flex mb-8">
              <button
                onClick={() => {
                  setAuthMode('signin');
                  setError('');
                }}
                className={`flex-1 py-3 rounded-l-lg font-semibold transition ${
                  authMode === 'signin' ? 'bg-white/20' : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setAuthMode('signup');
                  setError('');
                }}
                className={`flex-1 py-3 rounded-r-lg font-semibold transition ${
                  authMode === 'signup' ? 'bg-white/20' : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                Sign Up
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}

            {authMode === 'signup' && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60"
                />
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-3 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                authMode === 'signin' ? handleSignIn(email, password) : handleSignUp(email, password, name)
              }}
              className="w-full py-3 bg-white/20 rounded-lg font-semibold hover:bg-white/30 transition"
            >
              {authMode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>

            {authMode === 'signin' && (
              <div className="mt-6 text-center text-sm">
                <p className="text-white/60">Demo credentials:</p>
                <p className="text-white/80">admin@leaderlink.com / admin123 (Stacey Santos)</p>
                <p className="text-white/80">sarah.expert@leaderlink.com / expert123 (Richard Anderson)</p>
                <p className="text-white/80">demo@example.com / demo123</p>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowAuthPage(false)}
            className="mt-6 w-full py-3 text-white/70 hover:text-white transition"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    );
  };

export default AuthPage;