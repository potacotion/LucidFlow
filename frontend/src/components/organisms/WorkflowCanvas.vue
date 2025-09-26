<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Node, Edge } from '@vue-flow/core';
import { VueFlow, useVueFlow } from '@vue-flow/core';
import { Background } from '@vue-flow/background';

// Base Components (some might be needed if you display info in-canvas)
// import BaseBox from '@/components/atoms/BaseBox.vue';

// API Services
import { NodeDefinitionsService, NodeDefinition, WorkflowsService } from '@/api';

// Local Components
import basenode from '@/node/BaseNode.vue';

// Services
import { BaseToast } from '@/services/toast';

// Utils
import { stringToColor } from '@/utils/color';
import { useUIStore } from '@/stores/ui.store';

// Vue-Flow Styles
import '@vue-flow/core/dist/style.css';
import '@vue-flow/core/dist/theme-default.css';

const { onConnect, addEdges, project, addNodes, onNodeClick, onPaneClick } = useVueFlow();
const uiStore = useUIStore();

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

// VueFlow State
const nodes = ref<Node[]>([]);
const edges = ref<Edge[]>([]);

// Node Definitions are passed from outside now, so we don't fetch them here.
// This makes the component more reusable.
const props = defineProps<{
  nodeDefinitions: NodeDefinition[]
}>()

// Drag and Drop Logic
function onDragOver(event: DragEvent) {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'copy';
  }
}

let id = 0;
function getId() {
  return `dndnode_${id++}`;
}

function onDrop(event: DragEvent) {
  const definition = JSON.parse(event.dataTransfer?.getData('application/json') || '{}');

  // Use event.currentTarget to get the VueFlow container element
  const container = event.currentTarget as HTMLDivElement;
  if (!container) return;

  const { left, top } = container.getBoundingClientRect();

  const position = project({
    x: event.clientX - left,
    y: event.clientY - top,
  });

  const newNode: Node = {
    id: getId(),
    type: 'basenode',
    position,
    data: {
      label: definition.label,
      //input: definition.ports?.filter((p: any) => p.direction === 'in' && p.type === 'data').map((p: any) => ({ name: p.name, data: p.defaultValue })) || [],
      //output: definition.ports?.filter((p: any) => p.direction === 'out' && p.type === 'data').map((p: any) => ({ name: p.name, data: null })) || [],
      input: definition.ports?.filter((p: any) => p.direction === 'in' ).map((p: any) => ({ name: p.name, type: p.type, dataType: p.dataType, data: p.defaultValue })) || [],
      output: definition.ports?.filter((p: any) => p.direction === 'out' ).map((p: any) => ({ name: p.name, type: p.type, dataType: p.dataType, data: null })) || [],
    },
  };
  addNodes([newNode]);
}

// Expose workflow data for saving
defineExpose({
  getWorkflowData: () => ({
    nodes: nodes.value,
    edges: edges.value,
  })
});

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
