/*
  Warnings:

  - You are about to drop the `edge` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `node` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `workflownode` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "edge";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "node";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "workflownode";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "workflows" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "data" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
