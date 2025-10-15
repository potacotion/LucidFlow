import { NodeInstance, PortDefinition } from "@src/models/workflow";
import { NodeOutput, Signal } from "../types";
import { ExecutionState } from "./ExecutionState";
import { GraphWalker, getNodeDefinition } from "../GraphWalker";
import * as NodeExecutor from '../NodeExecutor';

/**
 * Responsible for resolving the input data for a given node.
 * It handles data fetching from upstream nodes, caching, and recursive execution of pure nodes.
 */
export class DataResolver {
  private readonly graphWalker: GraphWalker;
  private readonly state: ExecutionState;

  constructor(graphWalker: GraphWalker, state: ExecutionState) {
    this.graphWalker = graphWalker;
    this.state = state;
  }

  public async resolveAllInputs(node: NodeInstance, signal: Signal): Promise<{ [key: string]: any }> {
    const inputs: { [key: string]: any } = {};
    const def = getNodeDefinition(node);
    
    const portsToProcess = node.ports || def.ports;
    const dataInputPorts = portsToProcess.filter((p: PortDefinition) => p.type === 'data' && p.direction === 'in');

    for (const port of dataInputPorts) {
      if (signal.dataType === 'data' && signal.portName === port.name) {
        inputs[port.name] = signal.data;
      } else {
        inputs[port.name] = await this.resolveInputData(node, port.name, signal);
      }
    }
    console.log(`[DEBUG] Resolved all inputs for ${node.id}:`, inputs);
    return inputs;
  }
  
  private async resolveInputData(targetNode: NodeInstance, targetPortName:string, signal: Signal): Promise<any> {
    console.log(`[DEBUG] Resolving input for ${targetNode.id}.${targetPortName}`);
    
    const context = this.state.getCache('context') as any;
    if (context?.loop && (targetPortName === 'item' || targetPortName === 'index')) {
        return context.loop[targetPortName];
    }

    const edge = this.graphWalker.findUpstreamEdge(targetNode.id, targetPortName);
    if (!edge) {
      const portsToSearch = targetNode.ports || getNodeDefinition(targetNode).ports;
      const portDef = portsToSearch.find((p: PortDefinition) => p.name === targetPortName);
      const defaultValue = portDef?.defaultValue;
      console.log(`[DEBUG] No upstream edge found for ${targetNode.id}.${targetPortName}. Using default value: ${defaultValue}`);
      return defaultValue;
    }
  
    const sourceNodeId = edge.source.nodeId;
    const sourcePortName = edge.source.portName;
  
    if (this.state.hasCache(sourceNodeId)) {
      const cachedValue = this.state.getCache(sourceNodeId)?.[sourcePortName];
      console.log(`[DEBUG] Found cached value for ${sourceNodeId}.${sourcePortName}: ${cachedValue}`);
      return cachedValue;
    }
  
    const sourceNode = this.graphWalker.findNodeById(sourceNodeId);
    if (!sourceNode) throw new Error(`Source node ${sourceNodeId} not found.`);
  
    const sourceNodeDef = getNodeDefinition(sourceNode);

    if (sourceNodeDef.archetype === 'stream-action') {
      return undefined;
    }

    if (sourceNodeDef.archetype !== 'pure') {
      throw new Error(`Execution error: Action node ${sourceNodeId} was not executed before its output was needed.`);
    }
  
    // Recursively execute the pure node to get its output
    const inputsForPureNode = await this.resolveAllInputs(sourceNode, signal);
    const outputs: NodeOutput = await NodeExecutor.executeNodeLogic(sourceNode, inputsForPureNode, this.state.hooks!);
    console.log(`[DEBUG] Recursively executed pure node ${sourceNodeId}. Outputs:`, outputs);

    this.state.setCache(sourceNodeId, outputs);
    return outputs[sourcePortName];
  }
}