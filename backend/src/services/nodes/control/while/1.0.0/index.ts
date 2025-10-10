import { NodeDefinition } from '@src/models/workflow';
import { NodeHandler } from './handler';

const handler = new NodeHandler();

// The run method is now bound to the handler instance.
const run = handler.run.bind(handler);


export default {
    type: 'control/while',
    label: '条件循环 (While)',
    version: '1.0.0',
    description: '当条件为真时重复执行子图',
    archetype: 'loop',
    ports: [
        // While 循环没有 forEach 那样的数组输入，它的条件在子图内部计算。
        // 子图必须有一个名为 'loopCondition' 的布尔输出。
        { name: 'loopCompleted', label: '循环完成', type: 'control', direction: 'out' },
    ],
    run, // Placeholder
} as NodeDefinition;