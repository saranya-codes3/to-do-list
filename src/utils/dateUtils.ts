export const DEFAULT_CATEGORIES = [
  'Personal',
  'Work',
  'Wellness',
  'Creative',
  'Home',
  'Errands',
] as const;

export function getTodayISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTomorrowISO(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isToday(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return dateStr === getTodayISO();
}

export function isOverdue(dateStr: string | null, completed: boolean): boolean {
  if (!dateStr || completed) return false;
  return dateStr < getTodayISO();
}

export function isUpcoming(dateStr: string | null, completed: boolean): boolean {
  if (!dateStr || completed) return false;
  return dateStr > getTodayISO();
}

export function formatDueDate(dateStr: string | null): string {
  if (!dateStr) return 'No due date';
  const today = getTodayISO();
  const tomorrow = getTomorrowISO();

  if (dateStr === today) return 'Today';
  if (dateStr === tomorrow) return 'Tomorrow';

  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}

export function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function formatFullCurrentDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getGreeting(name?: string): string {
  const hour = new Date().getHours();
  let prefix = 'Good evening';
  if (hour < 12) prefix = 'Good morning';
  else if (hour < 17) prefix = 'Good afternoon';

  if (name && name.trim().length > 0) {
    const firstName = name.trim().split(/\s+/)[0];
    return `${prefix}, ${firstName}`;
  }
  return prefix;
}

const DAILY_QUOTES: Array<{ text: string; author: string }> = [
  {
    text: 'Small steps taken consistently reshape an entire season.',
    author: 'little.day',
  },
  {
    text: 'Do one thing with quiet attention before reaching for the next.',
    author: 'little.day',
  },
  {
    text: 'Clarity arrives not when everything is done, but when the right thing is chosen.',
    author: 'little.day',
  },
  {
    text: 'Gentle discipline outperforms frantic urgency every single week.',
    author: 'little.day',
  },
  {
    text: 'Leave enough margin in your day to notice what you actually completed.',
    author: 'little.day',
  },
  {
    text: 'A calm list is a promise you keep with yourself.',
    author: 'little.day',
  },
  {
    text: 'Begin where your hands are; momentum follows simple beginnings.',
    author: 'little.day',
  },
];

export function getDailyQuote(): { text: string; author: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  return DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];
}
