import { NodeInstance, Edge, NodeDefinition } from '@src/models/workflow';
import NodeRegistry from '../node-definitions';

export function getNodeDefinition(node: NodeInstance): NodeDefinition {
  const definition = NodeRegistry.getDefinition(node.type, node.version);
  if (!definition) {
    throw new Error(`Node definition not found for type: ${node.type}, version: ${node.version}`);
  }
  return definition;
}

export class GraphWalker {
  private nodes: Map<string, NodeInstance>;
  private edges: Edge[];

  constructor(nodes: NodeInstance[], edges: Edge[]) {
    this.nodes = new Map(nodes.map(n => [n.id, n]));
    this.edges = edges;
  }

  getEdges(): Edge[] {
    return this.edges;
  }

  findNodeById(nodeId: string): NodeInstance | undefined {
    return this.nodes.get(nodeId);
  }

  findUpstreamEdge(targetNodeId: string, targetPortName: string): Edge | undefined {
    const targetNode = this.findNodeById(targetNodeId);
    if (!targetNode) return undefined;

    const nodeDef = getNodeDefinition(targetNode);
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