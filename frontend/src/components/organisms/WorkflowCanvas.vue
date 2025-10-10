<script setup lang="ts">
import { computed, watch } from 'vue';
import type { Node, Edge, NodeChange, EdgeChange } from '@vue-flow/core';
import { VueFlow, useVueFlow } from '@vue-flow/core';
import { useWorkflowSocket } from '@/composables/useWorkflowSocket';
import { Background } from '@vue-flow/background';
import { MiniMap } from '@vue-flow/minimap';
import type { NodeDefinition } from '@/types/workflow';

// 本地组件
import basenode from '@/node/BaseNode.vue';

// 状态管理
import { useUIStore } from '@/stores/ui.store';
import { useWorkflowStore } from '@/stores/workflow.store';

// 工具
import { stringToColor } from '@/utils/color';

// Vue-Flow 样式
import '@vue-flow/core/dist/style.css';
import '@vue-flow/core/dist/theme-default.css';
import '@vue-flow/minimap/dist/style.css';

const { onConnect, project, onNodeClick, onPaneClick, removeEdges, getEdges, onNodesChange, onEdgesChange } = useVueFlow();
const uiStore = useUIStore();
const workflowStore = useWorkflowStore();

// --- WebSocket Integration ---
// This will now automatically connect/disconnect as the store's runId changes.
useWorkflowSocket();

// --- 与配置面板集成 ---
onNodeClick(({ node }) => {
  uiStore.showConfigPanel(node.id);
});

onPaneClick(() => {
  uiStore.hideConfigPanel();
});

onConnect((connection) => {
  // 调用 store action 来验证并添加边
  workflowStore.validateAndAddEdge(connection);
});

// --- 状态管理 ---
// 让工作流存储成为唯一的真相来源。
// 我们从存储中计算出一个兼容 VueFlow 的节点版本。
const nodes = computed<Node[]>(() => {
  // By accessing runningNodeIds here, we make this computed property
  // reactive to any changes within the Set.
  const runningIds = workflowStore.runningNodeIds;
  return workflowStore.nodes.map(n => ({
    id: n.id,
    type: 'basenode', // 我们的所有节点都使用相同的 BaseNode 组件进行渲染
    position: n.position,
    selected: n.id === uiStore.selectedNodeId,
    data: {
      label: n.label,
      // 将所有端口传递给 BaseNode 以进行渲染
      input: n.ports.filter(p => p.direction === 'in'),
      output: n.ports.filter(p => p.direction === 'out'),
      // Pass running status to the node for dynamic styling
      isRunning: runningIds.includes(n.id),
    },
  }));
});

// 边缘由存储管理，我们将其与 VueFlow 同步
const edges = computed<Edge[]>(() => workflowStore.edges.map(e => {
  const edgeStyles = {
    strokeWidth: 2.5,
    stroke: 'var(--c-text-placeholder)', // 默认灰色 (用于 control)
  };

  if (e.dataType) {
    edgeStyles.stroke = stringToColor(e.dataType).hsl;
  }

  return {
    id: e.id,
    source: e.source.nodeId,
    sourceHandle: `${e.source.portName}-${e.source.nodeId}`,
    target: e.target.nodeId,
    targetHandle: `${e.target.portName}-${e.target.nodeId}`,
    animated: !!e.dataType, // 只有数据流才有动画 (根据用户反馈修正)
    style: edgeStyles,
  };
}));

// 监视存储中的边缘变化并将其与 VueFlow 同步
watch(() => workflowStore.edges, (newStoreEdges) => {
  const currentFlowIds = new Set(getEdges.value.map(e => e.id));
  const storeIds = new Set(newStoreEdges.map(e => e.id));

  // 找出需要从 VueFlow 中移除的边缘
  const edgesToRemove = [...currentFlowIds].filter(id => !storeIds.has(id));
  if (edgesToRemove.length > 0) {
    removeEdges(edgesToRemove);
  }
}, { deep: true });

// Node definitions are now managed by the workflow store,
// ensuring a single source of truth across the application.

// --- 拖放逻辑 ---
function onDragOver(event: DragEvent) {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'copy';
  }
}

function onDrop(event: DragEvent) {
  const definition: NodeDefinition = JSON.parse(event.dataTransfer?.getData('application/json') || '{}');
  if (!definition || !definition.type) {
    console.error("拖放的数据不是一个有效的 NodeDefinition。");
    return;
  }

  const container = event.currentTarget as HTMLDivElement;
  if (!container) return;

  const { left, top } = container.getBoundingClientRect();

  const position = project({
    x: event.clientX - left,
    y: event.clientY - top,
  });

  // 调用存储操作以创建新节点
  workflowStore.addNode(definition.type, position);
}

// --- 删除处理 ---
// 使用通用的 onNodesChange 和 onEdgesChange 来处理来自画布的各种事件
onNodesChange((changes: NodeChange[]) => {
  const nodeIdsToRemove: string[] = [];
  for (const change of changes) {
    if (change.type === 'remove') {
      nodeIdsToRemove.push(change.id);
    } else if (change.type === 'position' && change.position) {
      // 当节点位置变化时 (例如拖拽), 更新 store
      const node = workflowStore.nodes.find(n => n.id === change.id);
      if (node && (node.position.x !== change.position.x || node.position.y !== change.position.y)) {
        workflowStore.updateNodePosition(change.id, change.position);
      }
    }
  }

  if (nodeIdsToRemove.length > 0) {
    workflowStore.removeNodes(nodeIdsToRemove);
  }
});

onEdgesChange((changes: EdgeChange[]) => {
  const edgeIdsToRemove: string[] = [];
  for (const change of changes) {
    if (change.type === 'remove') {
      edgeIdsToRemove.push(change.id);
    }
  }

  if (edgeIdsToRemove.length > 0) {
    workflowStore.removeEdges(edgeIdsToRemove);
  }
});


// TODO: 暴露一个保存函数，从存储中获取数据

</script>

<template>
  <VueFlow
    :nodes="nodes"
    :edges="edges"
    class="main-vueflow"
    @dragover="onDragOver"
    @drop="onDrop"
  >
    <Background />
    <MiniMap pannable zoomable />
    <template #node-basenode="basenodeProps">
      <basenode v-bind="basenodeProps" />
    </template>
  </VueFlow>
</template>

<style scoped>
.main-vueflow {
  height: 100%;
  width: 100%;
  flex-grow: 1;
  background-color: var(--color-bg-subtle);
}
</style>
