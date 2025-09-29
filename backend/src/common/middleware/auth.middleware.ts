import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import EnvVars from '@src/common/constants/EnvVars';
import { RouteError } from '@src/common/util/route-errors';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { UserRoles } from '@prisma/client';

// Extend Express Request type to include the user payload from JWT
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: UserRoles;
      };
    }
  }
}

/**
 * Middleware to authenticate requests using JWT.
 */
export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(HttpStatusCodes.UNAUTHORIZED).json({ error: 'Authentication token is required.' });
  }

  try {
    const payload = jwt.verify(token, EnvVars.Jwt.Secret);
    req.user = payload as Express.Request['user'];
    next();
  } catch (error) {
    return res.status(HttpStatusCodes.FORBIDDEN).json({ error: 'Invalid or expired token.' });
  }
}

/**
 * Higher-order function to create a middleware for role-based authorization.
 * @param allowedRoles - An array of roles that are allowed to access the route.
 */
export function authorize(allowedRoles: UserRoles[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user || !allowedRoles.includes(user.role)) {
      throw new RouteError(
        HttpStatusCodes.FORBIDDEN,
        'You do not have permission to perform this action.',
      );
    }

    next();
  };
}