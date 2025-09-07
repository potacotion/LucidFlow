import express from 'express';
import { WorkflowEngine } from './workflow/engine';
import { ManualInputNode } from './nodes/manualInput';
import { TemplateNode } from './nodes/template';
import { LLMPromptNode } from './nodes/llmPrompt';
import { OutputNode } from './nodes/output';
import { CodeNode } from './nodes/code';
import { Workflow } from './types/workflow';

const app = express();
const port = 3000;

app.use(express.json());

// 初始化工作流引擎并注册节点
const workflowEngine = new WorkflowEngine();
workflowEngine.registerNodeExecutor('manualInput', new ManualInputNode());
workflowEngine.registerNodeExecutor('template', new TemplateNode());
workflowEngine.registerNodeExecutor('llmPrompt', new LLMPromptNode());
workflowEngine.registerNodeExecutor('output', new OutputNode());
workflowEngine.registerNodeExecutor('code', new CodeNode());

app.post('/api/workflow/run', async (req, res) => {
  const { workflow, startNodeId, inputs } = req.body as {
    workflow: Workflow;
    startNodeId: string;
    inputs: { [nodeId: string]: any };
  };

  try {
    const results = await workflowEngine.execute(workflow, startNodeId, inputs);
    res.json({ success: true, results });
  } catch (error: any) {
    console.error('Workflow execution error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('Hello from backend!');
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});