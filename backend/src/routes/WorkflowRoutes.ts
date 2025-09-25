import { Router } from 'express';
import Paths from '@src/common/constants/Paths';
import WorkflowService from '@src/services/WorkflowService';
import { Workflow } from '@src/models/workflow';
import {  } from 'jet-logger';

const WorkflowRoutes = Router();

/**
 * @swagger
 * /api/workflows:
 *   get:
 *     tags: [Workflows]
 *     summary: Get all workflows
 *     responses:
 *       200:
 *         description: A list of workflows.
 */
WorkflowRoutes.get(Paths.Workflows.GetAll, async (_, res) => {
  const workflows = await WorkflowService.getAll();
  return res.json(workflows);
});

/**
 * @swagger
 * /api/workflows/{id}:
 *   get:
 *     tags: [Workflows]
 *     summary: Get a single workflow by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single workflow.
 */
WorkflowRoutes.get(Paths.Workflows.Get, async (req, res) => {
  const workflow = await WorkflowService.getOne(req.params.id);
  return res.json(workflow);
});

/**
 * @swagger
 * /api/workflows:
 *   post:
 *     tags: [Workflows]
 *     summary: Create a new workflow
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Workflow'
 *     responses:
 *       201:
 *         description: The created workflow.
 */
WorkflowRoutes.post(Paths.Workflows.Add, async (req, res) => {
  const { workflow } = req.body as { workflow: Workflow };
  const newWorkflow = await WorkflowService.addOne(workflow);
  return res.status(201).json(newWorkflow);
});

/**
 * @swagger
 * /api/workflows/{id}:
 *   put:
 *     tags: [Workflows]
 *     summary: Update a workflow
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Workflow'
 *     responses:
 *       200:
 *         description: The updated workflow.
 */
WorkflowRoutes.put(Paths.Workflows.Update, async (req, res) => {
  const { workflow } = req.body as { workflow: Workflow };
  const updatedWorkflow = await WorkflowService.updateOne(req.params.id, workflow);
  return res.json(updatedWorkflow);
});

/**
 * @swagger
 * /api/workflows/{id}:
 *   delete:
 *     tags: [Workflows]
 *     summary: Delete a workflow
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Workflow deleted successfully.
 */
WorkflowRoutes.delete(Paths.Workflows.Delete, async (req, res) => {
  await WorkflowService.deleteOne(req.params.id);
  return res.sendStatus(200);
});

/**
 * @swagger
 * /api/workflows/{id}/run:
 *   post:
 *     tags: [Workflows]
 *     summary: Run a workflow
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Workflow execution result.
 */
WorkflowRoutes.post(Paths.Workflows.Run, async (req, res) => {
  const result = await WorkflowService.runOne(req.params.id);
  return res.json(result);
});

export default WorkflowRoutes;
