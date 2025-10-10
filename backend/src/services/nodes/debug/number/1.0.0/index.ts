import { NodeDefinition } from '@src/models/workflow';
import { NodeHandler } from './handler';

const handler = new NodeHandler();

// The run method is now bound to the handler instance.
const run = handler.run.bind(handler);


export default {
    type: 'debug/number',
    label: 'Debug Number',
    version: '1.0.0',
    description: '当控制流触发时，在后端控制台打印输入的数字',
    archetype: 'action',
    ports: [
        { name: 'in', label: 'In', type: 'control', direction: 'in' },
        { name: 'number', label: 'Number', type: 'data', direction: 'in', dataType: 'number' },
    ],
    run,
} as NodeDefinition;