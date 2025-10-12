import { NodeDefinition, PropertyDefinition, PortDefinition, RunParams } from '@src/models/workflow';

// 端口定义
const ports: PortDefinition[] = [
    {
        name: 'in',
        label: 'In',
        type: 'control',
        direction: 'in',
    },
    {
        name: 'data',
        label: 'Data',
        type: 'data',
        direction: 'in',
        dataType: 'any',
        defaultValue: null,
    },
    {
        name: 'out',
        label: 'Out',
        type: 'control',
        direction: 'out',
    },
];

// 属性定义
const properties: PropertyDefinition[] = [
    {
        name: 'tag',
        label: 'WebSocket Tag',
        type: 'string',
        defaultValue: 'output',
        description: 'The tag used by the frontend SDK to listen for this specific data output.'
    }
];

// 核心执行逻辑
const run = async (params: RunParams): Promise<any> => {
    const { input, params: properties, hooks } = params;

    const data = input.data;
    const tag = properties.tag as string;

    if (!tag) {
        // 抛出错误以停止执行
        throw new Error('WebSocket Send node requires a configured tag property.');
    }
    
    // 调用 onCustomEvent 钩子 (任务 1.3 验收标准 3)
    hooks.onCustomEvent('websocket:send', { tag, data });

    return { out: true }; // 返回控制流输出
};

const WebSocketSendNode: NodeDefinition = {
    type: 'websocket/send',
    label: 'WebSocket Send',
    description: 'Sends data to the connected client via a dedicated WebSocket channel, filtered by a specific tag.',
    archetype: 'action',
    version: '1.0.0',
    ports,
    properties,
    run,
};

export default WebSocketSendNode;