<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppLayout from '@/components/organisms/AppLayout.vue'
import TopToolbar from '@/components/organisms/TopToolbar.vue'
import LeftSidebar from '@/components/organisms/LeftSidebar.vue'
import WorkflowCanvas from '@/components/organisms/WorkflowCanvas.vue'
import ConfigPanel from '@/components/organisms/ConfigPanel.vue'
import NodePalette from '@/components/organisms/NodePalette.vue' // Import the new component
import BaseStack from '@/components/atoms/BaseStack.vue'
import { NodeDefinitionsService, NodeDefinition } from '@/api'
import { BaseToast } from '@/services/toast'

// This logic is moved from the original Home.vue
const nodeDefinitions = ref<NodeDefinition[]>([])
onMounted(async () => {
  try {
    const definitions = await NodeDefinitionsService.getApiNodeDefinitions()
    nodeDefinitions.value = definitions
  } catch (error) {
    BaseToast.error('Failed to fetch node definitions.')
    console.error('Failed to fetch node definitions:', error)
  }
})

// Panel State
const activePanel = ref<'nodes' | 'files' | null>(null);

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
      <!-- Add FileExplorer here when it's created -->
    </template>

    <!-- Main Content Slot -->
    <BaseStack direction="row" class="main-content-stack">
      <WorkflowCanvas :node-definitions="nodeDefinitions" />
      <ConfigPanel />
    </BaseStack>
  </AppLayout>
</template>

<style scoped>
.main-content-stack {
  height: 100%;
  width: 100%;
}
</style>
