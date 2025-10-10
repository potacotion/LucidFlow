import { computed, watch } from 'vue';
import { useWebSocket } from '@vueuse/core';
import { useWorkflowStore } from '@/stores/workflow.store';
import { BaseToast } from '@/services/toast';

export function useWorkflowSocket() {
  const store = useWorkflowStore();

  const wsUrl = computed(() => {
    if (store.currentRunId) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      return `${protocol}//${host}/ws/workflow/${store.currentRunId}`;
    }
    return undefined; // Let useWebSocket handle the undefined URL (it won't connect)
  });

  const { status, data, send, open, close } = useWebSocket(wsUrl, {
    autoReconnect: false,
    onConnected: () => {
      BaseToast.info(`Real-time connection established for run: ${store.currentRunId}`);
    },
    onError: (_, event) => {
      console.error('WebSocket error:', event);
      BaseToast.error('Real-time connection failed.');
      store.handleExecutionEnd();
    },
    onDisconnected: () => {
       BaseToast.info('Real-time connection closed.');
    },
  });

  watch(data, (messageStr) => {
    try {
      const message = JSON.parse(messageStr);
      switch (message.event) {
        case 'node:start':
          store.handleNodeStart(message.payload.nodeId);
          break;
        case 'node:end':
          store.handleNodeEnd(message.payload.nodeId);
          break;
        case 'workflow:end':
          if (message.payload.status === 'completed') {
            const resultsString = JSON.stringify(message.payload.results, null, 2);
            BaseToast.success(`Workflow finished with results: ${resultsString}`);
          } else {
            BaseToast.error(`Workflow failed: ${message.payload.error}`);
          }
          // The store's handleExecutionEnd will set currentRunId to null,
          // which will cause the computed wsUrl to become undefined,
          // and useWebSocket will automatically close the connection.
          // Add a small delay to ensure the last node's highlight is visible.
          setTimeout(() => {
            store.handleExecutionEnd();
          }, 500); // Slightly longer than MIN_HIGHLIGHT_DURATION
          break;
        default:
          console.warn('Unknown WebSocket event received:', message);
      }
    } catch (error)      {
      console.error('Failed to parse WebSocket message:', error);
    }
  });

  return {
    status,
  };
}
