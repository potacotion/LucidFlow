
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BaseStack from '@/components/atoms/BaseStack.vue'
import BaseText from '@/components/atoms/BaseText.vue'
import BaseCard from '@/components/atoms/BaseCard.vue'
import { NodeDefinitionsService, type NodeDefinition } from '@/api'
import { useWorkflowStore } from '@/stores/workflow.store'
import { BaseToast } from '@/services/toast'

const nodeDefinitions = ref<NodeDefinition[]>([])
const workflowStore = useWorkflowStore()

onMounted(async () => {
  try {
    const definitions = await NodeDefinitionsService.getApiNodeDefinitions()
    nodeDefinitions.value = definitions

    // --- FIX: Populate the central store with the fetched definitions ---
    const definitionsMap = Object.fromEntries(definitions.map(def => [def.type, def]))
    workflowStore.nodeDefinitions = definitionsMap

  } catch (error) {
    BaseToast.error('Failed to fetch node definitions.')
    console.error('Failed to fetch node definitions:', error)
  }
})

const onDragStart = (event: DragEvent, definition: NodeDefinition) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/json', JSON.stringify(definition))
    event.dataTransfer.effectAllowed = 'copy'
  }
}
</script>

<template>
  <div class="node-palette">
    <BaseStack vertical spacing="sm" padding="base">
      <BaseText as="h3" size="lg" :weight="600">Nodes</BaseText>
      <BaseCard
        v-for="def in nodeDefinitions"
        :key="def.type"
        padding="sm"
        radius="base"
        shadow="light"
        :draggable="true"
        @dragstart="onDragStart($event, def)"
        class="palette-node"
      >
        <BaseText size="sm">{{ def.label }}</BaseText>
      </BaseCard>
    </BaseStack>
  </div>
</template>

<style scoped>
.node-palette {
  height: 100%;
  overflow-y: auto;
  background-color: var(--c-fill-light);
  box-shadow: var(--shadow-base);
  border-right: 1px solid var(--c-border-base);
  width: 280px;
}
.palette-node {
  cursor: grab;
  user-select: none;
  border: 1px solid var(--c-border-base);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.palette-node:hover {
  box-shadow: var(--shadow-base);
  transform: translateY(-2px);
}
</style>

