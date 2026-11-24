import { Menu, Plus } from 'lucide-react';
import type { NavSection } from '../types/task';
import {
  formatFullCurrentDate,
  getDailyQuote,
  getGreeting,
} from '../utils/dateUtils';

interface HeaderProps {
  activeSection: NavSection;
  userName?: string;
  onNewTask: () => void;
  onOpenMobileMenu: () => void;
}

const SECTION_SUBTITLES: Record<NavSection, string> = {
  'my-day': 'Focus on what matters most today.',
  all: 'Every commitment in one calm place.',
  upcoming: 'Scheduled ahead so nothing sneaks up.',
  completed: 'A quiet record of progress made.',
  categories: 'Organized by the rhythms of your life.',
  settings: 'Preferences, account, and workspace setup.',
};

export default function Header({
  activeSection,
  userName,
  onNewTask,
  onOpenMobileMenu,
}: HeaderProps) {
  const quote = getDailyQuote();
  const currentDate = formatFullCurrentDate();
  const greeting = getGreeting(userName);

  return (
    <header className="pb-6 border-b border-[#EDE5D8] dark:border-[#2B342E]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Open navigation menu"
            className="lg:hidden mt-1 p-2.5 -ml-2 rounded-xl border border-[#EDE5D8] dark:border-[#2B342E] bg-[#FFFDF9] dark:bg-[#1E2420] text-[#344E41] dark:text-[#F4F0E8] hover:bg-[#EDE5D8]/50 dark:hover:bg-[#2A332D] transition-colors shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <p className="text-xs font-medium text-[#6B7268] dark:text-[#9CA89E] tabular-nums">
              {currentDate}
            </p>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-[2.15rem] font-medium tracking-tight text-[#262A26] dark:text-[#F4F0E8] mt-1">
              {greeting}
            </h1>
            <p className="text-sm text-[#5E665E] dark:text-[#A4B0A6] mt-1">
              {SECTION_SUBTITLES[activeSection]}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onNewTask}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#344E41] dark:bg-[#A3B18A] text-[#FFFDF9] dark:text-[#161A17] text-sm font-semibold hover:bg-[#293E33] dark:hover:bg-[#B4C19D] active:scale-[0.98] transition-all duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#344E41] dark:focus-visible:ring-[#A3B18A]"
        >
          <Plus className="w-4 h-4" strokeWidth={2.25} />
          <span>New Task</span>
        </button>
      </div>

      {/* Daily motivational quote */}
      <blockquote className="mt-5 pt-4 border-t border-[#EDE5D8]/70 dark:border-[#2B342E]/70 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
        <p className="font-display italic text-sm sm:text-[15px] text-[#4A544B] dark:text-[#C8D1C9]">
          “{quote.text}”
        </p>
        <span className="text-xs text-[#848D84] dark:text-[#7E8980] shrink-0">
          Daily note
        </span>
      </blockquote>
    </header>
  );
}
