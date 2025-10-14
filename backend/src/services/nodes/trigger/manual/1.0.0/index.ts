import { NodeDefinition, PropertyDefinition, PortDefinition, RunParams } from '@src/models/workflow';

// 端口定义
const ports: PortDefinition[] = [
    // The 'in' port is kept for the engine to kickstart the execution signal.
    {
        name: 'in',
        label: 'In',
        type: 'control',
        direction: 'in',
    },
    // The 'out' port signals the next node in the control flow.
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

    // With the new engine logic, the `initialData` from the trigger call
    // will be directly passed as the `input`. The `run` function's role
    // is to simply return this data. The engine will then map the keys
    // of the returned object to the corresponding dynamic output ports.
    return input;
};

const ManualTriggerNode: NodeDefinition = {
    type: 'trigger/manual',
    label: 'Manual Trigger',
    description: 'A manually triggerable node that starts a workflow and passes initial input data through dynamically created output ports.',
    archetype: 'action', // Remains 'action' as it initiates a flow.
    version: '1.0.0',
    isTriggerable: true,
    dynamicPorts: {
        canAdd: { in: false, out: true }, // Can only add data output ports
        portTemplate: {
            namePrefix: 'data',
            labelPrefix: 'Data',
            type: 'data',
            direction: 'out',
            dataType: 'any',
        },
    },
    ports,
    properties,
    run,
};

export default ManualTriggerNode;