import { NodeDefinition } from '@src/models/workflow';

// 这是一个简化的节点定义注册表。
// 在一个真实的、可扩展的系统中，这些定义可能来自数据库、插件或配置文件。

export const NODE_DEFINITIONS = new Map<string, NodeDefinition>([
    // =========================================================================
    // 基础数学节点
    // =========================================================================
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
        ]
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
        ]
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
        ]
    }],
]);