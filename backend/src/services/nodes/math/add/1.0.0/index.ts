import { NodeDefinition } from '@src/models/workflow';
import { NodeHandler } from './handler';

const handler = new NodeHandler();

// The run method is now bound to the handler instance.
const run = handler.run.bind(handler);


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
    run,
} as NodeDefinition;