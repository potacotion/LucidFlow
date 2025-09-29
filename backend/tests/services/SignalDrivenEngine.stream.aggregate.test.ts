import { vi, describe, it, expect, beforeEach } from 'vitest';
import { SignalDrivenEngine } from '@src/services/SignalDrivenEngine';
import { NodeInstance, Edge } from '@src/models/workflow';
import * as NodeExecutor from '@src/services/NodeExecutor';

const MOCK_EXECUTE_LOGIC = vi.fn();

vi.mock('@src/services/NodeExecutor', async (importOriginal) => {
    const actual = await importOriginal() as typeof NodeExecutor;
    MOCK_EXECUTE_LOGIC.mockImplementation(actual.executeNodeLogic);
    return {
        ...actual,
        executeNodeLogic: MOCK_EXECUTE_LOGIC,
    };
});

describe('SignalDrivenEngine Stream Processing - Aggregate Push', () => {
    let engine: SignalDrivenEngine;

    beforeEach(() => {
        engine = new SignalDrivenEngine();
        MOCK_EXECUTE_LOGIC.mockClear();
    });

    it('should push a full aggregated array to a downstream node upon stream completion', async () => {
        const nodes: NodeInstance[] = [
            { id: 'start', type: 'special/start', position: { x: 0, y: 0 } },
            { id: 'streamer', type: 'test/stream', position: { x: 200, y: 0 }, propertyValues: { interval: 10, chunks: 4 } },
            { id: 'aggregator', type: 'array/aggregator', position: { x: 400, y: 0 }, propertyValues: { suffix: '_agg' } },
            { id: 'output', type: 'graph/output', position: { x: 600, y: 0 }, propertyValues: { parentPortName: 'finalResult' } },
        ];

        const edges: Edge[] = [
            // 1. Start triggers the streamer
            { id: 'e1', source: { nodeId: 'start', portName: 'start' }, target: { nodeId: 'streamer', portName: 'in' } },
            // 2. When the stream is DONE, trigger the aggregator's execution
            { id: 'e2', source: { nodeId: 'streamer', portName: 'onChunkDone' }, target: { nodeId: 'aggregator', portName: 'in' } },
            // 3. The aggregator's data input is connected to the streamer's full_stream data output
            { id: 'e3', source: { nodeId: 'streamer', portName: 'full_stream' }, target: { nodeId: 'aggregator', portName: 'array_in' } },
            // 4. The final graph output should be the result of the aggregator
            { id: 'e4', source: { nodeId: 'aggregator', portName: 'array_out' }, target: { nodeId: 'output', portName: 'input' } },
        ];
        
        const graph = { nodes, edges };
        const result = await engine.run(graph);

        // Allow microtasks/macrotasks to finish
        await new Promise(resolve => setImmediate(resolve));

        // The aggregator node should have been called exactly once.
        const aggregatorCalls = MOCK_EXECUTE_LOGIC.mock.calls.filter(call => call[0].id === 'aggregator');
        expect(aggregatorCalls.length).toBe(1);

        // Check the input that was passed to the aggregator
        const aggregatorInput = aggregatorCalls[0][1];
        expect(aggregatorInput.array_in).toBeInstanceOf(Array);
        expect(aggregatorInput.array_in.length).toBe(4);
        expect(aggregatorInput.array_in[0].value).toBe(0);

        // Check the final output of the entire graph
        expect(result).toBeDefined();
        expect((result as any).finalResult).toEqual(['0_agg', '1_agg', '2_agg', '3_agg']);
    });
});