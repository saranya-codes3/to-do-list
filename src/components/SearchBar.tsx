import { ArrowUpDown, RotateCcw, Search, X } from 'lucide-react';
import type { SortOption, StatusFilter, TaskPriority } from '../types/task';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  priorityFilter: TaskPriority | 'all';
  onPriorityChange: (priority: TaskPriority | 'all') => void;
  categoryFilter: string;
  onCategoryChange: (category: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  availableCategories: string[];
  hideStatusTabs?: boolean;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export default function SearchBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  categoryFilter,
  onCategoryChange,
  sortBy,
  onSortChange,
  availableCategories,
  hideStatusTabs = false,
  onResetFilters,
  hasActiveFilters,
}: SearchBarProps) {
  const statusOptions: Array<{ value: StatusFilter; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search
            className="w-4 h-4 text-[#7C857C] dark:text-[#8E9A90] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            strokeWidth={1.75}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks by title or note..."
            aria-label="Search tasks"
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#FFFDF9] dark:bg-[#1E2420] border border-[#EDE5D8] dark:border-[#2B342E] text-sm text-[#262A26] dark:text-[#F4F0E8] placeholder:text-[#8E968E] dark:placeholder:text-[#7A857C] focus:outline-none focus:border-[#A3B18A] dark:focus:border-[#A3B18A] transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-[#7C857C] hover:text-[#262A26] dark:hover:text-[#F4F0E8]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Interactive segmented status filter */}
        {!hideStatusTabs && (
          <div
            role="group"
            aria-label="Filter by completion status"
            className="inline-flex items-center p-1 rounded-xl bg-[#EDE5D8]/70 dark:bg-[#232A25] border border-[#EDE5D8] dark:border-[#2B342E] shrink-0 self-start md:self-auto"
          >
            {statusOptions.map((option) => {
              const active = statusFilter === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onStatusChange(option.value)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-[#FFFDF9] dark:bg-[#161A17] text-[#344E41] dark:text-[#F4F0E8] shadow-xs'
                      : 'text-[#626A62] dark:text-[#9CA89E] hover:text-[#262A26] dark:hover:text-[#F4F0E8]'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Secondary filter & sort controls */}
      <div className="flex flex-wrap items-center gap-2.5">
        <select
          value={priorityFilter}
          onChange={(e) =>
            onPriorityChange(e.target.value as TaskPriority | 'all')
          }
          aria-label="Filter by priority"
          className="px-3 py-2 rounded-xl bg-[#FFFDF9] dark:bg-[#1E2420] border border-[#EDE5D8] dark:border-[#2B342E] text-xs font-medium text-[#3C443C] dark:text-[#D8DDD8] focus:outline-none focus:border-[#A3B18A]"
        >
          <option value="all">All Priorities</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
          aria-label="Filter by category"
          className="px-3 py-2 rounded-xl bg-[#FFFDF9] dark:bg-[#1E2420] border border-[#EDE5D8] dark:border-[#2B342E] text-xs font-medium text-[#3C443C] dark:text-[#D8DDD8] focus:outline-none focus:border-[#A3B18A]"
        >
          <option value="all">All Categories</option>
          {availableCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FFFDF9] dark:bg-[#1E2420] border border-[#EDE5D8] dark:border-[#2B342E]">
          <ArrowUpDown
            className="w-3.5 h-3.5 text-[#7C857C] dark:text-[#8E9A90] shrink-0"
            strokeWidth={1.75}
          />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            aria-label="Sort tasks"
            className="bg-transparent text-xs font-medium text-[#3C443C] dark:text-[#D8DDD8] focus:outline-none"
          >
            <option value="due_date_asc" className="dark:bg-[#1E2420]">
              Sort: Due date (earliest)
            </option>
            <option value="due_date_desc" className="dark:bg-[#1E2420]">
              Sort: Due date (latest)
            </option>
            <option value="priority_desc" className="dark:bg-[#1E2420]">
              Sort: Priority (high to low)
            </option>
            <option value="created_desc" className="dark:bg-[#1E2420]">
              Sort: Recently added
            </option>
          </select>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-[#6B7268] dark:text-[#9CA89E] hover:text-[#344E41] dark:hover:text-[#F4F0E8] hover:bg-[#EDE5D8]/50 dark:hover:bg-[#2A332D] transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}
