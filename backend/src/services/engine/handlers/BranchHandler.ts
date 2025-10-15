import { NodeInstance } from "@src/models/workflow";
import { Signal } from "../types";
import { ExecutionState } from "../core/ExecutionState";
import { DataResolver } from "../core/DataResolver";
import { GraphWalker, getNodeDefinition } from "../GraphWalker";
import { IArchetypeHandler } from "../core/IArchetypeHandler";
import { enqueueDownstreamSignals } from "../utils";

export class BranchHandler implements IArchetypeHandler {
  public async handle(
    node: NodeInstance,
    signal: Signal,
    state: ExecutionState,
    graphWalker: GraphWalker,
    dataResolver: DataResolver
  ): Promise<void> {
    const definition = getNodeDefinition(node);
    state.hooks?.onNodeStart(node.id, definition.archetype);

    try {
      const inputs = await dataResolver.resolveAllInputs(node, signal);
      const condition = inputs['condition'];
      const portToFire = condition ? 'true' : 'false';
      
      enqueueDownstreamSignals(node, portToFire, 'control', state, graphWalker);
      
      state.hooks?.onNodeEnd(node.id, 'success');
    } catch (error) {
      console.error(`[Engine] Error executing branch node ${node.id}:`, error);
      state.hooks?.onNodeEnd(node.id, 'error');
    }
  }
}