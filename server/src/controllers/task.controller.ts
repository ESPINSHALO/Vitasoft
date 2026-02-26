import type { NextFunction, Response } from 'express';
import prisma from '../prisma';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';
import type { TaskCreateDto, TaskUpdateDto, TaskResponseDto, Priority } from '../types/task';

const VALID_PRIORITIES: Priority[] = ['low', 'medium', 'high'];

function isPriority(value: unknown): value is Priority {
  return typeof value === 'string' && VALID_PRIORITIES.includes(value as Priority);
}

function parseDueDate(value: unknown): Date | null {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string') return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Handlers for CRUD operations on tasks owned by the authenticated user.
 */
export const createTask = async (
  req: AuthenticatedRequest,
  res: Response<TaskResponseDto>,
  next: NextFunction,
) => {
  try {
    const userId = req.userId;
    const { title, description, priority, dueDate: dueDateRaw } = req.body as TaskCreateDto;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' } as never);
    }

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ message: 'Title is required' } as never);
    }

    if (priority !== undefined && !isPriority(priority)) {
      return res.status(400).json({ message: 'Priority must be low, medium, or high' } as never);
    }

    if (dueDateRaw !== undefined && dueDateRaw !== null && dueDateRaw !== '') {
      const parsed = parseDueDate(dueDateRaw);
      if (parsed === null) {
        return res.status(400).json({ message: 'Due date must be a valid date' } as never);
      }
    }

    const dueDate = parseDueDate(dueDateRaw) ?? undefined;

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description ?? null,
        priority: priority ?? 'medium',
        dueDate: dueDate ?? null,
        userId,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId,
        action: 'created',
        taskId: task.id,
        taskTitle: task.title,
        taskDescription: task.description,
        taskDueDate: task.dueDate,
        taskCompleted: task.completed,
      },
    });

    return res.status(201).json({
      id: task.id,
      title: task.title,
      description: task.description,
      completed: task.completed,
      priority: task.priority as Priority,
      dueDate: task.dueDate ? task.dueDate.toISOString() : null,
      createdAt: task.createdAt.toISOString(),
      userId: task.userId,
    });
  } catch (error) {
    return next(error);
  }
};

export const getTasks = async (
  req: AuthenticatedRequest,
  res: Response<TaskResponseDto[]>,
  next: NextFunction,
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' } as never);
    }

    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const taskDtos: TaskResponseDto[] = tasks.map((task: {
      id: number;
      title: string;
      description: string | null;
      completed: boolean;
      priority: string;
      dueDate: Date | null;
      createdAt: Date;
      userId: number;
    }) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      completed: task.completed,
      priority: (task.priority ?? 'medium') as Priority,
      dueDate: task.dueDate ? task.dueDate.toISOString() : null,
      createdAt: task.createdAt.toISOString(),
      userId: task.userId,
    }));

    return res.json(taskDtos);
  } catch (error) {
    return next(error);
  }
};

export const getTaskById = async (
  req: AuthenticatedRequest,
  res: Response<TaskResponseDto>,
  next: NextFunction,
) => {
  try {
    const userId = req.userId;
    const taskId = Number(req.params.id);

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' } as never);
    }

    if (Number.isNaN(taskId)) {
      return res.status(400).json({ message: 'Invalid task id' } as never);
    }

    const task = await prisma.task.findFirst({
      where: { id: taskId, userId },
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' } as never);
    }

    return res.json({
      id: task.id,
      title: task.title,
      description: task.description,
      completed: task.completed,
      priority: (task.priority ?? 'medium') as Priority,
      dueDate: task.dueDate ? task.dueDate.toISOString() : null,
      createdAt: task.createdAt.toISOString(),
      userId: task.userId,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateTask = async (
  req: AuthenticatedRequest,
  res: Response<TaskResponseDto>,
  next: NextFunction,
) => {
  try {
    const userId = req.userId;
    const taskId = Number(req.params.id);
    const { title, description, completed, priority, dueDate: dueDateRaw } = req.body as TaskUpdateDto;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' } as never);
    }

    if (Number.isNaN(taskId)) {
      return res.status(400).json({ message: 'Invalid task id' } as never);
    }

    if (title !== undefined && title.trim().length === 0) {
      return res.status(400).json({ message: 'Title, if provided, cannot be empty' } as never);
    }

    if (completed !== undefined && typeof completed !== 'boolean') {
      return res
        .status(400)
        .json({ message: 'Completed, if provided, must be a boolean' } as never);
    }

    if (priority !== undefined && !isPriority(priority)) {
      return res.status(400).json({ message: 'Priority must be low, medium, or high' } as never);
    }

    if (dueDateRaw !== undefined && dueDateRaw !== null && dueDateRaw !== '') {
      const parsed = parseDueDate(dueDateRaw);
      if (parsed === null) {
        return res.status(400).json({ message: 'Due date must be a valid date' } as never);
      }
    }

    const existing = await prisma.task.findFirst({ where: { id: taskId, userId } });

    if (!existing) {
      return res.status(404).json({ message: 'Task not found' } as never);
    }

    const dueDateValue = dueDateRaw === undefined ? undefined : parseDueDate(dueDateRaw);
    const newCompleted = typeof completed === 'boolean' ? completed : existing.completed;

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        title: title !== undefined ? title.trim() : existing.title,
        description: description ?? existing.description,
        completed: newCompleted,
        priority: priority ?? existing.priority,
        dueDate: dueDateRaw === undefined ? undefined : (dueDateValue ?? null),
      },
    });

    const activityAction = typeof completed === 'boolean' && completed && !existing.completed
      ? 'completed'
      : 'updated';
    await prisma.activityLog.create({
      data: {
        userId,
        action: activityAction,
        taskId: task.id,
        taskTitle: task.title,
        taskDescription: task.description,
        taskDueDate: task.dueDate,
        taskCompleted: task.completed,
      },
    });

    return res.json({
      id: task.id,
      title: task.title,
      description: task.description,
      completed: task.completed,
      priority: (task.priority ?? 'medium') as Priority,
      dueDate: task.dueDate ? task.dueDate.toISOString() : null,
      createdAt: task.createdAt.toISOString(),
      userId: task.userId,
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteTask = async (
  req: AuthenticatedRequest,
  res: Response<void>,
  next: NextFunction,
) => {
  try {
    const userId = req.userId;
    const taskId = Number(req.params.id);

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' } as never);
    }

    if (Number.isNaN(taskId)) {
      return res.status(400).json({ message: 'Invalid task id' } as never);
    }

    const existing = await prisma.task.findFirst({ where: { id: taskId, userId } });

    if (!existing) {
      return res.status(404).json({ message: 'Task not found' } as never);
    }

    await prisma.activityLog.create({
      data: {
        userId: userId!,
        action: 'deleted',
        taskId: existing.id,
        taskTitle: existing.title,
        taskDescription: existing.description,
        taskDueDate: existing.dueDate,
        taskCompleted: existing.completed,
      },
    });

    await prisma.task.delete({ where: { id: taskId } });

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};


