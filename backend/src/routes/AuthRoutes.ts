import { Request, Response, Router } from 'express';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import UserService from '@src/services/UserService';
import { UserLoginDto, UserRegisterDto } from '@src/models/UserDto';
import { RouteError } from '@src/common/util/route-errors';

const router = Router();

// Paths
const Paths = {
  Register: '/register',
  Login: '/login',
};

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegisterDto'
 *     responses:
 *       201:
 *         description: User created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *       409:
 *         description: User with this email already exists.
 */
async function register(req: Request<unknown, unknown, UserRegisterDto>, res: Response) {
  try {
    const user = await UserService.register(req.body);
    return res.status(HttpStatusCodes.CREATED).json(user);
  } catch (error) {
    if (error instanceof RouteError) {
      return res.status(error.status).json({ error: error.message });
    }
    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'An unexpected error occurred.' });
  }
}

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Log in a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLoginDto'
 *     responses:
 *       200:
 *         description: Login successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Invalid email or password.
 */
async function login(req: Request<unknown, unknown, UserLoginDto>, res: Response) {
  try {
    const { token } = await UserService.login(req.body);
    return res.status(HttpStatusCodes.OK).json({ token });
  } catch (error) {
    if (error instanceof RouteError) {
      return res.status(error.status).json({ error: error.message });
    }
    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'An unexpected error occurred.' });
  }
}

// Register routes
router.post(Paths.Register, register);
router.post(Paths.Login, login);

export default router;