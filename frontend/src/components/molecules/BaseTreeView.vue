<script setup lang="ts">
import type { TreeNode } from './types';
import BaseTreeItem from './BaseTreeItem.vue';

// Define component props and emits
defineProps<{
  nodes: TreeNode[];
  selectedNodeId?: string;
}>();

const emit = defineEmits<{
  (e: 'node-click', node: TreeNode): void;
  (e: 'node-drag-start', event: DragEvent, node: TreeNode): void;
}>();

// Event handling
const handleNodeClick = (node: TreeNode) => {
  emit('node-click', node);
};

const handleNodeDragStart = (event: DragEvent, node: TreeNode) => {
  emit('node-drag-start', event, node);
}
</script>

<template>
  <div class="base-tree-view">
    <BaseTreeItem
      v-for="node in nodes"
      :key="node.id"
      :node="node"
      :selected-node-id="selectedNodeId"
      @node-click="handleNodeClick"
      @node-drag-start="handleNodeDragStart"
    />
  </div>
</template>

<style scoped>
.base-tree-view {
  padding: var(--sp-2);
}
</style>
