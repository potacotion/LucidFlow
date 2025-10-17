import WorkflowRepo from '@src/repos/WorkflowRepo';
import { Workflow } from '@src/models/workflow';
import { Engine } from './engine';


import { Folder } from '@src/models/workflow';

function getTree(): Promise<Folder[]> {
  return WorkflowRepo.getTree();
}

function getOne(id: string): Promise<Workflow | null> {
  return WorkflowRepo.getOne(id);
}

function addOne(workflow: Workflow): Promise<Workflow> {
  return WorkflowRepo.add(workflow);
}

function updateOne(id: string, workflow: Workflow): Promise<Workflow> {
  return WorkflowRepo.update(id, workflow);
}

function deleteOne(id: string): Promise<void> {
  return WorkflowRepo.delete(id);
}

async function runOne(id: string): Promise<any> {
  const workflow = await WorkflowRepo.getOne(id);
  if (!workflow) {
    throw new Error('Workflow not found');
  }
  const engine = new Engine();
  return await engine.run(workflow.graph);
}

function addFolder(folder: Partial<Folder>): Promise<Folder> {
  return WorkflowRepo.addFolder(folder);
}

function updateFolder(id: string, folder: Partial<Folder>): Promise<Folder> {
  return WorkflowRepo.updateFolder(id, folder);
}

function deleteFolder(id: string): Promise<void> {
  return WorkflowRepo.deleteFolder(id);
}

export default {
  getTree,
  getOne,
  addOne,
  updateOne,
  deleteOne,
  runOne,
  addFolder,
  updateFolder,
  deleteFolder,
} as const;