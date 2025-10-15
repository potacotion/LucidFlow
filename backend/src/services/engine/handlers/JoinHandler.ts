import { NodeInstance, PortDefinition } from "@src/models/workflow";
import { Signal } from "../types";
import { ExecutionState } from "../core/ExecutionState";
import { DataResolver } from "../core/DataResolver";
import { GraphWalker, getNodeDefinition } from "../GraphWalker";
import { IArchetypeHandler } from "../core/IArchetypeHandler";
import { enqueueDownstreamSignals } from "../utils";

export class JoinHandler implements IArchetypeHandler {
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
      let joinState = state.getJoinState(node.id);
      if (!joinState) {
        const expected = (node.ports || definition.ports)
          .filter((p: PortDefinition) => p.type === 'control' && p.direction === 'in').length;
        joinState = { expected, received: 0 };
      }

      joinState.received++;
      state.setJoinState(node.id, joinState);

      if (joinState.received >= joinState.expected) {
        definition.ports
          .filter(p => p.type === 'control' && p.direction === 'out')
          .forEach(p => enqueueDownstreamSignals(node, p.name, 'control', state, graphWalker));
        state.clearJoinState(node.id);
      }
      
      state.hooks?.onNodeEnd(node.id, 'success');
    } catch (error) {
      console.error(`[Engine] Error executing join node ${node.id}:`, error);
      state.hooks?.onNodeEnd(node.id, 'error');
    }
  }
}