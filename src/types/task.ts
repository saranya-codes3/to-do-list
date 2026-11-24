export type TaskPriority = 'low' | 'medium' | 'high';

export type NavSection =
  | 'my-day'
  | 'all'
  | 'upcoming'
  | 'completed'
  | 'categories'
  | 'settings';

export type StatusFilter = 'all' | 'pending' | 'completed';

export type SortOption =
  | 'due_date_asc'
  | 'due_date_desc'
  | 'priority_desc'
  | 'created_desc';

export interface Task {
  id: string;
  user_id: string | null;
  title: string;
  description: string | null;
  category: string | null;
  priority: TaskPriority;
  due_date: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string | null;
  category?: string | null;
  priority: TaskPriority;
  due_date?: string | null;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  category?: string | null;
  priority?: TaskPriority;
  due_date?: string | null;
  completed?: boolean;
}

export interface TaskStatistics {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  todayTotal: number;
  todayCompleted: number;
  completionPercentage: number;
}

export interface AppUser {
  id: string;
  email: string;
  fullName?: string;
  isLocalPreview?: boolean;
}
