/*
  Warnings:

  - The primary key for the `workflows` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "pwdHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'Standard'
);

-- CreateTable
CREATE TABLE "folders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "parentId" TEXT,
    CONSTRAINT "folders_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "folders" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_workflows" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "data" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "folderId" TEXT,
    CONSTRAINT "workflows_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "folders" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_workflows" ("createdAt", "data", "description", "id", "name", "updatedAt") SELECT "createdAt", "data", "description", "id", "name", "updatedAt" FROM "workflows";
DROP TABLE "workflows";
ALTER TABLE "new_workflows" RENAME TO "workflows";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
