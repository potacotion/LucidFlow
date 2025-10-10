import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ConfigService } from '@/api'; // 自动生成的服务
import { BaseToast } from '@/services/toast';
import { useWorkflowStore } from './workflow.store'; // Import the workflow store

export const useConfigStore = defineStore('config', () => {
  const config = ref<any | null>(null); // Use 'any' for now for flexibility
  const isLoading = ref(false);

  async function fetchConfig() {
    const workflowStore = useWorkflowStore(); // Get instance inside the action
    isLoading.value = true;
    try {
      const response = await ConfigService.getApiConfig();
      config.value = response;

      // After fetching, update the workflow store with the node definitions
      if (response && response.nodeDefinitions) {
        workflowStore.setNodeDefinitions(response.nodeDefinitions);
      }

    } catch (error) {
      BaseToast.error('Failed to load configuration.');
      console.error(error);
    } finally {
      isLoading.value = false;
    }
  }

  async function updateUserSettings(newSettings: object) {
    try {
        await ConfigService.putApiConfigUser(newSettings);
        BaseToast.success('Settings updated successfully!');
        // Re-fetch config to get the merged result
        await fetchConfig();
    } catch (error) {
        BaseToast.error('Failed to update settings.');
        console.error(error);
    }
  }

  return { config, isLoading, fetchConfig, updateUserSettings };
});
