<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { WorkflowsService, type Workflow } from '@/api';
import { useWorkflowStore } from '@/stores/workflow.store';
import { BaseToast } from '@/services/toast';
import BaseTreeView from '@/components/molecules/BaseTreeView.vue';
import SaveButton from '@/components/molecules/SaveButton.vue';
import { convertFoldersToTreeNodes } from '@/utils/tree.utils';
import type { TreeNode } from '@/components/molecules/types';
import BaseStack from '@/components/atoms/BaseStack.vue';
import BaseText from '@/components/atoms/BaseText.vue';

const fileTree = ref<TreeNode[]>([]);
const workflowStore = useWorkflowStore();

const fetchWorkflows = async () => {
  try {
    const folders = await WorkflowsService.getApiWorkflows();
    // The API returns a Folder[] structure, convert it to TreeNode[] for the component
    fileTree.value = convertFoldersToTreeNodes(folders);
  } catch (error) {
    BaseToast.error('Failed to fetch workflows.');
    console.error('Failed to fetch workflows:', error);
  }
};

onMounted(fetchWorkflows);

const handleNodeClick = async (node: TreeNode) => {
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
  } catch (error) {
    BaseToast.error('Failed to save workflow.');
    console.error('Failed to save workflow:', error);
  }
};

const handleSaveAs = async () => {
  const workflowData = workflowStore.currentWorkflowData;

  // Even if there's no content, we should be able to save a blank file.
  if (!workflowData) return;

  const newName = prompt('Enter new workflow name (including path):', workflowData.name || 'new-workflow');

  if (newName) {
    try {
      const newWorkflowData: Omit<Workflow, 'id'> = {
        graph: {
          nodes: workflowData.nodes,
          edges: workflowData.edges,
        },
        name: newName,
      };

      const createdWorkflow = await WorkflowsService.postApiWorkflows(newWorkflowData as Workflow);
      workflowStore.loadWorkflow(createdWorkflow);
      BaseToast.success(`Workflow saved as ${newName}`);
      await fetchWorkflows();
    } catch (error) {
      BaseToast.error('Failed to save new workflow.');
      console.error('Failed to save workflow as new:', error);
    }
  }
};
</script>

<template>
  <div class="file-explorer">
    <BaseStack vertical spacing="sm" padding="base">
      <BaseStack justify-content="space-between" align="center">
        <BaseText as="h3" size="lg" :weight="600">Files</BaseText>
        <SaveButton @save="handleSave" @save-as="handleSaveAs" />
      </BaseStack>
      <BaseTreeView :nodes="fileTree" @node-click="handleNodeClick" />
    </BaseStack>
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
