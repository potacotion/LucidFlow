import { Workflow, WorkflowNode, WorkflowEdge } from '../types/workflow';

export interface ExecutionContext {
  [nodeId: string]: any;
}

export interface NodeExecutor {
  run: (inputs: any, context: ExecutionContext) => Promise<any>;
}

export class WorkflowEngine {
  private nodeExecutors: Map<string, NodeExecutor>;

  constructor() {
    this.nodeExecutors = new Map();
  }

  registerNodeExecutor(type: string, executor: NodeExecutor) {
    this.nodeExecutors.set(type, executor);
  }

  async execute(workflow: Workflow, startNodeId: string, initialInputs: { [nodeId: string]: any }): Promise<ExecutionContext> {
    const context: ExecutionContext = { ...initialInputs };
    const nodesToExecute: WorkflowNode[] = [];

    // 1. 执行路径规划 (简化版：从startNodeId开始，按顺序执行后续节点)
    // 这是一个简化的深度优先遍历，只考虑从startNodeId开始的路径
    const visitedNodes = new Set<string>();
    const queue: WorkflowNode[] = [];

    const startNode = workflow.nodes.find(node => node.id === startNodeId);
    if (!startNode) {
      throw new Error(`Start node with ID ${startNodeId} not found.`);
    }

    queue.push(startNode);
    visitedNodes.add(startNodeId);

    let head = 0;
    while (head < queue.length) {
      const currentNode = queue[head++];
      nodesToExecute.push(currentNode);

      const outgoingEdges = workflow.edges.filter(edge => edge.source === currentNode.id);
      for (const edge of outgoingEdges) {
        const targetNode = workflow.nodes.find(node => node.id === edge.target);
        if (targetNode && !visitedNodes.has(targetNode.id)) {
          visitedNodes.add(targetNode.id);
          queue.push(targetNode);
        }
      }
    }

    // 2. 节点调度器：依次调用执行路径上各节点的 `run` 函数
    for (const node of nodesToExecute) {
      const executor = this.nodeExecutors.get(node.type);
      if (!executor) {
        console.warn(`No executor registered for node type: ${node.type}. Skipping node ${node.id}`);
        continue;
      }

      try {
        // 收集当前节点的输入，这里简化为直接从context中获取，实际可能需要更复杂的依赖解析
        const inputs = context[node.id] || node.data; // 优先使用initialInputs，否则使用node.data
        const result = await executor.run(inputs, context);
        context[node.id] = result; // 将结果存入上下文，供后续节点使用
      } catch (error) {
        console.error(`Error executing node ${node.id} (${node.type}):`, error);
        // 根据需求决定是否中断执行或记录错误并继续
        throw error;
      }
    }

    return context;
  }
}