-- AlterTable
ALTER TABLE "ActivityLog" ADD COLUMN "taskCompletedAt" DATETIME;
ALTER TABLE "ActivityLog" ADD COLUMN "taskCreatedAt" DATETIME;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN "completedAt" DATETIME;
