import { useCallback, useEffect, useMemo, useState } from 'react';
import { taskService } from '../services/taskService';
import type {
  AppUser,
  CreateTaskInput,
  NavSection,
  SortOption,
  StatusFilter,
  Task,
  TaskPriority,
  TaskStatistics,
  UpdateTaskInput,
} from '../types/task';
import { getTodayISO, isOverdue, isToday, isUpcoming } from '../utils/dateUtils';

export interface TaskFilterState {
  section: NavSection;
  searchQuery: string;
  statusFilter: StatusFilter;
  priorityFilter: TaskPriority | 'all';
  categoryFilter: string;
  sortBy: SortOption;
}

const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

export function useTasks(user: AppUser | null) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mutatingId, setMutatingId] = useState<string | null>(null);

  const isLocalPreview = Boolean(user?.isLocalPreview);
  const userId = user?.id ?? null;

  const loadTasks = useCallback(async () => {
    if (!userId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setError(null);
    try {
      const data = await taskService.fetchTasks(userId, isLocalPreview);
      setTasks(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Could not fetch tasks.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [userId, isLocalPreview]);

  useEffect(() => {
    setLoading(true);
    void loadTasks();

    if (!userId) return;
    const unsubscribe = taskService.subscribeToTasks(
      userId,
      () => {
        void loadTasks();
      },
      isLocalPreview
    );

    return unsubscribe;
  }, [userId, isLocalPreview, loadTasks]);

  const addTask = useCallback(
    async (input: CreateTaskInput) => {
      if (!userId) throw new Error('You must be signed in to add tasks.');
      setError(null);
      const created = await taskService.createTask(userId, input, isLocalPreview);
      setTasks((prev) => [created, ...prev]);
      return created;
    },
    [userId, isLocalPreview]
  );

  const editTask = useCallback(
    async (taskId: string, updates: UpdateTaskInput) => {
      if (!userId) throw new Error('You must be signed in to update tasks.');
      setError(null);
      setMutatingId(taskId);
      try {
        const updated = await taskService.updateTask(
          taskId,
          userId,
          updates,
          isLocalPreview
        );
        setTasks((prev) =>
          prev.map((task) => (task.id === taskId ? updated : task))
        );
        return updated;
      } finally {
        setMutatingId(null);
      }
    },
    [userId, isLocalPreview]
  );

  const toggleTask = useCallback(
    async (task: Task) => {
      if (!userId) return;
      const nextCompleted = !task.completed;
      setError(null);
      setMutatingId(task.id);

      // Optimistic immediate UI update
      setTasks((prev) =>
        prev.map((item) =>
          item.id === task.id ? { ...item, completed: nextCompleted } : item
        )
      );

      try {
        const updated = await taskService.updateTask(
          task.id,
          userId,
          { completed: nextCompleted },
          isLocalPreview
        );
        setTasks((prev) =>
          prev.map((item) => (item.id === task.id ? updated : item))
        );
      } catch (err) {
        // Revert on failure
        setTasks((prev) =>
          prev.map((item) =>
            item.id === task.id ? { ...item, completed: task.completed } : item
          )
        );
        const message =
          err instanceof Error ? err.message : 'Unable to update task status.';
        setError(message);
      } finally {
        setMutatingId(null);
      }
    },
    [userId, isLocalPreview]
  );

  const removeTask = useCallback(
    async (taskId: string) => {
      if (!userId) return;
      setError(null);
      setMutatingId(taskId);

      const snapshot = tasks;
      setTasks((prev) => prev.filter((item) => item.id !== taskId));

      try {
        await taskService.deleteTask(taskId, userId, isLocalPreview);
      } catch (err) {
        setTasks(snapshot);
        const message =
          err instanceof Error ? err.message : 'Unable to delete task.';
        setError(message);
        throw err;
      } finally {
        setMutatingId(null);
      }
    },
    [userId, isLocalPreview, tasks]
  );

  const statistics: TaskStatistics = useMemo(() => {
    const today = getTodayISO();
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const pending = total - completed;
    const overdue = tasks.filter((t) => isOverdue(t.due_date, t.completed)).length;

    const todayTasks = tasks.filter((t) => t.due_date === today);
    const todayTotal = todayTasks.length;
    const todayCompleted = todayTasks.filter((t) => t.completed).length;

    const baseDenominator = todayTotal > 0 ? todayTotal : total;
    const baseNumerator = todayTotal > 0 ? todayCompleted : completed;
    const completionPercentage =
      baseDenominator > 0 ? Math.round((baseNumerator / baseDenominator) * 100) : 0;

    return {
      total,
      completed,
      pending,
      overdue,
      todayTotal,
      todayCompleted,
      completionPercentage,
    };
  }, [tasks]);

  const categories = useMemo(() => {
    const map = new Map<string, { total: number; pending: number; completed: number }>();
    for (const task of tasks) {
      const cat = task.category?.trim() || 'Personal';
      const current = map.get(cat) ?? { total: 0, pending: 0, completed: 0 };
      current.total += 1;
      if (task.completed) current.completed += 1;
      else current.pending += 1;
      map.set(cat, current);
    }
    return map;
  }, [tasks]);

  const filterAndSortTasks = useCallback(
    (filters: TaskFilterState): Task[] => {
      const query = filters.searchQuery.trim().toLowerCase();

      const filtered = tasks.filter((task) => {
        // 1. Sidebar section filter
        if (filters.section === 'my-day') {
          const dueToday = isToday(task.due_date);
          const overdueTask = isOverdue(task.due_date, task.completed);
          if (!dueToday && !overdueTask) return false;
        } else if (filters.section === 'upcoming') {
          if (!isUpcoming(task.due_date, task.completed)) return false;
        } else if (filters.section === 'completed') {
          if (!task.completed) return false;
        }

        // 2. Status filter (ignored when already in 'completed' section unless 'all')
        if (filters.section !== 'completed') {
          if (filters.statusFilter === 'pending' && task.completed) return false;
          if (filters.statusFilter === 'completed' && !task.completed) return false;
        }

        // 3. Priority filter
        if (
          filters.priorityFilter !== 'all' &&
          task.priority !== filters.priorityFilter
        ) {
          return false;
        }

        // 4. Category filter
        if (filters.categoryFilter !== 'all') {
          const taskCategory = task.category?.trim() || 'Personal';
          if (taskCategory !== filters.categoryFilter) return false;
        }

        // 5. Search query (title & description)
        if (query) {
          const inTitle = task.title.toLowerCase().includes(query);
          const inDescription = (task.description ?? '')
            .toLowerCase()
            .includes(query);
          if (!inTitle && !inDescription) return false;
        }

        return true;
      });

      return [...filtered].sort((a, b) => {
        if (filters.sortBy === 'due_date_asc') {
          if (!a.due_date && !b.due_date) {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          }
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return a.due_date.localeCompare(b.due_date);
        }

        if (filters.sortBy === 'due_date_desc') {
          if (!a.due_date && !b.due_date) {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          }
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return b.due_date.localeCompare(a.due_date);
        }

        if (filters.sortBy === 'priority_desc') {
          const diff = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
          if (diff !== 0) return diff;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }

        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    },
    [tasks]
  );

  return {
    tasks,
    loading,
    error,
    mutatingId,
    statistics,
    categories,
    refreshTasks: loadTasks,
    addTask,
    editTask,
    toggleTask,
    removeTask,
    filterAndSortTasks,
  };
}
