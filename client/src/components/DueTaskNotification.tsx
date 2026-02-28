import { useState, useRef, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bell, Trash2 } from 'lucide-react';
import {
  startOfDay,
  endOfDay,
  addHours,
  isBefore,
  isAfter,
  format,
  isWithinInterval,
} from 'date-fns';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';

interface Task {
  id: number;
  title: string;
  dueDate?: string | null;
  completed: boolean;
}

const DUE_SOON_HOURS = 48;

type DueGroup = 'overdue' | 'dueToday' | 'dueSoon';

function getDueGroup(dueDate: string, now: Date): DueGroup {
  const d = new Date(dueDate);
  const startToday = startOfDay(now);
  const endToday = endOfDay(now);
  const in48h = addHours(now, DUE_SOON_HOURS);
  if (isBefore(d, startToday)) return 'overdue';
  if (isWithinInterval(d, { start: startToday, end: endToday })) return 'dueToday';
  if (isAfter(d, endToday) && (isBefore(d, in48h) || d.getTime() === in48h.getTime()))
    return 'dueSoon';
  return 'dueSoon'; // fallback for within 48h
}

function groupUrgentTasks(tasks: Task[], now: Date): { group: DueGroup; tasks: Task[] }[] {
  const overdue: Task[] = [];
  const dueToday: Task[] = [];
  const dueSoon: Task[] = [];
  for (const task of tasks) {
    if (task.completed || !task.dueDate) continue;
    const group = getDueGroup(task.dueDate, now);
    if (group === 'overdue') overdue.push(task);
    else if (group === 'dueToday') dueToday.push(task);
    else dueSoon.push(task);
  }
  const result: { group: DueGroup; tasks: Task[] }[] = [];
  if (overdue.length) result.push({ group: 'overdue', tasks: overdue });
  if (dueToday.length) result.push({ group: 'dueToday', tasks: dueToday });
  if (dueSoon.length) result.push({ group: 'dueSoon', tasks: dueSoon });
  return result;
}

const groupLabels: Record<DueGroup, string> = {
  overdue: 'Overdue',
  dueToday: 'Due Today',
  dueSoon: 'Due Soon',
};

export const DueTaskNotification = () => {
  const token = useAuthStore((s) => s.token);
  const [open, setOpen] = useState(false);
  const [clearedTaskIds, setClearedTaskIds] = useState<Set<number>>(() => new Set());
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await api.get<Task[]>('/tasks');
      return res.data;
    },
    enabled: !!token,
  });

  const grouped = useMemo(
    () => groupUrgentTasks(tasks, new Date()),
    [tasks]
  );
  const effectiveGrouped = useMemo(
    () =>
      grouped
        .map(({ group, tasks: groupTasks }) => ({
          group,
          tasks: groupTasks.filter((t) => !clearedTaskIds.has(t.id)),
        }))
        .filter((g) => g.tasks.length > 0),
    [grouped, clearedTaskIds]
  );
  const effectiveCount = useMemo(
    () => effectiveGrouped.reduce((n, g) => n + g.tasks.length, 0),
    [effectiveGrouped]
  );

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        panelRef.current?.contains(target) ||
        buttonRef.current?.contains(target)
      )
        return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  if (!token) return null;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition hover:bg-slate-200 dark:hover:bg-slate-700"
        aria-label={
          effectiveCount > 0
            ? `${effectiveCount} due or overdue tasks`
            : 'Due task notifications'
        }
      >
        <Bell className="h-4 w-4" />
        {effectiveCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {effectiveCount > 99 ? '99+' : effectiveCount}
          </span>
        )}
      </button>
      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-full z-30 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl"
          role="dialog"
          aria-label="Due tasks"
        >
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-3 py-2">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                Due tasks
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {effectiveCount === 0
                  ? 'No urgent tasks'
                  : `${effectiveCount} task${effectiveCount !== 1 ? 's' : ''} need attention`}
              </p>
            </div>
            {effectiveCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  const ids = new Set(effectiveGrouped.flatMap((g) => g.tasks.map((t) => t.id)));
                  setClearedTaskIds((prev) => new Set([...prev, ...ids]));
                }}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 transition"
                aria-label="Clear all notifications"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto py-2">
            {effectiveGrouped.length === 0 ? (
              <p className="px-3 py-4 text-center text-sm text-slate-500 dark:text-slate-400">
                {grouped.length === 0
                  ? 'No overdue or due soon tasks'
                  : 'All cleared'}
              </p>
            ) : (
              <ul className="space-y-4">
                {effectiveGrouped.map(({ group, tasks: groupTasks }) => (
                  <li key={group}>
                    <p
                      className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                        group === 'overdue'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {groupLabels[group]}
                    </p>
                    <ul className="mt-0.5 space-y-0.5">
                      {groupTasks.map((task) => (
                        <li
                          key={task.id}
                          className={`border-l-2 px-3 py-1.5 text-sm ${
                            group === 'overdue'
                              ? 'border-red-500 bg-red-500/5 dark:bg-red-500/10 text-slate-800 dark:text-slate-200'
                              : 'border-transparent text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span className="block truncate font-medium">
                            {task.title}
                          </span>
                          {task.dueDate && (
                            <span
                              className={`block truncate text-xs ${
                                group === 'overdue'
                                  ? 'text-red-600 dark:text-red-400'
                                  : 'text-slate-500 dark:text-slate-400'
                              }`}
                            >
                              {format(
                                new Date(task.dueDate),
                                group === 'dueToday' ? 'h:mm a' : 'MMM d, h:mm a'
                              )}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
