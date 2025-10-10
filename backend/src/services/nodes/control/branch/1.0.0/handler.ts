import type { RunParams } from '@src/models/workflow';

export class NodeHandler {
  public async run({}: RunParams) {
    // The branch node's logic is handled by the SignalDrivenEngine.
    // This run function is a placeholder and should not be called directly.
    return {};
  }
}