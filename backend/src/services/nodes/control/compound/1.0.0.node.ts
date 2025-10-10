import { NodeDefinition } from '@src/models/workflow';

export default {
    type: 'control/compound',
    label: '复合节点',
    version: '1.0.0',
    description: '这是一个可以包含子图的节点',
    archetype: 'compound',
    // 复合节点的端口由用户在UI中动态定义。
    // 此定义仅需声明其原型。
    // 实际的端口是通过 NodeInstance 的 subgraph 属性，使用 'graph/input' 和 'graph/output' 节点来实现的。
    ports: [
        // 控制端口
        { name: 'in', label: 'In', type: 'control', direction: 'in' },
        { name: 'out', label: 'Out', type: 'control', direction: 'out' },
        // 用户可能定义的示例端口。
        { name: 'input1', label: '输入1', type: 'data', direction: 'in', dataType: 'any' },
        { name: 'output1', label: '输出1', type: 'data', direction: 'out', dataType: 'any' },
    ],
    run: async () => ({}), // Placeholder
} as NodeDefinition;