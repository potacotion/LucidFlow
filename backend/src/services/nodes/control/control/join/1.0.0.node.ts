import { NodeDefinition } from '@src/models/workflow';

export default {
    type: "control/control/join",
    label: "Join",
    version: "1.0.0",
    archetype: 'join',
    ports: [
        // Join nodes often have dynamically added inputs in the UI.
        { name: 'in_1', label: 'In 1', type: 'control', direction: 'in' },
        { name: 'in_2', label: 'In 2', type: 'control', direction: 'in' },
        { name: 'out', label: 'Out', type: 'control', direction: 'out' },
    ],
    run: async () => ({}),
} as NodeDefinition;