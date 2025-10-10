import { NodeDefinition } from '@src/models/workflow';

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
    run: async () => ({}),
} as NodeDefinition;