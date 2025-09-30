
import { defineStore } from 'pinia';
import { WorkflowsService, type Workflow } from '@/api';
import { BaseToast } from '@/services/toast';
import { useWorkflowStore } from './workflow.store';

interface FileState {
  currentFile: Workflow | null;
  isDirty: boolean;
  fileTree: any[]; // Adjust the type based on your tree structure
  isSaveModalOpen: boolean;
}

export const useFileStore = defineStore('file', {
  state: (): FileState => ({
    currentFile: null,
    isDirty: false,
    fileTree: [],
    isSaveModalOpen: false,
  }),

  actions: {
    async fetchFileTree() {
      try {
        const folders = await WorkflowsService.getApiWorkflows();
        this.fileTree = folders as any; // Consider creating a proper type/model
      } catch (error) {
        BaseToast.error('Failed to fetch file tree.');
        console.error('Failed to fetch file tree:', error);
      }
    },

    async loadFile(fileId: string) {
      const workflowStore = useWorkflowStore();
      try {
        const workflow = await WorkflowsService.getApiWorkflows1(fileId);
        this.currentFile = workflow;
        workflowStore.loadWorkflow(workflow); // Keep workflowStore updated for the canvas
        this.isDirty = false;
        BaseToast.success(`Loaded: ${workflow.name}`);
      } catch (error) {
        BaseToast.error('Failed to load file.');
        console.error(`Failed to load file ${fileId}:`, error);
      }
    },

    setDirty(isDirty: boolean) {
      this.isDirty = isDirty;
    },

    async saveFile() {
      const workflowStore = useWorkflowStore();
      const workflowData = workflowStore.currentWorkflowData;

      if (!this.currentFile || !workflowData.id) {
        this.openSaveAsModal();
        return;
      }

      try {
        await WorkflowsService.putApiWorkflows(
          workflowData.id,
          workflowData as Workflow
        );
        this.isDirty = false;
        BaseToast.success('Workflow saved!');
        await this.fetchFileTree();
      } catch (error) {
        BaseToast.error('Failed to save workflow.');
        console.error('Failed to save workflow:', error);
      }
    },

    async saveFileAs(newPath: string) {
      const workflowStore = useWorkflowStore();
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

        // After saving, load the new workflow data
        this.currentFile = createdWorkflow;
        workflowStore.loadWorkflow(createdWorkflow);
        this.isDirty = false;

        BaseToast.success(`Workflow saved as ${newPath}`);
        await this.fetchFileTree();
      } catch (error) {
        BaseToast.error('Failed to save new workflow.');
        console.error('Failed to save workflow as new:', error);
      }
    },

    openSaveAsModal() {
      this.isSaveModalOpen = true;
    },

    closeSaveAsModal() {
      this.isSaveModalOpen = false;
    }
  },
});
