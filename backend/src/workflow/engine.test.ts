import { describe, it, expect, beforeEach } from 'vitest';
import { WorkflowEngine, NodeExecutor, ExecutionContext } from './engine';
import { Workflow, WorkflowNode, WorkflowEdge } from '../types/workflow';

// 模拟节点执行器
class MockNode implements NodeExecutor {
  private value: any;
  constructor(value: any) {
    this.value = value;
  }
  async run(inputs: any, context: ExecutionContext): Promise<any> {
    // 模拟异步操作
    return new Promise(resolve => setTimeout(() => resolve(this.value || inputs), 10));
  }
}

describe('WorkflowEngine', () => {
  let engine: WorkflowEngine;

  beforeEach(() => {
    engine = new WorkflowEngine();
    engine.registerNodeExecutor('mockNode', new MockNode('mockResult'));
    engine.registerNodeExecutor('manualInput', { run: async (inputs) => inputs });
    engine.registerNodeExecutor('template', { run: async (inputs) => 'templatedOutput' });
    engine.registerNodeExecutor('output', { run: async (inputs) => inputs });
  });

  it('should execute a simple linear workflow', async () => {
    const workflow: Workflow = {
      nodes: [
        { id: 'nodeA', type: 'manualInput', position: { x: 0, y: 0 }, data: {} },
        { id: 'nodeB', type: 'mockNode', position: { x: 100, y: 0 }, data: {} },
        { id: 'nodeC', type: 'output', position: { x: 200, y: 0 }, data: {} },
      ],
      edges: [
        { id: 'e1', source: 'nodeA', target: 'nodeB' },
        { id: 'e2', source: 'nodeB', target: 'nodeC' },
      ],
    };

    const initialInputs = {
      nodeA: 'hello world',
    };

    const results = await engine.execute(workflow, 'nodeA', initialInputs);

    expect(results['nodeA']).to.deep.equal({ value: 'hello world' }); // manualInput 节点返回 initialInputs
    expect(results['nodeB']).to.equal('mockResult'); // mockNode 返回 mockResult
    expect(results['nodeC']).to.deep.equal({ value: 'mockResult' }); // output 节点返回上一个节点的输出
  });

  it('should handle branching workflows', async () => {
    const workflow: Workflow = {
      nodes: [
        { id: 'start', type: 'manualInput', position: { x: 0, y: 0 }, data: {} },
        { id: 'branch1', type: 'mockNode', position: { x: 100, y: 0 }, data: {} },
        { id: 'branch2', type: 'template', position: { x: 100, y: 100 }, data: {} },
        { id: 'end', type: 'output', position: { x: 200, y: 50 }, data: {} },
      ],
      edges: [
        { id: 'e1', source: 'start', target: 'branch1' },
        { id: 'e2', source: 'start', target: 'branch2' },
        { id: 'e3', source: 'branch1', target: 'end' },
        { id: 'e4', source: 'branch2', target: 'end' },
      ],
    };

    const initialInputs = {
      start: 'startData',
    };

    const results = await engine.execute(workflow, 'start', initialInputs);

    expect(results['start']).to.deep.equal({ value: 'startData' }); // manualInput 节点返回 initialInputs
    expect(results['branch1']).to.equal('mockResult'); // mockNode 返回 mockResult
    expect(results['branch2']).to.equal('templatedOutput'); // template 节点返回 templatedOutput
    expect(results['end']).to.deep.equal({ value: 'templatedOutput' }); // output 节点返回上一个节点的输出
  });

  it('should throw an error if startNodeId is not found', async () => {
    const workflow: Workflow = {
      nodes: [],
      edges: [],
    };
    const initialInputs = {};

    await expect(engine.execute(workflow, 'nonExistentNode', initialInputs)).rejects.toThrow('Start node with ID nonExistentNode not found.');
  });

  it('should skip nodes with no registered executor', async () => {
    const workflow: Workflow = {
      nodes: [
        { id: 'nodeA', type: 'manualInput', position: { x: 0, y: 0 }, data: {} },
        { id: 'nodeB', type: 'unknownType', position: { x: 100, y: 0 }, data: {} },
        { id: 'nodeC', type: 'output', position: { x: 200, y: 0 }, data: {} },
      ],
      edges: [
        { id: 'e1', source: 'nodeA', target: 'nodeB' },
        { id: 'e2', source: 'nodeB', target: 'nodeC' },
      ],
    };

    const initialInputs = {
      nodeA: 'hello world',
    };

    const results = await engine.execute(workflow, 'nodeA', initialInputs);

    expect(results['nodeA']).to.deep.equal({ value: 'hello world' }); // manualInput 节点返回 initialInputs
    expect(results['nodeB']).to.deep.equal({ value: 'hello world' }); // unknownType 节点应该将输入直接作为输出传递
    expect(results['nodeC']).to.deep.equal({ value: 'hello world' }); // output 节点返回上一个节点的输出
  });
});