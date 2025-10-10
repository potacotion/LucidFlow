import { NodeDefinition } from '@src/models/workflow';

export default {
    type: 'array/aggregator',
    label: '聚合器',
    version: '1.0.0',
    description: '接收一个数组，添加一个后缀到每个元素，然后输出',
    archetype: 'action',
    ports: [
        { name: 'in', label: 'In', type: 'control', direction: 'in' },
        { name: 'array_in', label: 'Array In', type: 'data', direction: 'in', dataType: 'array' },
        { name: 'array_out', label: 'Array Out', type: 'data', direction: 'out', dataType: 'array' },
        { name: 'out', label: 'Out', type: 'control', direction: 'out' },
    ],
    properties: [
        { name: 'suffix', label: 'Suffix', type: 'string', defaultValue: '_aggregated' }
    ],
    run: async ({ input, params }) => {
        const inputArray = input.array_in || [];
        const processedArray = inputArray.map((item: any) => `${item.value}${params.suffix}`);
        return { array_out: processedArray };
    },
} as NodeDefinition;