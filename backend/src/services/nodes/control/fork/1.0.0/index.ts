import { NodeDefinition } from '@src/models/workflow';
import { NodeHandler } from './handler';

const handler = new NodeHandler();

// The run method is now bound to the handler instance.
const run = handler.run.bind(handler);


export default {
    type: 'control/fork',
    label: '并行',
    version: '1.0.0',
    description: '将单一控制流拆分为多个并行流',
    archetype: 'fork',
    ports: [
        { name: 'in', label: 'In', type: 'control', direction: 'in' },
        { name: 'out_1', label: 'Out 1', type: 'control', direction: 'out' },
        { name: 'out_2', label: 'Out 2', type: 'control', direction: 'out' },
    ],
    run,
} as NodeDefinition;