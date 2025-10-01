
import { Router, Request, Response, NextFunction } from 'express';
import UserService from '../services/UserService';
import { authenticate, authorize } from '../common/middleware/auth.middleware';

const router = Router();

// --- User Role Management ---

/**
 * @swagger
 * /api/users/{userId}/roles:
 *   post:
 *     summary: Assign a role to a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roleId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Role assigned successfully
 *       403:
 *         description: Forbidden
 */
router.post(
  '/:userId/roles',
  authenticate,
  authorize(['Admin']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      const { roleId } = req.body;
      const updatedUser = await UserService.assignRoleToUser(userId, roleId);
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/users/{userId}/roles/{roleId}:
 *   delete:
 *     summary: Remove a role from a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Role removed successfully
 *       403:
 *         description: Forbidden
 */
router.delete(
  '/:userId/roles/:roleId',
  authenticate,
  authorize(['Admin']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      const roleId = parseInt(req.params.roleId, 10);
      const updatedUser = await UserService.removeRoleFromUser(userId, roleId);
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
