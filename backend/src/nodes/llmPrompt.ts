import { NodeExecutor, ExecutionContext } from '../workflow/engine';
import OpenAI from 'openai';

export class LLMPromptNode implements NodeExecutor {
  private openai: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set in environment variables.');
    }
    this.openai = new OpenAI({ apiKey });
  }

  async run(inputs: { prompt: string }, context: ExecutionContext): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo", // 可以根据需求配置模型
        messages: [{ role: "user", content: inputs.prompt }],
      });
      return completion.choices[0].message.content || '';
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      throw error;
    }
  }
}