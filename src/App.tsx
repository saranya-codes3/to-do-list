import { useEffect, useState, type FormEvent } from 'react';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import type { AppUser } from './types/task';

type ThemeMode = 'light' | 'dark';
type AuthRoute = 'login' | 'register';

const THEME_STORAGE_KEY = 'little_day_theme';
const LOCAL_PREVIEW_KEY = 'little_day_local_preview_active';

function getInitialTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {
    // Ignore storage access errors
  }
  return 'light';
}

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  const [authRoute, setAuthRoute] = useState<AuthRoute>('login');
  const [user, setUser] = useState<AppUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(isSupabaseConfigured);
  const [recoveryMode, setRecoveryMode] = useState<boolean>(false);
  const [recoveryPassword, setRecoveryPassword] = useState('');
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [recoveryBusy, setRecoveryBusy] = useState(false);

  // Sync dark mode class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage access errors
    }
  }, [theme]);

  // Initialize Supabase auth session & listener
  useEffect(() => {
    const client = supabase;
    if (!client) {
      setAuthLoading(false);
      try {
        if (localStorage.getItem(LOCAL_PREVIEW_KEY) === 'true') {
          setUser({
            id: 'local-preview-user',
            email: 'preview@little.day',
            fullName: 'Guest',
            isLocalPreview: true,
          });
        }
      } catch {
        // Ignore storage access errors
      }
      return;
    }

    let active = true;

    const loadSession = async () => {
      try {
        const {
          data: { session },
        } = await client.auth.getSession();

        if (!active) return;

        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email ?? '',
            fullName:
              (session.user.user_metadata?.full_name as string | undefined) ??
              undefined,
          });
        } else {
          setUser(null);
        }
      } finally {
        if (active) setAuthLoading(false);
      }
    };

    void loadSession();

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event, session) => {
      if (!active) return;

      if (event === 'PASSWORD_RECOVERY') {
        setRecoveryMode(true);
      }

      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          fullName:
            (session.user.user_metadata?.full_name as string | undefined) ??
            undefined,
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleEnterLocalPreview = () => {
    try {
      localStorage.setItem(LOCAL_PREVIEW_KEY, 'true');
    } catch {
      // Ignore storage access errors
    }
    setUser({
      id: 'local-preview-user',
      email: 'preview@little.day',
      fullName: 'Guest',
      isLocalPreview: true,
    });
  };

  const handleSignOut = async () => {
    if (user?.isLocalPreview) {
      try {
        localStorage.removeItem(LOCAL_PREVIEW_KEY);
      } catch {
        // Ignore storage access errors
      }
      setUser(null);
      setAuthRoute('login');
      return;
    }

    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setAuthRoute('login');
  };

  const handleUpdateUserName = (name: string) => {
    setUser((prev) => (prev ? { ...prev, fullName: name } : prev));
  };

  const handleCompletePasswordRecovery = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    if (recoveryPassword.length < 6) {
      setRecoveryError('Password must be at least 6 characters.');
      return;
    }

    setRecoveryBusy(true);
    setRecoveryError(null);
    try {
      const { error } = await supabase.auth.updateUser({
        password: recoveryPassword,
      });
      if (error) throw error;
      setRecoveryMode(false);
      setRecoveryPassword('');
    } catch (err) {
      setRecoveryError(
        err instanceof Error ? err.message : 'Unable to update password.'
      );
    } finally {
      setRecoveryBusy(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FAF7F0] dark:bg-[#161A17] flex flex-col items-center justify-center p-6">
        <span className="font-display text-2xl font-medium text-[#344E41] dark:text-[#F4F0E8]">
          little.day
        </span>
        <p className="text-xs text-[#6B7268] dark:text-[#9CA89E] mt-2">
          Preparing your workspace...
        </p>
      </div>
    );
  }

  if (recoveryMode && user) {
    return (
      <div className="min-h-screen bg-[#FAF7F0] dark:bg-[#161A17] flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl bg-[#FFFDF9] dark:bg-[#1E2420] border border-[#EDE5D8] dark:border-[#2B342E] p-7">
          <h1 className="font-display text-2xl font-medium text-[#262A26] dark:text-[#F4F0E8]">
            Set a new password
          </h1>
          <p className="text-sm text-[#5E665E] dark:text-[#9CA89E] mt-1.5">
            Choose a new password for {user.email}.
          </p>

          {recoveryError && (
            <div className="mt-4 px-3.5 py-2.5 rounded-xl bg-[#E8CFC8]/45 dark:bg-[#3A2825] border border-[#D8B4AA] dark:border-[#5C3A35] text-xs font-medium text-[#7D362D] dark:text-[#E8CFC8]">
              {recoveryError}
            </div>
          )}

          <form onSubmit={handleCompletePasswordRecovery} className="mt-5 space-y-4">
            <div>
              <label
                htmlFor="recovery-password"
                className="block text-xs font-semibold text-[#4A544B] dark:text-[#B4BEB5] mb-1.5"
              >
                New Password
              </label>
              <input
                id="recovery-password"
                type="password"
                required
                value={recoveryPassword}
                onChange={(e) => setRecoveryPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-4 py-3 rounded-xl bg-[#FAF7F0] dark:bg-[#161A17] border border-[#EDE5D8] dark:border-[#2B342E] text-sm text-[#262A26] dark:text-[#F4F0E8] focus:outline-none focus:border-[#344E41] dark:focus:border-[#A3B18A]"
              />
            </div>

            <button
              type="submit"
              disabled={recoveryBusy}
              className="w-full py-3 rounded-xl bg-[#344E41] dark:bg-[#A3B18A] text-[#FFFDF9] dark:text-[#161A17] text-sm font-semibold hover:bg-[#293E33] dark:hover:bg-[#B4C19D] transition-colors disabled:opacity-60"
            >
              {recoveryBusy ? 'Updating...' : 'Save New Password'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!user) {
    if (authRoute === 'register') {
      return (
        <Register
          onSwitchToLogin={() => setAuthRoute('login')}
          onEnterLocalPreview={handleEnterLocalPreview}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      );
    }

    return (
      <Login
        onSwitchToRegister={() => setAuthRoute('register')}
        onEnterLocalPreview={handleEnterLocalPreview}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  return (
    <Dashboard
      user={user}
      theme={theme}
      onToggleTheme={toggleTheme}
      onUpdateUserName={handleUpdateUserName}
      onSignOut={() => void handleSignOut()}
    />
  );
}
