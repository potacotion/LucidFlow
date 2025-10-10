import type { RunParams } from '@src/models/workflow';

export class NodeHandler {
  public async run({}: RunParams) {
    console.log('[start] a long time task');
    await new Promise(resolve => setTimeout(resolve, 3000)); // 等待3秒 (修改为3秒以方便测试)
    console.log('[end] a long time task');
    return {};
  }
}