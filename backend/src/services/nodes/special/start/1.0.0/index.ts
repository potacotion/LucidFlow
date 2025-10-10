import { NodeDefinition } from '@src/models/workflow';
import { NodeHandler } from './handler';

const handler = new NodeHandler();

// The run method is now bound to the handler instance.
const run = handler.run.bind(handler);


export default {
    type: 'special/start',
    label: '开始',
    version: '1.0.0',
    description: '工作流的入口点',
    archetype: 'action', // Can be considered an action that starts the flow
    ports: [
        { name: 'start', label: '执行', type: 'control', direction: 'out' },
    ],
    run,
} as NodeDefinition;