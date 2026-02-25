import type { NextFunction, Response } from 'express';
import prisma from '../prisma';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';
import type { TaskCreateDto, TaskUpdateDto, TaskResponseDto } from '../types/task';

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
    const { title, description } = req.body as TaskCreateDto;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' } as never);
    }

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ message: 'Title is required' } as never);
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description ?? null,
        userId,
      },
    });

    return res.status(201).json({
      id: task.id,
      title: task.title,
      description: task.description,
      completed: task.completed,
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
      createdAt: Date;
      userId: number;
    }) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      completed: task.completed,
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
    const { title, description, completed } = req.body as TaskUpdateDto;

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

    const existing = await prisma.task.findFirst({ where: { id: taskId, userId } });

    if (!existing) {
      return res.status(404).json({ message: 'Task not found' } as never);
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        title: title !== undefined ? title.trim() : existing.title,
        description: description ?? existing.description,
        completed: typeof completed === 'boolean' ? completed : existing.completed,
      },
    });

    return res.json({
      id: task.id,
      title: task.title,
      description: task.description,
      completed: task.completed,
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

    await prisma.task.delete({ where: { id: taskId } });

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};


