import type { TaskStatistics } from '../types/task';

interface StatisticsProps {
  stats: TaskStatistics;
  loading?: boolean;
}

export default function Statistics({ stats, loading = false }: StatisticsProps) {
  const progressLabel =
    stats.todayTotal > 0
      ? `${stats.todayCompleted} of ${stats.todayTotal} due today`
      : `${stats.completed} of ${stats.total} overall`;

  const metrics = [
    {
      label: 'Total Tasks',
      value: stats.total,
      note: 'In workspace',
      tone: 'text-[#262A26] dark:text-[#F4F0E8]',
    },
    {
      label: 'Completed',
      value: stats.completed,
      note: 'Finished',
      tone: 'text-[#344E41] dark:text-[#A3B18A]',
    },
    {
      label: 'Pending',
      value: stats.pending,
      note: 'Remaining',
      tone: 'text-[#525A52] dark:text-[#D8DDD8]',
    },
    {
      label: 'Overdue',
      value: stats.overdue,
      note: stats.overdue > 0 ? 'Needs attention' : 'On track',
      tone:
        stats.overdue > 0
          ? 'text-[#9B4D42] dark:text-[#E8CFC8]'
          : 'text-[#6B7268] dark:text-[#9CA89E]',
    },
  ];

  return (
    <section aria-label="Daily productivity progress" className="space-y-4">
      {/* Daily Progress Bar */}
      <div className="bg-[#FFFDF9] dark:bg-[#1E2420] border border-[#EDE5D8] dark:border-[#2B342E] rounded-2xl p-5">
        <div className="flex items-baseline justify-between gap-4 mb-3">
          <div>
            <h2 className="font-display text-base font-medium text-[#262A26] dark:text-[#F4F0E8]">
              Daily Progress
            </h2>
            <p className="text-xs text-[#6B7268] dark:text-[#9CA89E] tabular-nums mt-0.5">
              {loading ? 'Calculating progress...' : progressLabel}
            </p>
          </div>
          <span className="font-display text-2xl font-medium text-[#344E41] dark:text-[#A3B18A] tabular-nums">
            {loading ? '—' : `${stats.completionPercentage}%`}
          </span>
        </div>

        <div
          className="w-full h-2.5 rounded-full bg-[#EDE5D8] dark:bg-[#2B342E] overflow-hidden"
          role="progressbar"
          aria-valuenow={stats.completionPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-[#344E41] dark:bg-[#A3B18A] transition-all duration-300 ease-out"
            style={{ width: `${stats.completionPercentage}%` }}
          />
        </div>
      </div>

      {/* 4-column metric strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="bg-[#FFFDF9] dark:bg-[#1E2420] border border-[#EDE5D8] dark:border-[#2B342E] rounded-2xl px-4 py-4"
          >
            <p className="text-xs font-medium text-[#6B7268] dark:text-[#9CA89E]">
              {metric.label}
            </p>
            <p
              className={`font-display text-2xl sm:text-[1.75rem] font-medium tabular-nums mt-1 ${metric.tone}`}
            >
              {loading ? '—' : metric.value}
            </p>
            <p className="text-[11px] text-[#848D84] dark:text-[#7E8980] mt-1">
              {metric.note}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
