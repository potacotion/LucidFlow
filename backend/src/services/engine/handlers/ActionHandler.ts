import { NodeInstance } from "@src/models/workflow";
import { Signal } from "../types";
import { ExecutionState } from "../core/ExecutionState";
import { DataResolver } from "../core/DataResolver";
import { GraphWalker, getNodeDefinition } from "../GraphWalker";
import { IArchetypeHandler } from "../core/IArchetypeHandler";
import * as NodeExecutor from '../NodeExecutor';
import { enqueueDownstreamSignals } from "../utils";

export class ActionHandler implements IArchetypeHandler {
  public async handle(
    node: NodeInstance,
    signal: Signal,
    state: ExecutionState,
    graphWalker: GraphWalker,
    dataResolver: DataResolver,
  ): Promise<void> {
    const definition = getNodeDefinition(node);
    state.hooks?.onNodeStart(node.id, definition.archetype);

    try {
      const inputs = await dataResolver.resolveAllInputs(node, signal);
      const outputs = await NodeExecutor.executeNodeLogic(node, inputs, state.hooks!);
      state.setCache(node.id, outputs);

      definition.ports
        .filter(p => p.type === 'control' && p.direction === 'out')
        .forEach(p => enqueueDownstreamSignals(node, p.name, 'control', state, graphWalker));
      
      state.hooks?.onNodeEnd(node.id, 'success');
    } catch (error) {
      console.error(`[Engine] Error executing action node ${node.id}:`, error);
      state.hooks?.onNodeEnd(node.id, 'error');
    }
  }
}