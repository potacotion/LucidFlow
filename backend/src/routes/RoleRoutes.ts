import { Router, Request, Response, NextFunction } from 'express';
import { RoleService } from '../services/RoleService';
import { authenticate, authorize } from '../common/middleware/auth.middleware';

const router = Router();

// --- CRUD Endpoints for Roles ---

// GET /roles - 获取所有角色
router.get(
  '/',
  authenticate,
  authorize(['Admin']),
  async (req, res, next) => {
    try {
      const roles = await RoleService.getAllRoles();
      res.json(roles);
    } catch (error) {
      next(error);
    }
  }
);

// POST /roles - 创建一个新角色
router.post(
  '/',
  authenticate,
  authorize(['Admin']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name } = req.body;
      const newRole = await RoleService.createRole(name);
      res.status(201).json(newRole);
    } catch (error) {
      next(error);
    }
  }
);

// GET /roles/:id - 获取单个角色
router.get(
  '/:id',
  authenticate,
  authorize(['Admin']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      const role = await RoleService.getRoleById(id);
      if (role) {
        res.json(role);
      } else {
        res.status(404).json({ message: 'Role not found' });
      }
    } catch (error) {
      next(error);
    }
  }
);

// PUT /roles/:id - 更新一个角色
router.put(
  '/:id',
  authenticate,
  authorize(['Admin']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { name } = req.body;
      const updatedRole = await RoleService.updateRole(id, name);
      res.json(updatedRole);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /roles/:id - 删除一个角色
router.delete(
  '/:id',
  authenticate,
  authorize(['Admin']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id, 10);
      await RoleService.deleteRole(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default router;
