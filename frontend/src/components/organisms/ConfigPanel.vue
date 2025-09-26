<script setup lang="ts">
import { useUIStore } from '@/stores/ui.store'
import BaseBox from '@/components/atoms/BaseBox.vue'
import BaseText from '@/components/atoms/BaseText.vue'

const uiStore = useUIStore()
</script>

<template>
  <div v-if="uiStore.isConfigPanelVisible" class="config-panel-wrapper">
    <BaseBox :padding="['sp-4']" class="config-panel">
      <BaseText>
        Configuration Panel (Node: {{ uiStore.selectedNodeId }})
      </BaseText>
      <!-- Configuration form elements will go here -->
    </BaseBox>
  </div>
</template>

<style scoped>
.config-panel-wrapper {
  height: 100%;
}
.config-panel {
  width: 280px; /* Example fixed width */
  height: 100%;
  border-left: 1px solid var(--color-border-base);
  background-color: var(--color-bg-base);
}
</style>
