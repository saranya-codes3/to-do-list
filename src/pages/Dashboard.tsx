import { useMemo, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { AlertCircle, FolderOpen, Plus, RefreshCw } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import Sidebar from '../components/Sidebar';
import Statistics from '../components/Statistics';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import { useTasks } from '../hooks/useTasks';
import Settings from './Settings';
import type {
  AppUser,
  CreateTaskInput,
  NavSection,
  SortOption,
  StatusFilter,
  Task,
  TaskPriority,
} from '../types/task';
import {
  DEFAULT_CATEGORIES,
  getTodayISO,
  isOverdue,
  isToday,
  isUpcoming,
} from '../utils/dateUtils';

interface DashboardProps {
  user: AppUser;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onUpdateUserName: (name: string) => void;
  onSignOut: () => void;
}

export default function Dashboard({
  user,
  theme,
  onToggleTheme,
  onUpdateUserName,
  onSignOut,
}: DashboardProps) {
  const {
    tasks,
    loading,
    error,
    mutatingId,
    statistics,
    categories,
    refreshTasks,
    addTask,
    editTask,
    toggleTask,
    removeTask,
    filterAndSortTasks,
  } = useTasks(user);

  const [activeSection, setActiveSection] = useState<NavSection>('my-day');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('due_date_asc');

  // Modals
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  const availableCategories = useMemo(() => {
    return Array.from(
      new Set([...DEFAULT_CATEGORIES, ...Array.from(categories.keys())])
    );
  }, [categories]);

  const sidebarCounts = useMemo(() => {
    const myDay = tasks.filter(
      (t) => isToday(t.due_date) || isOverdue(t.due_date, t.completed)
    ).length;
    const upcoming = tasks.filter((t) =>
      isUpcoming(t.due_date, t.completed)
    ).length;
    const completed = tasks.filter((t) => t.completed).length;

    return {
      myDay,
      all: tasks.length,
      upcoming,
      completed,
      categories: availableCategories.length,
    };
  }, [tasks, availableCategories.length]);

  const filteredTasks = useMemo(() => {
    return filterAndSortTasks({
      section: activeSection,
      searchQuery,
      statusFilter,
      priorityFilter,
      categoryFilter,
      sortBy,
    });
  }, [
    filterAndSortTasks,
    activeSection,
    searchQuery,
    statusFilter,
    priorityFilter,
    categoryFilter,
    sortBy,
  ]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    statusFilter !== 'all' ||
    priorityFilter !== 'all' ||
    categoryFilter !== 'all';

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setCategoryFilter('all');
  };

  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setTaskModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setTaskModalOpen(true);
  };

  const handleSaveTask = async (input: CreateTaskInput) => {
    if (editingTask) {
      await editTask(editingTask.id, input);
    } else {
      await addTask(input);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingTask) return;
    setDeletingBusy(true);
    try {
      await removeTask(deletingTask.id);
      setDeletingTask(null);
    } finally {
      setDeletingBusy(false);
    }
  };

  const handleSelectCategoryCard = (categoryName: string) => {
    setCategoryFilter(categoryName);
    setActiveSection('all');
  };

  const getEmptyMessage = (): { title: string; body: string } => {
    if (hasActiveFilters) {
      return {
        title: 'No matching tasks',
        body: 'Try adjusting your search or resetting your active filters.',
      };
    }

    switch (activeSection) {
      case 'my-day':
        return {
          title: 'Your day is wide open',
          body: 'Add a task due today to shape your focus for the hours ahead.',
        };
      case 'upcoming':
        return {
          title: 'Nothing scheduled ahead',
          body: 'Tasks with future due dates will appear here automatically.',
        };
      case 'completed':
        return {
          title: 'No completed tasks yet',
          body: 'Checked-off tasks gather here as a quiet record of progress.',
        };
      default:
        return {
          title: 'A fresh page awaits',
          body: 'Create your first task to start tracking daily progress.',
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] dark:bg-[#161A17] text-[#262A26] dark:text-[#F4F0E8] flex">
      <Sidebar
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        counts={sidebarCounts}
        user={user}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onSignOut={onSignOut}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <main className="flex-1 min-w-0">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-12 py-6 sm:py-9 space-y-7">
          {user.isLocalPreview && (
            <div className="rounded-xl border border-[#EDE5D8] dark:border-[#2B342E] bg-[#FFFDF9] dark:bg-[#1E2420] px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-[#5E665E] dark:text-[#AAB5AC]">
              <span>
                Local Preview Workspace — tasks are saved in your browser until you configure Supabase in{' '}
                <code className="font-mono">.env</code>.
              </span>
              <button
                type="button"
                onClick={() => setActiveSection('settings')}
                className="font-semibold text-[#344E41] dark:text-[#A3B18A] hover:underline whitespace-nowrap"
              >
                View Setup
              </button>
            </div>
          )}

          <Header
            activeSection={activeSection}
            userName={user.fullName || user.email.split('@')[0]}
            onNewTask={handleOpenCreateModal}
            onOpenMobileMenu={() => setMobileMenuOpen(true)}
          />

          {activeSection === 'settings' ? (
            <Settings
              user={user}
              tasks={tasks}
              theme={theme}
              onToggleTheme={onToggleTheme}
              onUpdateUserName={onUpdateUserName}
              onSignOut={onSignOut}
            />
          ) : activeSection === 'categories' ? (
            <section aria-label="Categories overview" className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableCategories.map((cat) => {
                  const counts = categories.get(cat) ?? {
                    total: 0,
                    pending: 0,
                    completed: 0,
                  };
                  const pct =
                    counts.total > 0
                      ? Math.round((counts.completed / counts.total) * 100)
                      : 0;

                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleSelectCategoryCard(cat)}
                      className="text-left rounded-2xl bg-[#FFFDF9] dark:bg-[#1E2420] border border-[#EDE5D8] dark:border-[#2B342E] hover:border-[#A3B18A] p-5 transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <FolderOpen
                            className="w-4 h-4 text-[#344E41] dark:text-[#A3B18A]"
                            strokeWidth={1.75}
                          />
                          <h3 className="font-display text-lg font-medium text-[#262A26] dark:text-[#F4F0E8] group-hover:text-[#344E41] dark:group-hover:text-[#A3B18A] transition-colors">
                            {cat}
                          </h3>
                        </div>
                        <span className="text-xs font-medium text-[#6B7268] dark:text-[#9CA89E] tabular-nums">
                          {counts.total} {counts.total === 1 ? 'task' : 'tasks'}
                        </span>
                      </div>

                      <div className="mt-4 w-full h-1.5 rounded-full bg-[#EDE5D8] dark:bg-[#2B342E] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#A3B18A] transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <p className="mt-3 text-xs text-[#6B7268] dark:text-[#929E94] tabular-nums">
                        {counts.pending} pending · {counts.completed} completed
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>
          ) : (
            <>
              <Statistics stats={statistics} loading={loading} />

              <section aria-label="Task list and filters" className="space-y-5">
                <SearchBar
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  statusFilter={statusFilter}
                  onStatusChange={setStatusFilter}
                  priorityFilter={priorityFilter}
                  onPriorityChange={setPriorityFilter}
                  categoryFilter={categoryFilter}
                  onCategoryChange={setCategoryFilter}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  availableCategories={availableCategories}
                  hideStatusTabs={activeSection === 'completed'}
                  onResetFilters={resetFilters}
                  hasActiveFilters={hasActiveFilters}
                />

                {error && (
                  <div className="rounded-2xl border border-[#D8B4AA] dark:border-[#5C3A35] bg-[#E8CFC8]/35 dark:bg-[#3A2825] px-4 py-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 text-xs font-medium text-[#7D362D] dark:text-[#E8CFC8]">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => void refreshTasks()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFFDF9] dark:bg-[#1E2420] text-xs font-semibold text-[#344E41] dark:text-[#F4F0E8] hover:opacity-90 shrink-0"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Retry</span>
                    </button>
                  </div>
                )}

                {loading ? (
                  <div className="space-y-3" aria-busy="true" aria-label="Loading tasks">
                    {[1, 2, 3].map((row) => (
                      <div
                        key={row}
                        className="h-24 rounded-2xl bg-[#FFFDF9] dark:bg-[#1E2420] border border-[#EDE5D8] dark:border-[#2B342E] p-5 animate-pulse"
                      >
                        <div className="h-4 w-1/3 rounded bg-[#EDE5D8] dark:bg-[#2B342E]" />
                        <div className="h-3 w-2/3 rounded bg-[#EDE5D8]/70 dark:bg-[#2B342E]/70 mt-3" />
                      </div>
                    ))}
                  </div>
                ) : filteredTasks.length === 0 ? (
                  <div className="rounded-2xl bg-[#FFFDF9] dark:bg-[#1E2420] border border-[#EDE5D8] dark:border-[#2B342E] px-6 py-14 text-center">
                    <h3 className="font-display text-xl font-medium text-[#262A26] dark:text-[#F4F0E8]">
                      {getEmptyMessage().title}
                    </h3>
                    <p className="text-sm text-[#6B7268] dark:text-[#9CA89E] max-w-sm mx-auto mt-2">
                      {getEmptyMessage().body}
                    </p>
                    <div className="mt-6 flex items-center justify-center gap-3">
                      {hasActiveFilters ? (
                        <button
                          type="button"
                          onClick={resetFilters}
                          className="px-4 py-2.5 rounded-xl border border-[#EDE5D8] dark:border-[#2B342E] text-sm font-medium text-[#344E41] dark:text-[#F4F0E8] hover:bg-[#FAF7F0] dark:hover:bg-[#252D28] transition-colors"
                        >
                          Reset Filters
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleOpenCreateModal}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#344E41] dark:bg-[#A3B18A] text-[#FFFDF9] dark:text-[#161A17] text-sm font-semibold hover:bg-[#293E33] dark:hover:bg-[#B4C19D] transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Task</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <AnimatePresence initial={false}>
                      {filteredTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          isMutating={mutatingId === task.id}
                          onToggle={(item) => void toggleTask(item)}
                          onEdit={handleOpenEditModal}
                          onRequestDelete={setDeletingTask}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>

      <TaskModal
        isOpen={taskModalOpen}
        editingTask={editingTask}
        availableCategories={availableCategories}
        defaultDueDate={activeSection === 'my-day' ? getTodayISO() : null}
        onClose={() => {
          setTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleSaveTask}
      />

      <ConfirmModal
        isOpen={Boolean(deletingTask)}
        title="Delete Task"
        message={
          deletingTask
            ? `Are you sure you want to delete "${deletingTask.title}"? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete Task"
        loading={deletingBusy}
        onCancel={() => setDeletingTask(null)}
        onConfirm={() => void handleConfirmDelete()}
      />
    </div>
  );
}
