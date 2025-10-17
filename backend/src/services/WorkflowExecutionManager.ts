import { v4 as uuidv4 } from 'uuid';
import { Graph, EngineHooks, NodeStatus, NodeInstance, NodeDefinition } from '@src/models/workflow';
import { Engine} from './engine/index';
import { connectionManager } from './WebSocketService';
import logger from 'jet-logger';
import NodeRegistry from './node-definitions'; // 节点注册表

type ExecutionContext = {
  graph: Graph;
  hooks: EngineHooks;
  runId: string;
};

class WorkflowExecutionManager {
  private pendingExecutions = new Map<string, ExecutionContext>();

  public registerExecution(graph: Graph): { runId: string } {
    const runId = uuidv4();
    logger.info(`Registering workflow execution with runId: ${runId}`);

    const hooks: EngineHooks = {
      onNodeStart: (nodeId, archetype) => {
        logger.info(`[${runId}] Node ${nodeId} (${archetype}) started.`);
        connectionManager.broadcast(runId, {
          event: 'node:start',
          payload: { nodeId, archetype },
        });
      },
      onNodeEnd: (nodeId, status: NodeStatus) => {
        logger.info(`[${runId}] Node ${nodeId} finished with status: ${status}.`);
        connectionManager.broadcast(runId, {
          event: 'node:end',
          payload: { nodeId, status },
        });
      },
      onCustomEvent: (eventName: string, payload: any) => {
        logger.info(`[${runId}] Custom event received: ${eventName}.`);
        if (eventName === 'websocket:send' && payload.tag && payload.data !== undefined) {
          // 统一 WebSocket 消息格式 (任务 1.5 验收标准 2)
          connectionManager.broadcast(runId, {
            event: 'workflow:data',
            payload: { tag: payload.tag, data: payload.data },
          });
        }
      },
    };

    this.pendingExecutions.set(runId, { graph, hooks, runId });

    // Set a timeout to clean up if the client never connects
    setTimeout(() => {
      if (this.pendingExecutions.has(runId)) {
        logger.warn(`Execution context for runId ${runId} timed out and was removed.`);
        this.pendingExecutions.delete(runId);
      }
    }, 30000); // 30 seconds timeout

    return { runId };
  }

  /**
   * 启动一个已注册的执行上下文。该方法现在接收 triggerTag 以确定起点。
   *
   * @param runId 注册的执行ID
   * @param triggerTag 触发节点的唯一标签
   * @param initialData 传递给起始节点的数据
   */
  public async startExecution(runId: string, triggerTag: string, initialData?: any): Promise<void> {
    const context = this.pendingExecutions.get(runId);
    if (!context) {
      logger.warn(`No pending execution found for runId: ${runId}. It might have timed out or already started.`);
      return;
    }

    // Remove from pending and start
    this.pendingExecutions.delete(runId);

    const { graph, hooks } = context;

    let startNodeId: string | null = null;
    
    // 1. 尝试通过 triggerTag 查找触发节点 (新的、显式触发机制)
    startNodeId = this.findTriggerNodeId(graph, triggerTag);

    // 2. 如果是内部UI启动，且未找到标签匹配的节点，则回退到 legacy 模式
    if (!startNodeId && triggerTag === '__INTERNAL_UI_START__') {
        startNodeId = this.findLegacyStartNodeId(graph);
    }

    logger.info(`Starting workflow execution for runId: ${runId} from triggerTag: ${triggerTag}, startNodeId: ${startNodeId}`);

    if (!startNodeId) {
        const errorMsg = `No unique trigger node found for tag: ${triggerTag}. If launching from UI, ensure a 'trigger/manual' node with tag '__INTERNAL_UI_START__' or a single 'special/start' node exists.`;
        logger.err(`[${runId}] Workflow execution failed: ${errorMsg}`);
        // 统一 WebSocket 消息格式 (任务 1.5 验收标准 3: workflow:end 失败格式)
        connectionManager.broadcast(runId, {
            event: 'workflow:end',
            payload: { status: 'failed', error: errorMsg },
        });
        return;
    }

    const engine = new Engine();

    // 启动引擎 (使用新的签名) (任务 1.4 验收标准 4)
    engine.run(graph, { runId, startNodeId, initialData, hooks }).then(finalResults => {
        logger.info(`[${runId}] Workflow execution finished.`);
        // 统一 WebSocket 消息格式 (任务 1.5 验收标准 3: workflow:end 完成格式)
        connectionManager.broadcast(runId, {
            event: 'workflow:end',
            payload: { status: 'completed', results: finalResults },
        });
    }).catch(error => {
        logger.err(`[${runId}] Workflow execution failed:`, error);
        // 统一 WebSocket 消息格式 (任务 1.5 验收标准 3: workflow:end 失败格式)
        connectionManager.broadcast(runId, {
            event: 'workflow:end',
            payload: { status: 'failed', error: error.message },
        });
    });
  }

  /**
   * 遍历图结构，根据 triggerTag 查找唯一的起始节点 ID。
   */
  private findTriggerNodeId(graph: Graph, triggerTag: string): string | null {
    const matchingNodes: NodeInstance[] = [];

    for (const node of graph.nodes) {
        // 1. 获取 NodeDefinition
        // 注意: 我们假设 node.version 是正确的
        const definition = NodeRegistry.getDefinition(node.type, node.version);

        // 2. 检查 isTriggerable
        if (definition?.isTriggerable) {
            // 3. 检查 propertyValues.triggerTag
            const nodeTag = node.propertyValues?.triggerTag;
            if (nodeTag === triggerTag) {
                matchingNodes.push(node);
            }
        }
    }

    if (matchingNodes.length === 1) {
        return matchingNodes[0].id;
    }
    
    // 找不到、或找到多个，返回 null
    return null;
  }

  /**
   * 遍历图结构，查找唯一的 legacy 'special/start' 节点 ID。
   */
  private findLegacyStartNodeId(graph: Graph): string | null {
    // Legacy start node type
    const LEGACY_START_TYPE = 'special/start';

    const startNodes = graph.nodes.filter(node => node.type === LEGACY_START_TYPE);

    if (startNodes.length === 1) {
        // Legacy start node does not require initialData, execution starts from here.
        return startNodes[0].id;
    }
    
    // 找不到或找到多个
    return null;
  }
}

export default new WorkflowExecutionManager();