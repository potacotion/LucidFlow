<script setup lang="ts">
import { computed, watch } from 'vue';
import type { Node, Edge } from '@vue-flow/core';
import { VueFlow, useVueFlow } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import type { NodeDefinition } from '@/types/workflow';

// Local Components
import basenode from '@/node/BaseNode.vue';

// Stores
import { useUIStore } from '@/stores/ui.store';
import { useWorkflowStore } from '@/stores/workflow.store';

// Utils
import { stringToColor } from '@/utils/color';


// Vue-Flow Styles
import '@vue-flow/core/dist/style.css';
import '@vue-flow/core/dist/theme-default.css';

const { onConnect, addEdges, project, onNodeClick, onPaneClick, removeEdges, getEdges } = useVueFlow();
const uiStore = useUIStore();
const workflowStore = useWorkflowStore();

// --- Integration with Config Panel ---
onNodeClick(({ node }) => {
  uiStore.showConfigPanel(node.id);
});

onPaneClick(() => {
  uiStore.hideConfigPanel();
});

onConnect((connection) => {
  if (!connection.sourceHandle) {
    console.warn('Connection ignored: source handle is missing.', connection);
    return;
  }
  const portDataType = connection.sourceHandle?.split('-').pop()
  if (!portDataType) {
    console.warn('Could not determine port dataType from source handle', connection.sourceHandle)
    return
  }
  const color = stringToColor(portDataType).hsl;
  const newEdge = {
    ...connection,
    style: {
      stroke: color,
      strokeWidth: 2.5,
    },
    animated: true,
  };
  addEdges(newEdge);
});

// --- State Management ---
// Let the workflow store be the single source of truth.
// We compute a VueFlow-compatible version of the nodes from the store.
const nodes = computed<Node[]>(() => workflowStore.nodes.map(n => ({
  id: n.id,
  type: 'basenode', // All our nodes use the same BaseNode component for rendering
  position: n.position,
  data: {
    label: n.label,
    // Pass all ports to the BaseNode for rendering
    input: n.ports.filter(p => p.direction === 'in'),
    output: n.ports.filter(p => p.direction === 'out'),
  },
})));

// Edges are managed by the store, and we sync them with VueFlow
const edges = computed<Edge[]>(() => workflowStore.edges.map(e => ({
  id: e.id,
  source: e.source.nodeId,
  sourceHandle: `${e.source.portName}-${e.source.nodeId}`,
  target: e.target.nodeId,
  targetHandle: `${e.target.portName}-${e.target.nodeId}`,
  animated: true,
})));

// Watch for changes in the store's edges and sync them with VueFlow
watch(() => workflowStore.edges, (newStoreEdges) => {
  const currentFlowIds = new Set(getEdges.value.map(e => e.id));
  const storeIds = new Set(newStoreEdges.map(e => e.id));

  // Find edges to remove from VueFlow
  const edgesToRemove = [...currentFlowIds].filter(id => !storeIds.has(id));
  if (edgesToRemove.length > 0) {
    removeEdges(edgesToRemove);
  }

  // NOTE: Adding edges is handled by the `onConnect` callback for now.
  // If edges could be added programmatically from the store, we'd need to
  // handle that here as well by finding and adding new edges.
}, { deep: true });


// Node Definitions are passed from outside now, so we don't fetch them here.
// This makes the component more reusable.
const props = defineProps<{
  nodeDefinitions: NodeDefinition[]
}>()

// --- Drag and Drop Logic ---
function onDragOver(event: DragEvent) {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'copy';
  }
}

function onDrop(event: DragEvent) {
  const definition: NodeDefinition = JSON.parse(event.dataTransfer?.getData('application/json') || '{}');
  if (!definition || !definition.type) {
    console.error("Dropped data is not a valid NodeDefinition.");
    return;
  }

  const container = event.currentTarget as HTMLDivElement;
  if (!container) return;

  const { left, top } = container.getBoundingClientRect();

  const position = project({
    x: event.clientX - left,
    y: event.clientY - top,
  });

  // Call the store action to create the new node
  workflowStore.addNode(definition.type, position);
}

// TODO: Expose a save function that gets data from the store

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
