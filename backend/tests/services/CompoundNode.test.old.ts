
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SignalDrivenEngine } from '../../src/services/SignalDrivenEngine';
import { NodeInstance } from '../../src/models/workflow';
import { NODE_DEFINITIONS } from '../../src/services/node-definitions';

describe('Compound Node Isolated Test', () => {
  let capturedResult: any = null;
  const originalLog = console.log;

  beforeEach(() => {
    capturedResult = null;
    console.log = (message: any) => {
      if (typeof message === 'object' && message !== null && 'result' in message) {
        capturedResult = message.result;
      }
    };

    if (!NODE_DEFINITIONS.has('debug/log')) {
      NODE_DEFINITIONS.set('debug/log', {
        type: 'debug/log',
        label: 'Log',
        description: 'Logs its input to the console',
        archetype: 'action',
        ports: [
          { name: 'in', label: 'In', type: 'control', direction: 'in' },
          { name: 'value', label: 'Value', type: 'data', direction: 'in', dataType: 'any' },
        ],
        run: async ({ input }) => {
          console.log({ result: input.value });
          return {};
        },
      });
    }
  });

  afterEach(() => {
    console.log = originalLog;
    NODE_DEFINITIONS.delete('debug/log');
  });

  it('should execute a compound node correctly', async () => {
    const engine = new SignalDrivenEngine();
    const nodes: NodeInstance[] = [
      { id: 'start', type: 'special/start', position: { x: 0, y: 0 } },
      { id: 'const_a', type: 'data/constant', position: { x: 0, y: 100 }, propertyValues: { value: 5 } },
      {
        id: 'compound',
        type: 'control/compound',
        position: { x: 200, y: 100 },
        subgraph: {
          nodes: [
            { id: 'sub_input', type: 'graph/input', position: { x: 0, y: 100 }, propertyValues: { parentPortName: 'input1' } },
            { id: 'sub_add', type: 'math/add', position: { x: 200, y: 100 } },
            { id: 'sub_output', type: 'graph/output', position: { x: 400, y: 100 }, propertyValues: { parentPortName: 'output1' } }
          ],
          edges: [
            { id: 'e1_sub', source: { nodeId: 'sub_input', portName: 'output' }, target: { nodeId: 'sub_add', portName: 'a' } },
            { id: 'e2_sub', source: { nodeId: 'sub_add', portName: 'result' }, target: { nodeId: 'sub_output', portName: 'input' } }
          ]
        }
      },
      { id: 'output_node', type: 'debug/log', position: { x: 400, y: 100 } }
    ];
    const edges = [
      // Now that the compound node has control ports, we can connect the control flow.
      { id: 'e1', source: { nodeId: 'start', portName: 'start' }, target: { nodeId: 'compound', portName: 'in' } },
      { id: 'e2', source: { nodeId: 'const_a', portName: 'value' }, target: { nodeId: 'compound', portName: 'input1' } },
      { id: 'e3', source: { nodeId: 'compound', portName: 'output1' }, target: { nodeId: 'output_node', portName: 'value' } },
      // This edge is crucial to trigger the final log node.
      { id: 'e4', source: { nodeId: 'compound', portName: 'out' }, target: { nodeId: 'output_node', portName: 'in' } }
    ];

    await engine.run({ nodes, edges });
    expect(capturedResult).toBe(5); // 5 (from const_a) + 0 (default b in add) = 5
  });
});
