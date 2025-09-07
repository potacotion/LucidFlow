import { NodeExecutor, ExecutionContext } from '../workflow/engine';

export class CodeNode implements NodeExecutor {
  async run(inputs: { code: string; args: { [key: string]: any } }, context: ExecutionContext): Promise<any> {
    try {
      // 在MVP阶段，不使用沙箱，直接执行JS代码
      // 注意：在生产环境中，直接使用eval或new Function执行用户提供的代码存在严重安全风险
      const func = new Function('inputs', 'context', inputs.code);
      return func(inputs.args, context);
    } catch (error) {
      console.error("Error executing code node:", error);
      throw error;
    }
  }
}