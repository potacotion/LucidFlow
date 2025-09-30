<script setup lang="ts">
import { ref, computed } from 'vue';
import type { TreeNode } from './types';
import BaseIcon from '@/components/atoms/BaseIcon.vue';

// Define component props and emits
const props = defineProps<{
  node: TreeNode;
  selectedNodeId?: string;
}>();

const emit = defineEmits<{
  (e: 'node-click', node: TreeNode): void;
  (e: 'node-drag-start', event: DragEvent, node: TreeNode): void;
}>();

// Component state
const isExpanded = ref(false);

// Computed properties
const isFolder = computed(() => {
  // Prioritize the explicit `isFolder` flag from the node data.
  if (typeof props.node.isFolder === 'boolean') {
    return props.node.isFolder;
  }
  // Fallback for older data structures that might not have the flag.
  return props.node.children && props.node.children.length > 0;
});

const isDraggable = computed(() => !isFolder.value);

const isSelected = computed(() => props.node.id === props.selectedNodeId);

// Methods
const handleClick = () => {
  if (isFolder.value) {
    isExpanded.value = !isExpanded.value;
  }
  emit('node-click', props.node);
};

const onDragStart = (event: DragEvent) => {
  if (isDraggable.value) {
    emit('node-drag-start', event, props.node);
  }
}
</script>

<template>
  <div class="base-tree-item">
    <div
      class="item-content"
      :class="{ folder: isFolder, draggable: isDraggable, 'is-selected': isSelected }"
      :draggable="isDraggable"
      @click.stop="handleClick"
      @dragstart="onDragStart"
    >
      <BaseIcon
        v-if="isFolder"
        :icon="isExpanded ? 'fa-solid fa-folder-open' : 'fa-solid fa-folder'"
        class="icon folder-icon"
      />
      <BaseIcon v-else icon="fa-solid fa-file-lines" class="icon file-icon" />
      <span class="label">{{ node.label }}</span>
    </div>
    <div v-if="isFolder && isExpanded" class="children-container">
      <!-- Recursively call self for children -->
      <BaseTreeItem
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :selected-node-id="selectedNodeId"
        @node-click="$emit('node-click', $event)"
        @node-drag-start="(...args) => $emit('node-drag-start', ...args)"
      />
    </div>
  </div>
</template>

<style scoped>
.base-tree-item {
  user-select: none;
}

.item-content {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.item-content:hover,
.item-content.is-selected {
  background-color: var(--c-border-dark);
}

.item-content.draggable {
  cursor: grab;
}

.item-content.draggable:active {
  cursor: grabbing;
}

.item-content.folder {
  font-weight: 500;
}

.icon {
  margin-right: 8px;
  width: 16px;
  text-align: center;
  color: var(--color-icon);
}

.children-container {
  padding-left: 20px;
  border-left: 1px solid var(--color-border);
  margin-left: 12px; /* Align with the folder icon */
}
</style>
