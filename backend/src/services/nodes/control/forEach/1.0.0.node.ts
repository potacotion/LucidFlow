import { NodeDefinition } from '@src/models/workflow';

export default {
    type: 'control/forEach',
    label: '遍历循环 (For Each)',
    version: '1.0.0',
    description: '对输入的数组进行遍历',
    archetype: 'loop',
    ports: [
        { name: 'array', label: '数组', type: 'data', direction: 'in', dataType: 'array' },
        // 循环的输出由子图内部连接到'graph/output'代理节点的节点定义。
        // 循环节点本身也可以有一个最终的“收集”输出。
        { name: 'collected', label: '收集的结果', type: 'data', direction: 'out', dataType: 'array' },
         { name: 'loopCompleted', label: '循环完成', type: 'control', direction: 'out' },
    ],
    run: async () => ({ collected: [] }), // Placeholder
} as NodeDefinition;