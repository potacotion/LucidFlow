import { NodeDefinition } from '@src/models/workflow';

export default {
    type: 'math/add',
    label: '加法',
    version: '1.0.0',
    description: '计算所有输入端口数值的总和',
    archetype: 'pure',
    // Add a flag to indicate that the UI can add ports
    dynamicPorts: {
        canAdd: { 'in': true, 'out': false }, // Can add 'in' ports, but not 'out'
        portTemplate: { // Template for new ports added in the UI
            namePrefix: 'operand',
            labelPrefix: 'Operand',
            type: 'data',
            dataType: 'number',
            defaultValue: 0,
        },
    },
    ports: [
        // Start with a base result port
        { name: 'result', label: '结果', type: 'data', direction: 'out', dataType: 'number' },
    ],
    run: async ({ input }) => {
        // The 'input' object will contain all connected input ports, including dynamic ones.
        // We sum all values in the input object.
        const sum = Object.values(input).reduce((acc: number, val: any) => acc + (Number(val) || 0), 0);
        return { result: sum };
    },
} as NodeDefinition;