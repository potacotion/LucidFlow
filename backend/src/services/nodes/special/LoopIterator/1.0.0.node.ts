import { NodeDefinition } from '@src/models/workflow';

export default {
    type: 'special/LoopIterator',
    label: '循环迭代器',
    version: '1.0.0',
    description: '提供当前循环的 item 和 index',
    archetype: 'pure',
    ports: [
        { name: 'item', label: '当前项', type: 'data', direction: 'out', dataType: 'any' },
        { name: 'index', label: '当前索引', type: 'data', direction: 'out', dataType: 'number' },
    ],
    run: async () => ({ item: null, index: -1 }), // Placeholder
} as NodeDefinition;