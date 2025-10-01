
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const RoleService = {
  /**
   * 创建一个新角色
   * @param name - 角色名称
   */
  async createRole(name: string) {
    return prisma.role.create({
      data: { name },
    });
  },

  /**
   * 获取所有角色列表
   */
  async getAllRoles() {
    return prisma.role.findMany();
  },

  /**
   * 根据 ID 获取单个角色
   * @param id - 角色 ID
   */
  async getRoleById(id: number) {
    return prisma.role.findUnique({
      where: { id },
    });
  },

  /**
   * 更新一个已有的角色
   * @param id - 角色 ID
   * @param name - 新的角色名称
   */
  async updateRole(id: number, name: string) {
    return prisma.role.update({
      where: { id },
      data: { name },
    });
  },

  /**
   * 根据 ID 删除一个角色
   * @param id - 角色 ID
   */
  async deleteRole(id: number) {
    return prisma.role.delete({
      where: { id },
    });
  },
};