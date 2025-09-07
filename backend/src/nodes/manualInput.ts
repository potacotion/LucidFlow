import { NodeExecutor, ExecutionContext } from '../workflow/engine';

export class ManualInputNode implements NodeExecutor {
  async run(inputs: any, context: ExecutionContext): Promise<any> {
    // 手动输入节点直接返回其接收到的输入数据
    return inputs;
  }
}