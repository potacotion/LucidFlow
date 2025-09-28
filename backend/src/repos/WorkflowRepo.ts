import { PrismaClient } from '@prisma/client';
import { Workflow, Folder } from '@src/models/workflow';

const prisma = new PrismaClient();

async function getTree(): Promise<Folder[]> {
  // 1. Fetch all folders and all workflows in parallel
  const [allFolders, allWorkflows] = await Promise.all([
    prisma.folder.findMany(),
    prisma.workflow.findMany()
  ]);

  // 2. Create a map for easy lookup
  const folderMap = new Map<string, Folder>();
  allFolders.forEach(f => {
    const folderData = {
      ...f,
      parentId: f.parentId || undefined, // Convert null to undefined
      children: [],
      workflows: []
    };
    folderMap.set(f.id, folderData);
  });

  const rootFolders: Folder[] = [];

  // 3. Populate children and workflows into the map
  allFolders.forEach(f => {
    if (f.parentId && folderMap.has(f.parentId)) {
      folderMap.get(f.parentId)!.children.push(folderMap.get(f.id)!);
    } else {
      rootFolders.push(folderMap.get(f.id)!);
    }
  });

  const rootWorkflows = allWorkflows
    .filter(w => !w.folderId)
    .map(w => ({
      id: w.id,
      name: w.name,
      description: w.description ?? undefined,
      graph: w.data as any,
    }));

  allWorkflows.forEach(w => {
    if (w.folderId && folderMap.has(w.folderId)) {
      folderMap.get(w.folderId)!.workflows.push({
        id: w.id,
        name: w.name,
        description: w.description ?? undefined,
        graph: w.data as any,
      });
    }
  });

  // 4. If there are workflows without a folder, create a virtual root to hold them
  if (rootWorkflows.length > 0) {
    // We can create a "virtual" folder or just return them at the root level.
    // Let's create a virtual folder for consistency.
    const virtualRootFolder: Folder = {
      id: 'root-workflows',
      name: 'Workflows', // This name will appear in the UI
      children: [],
      workflows: rootWorkflows,
    };
    return [...rootFolders, virtualRootFolder];
  }

  return rootFolders;
}

async function getOne(id: string): Promise<Workflow | null> {
  const workflow = await prisma.workflow.findUnique({ where: { id } });
  if (!workflow) {
    return null;
  }
  return {
    id: workflow.id,
    name: workflow.name,
    description: workflow.description ?? undefined,
    graph: workflow.data as any,
    folderId: workflow.folderId ?? undefined,
  };
}

async function add(workflow: Workflow): Promise<Workflow> {
  const newWorkflow = await prisma.workflow.create({
    data: {
      id: workflow.id,
      name: workflow.name,
      description: workflow.description,
      data: workflow.graph as any,
      folderId: workflow.folderId,
    },
  });
  return {
    id: newWorkflow.id,
    name: newWorkflow.name,
    description: newWorkflow.description ?? undefined,
    graph: newWorkflow.data as any,
    folderId: newWorkflow.folderId ?? undefined,
  };
}

async function update(id: string, workflow: Workflow): Promise<Workflow> {
  const updatedWorkflow = await prisma.workflow.update({
    where: { id },
    data: {
      name: workflow.name,
      description: workflow.description,
      data: workflow.graph as any,
      folderId: workflow.folderId,
    },
  });
  return {
    id: updatedWorkflow.id,
    name: updatedWorkflow.name,
    description: updatedWorkflow.description ?? undefined,
    graph: updatedWorkflow.data as any,
    folderId: updatedWorkflow.folderId ?? undefined,
  };
}

async function _delete(id: string): Promise<void> {
  await prisma.workflow.delete({ where: { id } });
}

async function addFolder(folder: Partial<Folder>): Promise<Folder> {
  const newFolder = await prisma.folder.create({
    data: {
      name: folder.name!,
      parentId: folder.parentId,
    },
  });
  return {
    ...newFolder,
    parentId: newFolder.parentId ?? undefined,
    children: [],
    workflows: [],
  };
}

async function updateFolder(id: string, folder: Partial<Folder>): Promise<Folder> {
  const updatedFolder = await prisma.folder.update({
    where: { id },
    data: {
      name: folder.name,
      parentId: folder.parentId,
    },
  });
  return {
    ...updatedFolder,
    parentId: updatedFolder.parentId ?? undefined,
    children: [],
    workflows: [],
  };
}

async function deleteFolder(id: string): Promise<void> {
  await prisma.folder.delete({ where: { id } });
}

export default {
  getTree,
  getOne,
  add,
  update,
  delete: _delete,
  addFolder,
  updateFolder,
  deleteFolder,
} as const;