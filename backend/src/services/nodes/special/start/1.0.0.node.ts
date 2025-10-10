import { NodeDefinition } from '@src/models/workflow';

export default {
    type: 'special/start',
    label: '开始',
    version: '1.0.0',
    description: '工作流的入口点',
    archetype: 'action', // Can be considered an action that starts the flow
    ports: [
        { name: 'start', label: '执行', type: 'control', direction: 'out' },
    ],
    run: async () => ({}),
} as NodeDefinition;