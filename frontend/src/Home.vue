<script setup lang="ts">
import { ref } from 'vue'
import AppLayout from '@/components/organisms/AppLayout.vue'
import TopToolbar from '@/components/organisms/TopToolbar.vue'
import LeftSidebar from '@/components/organisms/LeftSidebar.vue'
import WorkflowCanvas from '@/components/organisms/WorkflowCanvas.vue'
import ConfigPanel from '@/components/organisms/ConfigPanel.vue'
import NodePalette from '@/components/organisms/NodePalette.vue'
import FileExplorer from '@/components/organisms/FileExplorer.vue'
import BaseStack from '@/components/atoms/BaseStack.vue'
import { useUIStore } from '@/stores/ui.store'

const uiStore = useUIStore();

const activePanel = ref<'nodes' | 'files' | null>(null); // null means no panel is active

function handleTabClick(tab: 'nodes' | 'files') {
  if (activePanel.value === tab) {
    activePanel.value = null; // Toggle off if the same tab is clicked
  } else {
    activePanel.value = tab;
  }
}
</script>

<template>
  <AppLayout>
    <template #topbar>
      <TopToolbar />
    </template>
    <template #sidebar>
      <LeftSidebar :active-tab="activePanel" @tab-click="handleTabClick" />
    </template>
    <template #panel>
      <NodePalette v-if="activePanel === 'nodes'" />
      <FileExplorer v-if="activePanel === 'files'" />
    </template>

    <!-- Main Content Slot -->
    <BaseStack direction="row" class="main-content-stack" gap="none">
      <WorkflowCanvas />
      <ConfigPanel v-if="uiStore.isConfigPanelVisible" />
    </BaseStack>
  </AppLayout>
</template>

<style scoped>
.main-content-stack {
  height: 100%;
  width: 100%;
}
</style>
