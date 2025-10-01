import { Router } from 'express';

import Paths from '@src/common/constants/Paths';
import AuthRoutes from './AuthRoutes';
import RoleRoutes from './RoleRoutes';
import WorkflowRoutes from './WorkflowRoutes';
import NodeDefinitionRoutes from './NodeDefinitionRoutes';
import FolderRoutes from './FolderRoutes';
import UserRoutes from './UserRoutes';
import ConfigRoutes from './ConfigRoutes';


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


// **** Export default **** //

export default apiRouter;
