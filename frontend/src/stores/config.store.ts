import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ConfigService } from '@/api'; // 自动生成的服务
import { BaseToast } from '@/services/toast';

export const useConfigStore = defineStore('config', () => {
  const config = ref<object | null>(null);
  const isLoading = ref(false);

  async function fetchConfig() {
    isLoading.value = true;
    try {
      const response = await ConfigService.getApiConfig();
      config.value = response;
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
