import { NodeInstance } from "@src/models/workflow";
import { ExecutionState } from "./core/ExecutionState";
import { GraphWalker } from "./GraphWalker";

export function enqueueDownstreamSignals(
  node: NodeInstance,
  fromPortName: string,
  dataType: 'control' | 'data',
  state: ExecutionState,
  graphWalker: GraphWalker,
  data?: any
) {
  const edges = graphWalker.getEdges().filter(e => e.source.nodeId === node.id && e.source.portName === fromPortName);
  for (const edge of edges) {
      state.enqueue({ 
        nodeId: edge.target.nodeId, 
        portName: edge.target.portName, 
        dataType: dataType, 
        data: data 
      });
  }
}