import { Router } from 'express';
import Paths from '@src/common/constants/Paths';
import NodeDefinitionService from '@src/services/NodeDefinitionService';

const NodeDefinitionRoutes = Router();
/**
 * @swagger
 * /api/node-definitions:
 *   get:
 *     tags: [NodeDefinitions]
 *     summary: 获取所有节点定义
 *     responses:
 *       200:
 *         description: 成功获取节点定义列表
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/NodeDefinition'
 */

NodeDefinitionRoutes.get(Paths.NodeDefinitions.GetAll, (_, res) => {
  const definitions = NodeDefinitionService.getAll();
  return res.json(definitions);
});

export default NodeDefinitionRoutes;