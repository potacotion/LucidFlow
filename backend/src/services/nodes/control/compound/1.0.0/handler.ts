import type { RunParams } from '@src/models/workflow';

export class NodeHandler {
  public async run({}: RunParams) {
    // The compound node's logic is handled by the SignalDrivenEngine based on its subgraph.
    // This run function is a placeholder.
    return {};
  }
}