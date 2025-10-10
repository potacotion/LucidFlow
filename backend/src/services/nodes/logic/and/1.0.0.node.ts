import { NodeDefinition } from '@src/models/workflow';

export default {
    type: 'logic/and',
    label: '逻辑与 (AND)',
    version: '1.0.0',
    description: '对两个布尔输入执行逻辑与操作',
    archetype: 'pure',
    ports: [
        { name: 'a', label: 'A', type: 'data', direction: 'in', dataType: 'boolean' },
        { name: 'b', label: 'B', type: 'data', direction: 'in', dataType: 'boolean' },
        { name: 'result', label: '结果', type: 'data', direction: 'out', dataType: 'boolean' },
    ],
    run: async ({ input }) => {
        return { result: !!input.a && !!input.b };
    },
} as NodeDefinition;