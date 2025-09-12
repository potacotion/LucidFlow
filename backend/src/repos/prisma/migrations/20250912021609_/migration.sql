-- CreateTable
CREATE TABLE "workflownode" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "discription" TEXT,
    "name" TEXT,
    "version" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "edge" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "edgeid" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "sourceHandle" TEXT,
    "targetHandle" TEXT,
    "label" TEXT,
    "animated" BOOLEAN NOT NULL,
    "style" JSONB,
    "workflowNodeId" INTEGER NOT NULL,
    CONSTRAINT "edge_workflowNodeId_fkey" FOREIGN KEY ("workflowNodeId") REFERENCES "workflownode" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "node" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nodeid" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "position" JSONB NOT NULL,
    "style" JSONB,
    "run" JSONB NOT NULL,
    "workflowNodeId" INTEGER NOT NULL,
    CONSTRAINT "node_workflowNodeId_fkey" FOREIGN KEY ("workflowNodeId") REFERENCES "workflownode" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "edge_workflowNodeId_edgeid_key" ON "edge"("workflowNodeId", "edgeid");

-- CreateIndex
CREATE UNIQUE INDEX "node_workflowNodeId_nodeid_key" ON "node"("workflowNodeId", "nodeid");
