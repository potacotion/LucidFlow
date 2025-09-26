import { PrismaClient } from '@prisma/client';
import { Workflow, Folder } from '@src/models/workflow';

const prisma = new PrismaClient();

async function getTree(): Promise<Folder[]> {
  const folders = await prisma.folder.findMany({
    include: {
      children: true,
      workflows: true,
    },
    where: {
      parentId: null,
    },
  });

  const mapFolder = (folder: any): Folder => ({
    id: folder.id,
    name: folder.name,
    children: folder.children.map(mapFolder),
    workflows: folder.workflows.map((w: any) => ({
      id: w.id,
      name: w.name,
      description: w.description ?? undefined,
      graph: w.data as any,
    })),
  });

  return folders.map(mapFolder);
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