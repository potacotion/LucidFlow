import { Router } from 'express';
import Paths from '@src/common/constants/Paths';
import WorkflowService from '@src/services/WorkflowService';
import WorkflowExecutionManager from '@src/services/WorkflowExecutionManager';
import { Workflow, Folder } from '@src/models/workflow';
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
 *         description: A tree structure of folders and workflows.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Folder'
 */
WorkflowRoutes.get(Paths.Workflows.GetAll, async (_, res) => {
  const tree = await WorkflowService.getTree();
  return res.json(tree);
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
  const workflow = req.body as Workflow;
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
  const workflow = req.body as Workflow;
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
 *         description: The ID for the workflow execution run.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 runId:
 *                   type: string
 */
WorkflowRoutes.post(Paths.Workflows.Run, async (req, res) => {
  const workflow = await WorkflowService.getOne(req.params.id);
  if (!workflow) {
    return res.status(404).json({ error: 'Workflow not found' });
  }
  // Register the execution and get the runId, but don't start it yet.
  const { runId } = WorkflowExecutionManager.registerExecution(workflow.graph);
  return res.json({ runId });
});

/**
* @swagger
* /api/workflows/{id}/trigger:
*   post:
*     tags: [Workflows]
*     summary: Trigger a workflow with a specific tag and optional initial data.
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
*             type: object
*             properties:
*               triggerTag:
*                 type: string
*                 description: The unique tag of the trigger node to start execution from.
*               initialData:
*                 type: object
*                 description: Optional initial data to pass to the trigger node.
*     responses:
*       200:
*         description: The ID for the workflow execution run.
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 runId:
*                   type: string
*       400:
*         description: Missing triggerTag in request body.
*       404:
*         description: Workflow or unique trigger node not found.
*/
WorkflowRoutes.post(Paths.Workflows.Trigger, async (req, res) => {
   const { triggerTag, initialData } = req.body as { triggerTag: string; initialData?: any };
   const workflowId = req.params.id;

   if (!triggerTag) {
       return res.status(400).json({ error: 'Missing required parameter: triggerTag' });
   }

   const workflow = await WorkflowService.getOne(workflowId);
   if (!workflow) {
       return res.status(404).json({ error: 'Workflow not found' });
   }
   
   // 1. 注册执行并获取 runId
   const { runId } = WorkflowExecutionManager.registerExecution(workflow.graph);

   try {
       // 2. 使用 triggerTag 和 initialData 启动执行
       // 注意：startExecution 是异步的，但如果找不到触发节点，它会抛出错误，
       // 允许我们捕获并在 API 层面返回错误状态。
       await WorkflowExecutionManager.startExecution(runId, triggerTag, initialData);
       
       // 成功启动执行后，返回 runId
       return res.json({ runId });
   } catch (error) {
       // startExecution 会在找不到唯一触发节点时抛出错误。
       // 此时，需要手动清理一下 pendingExecutions（虽然 startExecution 内部会清理，但如果 findTriggerNodeId 失败，它可能会停在 startExecution 内部）。
       // 考虑到 findTriggerNodeId 在 Manager 内部，如果找不到触发节点，Manager 会发送 workflow:end 失败消息。
       // 但是为了保持 API 响应的一致性，如果 startExecution 抛出错误（即 findTriggerNodeId 失败），我们应该清理并返回错误。
       // 由于 startExecution 在找到触发节点前抛出错误（如果 NodeRegistry.getDefinition 失败），我们最好在 Manager 内部确保在抛出错误前执行清理。
       // 但根据 WorkflowExecutionManager.ts (行 75)，它在执行前已经删除了 pendingExecutions。
       // 所以我们只需要返回错误信息。
       return res.status(404).json({ error: (error as Error).message });
   }
});

export default WorkflowRoutes;
