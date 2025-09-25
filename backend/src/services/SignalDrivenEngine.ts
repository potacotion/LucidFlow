import { NodeInstance, Edge, NodeDefinition, StreamPacket, PortDefinition } from '@src/models/workflow';
import { executeNodeLogic } from './NodeExecutor';
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
};

type NodeOutput = {
  [portName: string]: any | StreamPacket[];
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
    return this.edges.find(edge => 
      edge.target.nodeId === targetNodeId && edge.target.portName === targetPortName
    );
  }

  findDownstreamNodes(sourceNodeId: string, sourcePortName: string): NodeInstance[] {
    const downstreamEdges = this.edges.filter(edge => 
      edge.source.nodeId === sourceNodeId && edge.source.portName === sourcePortName
    );
    return downstreamEdges.map(edge => this.findNodeById(edge.target.nodeId)).filter(n => n) as NodeInstance[];
  }
}

export class SignalDrivenEngine {
  private executionQueue: Signal[] = [];
  private resultsCache: Map<string, NodeOutput> = new Map();
  private activeJoins: Map<string, JoinState> = new Map();
  // private activeStreams: Map<string, any> = new Map(); // Placeholder for stream management
  private graphWalker!: GraphWalker;

  public async run(graph: { nodes: NodeInstance[], edges: Edge[] }) {
    this.executionQueue = [];
    this.resultsCache.clear();
    this.activeJoins.clear();
    this.graphWalker = new GraphWalker(graph.nodes, graph.edges);

    // Initialization: Find start nodes and enqueue the first signals
    const startNodes = graph.nodes.filter(node => {
        const def = getNodeDefinition(node.type);
        if (def.archetype !== 'action') {
            return false;
        }
        // An action node is a start node if none of its control input ports are connected.
        const controlInputPorts = def.ports.filter(p => p.type === 'control' && p.direction === 'in');
        if (controlInputPorts.length === 0) {
            // If it has no control inputs defined, it could be a start node.
            return true;
        }
        const isAnyControlInputConnected = controlInputPorts.some(p =>
            this.graphWalker.findUpstreamEdge(node.id, p.name)
        );
        return !isAnyControlInputConnected;
    });

    for (const startNode of startNodes) {
      const def = getNodeDefinition(startNode.type);
      const controlOutPorts = def.ports.filter((p: PortDefinition) => p.type === 'control' && p.direction === 'out');
      for (const port of controlOutPorts) {
        this.enqueueSignal(startNode.id, port.name);
      }
    }

    await this.loop();
  }

  private async loop() {
    while (this.executionQueue.length > 0) {
      const signal = this.executionQueue.shift();
      if (signal) {
        const node = this.graphWalker.findNodeById(signal.nodeId);
        if (node) {
          await this.execute(node, signal.portName);
        }
      }
    }
  }

  private enqueueSignal(nodeId: string, portName: string) {
    this.executionQueue.push({ nodeId, portName });
  }

  private enqueueDownstreamControlSignals(node: NodeInstance, fromPortName?: string) {
    const def = getNodeDefinition(node.type);
    const controlOutPorts = fromPortName
      ? def.ports.filter((p: PortDefinition) => p.name === fromPortName && p.type === 'control' && p.direction === 'out')
      : def.ports.filter((p: PortDefinition) => p.type === 'control' && p.direction === 'out');

    for (const port of controlOutPorts) {
      const edges = this.graphWalker['edges'].filter(e => e.source.nodeId === node.id && e.source.portName === port.name);
      for (const edge of edges) {
        this.enqueueSignal(edge.target.nodeId, edge.target.portName);
      }
    }
  }

  private async resolveAllInputs(node: NodeInstance): Promise<{ [key: string]: any }> {
    const inputs: { [key: string]: any } = {};
    const def = getNodeDefinition(node.type);
    const dataInputPorts = def.ports.filter((p: PortDefinition) => p.type === 'data' && p.direction === 'in');

    for (const port of dataInputPorts) {
      inputs[port.name] = await this.resolveInputData(node, port.name);
    }
    return inputs;
  }
  
  private async resolveInputData(targetNode: NodeInstance, targetPortName: string): Promise<any> {
    const edge = this.graphWalker.findUpstreamEdge(targetNode.id, targetPortName);
    if (!edge) {
      const portDef = getNodeDefinition(targetNode.type).ports.find((p: PortDefinition) => p.name === targetPortName);
      return portDef?.defaultValue;
    }
  
    const sourceNodeId = edge.source.nodeId;
    const sourcePortName = edge.source.portName;
  
    if (this.resultsCache.has(sourceNodeId)) {
      return this.resultsCache.get(sourceNodeId)?.[sourcePortName];
    }
  
    const sourceNode = this.graphWalker.findNodeById(sourceNodeId);
    if (!sourceNode) throw new Error(`Source node ${sourceNodeId} not found.`);
  
    const sourceNodeDef = getNodeDefinition(sourceNode.type);
    if (sourceNodeDef.archetype !== 'pure') {
      throw new Error(`Execution error: Action node ${sourceNodeId} was not executed before its output was needed.`);
    }
  
    const inputsForPureNode = await this.resolveAllInputs(sourceNode);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const outputs: NodeOutput = await executeNodeLogic(sourceNode, inputsForPureNode);
  
    this.resultsCache.set(sourceNodeId, outputs);
    return outputs[sourcePortName];
  }

  private async execute(node: NodeInstance, incomingPort: string) {
    const definition = getNodeDefinition(node.type);
    const inputs = await this.resolveAllInputs(node);

    switch (definition.archetype) {
      case 'action':{
        const outputs = await executeNodeLogic(node, inputs);
        this.resultsCache.set(node.id, outputs);
        this.enqueueDownstreamControlSignals(node);
        break;
      }
      case 'pure': {
        const outputs = await executeNodeLogic(node, inputs);
        this.resultsCache.set(node.id, outputs);
                //this.enqueueDownstreamControlSignals(node);
        // 关键修复：纯节点(Pure Node)不应该触发控制流。
        // 它们只应该在数据被下游节点需要时被动执行并返回结果。

        break;
      }
      case 'branch': {
        const condition = inputs['condition'];
        const portToFire = condition ? 'true' : 'false';
        // The logic is now correctly handled by the improved enqueueDownstreamControlSignals
        this.enqueueDownstreamControlSignals(node, portToFire);
        break;
      }
      case 'merge': {
        this.enqueueDownstreamControlSignals(node);
        break;
      }
      case 'fork': {
        this.enqueueDownstreamControlSignals(node);
        break;
      }
      case 'join': {
        let state = this.activeJoins.get(node.id);
        if (!state) {
          const def = getNodeDefinition(node.type);
          const expected = def.ports.filter((p: PortDefinition) => p.type === 'control' && p.direction === 'in').length;
          state = { expected, received: 0 };
        }
        state.received++;
        this.activeJoins.set(node.id, state);

        if (state.received === state.expected) {
          this.enqueueDownstreamControlSignals(node);
          this.activeJoins.delete(node.id);
        }
        break;
      }
      case 'loop': {
        // const arrayToIterate = inputs[node.propertyValues.iteratorInputName];
        // if (node.subgraph) {
        //   for (const item of arrayToIterate) {
        //     const loopEngine = new SignalDrivenEngine();
        //     // await loopEngine.run(node.subgraph, { context: { item } });
        //   }
        // }
        this.enqueueDownstreamControlSignals(node, 'loopCompleted');
        break;
      }
      case 'compound': {
        // if (node.subgraph) {
        //   const subgraphEngine = new SignalDrivenEngine();
        //   // const subgraphOutputs = await subgraphEngine.run(node.subgraph, { inputs });
        //   // this.resultsCache.set(node.id, subgraphOutputs);
        // }
        this.enqueueDownstreamControlSignals(node);
        break;
      }
    }
  }
}