import { NodeInstance } from "@src/models/workflow";
import { Signal } from "../types";
import { ExecutionState } from "../core/ExecutionState";
import { DataResolver } from "../core/DataResolver";
import { GraphWalker, getNodeDefinition } from "../GraphWalker";
import { IArchetypeHandler } from "../core/IArchetypeHandler";
import * as NodeExecutor from '../NodeExecutor';

export class PureHandler implements IArchetypeHandler {
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
      // Pure nodes are executed lazily by the DataResolver when their output is needed.
      // However, if a pure node is somehow triggered by a control signal,
      // we can proactively compute and cache its value.
      if (!state.hasCache(node.id)) {
        const inputs = await dataResolver.resolveAllInputs(node, signal);
        const outputs = await NodeExecutor.executeNodeLogic(node, inputs, state.hooks!);
        state.setCache(node.id, outputs);
      }
      state.hooks?.onNodeEnd(node.id, 'success');
    } catch (error) {
      console.error(`[Engine] Error executing pure node ${node.id}:`, error);
      state.hooks?.onNodeEnd(node.id, 'error');
    }
  }
}