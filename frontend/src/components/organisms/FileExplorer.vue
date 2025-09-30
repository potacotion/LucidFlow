<script setup lang="ts">
import { ref, onMounted } from 'vue';
import prompt from '@/services/prompt';
import { WorkflowsService, FoldersService, type Workflow } from '@/api';
import FileSaveModal from './FileSaveModal.vue';
import { useWorkflowStore } from '@/stores/workflow.store';
import { BaseToast } from '@/services/toast';
import BaseTreeView from '@/components/molecules/BaseTreeView.vue';
import SaveButton from '@/components/molecules/SaveButton.vue';
import { convertFoldersToTreeNodes } from '@/utils/tree.utils';
import type { TreeNode } from '@/components/molecules/types';
import BaseStack from '@/components/atoms/BaseStack.vue';
import BaseText from '@/components/atoms/BaseText.vue';
import BaseButton from '@/components/atoms/BaseButton.vue';
import BaseIcon from '@/components/atoms/BaseIcon.vue';

const fileTree = ref<TreeNode[]>([]);
const workflowStore = useWorkflowStore();
const isSaveModalOpen = ref(false);
const selectedNode = ref<TreeNode | null>(null);

const fetchWorkflows = async () => {
  try {
    const folders = await WorkflowsService.getApiWorkflows();
    // The API returns a Folder[] structure, which is slightly different from our internal Folder type.
    // We cast it to 'any' to bypass the strict type check, as the structure is compatible.
    fileTree.value = convertFoldersToTreeNodes(folders as any);
  } catch (error) {
    BaseToast.error('Failed to fetch workflows.');
    console.error('Failed to fetch workflows:', error);
  }
};

onMounted(fetchWorkflows);

const handleNodeClick = async (node: TreeNode) => {
  selectedNode.value = node;

  // Only handle clicks on files (which we identify by !isFolder), not folders
  if (node.isFolder) {
    return;
  }

  try {
    // The node's id from the tree IS the workflow ID
    const workflow = await WorkflowsService.getApiWorkflows1(node.id);
    workflowStore.loadWorkflow(workflow);
    BaseToast.success(`Loaded: ${workflow.name}`);
  } catch (error) {
    BaseToast.error('Failed to load workflow.');
    console.error(`Failed to load workflow ${node.id}:`, error);
  }
};

const handleSave = async () => {
  const workflowData = workflowStore.currentWorkflowData;

  // If there's no ID, it's a new workflow. Delegate to handleSaveAs.
  if (!workflowData.id) {
    handleSaveAs();
    return;
  }

  try {
    await WorkflowsService.putApiWorkflows(
      workflowData.id,
      workflowData as Workflow
    );
    BaseToast.success('Workflow saved!');
    await fetchWorkflows(); // Refresh the file list to show the latest state
  } catch (error) {
    BaseToast.error('Failed to save workflow.');
    console.error('Failed to save workflow:', error);
  }
};

const handleSaveAs = async () => {
  isSaveModalOpen.value = true;
};

const handleSaveAsConfirm = async (newPath: string) => {
  const workflowData = workflowStore.currentWorkflowData;
  if (!workflowData) return;

  try {
    const newWorkflowData: Omit<Workflow, 'id'> = {
      graph: {
        nodes: workflowData.nodes,
        edges: workflowData.edges,
      },
      name: newPath,
    };

    const createdWorkflow = await WorkflowsService.postApiWorkflows(
      newWorkflowData as Workflow
    );
    workflowStore.loadWorkflow(createdWorkflow);
    BaseToast.success(`Workflow saved as ${newPath}`);
    await fetchWorkflows();
  } catch (error) {
    BaseToast.error('Failed to save new workflow.');
    console.error('Failed to save workflow as new:', error);
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
    await fetchWorkflows(); // Refresh the tree
  } catch (error) {
    BaseToast.error('Failed to create folder.');
    console.error('Failed to create folder:', error);
  }
};

const handleDeleteItem = async (data: { id: string; isFolder: boolean }) => {
  try {
    if (data.isFolder) {
      await FoldersService.deleteApiFolders(data.id);
      BaseToast.success(`Folder deleted.`);
    } else {
      await WorkflowsService.deleteApiWorkflows(data.id);
      BaseToast.success(`Workflow deleted.`);
    }
    await fetchWorkflows(); // Refresh the tree
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
            @click="handleDeleteItem({ id: selectedNode!.id, isFolder: !!selectedNode!.isFolder })"
          >
            <BaseIcon icon="fa-solid fa-trash" />
          </BaseButton>
          <SaveButton @save="handleSave" @save-as="handleSaveAs" />
        </BaseStack>
      </BaseStack>
      <BaseTreeView
        :nodes="fileTree"
        :selected-node-id="selectedNode?.id"
        @node-click="handleNodeClick"
      />
    </BaseStack>
    <FileSaveModal
      v-model:open="isSaveModalOpen"
      :file-tree="fileTree"
      :initial-filename="workflowStore.currentWorkflowData?.name ?? undefined"
      @save="handleSaveAsConfirm"
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
