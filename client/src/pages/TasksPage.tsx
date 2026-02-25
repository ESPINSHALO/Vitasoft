import { useState, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { api } from '../lib/api';

type Priority = 'low' | 'medium' | 'high';

interface Task {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: string;
  // Optional priority; when not present, treated as \"medium\" purely for UI coloring
  priority?: Priority;
}

interface TaskFormValues {
  title: string;
  description: string;
  priority: Priority;
}

const priorityColors: Record<Priority, string> = {
  low: 'bg-emerald-500/80',
  medium: 'bg-amber-400/80',
  high: 'bg-red-500/80',
};

export const TasksPage = () => {
  const queryClient = useQueryClient();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [formValues, setFormValues] = useState<TaskFormValues>({
    title: '',
    description: '',
    priority: 'medium',
  });

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
    },
  });

  const updateMutation = useMutation<
    void,
    unknown,
    { id: number; values: Partial<TaskFormValues> & { completed?: boolean } },
    { previousTasks: Task[] }
  >({
    mutationFn: async ({ id, values }) => {
      const payload: Record<string, unknown> = {};
      if (values.title !== undefined) payload.title = values.title;
      if (values.description !== undefined) payload.description = values.description;
      if (values.completed !== undefined) payload.completed = values.completed;
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
    },
  });

  const handleToggle = (task: Task) => {
    toggleMutation.mutate(task);
  };

  const openAddModal = () => {
    setFormValues({ title: '', description: '', priority: 'medium' });
    setActiveTask(null);
    setIsAddOpen(true);
  };

  const openEditModal = (task: Task) => {
    setActiveTask(task);
    setFormValues({
      title: task.title,
      description: task.description ?? '',
      priority: task.priority ?? 'medium',
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

  const handleCreateSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formValues.title.trim()) return;
    createMutation.mutate(formValues, {
      onSuccess: () => {
        setIsAddOpen(false);
        toast.success('Task created');
      },
      onError: () => toast.error('Failed to create task'),
    });
  };

  const handleEditSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!activeTask) return;
    if (!formValues.title.trim()) return;
    updateMutation.mutate(
      {
        id: activeTask.id,
        values: {
          title: formValues.title,
          description: formValues.description,
        },
      },
      {
        onSuccess: () => setIsEditOpen(false),
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

  const tasks = data ?? [];

  return (
    <section className="flex w-full flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-50">Task dashboard</h2>
          <p className="text-sm text-slate-400">
            Track your work and toggle completion in real time.
          </p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-sky-500/40 transition hover:bg-sky-400"
        >
          + Add task
        </button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="animate-pulse rounded-2xl border border-slate-800 bg-slate-900/70 p-4"
            >
              <div className="mb-3 h-4 w-2/3 rounded bg-slate-700" />
              <div className="mb-2 h-3 w-full rounded bg-slate-800" />
              <div className="mb-4 h-3 w-5/6 rounded bg-slate-800" />
              <div className="flex justify-between">
                <div className="h-4 w-20 rounded-full bg-slate-800" />
                <div className="h-4 w-16 rounded-full bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="text-red-400">Failed to load tasks.</p>
      ) : tasks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700/80 bg-slate-900/60 px-6 py-16 text-center"
        >
          <p className="text-lg font-medium text-slate-100">No tasks yet</p>
          <p className="mt-2 max-w-md text-sm text-slate-400">
            Create tasks via the API or backend and they will show up here with live status and
            priority indicators.
          </p>
        </motion.div>
      ) : (
        <AnimatePresence>
          <motion.ul
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25 }}
            className="grid gap-4 md:grid-cols-2"
          >
            {tasks.map((task) => {
              const priority: Priority = task.priority ?? 'medium';
              const priorityLabel = priority.charAt(0).toUpperCase() + priority.slice(1);

              return (
                <motion.li
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm shadow-slate-900/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-50">{task.title}</p>
                      {task.description && (
                        <p className="text-xs text-slate-300 line-clamp-3">
                          {task.description}
                        </p>
                      )}
                      <p className="text-[11px] text-slate-500">
                        Created{' '}
                        {formatDistanceToNow(new Date(task.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold text-slate-950 ${priorityColors[priority]}`}
                      >
                        {priorityLabel} priority
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggle(task)}
                        className={`mt-1 inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium transition ${
                          task.completed
                            ? 'border-emerald-400/50 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                            : 'border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700'
                        }`}
                      >
                        <span
                          className={`mr-1 h-2 w-2 rounded-full ${
                            task.completed ? 'bg-emerald-400' : 'bg-slate-500'
                          }`}
                        />
                        {task.completed ? 'Completed' : 'Mark done'}
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditModal(task)}
                        className="text-[11px] text-slate-400 hover:text-slate-200"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => openDeleteModal(task)}
                        className="text-[11px] text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
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
            className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900/95 p-6 shadow-xl"
            >
              <h3 className="text-lg font-semibold text-slate-50">
                {isEditOpen ? 'Edit task' : 'Add task'}
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                {isEditOpen
                  ? 'Update the details for this task.'
                  : 'Create a new task to track.'}
              </p>

              <form
                onSubmit={isEditOpen ? handleEditSubmit : handleCreateSubmit}
                className="mt-4 space-y-4"
              >
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-200" htmlFor="title">
                    Title
                  </label>
                  <input
                    id="title"
                    value={formValues.title}
                    onChange={(e) => handleFormChange('title', e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <div className="space-y-1">
                  <label
                    className="block text-xs font-medium text-slate-200"
                    htmlFor="description"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    value={formValues.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    className="w-full resize-none rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-200" htmlFor="priority">
                    Priority (visual only)
                  </label>
                  <select
                    id="priority"
                    value={formValues.priority}
                    onChange={(e) => handleFormChange('priority', e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddOpen(false);
                      setIsEditOpen(false);
                    }}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800"
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
            className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900/95 p-6 shadow-xl"
            >
              <h3 className="text-lg font-semibold text-slate-50">Delete task</h3>
              <p className="mt-2 text-sm text-slate-300">
                Are you sure you want to delete{' '}
                <span className="font-semibold">{activeTask.title}</span>? This action cannot be
                undone.
              </p>
              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteOpen(false)}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800"
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
    </section>
  );
};

