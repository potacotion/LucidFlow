import { Router, Request, Response } from 'express';
import ConfigService from '@src/services/ConfigService';
import UserService from '@src/services/UserService';
import { authenticate, authorize } from '@src/common/middleware/auth.middleware';
import Paths from '@src/common/constants/Paths';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { Prisma } from '@prisma/client';

const ConfigRoutes = Router();

/**
 * @swagger
 * tags:
 *   name: Config
 *   description: API for managing system and user configurations
 */


/**
 * @swagger
 * /api/config:
 *   get:
 *     summary: Retrieve the full configuration for the current user
 *     tags: [Config]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A merged configuration object (global + user)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: Unauthorized
 */
ConfigRoutes.get(
    Paths.Config.Root,
    authenticate,
    async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(HttpStatusCodes.UNAUTHORIZED).end();
        }
        const config = await ConfigService.getFullConfig(userId);
        return res.status(HttpStatusCodes.OK).json(config);
    }
);

/**
 * @swagger
 * /api/config/user:
 *   put:
 *     summary: Update user-specific settings
 *     tags: [Config]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: "A JSON object containing the user's settings. e.g. {\"theme\":\"dark\"}"
 *     responses:
 *       204:
 *         description: Settings updated successfully
 *       401:
 *         description: Unauthorized
 */
ConfigRoutes.put(
    Paths.Config.User,
    authenticate,
    async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(HttpStatusCodes.UNAUTHORIZED).end();
        }
        await ConfigService.updateUserSettings(userId, req.body as Prisma.JsonObject);
        return res.status(HttpStatusCodes.NO_CONTENT).end();
    }
);

/**
 * @swagger
 * /api/config/global:
 *   put:
 *     summary: Update global system settings (Admin only)
 *     tags: [Config]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: "A JSON object containing the global settings. e.g. {\"maintenanceMode\":true}"
 *     responses:
 *       204:
 *         description: Global settings updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
ConfigRoutes.put(
    Paths.Config.Global,
    authenticate,
    authorize(['Admin']),
    async (req: Request, res: Response) => {
        await ConfigService.updateGlobalSettings(req.body as Prisma.JsonObject);
        return res.status(HttpStatusCodes.NO_CONTENT).end();
    }
);

/**
 * @swagger
 * /api/config/needs-initialization:
 *   get:
 *     summary: Check if the system needs to be initialized (i.e., has no users)
 *     tags: [Config]
 *     responses:
 *       200:
 *         description: Returns a boolean indicating if initialization is needed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 needsInitialization:
 *                   type: boolean
 */
ConfigRoutes.get(
    Paths.Config.NeedsInitialization,
    async (_: Request, res: Response) => {
        const hasUsers = await UserService.hasUsers();
        return res.status(HttpStatusCodes.OK).json({ needsInitialization: !hasUsers });
    }
);

/**
 * @swagger
 * /api/config/initialize:
 *   put:
 *     summary: Initialize global system settings (only if no users exist)
 *     tags: [Config]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: "A JSON object containing the initial global settings."
 *     responses:
 *       204:
 *         description: Global settings initialized successfully
 *       403:
 *         description: Forbidden, users already exist in the system
 */
ConfigRoutes.put(
    Paths.Config.Initialize,
    async (req: Request, res: Response) => {
        await ConfigService.initializeSettings(req.body as Prisma.JsonObject);
        return res.status(HttpStatusCodes.NO_CONTENT).end();
    }
);

/**
 * @swagger
 * /api/config/is-multi-user:
 *   get:
 *     summary: Check if the system is in multi-user mode
 *     tags: [Config]
 *     responses:
 *       200:
 *         description: Returns a boolean indicating if multi-user mode is enabled.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isMultiUser:
 *                   type: boolean
 */
ConfigRoutes.get(
    Paths.Config.IsMultiUser,
    async (_: Request, res: Response) => {
        const isMultiUser = await ConfigService.isMultiUserMode();
        return res.status(HttpStatusCodes.OK).json({ isMultiUser });
    }
);

export default ConfigRoutes;