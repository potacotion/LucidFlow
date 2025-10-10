import { NodeDefinition } from '@src/models/workflow';
import { NodeHandler } from './handler';

const handler = new NodeHandler();

// The run method is now bound to the handler instance.
const run = handler.run.bind(handler);


export default {
    type: 'special/end',
    label: '结束',
    version: '1.0.0',
    description: '工作流的终点',
    archetype: 'action',
    ports: [
        { name: 'in', label: 'In', type: 'control', direction: 'in' },
        { name: 'result', label: 'Result', type: 'data', direction: 'in', dataType: 'any' },
    ],
    run,
} as NodeDefinition;