import { Router } from 'express';

import Paths from '@src/common/constants/Paths';
import UserRoutes from './UserRoutes';
import WorkflowRoutes from './workfolwroutes';


/******************************************************************************
                                 Setup
******************************************************************************/

const apiRouter = Router();


// ** Add UserRouter ** //

// Init router
const userRouter = Router();

// Get all users
userRouter.get(Paths.Users.Get, UserRoutes.getAll);
userRouter.post(Paths.Users.Add, UserRoutes.add);
userRouter.put(Paths.Users.Update, UserRoutes.update);
userRouter.delete(Paths.Users.Delete, UserRoutes.delete);

// Add UserRouter
apiRouter.use(Paths.Users.Base, userRouter);

// ** Add WorkflowRouter ** //
apiRouter.use(Paths.Workflows.Base, WorkflowRoutes);


/******************************************************************************
                                Export default
******************************************************************************/

export default apiRouter;
