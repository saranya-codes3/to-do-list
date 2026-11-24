import { Check, Pencil, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import type { Task, TaskPriority } from '../types/task';
import { formatDueDate, formatTimestamp, isOverdue } from '../utils/dateUtils';

interface TaskCardProps {
  task: Task;
  isMutating?: boolean;
  onToggle: (task: Task) => void;
  onEdit: (task: Task) => void;
  onRequestDelete: (task: Task) => void;
}

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  high: 'High priority',
  medium: 'Medium priority',
  low: 'Low priority',
};

export default function TaskCard({
  task,
  isMutating = false,
  onToggle,
  onEdit,
  onRequestDelete,
}: TaskCardProps) {
  const overdue = isOverdue(task.due_date, task.completed);
  const categoryLabel = task.category?.trim() || 'Personal';
  const dueDateLabel = formatDueDate(task.due_date);
  const createdLabel = formatTimestamp(task.created_at);

  return (
    <motion.article
      layout="position"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className={`group rounded-2xl border px-4 py-3.5 sm:px-5 sm:py-4 transition-colors duration-150 ${
        task.completed
          ? 'bg-[#FAF7F0]/70 dark:bg-[#191E1A]/80 border-[#EDE5D8]/70 dark:border-[#242C26]'
          : 'bg-[#FFFDF9] dark:bg-[#1E2420] border-[#EDE5D8] dark:border-[#2B342E] hover:border-[#A3B18A]/70 dark:hover:border-[#A3B18A]/50'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Completion toggle button (40px touch target) */}
        <button
          type="button"
          onClick={() => onToggle(task)}
          disabled={isMutating}
          aria-label={
            task.completed
              ? `Mark "${task.title}" as pending`
              : `Mark "${task.title}" as completed`
          }
          aria-pressed={task.completed}
          className="w-10 h-10 -ml-2 -mt-1.5 flex items-center justify-center rounded-xl shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#344E41] dark:focus-visible:ring-[#A3B18A] disabled:opacity-50"
        >
          <span
            className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-150 ${
              task.completed
                ? 'bg-[#344E41] dark:bg-[#A3B18A] border-[#344E41] dark:border-[#A3B18A] text-[#FFFDF9] dark:text-[#161A17]'
                : 'border-[#A3B18A] dark:border-[#5D6B5F] bg-transparent group-hover:border-[#344E41] dark:group-hover:border-[#A3B18A]'
            }`}
          >
            {task.completed && <Check className="w-3 h-3" strokeWidth={2.75} />}
          </span>
        </button>

        {/* Task body */}
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-start justify-between gap-3">
            <button
              type="button"
              onClick={() => onEdit(task)}
              className={`text-left text-[15px] font-medium leading-snug transition-colors focus-visible:outline-none focus-visible:underline ${
                task.completed
                  ? 'line-through text-[#848D84] dark:text-[#7A857C]'
                  : 'text-[#262A26] dark:text-[#F4F0E8] hover:text-[#344E41] dark:hover:text-[#A3B18A]'
              }`}
            >
              {task.title}
            </button>

            {/* Row actions */}
            <div className="flex items-center gap-1 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition-opacity duration-150">
              <button
                type="button"
                onClick={() => onEdit(task)}
                aria-label={`Edit "${task.title}"`}
                className="p-2 rounded-lg text-[#6B7268] dark:text-[#9CA89E] hover:text-[#344E41] dark:hover:text-[#F4F0E8] hover:bg-[#EDE5D8]/60 dark:hover:bg-[#2B342E] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#344E41]"
              >
                <Pencil className="w-3.5 h-3.5" strokeWidth={1.75} />
              </button>
              <button
                type="button"
                onClick={() => onRequestDelete(task)}
                aria-label={`Delete "${task.title}"`}
                className="p-2 rounded-lg text-[#6B7268] dark:text-[#9CA89E] hover:text-[#9B4D42] dark:hover:text-[#E8CFC8] hover:bg-[#E8CFC8]/35 dark:hover:bg-[#3A2825] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9B4D42]"
              >
                <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
              </button>
            </div>
          </div>

          {task.description && (
            <p
              className={`text-sm leading-relaxed mt-1.5 break-words ${
                task.completed
                  ? 'text-[#969F96] dark:text-[#6D776F]'
                  : 'text-[#5C645C] dark:text-[#AAB5AC]'
              }`}
            >
              {task.description}
            </p>
          )}

          {/* Clean unboxed inline metadata */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2.5 text-xs text-[#6B7268] dark:text-[#929E94]">
            <span>{categoryLabel}</span>
            <span aria-hidden="true">·</span>
            <span
              className={
                task.priority === 'high' && !task.completed
                  ? 'font-semibold text-[#8E4A40] dark:text-[#E8CFC8]'
                  : ''
              }
            >
              {PRIORITY_LABEL[task.priority]}
            </span>
            <span aria-hidden="true">·</span>
            <span
              className={`tabular-nums ${
                overdue
                  ? 'font-semibold text-[#9B4D42] dark:text-[#E8CFC8]'
                  : ''
              }`}
            >
              {overdue ? `Overdue (${dueDateLabel})` : dueDateLabel}
            </span>
            {createdLabel && (
              <>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums text-[#848D84] dark:text-[#7A857C]">
                  Added {createdLabel}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
