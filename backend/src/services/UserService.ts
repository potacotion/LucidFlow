import { PrismaClient, User } from '@prisma/client';
import { RouteError } from '@src/common/util/route-errors';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import EnvVars from '@src/common/constants/EnvVars';
import { UserLoginDto, UserRegisterDto } from '@src/models/UserDto';

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

/**
 * Register a new user.
 * The first user to register is automatically assigned the 'Admin' role.
 */
async function register(userData: UserRegisterDto): Promise<Omit<User, 'pwdHash'>> {
  const { email, name, password } = userData;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new RouteError(HttpStatusCodes.CONFLICT, 'User with this email already exists.');
  }

  const pwdHash = await bcrypt.hash(password, SALT_ROUNDS);
  const userCount = await prisma.user.count();

  let adminRoleData = {};
  if (userCount === 0) {
    const adminRole = await prisma.role.upsert({
      where: { name: 'Admin' },
      update: {},
      create: { name: 'Admin' },
    });
    adminRoleData = {
      roles: {
        create: [
          {
            assignedBy: 'System',
            role: {
              connect: { id: adminRole.id },
            },
          },
        ],
      },
    };
  }

  const user = await prisma.user.create({
    data: {
      email,
      name,
      pwdHash,
      settings: {
        create: {
          data: {}, // Initialize with empty settings
        },
      },
      ...adminRoleData,
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { pwdHash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Log in a user.
 */
async function login(credentials: UserLoginDto): Promise<{ token: string }> {
  const { email, password } = credentials;

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      roles: {
        select: { // Use select for explicit shaping
          role: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new RouteError(HttpStatusCodes.UNAUTHORIZED, 'Invalid email or password.');
  }

  const isPasswordValid = await bcrypt.compare(password, user.pwdHash);
  if (!isPasswordValid) {
    throw new RouteError(HttpStatusCodes.UNAUTHORIZED, 'Invalid email or password.');
  }

  const userRoles = user.roles.map(r => r.role.name);
  const isAdmin = userRoles.includes('Admin');

  const payload = {
    id: user.id,
    role: isAdmin ? 'Admin' : (userRoles[0] || 'user'),
  };
  
  const secret = EnvVars.Jwt.Secret;
  const options = { expiresIn: EnvVars.Jwt.Exp };

  const token = jwt.sign(payload, secret, options);

  return { token };
}

/**
 * Assign a role to a user.
 */
async function assignRoleToUser(userId: number, roleId: number, assignerName = 'System'): Promise<User> {
  // Check if the connection already exists
  const existingLink = await prisma.rolesOnUsers.findUnique({
    where: {
      userId_roleId: {
        userId,
        roleId,
      },
    },
  });

  if (existingLink) {
    // If the role is already assigned, just return the user without making changes.
    return prisma.user.findUniqueOrThrow({ where: { id: userId } });
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      roles: {
        create: [{ // Use 'create' to add a new record to the join table
          assignedBy: assignerName,
          role: {
            connect: { id: roleId }, // Connect to the existing role
          },
        }],
      },
    },
  });
}

/**
 * Remove a role from a user.
 */
async function removeRoleFromUser(userId: number, roleId: number): Promise<User> {
  return prisma.user.update({
    where: { id: userId },
    data: {
      roles: {
        delete: { // Use 'delete' with the composite key to remove a record from the join table
          userId_roleId: {
            userId,
            roleId,
          },
        },
      },
    },
  });
}

/**
 * Check if there are any users in the database.
 */
async function hasUsers(): Promise<boolean> {
  const userCount = await prisma.user.count();
  return userCount > 0;
}

export default {
  register,
  login,
  assignRoleToUser,
  removeRoleFromUser,
  hasUsers,
} as const;
