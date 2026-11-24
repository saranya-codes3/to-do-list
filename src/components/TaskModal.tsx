import { useEffect, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { motion } from 'motion/react';
import type { CreateTaskInput, Task, TaskPriority } from '../types/task';
import {
  DEFAULT_CATEGORIES,
  formatTimestamp,
  getTodayISO,
  getTomorrowISO,
} from '../utils/dateUtils';

interface TaskModalProps {
  isOpen: boolean;
  editingTask: Task | null;
  availableCategories: string[];
  defaultDueDate?: string | null;
  onClose: () => void;
  onSubmit: (data: CreateTaskInput) => Promise<void>;
}

const PRIORITIES: Array<{ value: TaskPriority; label: string }> = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export default function TaskModal({
  isOpen,
  editingTask,
  availableCategories,
  defaultDueDate = null,
  onClose,
  onSubmit,
}: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Personal');
  const [customCategory, setCustomCategory] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const mergedCategories = Array.from(
    new Set([...DEFAULT_CATEGORIES, ...availableCategories])
  );

  useEffect(() => {
    if (!isOpen) return;
    setFormError(null);
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description ?? '');
      const existingCat = editingTask.category?.trim() || 'Personal';
      if (mergedCategories.includes(existingCat)) {
        setCategory(existingCat);
        setCustomCategory('');
      } else {
        setCategory('__custom__');
        setCustomCategory(existingCat);
      }
      setPriority(editingTask.priority);
      setDueDate(editingTask.due_date ?? '');
    } else {
      setTitle('');
      setDescription('');
      setCategory('Personal');
      setCustomCategory('');
      setPriority('medium');
      setDueDate(defaultDueDate ?? '');
    }
  }, [isOpen, editingTask, defaultDueDate]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setFormError('Please enter a task title.');
      return;
    }

    const resolvedCategory =
      category === '__custom__'
        ? customCategory.trim() || 'Personal'
        : category;

    setSubmitting(true);
    setFormError(null);
    try {
      await onSubmit({
        title: trimmedTitle,
        description: description.trim() || null,
        category: resolvedCategory,
        priority,
        due_date: dueDate || null,
      });
      onClose();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Unable to save task.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-heading"
    >
      <div
        className="fixed inset-0 bg-[#262A26]/35 dark:bg-black/65 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 6 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-lg rounded-2xl bg-[#FFFDF9] dark:bg-[#1E2420] border border-[#EDE5D8] dark:border-[#2B342E] shadow-xl p-6 sm:p-7"
      >
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h2
              id="task-modal-heading"
              className="font-display text-2xl font-medium text-[#262A26] dark:text-[#F4F0E8]"
            >
              {editingTask ? 'Edit Task' : 'New Task'}
            </h2>
            {editingTask && (
              <p className="text-xs text-[#757D75] dark:text-[#8E9A90] mt-1 tabular-nums">
                Created {formatTimestamp(editingTask.created_at)}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 -mr-2 -mt-1 rounded-xl text-[#6B7268] dark:text-[#9CA89E] hover:bg-[#FAF7F0] dark:hover:bg-[#2A332D] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {formError && (
          <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-[#E8CFC8]/45 dark:bg-[#3A2825] border border-[#D8B4AA] dark:border-[#5C3A35] text-xs font-medium text-[#7D362D] dark:text-[#E8CFC8]">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="task-title"
              className="block text-xs font-semibold text-[#4A544B] dark:text-[#B4BEB5] mb-1.5"
            >
              Title
            </label>
            <input
              id="task-title"
              type="text"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Water indoor plants and tidy studio"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F0] dark:bg-[#161A17] border border-[#EDE5D8] dark:border-[#2B342E] text-sm text-[#262A26] dark:text-[#F4F0E8] placeholder:text-[#8E968E] focus:outline-none focus:border-[#344E41] dark:focus:border-[#A3B18A]"
            />
          </div>

          <div>
            <label
              htmlFor="task-description"
              className="block text-xs font-semibold text-[#4A544B] dark:text-[#B4BEB5] mb-1.5"
            >
              Description
            </label>
            <textarea
              id="task-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional notes, context, or smaller steps..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F0] dark:bg-[#161A17] border border-[#EDE5D8] dark:border-[#2B342E] text-sm text-[#262A26] dark:text-[#F4F0E8] placeholder:text-[#8E968E] focus:outline-none focus:border-[#344E41] dark:focus:border-[#A3B18A] resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="task-category"
                className="block text-xs font-semibold text-[#4A544B] dark:text-[#B4BEB5] mb-1.5"
              >
                Category
              </label>
              <select
                id="task-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F0] dark:bg-[#161A17] border border-[#EDE5D8] dark:border-[#2B342E] text-sm text-[#262A26] dark:text-[#F4F0E8] focus:outline-none focus:border-[#344E41] dark:focus:border-[#A3B18A]"
              >
                {mergedCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="__custom__">+ Custom category</option>
              </select>

              {category === '__custom__' && (
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Enter category name"
                  aria-label="Custom category name"
                  className="mt-2 w-full px-3.5 py-2 rounded-xl bg-[#FAF7F0] dark:bg-[#161A17] border border-[#EDE5D8] dark:border-[#2B342E] text-sm text-[#262A26] dark:text-[#F4F0E8] focus:outline-none focus:border-[#344E41] dark:focus:border-[#A3B18A]"
                />
              )}
            </div>

            <div>
              <span className="block text-xs font-semibold text-[#4A544B] dark:text-[#B4BEB5] mb-1.5">
                Priority
              </span>
              <div
                role="group"
                aria-label="Task priority"
                className="grid grid-cols-3 p-1 rounded-xl bg-[#FAF7F0] dark:bg-[#161A17] border border-[#EDE5D8] dark:border-[#2B342E]"
              >
                {PRIORITIES.map((item) => {
                  const active = priority === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setPriority(item.value)}
                      className={`py-2 rounded-lg text-xs font-semibold transition-colors ${
                        active
                          ? 'bg-[#344E41] dark:bg-[#A3B18A] text-[#FFFDF9] dark:text-[#161A17]'
                          : 'text-[#626A62] dark:text-[#9CA89E] hover:text-[#262A26] dark:hover:text-[#F4F0E8]'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="task-due-date"
                className="block text-xs font-semibold text-[#4A544B] dark:text-[#B4BEB5]"
              >
                Due Date
              </label>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setDueDate(getTodayISO())}
                  className="text-[#344E41] dark:text-[#A3B18A] hover:underline font-medium"
                >
                  Today
                </button>
                <span className="text-[#B8B4AA]" aria-hidden="true">
                  ·
                </span>
                <button
                  type="button"
                  onClick={() => setDueDate(getTomorrowISO())}
                  className="text-[#344E41] dark:text-[#A3B18A] hover:underline font-medium"
                >
                  Tomorrow
                </button>
                {dueDate && (
                  <>
                    <span className="text-[#B8B4AA]" aria-hidden="true">
                      ·
                    </span>
                    <button
                      type="button"
                      onClick={() => setDueDate('')}
                      className="text-[#757D75] dark:text-[#8E9A90] hover:underline"
                    >
                      Clear
                    </button>
                  </>
                )}
              </div>
            </div>
            <input
              id="task-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F0] dark:bg-[#161A17] border border-[#EDE5D8] dark:border-[#2B342E] text-sm text-[#262A26] dark:text-[#F4F0E8] tabular-nums focus:outline-none focus:border-[#344E41] dark:focus:border-[#A3B18A]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EDE5D8] dark:border-[#2B342E]">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-[#525A52] dark:text-[#B3BDB5] hover:bg-[#FAF7F0] dark:hover:bg-[#2A332D] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-[#344E41] dark:bg-[#A3B18A] text-[#FFFDF9] dark:text-[#161A17] text-sm font-semibold hover:bg-[#293E33] dark:hover:bg-[#B4C19D] transition-colors disabled:opacity-60 whitespace-nowrap shrink-0"
            >
              {submitting
                ? 'Saving...'
                : editingTask
                  ? 'Save Changes'
                  : 'Add Task'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
