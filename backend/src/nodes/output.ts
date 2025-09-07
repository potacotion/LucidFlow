import { NodeExecutor, ExecutionContext } from '../workflow/engine';

export class OutputNode implements NodeExecutor {
  async run(inputs: any, context: ExecutionContext): Promise<any> {
    // 输出节点将输入数据标记为最终输出，并直接返回
    return inputs;
  }
}