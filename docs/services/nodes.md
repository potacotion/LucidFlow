
# 详解：节点库 (`nodes/`)

节点库是 LucidFlow 功能的核心载体，包含了所有可供用户在工作流中使用的、具体的、可复用的功能单元。

## 1. 节点结构

系统中的每一个节点都遵循一个统一的、基于目录的结构。这种结构使得节点的管理、版本控制和动态加载变得简单清晰。

**目录结构:**

```
nodes/
└── [category]/            # 节点的类别 (e.g., math, control, llm)
    └── [node_name]/       # 节点的名称 (e.g., add, branch, openai)
        └── [version]/     # 节点的版本 (e.g., 1.0.0)
            ├── definition.ts  # 节点的静态定义 (元数据)
            ├── logic.ts       # 节点的业务逻辑实现
            └── (other files)  # 可能的辅助文件, 如 types.ts
```

-   **类别 (Category)**: 用于在 UI 中组织和分类节点。
-   **名称 (Name)**: 节点的唯一标识符。
-   **版本 (Version)**: 遵循语义化版本控制，允许节点逻辑的迭代和向后兼容。

## 2. 核心文件

### 2.1. `definition.ts`

此文件定义了节点的“签名”或元数据，它告诉执行引擎和前端 UI 如何与该节点交互。它通常导出一个 `NodeDefinition` 对象，包含以下关键信息：

-   `id`: 节点的唯一标识符，格式为 `category/name@version`。
-   `name`: 显示在 UI 上的友好名称。
-   `description`: 节点的详细功能描述。
-   `archetype`: 节点的执行原型（'action', 'branch', 'join', 'pure', 'stream-action'），这决定了它将由哪个 `Handler` 处理。
-   `ports`: 定义了节点的输入和输出端口。每个端口都包含：
    -   `name`: 端口的唯一名称。
    -   `direction`: 'in' 或 'out'。
    -   `type`: 'control'（控制流）或 'data'（数据流）。
    -   `schema`: 使用 Zod 定义的数据类型，用于校验和类型提示。
    -   `label`: 显示在 UI 上的标签。

### 2.2. `logic.ts`

此文件包含了节点的实际业务逻辑。它通常导出一个 `execute` 函数，该函数接收一个包含所有已解析输入值的