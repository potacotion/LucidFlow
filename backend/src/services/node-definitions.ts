import { ISubscriber, NodeDefinition } from '@src/models/workflow';

// 这是一个简化的节点定义注册表。
// 在一个真实的、可扩展的系统中，这些定义可能来自数据库、插件或配置文件。

export const NODE_DEFINITIONS = new Map<string, NodeDefinition>([
    // =========================================================================
    // 基础数学节点
    // =========================================================================
    ['data/constant', {
        type: 'data/constant',
        label: '常量',
        description: '输出一个在属性中定义的固定值',
        archetype: 'pure',
        ports: [
            { name: 'value', label: '值', type: 'data', direction: 'out', dataType: 'number' },
        ],
        properties: [
            {
                name: 'dataType',
                label: 'Data Type',
                type: 'select',
                defaultValue: 'string',
                options: [
                    { label: 'String', value: 'string' },
                    { label: 'Number', value: 'number' },
                    { label: 'Boolean', value: 'boolean' },
                ],
                description: 'The data type of the constant value.',
            },
            {
                name: 'value',
                label: 'Value',
                type: 'textarea', // Textarea is more versatile for different types
                defaultValue: '',
                description: 'The constant value to output.',
            },
        ],
        run: async ({ params }) => {
            const { dataType, value } = params;
            let parsedValue: any = value;
            try {
                if (dataType === 'number') {
                    parsedValue = Number(value);
                } else if (dataType === 'boolean') {
                    parsedValue = value === 'true' || value === '1';
                }
            } catch (error) {
                console.error('Error parsing constant value:', error);
            }
            return { value: parsedValue };
        },
    }],
    ['math/add', {
        type: 'math/add',
        label: '加法',
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
        run: async ({ input }) => {
            // The 'input' object will contain all connected input ports, including dynamic ones.
            // We sum all values in the input object.
            const sum = Object.values(input).reduce((acc: number, val: any) => acc + (Number(val) || 0), 0);
            return { result: sum };
        },
    }],
    ['math/subtract', {
        type: 'math/subtract',
        label: '减法',
        description: '计算两个数的差',
        archetype: 'pure',
        ports: [
            { name: 'a', label: 'A', type: 'data', direction: 'in', dataType: 'number', defaultValue: 0 },
            { name: 'b', label: 'B', type: 'data', direction: 'in', dataType: 'number', defaultValue: 0 },
            { name: 'result', label: '结果', type: 'data', direction: 'out', dataType: 'number' },
        ],
        run: async ({ input }) => {
            const a = input.a ?? 0;
            const b = input.b ?? 0;
            return { result: a - b };
        },
    }],

    // =========================================================================
    // 特殊节点
    // =========================================================================
    ['special/start', {
        type: 'special/start',
        label: '开始',
        description: '工作流的入口点',
        archetype: 'action', // Can be considered an action that starts the flow
        ports: [
            { name: 'start', label: '执行', type: 'control', direction: 'out' },
        ],
        run: async () => ({}),
    }],
    
    // Note: 'special_LoopIterator' is an internal concept.
    // In the new model, we'd handle this within the 'loop' archetype's execution logic.
    // For now, let's define it as a pure node that would be created inside a loop's body.
    ['special/LoopIterator', {
        type: 'special_LoopIterator',
        label: '循环迭代器',
        description: '提供当前循环的 item 和 index',
        archetype: 'pure',
        ports: [
            { name: 'item', label: '当前项', type: 'data', direction: 'out', dataType: 'any' },
            { name: 'index', label: '当前索引', type: 'data', direction: 'out', dataType: 'number' },
        ],
        run: async () => ({ item: null, index: -1 }), // Placeholder
    }],

    // =========================================================================
    // 复合/循环节点示例
    // =========================================================================
    ['control/forEach', {
        type: 'control/forEach',
        label: '遍历循环 (For Each)',
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
    }],

    ['control/while', {
        type: 'control/while',
        label: '条件循环 (While)',
        description: '当条件为真时重复执行子图',
        archetype: 'loop',
        ports: [
            // While 循环没有 forEach 那样的数组输入，它的条件在子图内部计算。
            // 子图必须有一个名为 'loopCondition' 的布尔输出。
            { name: 'loopCompleted', label: '循环完成', type: 'control', direction: 'out' },
        ],
        run: async () => ({}), // Placeholder
    }],

    ['control/compound', {
        type: 'control/compound',
        label: '复合节点',
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
    }],

    // =========================================================================
    // New Archetype Examples from v2.0
    // =========================================================================
    ['control/join', {
        type: "control/join",
        label: "Join",
        archetype: 'join',
        ports: [
            // Join nodes often have dynamically added inputs in the UI.
            { name: 'in_1', label: 'In 1', type: 'control', direction: 'in' },
            { name: 'in_2', label: 'In 2', type: 'control', direction: 'in' },
            { name: 'out', label: 'Out', type: 'control', direction: 'out' },
        ],
        run: async () => ({}),
    }],
    
    // =========================================================================
    // Proxy Nodes for Subgraphs
    // =========================================================================
    ['graph/input', {
        type: 'graph/input',
        label: 'Graph Input',
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
        run: async () => ({}), // Placeholder
    }],
    ['graph/output', {
        type: 'graph/output',
        label: 'Graph Output',
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
    }],
    // =========================================================================
    // 流程控制节点
    // =========================================================================
    ['control/branch', {
        type: 'control/branch',
        label: '分支',
        description: '根据条件选择执行路径',
        archetype: 'branch',
        ports: [
            { name: 'condition', label: '条件', type: 'data', direction: 'in', dataType: 'boolean' },
            { name: 'true', label: 'True', type: 'control', direction: 'out' },
            { name: 'false', label: 'False', type: 'control', direction: 'out' },
        ],
        run: async () => ({}),
    }],
    ['control/fork', {
        type: 'control/fork',
        label: '并行',
        description: '将单一控制流拆分为多个并行流',
        archetype: 'fork',
        ports: [
            { name: 'in', label: 'In', type: 'control', direction: 'in' },
            { name: 'out_1', label: 'Out 1', type: 'control', direction: 'out' },
            { name: 'out_2', label: 'Out 2', type: 'control', direction: 'out' },
        ],
        run: async () => ({}),
    }],

    // =========================================================================
    // 比较与逻辑运算
    // =========================================================================
    ['compare/gte', {
        type: 'compare/gte',
        label: '大于或等于 (>=)',
        description: '比较 a 是否大于或等于 b',
        archetype: 'pure',
        ports: [
            { name: 'a', label: 'A', type: 'data', direction: 'in', dataType: 'number' },
            { name: 'b', label: 'B', type: 'data', direction: 'in', dataType: 'number' },
            { name: 'result', label: '结果', type: 'data', direction: 'out', dataType: 'boolean' },
        ],
        properties: [
            { name: 'b', label: 'B', type: 'number', defaultValue: 0 }
        ],
        run: async ({ input, params }) => {
            const valA = Number(input.a ?? 0);
            const valB = Number(input.b !== undefined ? input.b : params.b);
            return { result: valA >= valB };
        },
    }],
    ['logic/and', {
        type: 'logic/and',
        label: '逻辑与 (AND)',
        description: '对两个布尔输入执行逻辑与操作',
        archetype: 'pure',
        ports: [
            { name: 'a', label: 'A', type: 'data', direction: 'in', dataType: 'boolean' },
            { name: 'b', label: 'B', type: 'data', direction: 'in', dataType: 'boolean' },
            { name: 'result', label: '结果', type: 'data', direction: 'out', dataType: 'boolean' },
        ],
        run: async ({ input }) => {
            return { result: !!input.a && !!input.b };
        },
    }],

    // =========================================================================
    // 订单审核流程测试
    // =========================================================================
    ['test/inputOrder', {
        type: 'test/inputOrder',
        label: '输入订单',
        description: '模拟输入订单信息，输出金额',
        archetype: 'action',
        ports: [
            { name: 'control', label: 'Control', type: 'control', direction: 'out' },
            { name: 'amount', label: '金额', type: 'data', direction: 'out', dataType: 'number' },
        ],
        properties: [
            { name: 'amount', label: '金额', type: 'number', defaultValue: 100 }
        ],
        run: async ({ params }) => {
            return { amount: params.amount };
        },
    }],
    ['test/financeApproval', {
        type: 'test/financeApproval',
        label: '财务审批',
        description: '模拟财务审批，输出是否通过',
        archetype: 'action',
        ports: [
            { name: 'control', label: 'Control', type: 'control', direction: 'out' },
            { name: 'approved', label: '是否通过', type: 'data', direction: 'out', dataType: 'boolean' },
        ],
        properties: [
            { name: 'shouldApprove', label: '是否应通过', type: 'boolean', defaultValue: true }
        ],
        run: async ({ params }) => {
            return { approved: params.shouldApprove };
        },
    }],
    ['test/managerApproval', {
        type: 'test/managerApproval',
        label: '经理审批',
        description: '模拟经理审批，输出是否通过',
        archetype: 'action',
        ports: [
            { name: 'control', label: 'Control', type: 'control', direction: 'out' },
            { name: 'approved', label: '是否通过', type: 'data', direction: 'out', dataType: 'boolean' },
        ],
        properties: [
            { name: 'shouldApprove', label: '是否应通过', type: 'boolean', defaultValue: true }
        ],
        run: async ({ params }) => {
            return { approved: params.shouldApprove };
        },
    }],
    ['test/shipOrder', {
        type: 'test/shipOrder',
        label: '发货',
        description: '模拟发货动作',
        archetype: 'action',
        ports: [
            { name: 'in', label: 'In', type: 'control', direction: 'in' },
            { name: 'status', label: '状态', type: 'data', direction: 'out', dataType: 'string' },
        ],
        properties: [
            { name: 'orderType', label: '订单类型', type: 'string', defaultValue: 'small' }
        ],
        run: async ({ params }) => {
            const status = `Shipped ${params.orderType} order`;
            console.log(status);
            return { status };
        },
    }],
    ['test/rejectOrder', {
        type: 'test/rejectOrder',
        label: '拒绝订单',
        description: '模拟拒绝订单动作',
        archetype: 'action',
        ports: [
            { name: 'in', label: 'In', type: 'control', direction: 'in' },
            { name: 'status', label: '状态', type: 'data', direction: 'out', dataType: 'string' },
        ],
        run: async () => {
            const status = 'Order Rejected';
            console.log(status);
            return { status };
        },
    }],

    // =========================================================================
    // Stream/Async Test Nodes
    // =========================================================================
    ['string/suffixer', {
        type: 'string/suffixer',
        label: '加后缀',
        description: '给输入的字符串添加一个后缀',
        archetype: 'pure',
        ports: [
            { name: 'in', label: 'In', type: 'data', direction: 'in', dataType: 'string' },
            { name: 'suffix', label: 'Suffix', type: 'data', direction: 'in', dataType: 'string' },
            { name: 'out', label: 'Out', type: 'data', direction: 'out', dataType: 'string' },
        ],
        properties: [
            { name: 'suffix', label: 'Suffix', type: 'string', defaultValue: '' }
        ],
        run: async ({ input, params }) => {
            const str = input.in ?? '';
            const suffix = input.suffix ?? params.suffix;
            return { out: `${str}${suffix}` };
        },
    }],
    ['array/aggregator', {
        type: 'array/aggregator',
        label: '聚合器',
        description: '接收一个数组，添加一个后缀到每个元素，然后输出',
        archetype: 'action',
        ports: [
            { name: 'in', label: 'In', type: 'control', direction: 'in' },
            { name: 'array_in', label: 'Array In', type: 'data', direction: 'in', dataType: 'array' },
            { name: 'array_out', label: 'Array Out', type: 'data', direction: 'out', dataType: 'array' },
            { name: 'out', label: 'Out', type: 'control', direction: 'out' },
        ],
        properties: [
            { name: 'suffix', label: 'Suffix', type: 'string', defaultValue: '_aggregated' }
        ],
        run: async ({ input, params }) => {
            const inputArray = input.array_in || [];
            const processedArray = inputArray.map((item: any) => `${item.value}${params.suffix}`);
            return { array_out: processedArray };
        },
    }],
    ['test/logger', {
        type: 'test/logger',
        label: '日志记录器',
        description: '记录输入的值，用于测试',
        archetype: 'action',
        ports: [
            { name: 'in', label: 'In', type: 'control', direction: 'in' },
            { name: 'data', label: 'Data', type: 'data', direction: 'in', dataType: 'any' },
        ],
        run: async ({ input }) => {
            console.log('Logger Node Executed:', input.data);
            return {};
        },
    }],
    ['test/stream', {
        type: 'test/stream',
        label: '测试流节点',
        description: '模拟一个产生数据流的节点',
        archetype: 'stream-action',
        ports: [
            { name: 'in', label: 'In', type: 'control', direction: 'in' },
            { name: 'onChunkDone', label: 'On Done', type: 'control', direction: 'out' },
            { name: 'chunk', label: 'Chunk', type: 'data', direction: 'out', dataType: 'any' },
            { name: 'full_stream', label: 'Full Stream', type: 'data', direction: 'out', dataType: 'array' },
        ],
        properties: [
            { name: 'interval', label: '间隔 (ms)', type: 'number', defaultValue: 500 },
            { name: 'chunks', label: '数据块数量', type: 'number', defaultValue: 3 },
        ],
        run: async ({ params }) => {
            const { interval, chunks } = params;
            const accumulated: any[] = [];
            
            return {
                subscribe(subscriber: ISubscriber) {
                    let count = 0;
                    const timer = setInterval(() => {
                        if (count < chunks) {
                            const dataPacket = { value: count, timestamp: Date.now() };
                            accumulated.push(dataPacket);
                            subscriber.onData('chunk', dataPacket);
                            count++;
                        } else {
                            // When done, PUSH the full accumulated array out of the 'full_stream' port
                            subscriber.onData('full_stream', accumulated);
                            // Then, send the control signal that the stream is complete
                            subscriber.onDone('chunk');
                            clearInterval(timer);
                        }
                    }, interval);

                    return {
                        unsubscribe: () => {
                            clearInterval(timer);
                        }
                    };
                }
            };
        },
    }],
]);