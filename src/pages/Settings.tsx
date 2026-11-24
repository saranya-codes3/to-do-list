import { useState, type FormEvent } from 'react';
import { Database, Download, Moon, Sun } from 'lucide-react';
import SchemaModal from '../components/SchemaModal';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type { AppUser, Task } from '../types/task';

interface SettingsProps {
  user: AppUser;
  tasks: Task[];
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onUpdateUserName: (name: string) => void;
  onSignOut: () => void;
}

export default function Settings({
  user,
  tasks,
  theme,
  onToggleTheme,
  onUpdateUserName,
  onSignOut,
}: SettingsProps) {
  const [fullName, setFullName] = useState(user.fullName ?? '');
  const [savingName, setSavingName] = useState(false);
  const [nameFeedback, setNameFeedback] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [schemaOpen, setSchemaOpen] = useState(false);

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = fullName.trim();
    if (!trimmed) return;
    setSavingName(true);
    setNameFeedback(null);

    try {
      if (supabase && !user.isLocalPreview) {
        const { error } = await supabase.auth.updateUser({
          data: { full_name: trimmed },
        });
        if (error) throw error;
      }
      onUpdateUserName(trimmed);
      setNameFeedback('Display name updated.');
    } catch (err) {
      setNameFeedback(
        err instanceof Error ? err.message : 'Unable to update name.'
      );
    } finally {
      setSavingName(false);
    }
  };

  const handleUpdatePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);

    if (!supabase || user.isLocalPreview) {
      setPasswordFeedback({
        type: 'error',
        text: 'Password changes require an active Supabase account.',
      });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordFeedback({
        type: 'error',
        text: 'Password must be at least 6 characters.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordFeedback({
        type: 'error',
        text: 'Passwords do not match.',
      });
      return;
    }

    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      setNewPassword('');
      setConfirmPassword('');
      setPasswordFeedback({
        type: 'success',
        text: 'Your password has been updated.',
      });
    } catch (err) {
      setPasswordFeedback({
        type: 'error',
        text:
          err instanceof Error ? err.message : 'Unable to update password.',
      });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleExportTasks = () => {
    const payload = JSON.stringify(tasks, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `little-day-tasks-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Appearance */}
      <section className="rounded-2xl bg-[#FFFDF9] dark:bg-[#1E2420] border border-[#EDE5D8] dark:border-[#2B342E] p-6">
        <h2 className="font-display text-xl font-medium text-[#262A26] dark:text-[#F4F0E8]">
          Appearance
        </h2>
        <p className="text-sm text-[#5E665E] dark:text-[#9CA89E] mt-1">
          Choose between warm morning cream and deep evening forest tones.
        </p>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => theme !== 'light' && onToggleTheme()}
            className={`flex items-center justify-between p-4 rounded-xl border text-left transition-colors ${
              theme === 'light'
                ? 'border-[#344E41] bg-[#FAF7F0]'
                : 'border-[#2B342E] bg-[#161A17] hover:border-[#5D6B5F]'
            }`}
          >
            <div>
              <p className="text-sm font-semibold text-[#262A26] dark:text-[#F4F0E8]">
                Light Cream
              </p>
              <p className="text-xs text-[#6B7268] dark:text-[#9CA89E] mt-0.5">
                Warm paper & sage
              </p>
            </div>
            <Sun className="w-5 h-5 text-[#344E41] dark:text-[#A3B18A]" />
          </button>

          <button
            type="button"
            onClick={() => theme !== 'dark' && onToggleTheme()}
            className={`flex items-center justify-between p-4 rounded-xl border text-left transition-colors ${
              theme === 'dark'
                ? 'border-[#A3B18A] bg-[#232A26]'
                : 'border-[#EDE5D8] bg-[#FFFDF9] hover:border-[#A3B18A]'
            }`}
          >
            <div>
              <p className="text-sm font-semibold text-[#262A26] dark:text-[#F4F0E8]">
                Dark Forest
              </p>
              <p className="text-xs text-[#6B7268] dark:text-[#9CA89E] mt-0.5">
                Deep moss & parchment
              </p>
            </div>
            <Moon className="w-5 h-5 text-[#344E41] dark:text-[#A3B18A]" />
          </button>
        </div>
      </section>

      {/* Profile */}
      <section className="rounded-2xl bg-[#FFFDF9] dark:bg-[#1E2420] border border-[#EDE5D8] dark:border-[#2B342E] p-6">
        <h2 className="font-display text-xl font-medium text-[#262A26] dark:text-[#F4F0E8]">
          Account Profile
        </h2>
        <p className="text-sm text-[#5E665E] dark:text-[#9CA89E] mt-1">
          Signed in as <span className="font-medium">{user.email}</span>
        </p>

        <form onSubmit={handleSaveProfile} className="mt-5 space-y-4 max-w-md">
          <div>
            <label
              htmlFor="settings-name"
              className="block text-xs font-semibold text-[#4A544B] dark:text-[#B4BEB5] mb-1.5"
            >
              Display Name
            </label>
            <input
              id="settings-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F0] dark:bg-[#161A17] border border-[#EDE5D8] dark:border-[#2B342E] text-sm text-[#262A26] dark:text-[#F4F0E8] focus:outline-none focus:border-[#344E41] dark:focus:border-[#A3B18A]"
            />
          </div>

          {nameFeedback && (
            <p className="text-xs font-medium text-[#344E41] dark:text-[#A3B18A]">
              {nameFeedback}
            </p>
          )}

          <button
            type="submit"
            disabled={savingName}
            className="px-4 py-2.5 rounded-xl bg-[#344E41] dark:bg-[#A3B18A] text-[#FFFDF9] dark:text-[#161A17] text-sm font-semibold hover:bg-[#293E33] dark:hover:bg-[#B4C19D] transition-colors disabled:opacity-60"
          >
            {savingName ? 'Saving...' : 'Save Name'}
          </button>
        </form>
      </section>

      {/* Password update */}
      {!user.isLocalPreview && isSupabaseConfigured && (
        <section className="rounded-2xl bg-[#FFFDF9] dark:bg-[#1E2420] border border-[#EDE5D8] dark:border-[#2B342E] p-6">
          <h2 className="font-display text-xl font-medium text-[#262A26] dark:text-[#F4F0E8]">
            Security
          </h2>
          <p className="text-sm text-[#5E665E] dark:text-[#9CA89E] mt-1">
            Update your account password.
          </p>

          <form
            onSubmit={handleUpdatePassword}
            className="mt-5 space-y-4 max-w-md"
          >
            <div>
              <label
                htmlFor="settings-new-password"
                className="block text-xs font-semibold text-[#4A544B] dark:text-[#B4BEB5] mb-1.5"
              >
                New Password
              </label>
              <input
                id="settings-new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F0] dark:bg-[#161A17] border border-[#EDE5D8] dark:border-[#2B342E] text-sm text-[#262A26] dark:text-[#F4F0E8] focus:outline-none focus:border-[#344E41] dark:focus:border-[#A3B18A]"
              />
            </div>

            <div>
              <label
                htmlFor="settings-confirm-password"
                className="block text-xs font-semibold text-[#4A544B] dark:text-[#B4BEB5] mb-1.5"
              >
                Confirm New Password
              </label>
              <input
                id="settings-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F0] dark:bg-[#161A17] border border-[#EDE5D8] dark:border-[#2B342E] text-sm text-[#262A26] dark:text-[#F4F0E8] focus:outline-none focus:border-[#344E41] dark:focus:border-[#A3B18A]"
              />
            </div>

            {passwordFeedback && (
              <p
                className={`text-xs font-medium ${
                  passwordFeedback.type === 'error'
                    ? 'text-[#9B4D42] dark:text-[#E8CFC8]'
                    : 'text-[#344E41] dark:text-[#A3B18A]'
                }`}
              >
                {passwordFeedback.text}
              </p>
            )}

            <button
              type="submit"
              disabled={savingPassword}
              className="px-4 py-2.5 rounded-xl bg-[#344E41] dark:bg-[#A3B18A] text-[#FFFDF9] dark:text-[#161A17] text-sm font-semibold hover:bg-[#293E33] dark:hover:bg-[#B4C19D] transition-colors disabled:opacity-60"
            >
              {savingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </section>
      )}

      {/* Workspace Data & Supabase */}
      <section className="rounded-2xl bg-[#FFFDF9] dark:bg-[#1E2420] border border-[#EDE5D8] dark:border-[#2B342E] p-6">
        <h2 className="font-display text-xl font-medium text-[#262A26] dark:text-[#F4F0E8]">
          Data & Backend
        </h2>
        <p className="text-sm text-[#5E665E] dark:text-[#9CA89E] mt-1">
          {isSupabaseConfigured && !user.isLocalPreview
            ? 'Connected to Supabase PostgreSQL with Row Level Security enabled.'
            : 'Currently running in Local Browser Preview. Connect Supabase in .env to sync across devices.'}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExportTasks}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#EDE5D8] dark:border-[#2B342E] text-sm font-medium text-[#344E41] dark:text-[#F4F0E8] hover:bg-[#FAF7F0] dark:hover:bg-[#252D28] transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Tasks (JSON)</span>
          </button>

          <button
            type="button"
            onClick={() => setSchemaOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#EDE5D8] dark:border-[#2B342E] text-sm font-medium text-[#344E41] dark:text-[#F4F0E8] hover:bg-[#FAF7F0] dark:hover:bg-[#252D28] transition-colors"
          >
            <Database className="w-4 h-4" />
            <span>View Supabase SQL</span>
          </button>

          <button
            type="button"
            onClick={onSignOut}
            className="px-4 py-2.5 rounded-xl border border-[#D8B4AA] dark:border-[#5C3A35] text-sm font-medium text-[#8E4A40] dark:text-[#E8CFC8] hover:bg-[#E8CFC8]/25 dark:hover:bg-[#3A2825] transition-colors"
          >
            Sign Out
          </button>
        </div>
      </section>

      <SchemaModal isOpen={schemaOpen} onClose={() => setSchemaOpen(false)} />
    </div>
  );
}
