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

describe('SignalDrivenEngine Stream Processing - Incremental Push', () => {
    let engine: SignalDrivenEngine;

    beforeEach(() => {
        engine = new SignalDrivenEngine();
        MOCK_EXECUTE_LOGIC.mockClear();
    });

    it('should push stream chunks to downstream nodes, triggering their execution', async () => {
        const nodes: NodeInstance[] = [
            { id: 'start', type: 'special/start', position: { x: 0, y: 0 } },
            { id: 'streamer', type: 'test/stream', position: { x: 200, y: 0 }, propertyValues: { interval: 10, chunks: 3 } },
            { id: 'logger', type: 'test/logger', position: { x: 400, y: 0 } },
        ];

        const edges: Edge[] = [
            // 1. Start signal triggers the streamer
            { id: 'e1', source: { nodeId: 'start', portName: 'start' }, target: { nodeId: 'streamer', portName: 'in' } },
            // 2. Streamer's data output is directly connected to the logger's data input
            { id: 'e2', source: { nodeId: 'streamer', portName: 'chunk' }, target: { nodeId: 'logger', portName: 'data' } },
        ];

        const graph = { nodes, edges };
        await engine.run(graph);

        // Allow microtasks/macrotasks to finish
        await new Promise(resolve => setImmediate(resolve));

        // The logger node should be executed 3 times, once for each data chunk pushed by the streamer.
        const loggerCalls = MOCK_EXECUTE_LOGIC.mock.calls.filter(call => call[0].id === 'logger');
        expect(loggerCalls.length).toBe(3);

        const loggerInputs = loggerCalls.map(call => call[1]);
        
        // Check the data that was passed directly via the data signal
        expect(loggerInputs[0].data.value).toBe(0);
        expect(loggerInputs[1].data.value).toBe(1);
        expect(loggerInputs[2].data.value).toBe(2);
    });
});