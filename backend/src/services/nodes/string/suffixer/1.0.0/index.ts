import { NodeDefinition } from '@src/models/workflow';
import { NodeHandler } from './handler';

const handler = new NodeHandler();

// The run method is now bound to the handler instance.
const run = handler.run.bind(handler);


export default {
    type: 'string/suffixer',
    label: '加后缀',
    version: '1.0.0',
    description: '给输入的字符串添加一个后缀',
    archetype: 'pure',
    ports: [
        { name: 'in', label: 'In', type: 'data', direction: 'in', dataType: 'string' },
        { name: 'suffix', label: 'Suffix', type: 'data', direction: 'in', dataType: 'string' },
        { name: 'out', label: 'Out', type: 'data', direction: 'out', dataType: 'string' },
    ],
    properties: [
        { name: 'suffix', label: 'Suffix', type: 'string', defaultValue: '' }
    ],
    run,
} as NodeDefinition;