-- AlterTable
ALTER TABLE "ActivityLog" ADD COLUMN "taskCompleted" BOOLEAN;
ALTER TABLE "ActivityLog" ADD COLUMN "taskDescription" TEXT;
ALTER TABLE "ActivityLog" ADD COLUMN "taskDueDate" DATETIME;
