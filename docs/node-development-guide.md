# 节点开发规范文档

本文档旨在为开发者提供一个清晰、统一的指南，用于在 LucidFlow 后端项目中创建新的执行节点。遵循本规范能够确保节点的一致性、可维护性和可扩展性。

## 1. 核心理念

系统中的每个节点都是一个独立的、可复用的功能单元。节点的定义与其执行逻辑分离，通过一个中央注册表 (`NodeRegistry`) 进行动态加载和管理。执行引擎 (`SignalDrivenEngine`) 根据节点的原型 (`archetype`) 调用其功能，实现整个工作流的驱动。

## 2. 节点文件结构

所有节点都必须存放在 `backend/src/services/nodes/` 目录下，并遵循严格的层级结构：

```
backend/src/services/nodes/
└── {category}/                # 节点的类别 (e.g., math, string, control)
    └── {node_name}/            # 节点的具体名称 (e.g., add, suffixer, branch)
        └── {version}/          # 节点的语义化版本 (e.g., 1.0.0, 1.1.0)
            ├── index.ts        # [必需] 节点定义文件
            └── handler.ts      # [推荐] 节点的业务逻辑实现
```

**示例:** `math/add` 节点的 `1.1.0` 版本

```
nodes/
└── math/
    └── add/
        └── 1.1.0/
            ├── index.ts
            └── handler.ts
```

-   **`{category}`**: 节点的分类，使用小写字母，例如 `math`, `logic`, `data`。
-   **`{node_name}`**: 节点的名称，使用小驼峰命名法，例如 `add`, `stringEquals`。
-   **`{version}`**: 节点的版本号，必须遵循 [语义化版本规范 (SemVer)](https://semver.org/)，例如 `1.0.0`。

## 3. 节点定义 (`index.ts`)

`index.ts` 文件是节点的入口，它**必须**导出一个符合 `NodeDefinition` 接口的默认对象。

### `NodeDefinition` 接口详解

```typescript
export interface NodeDefinition {
  // --- [必需] 核心元数据 ---
  type: string;           // 节点类型，必须与路径一致 (e.g., 'math/add')
  version: string;        // 节点版本，必须与路径一致 (e.g., '1.1.0')
  label: string;          // 在前端 UI 中显示的名称 (e.g., '加法')
  archetype: 'pure' | 'action' | 'stream-action' | 'branch' | 'join'; // 节点原型
  run: (params: NodeRunParams) => Promise<NodeOutput | ISubscribable>; // 核心执行函数

  // --- [可选] 描述与端口 ---
  description?: string;   // 节点的详细描述
  ports?: PortDefinition[]; // 节点的静态输入/输出端口列表
  
  // --- [可选] 动态端口与属性 ---
  dynamicPorts?: DynamicPorts; // 配置UI是否可动态增删端口
  propertyForm?: PropertyForm; // 为节点定义可在前端配置的属性
  isTriggerable?: boolean; // 标记该节点是否可以作为工作流的起点（例如手动触发器）
}
```

### 关键字段说明

-   **`type` & `version`**: **极其重要**。这两个字段的值必须与文件所在的目录路径完全匹配。`NodeRegistry` 会在启动时进行校验，如果不匹配，该节点将不会被加载。
-   **`label`**: 节点的显示名称，应简洁明了。
-   **`archetype`**: 节点的原型，决定了执行引擎如何处理它。
    -   `pure`: 纯函数节点。无副作用，给定相同输入总是返回相同输出。引擎可以按需（懒加载）或递归地执行它来获取数据。
    -   `action`: 行为节点。执行有副作用的操作（如 API 请求、数据库写入）。必须由控制流信号触发执行。
    -   `stream-action`: 流式行为节点。用于处理长时间运行或分步返回数据的任务。`run` 方法必须返回一个 `ISubscribable` 对象。
    -   `branch`: 分支节点。根据输入的 `condition` (布尔值) 决定触发 `true` 或 `false` 控制输出端口。
    -   `join`:**（暂未完全实现）** 合并节点。等待所有控制输入都到达后，才触发其输出。
-   **`ports`**: 定义节点的输入和输出端口。每个端口定义应包含 `name`, `label`, `type` (`control` 或 `data`), `direction` (`in` 或 `out`)，以及 `dataType` (如 `number`, `string`, `boolean`, `any`)。
-   **`run`**: 节点的核心逻辑函数。详见第 4 节。

### `index.ts` 示例

```typescript
// backend/src/services/nodes/math/add/1.1.0/index.ts
import { NodeDefinition } from '@src/models/workflow';
import { NodeHandler } from './handler';

const handler = new NodeHandler();
const run = handler.run.bind(handler); // 绑定 run 方法的 this 上下文

export default {
    type: 'math/add',
    label: '加法',
    version: '1.1.0',
    description: '计算所有输入端口数值的总和',
    archetype: 'pure',
    dynamicPorts: {
        canAdd: { 'in': true, 'out': false },
        portTemplate: {
            namePrefix: 'operand',
            labelPrefix: 'Operand',
            type: 'data',
            dataType: 'number',
            defaultValue: 0,
        },
    },
    ports: [
        { name: 'result', label: '结果', type: 'data', direction: 'out', dataType: 'number' },
    ],
    run,
} as NodeDefinition;
```

## 4. 节点逻辑 (`handler.ts`)

为了保持 `index.ts` 的整洁和专注，强烈推荐将节点的业务逻辑封装在 `handler.ts` 文件的一个类中。

### `run` 函数

`run` 函数是节点的执行核心。它接收一个参数对象，并返回一个包含所有输出端口值的 Promise。

**`run` 函数签名:**

```typescript
run: (params: NodeRunParams) => Promise<NodeOutput | ISubscribable>;
```

**`NodeRunParams` 接口:**

```typescript
interface NodeRunParams {
  input: { [portName: string]: any }; // 一个 key-value 对象，包含所有已连接的数据输入端口的值
  params: { [propertyName: string]: any }; // 节点实例上配置的属性值
  logger: Logger; // 日志记录器实例
  hooks: EngineHooks; // 引擎钩子，用于与外部系统交互
}
```

### `handler.ts` 示例

```typescript
// backend/src/services/nodes/math/add/1.1.0/handler.ts
import { NodeRunParams, NodeOutput } from '@src/models/workflow';

export class NodeHandler {
    
    public async run({ input }: NodeRunParams): Promise<NodeOutput> {
        let sum = 0;
        // 遍历所有输入端口的值
        for (const key in input) {
            const value = input[key];
            if (typeof value === 'number') {
                sum += value;
            }
        }
        
        // 返回一个对象，key 是输出端口的名称
        return {
            result: sum
        };
    }
}
```

## 5. 自动注册

开发者**无需**手动注册新创建的节点。只要文件结构和节点定义符合上述规范，`NodeRegistry` 服务会在应用启动时自动扫描、加载并注册所有节点。

你可以在应用启动时查看控制台日志，确认你的节点是否被成功加载。

## 6. 开发流程总结

1.  **确定节点类型**: 在 `backend/src/services/nodes/`下，为你的新节点确定一个合适的 `category` 和 `node_name`。
2.  **创建版本目录**: 在节点名称目录下，创建一个符合 SemVer 规范的版本号目录。
3.  **创建 `handler.ts`**: 在版本目录中创建 `handler.ts`，并编写一个包含 `run` 方法的类，实现节点的业务逻辑。
4.  **创建 `index.ts`**: 在版本目录中创建 `index.ts`。
5.  **编写节点定义**: 在 `index.ts` 中，导入 `handler`，并导出一个完整的 `NodeDefinition` 对象。
6.  **校验核心字段**: 仔细检查 `type` 和 `version` 字段是否与文件路径完全匹配。
7.  **启动并测试**: 重启后端服务，检查控制台日志确保节点已注册。通过前端流程设计器或 API 调用来测试节点的行为。