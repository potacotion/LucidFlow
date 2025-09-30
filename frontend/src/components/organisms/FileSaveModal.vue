<script setup lang="ts">
import { ref, computed } from 'vue';
import prompt from '@/services/prompt';
import confirm from '@/services/confirm';
import BaseModal from '@/components/atoms/BaseModal.vue';
import BaseStack from '@/components/atoms/BaseStack.vue';
import BaseButton from '@/components/atoms/BaseButton.vue';
import BaseInput from '@/components/atoms/BaseInput.vue';
import BaseTreeView from '@/components/molecules/BaseTreeView.vue';
import type { TreeNode } from '@/components/molecules/types';

// --- PROPS & EMITS ---
const props = defineProps<{
  open: boolean;
  fileTree: TreeNode[];
  initialFilename?: string;
}>();

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
  (e: 'save', fullPath: string): void;
  (e: 'createFolder', data: { name: string; parentId?: string }): void;
  (e: 'deleteItem', data: { id: string; isFolder: boolean }): void;
}>();

// --- STATE ---
const selectedNode = ref<TreeNode | null>(null);
const filename = ref(props.initialFilename || '');

// --- COMPUTED ---
const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
});

const canSave = computed(() => {
  return filename.value.trim() !== '' && selectedNode.value && selectedNode.value.isFolder;
});

const fullPath = computed(() => {
  if (!selectedNode.value || !filename.value) return '';
  // If root is selected, path is just the filename
  if (selectedNode.value.id === 'root') { // Assuming a root node might have a special ID
    return filename.value;
  }
  // Construct path from selected folder
  return `${selectedNode.value.id}/${filename.value}`;
});


// --- METHODS ---
const handleNodeClick = (node: TreeNode) => {
  // Always update the selected node to reflect the current click
  selectedNode.value = node;
};

const handleSave = () => {
  if (canSave.value) {
    emit('save', fullPath.value);
    isOpen.value = false; // Close modal on save
  }
};

const handleCancel = () => {
  isOpen.value = false;
};
const handleCreateFolder = async () => {
  const folderName = await prompt({
    title: '新建文件夹',
    message: '请输入文件夹名称：',
  });
  if (folderName) {
    // Only use the selected node's ID if it's explicitly a folder.
    // Otherwise, create the new folder at the root level (parentId is undefined).
    const parentId = (selectedNode.value && selectedNode.value.isFolder)
      ? selectedNode.value.id
      : undefined;
    emit('createFolder', { name: folderName, parentId });
  }
};

const handleDelete = async () => {
  if (selectedNode.value) {
    const confirmed = await confirm({
      title: '删除确认',
      message: `您确定要删除 '${selectedNode.value.label}' 吗？`,
    });
    if (confirmed) {
      emit('deleteItem', {
        id: selectedNode.value.id,
        isFolder: !!selectedNode.value.isFolder,
      });
    }
  }
};

</script>

<template>
  <BaseModal v-model:open="isOpen" title="Save Workflow As">
    <BaseStack vertical spacing="lg">
      <BaseStack spacing="sm" class="toolbar">
        <BaseButton size="sm" @click="handleCreateFolder">New Folder</BaseButton>
        <BaseButton size="sm" variant="danger" :disabled="!selectedNode" @click="handleDelete">
          Delete
        </BaseButton>
      </BaseStack>
      <div class="tree-view-container">
        <BaseTreeView :nodes="fileTree" @node-click="handleNodeClick" />
      </div>

      <BaseStack vertical spacing="sm">
        <label for="filename-input">Save to folder: {{ selectedNode?.id || 'None selected' }}</label>
        <BaseInput
          id="filename-input"
          v-model="filename"
          placeholder="Enter filename..."
        />
      </BaseStack>
    </BaseStack>

    <template #footer>
      <BaseStack justify-content="flex-end" spacing="md">
        <BaseButton variant="secondary" @click="handleCancel">Cancel</BaseButton>
        <BaseButton :disabled="!canSave" @click="handleSave">Save</BaseButton>
      </BaseStack>
    </template>
  </BaseModal>
</template>

<style scoped>
.toolbar {
  padding-bottom: var(--sp-sm);
  border-bottom: 1px solid var(--c-border-base);
}

.tree-view-container {
  height: 300px;
  overflow-y: auto;
  border: 1px solid var(--c-border-base);
  border-radius: var(--radius-md);
  padding: var(--sp-sm);
}
</style>
