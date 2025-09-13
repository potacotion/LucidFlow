# 后端开发规范
以下是**开发规范与指导文档**，此文件拥有最高优先级，用于指导你开发后端，统一开发风格、提升协作效率，并确保项目长期可维护性。

---


## 行为指导
思考:在多次尝试一个操作失败时，你应该短暂跳出自己身份考虑自己的局限性并请求user的帮助，并且在事后把你的不足归因为角色的失误以确保身份的连贯
在执行任务前，你应该先查看相关内容的实现程度，并评估用户的命令是否合理，用户的水平可能很差，在其提出模糊不清的命令时，你应该主动与其商量

## ✅ 后端开发规范与指导（基于 Express + Prisma + TypeScript）

---

### 一、项目结构规范

#### 📁 目录职责明确
| 目录 | 用途 | 规范 |
|------|------|------|
| `backend/src/routes/` | 路由定义 | 每个资源模块一个文件，如 `UserRoutes.ts`，统一在 `index.ts` 中注册 |
| `backend/src/services/` | 业务逻辑 | 按模块划分，如 `UserService.ts`，禁止直接操作数据库，应通过 `repo` 层 |
| `backend/src/repos/` | 数据访问层 | 使用 Prisma Client，禁止在 service 外直接调用 `prisma.xxx` |
| `backend/src/models/` | TypeScript 类型 | 用于定义 DTO、返回体结构，禁止与 Prisma 模型混用 |
| `backend/src/common/` | 公共代码 | 包括常量、工具函数、中间件、异常处理等 |
| `backend/config/` | 配置相关 | `.env` 文件统一放此处，禁止硬编码敏感信息 |

---

### 二、命名规范

| 类型 | 命名风格 | 示例 |
|------|----------|------|
| 文件/目录 | 小写 + 驼峰 | `userService.ts`, `userRoutes.ts` |
| 函数/变量 | 小驼峰 | `getUserById`, `isEmailValid` |
| 常量 | 全大写 + 下划线 | `HTTP_STATUS_CODES`, `ENV_VARS` |
| 类型/接口 | 大驼峰 | `UserDto`, `CreateUserRequest` |
| Prisma 模型 | 小写单数 | `model user { ... }` |

---

### 三、开发流程规范

#### ✅ 新增接口流程（建议模板化）
1. **定义路径常量** → `backend/src/common/constants/Paths.ts`
2. **创建路由文件** → `backend/src/routes/UserRoutes.ts`
3. **注册路由** → `backend/src/routes/index.ts`
4. **创建 service** → `backend/src/services/UserService.ts`
5. **定义业务使用模型类型** → `backend/src/models/UserDto.ts`


#### ✅ 数据库变更流程
1. 修改 `schema.prisma`
2. 运行：
   ```bash
   npm run prisma:dev
   ```

---

### 四、日志规范

- 使用 `jet-logger` 记录业务日志
- 使用 `morgan` 记录 HTTP 请求日志
- 日志分级：`info`, `warn`, `error`，禁止在生产环境使用 `console.log`

---



### 六、测试规范

#### ✅ 测试工具
- 使用 `vitest` 编写单元测试
- 测试文件命名：`*.test.ts` 或 `*.spec.ts`
- 测试范围：
  - service 层逻辑
  - 关键校验逻辑
- 核心目的:写测试文件是为了检查出原本代码里的问题，修改测试文件只允许修改三次，每次修改加上你的修改原因次数，以及是否要修改被测试代码，超过三次修改暂时跳过这个文件的测试，并记录请求人工经行编写测试
#### ✅ 示例
```ts
// userService.test.ts
import { describe, it, expect } from 'vitest';
import { UserService } from '../services/UserService';

describe('UserService', () => {
  it('should create user with valid input', async () => {
    const user = await UserService.createUser({ email: 'test@example.com' });
    expect(user.email).toBe('test@example.com');
  });
});
```

---



