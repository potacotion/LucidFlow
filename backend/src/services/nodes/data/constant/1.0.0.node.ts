import { NodeDefinition } from '@src/models/workflow';

export default {
    type: 'data/constant',
    label: '常量',
    version: '1.0.0',
    description: '输出一个在属性中定义的固定值',
    archetype: 'pure',
    ports: [
        { name: 'value', label: '值', type: 'data', direction: 'out', dataType: 'any' },
    ],
    properties: [
        {
            name: 'dataType',
            label: 'Data Type',
            type: 'select',
            defaultValue: 'string',
            options: [
                { label: 'String', value: 'string' },
                { label: 'Number', value: 'number' },
                { label: 'Boolean', value: 'boolean' },
            ],
            description: 'The data type of the constant value.',
        },
        {
            name: 'value',
            label: 'Value',
            type: 'textarea', // Textarea is more versatile for different types
            defaultValue: '',
            description: 'The constant value to output.',
        },
    ],
    run: async ({ params }) => {
        console.log(`[DEBUG] Constant node received params:`, params);
        const { dataType, value } = params;
        let parsedValue: any = params.value;
        try {
            if (params.dataType === 'number') {
                parsedValue = Number(params.value);
            } else if (params.dataType === 'boolean') {
                parsedValue = params.value === 'true' || params.value === '1';
            }
        } catch (error) {
            console.error('Error parsing constant value:', error);
        }
        console.log(`[DEBUG] Constant node returning value: ${parsedValue}`);
        return { value: parsedValue };
    },
} as NodeDefinition;