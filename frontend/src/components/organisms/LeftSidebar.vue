<script setup lang="ts">
import BaseBox from '@/components/atoms/BaseBox.vue'
import BaseStack from '@/components/atoms/BaseStack.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseIcon from '@/components/atoms/BaseIcon.vue'
import BaseDivider from '@/components/atoms/BaseDivider.vue'
import { useTheme } from '@/composables/useTheme'

import { defineProps } from 'vue'
import type { SidebarTab } from '@/stores/ui.store'

const props = defineProps<{
  activeTab: SidebarTab | null
}>()

const emit = defineEmits(['tab-click'])

const { setTheme, theme } = useTheme()

const handleTabClick = (tab: 'nodes' | 'files') => {
  emit('tab-click', tab)
}

const toggleTheme = () => {
  setTheme(theme.value === 'dark' ? 'light' : 'dark')
}
</script>

<template>
  <BaseBox
    :padding="['sp-2']"
    shadow="--c-shadow-base"
    radius="none"
    class="left-sidebar"
  >
    <BaseStack
      direction="column"
      justify-content="space-between"
      class="full-height"
      gap="none"
    >
      <!-- Top Section: Tab-like buttons -->
      <BaseStack gap="none" direction="column" class="button-group">
        <div
          class="sidebar-button-wrapper"
          :class="{ 'is-active': props.activeTab === 'files' }"
        >
          <BaseButton
            square
            size="xl"
            variant="text"
            @click="handleTabClick('files')"
          >
            <BaseIcon icon="fa-solid fa-folder-tree" />
          </BaseButton>
        </div>
        <div
          class="sidebar-button-wrapper"
          :class="{ 'is-active': props.activeTab === 'nodes' }"
        >
          <BaseButton
            square
            size="xl"
            variant="text"
            @click="handleTabClick('nodes')"
          >
            <BaseIcon icon="fa-solid fa-cubes" />
          </BaseButton>
        </div>
      </BaseStack>

      <BaseBox px="xs">
        <BaseDivider />
      </BaseBox>

      <!-- Bottom Section: Action buttons -->
      <BaseStack direction="column" class="button-group">
        <div class="sidebar-button-wrapper">
          <BaseButton square size="xl" variant="text" @click="toggleTheme">
            <BaseIcon :icon="theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon'" />
          </BaseButton>
        </div>
      </BaseStack>
    </BaseStack>
  </BaseBox>
</template>

<style scoped>
.left-sidebar {
  grid-area: sidebar;
  /* width is now determined by the content (buttons) and padding */
  background-color: var(--c-fill-extra-light); /* Changed from --color-bg-base for better contrast */
  z-index: 5; /* Ensure shadow is visible over content */
}

.full-height {
  height: 100%;
}

.button-group {
  gap: var(--sp-2);
}

.sidebar-button-wrapper {
  position: relative;
  width: 100%;
}

.sidebar-button-wrapper.is-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 48px;
  background-color: var(--c-primary);
  border-radius: 2px;
}

/* Deep selector to style the button inside BaseButton */
:deep(.sidebar-button) {
  background-color: transparent;
  border-radius: 0;
  border: none;
  /* width: 100%; */ /* This line is removed to allow the button to respect its internal size */
  color: var(--c-text-primary);
}

:deep(.sidebar-button:hover) {
  background-color: var(--c-primary-light);
  color: var(--c-primary-light-1);
}
.is-active :deep(.sidebar-button:hover) {

  color:var(--c-primary-light-2);
}

.is-active :deep(.sidebar-button) {

  color: var(--c-primary);
}
/* Increase the size of the icons inside the sidebar buttons */
:deep(.base-icon) {
  font-size: 24px !important; /* Adjust size as needed */
}
</style>
