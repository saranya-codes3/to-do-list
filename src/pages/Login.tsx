import { useState, type FormEvent } from 'react';
import { ArrowRight, Database, Eye, EyeOff, Moon, Sun } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import SchemaModal from '../components/SchemaModal';

interface LoginProps {
  onSwitchToRegister: () => void;
  onEnterLocalPreview: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function Login({
  onSwitchToRegister,
  onEnterLocalPreview,
  theme,
  onToggleTheme,
}: LoginProps) {
  const [mode, setMode] = useState<'login' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [schemaOpen, setSchemaOpen] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (!supabase) {
      setError(
        'Supabase environment variables are not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env, or use Local Preview below.'
      );
      return;
    }

    if (!email.trim() || !password) {
      setError('Please enter both your email and password.');
      return;
    }

    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (authError) throw authError;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to sign in. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (!supabase) {
      setError('Connect your Supabase project in .env to send password reset emails.');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your account email address.');
      return;
    }

    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: window.location.origin,
        }
      );
      if (resetError) throw resetError;
      setNotice(
        'Password reset instructions have been sent. Check your inbox for the recovery link.'
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to send password reset email.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] dark:bg-[#161A17] flex flex-col lg:grid lg:grid-cols-12">
      {/* Editorial visual column */}
      <div className="relative hidden lg:block lg:col-span-5 overflow-hidden bg-[#EDE5D8] dark:bg-[#1E2420]">
        {!imgFailed ? (
          <img
            src="/src/assets/images/auth_editorial_desk_1795506641319.jpg"
            alt="Warm cream linen workspace with an open notebook, brass pen, tea, and eucalyptus branch"
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[#EDE5D8] via-[#FAF7F0] to-[#A3B18A]/40 dark:from-[#1E2420] dark:to-[#2B342E]" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#161A17]/80 via-[#161A17]/20 to-transparent flex flex-col justify-end p-10">
          <p className="font-display italic text-2xl text-[#FFFDF9] leading-snug max-w-md">
            “A little progress every day adds up to a calmer, clearer life.”
          </p>
          <p className="text-xs text-[#EDE5D8]/85 mt-3">
            little.day — mindful daily planning
          </p>
        </div>
      </div>

      {/* Form column */}
      <div className="flex-1 lg:col-span-7 flex flex-col justify-between p-6 sm:p-10 lg:p-14">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-display text-2xl font-medium text-[#344E41] dark:text-[#F4F0E8]">
              little.day
            </span>
          </div>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-[#EDE5D8] dark:border-[#2B342E] bg-[#FFFDF9] dark:bg-[#1E2420] text-xs font-medium text-[#525A52] dark:text-[#B3BDB5] hover:text-[#262A26] dark:hover:text-[#F4F0E8] transition-colors"
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-3.5 h-3.5" />
                <span>Dark</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-[#A3B18A]" />
                <span>Light</span>
              </>
            )}
          </button>
        </div>

        <div className="w-full max-w-md mx-auto my-10">
          <h1 className="font-display text-3xl sm:text-4xl font-medium text-[#262A26] dark:text-[#F4F0E8]">
            {mode === 'login' ? 'Welcome back' : 'Reset password'}
          </h1>
          <p className="text-sm text-[#5E665E] dark:text-[#9CA89E] mt-2">
            {mode === 'login'
              ? 'Sign in to continue your daily rhythm.'
              : 'Enter your email to receive a password reset link.'}
          </p>

          {!isSupabaseConfigured && (
            <div className="mt-6 rounded-2xl border border-[#EDE5D8] dark:border-[#2B342E] bg-[#FFFDF9] dark:bg-[#1E2420] p-4 space-y-3">
              <p className="text-xs font-semibold text-[#344E41] dark:text-[#A3B18A]">
                Supabase environment not connected
              </p>
              <p className="text-xs text-[#5E665E] dark:text-[#AAB5AC] leading-relaxed">
                Add <code className="font-mono">VITE_SUPABASE_URL</code> and{' '}
                <code className="font-mono">VITE_SUPABASE_ANON_KEY</code> in{' '}
                <code className="font-mono">.env</code> to enable cloud auth & PostgreSQL sync, or explore the full app in Local Preview.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={onEnterLocalPreview}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#344E41] dark:bg-[#A3B18A] text-[#FFFDF9] dark:text-[#161A17] text-xs font-semibold hover:bg-[#293E33] dark:hover:bg-[#B4C19D] transition-colors"
                >
                  <span>Open Local Preview</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setSchemaOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#EDE5D8] dark:border-[#2B342E] text-xs font-medium text-[#4A544B] dark:text-[#C8D1C9] hover:bg-[#FAF7F0] dark:hover:bg-[#252D28] transition-colors"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>View SQL Schema</span>
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-5 px-4 py-3 rounded-xl bg-[#E8CFC8]/45 dark:bg-[#3A2825] border border-[#D8B4AA] dark:border-[#5C3A35] text-xs font-medium text-[#7D362D] dark:text-[#E8CFC8]">
              {error}
            </div>
          )}

          {notice && (
            <div className="mt-5 px-4 py-3 rounded-xl bg-[#A3B18A]/20 border border-[#A3B18A]/50 text-xs font-medium text-[#344E41] dark:text-[#C8D7B5]">
              {notice}
            </div>
          )}

          <form
            onSubmit={mode === 'login' ? handleLogin : handleResetPassword}
            className="mt-6 space-y-4"
          >
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold text-[#4A544B] dark:text-[#B4BEB5] mb-1.5"
              >
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl bg-[#FFFDF9] dark:bg-[#1E2420] border border-[#EDE5D8] dark:border-[#2B342E] text-sm text-[#262A26] dark:text-[#F4F0E8] placeholder:text-[#8E968E] focus:outline-none focus:border-[#344E41] dark:focus:border-[#A3B18A]"
              />
            </div>

            {mode === 'login' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-semibold text-[#4A544B] dark:text-[#B4BEB5]"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('reset');
                      setError(null);
                      setNotice(null);
                    }}
                    className="text-xs font-medium text-[#344E41] dark:text-[#A3B18A] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-4 pr-11 py-3 rounded-xl bg-[#FFFDF9] dark:bg-[#1E2420] border border-[#EDE5D8] dark:border-[#2B342E] text-sm text-[#262A26] dark:text-[#F4F0E8] placeholder:text-[#8E968E] focus:outline-none focus:border-[#344E41] dark:focus:border-[#A3B18A]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[#7C857C] hover:text-[#262A26] dark:hover:text-[#F4F0E8]"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#344E41] dark:bg-[#A3B18A] text-[#FFFDF9] dark:text-[#161A17] text-sm font-semibold hover:bg-[#293E33] dark:hover:bg-[#B4C19D] transition-colors disabled:opacity-60"
            >
              {loading
                ? 'Please wait...'
                : mode === 'login'
                  ? 'Sign In'
                  : 'Send Reset Link'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-[#5E665E] dark:text-[#9CA89E]">
            {mode === 'login' ? (
              <>
                New to little.day?{' '}
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  className="font-semibold text-[#344E41] dark:text-[#A3B18A] hover:underline"
                >
                  Create an account
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setNotice(null);
                }}
                className="font-semibold text-[#344E41] dark:text-[#A3B18A] hover:underline"
              >
                Back to Sign In
              </button>
            )}
          </div>
        </div>

        <p className="text-xs text-[#848D84] dark:text-[#7A857C] text-center lg:text-left">
          A little progress every day.
        </p>
      </div>

      <SchemaModal isOpen={schemaOpen} onClose={() => setSchemaOpen(false)} />
    </div>
  );
}
