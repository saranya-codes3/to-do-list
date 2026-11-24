import { supabase } from '../lib/supabase';
import type { CreateTaskInput, Task, UpdateTaskInput } from '../types/task';

const LOCAL_STORAGE_KEY = 'little_day_local_tasks_v1';

function readLocalTasks(): Task[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Task[]) : [];
  } catch {
    return [];
  }
}

function writeLocalTasks(tasks: Task[]): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
}

export const taskService = {
  async fetchTasks(userId: string, isLocalPreview = false): Promise<Task[]> {
    if (isLocalPreview || !supabase) {
      return readLocalTasks().sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message || 'Unable to load tasks from Supabase.');
    }

    return (data ?? []) as Task[];
  },

  async createTask(
    userId: string,
    input: CreateTaskInput,
    isLocalPreview = false
  ): Promise<Task> {
    const cleanTitle = input.title.trim();
    if (!cleanTitle) {
      throw new Error('Task title is required.');
    }

    if (isLocalPreview || !supabase) {
      const now = new Date().toISOString();
      const newTask: Task = {
        id: crypto.randomUUID(),
        user_id: userId,
        title: cleanTitle,
        description: input.description?.trim() || null,
        category: input.category?.trim() || 'Personal',
        priority: input.priority || 'medium',
        due_date: input.due_date || null,
        completed: false,
        created_at: now,
        updated_at: now,
      };
      const existing = readLocalTasks();
      writeLocalTasks([newTask, ...existing]);
      return newTask;
    }

    const payload = {
      user_id: userId,
      title: cleanTitle,
      description: input.description?.trim() || null,
      category: input.category?.trim() || 'Personal',
      priority: input.priority || 'medium',
      due_date: input.due_date || null,
      completed: false,
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert(payload)
      .select()
      .single();

    if (error) {
      throw new Error(error.message || 'Unable to create task.');
    }

    return data as Task;
  },

  async updateTask(
    taskId: string,
    userId: string,
    updates: UpdateTaskInput,
    isLocalPreview = false
  ): Promise<Task> {
    const cleanUpdates: UpdateTaskInput = {
      ...updates,
      ...(updates.title !== undefined ? { title: updates.title.trim() } : {}),
      ...(updates.description !== undefined
        ? { description: updates.description?.trim() || null }
        : {}),
      ...(updates.category !== undefined
        ? { category: updates.category?.trim() || 'Personal' }
        : {}),
    };

    if (cleanUpdates.title !== undefined && !cleanUpdates.title) {
      throw new Error('Task title cannot be empty.');
    }

    if (isLocalPreview || !supabase) {
      const existing = readLocalTasks();
      const index = existing.findIndex((t) => t.id === taskId);
      if (index === -1) {
        throw new Error('Task not found.');
      }
      const updatedTask: Task = {
        ...existing[index],
        ...cleanUpdates,
        updated_at: new Date().toISOString(),
      };
      existing[index] = updatedTask;
      writeLocalTasks(existing);
      return updatedTask;
    }

    const { data, error } = await supabase
      .from('tasks')
      .update({
        ...cleanUpdates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message || 'Unable to update task.');
    }

    return data as Task;
  },

  async deleteTask(
    taskId: string,
    userId: string,
    isLocalPreview = false
  ): Promise<void> {
    if (isLocalPreview || !supabase) {
      const existing = readLocalTasks();
      writeLocalTasks(existing.filter((t) => t.id !== taskId));
      return;
    }

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(error.message || 'Unable to delete task.');
    }
  },

  subscribeToTasks(
    userId: string,
    onChange: () => void,
    isLocalPreview = false
  ): () => void {
    const client = supabase;
    if (isLocalPreview || !client) {
      return () => {};
    }

    const channel = client
      .channel(`tasks-realtime-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          onChange();
        }
      )
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  },
};
