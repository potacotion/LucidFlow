import WorkflowRepo from '@src/repos/WorkflowRepo';
import { Workflow } from '@src/models/workflow';
import { SignalDrivenEngine } from './SignalDrivenEngine';


function getAll(): Promise<Workflow[]> {
  return WorkflowRepo.getAll();
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
  const engine = new SignalDrivenEngine();
  return await engine.run(workflow.graph);
}

export default {
  getAll,
  getOne,
  addOne,
  updateOne,
  deleteOne,
  runOne,
} as const;