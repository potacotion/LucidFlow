import { Router } from 'express';

import Paths from '@src/common/constants/Paths';
import AuthRoutes from './AuthRoutes';
import RoleRoutes from './RoleRoutes';
import WorkflowRoutes from './WorkflowRoutes';
import NodeDefinitionRoutes from './NodeDefinitionRoutes';
import FolderRoutes from './FolderRoutes';
import UserRoutes from './UserRoutes';
import ConfigRoutes from './ConfigRoutes';
import NodeDefinitionService from '@src/services/NodeDefinitionService';


// **** Setup **** //

const apiRouter = Router();

// ** Add AuthRouter ** //
apiRouter.use(Paths.Auth.Base, AuthRoutes);

// ** Add RoleRouter ** //
apiRouter.use(Paths.Roles.Base, RoleRoutes);

// Add WorkflowRouter
apiRouter.use(Paths.Workflows.Base, WorkflowRoutes);

// Add NodeDefinitionRouter
apiRouter.use(Paths.NodeDefinitions.Base, NodeDefinitionRoutes);

// Add FolderRouter
apiRouter.use(Paths.Folders.Base, FolderRoutes);

// Add UserRouter for role management
apiRouter.use(Paths.Users.Base, UserRoutes);

// Add ConfigRouter
apiRouter.use(Paths.Config.Base, ConfigRoutes);

/**
 * @swagger
 * /api/all-node-definitions:
 *   get:
 *     tags: [NodeDefinitions]
 *     summary: 获取所有节点定义（包含所有版本）
 *     responses:
 *       200:
 *         description: 成功获取节点定义列表（所有版本）
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/NodeDefinition'
 */
apiRouter.get(Paths.AllNodeDefinitions.Base, (_, res) => {
  const definitions = NodeDefinitionService.getAllWithVersions();
  return res.json(definitions);
});


// **** Export default **** //

export default apiRouter;
