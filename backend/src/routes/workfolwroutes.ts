import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { Workflow, WorkflowNode } from '@src/models/workflow'; // 确保路径正确
import Paths from '@src/common/constants/Paths';
import { DagEngine } from '@src/services/DagEngine';

const prisma = new PrismaClient();
const router = Router();

// 创建工作流
/**
 * @swagger
 * /api/workflows/add:
 *   post:
 *     summary: 创建工作流
 *     tags:
 *       - Workflows
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WorkflowNode'
 *     responses:
 *       201:
 *         description: 成功创建工作流
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkflowNode'
 *       500:
 *         description: 创建工作流失败
 */
router.post(Paths.Workflows.Add, async (req: Request, res: Response) => {
    try {
        const workflowData = Workflow.transformFrontendData(req.body);
        const newWorkflow = await prisma.workflowNode.create({
            data: {
                ...workflowData,
                nodes: {
                    create: workflowData.nodes,
                },
                edges: {
                    create: workflowData.edges,
                },
            },
            include: {
                nodes: true,
                edges: true,
            },
        });
        res.status(201).json(newWorkflow);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create workflow' });
    }
});

/**
 * @swagger
 * /api/workflows:
 *   get:
 *     summary: 获取所有工作流
 *     tags:
 *       - Workflows
 *     responses:
 *       200:
 *         description: 成功获取工作流列表
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WorkflowNode'
 *       500:
 *         description: 获取工作流失败
 */
router.get(Paths.Workflows.GetAll, async (req: Request, res: Response) => {
    try {
        const workflows = await prisma.workflowNode.findMany({
            include: {
                nodes: true,
                edges: true,
            },
        });
        res.json(workflows);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch workflows' });
    }
});

/**
 * @swagger
 * /api/workflows/{id}:
 *   get:
 *     summary: 获取单个工作流
 *     tags:
 *       - Workflows
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 工作流 ID
 *     responses:
 *       200:
 *         description: 成功获取工作流
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkflowNode'
 *       404:
 *         description: 工作流未找到
 *       500:
 *         description: 获取工作流失败
 */
router.get(Paths.Workflows.Get, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const workflow = await prisma.workflowNode.findUnique({
            where: { id: parseInt(id, 10) },
            include: {
                nodes: true,
                edges: true,
            },
        });
        if (workflow) {
            res.json(workflow);
        } else {
            res.status(404).json({ error: 'Workflow not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch workflow' });
    }
});

/**
 * @swagger
 * /api/workflows/{id}:
 *   put:
 *     summary: 更新工作流
 *     tags:
 *       - Workflows
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 工作流 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WorkflowNode'
 *     responses:
 *       200:
 *         description: 成功更新工作流
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkflowNode'
 *       500:
 *         description: 更新工作流失败
 */
router.put(Paths.Workflows.Update, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const workflowData = Workflow.transformFrontendData(req.body);

        // Prisma 不支持直接更新嵌套的 create，所以需要先删除旧的 nodes 和 edges
        await prisma.node.deleteMany({ where: { workflowNodeId: parseInt(id, 10) } });
        await prisma.edge.deleteMany({ where: { workflowNodeId: parseInt(id, 10) } });

        const updatedWorkflow = await prisma.workflowNode.update({
            where: { id: parseInt(id, 10) },
            data: {
                ...workflowData,
                nodes: {
                    create: workflowData.nodes,
                },
                edges: {
                    create: workflowData.edges,
                },
            },
            include: {
                nodes: true,
                edges: true,
            },
        });
        res.json(updatedWorkflow);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update workflow' });
    }
});

/**
 * @swagger
 * /api/workflows/{id}:
 *   delete:
 *     summary: 删除工作流
 *     tags:
 *       - Workflows
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 工作流 ID
 *     responses:
 *       204:
 *         description: 成功删除工作流
 *       500:
 *         description: 删除工作流失败
 */
router.delete(Paths.Workflows.Delete, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.workflowNode.delete({
            where: { id: parseInt(id, 10) },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete workflow' });
    }
});

/**
 * @swagger
 * /api/workflows/{id}/run:
 *   post:
 *     summary: 执行工作流
 *     tags:
 *       - Workflows
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 工作流 ID
 *     responses:
 *       200:
 *         description: 工作流执行成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Workflow executed successfully
 *                 results:
 *                   type: object
 *                   description: 工作流执行结果
 *       404:
 *         description: 工作流未找到
 *       500:
 *         description: 执行工作流失败
 */
router.post(Paths.Workflows.Run, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const workflow = await prisma.workflowNode.findUnique({
            where: { id: parseInt(id, 10) },
            include: {
                nodes: true,
                edges: true,
            },
        });

        if (!workflow) {
            return res.status(404).json({ error: 'Workflow not found' });
        }

        const engine = new DagEngine(workflow as unknown as WorkflowNode);
        const results = await engine.run();

        // The results are a Map, so we need to convert it to a plain object for the JSON response.
        const resultsObject = Object.fromEntries(results);

        res.json({
            message: 'Workflow executed successfully',
            results: resultsObject,
        });
    } catch (error) {
        console.error('Workflow execution error:', error);
        res.status(500).json({ error: `Failed to execute workflow: ${(error as Error).message}` });
    }
});


export default router;