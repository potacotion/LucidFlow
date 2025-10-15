import { NodeInstance, Edge, EngineHooks, NodeDefinition } from '@src/models/workflow';
import { GraphWalker, getNodeDefinition } from './GraphWalker';
import { NodeOutput } from './types';
import { ExecutionState } from './core/ExecutionState';
import { DataResolver } from './core/DataResolver';
import { IArchetypeHandler } from './core/IArchetypeHandler';

// Import all handlers
import { ActionHandler } from './handlers/ActionHandler';
import { BranchHandler } from './handlers/BranchHandler';
import { JoinHandler } from './handlers/JoinHandler';
import { PureHandler } from './handlers/PureHandler';
import { StreamActionHandler } from './handlers/StreamActionHandler';
import * as NodeExecutor from './NodeExecutor';

export class Engine {
  private handlers: Map<string, IArchetypeHandler>;

  constructor() {
    this.handlers = new Map<string, IArchetypeHandler>([
      ['action', new ActionHandler()],
      ['stream-action', new StreamActionHandler()],
      ['pure', new PureHandler()],
      ['branch', new BranchHandler()],
      ['join', new JoinHandler()],
    ]);
  }

  public async run(graph: { nodes: NodeInstance[], edges: Edge[] }, config: { runId: string; startNodeId: string; initialData?: any; hooks?: EngineHooks }): Promise<NodeOutput | void> {
    const { runId, startNodeId, initialData, hooks } = config;
    
    const graphWalker = new GraphWalker(graph.nodes, graph.edges);
    const state = new ExecutionState(runId, initialData, hooks);
    const dataResolver = new DataResolver(graphWalker, state);

    await this.setupInitialSignal(startNodeId, initialData, graphWalker, state, hooks);
    
    await this.loop(state, graphWalker, dataResolver);

    return this.collectFinalResults(graph.nodes, state, graphWalker, dataResolver);
  }

  private async setupInitialSignal(startNodeId: string, initialData: any, graphWalker: GraphWalker, state: ExecutionState, hooks?: EngineHooks) {
    const startNode = graphWalker.findNodeById(startNodeId);
    if (!startNode) {
        throw new Error(`Start node ID ${startNodeId} not found in the graph.`);
    }

    if (initialData !== undefined) {
        const startNodeDef = getNodeDefinition(startNode);
        if (startNodeDef.isTriggerable) {
            const outputs = await NodeExecutor.executeNodeLogic(startNode, initialData, hooks!);
            state.setCache(startNode.id, outputs);
            // Assuming trigger nodes have a standard 'out' control port
            state.enqueue({ nodeId: startNode.id, portName: 'out', dataType: 'control' });
        }
    } else {
        // Default start: trigger the 'in' control port of the start node
        state.enqueue({ nodeId: startNodeId, portName: 'in', dataType: 'control' });
    }
  }

  private async loop(state: ExecutionState, graphWalker: GraphWalker, dataResolver: DataResolver) {
    while (state.hasActiveTasks()) {
      if (!state.isQueueEmpty()) {
        const signal = state.dequeue()!;
        const node = graphWalker.findNodeById(signal.nodeId);
        if (node) {
            const definition = getNodeDefinition(node);
            const handler = this.handlers.get(definition.archetype);
            if (handler) {
                await handler.handle(node, signal, state, graphWalker, dataResolver);
            } else {
                console.warn(`[Engine] No handler found for archetype: ${definition.archetype}`);
            }
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
  }

  private async collectFinalResults(nodes: NodeInstance[], state: ExecutionState, graphWalker: GraphWalker, dataResolver: DataResolver): Promise<NodeOutput> {
    const endNodes = nodes.filter(n => n.type === 'special/end');
    const finalResults: NodeOutput = {};
    for (const endNode of endNodes) {
        // Temporarily create a dummy signal for context
        const dummySignal = {nodeId: '', portName: '', dataType: 'control' as const};
        const resultValue = await dataResolver.resolveAllInputs(endNode, dummySignal);
        const resultKey = endNode.label || `output_${endNode.id}`;
        finalResults[resultKey] = resultValue['result']; // Assuming end node has a 'result' input port
    }
    return finalResults;
  }
}