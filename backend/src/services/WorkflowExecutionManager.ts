import { v4 as uuidv4 } from 'uuid';
import { Graph, EngineHooks, NodeStatus } from '@src/models/workflow';
import { SignalDrivenEngine } from './SignalDrivenEngine';
import { connectionManager } from './WebSocketService';
import logger from 'jet-logger';

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

  public startExecution(runId: string): void {
    const context = this.pendingExecutions.get(runId);
    if (!context) {
      logger.warn(`No pending execution found for runId: ${runId}. It might have timed out or already started.`);
      return;
    }

    // Remove from pending and start
    this.pendingExecutions.delete(runId);

    logger.info(`Starting workflow execution for runId: ${runId}`);
    const engine = new SignalDrivenEngine();
    const { graph, hooks } = context;

    engine.run(graph, { runId, hooks }).then(finalResults => {
        logger.info(`[${runId}] Workflow execution finished.`);
        connectionManager.broadcast(runId, {
            event: 'workflow:end',
            payload: { status: 'completed', results: finalResults },
        });
    }).catch(error => {
        logger.err(`[${runId}] Workflow execution failed:`, error);
        connectionManager.broadcast(runId, {
            event: 'workflow:end',
            payload: { status: 'failed', error: error.message },
        });
    });
  }
}

export default new WorkflowExecutionManager();