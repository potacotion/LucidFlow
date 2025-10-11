import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { useStorage } from '@vueuse/core';
import { useI18n } from 'vue-i18n';
import { debounce } from 'lodash-es';
import { ConfigService } from '@/api';
import { BaseToast } from '@/services/toast';
import { useWorkflowStore } from './workflow.store';
import type { GlobalConfig, UserConfig } from '@/types/config';

export const useConfigStore = defineStore('config', () => {
  const { locale } = useI18n();
  // --- State ---
  const config = useStorage<any>('lucid-flow-config', {});
  const isLoading = ref(false);

  // --- Getters ---
  const effectiveConfig = computed(() => config.value);

  const globalConfig = computed(() => {
    const { appName, multiUserMode, theme, language } = config.value || {};
    return { appName, multiUserMode, theme, language };
  });

  const userConfig = computed(() => {
    const { theme, language } = config.value || {};
    return { theme, language };
  })



  const _debouncedSaveUserConfig = debounce(async (settings: UserConfig) => {
    try {
      await ConfigService.putApiConfigUser(settings);
      BaseToast.success('个人配置已同步到云端');
    } catch (error) {
      BaseToast.error('同步个人配置失败');
      console.error(error);
    }
  }, 1000);

  const _debouncedSaveGlobalConfig = debounce(async (settings: Partial<GlobalConfig>) => {
    try {
      await ConfigService.putApiConfigGlobal(settings);
      BaseToast.success('全局配置已同步到云端');
    } catch (error) {
      BaseToast.error('同步全局配置失败');
      console.error(error);
    }
  }, 1000);


  // --- Actions ---

  async function fetchConfig(force = false) {
    if (config.value && Object.keys(config.value).length > 0 && !force) {
      return;
    }

    isLoading.value = true;
    try {
      config.value = await ConfigService.getApiConfig();
    } catch (error) {
      BaseToast.error('加载配置失败');
      console.error(error);
    } finally {
      isLoading.value = false;
    }
  }

  function updateUserSettings(newSettings: UserConfig) {
    if (!config.value) return;

    config.value = { ...config.value, ...newSettings };
    BaseToast.success('个人配置已更新');
    _debouncedSaveUserConfig(newSettings);
  }

  function updateGlobalSettings(newSettings: Partial<GlobalConfig>) {
    if (!config.value) return;

    config.value = { ...config.value, ...newSettings };
    BaseToast.success('全局配置已更新');
    _debouncedSaveGlobalConfig(newSettings);
  }

  // --- Watchers ---

  // Unified handler for all config changes
  watch(
    config,
    (newConfig, oldConfig) => {
      if (!newConfig) return;

      // 1. Update theme
      const newTheme = newConfig.theme || 'light';
      document.documentElement.className = `theme-${newTheme}`;

      // 2. Update language
      if (newConfig.language && newConfig.language !== oldConfig?.language) {
        locale.value = newConfig.language;
      }

      // 3. Update workflow node definitions
      if (newConfig.nodeDefinitions) {
        // Simple check to avoid unnecessary updates if the definitions object hasn't changed.
        // For deeper checks, a more robust comparison might be needed.
        if (JSON.stringify(newConfig.nodeDefinitions) !== JSON.stringify(oldConfig?.nodeDefinitions)) {
            const workflowStore = useWorkflowStore();
            workflowStore.setNodeDefinitions(newConfig.nodeDefinitions);
        }
      }
    },
    { deep: true, immediate: true }
  );

  return {
    isLoading,
    config,
    effectiveConfig,
    globalConfig,
    userConfig,
    fetchConfig,
    updateUserSettings,
    updateGlobalSettings,
  };
});
