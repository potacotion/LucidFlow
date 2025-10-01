import { Prisma, PrismaClient, UserSettings } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 根据用户 ID 查找用户及其角色
 * @param id - 用户 ID
 */
export async function findUserByIdWithRoles(id: number) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      roles: true, // 包含用户的角色信息
    },
  });
}

/**
 * 根据用户 ID 查找用户
 * @param id - 用户 ID
 */
export async function getOne(id: number) {
  return prisma.user.findUnique({
    where: { id },
    include: {
        settings: true,
    },
  });
}


/**
 * 更新用户设置
 * @param id - 用户 ID
 * @param settings - 新的设置
 */
export async function updateSettings(id: number, settings: Prisma.JsonObject) {
    return prisma.userSettings.upsert({
        where: { userId: id },
        update: { data: settings },
        create: {
            userId: id,
            data: settings,
        },
    });
}
