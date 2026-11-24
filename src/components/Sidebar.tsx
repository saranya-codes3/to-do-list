import {
  CalendarClock,
  CheckCircle2,
  FolderKanban,
  Layers,
  LogOut,
  Moon,
  Settings,
  Sun,
  SunMedium,
  X,
} from 'lucide-react';
import type { AppUser, NavSection } from '../types/task';

interface SidebarProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  counts: {
    myDay: number;
    all: number;
    upcoming: number;
    completed: number;
    categories: number;
  };
  user: AppUser;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onSignOut: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS: Array<{
  id: NavSection;
  label: string;
  icon: typeof SunMedium;
}> = [
  { id: 'my-day', label: 'My Day', icon: SunMedium },
  { id: 'all', label: 'All Tasks', icon: Layers },
  { id: 'upcoming', label: 'Upcoming', icon: CalendarClock },
  { id: 'completed', label: 'Completed', icon: CheckCircle2 },
  { id: 'categories', label: 'Categories', icon: FolderKanban },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({
  activeSection,
  onSelectSection,
  counts,
  user,
  theme,
  onToggleTheme,
  onSignOut,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const getCount = (id: NavSection): number | null => {
    switch (id) {
      case 'my-day':
        return counts.myDay;
      case 'all':
        return counts.all;
      case 'upcoming':
        return counts.upcoming;
      case 'completed':
        return counts.completed;
      case 'categories':
        return counts.categories;
      default:
        return null;
    }
  };

  const displayName = user.fullName || user.email.split('@')[0];
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  const handleNavClick = (section: NavSection) => {
    onSelectSection(section);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-[#FFFDF9] dark:bg-[#1B211D] border-r border-[#EDE5D8] dark:border-[#2B342E] px-5 py-6">
      <div>
        {/* Brand lockup */}
        <div className="flex items-start justify-between mb-8 px-1">
          <div>
            <span className="font-display text-2xl font-medium tracking-tight text-[#344E41] dark:text-[#F4F0E8] block">
              little.day
            </span>
            <p className="text-xs text-[#6B7268] dark:text-[#9CA89E] mt-1">
              A little progress every day.
            </p>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-2 -mr-2 rounded-lg text-[#5C645C] dark:text-[#B4BEB5] hover:bg-[#FAF7F0] dark:hover:bg-[#252D28] transition-colors"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <nav aria-label="Primary sections" className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            const count = getCount(item.id);

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#344E41] dark:focus-visible:ring-[#A3B18A] ${
                  isActive
                    ? 'bg-[#EDE5D8]/80 dark:bg-[#2A332D] text-[#344E41] dark:text-[#F4F0E8]'
                    : 'text-[#525A52] dark:text-[#B3BDB5] hover:bg-[#FAF7F0] dark:hover:bg-[#232A26] hover:text-[#262A26] dark:hover:text-[#F4F0E8]'
                }`}
              >
                <span className="flex items-center gap-3 whitespace-nowrap">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive
                        ? 'text-[#344E41] dark:text-[#A3B18A]'
                        : 'text-[#7C857C] dark:text-[#8E9A90]'
                    }`}
                    strokeWidth={1.75}
                  />
                  <span>{item.label}</span>
                </span>
                {count !== null && (
                  <span
                    className={`text-xs tabular-nums ${
                      isActive
                        ? 'text-[#344E41] dark:text-[#A3B18A] font-semibold'
                        : 'text-[#848D84] dark:text-[#7E8980]'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom utilities & account */}
      <div className="pt-5 border-t border-[#EDE5D8] dark:border-[#2B342E] space-y-3">
        <button
          type="button"
          onClick={onToggleTheme}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-[#525A52] dark:text-[#B3BDB5] hover:bg-[#FAF7F0] dark:hover:bg-[#232A26] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#344E41] dark:focus-visible:ring-[#A3B18A]"
        >
          <span className="flex items-center gap-3 whitespace-nowrap">
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-[#7C857C]" strokeWidth={1.75} />
            ) : (
              <Sun className="w-4 h-4 text-[#A3B18A]" strokeWidth={1.75} />
            )}
            <span>{theme === 'light' ? 'Dark Theme' : 'Light Theme'}</span>
          </span>
          <span className="text-xs text-[#848D84] dark:text-[#8E9A90]">
            {theme === 'light' ? 'Cream' : 'Forest'}
          </span>
        </button>

        <div className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-[#FAF7F0] dark:bg-[#161A17] border border-[#EDE5D8] dark:border-[#2B342E]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#344E41] dark:bg-[#A3B18A] text-[#FFFDF9] dark:text-[#161A17] flex items-center justify-center text-xs font-semibold shrink-0">
              {initials || 'LD'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#262A26] dark:text-[#F4F0E8] truncate">
                {displayName}
              </p>
              <p className="text-[11px] text-[#757D75] dark:text-[#8E9A90] truncate">
                {user.isLocalPreview ? 'Local Preview' : user.email}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onSignOut}
            title="Sign out"
            aria-label="Sign out"
            className="p-2 rounded-lg text-[#6B7268] dark:text-[#9CA89E] hover:text-[#344E41] dark:hover:text-[#F4F0E8] hover:bg-[#EDE5D8]/60 dark:hover:bg-[#2B342E] transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#344E41]"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#262A26]/35 dark:bg-black/60 backdrop-blur-[2px]"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative z-10 w-72 max-w-[85vw] h-full">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
