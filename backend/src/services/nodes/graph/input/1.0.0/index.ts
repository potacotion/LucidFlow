import { NodeDefinition } from '@src/models/workflow';
import { NodeHandler } from './handler';

const handler = new NodeHandler();

// The run method is now bound to the handler instance.
const run = handler.run.bind(handler);


export default {
    type: 'graph/input',
    label: 'Graph Input',
    version: '1.0.0',
    description: '代表父级复合节点的一个输入端口。',
    archetype: 'pure', // 在子图内部充当数据源
    ports: [
        // 端口由父节点的定义动态确定，
        // 但需要一个通用输出以便在子图内部连接。
        { name: 'output', label: 'Output', type: 'data', direction: 'out', dataType: 'any' }
    ],
    properties: [
        {
          name: 'parentPortName',
          label: 'Parent Port Name',
          type: 'string',
          defaultValue: ''
        }
    ],
    run, // Placeholder
} as NodeDefinition;