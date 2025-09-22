import { NodeInstance, Edge, NodeDefinition, StreamPacket, PortDefinition } from '@src/models/workflow';
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
    const startNodes = graph.nodes.filter(n => {
      const def = getNodeDefinition(n.type);
      return def.archetype === 'action'; // Simplified: assume 'action' nodes with no control inputs are start nodes
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
      ? [def.ports.find((p: PortDefinition) => p.name === fromPortName)]
      : def.ports.filter((p: PortDefinition) => p.type === 'control' && p.direction === 'out');

    for (const port of controlOutPorts) {
      if (port) {
        const downstreamNodes = this.graphWalker.findDownstreamNodes(node.id, port.name);
        for (const downstreamNode of downstreamNodes) {
          // Assuming the edge connects to a control in port with the same name, which is a simplification
          this.enqueueSignal(downstreamNode.id, port.name); 
        }
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
    const outputs: NodeOutput = {}; // await runNodeLogic(sourceNode, inputsForPureNode);
  
    this.resultsCache.set(sourceNodeId, outputs);
    return outputs[sourcePortName];
  }

  private async execute(node: NodeInstance, incomingPort: string) {
    const definition = getNodeDefinition(node.type);
    const inputs = await this.resolveAllInputs(node);

    switch (definition.archetype) {
      case 'action':
      case 'pure': {
        // const outputs = await runNodeLogic(node, inputs);
        const outputs = {}; // Placeholder
        this.resultsCache.set(node.id, outputs);
        this.enqueueDownstreamControlSignals(node);
        break;
      }
      case 'branch': {
        const condition = inputs['condition'];
        const portToFire = condition ? 'truePath' : 'falsePath';
        this.enqueueSignal(node.id, portToFire);
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
        // for (const item of arrayToIterate) {
        //   await this.run(node.subgraph, { context: { item } });
        // }
        this.enqueueDownstreamControlSignals(node, 'loopCompleted');
        break;
      }
      case 'compound': {
        // const subgraphOutputs = await this.run(node.subgraph, { inputs });
        // this.resultsCache.set(node.id, subgraphOutputs);
        this.enqueueDownstreamControlSignals(node);
        break;
      }
    }
  }
}