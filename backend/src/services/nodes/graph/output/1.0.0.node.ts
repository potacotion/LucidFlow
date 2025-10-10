import { NodeDefinition } from '@src/models/workflow';

export default {
    type: 'graph/output',
    label: 'Graph Output',
    version: '1.0.0',
    description: '代表父级复合节点的一个输出端口。',
    archetype: 'pure', // 在子图内部充当数据接收器
    ports: [
        // 需要一个通用输入以便在子图内部连接。
        { name: 'input', label: 'Input', type: 'data', direction: 'in', dataType: 'any' }
    ],
    properties: [
        {
          name: 'parentPortName',
          label: 'Parent Port Name',
          type: 'string',
          defaultValue: ''
        }
    ],
    run: async () => ({}), // Placeholder
} as NodeDefinition;