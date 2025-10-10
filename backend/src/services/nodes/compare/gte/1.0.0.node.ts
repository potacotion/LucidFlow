import { NodeDefinition } from '@src/models/workflow';

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
    run: async ({ input, params }) => {
        const valA = Number(input.a ?? 0);
        const valB = Number(input.b !== undefined ? input.b : params.b);
        return { result: valA >= valB };
    },
} as NodeDefinition;