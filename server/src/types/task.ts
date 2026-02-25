/**
 * Payload required to create a new task.
 */
export interface TaskCreateDto {
  title: string;
  description?: string | null;
}

/**
 * Fields that can be updated on an existing task.
 */
export interface TaskUpdateDto {
  title?: string;
  description?: string | null;
  completed?: boolean;
}

/**
 * Canonical shape of a task returned by the API layer.
 */
export interface TaskResponseDto {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: string;
  userId: number;
}

