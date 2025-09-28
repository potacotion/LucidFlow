<script setup lang="ts">
import { ref, computed } from 'vue';
import type { TreeNode } from './types';
import BaseIcon from '@/components/atoms/BaseIcon.vue';

// Define component props and emits
const props = defineProps<{
  node: TreeNode;
}>();

const emit = defineEmits<{
  (e: 'node-click', node: TreeNode): void;
}>();

// Component state
const isExpanded = ref(false);

// Computed properties
const isFolder = computed(() => {
  return props.node.children && props.node.children.length > 0;
});

// Methods
const handleClick = () => {
  if (isFolder.value) {
    isExpanded.value = !isExpanded.value;
  }
  emit('node-click', props.node);
};
</script>

<template>
  <div class="base-tree-item">
    <div
      class="item-content"
      :class="{ folder: isFolder }"
      @click.stop="handleClick"
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
        @node-click="$emit('node-click', $event)"
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

.item-content:hover {
  background-color: var(--color-bg-hover);
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
