import { PrismaClient } from '@prisma/client';
import { Workflow } from '@src/models/workflow';

const prisma = new PrismaClient();

async function getAll(): Promise<Workflow[]> {
  const workflows = await prisma.workflow.findMany();
  return workflows.map(w => ({
    id: w.id,
    name: w.name,
    description: w.description ?? undefined,
    graph: w.data as any,
  }));
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
  };
}

async function add(workflow: Workflow): Promise<Workflow> {
  const newWorkflow = await prisma.workflow.create({
    data: {
      id: workflow.id,
      name: workflow.name,
      description: workflow.description,
      data: workflow.graph as any,
    },
  });
  return {
    id: newWorkflow.id,
    name: newWorkflow.name,
    description: newWorkflow.description ?? undefined,
    graph: newWorkflow.data as any,
  };
}

async function update(id: string, workflow: Workflow): Promise<Workflow> {
  const updatedWorkflow = await prisma.workflow.update({
    where: { id },
    data: {
      name: workflow.name,
      description: workflow.description,
      data: workflow.graph as any,
    },
  });
  return {
    id: updatedWorkflow.id,
    name: updatedWorkflow.name,
    description: updatedWorkflow.description ?? undefined,
    graph: updatedWorkflow.data as any,
  };
}

async function _delete(id: string): Promise<void> {
  await prisma.workflow.delete({ where: { id } });
}

export default {
  getAll,
  getOne,
  add,
  update,
  delete: _delete,
} as const;