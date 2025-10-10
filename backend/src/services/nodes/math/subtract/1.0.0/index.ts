import { NodeDefinition } from '@src/models/workflow';
import { NodeHandler } from './handler';

const handler = new NodeHandler();

// The run method is now bound to the handler instance.
const run = handler.run.bind(handler);


export default {
    type: 'math/subtract',
    label: '减法',
    version: '1.0.0',
    description: '计算两个数的差',
    archetype: 'pure',
    ports: [
        { name: 'a', label: 'A', type: 'data', direction: 'in', dataType: 'number', defaultValue: 0 },
        { name: 'b', label: 'B', type: 'data', direction: 'in', dataType: 'number', defaultValue: 0 },
        { name: 'result', label: '结果', type: 'data', direction: 'out', dataType: 'number' },
    ],
    run,
} as NodeDefinition;