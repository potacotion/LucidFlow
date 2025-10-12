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
        name: 'inputData',
        label: 'Input Data',
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
    {
        name: 'output',
        label: 'Output Data',
        type: 'data',
        direction: 'out',
        dataType: 'any',
    },
];

// 属性定义
const properties: PropertyDefinition[] = [
    {
        name: 'triggerTag',
        label: 'Trigger Tag',
        type: 'string',
        defaultValue: 'main',
        description: 'The unique tag used to trigger this specific flow instance via the SDK or API. Defaults to "main" for editor use.'
    }
];

// 核心执行逻辑
const run = async (params: RunParams): Promise<any> => {
    const { input } = params;

    // 当这个节点作为起始节点被调用时，initialData 会通过 Engine 逻辑被注入到 input.inputData 中。
    // 它的唯一作用是传递输入数据并启动控制流。

    return { 
        output: input.inputData, // 将输入数据作为输出数据
        out: true 
    }; 
};

const ManualTriggerNode: NodeDefinition = {
    type: 'trigger/manual',
    label: 'Manual Trigger',
    description: 'A manually triggerable node that starts a workflow and passes initial input data.',
    archetype: 'action',
    version: '1.0.0',
    isTriggerable: true, // 关键属性
    ports,
    properties,
    run,
};

export default ManualTriggerNode;