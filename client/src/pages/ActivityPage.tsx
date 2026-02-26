import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow, format } from 'date-fns';
import { Plus, Pencil, CheckCircle2, Trash2, ChevronDown, Calendar, FileText } from 'lucide-react';
import { api } from '../lib/api';

type ActionType = 'created' | 'updated' | 'completed' | 'deleted';

interface ActivityLog {
  id: number;
  userId: number;
  action: ActionType;
  taskId: number | null;
  taskTitle: string | null;
  taskDescription: string | null;
  taskDueDate: string | null;
  taskCompleted: boolean | null;
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
  const [expandedId, setExpandedId] = useState<number | null>(null);

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
          Click an item to view task details
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
          <div
            className="absolute left-5 top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-700"
            aria-hidden
          />
          <ul className="relative space-y-0">
            {logs.map((log) => {
              const config = actionConfig[log.action];
              const Icon = config.icon;
              const isExpanded = expandedId === log.id;
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
                  <div className="min-w-0 flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setExpandedId((id) => (id === log.id ? null : log.id))}
                      className="w-full text-left px-4 py-3 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 rounded-xl"
                      aria-controls={`activity-details-${log.id}`}
                      id={`activity-summary-${log.id}`}
                    >
                      <div className="min-w-0">
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
                      <motion.span
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="shrink-0 text-slate-400 dark:text-slate-500"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </motion.span>
                    </button>
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          id={`activity-details-${log.id}`}
                          role="region"
                          aria-labelledby={`activity-summary-${log.id}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/40 px-4 py-3 space-y-3">
                            <div className="grid gap-2 text-sm sm:grid-cols-2">
                              <div>
                                <span className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                  Action
                                </span>
                                <p className="mt-0.5 font-medium text-slate-800 dark:text-slate-200 capitalize">
                                  {config.label}
                                </p>
                              </div>
                              <div>
                                <span className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                  Time
                                </span>
                                <p className="mt-0.5 text-slate-700 dark:text-slate-300">
                                  {format(new Date(log.createdAt), 'PPp')}
                                </p>
                              </div>
                            </div>
                            {log.taskTitle && (
                              <div>
                                <span className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                  Title
                                </span>
                                <p className="mt-0.5 text-slate-800 dark:text-slate-100 font-medium">
                                  {log.taskTitle}
                                </p>
                              </div>
                            )}
                            {log.taskDescription != null && log.taskDescription !== '' && (
                              <div>
                                <span className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                  <FileText className="h-3 w-3" />
                                  Description
                                </span>
                                <p className="mt-0.5 text-slate-700 dark:text-slate-300 text-sm whitespace-pre-wrap">
                                  {log.taskDescription}
                                </p>
                              </div>
                            )}
                            {log.taskDueDate && (
                              <div>
                                <span className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                  <Calendar className="h-3 w-3" />
                                  Due date
                                </span>
                                <p className="mt-0.5 text-slate-700 dark:text-slate-300">
                                  {format(new Date(log.taskDueDate), 'PPP')}
                                </p>
                              </div>
                            )}
                            {log.taskCompleted != null && (
                              <div>
                                <span className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                  Status
                                </span>
                                <p className="mt-0.5">
                                  <span
                                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                                      log.taskCompleted
                                        ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                                        : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300'
                                    }`}
                                  >
                                    {log.taskCompleted ? (
                                      <>
                                        <CheckCircle2 className="h-3 w-3" />
                                        Completed
                                      </>
                                    ) : (
                                      'Not completed'
                                    )}
                                  </span>
                                </p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
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
