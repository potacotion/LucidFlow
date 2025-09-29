import { Router } from 'express';

import Paths from '@src/common/constants/Paths';
import AuthRoutes from './AuthRoutes';
import WorkflowRoutes from './WorkflowRoutes';
import NodeDefinitionRoutes from './NodeDefinitionRoutes';
import FolderRoutes from './FolderRoutes';


// **** Setup **** //

const apiRouter = Router();

// ** Add AuthRouter ** //
apiRouter.use(Paths.Auth.Base, AuthRoutes);

// Add WorkflowRouter
apiRouter.use(Paths.Workflows.Base, WorkflowRoutes);

// Add NodeDefinitionRouter
apiRouter.use(Paths.NodeDefinitions.Base, NodeDefinitionRoutes);

// Add FolderRouter
apiRouter.use(Paths.Folders.Base, FolderRoutes);


// **** Export default **** //

export default apiRouter;
