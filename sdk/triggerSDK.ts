import { computed, ref } from 'vue';

type TriggerOptions = {
    workflowId: string;
    triggerTag: string;
    initialData?: any;
    baseUrl?: string;
};

type RunInfo = {
    runId: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    error?: string;
};

// 内部状态和连接管理
const activeListeners = new Map<string, Set<(data: any) => void>>();
let ws: WebSocket | null = null;
let currentRunId: string | null = null;

// 使用 Vue 的 ref 来响应式地追踪执行状态
const runState = ref<RunInfo | null>(null);

/**
 * 确保 WebSocket 连接建立并订阅 runId
 * @param runId 
 * @param baseUrl 
 */
function ensureWebSocketConnection(runId: string, baseUrl: string): Promise<void> {
    // 检查现有连接是否有效
    if (ws && ws.readyState === WebSocket.OPEN && currentRunId === runId) {
        return Promise.resolve();
    }
    
    // 清理旧连接
    if (ws) {
        ws.close();
    }

    const wsUrl = baseUrl.replace(/^http/, 'ws');
    ws = new WebSocket(`${wsUrl}/ws/workflow/${runId}`);
    currentRunId = runId;

    return new Promise((resolve, reject) => {
        ws!.onopen = () => {
            console.log(`[TriggerSDK] WebSocket connected for runId: ${runId}`);
            resolve();
        };

        ws!.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                
                // 处理 workflow:data (来自 websocket/send 节点)
                if (message.event === 'workflow:data') {
                    const { tag, data } = message.payload;
                    if (activeListeners.has(tag)) {
                        activeListeners.get(tag)?.forEach(callback => callback(data));
                    }
                }
                
                // 处理 workflow:end
                if (message.event === 'workflow:end') {
                    runState.value = {
                        runId,
                        status: message.payload.status,
                        error: message.payload.error,
                    };
                    ws?.close();
                }
            } catch (e) {
                console.error('[TriggerSDK] Failed to parse WebSocket message:', e);
            }
        };

        ws!.onerror = (error) => {
            console.error('[TriggerSDK] WebSocket error:', error);
            runState.value = { runId, status: 'failed', error: 'WebSocket connection failed.' };
            reject(new Error("WebSocket connection failed."));
        };
        
        ws!.onclose = () => {
            if (runState.value?.status === 'pending' || runState.value?.status === 'running') {
                 // 如果在执行结束前关闭，视为失败
                 runState.value = { runId, status: 'failed', error: 'Connection closed unexpectedly.' };
            }
            if (currentRunId === runId) {
                currentRunId = null;
            }
        }
    });
}

/**
 * 触发工作流执行并返回监听接口
 * @param options 
 * @returns 
 */
export function trigger({ workflowId, triggerTag, initialData, baseUrl = 'http://localhost:3000/api' }: TriggerOptions) {
    
    // 1. 调用后端 API 启动执行并获取 runId
    const triggerExecution = async () => {
        runState.value = { runId: '', status: 'pending' }; // 临时状态，等待 runId
        
        const response = await fetch(`${baseUrl}/workflows/${workflowId}/trigger`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // TODO: 考虑认证 Token
            },
            body: JSON.stringify({ triggerTag, initialData }),
        });

        if (!response.ok) {
            const error = await response.json();
            runState.value = { runId: '', status: 'failed', error: error.error || `Trigger failed with status ${response.status}` };
            throw new Error(error.error || `Trigger failed with status ${response.status}`);
        }
        
        const { runId } = await response.json();
        
        // 2. 建立 WebSocket 连接
        await ensureWebSocketConnection(runId, baseUrl);

        runState.value = { runId, status: 'running' };

        return runId;
    }

    // 3. 返回监听接口
    return {
        runState: computed(() => runState.value),
        
        /**
         * 注册一个回调函数来监听特定标签的数据输出。
         * @param tag websocket/send 节点配置的 tag
         * @param callback 接收数据时的回调
         * @returns 用于取消订阅的函数
         */
        listen: (tag: string, callback: (data: any) => void): (() => void) => {
            if (!activeListeners.has(tag)) {
                activeListeners.set(tag, new Set());
            }
            activeListeners.get(tag)?.add(callback);

            return () => {
                const callbacks = activeListeners.get(tag);
                callbacks?.delete(callback);
                if (callbacks?.size === 0) {
                    activeListeners.delete(tag);
                }
            };
        },
        
        /**
         * 执行触发操作
         */
        execute: triggerExecution,
    };
}

// 导出 runState 以便在 SDK 外部查看
export { runState };