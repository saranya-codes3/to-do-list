import { useState, type FormEvent } from 'react';
import { Eye, EyeOff, Moon, Sun } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

interface RegisterProps {
  onSwitchToLogin: () => void;
  onEnterLocalPreview: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function Register({
  onSwitchToLogin,
  onEnterLocalPreview,
  theme,
  onToggleTheme,
}: RegisterProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [imgFailed, setImgFailed] = useState(false);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (!supabase) {
      setError(
        'Supabase is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.'
      );
      return;
    }

    if (!fullName.trim() || !email.trim() || !password) {
      setError('Please complete all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
          emailRedirectTo: window.location.origin,
        },
      });

      if (signUpError) throw signUpError;

      if (data.session) {
        // Signed in immediately (email confirmation disabled in Supabase project)
        return;
      }

      setNotice(
        'Account created. Please check your email inbox to confirm your address before signing in.'
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to register account. Please try again.'
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
            “Begin with what is in front of you; keep your days gentle and deliberate.”
          </p>
          <p className="text-xs text-[#EDE5D8]/85 mt-3">
            little.day — personal productivity space
          </p>
        </div>
      </div>

      {/* Form column */}
      <div className="flex-1 lg:col-span-7 flex flex-col justify-between p-6 sm:p-10 lg:p-14">
        <div className="flex items-center justify-between">
          <span className="font-display text-2xl font-medium text-[#344E41] dark:text-[#F4F0E8]">
            little.day
          </span>

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

        <div className="w-full max-w-md mx-auto my-8">
          <h1 className="font-display text-3xl sm:text-4xl font-medium text-[#262A26] dark:text-[#F4F0E8]">
            Create your space
          </h1>
          <p className="text-sm text-[#5E665E] dark:text-[#9CA89E] mt-2">
            Start organizing your day with calm clarity.
          </p>

          {!isSupabaseConfigured && (
            <div className="mt-5 rounded-2xl border border-[#EDE5D8] dark:border-[#2B342E] bg-[#FFFDF9] dark:bg-[#1E2420] p-4 flex items-center justify-between gap-3">
              <p className="text-xs text-[#5E665E] dark:text-[#AAB5AC]">
                Supabase keys aren&apos;t set yet. You can still preview the app locally.
              </p>
              <button
                type="button"
                onClick={onEnterLocalPreview}
                className="px-3 py-1.5 rounded-lg bg-[#344E41] dark:bg-[#A3B18A] text-[#FFFDF9] dark:text-[#161A17] text-xs font-semibold whitespace-nowrap shrink-0"
              >
                Preview
              </button>
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

          <form onSubmit={handleRegister} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="register-name"
                className="block text-xs font-semibold text-[#4A544B] dark:text-[#B4BEB5] mb-1.5"
              >
                Full Name
              </label>
              <input
                id="register-name"
                type="text"
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Clara Lin"
                className="w-full px-4 py-3 rounded-xl bg-[#FFFDF9] dark:bg-[#1E2420] border border-[#EDE5D8] dark:border-[#2B342E] text-sm text-[#262A26] dark:text-[#F4F0E8] placeholder:text-[#8E968E] focus:outline-none focus:border-[#344E41] dark:focus:border-[#A3B18A]"
              />
            </div>

            <div>
              <label
                htmlFor="register-email"
                className="block text-xs font-semibold text-[#4A544B] dark:text-[#B4BEB5] mb-1.5"
              >
                Email Address
              </label>
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl bg-[#FFFDF9] dark:bg-[#1E2420] border border-[#EDE5D8] dark:border-[#2B342E] text-sm text-[#262A26] dark:text-[#F4F0E8] placeholder:text-[#8E968E] focus:outline-none focus:border-[#344E41] dark:focus:border-[#A3B18A]"
              />
            </div>

            <div>
              <label
                htmlFor="register-password"
                className="block text-xs font-semibold text-[#4A544B] dark:text-[#B4BEB5] mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
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

            <div>
              <label
                htmlFor="register-confirm"
                className="block text-xs font-semibold text-[#4A544B] dark:text-[#B4BEB5] mb-1.5"
              >
                Confirm Password
              </label>
              <input
                id="register-confirm"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                className="w-full px-4 py-3 rounded-xl bg-[#FFFDF9] dark:bg-[#1E2420] border border-[#EDE5D8] dark:border-[#2B342E] text-sm text-[#262A26] dark:text-[#F4F0E8] placeholder:text-[#8E968E] focus:outline-none focus:border-[#344E41] dark:focus:border-[#A3B18A]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#344E41] dark:bg-[#A3B18A] text-[#FFFDF9] dark:text-[#161A17] text-sm font-semibold hover:bg-[#293E33] dark:hover:bg-[#B4C19D] transition-colors disabled:opacity-60"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#5E665E] dark:text-[#9CA89E]">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="font-semibold text-[#344E41] dark:text-[#A3B18A] hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>

        <p className="text-xs text-[#848D84] dark:text-[#7A857C] text-center lg:text-left">
          A little progress every day.
        </p>
      </div>
    </div>
  );
}
