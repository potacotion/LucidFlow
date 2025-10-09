import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import EnvVars from '@src/common/constants/EnvVars';
import { RouteError } from '@src/common/util/route-errors';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { User, Role } from '@prisma/client';
import { findUserByIdWithRoles } from '@src/repos/UserRepo';
import ConfigService from '@src/services/ConfigService';

// Extend Express Request type to include the user payload from JWT
declare global {
  namespace Express {
    interface Request {
      user?: User & { roles: Role[] };
    }
  }
}

interface JwtPayload {
  id: number;
}

/**
 * Middleware to authenticate requests using JWT.
 */
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const globalConfig = await ConfigService.getGlobalConfig() as { multiUserMode?: boolean };

  if (globalConfig.multiUserMode === false) {
    // Single User Mode: bypass JWT and assume admin user (ID 1)
    const adminUser = await findUserByIdWithRoles(1);
    if (!adminUser) {
      throw new RouteError(
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        'Single User Mode is active, but default admin user (ID 1) was not found.'
      );
    }
    req.user = adminUser;
    return next();
  }
  
  // Multi User Mode: proceed with standard JWT authentication
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(HttpStatusCodes.UNAUTHORIZED).json({ error: 'Authentication token is required.' });
  }

  try {
    const payload = jwt.verify(token, EnvVars.Jwt.Secret) as JwtPayload;
    const user = await findUserByIdWithRoles(payload.id);

    if (!user) {
      return res.status(HttpStatusCodes.FORBIDDEN).json({ error: 'Invalid token: User not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(HttpStatusCodes.FORBIDDEN).json({ error: 'Invalid or expired token.' });
  }
}

/**
 * Higher-order function to create a middleware for role-based authorization.
 * @param allowedRoles - An array of role names that are allowed to access the route.
 */
export function authorize(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user || !user.roles) {
      throw new RouteError(HttpStatusCodes.FORBIDDEN, 'You do not have permission to perform this action.');
    }

    const userRoles = user.roles.map(role => role.name);
    const hasPermission = allowedRoles.some(allowedRole => userRoles.includes(allowedRole));

    if (!hasPermission) {
      throw new RouteError(HttpStatusCodes.FORBIDDEN, 'You do not have permission to perform this action.');
    }

    next();
  };
}