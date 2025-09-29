import { NodeInstance, Edge, NodeDefinition, PortDefinition, isSubscribable, ISubscribable } from '@src/models/workflow';
import * as NodeExecutor from './NodeExecutor';
import { NODE_DEFINITIONS } from './node-definitions';

function getNodeDefinition(nodeType: string): NodeDefinition {
  const definition = NODE_DEFINITIONS.get(nodeType);
  if (!definition) {
    throw new Error(`Node definition not found for type: ${nodeType}`);
  }
  return definition;
}

type Signal = {
  nodeId: string;
  portName: string;
  // 'control' signals trigger execution, 'data' signals carry data payloads.
  dataType: 'control' | 'data';
  data?: any;
};

type NodeOutput = {
  [portName: string]: any;
};

type JoinState = {
  expected: number;
  received: number;
};

class GraphWalker {
  private nodes: Map<string, NodeInstance>;
  private edges: Edge[];

  constructor(nodes: NodeInstance[], edges: Edge[]) {
    this.nodes = new Map(nodes.map(n => [n.id, n]));
    this.edges = edges;
  }

  findNodeById(nodeId: string): NodeInstance | undefined {
    return this.nodes.get(nodeId);
  }

  findUpstreamEdge(targetNodeId: string, targetPortName: string): Edge | undefined {
    const targetNode = this.findNodeById(targetNodeId);
    if (!targetNode) return undefined;

    const nodeDef = getNodeDefinition(targetNode.type);
    const portDef = (targetNode.ports || nodeDef.ports).find(p => p.name === targetPortName);

    if (!portDef) return undefined; // Port not found on instance or definition

    const matchingEdges = this.edges.filter(edge =>
        edge.target.nodeId === targetNodeId && edge.target.portName === targetPortName
    );

    if (matchingEdges.length > 1) {
        if (portDef.type === 'data') {
            throw new Error(`[Engine Integrity Error] Data port ${targetNodeId}.${targetPortName} has more than one connection. Data inputs must have exactly one connection.`);
        }
        if (portDef.type === 'control' && nodeDef.archetype !== 'join') {
            throw new Error(`[Engine Integrity Error] Control port ${targetNodeId}.${targetPortName} on a non-join node ('${nodeDef.archetype}') has more than one connection.`);
        }
    }

    return matchingEdges[0];
  }
}

export class SignalDrivenEngine {
  private executionQueue: Signal[] = [];
  private resultsCache: Map<string, NodeOutput> = new Map();
  private activeJoins: Map<string, JoinState> = new Map();
  private activeAsyncTasks: Map<string, any> = new Map();
  private _asyncTaskCounter = 0;
  private graphWalker!: GraphWalker;

  public async run(graph: { nodes: NodeInstance[], edges: Edge[] }, context?: any): Promise<NodeOutput | void> {
    this.executionQueue = [];
    this.resultsCache.clear();
    this.activeJoins.clear();
    this.activeAsyncTasks.clear();
    this.graphWalker = new GraphWalker(graph.nodes, graph.edges);

    if (context) {
        this.resultsCache.set('context', context);
    }

    const startNodes = graph.nodes.filter(node => {
        const def = getNodeDefinition(node.type);
        if (def.archetype !== 'action' && def.archetype !== 'stream-action') {
            return false;
        }
        const controlInputPorts = def.ports.filter(p => p.type === 'control' && p.direction === 'in');
        if (controlInputPorts.length === 0) return true;
        return !controlInputPorts.some(p => this.graphWalker.findUpstreamEdge(node.id, p.name));
    });

    for (const startNode of startNodes) {
      this.enqueueSignal(startNode.id, 'in', 'control'); // Assuming a default 'in' control port for starting
    }

    await this.loop();

    const endNodes = graph.nodes.filter(n => n.type === 'special/end');
    const finalResults: NodeOutput = {};
    for (const endNode of endNodes) {
        const resultValue = await this.resolveInputData(endNode, 'result', {nodeId: '', portName: '', dataType: 'control'});
        // Use the node's label or a default name for the result key
        const resultKey = endNode.label || `output_${endNode.id}`;
        finalResults[resultKey] = resultValue;
    }
    return finalResults;
  }

  private _hasActiveTasks(): boolean {
    return this.executionQueue.length > 0 || this.activeAsyncTasks.size > 0;
  }

  private async loop() {
    while (this._hasActiveTasks()) {
      if (this.executionQueue.length > 0) {
        const signal = this.executionQueue.shift();
        if (signal) {
          const node = this.graphWalker.findNodeById(signal.nodeId);
          if (node) {
            await this.execute(node, signal);
          }
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
  }

  private enqueueSignal(nodeId: string, portName: string, dataType: 'control' | 'data', data?: any) {
    this.executionQueue.push({ nodeId, portName, dataType, data });
  }

  private enqueueDownstreamSignals(node: NodeInstance, fromPortName: string, dataType: 'control' | 'data', data?: any) {
    const edges = this.graphWalker['edges'].filter(e => e.source.nodeId === node.id && e.source.portName === fromPortName);
    for (const edge of edges) {
        this.enqueueSignal(edge.target.nodeId, edge.target.portName, dataType, data);
    }
  }

  private async resolveAllInputs(node: NodeInstance, signal: Signal): Promise<{ [key: string]: any }> {
    const inputs: { [key: string]: any } = {};
    const def = getNodeDefinition(node.type);
    
    // [FIX] Use ports from the instance if they exist, otherwise fallback to the definition.
    const portsToProcess = node.ports || def.ports;
    const dataInputPorts = portsToProcess.filter((p: PortDefinition) => p.type === 'data' && p.direction === 'in');

    for (const port of dataInputPorts) {
      // Priority 1: Direct data from an incoming data signal
      if (signal.dataType === 'data' && signal.portName === port.name) {
        inputs[port.name] = signal.data;
      } else {
        // Priority 2: Pull data from upstream nodes
        inputs[port.name] = await this.resolveInputData(node, port.name, signal);
      }
    }
    console.log(`[DEBUG] Resolved all inputs for ${node.id}:`, inputs);
    return inputs;
  }
  
  private async resolveInputData(targetNode: NodeInstance, targetPortName:string, signal: Signal): Promise<any> {
    console.log(`[DEBUG] Resolving input for ${targetNode.id}.${targetPortName}`);
    // Context resolution (e.g., for loops)
    const context = this.resultsCache.get('context') as any;
    if (context?.loop && (targetPortName === 'item' || targetPortName === 'index')) {
        return context.loop[targetPortName];
    }
    
    const edge = this.graphWalker.findUpstreamEdge(targetNode.id, targetPortName);
    if (!edge) {
      const portsToSearch = targetNode.ports || getNodeDefinition(targetNode.type).ports;
      const portDef = portsToSearch.find((p: PortDefinition) => p.name === targetPortName);
      const defaultValue = portDef?.defaultValue;
      console.log(`[DEBUG] No upstream edge found for ${targetNode.id}.${targetPortName}. Port definition:`, portDef, `Using default value: ${defaultValue}`);
      return defaultValue;
    }
  
    const sourceNodeId = edge.source.nodeId;
    const sourcePortName = edge.source.portName;
  
    if (this.resultsCache.has(sourceNodeId)) {
      const cachedValue = this.resultsCache.get(sourceNodeId)?.[sourcePortName];
      console.log(`[DEBUG] Found cached value for ${sourceNodeId}.${sourcePortName}: ${cachedValue}`);
      return cachedValue;
    }
  
    const sourceNode = this.graphWalker.findNodeById(sourceNodeId);
    if (!sourceNode) throw new Error(`Source node ${sourceNodeId} not found.`);
  
    const sourceNodeDef = getNodeDefinition(sourceNode.type);

    if (sourceNodeDef.archetype === 'stream-action') {
      // It's a stream-action. We don't pull from it directly.
      // Data is expected to be pushed via data signals.
      // We return undefined, assuming the downstream node can handle it
      // until the actual data arrives via a data signal.
      return undefined;
    }

    if (sourceNodeDef.archetype !== 'pure') {
      // This error is the root of our previous failures.
      // A non-pure node's output should only be available after it has been executed via a control signal.
      // If we are here, it means a node is trying to PULL data from an action node that has not run yet.
      // With the new model, data from stream-actions is PUSHED via data signals, so we should not hit this error.
      throw new Error(`Execution error: Action node ${sourceNodeId} was not executed before its output was needed.`);
    }
  
    const inputsForPureNode = await this.resolveAllInputs(sourceNode, signal);
    const outputs: NodeOutput = await NodeExecutor.executeNodeLogic(sourceNode, inputsForPureNode);
    console.log(`[DEBUG] Recursively executed pure node ${sourceNodeId}. Outputs:`, outputs);

    this.resultsCache.set(sourceNodeId, outputs);
    return outputs[sourcePortName];
  }

  private async execute(node: NodeInstance, signal: Signal) {
    const definition = getNodeDefinition(node.type);
    const inputs = await this.resolveAllInputs(node, signal);

    switch (definition.archetype) {
      case 'action': {
        const outputs = await NodeExecutor.executeNodeLogic(node, inputs);
        this.resultsCache.set(node.id, outputs);
        // Fire all downstream control ports
        definition.ports
          .filter(p => p.type === 'control' && p.direction === 'out')
          .forEach(p => this.enqueueDownstreamSignals(node, p.name, 'control'));
        break;
      }
      case 'stream-action': {
        const result = await NodeExecutor.executeNodeLogic(node, inputs);
        if (!isSubscribable(result)) {
            throw new Error(`stream-action node ${node.id} did not return a subscribable object.`);
        }
        this.resultsCache.set(node.id, result);
        this._handleSubscribable(node, result);
        break;
      }
      case 'pure': {
        const outputs = await NodeExecutor.executeNodeLogic(node, inputs);
        this.resultsCache.set(node.id, outputs);
        // Pure nodes do not trigger control flow.
        break;
      }
      case 'branch': {
        const condition = inputs['condition'];
        const portToFire = condition ? 'true' : 'false';
        this.enqueueDownstreamSignals(node, portToFire, 'control');
        break;
      }
      case 'join': {
        let state = this.activeJoins.get(node.id);
        if (!state) {
          const expected = definition.ports.filter(p => p.type === 'control' && p.direction === 'in').length;
          state = { expected, received: 0 };
        }
        state.received++;
        this.activeJoins.set(node.id, state);

        if (state.received >= state.expected) {
          definition.ports
            .filter(p => p.type === 'control' && p.direction === 'out')
            .forEach(p => this.enqueueDownstreamSignals(node, p.name, 'control'));
          this.activeJoins.delete(node.id);
        }
        break;
      }
      // ... other archetypes like loop, compound, etc. would be handled here
    }
  }

  private _handleSubscribable(node: NodeInstance, subscribable: ISubscribable) {
    const taskId = `task_${this._asyncTaskCounter++}`;

    const subscription = subscribable.subscribe({
      onData: (portName, data) => {
        console.log(`[Engine] Data received for ${node.id} on port ${portName}:`, data);
        // PUSH the data to downstream nodes via a data signal
        this.enqueueDownstreamSignals(node, portName, 'data', data);
      },
      onError: (portName, error) => {
        console.error(`[Engine] Error from subscribable task for node ${node.id} on port ${portName}:`, error);
        // Optionally, fire an error control port
        this.enqueueDownstreamSignals(node, `on${portName.charAt(0).toUpperCase() + portName.slice(1)}Error`, 'control');
        subscription.unsubscribe();
        this.activeAsyncTasks.delete(taskId);
      },
      onDone: (portName) => {
        console.log(`[Engine] Subscribable task for node ${node.id} on port ${portName} is done.`);
        // Fire the "done" control port
        this.enqueueDownstreamSignals(node, `on${portName.charAt(0).toUpperCase() + portName.slice(1)}Done`, 'control');
        subscription.unsubscribe();
        this.activeAsyncTasks.delete(taskId);
      }
    });

    this.activeAsyncTasks.set(taskId, subscription);
  }
}