<template>
  <BaseBox p="base">
    <BaseStack gap="lg">
      <BaseStack direction="row" align="center" gap="md">
        <BaseIcon icon="fas fa-arrow-left" class="cursor-pointer" @click="router.back()" />
        <BaseHeading size="4xl">{{ $t('views.settings.title') }}</BaseHeading>
      </BaseStack>

      <!-- 全局设置 -->
      <BaseCard Padding="base">
        <BaseStack gap="md">
          <BaseHeading size="xl" as="h2">{{ $t('views.settings.general') }}</BaseHeading>
          <BaseText color="gray-500">这些是系统范围的设置，仅管理员可修改。</BaseText>

          <SettingSelect
            :label="$t('views.settings.general')"
            :model-value="globalSettings.theme"
            @update:model-value="(val: any) => handleGlobalUpdate('theme', val)"
            :options="themeOptions"
            :disabled="!isAdmin"
          />
          <SettingSelect
            :label="$t('views.settings.language')"
            :model-value="globalSettings.language"
            @update:model-value="(val: any) => handleGlobalUpdate('language', val)"
            :options="languageOptions"
            :disabled="!isAdmin"
          />
          <SettingSwitch
            label="多用户模式"
            :model-value="globalSettings.multiUserMode ?? false"
            @update:model-value="(val: any) => handleGlobalUpdate('multiUserMode', val)"
            :disabled="!isAdmin"
          />
        </BaseStack>
      </BaseCard>

      <!-- 个人配置 -->
      <BaseCard :p="6">
        <BaseStack gap="md">
          <BaseHeading size="xl" as="h2">个人配置</BaseHeading>
          <BaseText color="gray-500">这些设置仅对您自己生效，并会覆盖全局设置。</BaseText>

          <SettingSelect
            :label="$t('views.settings.general')"
            :model-value="userSettings.theme"
            @update:model-value="(val: any) => handleUserUpdate('theme', val)"
            :options="themeOptions"
          />
          <SettingSelect
            :label="$t('views.settings.language')"
            :model-value="userSettings.language"
            @update:model-value="(val: any) => handleUserUpdate('language', val)"
            :options="languageOptions"
          />
        </BaseStack>
      </BaseCard>

    </BaseStack>
  </BaseBox>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useConfigStore } from '@/stores/config.store';
import { useAuthStore } from '@/stores/auth.store';
import type { GlobalConfig, UserConfig } from '@/types/config';
import {
  BaseBox,
  BaseStack,
  BaseHeading,
  BaseCard,
  BaseText,
  BaseIcon,
} from '@/components/atoms';
import SettingSelect from '@/components/molecules/SettingSelect.vue';
import SettingSwitch from '@/components/molecules/SettingSwitch.vue';


const configStore = useConfigStore();
const authStore = useAuthStore();
const router = useRouter();

// --- 权限 ---
const isAdmin = computed(() => authStore.isAdmin);

// --- 本地状态 ---
const globalSettings = ref<Partial<GlobalConfig>>({ ...configStore.globalConfig });
const userSettings = ref<Partial<UserConfig>>({ ...configStore.userConfig });

// --- 选项 ---
const themeOptions = [
  { label: '亮色', value: 'light' },
  { label: '暗色', value: 'dark' },
];
const languageOptions = [
  { label: '中文', value: 'zh-CN' },
  { label: 'English', value: 'en' },
];

// --- 监听 store 的变化，并更新本地状态 ---
watch(() => configStore.globalConfig, (newVal) => {
  globalSettings.value = { ...newVal };
}, { deep: true });

watch(() => configStore.userConfig, (newVal) => {
  userSettings.value = { ...newVal };
}, { deep: true });


// --- 事件处理 ---
function handleGlobalUpdate(key: keyof GlobalConfig, value: any) {
  if (!isAdmin.value) return;
  globalSettings.value = { ...globalSettings.value, [key]: value };
  configStore.updateGlobalSettings({ [key]: value });
}

function handleUserUpdate(key: keyof UserConfig, value: any) {
  userSettings.value = { ...userSettings.value, [key]: value };
  configStore.updateUserSettings({ [key]: value });
}
</script>
