import { NodeInstance, isSubscribable, ISubscribable } from "@src/models/workflow";
import { Signal } from "../types";
import { ExecutionState } from "../core/ExecutionState";
import { DataResolver } from "../core/DataResolver";
import { GraphWalker, getNodeDefinition } from "../GraphWalker";
import { IArchetypeHandler } from "../core/IArchetypeHandler";
import * as NodeExecutor from '../NodeExecutor';
import { enqueueDownstreamSignals } from "../utils";

export class StreamActionHandler implements IArchetypeHandler {
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
      const result = await NodeExecutor.executeNodeLogic(node, inputs, state.hooks!);

      if (!isSubscribable(result)) {
        throw new Error(`stream-action node ${node.id} did not return a subscribable object.`);
      }

      state.setCache(node.id, result);
      this.handleSubscribable(node, result, state, graphWalker);

    } catch (error) {
      console.error(`[Engine] Error executing stream-action node ${node.id}:`, error);
      state.hooks?.onNodeEnd(node.id, 'error');
    }
  }

  private handleSubscribable(node: NodeInstance, subscribable: ISubscribable, state: ExecutionState, graphWalker: GraphWalker) {
    const taskId = state.addAsyncTask(null); // Pass null or the subscription object itself

    const subscription = subscribable.subscribe({
      onData: (portName, data) => {
        console.log(`[Engine] Data received for ${node.id} on port ${portName}:`, data);
        enqueueDownstreamSignals(node, portName, 'data', state, graphWalker, data);
      },
      onError: (portName, error) => {
        console.error(`[Engine] Error from subscribable task for node ${node.id} on port ${portName}:`, error);
        state.hooks?.onNodeEnd(node.id, 'error');
        enqueueDownstreamSignals(node, `on${portName.charAt(0).toUpperCase() + portName.slice(1)}Error`, 'control', state, graphWalker);
        subscription.unsubscribe();
        state.removeAsyncTask(taskId);
      },
      onDone: (portName) => {
        console.log(`[Engine] Subscribable task for node ${node.id} on port ${portName} is done.`);
        state.hooks?.onNodeEnd(node.id, 'success');
        enqueueDownstreamSignals(node, `on${portName.charAt(0).toUpperCase() + portName.slice(1)}Done`, 'control', state, graphWalker);
        subscription.unsubscribe();
        state.removeAsyncTask(taskId);
      }
    });

    // We might want to store the subscription itself in the async task map
    // state.addAsyncTask(subscription); // if we decide to do that.
  }
}