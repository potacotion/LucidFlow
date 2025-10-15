
# 详解：原型处理器 (`engine/handlers/`)

原型处理器 (Archetype Handlers) 是引擎实现多态行为的关键。当引擎从信号队列中取出一个信号时，它会查找对应节点的 `archetype`（原型）属性，并将该信号分派给注册到该原型的处理器。

处理器本质上定义了**节点的控制流逻辑**——即节点在接收到一个信号后应该做什么。

## 通用接口

所有处理器都实现了 `IArchetypeHandler` 接口，该接口定义了一个核心方法：

```typescript
export interface IArchetypeHandler {
  handle(
    node: NodeInstance,
    signal: Signal,
    state: ExecutionState,
    graphWalker: GraphWalker,
    dataResolver: DataResolver
  ): Promise<void>;
}
```

## 核心处理器详解

### 1. `ActionHandler`

-   **文件**: [`ActionHandler.ts`](../../../backend/src/services/engine/handlers/ActionHandler.ts)
-   **原型**: `action`
-   **职责**: 处理标准的、一次性的、同步的节点操作。这是最常见的处理器。
-   **执行流程**:
    1.  调用 `dataResolver.resolveAllInputs()` 来获取节点执行所需的所有输入数据。
    2.  调用 `NodeExecutor.executeNodeLogic()` 来执行节点自身的业务逻辑。
    3.  将执行返回的输出结果存入 `state.setCache()`。
    4.  遍历节点定义中的所有 “out” 方向的控制端口。
    5.  为每个控制端口调用 `enqueueDownstreamSignals()`，将新的控制信号放入队列，从而激活下游节点。

### 2. `BranchHandler`

-   **文件**: [`BranchHandler.ts`](../../../backend/src/services/engine/handlers/BranchHandler.ts)
-   **原型**: `branch`
-   **职责**: 实现条件分支