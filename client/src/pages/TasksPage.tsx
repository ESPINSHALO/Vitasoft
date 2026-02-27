import { useState, useMemo, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { formatDistanceToNow, formatDistanceStrict, isPast, differenceInHours, startOfDay, isBefore } from 'date-fns';
import {
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  List,
  Pencil,
  Trash2,
  CheckCircle2,
  Circle,
  Flag,
  Calendar,
  AlertCircle,
  Clock,
  Copy,
  ListTodo,
} from 'lucide-react';
import { api } from '../lib/api';
import { SummaryCard } from '../components/SummaryCard';

type Priority = 'low' | 'medium' | 'high';
type FilterStatus = 'all' | 'active' | 'completed';
type SortBy = 'date' | 'priority' | 'title';
type ViewMode = 'grid' | 'list';

interface Task {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: string;
  dueDate?: string | null;
  priority?: Priority;
}

interface TaskFormValues {
  title: string;
  description: string;
  priority: Priority;
  dueDate: string;
}

const DUE_SOON_HOURS = 48;

function getDueDateStatus(dueDate: string | null | undefined, completed: boolean): { status: 'overdue' | 'due_soon' | 'ok'; label: string } | null {
  if (!dueDate || completed) return null;
  const date = new Date(dueDate);
  if (Number.isNaN(date.getTime())) return null;
  const now = new Date();
  if (isPast(date)) {
    return { status: 'overdue', label: 'Overdue' };
  }
  const hoursLeft = differenceInHours(date, now);
  if (hoursLeft <= DUE_SOON_HOURS) {
    return { status: 'due_soon', label: 'Due soon' };
  }
  return { status: 'ok', label: formatDistanceStrict(now, date, { addSuffix: true }) };
}

const priorityColors: Record<Priority, string> = {
  low: 'bg-emerald-500/80 text-emerald-950',
  medium: 'bg-amber-400/80 text-amber-950',
  high: 'bg-red-500/80 text-red-950',
};

const priorityBorder: Record<Priority, string> = {
  low: 'border-l-emerald-500',
  medium: 'border-l-amber-500',
  high: 'border-l-red-500',
};

const priorityOrder: Record<Priority, number> = { low: 0, medium: 1, high: 2 };

const SIMILARITY_WORD_OVERLAP_THRESHOLD = 0.6;

function normalizeTitle(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, ' ');
}

function areTitlesSimilar(newTitle: string, existingTitle: string): boolean {
  const a = normalizeTitle(newTitle);
  const b = normalizeTitle(existingTitle);
  if (!a) return false;
  if (a === b) return true;
  if (a.length >= 2 && b.length >= 2 && (a.includes(b) || b.includes(a))) return true;
  const wordsA = a.split(' ').filter(Boolean);
  const wordsB = b.split(' ').filter(Boolean);
  if (wordsA.length === 0 || wordsB.length === 0) return false;
  const matchCount = wordsA.filter((w) => wordsB.includes(w)).length;
  const ratio = matchCount / Math.min(wordsA.length, wordsB.length);
  return ratio >= SIMILARITY_WORD_OVERLAP_THRESHOLD;
}

function findSimilarTasks(newTitle: string, tasks: Task[]): Task[] {
  const normalized = normalizeTitle(newTitle);
  if (!normalized) return [];
  return tasks.filter((task) => areTitlesSimilar(newTitle, task.title));
}

export const TasksPage = () => {
  const queryClient = useQueryClient();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDuplicateWarningOpen, setIsDuplicateWarningOpen] = useState(false);
  const [pendingCreateValues, setPendingCreateValues] = useState<TaskFormValues | null>(null);
  const [similarTasksForWarning, setSimilarTasksForWarning] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [formValues, setFormValues] = useState<TaskFormValues>({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const { data, isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await api.get<Task[]>('/tasks');
      return res.data;
    },
  });

  const createMutation = useMutation<Task, unknown, TaskFormValues, { previousTasks: Task[] }>({
    mutationFn: async (values) => {
      const res = await api.post<Task>('/tasks', {
        title: values.title,
        description: values.description || null,
        priority: values.priority,
        dueDate: values.dueDate ? values.dueDate : null,
      });
      return res.data;
    },
    onMutate: async (values) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks']) ?? [];

      const optimisticTask: Task = {
        id: Date.now(),
        title: values.title,
        description: values.description || null,
        completed: false,
        createdAt: new Date().toISOString(),
        dueDate: values.dueDate || null,
        priority: values.priority,
      };

      queryClient.setQueryData<Task[]>(['tasks'], [...previousTasks, optimisticTask]);

      return { previousTasks };
    },
    onError: (_err, _values, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData<Task[]>(['tasks'], context.previousTasks);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['tasks'] });
      void queryClient.invalidateQueries({ queryKey: ['activity'] });
    },
  });

  const updateMutation = useMutation<
    void,
    unknown,
    { id: number; values: Partial<TaskFormValues> & { completed?: boolean; dueDate?: string } },
    { previousTasks: Task[] }
  >({
    mutationFn: async ({ id, values }) => {
      const payload: Record<string, unknown> = {};
      if (values.title !== undefined) payload.title = values.title;
      if (values.description !== undefined) payload.description = values.description;
      if (values.completed !== undefined) payload.completed = values.completed;
      if (values.priority !== undefined) payload.priority = values.priority;
      if (values.dueDate !== undefined) payload.dueDate = values.dueDate || null;
      await api.put(`/tasks/${id}`, payload);
    },
    onMutate: async ({ id, values }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks']) ?? [];

      const nextTasks = previousTasks.map((task) =>
        task.id === id
          ? {
              ...task,
              title: values.title ?? task.title,
              description:
                values.description !== undefined ? values.description : task.description,
              completed:
                values.completed !== undefined ? values.completed : task.completed,
              priority: values.priority ?? task.priority,
              dueDate: values.dueDate !== undefined ? (values.dueDate || null) : task.dueDate,
            }
          : task,
      );

      queryClient.setQueryData<Task[]>(['tasks'], nextTasks);

      return { previousTasks };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData<Task[]>(['tasks'], context.previousTasks);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['tasks'] });
      void queryClient.invalidateQueries({ queryKey: ['activity'] });
    },
  });

  const deleteMutation = useMutation<void, unknown, Task, { previousTasks: Task[] }>({
    mutationFn: async (task) => {
      await api.delete(`/tasks/${task.id}`);
    },
    onMutate: async (task) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks']) ?? [];
      const nextTasks = previousTasks.filter((t) => t.id !== task.id);
      queryClient.setQueryData<Task[]>(['tasks'], nextTasks);
      return { previousTasks };
    },
    onError: (_err, _task, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData<Task[]>(['tasks'], context.previousTasks);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['tasks'] });
      void queryClient.invalidateQueries({ queryKey: ['activity'] });
    },
  });

  const toggleMutation = useMutation<void, unknown, Task, { previousTasks: Task[] }>({
    mutationFn: async (task: Task) => {
      const payload = { completed: !task.completed };
      await api.put(`/tasks/${task.id}`, payload);
    },
    onMutate: async (task) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks']) ?? [];
      const nextTasks = previousTasks.map((t) =>
        t.id === task.id ? { ...t, completed: !t.completed } : t,
      );
      queryClient.setQueryData<Task[]>(['tasks'], nextTasks);
      return { previousTasks };
    },
    onError: (_err, _task, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData<Task[]>(['tasks'], context.previousTasks);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['tasks'] });
      void queryClient.invalidateQueries({ queryKey: ['activity'] });
    },
  });

  const handleToggle = (task: Task) => {
    toggleMutation.mutate(task);
  };

  const openAddModal = () => {
    setFormValues({ title: '', description: '', priority: 'medium', dueDate: '' });
    setActiveTask(null);
    setIsAddOpen(true);
  };

  const openEditModal = (task: Task) => {
    setActiveTask(task);
    const dueDateValue = task.dueDate
      ? new Date(task.dueDate).toISOString().slice(0, 10)
      : '';
    setFormValues({
      title: task.title,
      description: task.description ?? '',
      priority: task.priority ?? 'medium',
      dueDate: dueDateValue,
    });
    setIsEditOpen(true);
  };

  const openDeleteModal = (task: Task) => {
    setActiveTask(task);
    setIsDeleteOpen(true);
  };

  const handleFormChange = (field: keyof TaskFormValues, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: field === 'priority' ? (value as Priority) : value,
    }));
  };

  const isDueDateValid = (value: string): boolean => {
    if (!value.trim()) return true;
    const date = new Date(value);
    return !Number.isNaN(date.getTime());
  };

  const handleCreateSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formValues.title.trim()) return;
    if (!isDueDateValid(formValues.dueDate)) return;
    const tasks = queryClient.getQueryData<Task[]>(['tasks']) ?? [];
    const similar = findSimilarTasks(formValues.title, tasks);
    if (similar.length > 0) {
      setPendingCreateValues({ ...formValues });
      setSimilarTasksForWarning(similar);
      setIsDuplicateWarningOpen(true);
      return;
    }
    doCreateTask(formValues);
  };

  const doCreateTask = (values: TaskFormValues) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        setIsAddOpen(false);
        setIsDuplicateWarningOpen(false);
        setPendingCreateValues(null);
        setSimilarTasksForWarning([]);
        toast.success('Task created');
      },
      onError: () => toast.error('Failed to create task'),
    });
  };

  const handleCreateAnyway = () => {
    if (!pendingCreateValues) return;
    doCreateTask(pendingCreateValues);
  };

  const handleCancelDuplicateWarning = () => {
    setIsDuplicateWarningOpen(false);
    setPendingCreateValues(null);
    setSimilarTasksForWarning([]);
  };

  const handleEditSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!activeTask) return;
    if (!formValues.title.trim()) return;
    if (!isDueDateValid(formValues.dueDate)) return;
    updateMutation.mutate(
      {
        id: activeTask.id,
        values: {
          title: formValues.title,
          description: formValues.description,
          priority: formValues.priority,
          dueDate: formValues.dueDate,
        },
      },
      {
        onSuccess: () => {
          setIsEditOpen(false);
          toast.success('Task updated');
        },
        onError: () => toast.error('Failed to update task'),
      },
    );
  };

  const handleConfirmDelete = () => {
    if (!activeTask) return;
    deleteMutation.mutate(activeTask, {
      onSuccess: () => {
        setIsDeleteOpen(false);
        toast.success('Task deleted');
      },
      onError: () => toast.error('Failed to delete task'),
    });
  };

  const rawTasks = useMemo(() => data ?? [], [data]);

  const taskSummary = useMemo(() => {
    const total = rawTasks.length;
    const completed = rawTasks.filter((t) => t.completed).length;
    const pending = rawTasks.filter((t) => !t.completed).length;
    const todayStart = startOfDay(new Date());
    const overdue = rawTasks.filter((t) => {
      if (t.completed || !t.dueDate) return false;
      const due = new Date(t.dueDate);
      if (Number.isNaN(due.getTime())) return false;
      return isBefore(due, todayStart);
    }).length;
    return { total, completed, pending, overdue };
  }, [rawTasks]);

  const filteredAndSortedTasks = useMemo(() => {
    let list = rawTasks.filter((task) => {
      const matchSearch =
        !searchQuery.trim() ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const matchStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && !task.completed) ||
        (filterStatus === 'completed' && task.completed);
      return matchSearch && matchStatus;
    });
    const p = (t: Task) => priorityOrder[t.priority ?? 'medium'];
    if (sortBy === 'date') list = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (sortBy === 'priority') list = [...list].sort((a, b) => p(b) - p(a));
    if (sortBy === 'title') list = [...list].sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));
    return list;
  }, [rawTasks, searchQuery, filterStatus, sortBy]);

  return (
    <section className="flex w-full flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Total tasks"
          count={taskSummary.total}
          icon={ListTodo}
          variant="neutral"
        />
        <SummaryCard
          label="Completed"
          count={taskSummary.completed}
          icon={CheckCircle2}
          variant="completed"
        />
        <SummaryCard
          label="Pending"
          count={taskSummary.pending}
          icon={Circle}
          variant="pending"
        />
        <SummaryCard
          label="Overdue"
          count={taskSummary.overdue}
          icon={AlertCircle}
          variant="overdue"
        />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Tasks</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {filteredAndSortedTasks.length} of {rawTasks.length} task{rawTasks.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:from-sky-600 hover:to-indigo-600"
        >
          <Plus className="h-4 w-4" />
          Add task
        </button>
      </div>

      {/* Toolbar: search, filter, sort, view */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-3 shadow-sm">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500 dark:text-slate-400 shrink-0" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:border-sky-500 outline-none"
            aria-label="Filter tasks by status"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-slate-500 dark:text-slate-400 shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:border-sky-500 outline-none"
            aria-label="Sort tasks"
          >
            <option value="date">Newest first</option>
            <option value="priority">Priority</option>
            <option value="title">Title A–Z</option>
          </select>
        </div>
        <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-100 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`rounded-md p-2 transition ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow text-sky-600 dark:text-sky-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            title="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`rounded-md p-2 transition ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow text-sky-600 dark:text-sky-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            title="List view"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="animate-pulse rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/70 p-4"
            >
              <div className="mb-3 h-4 w-2/3 rounded bg-slate-300 dark:bg-slate-700" />
              <div className="mb-2 h-3 w-full rounded bg-slate-200 dark:bg-slate-800" />
              <div className="mb-4 h-3 w-5/6 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="flex justify-between">
                <div className="h-4 w-20 rounded-full bg-slate-200 dark:bg-slate-800" />
                <div className="h-4 w-16 rounded-full bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="text-red-600 dark:text-red-400">Failed to load tasks.</p>
      ) : rawTasks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-1 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-6 py-16 text-center"
        >
          <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">No tasks yet</p>
          <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
            Create your first task with the button above. Add a title, description, and priority.
          </p>
          <button type="button" onClick={openAddModal} className="mt-4 rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600">
            Add task
          </button>
        </motion.div>
      ) : filteredAndSortedTasks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 px-6 py-12 text-center"
        >
          <p className="font-medium text-slate-700 dark:text-slate-200">No tasks match your filters</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Try changing search, filter, or sort.</p>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <motion.ul
            layout
            initial={false}
            className={viewMode === 'grid' ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3' : 'flex flex-col gap-3'}
          >
            {filteredAndSortedTasks.map((task, index) => {
              const priority: Priority = task.priority ?? 'medium';
              const priorityLabel = priority.charAt(0).toUpperCase() + priority.slice(1);

              const cardContent = (
                <>
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleToggle(task)}
                      className="shrink-0 mt-0.5 rounded-full p-0.5 transition hover:bg-slate-200 dark:hover:bg-slate-700"
                      title={task.completed ? 'Mark incomplete' : 'Mark done'}
                    >
                      {task.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-semibold text-slate-900 dark:text-slate-50 ${task.completed ? 'line-through opacity-70' : ''}`}>
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold ${priorityColors[priority]}`}>
                          <Flag className="h-3 w-3" />
                          {priorityLabel}
                        </span>
                        {task.dueDate && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                            <Calendar className="h-3 w-3" />
                            {new Date(task.dueDate).toLocaleDateString(undefined, { dateStyle: 'short' })}
                          </span>
                        )}
                        {(() => {
                          const dueStatus = getDueDateStatus(task.dueDate, task.completed);
                          if (!dueStatus) return null;
                          if (dueStatus.status === 'overdue') {
                            return (
                              <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium bg-red-500/20 text-red-700 dark:text-red-400">
                                <AlertCircle className="h-3 w-3" />
                                {dueStatus.label}
                              </span>
                            );
                          }
                          if (dueStatus.status === 'due_soon') {
                            return (
                              <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium bg-amber-500/20 text-amber-700 dark:text-amber-400">
                                <Clock className="h-3 w-3" />
                                {dueStatus.label}
                              </span>
                            );
                          }
                          return (
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              {dueStatus.label}
                            </span>
                          );
                        })()}
                        <span className="text-[11px] text-slate-500 dark:text-slate-500">
                          {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 shrink-0 ${viewMode === 'grid' ? 'mt-3 self-end' : ''}`}>
                    <button
                      type="button"
                      onClick={() => openEditModal(task)}
                      className="rounded-lg p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 transition"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openDeleteModal(task)}
                      className="rounded-lg p-2 text-slate-500 dark:text-slate-400 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </>
              );

              return (
                <motion.li
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                  className={`flex rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-sm hover:shadow-md transition-shadow border-l-4 ${priorityBorder[priority]} ${viewMode === 'list' ? 'flex-row items-center justify-between gap-4 px-4 py-3' : 'flex-col p-4'}`}
                >
                  {cardContent}
                </motion.li>
              );
            })}
          </motion.ul>
        </AnimatePresence>
      )}

      {/* Add / Edit modals */}
      <AnimatePresence>
        {(isAddOpen || isEditOpen) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/95 p-6 shadow-xl"
            >
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                {isEditOpen ? 'Edit task' : 'Add task'}
              </h3>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                {isEditOpen
                  ? 'Update the details for this task.'
                  : 'Create a new task to track.'}
              </p>

              <form
                onSubmit={isEditOpen ? handleEditSubmit : handleCreateSubmit}
                className="mt-4 space-y-4"
              >
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-200" htmlFor="title">
                    Title
                  </label>
                  <input
                    id="title"
                    value={formValues.title}
                    onChange={(e) => handleFormChange('title', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-50 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <div className="space-y-1">
                  <label
                    className="block text-xs font-medium text-slate-700 dark:text-slate-200"
                    htmlFor="description"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    value={formValues.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    className="w-full resize-none rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-50 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-200" htmlFor="priority">
                    Priority
                  </label>
                  <select
                    id="priority"
                    value={formValues.priority}
                    onChange={(e) => handleFormChange('priority', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-50 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-200" htmlFor="dueDate">
                    Due date
                  </label>
                  <input
                    id="dueDate"
                    type="date"
                    value={formValues.dueDate}
                    onChange={(e) => handleFormChange('dueDate', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-50 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-500"
                  />
                  {formValues.dueDate && !isDueDateValid(formValues.dueDate) && (
                    <p className="text-xs text-red-600 dark:text-red-400">Please enter a valid date.</p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddOpen(false);
                      setIsEditOpen(false);
                    }}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-sky-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-sky-400"
                  >
                    {isEditOpen ? 'Save changes' : 'Create task'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirmation dialog */}
      <AnimatePresence>
        {isDeleteOpen && activeTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-sm rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/95 p-6 shadow-xl"
            >
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Delete task</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Are you sure you want to delete{' '}
                <span className="font-semibold">{activeTask.title}</span>? This action cannot be
                undone.
              </p>
              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteOpen(false)}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="rounded-lg bg-red-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-red-400"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Duplicate task warning */}
      <AnimatePresence>
        {isDuplicateWarningOpen && pendingCreateValues && similarTasksForWarning.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/95 p-6 shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  <Copy className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                    Similar tasks found
                  </h3>
                  <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
                    These tasks look similar to &ldquo;{pendingCreateValues.title}&rdquo;
                  </p>
                </div>
              </div>
              <ul className="mt-4 max-h-40 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 py-2 px-3 space-y-1">
                {similarTasksForWarning.map((task) => (
                  <li
                    key={task.id}
                    className="text-sm text-slate-700 dark:text-slate-300 truncate"
                    title={task.title}
                  >
                    {task.title}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                Create anyway or cancel to edit your title.
              </p>
              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCancelDuplicateWarning}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateAnyway}
                  className="rounded-lg bg-sky-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-sky-400"
                >
                  Create anyway
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

