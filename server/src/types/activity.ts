export type ActivityAction = 'created' | 'updated' | 'completed' | 'deleted';

export interface ActivityLogResponseDto {
  id: number;
  userId: number;
  action: ActivityAction;
  taskId: number | null;
  taskTitle: string | null;
  taskDescription: string | null;
  taskDueDate: string | null;
  taskCompleted: boolean | null;
  createdAt: string;
}
