import { NodeDefinition } from '@src/models/workflow';

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
            { name: 'value', label: '值', type: 'data', direction: 'out', dataType: 'any' },
        ],
        properties: [
            { name: 'value', label: '值', type: 'string', defaultValue: '' }
        ],
        run: async ({ params }) => {
            return { value: params.value };
        },
    }],
    ['math/add', {
        type: 'math/add',
        label: '加法',
        description: '计算两个数的和',
        archetype: 'pure',
        ports: [
            { name: 'a', label: 'A', type: 'data', direction: 'in', dataType: 'number', defaultValue: 0 },
            { name: 'b', label: 'B', type: 'data', direction: 'in', dataType: 'number', defaultValue: 0 },
            { name: 'result', label: '结果', type: 'data', direction: 'out', dataType: 'number' },
        ],
        run: async ({ input }) => {
            const a = input.a ?? 0;
            const b = input.b ?? 0;
            return { result: a + b };
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
            // Loop outputs are defined by connecting subgraph nodes to a 'graph/output' proxy node.
            // A loop node might have a final collected output.
            { name: 'collected', label: '收集的结果', type: 'data', direction: 'out', dataType: 'array' },
        ],
        run: async () => ({ collected: [] }), // Placeholder
    }],

    ['control/compound', {
        type: 'control/compound',
        label: '复合节点',
        description: '这是一个可以包含子图的节点',
        archetype: 'compound',
        // Compound node ports are defined dynamically by the user in the UI.
        // The definition itself only needs to declare its archetype.
        // The actual ports are part of the NodeInstance's subgraph via graph/input and graph/output nodes.
        ports: [
            // Example ports that a user might define.
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
        description: 'Represents an input port of a parent compound node.',
        archetype: 'pure', // Acts as a data source within the subgraph
        ports: [
            // Ports are dynamically determined by the parent's definition
            // but a generic output is needed for connecting inside the subgraph.
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
        description: 'Represents an output port of a parent compound node.',
        archetype: 'pure', // Acts as a data sink within the subgraph
        ports: [
            // A generic input is needed for connecting inside the subgraph.
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
]);