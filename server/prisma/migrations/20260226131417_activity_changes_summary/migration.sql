/*
  Warnings:

  - You are about to drop the column `changeSummary` on the `ActivityLog` table. All the data in the column will be lost.
  - You are about to drop the column `taskCompletedAt` on the `ActivityLog` table. All the data in the column will be lost.
  - You are about to drop the column `taskCreatedAt` on the `ActivityLog` table. All the data in the column will be lost.
  - You are about to drop the column `taskPriority` on the `ActivityLog` table. All the data in the column will be lost.
  - You are about to drop the column `completedAt` on the `Task` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ActivityLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "taskId" INTEGER,
    "taskTitle" TEXT,
    "taskDescription" TEXT,
    "taskDueDate" DATETIME,
    "taskCompleted" BOOLEAN,
    "changesSummary" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ActivityLog" ("action", "createdAt", "id", "taskCompleted", "taskDescription", "taskDueDate", "taskId", "taskTitle", "userId") SELECT "action", "createdAt", "id", "taskCompleted", "taskDescription", "taskDueDate", "taskId", "taskTitle", "userId" FROM "ActivityLog";
DROP TABLE "ActivityLog";
ALTER TABLE "new_ActivityLog" RENAME TO "ActivityLog";
CREATE TABLE "new_Task" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "dueDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Task" ("completed", "createdAt", "description", "dueDate", "id", "priority", "title", "userId") SELECT "completed", "createdAt", "description", "dueDate", "id", "priority", "title", "userId" FROM "Task";
DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
