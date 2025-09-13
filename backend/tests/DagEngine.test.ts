import { describe, it, expect, vi } from 'vitest';
import { DagEngine } from '../src/services/DagEngine';
import { WorkflowNode, Node, Edge } from '../src/models/workflow';

// Mock the code execution utility
vi.mock('../src/common/util/executeNodeCode', () => ({
    executeNodeCode: vi.fn((node: Node, context: any) => {
        // Simple mock: returns the node's id and its parent's results
        return Promise.resolve({
            nodeId: node.nodeid,
            parentResults: context.parentResults,
        });
    }),
}));

describe('DagEngine', () => {
    it('should execute nodes in topological order', async () => {
        const workflow: WorkflowNode = {
            nodes: [
                { nodeid: 'A', type: 'start', data: {}, position: { x: 0, y: 0 }, run: 'return 1' },
                { nodeid: 'B', type: 'process', data: {}, position: { x: 0, y: 0 }, run: 'return parentResults[0] + 1' },
                { nodeid: 'C', type: 'process', data: {}, position: { x: 0, y: 0 }, run: 'return parentResults[0] + 1' },
                { nodeid: 'D', type: 'end', data: {}, position: { x: 0, y: 0 }, run: 'return parentResults[0] + parentResults[1]' },
            ],
            edges: [
                { edgeid: 'A-B', source: 'A', target: 'B', animated: false },
                { edgeid: 'A-C', source: 'A', target: 'C', animated: false },
                { edgeid: 'B-D', source: 'B', target: 'D', animated: false },
                { edgeid: 'C-D', source: 'C', target: 'D', animated: false },
            ],
        };

        const engine = new DagEngine(workflow);
        const results = await engine.run();
        
        const aResult = await results.get('A');
        const bResult = await results.get('B');
        const cResult = await results.get('C');
        const dResult = await results.get('D');

        expect(aResult.nodeId).toBe('A');
        expect(bResult.parentResults).toContainEqual(aResult);
        expect(cResult.parentResults).toContainEqual(aResult);
        expect(dResult.parentResults).toContainEqual(bResult);
        expect(dResult.parentResults).toContainEqual(cResult);
    });

    it('should throw an error if a cycle is detected', async () => {
        const workflow: WorkflowNode = {
            nodes: [
                { nodeid: 'A', type: 'start', data: {}, position: { x: 0, y: 0 }, run: '' },
                { nodeid: 'B', type: 'process', data: {}, position: { x: 0, y: 0 }, run: '' },
            ],
            edges: [
                { edgeid: 'A-B', source: 'A', target: 'B', animated: false },
                { edgeid: 'B-A', source: 'B', target: 'A', animated: false },
            ],
        };

        const engine = new DagEngine(workflow);
        await expect(engine.run()).rejects.toThrow('Cycle detected in the graph or some nodes are unreachable.');
    });

    it('should handle disconnected components', async () => {
         const workflow: WorkflowNode = {
            nodes: [
                { nodeid: 'A', type: 'start', data: {}, position: { x: 0, y: 0 }, run: '' },
                { nodeid: 'B', type: 'process', data: {}, position: { x: 0, y: 0 }, run: '' },
                { nodeid: 'C', type: 'disconnected', data: {}, position: { x: 0, y: 0 }, run: '' },
            ],
            edges: [
                { edgeid: 'A-B', source: 'A', target: 'B', animated: false },
            ],
        };

        const engine = new DagEngine(workflow);
        // It should throw because C is not reachable from a root node
        await expect(engine.run()).rejects.toThrow();
    });
});