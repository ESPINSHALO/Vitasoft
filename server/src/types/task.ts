export type Priority = 'low' | 'medium' | 'high';

/**
 * Payload required to create a new task.
 */
export interface TaskCreateDto {
  title: string;
  description?: string | null;
  priority?: Priority;
  dueDate?: string | null;
}

/**
 * Fields that can be updated on an existing task.
 */
export interface TaskUpdateDto {
  title?: string;
  description?: string | null;
  completed?: boolean;
  priority?: Priority;
  dueDate?: string | null;
}

/**
 * Canonical shape of a task returned by the API layer.
 */
export interface TaskResponseDto {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  priority: Priority;
  dueDate: string | null;
  createdAt: string;
  userId: number;
}

