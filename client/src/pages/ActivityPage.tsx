import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Plus, Pencil, CheckCircle2, Trash2 } from 'lucide-react';
import { api } from '../lib/api';

type ActionType = 'created' | 'updated' | 'completed' | 'deleted';

interface ActivityLog {
  id: number;
  userId: number;
  action: ActionType;
  taskId: number | null;
  taskTitle: string | null;
  createdAt: string;
}

const actionConfig: Record<
  ActionType,
  { icon: typeof Plus; label: string; className: string }
> = {
  created: {
    icon: Plus,
    label: 'Created',
    className: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  },
  updated: {
    icon: Pencil,
    label: 'Updated',
    className: 'bg-sky-500/15 text-sky-700 dark:text-sky-400',
  },
  completed: {
    icon: CheckCircle2,
    label: 'Completed',
    className: 'bg-violet-500/15 text-violet-700 dark:text-violet-400',
  },
  deleted: {
    icon: Trash2,
    label: 'Deleted',
    className: 'bg-red-500/15 text-red-700 dark:text-red-400',
  },
};

export const ActivityPage = () => {
  const { data: logs = [], isLoading, error } = useQuery({
    queryKey: ['activity'],
    queryFn: async () => {
      const res = await api.get<ActivityLog[]>('/activity');
      return res.data;
    },
  });

  return (
    <section className="flex w-full flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
          Activity History
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Recent actions on your tasks
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse flex items-center gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4"
            >
              <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-3 w-1/4 rounded bg-slate-100 dark:bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="text-red-600 dark:text-red-400">Failed to load activity.</p>
      ) : logs.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-6 py-16 text-center">
          <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            No activity yet
          </p>
          <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
            When you create, update, complete, or delete tasks, they will appear here.
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* vertical line */}
          <div
            className="absolute left-5 top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-700"
            aria-hidden
          />
          <ul className="relative space-y-0">
          {logs.map((log) => {
            const config = actionConfig[log.action];
            const Icon = config.icon;
            return (
              <li
                key={log.id}
                className="relative flex items-start gap-4 py-3 first:pt-0"
              >
                <div
                  className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${config.className}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 px-4 py-3 shadow-sm">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                    <span className="capitalize">{config.label}</span>
                    {log.taskTitle && (
                      <span className="text-slate-600 dark:text-slate-400">
                        {' '}
                        &ldquo;{log.taskTitle}&rdquo;
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {formatDistanceToNow(new Date(log.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </li>
            );
          })}
          </ul>
        </div>
      )}
    </section>
  );
};
