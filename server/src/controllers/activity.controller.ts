import type { Response, NextFunction } from 'express';
import prisma from '../prisma';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';
import type { ActivityLogResponseDto, ActivityAction } from '../types/activity';

function toDto(log: {
  id: number;
  userId: number;
  action: string;
  taskId: number | null;
  taskTitle: string | null;
  createdAt: Date;
}): ActivityLogResponseDto {
  return {
    id: log.id,
    userId: log.userId,
    action: log.action as ActivityAction,
    taskId: log.taskId,
    taskTitle: log.taskTitle,
    createdAt: log.createdAt.toISOString(),
  };
}

/**
 * GET /activity - List activity logs for the authenticated user.
 */
export const getActivityLogs = async (
  req: AuthenticatedRequest,
  res: Response<ActivityLogResponseDto[]>,
  next: NextFunction,
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' } as never);
    }

    const logs = await prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(logs.map(toDto));
  } catch (error) {
    return next(error);
  }
};
