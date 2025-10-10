import { NodeDefinition } from '@src/models/workflow';
import { NodeHandler } from './handler';

const handler = new NodeHandler();

export default {
    type: 'test/longTask',
    label: '耗时任务 (3s)',
    version: '1.0.0',
    description: '模拟一个耗时3秒的操作，用于测试高负载',
    archetype: 'action',
    ports: [
        { name: 'in', label: 'In', type: 'control', direction: 'in' },
        { name: 'out', label: 'Out', type: 'control', direction: 'out' },
    ],
    run: handler.run.bind(handler),
} as NodeDefinition;