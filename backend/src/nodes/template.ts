import { NodeExecutor, ExecutionContext } from '../workflow/engine';

export class TemplateNode implements NodeExecutor {
  async run(inputs: { template: string; data: { [key: string]: any } }, context: ExecutionContext): Promise<string> {
    let result = inputs.template;
    for (const key in inputs.data) {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), inputs.data[key]);
    }
    return result;
  }
}