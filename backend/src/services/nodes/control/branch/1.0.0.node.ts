import { NodeDefinition } from '@src/models/workflow';

export default {
    type: 'control/branch',
    label: '分支',
    version: '1.0.0',
    description: '根据条件选择执行路径',
    archetype: 'branch',
    ports: [
        { name: 'condition', label: '条件', type: 'data', direction: 'in', dataType: 'boolean' },
        { name: 'true', label: 'True', type: 'control', direction: 'out' },
        { name: 'false', label: 'False', type: 'control', direction: 'out' },
    ],
    run: async () => ({}),
} as NodeDefinition;