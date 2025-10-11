import { Prisma, PrismaClient, UserSettings } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 根据用户 ID 查找用户及其角色
 * @param id - 用户 ID
 */
export async function findUserByIdWithRoles(id: number) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      roles: {          // 先拿到桥表
        include: {
          role: true,   // 再拿到真正的 Role
        },
      },
    },
  });

  if (!user) return null;

  // 拍平成类型声明要的 Role[]
  return {
    ...user,
    roles: user.roles.map(r => r.role),
  };
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
