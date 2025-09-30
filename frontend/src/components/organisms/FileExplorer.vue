<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import prompt from '@/services/prompt';
import confirm from '@/services/confirm';
import { FoldersService, WorkflowsService } from '@/api';
import FileSaveModal from './FileSaveModal.vue';
import { useFileStore } from '@/stores/file.store';
import { BaseToast } from '@/services/toast';
import BaseTreeView from '@/components/molecules/BaseTreeView.vue';
import SaveButton from '@/components/molecules/SaveButton.vue';
import type { TreeNode } from '@/components/molecules/types';
import BaseStack from '@/components/atoms/BaseStack.vue';
import BaseText from '@/components/atoms/BaseText.vue';
import BaseButton from '@/components/atoms/BaseButton.vue';
import BaseIcon from '@/components/atoms/BaseIcon.vue';
import { convertFoldersToTreeNodes } from '@/utils/tree.utils';

const fileStore = useFileStore();
const selectedNode = ref<TreeNode | null>(null);

const fileTree = computed(() => convertFoldersToTreeNodes(fileStore.fileTree));

onMounted(() => {
  fileStore.fetchFileTree();
});

const handleNodeClick = (node: TreeNode) => {
  selectedNode.value = node;
  if (!node.isFolder) {
    fileStore.loadFile(node.id);
  }
};

const promptAndCreateFolder = async () => {
  const name = await prompt({
    title: '新建文件夹',
    message: '请输入文件夹名称：',
  });
  if (name) {
    const parentId = (selectedNode.value && selectedNode.value.isFolder)
      ? selectedNode.value.id
      : '__root__'; // Default to root if nothing valid is selected
    handleCreateFolder({ name, parentId });
  }
};
const handleCreateFolder = async (data: { name: string; parentId?: string }) => {
  try {
    await FoldersService.postApiFolders(data);
    BaseToast.success(`Folder '${data.name}' created.`);
    await fileStore.fetchFileTree(); // Refresh the tree
  } catch (error) {
    BaseToast.error('Failed to create folder.');
    console.error('Failed to create folder:', error);
  }
};

const handleDeleteItem = async () => {
  if (!selectedNode.value) return;

  const confirmed = await confirm({
    title: '删除确认',
    message: `您确定要删除 '${selectedNode.value.label}' 吗？`,
  });

  if (!confirmed) return;

  try {
    if (selectedNode.value.isFolder) {
      await FoldersService.deleteApiFolders(selectedNode.value.id);
      BaseToast.success(`Folder deleted.`);
    } else {
      await WorkflowsService.deleteApiWorkflows(selectedNode.value.id);
      BaseToast.success(`Workflow deleted.`);
    }
    selectedNode.value = null; // Deselect after deletion
    await fileStore.fetchFileTree(); // Refresh the tree
  } catch (error) {
    BaseToast.error('Failed to delete item.');
    console.error('Failed to delete item:', error);
  }
};
</script>

<template>
  <div class="file-explorer">
    <BaseStack vertical spacing="sm" padding="base">
      <BaseStack justify-content="space-between" align="center">
        <BaseText as="h3" size="lg" :weight="600">Files</BaseText>
        <BaseStack spacing="sm" direction="row">
          <BaseButton
            circle
            variant="secondary"
            v-tooltip="'New Folder'"
            @click="promptAndCreateFolder"
          >
            <BaseIcon icon="fa-solid fa-folder-plus" />
          </BaseButton>
          <BaseButton
            circle
            variant="secondary"
            v-tooltip="'Delete Selected'"
            :disabled="!selectedNode"
                  @click="handleDeleteItem"
                >
                  <BaseIcon icon="fa-solid fa-trash" />
                </BaseButton>
                <SaveButton @save="fileStore.saveFile" @save-as="fileStore.openSaveAsModal" />
              </BaseStack>
            </BaseStack>
            <BaseTreeView
              :nodes="fileTree"
              :selected-node-id="selectedNode?.id"
              @node-click="handleNodeClick"
            />
          </BaseStack>
          <FileSaveModal
            v-model:open="fileStore.isSaveModalOpen"
            :file-tree="fileTree"
            @save="fileStore.saveFileAs"
            @create-folder="handleCreateFolder"
            @delete-item="handleDeleteItem"
          />
  </div>
</template>

<style scoped>
.file-explorer {
  height: 100%;
  overflow-y: auto;
  background-color: var(--c-fill-light);
  box-shadow: var(--shadow-base);
  border-right: 1px solid var(--c-border-base);
  width: 280px;
}
</style>
