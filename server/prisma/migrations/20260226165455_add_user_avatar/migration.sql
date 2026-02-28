/*
  Warnings:

  - You are about to drop the column `newValue` on the `ActivityLog` table. All the data in the column will be lost.
  - You are about to drop the column `previousValue` on the `ActivityLog` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN "avatarPath" TEXT;

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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ActivityLog" ("action", "createdAt", "id", "taskCompleted", "taskDescription", "taskDueDate", "taskId", "taskTitle", "userId") SELECT "action", "createdAt", "id", "taskCompleted", "taskDescription", "taskDueDate", "taskId", "taskTitle", "userId" FROM "ActivityLog";
DROP TABLE "ActivityLog";
ALTER TABLE "new_ActivityLog" RENAME TO "ActivityLog";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
