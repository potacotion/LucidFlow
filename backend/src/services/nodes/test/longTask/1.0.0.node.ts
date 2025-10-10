import { NodeDefinition } from '@src/models/workflow';

export default {
    type: 'test/longTask',
    label: '耗时任务 (30s)',
    version: '1.0.0',
    description: '模拟一个耗时30秒的操作，用于测试高负载',
    archetype: 'action',
    ports: [
        { name: 'in', label: 'In', type: 'control', direction: 'in' },
        { name: 'out', label: 'Out', type: 'control', direction: 'out' },
    ],
    run: async () => {
        console.log('[start] a long time task');
        await new Promise(resolve => setTimeout(resolve, 3000)); // 等待30秒
        console.log('[end] a long time task');
        return {};
    },
} as NodeDefinition;