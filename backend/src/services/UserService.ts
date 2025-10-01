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
 */
async function register(userData: UserRegisterDto): Promise<Omit<User, 'pwdHash'>> {
  const { email, name, password } = userData;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new RouteError(HttpStatusCodes.CONFLICT, 'User with this email already exists.');
  }

  const pwdHash = await bcrypt.hash(password, SALT_ROUNDS);

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

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new RouteError(HttpStatusCodes.UNAUTHORIZED, 'Invalid email or password.');
  }

  const isPasswordValid = await bcrypt.compare(password, user.pwdHash);
  if (!isPasswordValid) {
    throw new RouteError(HttpStatusCodes.UNAUTHORIZED, 'Invalid email or password.');
  }

  const payload = { id: user.id };
  const secret = EnvVars.Jwt.Secret;
  const options = { expiresIn: EnvVars.Jwt.Exp };

  const token = jwt.sign(payload, secret, options);

  return { token };
}

/**
 * Assign a role to a user.
 */
async function assignRoleToUser(userId: number, roleId: number): Promise<User> {
  return prisma.user.update({
    where: { id: userId },
    data: {
      roles: {
        connect: { id: roleId },
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
        disconnect: { id: roleId },
      },
    },
  });
}

export default {
  register,
  login,
  assignRoleToUser,
  removeRoleFromUser,
} as const;
