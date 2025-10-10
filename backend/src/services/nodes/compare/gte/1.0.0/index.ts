import { NodeDefinition } from '@src/models/workflow';
import { NodeHandler } from './handler';

const handler = new NodeHandler();

// The run method is now bound to the handler instance.
const run = handler.run.bind(handler);


export default {
    type: 'compare/gte',
    label: '大于或等于 (>=)',
    version: '1.0.0',
    description: '比较 a 是否大于或等于 b',
    archetype: 'pure',
    ports: [
        { name: 'a', label: 'A', type: 'data', direction: 'in', dataType: 'number' },
        { name: 'b', label: 'B', type: 'data', direction: 'in', dataType: 'number' },
        { name: 'result', label: '结果', type: 'data', direction: 'out', dataType: 'boolean' },
    ],
    properties: [
        { name: 'b', label: 'B', type: 'number', defaultValue: 0 }
    ],
    run,
} as NodeDefinition;